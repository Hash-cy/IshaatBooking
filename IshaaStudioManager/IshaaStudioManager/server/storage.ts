import { 
  users, type User, type InsertUser, 
  equipment, type Equipment, type InsertEquipment,
  bookings, type Booking, type InsertBooking, 
  type BookingStatus
} from "@shared/schema";

// Storage interface for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Equipment operations
  getAllEquipment(): Promise<Equipment[]>;
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBookingsByStatus(status: BookingStatus): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private equipmentItems: Map<number, Equipment>;
  private bookingItems: Map<number, Booking>;
  
  private userId: number;
  private equipmentId: number;
  private bookingId: number;
  
  constructor() {
    this.users = new Map();
    this.equipmentItems = new Map();
    this.bookingItems = new Map();
    
    this.userId = 1;
    this.equipmentId = 1;
    this.bookingId = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Should be hashed in production
      isAdmin: true
    });
    
    // Initialize with some equipment
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
    
    initialEquipment.forEach(item => this.createEquipment(item));
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Equipment operations
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipmentItems.values());
  }
  
  async getEquipment(id: number): Promise<Equipment | undefined> {
    return this.equipmentItems.get(id);
  }
  
  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentId++;
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipmentItems.set(id, equipment);
    return equipment;
  }
  
  async updateEquipment(id: number, updateData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const equipment = this.equipmentItems.get(id);
    if (!equipment) return undefined;
    
    const updatedEquipment = { ...equipment, ...updateData };
    this.equipmentItems.set(id, updatedEquipment);
    return updatedEquipment;
  }
  
  async deleteEquipment(id: number): Promise<boolean> {
    return this.equipmentItems.delete(id);
  }
  
  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookingItems.values()).sort((a, b) => {
      // Sort by creation date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return Array.from(this.bookingItems.values())
      .filter(booking => booking.status === status)
      .sort((a, b) => {
        // Sort by creation date descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingItems.get(id);
  }
  
  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    return Array.from(this.bookingItems.values()).find(
      (booking) => booking.reference === reference
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const reference = this.generateReference();
    const now = new Date();
    
    const booking: Booking = {
      ...insertBooking,
      id,
      reference,
      status: "pending",
      createdAt: now
    };
    
    this.bookingItems.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined> {
    const booking = this.bookingItems.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookingItems.set(id, updatedBooking);
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

// Import and use the DatabaseStorage implementation
import { DatabaseStorage, initializeDatabase } from "./database-storage";

// Initialize the database with seed data
initializeDatabase().catch(error => {
  console.error("Failed to initialize database:", error);
});

export const storage = new DatabaseStorage();
