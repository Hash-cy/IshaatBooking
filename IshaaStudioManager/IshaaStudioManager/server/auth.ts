import { storage } from "./storage";
import { User } from "@shared/schema";

export async function validateCredentials(username: string, password: string): Promise<User | null> {
  try {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // In a real application, we would use a secure password hashing library
    // like bcrypt to hash and compare passwords
    if (user.password !== password) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error validating credentials:", error);
    return null;
  }
}
