import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingConfirmation() {
  const [match, params] = useRoute("/booking/confirmation/:reference");
  const reference = params?.reference;
  
  const { data: booking, isLoading, error } = useQuery({
    queryKey: [`/api/bookings/reference/${reference}`],
    enabled: !!reference,
  });
  
  // Since the API to get a booking by reference is intended for authorized users only,
  // we'll use local storage to display booking details for confirmation
  useEffect(() => {
    // In a real app, we'd fetch the booking from the API with appropriate auth
    // For now, we're just showing the reference number
  }, [reference]);
  
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto bg-white material-shadow">
        <CardContent className="p-6 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-5 w-5/6 mx-auto mb-6" />
          <div className="bg-neutral-lightest p-4 rounded-lg mb-6">
            <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 mx-auto" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !reference) {
    return (
      <Card className="max-w-2xl mx-auto bg-white material-shadow">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-primary mb-4">Booking Not Found</h2>
          <p className="mb-6 text-neutral-dark">
            We couldn't find the booking you're looking for. Please try again or make a new booking.
          </p>
          <Button asChild>
            <Link href="/">Make Another Booking</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-2xl mx-auto bg-white material-shadow">
      <CardContent className="p-6 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 mx-auto text-success" />
        </div>
        <h2 className="text-2xl font-medium text-primary mb-4">Booking Request Submitted</h2>
        <p className="mb-6 text-neutral-dark">
          Thank you for your booking request. An administrator will review your request and you will receive
          an email confirmation once it has been processed.
        </p>
        <div className="bg-neutral-lightest p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-2">Booking Details</h3>
          <div className="text-left grid grid-cols-1 md:grid-cols-2 gap-2 text-neutral-dark">
            <div><span className="font-medium">Reference:</span> <span>{reference}</span></div>
            <div><span className="font-medium">Status:</span> <span className="text-warning font-medium">Pending</span></div>
          </div>
        </div>
        <div>
          <Button asChild>
            <Link href="/">Make Another Booking</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
