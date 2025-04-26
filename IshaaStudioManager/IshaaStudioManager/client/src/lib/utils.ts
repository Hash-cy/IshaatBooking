import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiRequest } from "./queryClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const durationOptions = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "4", label: "4 hours" },
  { value: "5", label: "5+ hours (specify in notes)" }
];

export async function logout() {
  try {
    await apiRequest('POST', '/api/auth/logout', {});
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

export function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
