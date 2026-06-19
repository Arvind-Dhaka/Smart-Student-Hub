import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

export const activityTypeEnum = pgEnum('activity_type', [
  'SEMINAR',
  'CONFERENCE',
  'COURSE',
  'INTERNSHIP',
  'EXTRA_CURRICULAR',
  'COMPETITION',
  'LEADERSHIP',
  'COMMUNITY_SERVICE'
]);
export const statusEnum = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED']);

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  branch: text('branch').notNull(),
  graduationYear: integer('graduation_year').notNull(),
  phoneNumber: text('phone_number'),
  rollNumber: text('roll_number').unique(),
  cgpa: doublePrecision('cgpa'),
  sgpaRecords: text('sgpa_records'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gazetteRecords = pgTable('gazette_records', {
  rollNumber: text('roll_number').primaryKey(),
  name: text('name').notNull(),
  branch: text('branch').notNull(),
  graduationYear: integer('graduation_year').notNull(),
  cgpa: doublePrecision('cgpa'),
  sgpaRecords: text('sgpa_records'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const faculties = pgTable('faculties', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id')
    .references(() => students.id)
    .notNull(),
  title: text('title').notNull(),
  type: activityTypeEnum('type').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  proofUrl: text('proof_url'),
  status: statusEnum('status').default('PENDING').notNull(),
  rejectionReason: text('rejection_reason'),
  verifiedBy: integer('verified_by').references(() => faculties.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentsRelations = relations(students, ({ many }) => ({
  activities: many(activities, { relationName: 'studentActivities' }),
}));

export const facultiesRelations = relations(faculties, ({ many }) => ({
  verifiedActivities: many(activities, { relationName: 'facultyVerifications' }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  student: one(students, {
    fields: [activities.studentId],
    references: [students.id],
    relationName: 'studentActivities',
  }),
  verifier: one(faculties, {
    fields: [activities.verifiedBy],
    references: [faculties.id],
    relationName: 'facultyVerifications',
  }),
}));
