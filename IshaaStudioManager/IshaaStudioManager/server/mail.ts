import { Booking } from "@shared/schema";

export interface IMailService {
  sendBookingConfirmation(booking: Booking): Promise<boolean>;
  sendBookingApproval(booking: Booking): Promise<boolean>;
  sendBookingRejection(booking: Booking): Promise<boolean>;
}

/**
 * In a real application, this would use a library like Nodemailer
 * to send actual emails. For development purposes, we'll just log
 * the emails to the console.
 */
export class DevMailService implements IMailService {
  async sendBookingConfirmation(booking: Booking): Promise<boolean> {
    console.log(`
      --- BOOKING CONFIRMATION EMAIL ---
      To: ${booking.email}
      Subject: Ishaat Studio Booking Request Received
      
      Dear ${booking.name},
      
      We have received your booking request for the Ishaat Studio.
      
      Booking Reference: ${booking.reference}
      Date: ${booking.date}
      Time: ${booking.time}
      Duration: ${booking.duration} hour(s)
      
      Your request is currently being reviewed. You will receive another email once we have processed your request.
      
      Thank you,
      Ishaat Studio Team
    `);
    
    return true;
  }
  
  async sendBookingApproval(booking: Booking): Promise<boolean> {
    console.log(`
      --- BOOKING APPROVAL EMAIL ---
      To: ${booking.email}
      Subject: Ishaat Studio Booking Approved
      
      Dear ${booking.name},
      
      Your booking request has been APPROVED.
      
      Booking Reference: ${booking.reference}
      Date: ${booking.date}
      Time: ${booking.time}
      Duration: ${booking.duration} hour(s)
      
      Please arrive 15 minutes before your scheduled time.
      
      Thank you,
      Ishaat Studio Team
    `);
    
    return true;
  }
  
  async sendBookingRejection(booking: Booking): Promise<boolean> {
    console.log(`
      --- BOOKING REJECTION EMAIL ---
      To: ${booking.email}
      Subject: Ishaat Studio Booking Not Available
      
      Dear ${booking.name},
      
      We regret to inform you that your booking request cannot be accommodated at this time.
      
      Booking Reference: ${booking.reference}
      Date: ${booking.date}
      Time: ${booking.time}
      
      Please try booking for a different date or time. If you have any questions, please contact the studio administrator.
      
      Thank you for your understanding,
      Ishaat Studio Team
    `);
    
    return true;
  }
}

export const mailService = new DevMailService();
