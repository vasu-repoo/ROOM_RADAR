import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const timetableUploads = sqliteTable("timetable_uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  fileName: text("file_name").notNull(),
  building: text("building").notNull(),
  section: text("section").notNull(),
  academicYear: text("academic_year").notNull(),
  entryCount: integer("entry_count").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_timetable_uploads_user_created").on(table.userId, table.createdAt),
]);

export const uploadedSlots = sqliteTable("uploaded_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uploadId: integer("upload_id").notNull().references(() => timetableUploads.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  day: text("day").notNull(),
  period: text("period").notNull(),
  room: text("room").notNull(),
  course: text("course").notNull(),
  section: text("section").notNull(),
  building: text("building").notNull(),
  floor: integer("floor").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_uploaded_slots_user_day_period").on(table.userId, table.day, table.period),
  index("idx_uploaded_slots_upload").on(table.uploadId),
]);
