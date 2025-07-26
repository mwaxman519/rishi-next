import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDocsDirectory(): string {
  return 'public/Docs';
}

export function extractFirstParagraph(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const lines = content.split('\n');
  let firstParagraph = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    firstParagraph = trimmedLine;
    break;
  }
  
  return firstParagraph
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1') 
    .replace(/`(.+?)`/g, '$1')
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