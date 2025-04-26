import { 
  users, type User, type InsertUser, 
  equipment, type Equipment, type InsertEquipment,
  bookings, type Booking, type InsertBooking, 
  type BookingStatus
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Equipment operations
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }
  
  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipmentItem;
  }
  
  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const [equipmentItem] = await db.insert(equipment).values(insertEquipment).returning();
    return equipmentItem;
  }
  
  async updateEquipment(id: number, updateData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set(updateData)
      .where(eq(equipment.id, id))
      .returning();
    return updatedEquipment;
  }
  
  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.id, id));
    return true; // Assuming delete was successful if no error was thrown
  }
  
  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }
  
  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status))
      .orderBy(desc(bookings.createdAt));
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.reference, reference));
    return booking;
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const reference = this.generateReference();
    
    const [booking] = await db
      .insert(bookings)
      .values({
        ...insertBooking,
        reference,
        status: "pending"
      })
      .returning();
    
    return booking;
  }
  
  async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    return updatedBooking;
  }
  
  // Helper methods
  private generateReference(): string {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `ISH-${datePart}-${randomPart}`;
  }
}

// Initialize the database with seed data if necessary
export async function initializeDatabase() {
  // Check if users table is empty (no admin user)
  const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true));
  
  if (adminUsers.length === 0) {
    console.log("Initializing database with seed data...");
    
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin123", // Should be hashed in production
      isAdmin: true
    });
    
    // Add initial equipment
    const initialEquipment = [
      { name: "DSLR Camera", quantity: 3, available: 3 },
      { name: "Wireless Microphone", quantity: 5, available: 5 },
      { name: "Studio Lighting Kit", quantity: 2, available: 2 },
      { name: "Camera Tripod", quantity: 4, available: 4 },
      { name: "Green Screen", quantity: 1, available: 1 },
      { name: "Audio Mixer", quantity: 2, available: 2 },
      { name: "Camera Gimbal", quantity: 1, available: 1 },
      { name: "Audio Recorder", quantity: 3, available: 3 }
    ];
    
    await db.insert(equipment).values(initialEquipment);
    
    console.log("Database initialized successfully");
  }
}