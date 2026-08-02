import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  resourceType: text("resource_type").notNull(),
  subject: text("subject").notNull(),
  yearLevel: text("year_level").notNull(),
  topic: text("topic").notNull(),
  learningObjectives: text("learning_objectives"),
  duration: text("duration"),
  difficulty: text("difficulty"),
  additionalInstructions: text("additional_instructions"),
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertResourceSchema = createInsertSchema(resourcesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resourcesTable.$inferSelect;
