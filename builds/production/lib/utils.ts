import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractFirstParagraph(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Remove markdown headers and extract first meaningful paragraph
  const lines = content.split('\n');
  let firstParagraph = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    // Take first meaningful line as paragraph
    firstParagraph = trimmedLine;
    break;
  }
  
  // Limit length and remove markdown syntax
  return firstParagraph
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .substring(0, 200)
    .trim();
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