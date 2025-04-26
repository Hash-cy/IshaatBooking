import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useAuthStatus() {
  return useQuery({
    queryKey: ['/api/auth/status'],
    retry: false,
  });
}

export function useAdminLogin() {
  const [location, setLocation] = useLocation();
  
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      setLocation('/admin/dashboard');
    },
  });
  
  return loginMutation;
}

export function useRequireAdmin() {
  const [location, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  const { data, isLoading, error } = useAuthStatus();
  
  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      if (error || !data?.isAuthenticated || !data?.isAdmin) {
        setLocation('/admin/login');
      }
    }
  }, [data, isLoading, error, setLocation]);
  
  return { isChecking };
}
