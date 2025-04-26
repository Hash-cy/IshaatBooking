import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertBookingSchema, departmentOptions } from "@shared/schema";
import { durationOptions, getTodayDateString } from "@/lib/utils";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { useToast } from "@/hooks/use-toast";
import { SendIcon } from "lucide-react";

// Extend the booking schema for the form
const bookingFormSchema = insertBookingSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  
  // Fetch equipment
  const { data: equipmentList = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/equipment'],
  });
  
  // Initialize the form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      idNumber: "",
      phone: "",
      department: undefined,
      date: "",
      time: "",
      duration: undefined,
      notes: "",
      equipmentList: [],
    },
  });
  
  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const response = await apiRequest('POST', '/api/bookings', {
        ...data,
        equipmentList: selectedEquipment,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been received.",
      });
      setLocation(`/booking/confirmation/${data.reference}`);
    },
    onError: () => {
      toast({
        title: "Error Submitting Booking",
        description: "There was a problem submitting your booking. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle equipment selection
  const toggleEquipment = (equipmentName: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentName)) {
        return prev.filter(item => item !== equipmentName);
      } else {
        return [...prev, equipmentName];
      }
    });
  };
  
  // Handle form submission
  function onSubmit(data: BookingFormValues) {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Equipment Required",
        description: "Please select at least one equipment item.",
        variant: "destructive",
      });
      return;
    }
    
    createBooking.mutate(data);
  }
  
  useEffect(() => {
    // Update the form's equipmentList when selectedEquipment changes
    form.setValue('equipmentList', selectedEquipment);
  }, [selectedEquipment, form]);
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg material-shadow p-6 mb-8">
      <h2 className="text-2xl font-medium text-primary mb-6">Studio Booking Request</h2>
      <p className="mb-6 text-neutral-dark">Please fill out this form to request studio time and equipment.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-dark border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Full Name</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input type="email" placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>ID Number</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input type="tel" placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="form-control col-span-1 md:col-span-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder=" " />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentOptions.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormLabel>Department</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Booking Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-dark border-b pb-2">Booking Details</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field: dateField }) => (
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field: timeField }) => (
                    <FormItem>
                      <FormControl>
                        <DateTimePicker
                          dateId="booking-date"
                          timeId="booking-time"
                          dateValue={dateField.value}
                          timeValue={timeField.value}
                          onDateChange={(value) => dateField.onChange(value)}
                          onTimeChange={(value) => timeField.onChange(value)}
                          required
                          minDate={getTodayDateString()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <Select 
                      onValueChange={value => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder=" " />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormLabel>Duration</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Equipment Selection Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-dark border-b pb-2">Equipment Selection</h3>
            
            <p className="text-sm text-neutral-medium mb-3">Select all equipment you need for your booking:</p>
            
            {equipmentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-7 bg-neutral-lightest animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {equipmentList.map((item: any) => (
                  <CustomCheckbox
                    key={item.id}
                    label={item.name}
                    checked={selectedEquipment.includes(item.name)}
                    onChange={() => toggleEquipment(item.name)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Additional Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-dark border-b pb-2">Additional Information</h3>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="form-control">
                  <FormControl>
                    <Textarea
                      placeholder=" "
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormLabel>Notes or Special Requirements</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto px-6 py-6 bg-primary text-white rounded font-medium hover:bg-primary-dark transition duration-200 flex items-center justify-center space-x-2"
              disabled={createBooking.isPending}
            >
              <SendIcon className="h-5 w-5" />
              <span>Submit Booking Request</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
