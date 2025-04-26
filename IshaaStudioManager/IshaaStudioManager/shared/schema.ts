import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Equipment schema
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  available: integer("available").notNull().default(1),
});

export const insertEquipmentSchema = createInsertSchema(equipment).pick({
  name: true,
  quantity: true,
  available: true,
});

export const updateEquipmentSchema = createInsertSchema(equipment).pick({
  name: true,
  quantity: true,
  available: true,
});

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// Define departments
export const departmentOptions = [
  "Aitmad", 
  "Atfal", 
  "Tarbiyyat", 
  "Maal", 
  "Tabligh", 
  "Tajneed", 
  "Taleem", 
  "Waqar-e-Amal", 
  "Khidmat-e-Khalq", 
  "Sanat-o-Tijarat", 
  "Isha'at", 
  "Sehat-e-Jismani", 
  "Umur-e-Tulaba", 
  "Tahrik-e-Jadid", 
  "Tarbiyyat Nau Mubae'in", 
  "Umumi", 
  "MTA"
] as const;

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  idNumber: text("id_number").notNull(),
  phone: text("phone").notNull(),
  department: text("department").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  equipmentList: json("equipment_list").$type<string[]>().notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingStatusOptions = ["pending", "approved", "rejected"] as const;
export type BookingStatus = typeof bookingStatusOptions[number];

export const insertBookingSchema = createInsertSchema(bookings).pick({
  name: true,
  email: true,
  idNumber: true,
  phone: true,
  department: true,
  date: true,
  time: true,
  duration: true,
  equipmentList: true,
  notes: true,
}).extend({
  department: z.enum(departmentOptions),
  email: z.string().email(),
  phone: z.string().min(5),
  duration: z.coerce.number().min(1).max(5),
  equipmentList: z.array(z.string()),
});

export const updateBookingStatusSchema = z.object({
  id: z.number(),
  status: z.enum(bookingStatusOptions),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
