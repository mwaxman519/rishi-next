import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatZodError(error: any): { field: string; message: string }[] {
  if (!error?.issues) {
    return [{ field: 'unknown', message: 'Validation error occurred' }];
  }
  
  return error.issues.map((issue: any) => ({
    field: issue.path?.join('.') || 'unknown',
    message: issue.message || 'Invalid input'
  }));
}