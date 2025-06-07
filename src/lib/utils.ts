import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};