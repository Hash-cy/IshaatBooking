import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useRequireAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoIcon, Settings, Box, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import AdminBookings from "./AdminBookings";
import AdminEquipment from "./AdminEquipment";

export default function AdminDashboard() {
  const [location] = useLocation();
  const { isChecking } = useRequireAdmin();
  const [activeTab, setActiveTab] = useState("bookings");
  
  useEffect(() => {
    if (location === "/admin/equipment") {
      setActiveTab("equipment");
    } else {
      setActiveTab("bookings");
    }
  }, [location]);
  
  if (isChecking) {
    return (
      <Card className="max-w-6xl mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-medium">Administrator Dashboard</h2>
      </div>
      
      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="bg-transparent border-b">
            <TabsTrigger 
              value="bookings" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-3 font-medium"
              asChild
            >
              <Link href="/admin/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Booking Requests
              </Link>
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-3 font-medium"
              asChild
            >
              <Link href="/admin/equipment">
                <Box className="h-4 w-4 mr-2" />
                Manage Equipment
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="bookings" className="p-0">
          <AdminBookings />
        </TabsContent>
        
        <TabsContent value="equipment" className="p-0">
          <AdminEquipment />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
