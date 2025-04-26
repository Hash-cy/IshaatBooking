import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mailService } from "./mail";
import session from "express-session";
import { 
  insertBookingSchema, updateBookingStatusSchema, 
  insertEquipmentSchema, updateEquipmentSchema,
  bookingStatusOptions 
} from "@shared/schema";
import { validateCredentials } from "./auth";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a memory store for sessions
  const MemoryStoreSession = MemoryStore(session);
  
  // Setup session middleware
  app.use(
    session({
      name: "ishaat_studio_session",
      secret: process.env.SESSION_SECRET || "studio-booking-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Middleware to check if user is authenticated as admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.isAdmin) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  };

  // Authentication route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await validateCredentials(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is an admin
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      return res.status(200).json({ 
        message: "Login successful", 
        user: { id: user.id, username: user.username, isAdmin: user.isAdmin } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("ishaat_studio_session");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.isAdmin) {
      return res.status(200).json({ 
        isAuthenticated: true, 
        isAdmin: true 
      });
    }
    return res.status(200).json({ 
      isAuthenticated: false,
      isAdmin: false
    });
  });

  // Equipment routes
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.status(200).json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Error fetching equipment" });
    }
  });

  app.post("/api/equipment", isAdmin, async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const newEquipment = await storage.createEquipment(validatedData);
      res.status(201).json(newEquipment);
    } catch (error) {
      console.error("Error creating equipment:", error);
      res.status(400).json({ message: "Invalid equipment data" });
    }
  });

  app.put("/api/equipment/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid equipment ID" });
      }

      const validatedData = updateEquipmentSchema.parse(req.body);
      const updatedEquipment = await storage.updateEquipment(id, validatedData);
      
      if (!updatedEquipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      res.status(200).json(updatedEquipment);
    } catch (error) {
      console.error("Error updating equipment:", error);
      res.status(400).json({ message: "Invalid equipment data" });
    }
  });

  app.delete("/api/equipment/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid equipment ID" });
      }

      const success = await storage.deleteEquipment(id);
      if (!success) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      res.status(200).json({ message: "Equipment deleted successfully" });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      res.status(500).json({ message: "Error deleting equipment" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const newBooking = await storage.createBooking(validatedData);
      
      // Send confirmation email
      await mailService.sendBookingConfirmation(newBooking);
      
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      
      let bookings;
      if (status && bookingStatusOptions.includes(status as any)) {
        bookings = await storage.getBookingsByStatus(status as any);
      } else {
        bookings = await storage.getAllBookings();
      }
      
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  app.get("/api/bookings/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking" });
    }
  });

  app.put("/api/bookings/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const validatedData = updateBookingStatusSchema.parse({ ...req.body, id });
      const updatedBooking = await storage.updateBookingStatus(id, validatedData.status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Send appropriate email based on status
      if (validatedData.status === "approved") {
        await mailService.sendBookingApproval(updatedBooking);
      } else if (validatedData.status === "rejected") {
        await mailService.sendBookingRejection(updatedBooking);
      }
      
      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(400).json({ message: "Invalid booking status data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
