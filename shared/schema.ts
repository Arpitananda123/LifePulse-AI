import { pgTable, text, serial, integer, boolean, timestamp, json, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Make nullable for Google auth users
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  googleId: text("google_id").unique(),
  googleProfilePic: text("google_profile_pic"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenBalance: integer("token_balance").default(0),
  lifetimeTokens: integer("lifetime_tokens").default(0),
  streak: integer("streak").default(0),
  streakGoal: integer("streak_goal").default(7),
});

export const healthStats = pgTable("health_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  bloodPressure: text("blood_pressure"),
  bloodPressureStatus: text("blood_pressure_status"),
  heartRate: integer("heart_rate"),
  heartRateStatus: text("heart_rate_status"),
  steps: integer("steps").default(0),
  stepsGoal: integer("steps_goal").default(10000),
  hydrationGlasses: integer("hydration_glasses").default(0),
  hydrationGoal: integer("hydration_goal").default(8),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  time: timestamp("time").notNull(),
  type: text("type").notNull(), // medicine, water, activity, etc.
  icon: text("icon"), // for UI display
  completed: boolean("completed").default(false),
  recurring: boolean("recurring").default(false),
  recurringPattern: text("recurring_pattern"), // daily, weekly, etc.
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // user or ai
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  conversationId: text("conversation_id").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  doctorName: text("doctor_name").notNull(),
  location: text("location"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull(), // scheduled, completed, cancelled
});

export const homeRemedies = pgTable("home_remedies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ailment: text("ailment").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").notNull(),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
});

export const healthTracking = pgTable("health_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(), // bp, heart_rate, steps, etc.
  value: text("value").notNull(), 
  notes: text("notes"),
});

export const medicineScans = pgTable("medicine_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  medicineName: text("medicine_name").notNull(),
  dosage: text("dosage"),
  timing: text("timing"),
  sideEffects: text("side_effects").array(),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // badge, trophy, token
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertHealthStatsSchema = createInsertSchema(healthStats).omit({ id: true });

// Custom Schemas for handling Date/DateTime fields as strings
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true }).extend({
  time: z.string().or(z.date()), // Accept either string (ISO) or date
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()), // Accept either string (ISO) or date
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true }).extend({
  date: z.string().or(z.date()), // Accept either string (ISO) or date
});

export const insertHomeRemedySchema = createInsertSchema(homeRemedies).omit({ id: true });
export const insertHealthTrackingSchema = createInsertSchema(healthTracking).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()), // Accept either string (ISO) or date
});

export const insertMedicineScanSchema = createInsertSchema(medicineScans).omit({ id: true }).extend({
  scannedAt: z.string().or(z.date()), // Accept either string (ISO) or date
});

export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHealthStats = z.infer<typeof insertHealthStatsSchema>;
export type HealthStats = typeof healthStats.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertHomeRemedy = z.infer<typeof insertHomeRemedySchema>;
export type HomeRemedy = typeof homeRemedies.$inferSelect;

export type InsertHealthTracking = z.infer<typeof insertHealthTrackingSchema>;
export type HealthTracking = typeof healthTracking.$inferSelect;

export type InsertMedicineScan = z.infer<typeof insertMedicineScanSchema>;
export type MedicineScan = typeof medicineScans.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
