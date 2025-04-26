// Test script to create a booking
import { storage } from './server/storage.js';

async function testDatabase() {
  try {
    const booking = await storage.createBooking({
      name: "Test User",
      email: "test@example.com",
      idNumber: "ID123456",
      phone: "12345678",
      department: "Isha'at",
      date: "2023-04-30",
      time: "14:00",
      duration: 2,
      equipmentList: ["DSLR Camera", "Tripod"],
      notes: "This is a test booking"
    });
    
    console.log("Created booking:", booking);
    
    const allBookings = await storage.getAllBookings();
    console.log("All bookings:", allBookings);
  } catch (error) {
    console.error("Error testing database:", error);
  }
}

testDatabase();