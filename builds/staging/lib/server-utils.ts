import path from "path"
import fs from "fs"

export function getDocsDirectory(): string {
  // Return the docs directory path - fallback to public/Docs
  const docsPath = path.join(process.cwd(), 'public', 'Docs');
  
  // Check if directory exists, create minimal structure if not
  if (!fs.existsSync(docsPath)) {
    try {
      fs.mkdirSync(docsPath, { recursive: true });
      // Create a minimal README.md file
      fs.writeFileSync(path.join(docsPath, 'README.md'), '# Documentation\n\nWelcome to the documentation system.\n');
    } catch (error) {
      console.error('Failed to create docs directory:', error);
    }
  }
  
  return docsPath;
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