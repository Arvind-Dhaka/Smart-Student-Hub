import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { students, faculties, activities, gazetteRecords } from "./src/db/schema.ts";
import { eq, desc, ilike, or, inArray } from "drizzle-orm";

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

  // Lookup roll number from gazette records
  app.get("/api/auth/lookup-roll", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const rollNumber = req.query.rollNumber as string;
      if (!rollNumber) return res.status(400).json({ error: "Roll number required" });
      
      const cleanRoll = rollNumber.trim().toUpperCase();
      const records = await db.select().from(gazetteRecords).where(eq(gazetteRecords.rollNumber, cleanRoll)).limit(1);
      
      if (records.length === 0) {
        return res.status(404).json({ error: "Roll number not found in gazette records" });
      }
      
      res.json({ record: records[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to query gazette records" });
    }
  });

  // Register
  app.post("/api/auth/register", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { role, name, branch, graduationYear, phoneNumber, department, rollNumber } = req.body;
      const email = req.user.email || "";

      if (role === "STUDENT") {
         let cgpa = null;
         let sgpaRecords = null;
         
         if (rollNumber) {
           const cleanRoll = rollNumber.trim().toUpperCase();
           const match = await db.select().from(gazetteRecords).where(eq(gazetteRecords.rollNumber, cleanRoll)).limit(1);
           if (match.length > 0) {
             cgpa = match[0].cgpa;
             sgpaRecords = match[0].sgpaRecords;
           }
         }

         const result = await db.insert(students).values({
           uid: req.user.uid,
           email, 
           name: name?.trim(), 
           branch: branch?.trim(), 
           graduationYear: parseInt(graduationYear, 10), 
           phoneNumber: phoneNumber?.trim(),
           rollNumber: rollNumber?.trim().toUpperCase() || null,
           cgpa,
           sgpaRecords
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

  // Helper to map department names to all valid B.Tech sub-branches
  function getBranchesForDepartment(dept: string): string[] {
    const norm = dept.toUpperCase().trim();
    
    // Computer Science & Engineering
    if (
      norm.includes("COMPUTER") || 
      norm.includes("CSE") || 
      norm.includes("CS")
    ) {
      return [
        "COMPUTER SCIENCE AND ENGINEERING - COMPUTER SCIENCE AND ENGINEERING",
        "COMPUTER SCIENCE AND ENGINEERING",
        "Computer Science and Engineering",
        "COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)",
        "COMPUTER SCIENCE AND ENGINEERING - COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)",
        "Computer Science and Engineering (Artificial Intelligence)",
        "Computer Science and Engineering (Data Science)",
        "Computer Science and Engineering (Mathematics and Computing)",
        "COMPUTER SCIENCE AND ENGINEERING (EAST) - COMPUTER SCIENCE AND ENGINEERING (INTERNET OF THINGS)",
        "COMPUTER SCIENCE AND ENGINEERING (EAST) - COMPUTER SCIENCE AND ENGINEERING (BIG DATA ANALYTICS)"
      ];
    }
    
    // Information Technology
    if (
      norm.includes("INFORMATION TECHNOLOGY") || 
      norm.includes("IT")
    ) {
      return [
        "Information Technology Engineering",
        "INFORMATION TECHNOLOGY - INFORMATION TECHNOLOGY (NETWORK AND INFORMATION SECURITY)"
      ];
    }

    // Electronics & Communication
    if (
      norm.includes("ELECTRONICS") || 
      norm.includes("COMMUNICATION") || 
      norm.includes("ECE")
    ) {
      return [
        "ELECTRONICS AND COMMUNICATION ENGINEERING",
        "Electronics and Communication Engineering"
      ];
    }

    // Electrical
    if (
      norm.includes("ELECTRICAL") || 
      norm.includes("EE")
    ) {
      return [
        "ELECTRICAL ENGINEERING",
        "ELECTRICAL ENGINEERING - ELECTRICAL ENGINEERING"
      ];
    }

    // Mechanical
    if (
      norm.includes("MECHANICAL") || 
      norm.includes("ME")
    ) {
      return [
        "MECHANICAL ENGINEERING",
        "Mechanical Engineering",
        "MECHANICAL ENGINEERING - MECHANICAL ENGINEERING",
        "Mechanical Engineering - Mechanical Engineering",
        "MECHANICAL ENGINEERING (ELECTRIC VEHICLES)",
        "MECHANANICAL ENGINEERING (ELECTRIC VEHICLES)"
      ];
    }

    // Civil
    if (
      norm.includes("CIVIL") || 
      norm.includes("GEOINFORMATICS") || 
      norm.includes("CE")
    ) {
      return [
        "CIVIL ENGINEERING - CIVIL ENGINEERING",
        "CIVIL ENGINEERING - GEOINFORMATICS",
        "GEOINFORMATICS Engineering"
      ];
    }

    // Instrumentation
    if (
      norm.includes("INSTRUMENTATION") || 
      norm.includes("CONTROL") || 
      norm.includes("ICE")
    ) {
      return [
        "INSTRUMENTATION AND CONTROL ENGINEERING - INSTRUMENTATION AND CONTROL ENGINEERING",
        "INSTRUMENTATION AND CONTROL ENGINEERING"
      ];
    }

    // Biotechnology/Biological
    if (
      norm.includes("BIOLOGICAL") || 
      norm.includes("BIO") || 
      norm.includes("BSE")
    ) {
      return [
        "BIOLOGICAL SCIENCES AND ENGINEERING - BIO TECHNOLOGY"
      ];
    }

    return [dept];
  }

  // Faculty specific: Get activities for department
  app.get("/api/faculty/activities", requireAuth, async (req: AuthRequest, res) => {
     try {
       if (!req.user) return res.status(401).json({ error: "Unauthorized" });
       const facultyRes = await db.select().from(faculties).where(eq(faculties.uid, req.user.uid)).limit(1);
       if (facultyRes.length === 0) return res.status(404).json({ error: "Faculty not found" });

       const faculty = facultyRes[0];
       const branches = getBranchesForDepartment(faculty.department);

       // Join activities with students to filter by branch mapping or partial name
       const result = await db.select({
         activity: activities,
         student: students
       }).from(activities)
       .innerJoin(students, eq(activities.studentId, students.id))
       .where(
         or(
           inArray(students.branch, branches),
           ilike(students.branch, `%${faculty.department.trim()}%`)
         )
       )
       .orderBy(desc(activities.createdAt));

       res.json({ data: result });
     } catch(e) {
        console.error("Error in faculty activities query:", e);
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
