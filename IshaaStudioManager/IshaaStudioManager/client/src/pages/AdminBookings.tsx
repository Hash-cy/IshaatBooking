import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRequireAdmin } from "@/hooks/useAdmin";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { bookingStatusOptions, type BookingStatus } from "@shared/schema";

import {
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  UserIcon,
  Hash,
  Mail,
  Phone,
  Briefcase,
  Users,
  Box
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBookings() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fetch bookings
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/bookings", statusFilter],
    queryFn: async ({ queryKey }) => {
      const [_, status] = queryKey;
      let url = "/api/bookings";
      if (status !== "all") {
        url += `?status=${status}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
  });
  
  // Update booking status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: BookingStatus }) => {
      const response = await apiRequest("PUT", `/api/bookings/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "The booking status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });
  
  // Filter bookings
  const filteredBookings = bookings.filter((booking: any) => {
    // Apply search filter
    const searchMatch =
      search === "" ||
      booking.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.reference.toLowerCase().includes(search.toLowerCase()) ||
      booking.department.toLowerCase().includes(search.toLowerCase());
    
    // Apply date filter
    const dateMatch =
      dateFilter === "" || booking.date === dateFilter;
    
    return searchMatch && dateMatch;
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // View booking details
  const viewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };
  
  // Handle status update
  const handleStatusUpdate = (status: BookingStatus) => {
    if (selectedBooking) {
      updateStatus.mutate({ id: selectedBooking.id, status });
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/20 text-warning">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/20 text-success">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/20 text-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load bookings</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/bookings"] })}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {/* Booking Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {bookingStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-32"
          />
        </div>
      </div>
      
      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-neutral-lightest border-b">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Reference</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Name</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Department</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Date & Time</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Equipment</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Status</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-neutral-lightest">
                  <td className="py-3 px-4">{booking.reference}</td>
                  <td className="py-3 px-4">{booking.name}</td>
                  <td className="py-3 px-4">{booking.department}</td>
                  <td className="py-3 px-4">
                    {booking.date && formatDate(booking.date)} / {booking.time && formatTime(booking.time)}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    {booking.equipmentList.slice(0, 2).join(", ")}
                    {booking.equipmentList.length > 2 && "..."}
                  </td>
                  <td className="py-3 px-4">
                    {renderStatusBadge(booking.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-success/10 text-success"
                            title="Approve"
                            onClick={() => {
                              setSelectedBooking(booking);
                              handleStatusUpdate("approved");
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                            title="Reject"
                            onClick={() => {
                              setSelectedBooking(booking);
                              handleStatusUpdate("rejected");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-info/10 text-info"
                        title="View Details"
                        onClick={() => viewBookingDetails(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-neutral-medium">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-neutral-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{" "}
            {filteredBookings.length} results
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Booking Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Review the booking information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="space-y-1 text-neutral-dark">
                    <p><span className="font-medium">Name:</span> {selectedBooking.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.phone}</p>
                    <p><span className="font-medium">ID Number:</span> {selectedBooking.idNumber}</p>
                    <p><span className="font-medium">Department:</span> {selectedBooking.department}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Booking Information
                  </h4>
                  <div className="space-y-1 text-neutral-dark">
                    <p><span className="font-medium">Reference:</span> {selectedBooking.reference}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.date)}</p>
                    <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.time)}</p>
                    <p><span className="font-medium">Duration:</span> {selectedBooking.duration} hour(s)</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-primary mb-2 flex items-center gap-1">
                  <Box className="h-4 w-4" />
                  Equipment Requested
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.equipmentList.map((item: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-neutral-lightest">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedBooking.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Additional Notes
                  </h4>
                  <p className="text-neutral-dark">{selectedBooking.notes}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="font-medium text-primary mb-2">Status</h4>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(selectedBooking.status)}
                  <span className="text-sm text-neutral-medium">
                    Updated: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedBooking && selectedBooking.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Booking
                </Button>
                <Button
                  className="bg-success hover:bg-success/90 text-white"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Booking
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
