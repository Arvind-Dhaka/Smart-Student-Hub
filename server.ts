import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { students, faculties, activities } from "./src/db/schema.ts";
import { eq, desc, ilike } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Profile auth
  app.get("/api/auth/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const studentMatches = await db.select().from(students).where(eq(students.uid, req.user.uid)).limit(1);
      if (studentMatches.length > 0) {
        return res.json({ profile: studentMatches[0], role: "STUDENT" });
      }
      const facultyMatches = await db.select().from(faculties).where(eq(faculties.uid, req.user.uid)).limit(1);
      if (facultyMatches.length > 0) {
         return res.json({ profile: facultyMatches[0], role: "FACULTY" });
      }
      res.status(404).json({ error: "Profile not found" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Register
  app.post("/api/auth/register", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { role, name, branch, graduationYear, phoneNumber, department } = req.body;
      const email = req.user.email || "";

      if (role === "STUDENT") {
         const result = await db.insert(students).values({
           uid: req.user.uid,
           email, name: name?.trim(), branch: branch?.trim(), graduationYear: parseInt(graduationYear, 10), phoneNumber: phoneNumber?.trim()
         }).returning();
         return res.json({ profile: result[0], role: "STUDENT" });
      } else if (role === "FACULTY") {
         const result = await db.insert(faculties).values({
           uid: req.user.uid,
           email, name: name?.trim(), department: department?.trim()
         }).returning();
         return res.json({ profile: result[0], role: "FACULTY" });
      }
      res.status(400).json({ error: "Invalid role" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Student specific profile data
  app.get("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    res.json({ status: "moved to auth/profile" });
  });

  // Get activities
  app.get("/api/activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userRes = await db.select().from(students).where(eq(students.uid, req.user.uid)).limit(1);
      if (userRes.length === 0) return res.status(404).json({ error: "User not found" });

      const userActivities = await db.select().from(activities).where(eq(activities.studentId, userRes[0].id)).orderBy(desc(activities.createdAt));
      res.json({ activities: userActivities });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Add new activity
  app.post("/api/activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userRes = await db.select().from(students).where(eq(students.uid, req.user.uid)).limit(1);
      if (userRes.length === 0) return res.status(404).json({ error: "User not found" });

      const { title, type, description, date, proofUrl } = req.body;
      const newActivity = await db.insert(activities).values({
        studentId: userRes[0].id,
        title, type, description, date: new Date(date), proofUrl, status: "PENDING"
      }).returning();
      
      res.json({ activity: newActivity[0] });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to add activity" });
    }
  });

  // Update activity (Re-apply)
  app.put("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userRes = await db.select().from(students).where(eq(students.uid, req.user.uid)).limit(1);
      if (userRes.length === 0) return res.status(404).json({ error: "User not found" });

      const activityId = parseInt(req.params.id, 10);
      const { title, type, description, date, proofUrl } = req.body;
      
      const updatedActivity = await db.update(activities).set({
        title, type, description, date: new Date(date), proofUrl, status: "PENDING", rejectionReason: null
      }).where(eq(activities.id, activityId)).returning();
      
      res.json({ activity: updatedActivity[0] });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  // Faculty specific: Get activities for department
  app.get("/api/faculty/activities", requireAuth, async (req: AuthRequest, res) => {
     try {
       if (!req.user) return res.status(401).json({ error: "Unauthorized" });
       const facultyRes = await db.select().from(faculties).where(eq(faculties.uid, req.user.uid)).limit(1);
       if (facultyRes.length === 0) return res.status(404).json({ error: "Faculty not found" });

       const faculty = facultyRes[0];
       // Join activities with students to filter by branch
       const result = await db.select({
         activity: activities,
         student: students
       }).from(activities)
       .innerJoin(students, eq(activities.studentId, students.id))
       .where(ilike(students.branch, faculty.department.trim()))
       .orderBy(desc(activities.createdAt));

       res.json({ data: result });
     } catch(e) {
        res.status(500).json({ error: "Failed to fetch faculty activities" });
     }
  });

  // Verify/Reject activity
  app.post("/api/faculty/activities/:id/review", requireAuth, async (req: AuthRequest, res) => {
    try {
       if (!req.user) return res.status(401).json({ error: "Unauthorized" });
       const facultyRes = await db.select().from(faculties).where(eq(faculties.uid, req.user.uid)).limit(1);
       if (facultyRes.length === 0) return res.status(404).json({ error: "Faculty not found" });

       const { status, rejectionReason } = req.body; // 'APPROVED' or 'REJECTED'
       if (status !== 'APPROVED' && status !== 'REJECTED') return res.status(400).json({ error: "Invalid status" });

       const activityId = parseInt(req.params.id, 10);
       const updated = await db.update(activities).set({
         status,
         rejectionReason: status === 'REJECTED' ? rejectionReason : null,
         verifiedBy: facultyRes[0].id,
         verifiedAt: new Date()
       }).where(eq(activities.id, activityId)).returning();

       res.json({ activity: updated[0] });
    } catch(e) {
        res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Generate Portfolio
  app.post("/api/activities/generate-portfolio", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userRes = await db.select().from(students).where(eq(students.uid, req.user.uid)).limit(1);
      if (userRes.length === 0) return res.status(404).json({ error: "User not found" });

      const student = userRes[0];
      const userActivities = await db.select().from(activities)
        .where(eq(activities.studentId, student.id));
      
      const approvedActivities = userActivities.filter(a => a.status === 'APPROVED');
      
      if (approvedActivities.length === 0) {
        return res.status(400).json({ error: "No approved activities found to generate a portfolio." });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Generate a professional portfolio/resume section strictly in Markdown format for the following student. 
      Name: ${student.name}
      Branch: ${student.branch}
      Graduation Year: ${student.graduationYear}
      
      Here are the student's approved co-curricular and extracurricular activities:
      ${approvedActivities.map(a => `- [${a.type}] ${a.title} (${a.date.toDateString()}): ${a.description}`).join('\n')}
      
      Based on these activities, highlight their core skills (e.g. if they did a React course, list React as a skill; if they did an internship, highlight the professional skills and describe the internship; if they had a leadership role, emphasize their leadership). 
      
      Format the output with the following headers:
      # Profile
      # Skills
      # Experience & Activities
      
      IMPORTANT: Do not wrap the response in any markdown code blocks or fences (i.e. do not use \`\`\`markdown or \`\`\`). Output the raw markdown text directly, starting with the first header.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let markdownText = (response.text || "").trim();
      if (markdownText.startsWith("```")) {
        const lines = markdownText.split("\n");
        if (lines[0].trim().startsWith("```")) {
          lines.shift();
        }
        if (lines[lines.length - 1].trim().startsWith("```")) {
          lines.pop();
        }
        markdownText = lines.join("\n");
      }

      res.json({ markdown: markdownText });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate portfolio" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
