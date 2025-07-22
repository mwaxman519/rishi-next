/**
 * Documentation System
 * Provides functionality for loading and managing documentation files
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export const DOCS_DIRECTORY = 'Docs';

export interface DocumentMetadata {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  tags?: string[];
  order?: number;
}

export interface Document {
  slug: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  path: string;
  lastModified: Date;
}

export interface DocTree {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DocTree[];
  metadata?: DocumentMetadata;
}

/**
 * Get document tree structure
 */
export function getDocTree(dir: string = DOCS_DIRECTORY): DocTree[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const items = fs.readdirSync(dir);
  const tree: DocTree[] = [];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      tree.push({
        name: item,
        path: fullPath,
        type: 'directory',
        children: getDocTree(fullPath)
      });
    } else if (item.endsWith('.md')) {
      const slug = item.replace('.md', '');
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(content);
      
      tree.push({
        name: item,
        path: fullPath,
        type: 'file',
        metadata: {
          title: data.title || slug,
          description: data.description,
          date: data.date,
          category: data.category,
          tags: data.tags,
          order: data.order || 0
        }
      });
    }
  }

  return tree.sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    
    const orderA = a.metadata?.order || 0;
    const orderB = b.metadata?.order || 0;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get document by path
 */
export async function getDocumentByPath(docPath: string): Promise<Document | null> {
  try {
    const fullPath = path.join(DOCS_DIRECTORY, `${docPath}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, content: markdownContent } = matter(content);
    const stat = fs.statSync(fullPath);

    // Process markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml)
      .process(markdownContent);

    return {
      slug: docPath,
      title: data.title || docPath.split('/').pop() || 'Untitled',
      content: processedContent.toString(),
      metadata: {
        title: data.title || docPath.split('/').pop() || 'Untitled',
        description: data.description,
        date: data.date,
        category: data.category,
        tags: data.tags,
        order: data.order || 0
      },
      path: fullPath,
      lastModified: stat.mtime
    };
  } catch (error) {
    console.error(`Error loading document ${docPath}:`, error);
    return null;
  }
}

/**
 * Get all documents
 */
export function getAllDocs(): Document[] {
  const docs: Document[] = [];
  
  function processDirectory(dir: string, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath, prefix ? `${prefix}/${item}` : item);
      } else if (item.endsWith('.md')) {
        const slug = prefix ? `${prefix}/${item.replace('.md', '')}` : item.replace('.md', '');
        const content = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(content);
        
        docs.push({
          slug,
          title: data.title || slug,
          content: '',
          metadata: {
            title: data.title || slug,
            description: data.description,
            date: data.date,
            category: data.category,
            tags: data.tags,
            order: data.order || 0
          },
          path: fullPath,
          lastModified: stat.mtime
        });
      }
    }
  }
  
  processDirectory(DOCS_DIRECTORY);
  return docs;
}

/**
 * Get recent documents
 */
export function getRecentDocuments(limit = 10): Document[] {
  return getAllDocs()
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, limit);
}

/**
 * Search documents
 */
export function searchDocuments(query: string): Document[] {
  const allDocs = getAllDocs();
  const lowerQuery = query.toLowerCase();
  
  return allDocs.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.metadata.description?.toLowerCase().includes(lowerQuery) ||
    doc.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Default export for compatibility
export default {
  getDocTree,
  getDocumentByPath,
  getAllDocs,
  getRecentDocuments,
  searchDocuments,
  DOCS_DIRECTORY,
};