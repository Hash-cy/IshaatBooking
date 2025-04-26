import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { Settings, LogIn } from "lucide-react";
import { useAdminLogin, useAuthStatus } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function AdminLogin() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: authData, isLoading: authLoading } = useAuthStatus();
  const loginMutation = useAdminLogin();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && authData?.isAuthenticated && authData?.isAdmin) {
      setLocation('/admin/dashboard');
    }
  }, [authData, authLoading, setLocation]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  async function onSubmit(data: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  }
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-medium text-primary mb-6 text-center">Administrator Login</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Username</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="form-control">
                    <FormControl>
                      <Input type="password" placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Password</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full px-6 py-3 bg-primary text-white rounded font-medium hover:bg-primary-dark transition duration-200 flex items-center justify-center space-x-2"
                  disabled={loginMutation.isPending}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Log In</span>
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <Button variant="link" asChild>
              <Link href="/">Return to Booking Form</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
