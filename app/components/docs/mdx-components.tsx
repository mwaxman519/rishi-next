&quot;use client&quot;;

import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { MDXComponents } from &quot;mdx/types&quot;;
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb, 
  Code, 
  ExternalLink,
  Copy,
  Check
} from &quot;lucide-react&quot;;

// Professional Alert Component
function Alert({ type = &quot;info&quot;, children }: { type?: &quot;info&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;success&quot; | &quot;tip&quot;; children: React.ReactNode }) {
  const configs = {
    info: {
      icon: Info,
      gradient: &quot;from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20&quot;,
      border: &quot;border-blue-200/50 dark:border-blue-800/50&quot;,
      iconBg: &quot;from-blue-500 to-indigo-500&quot;,
      textColor: &quot;text-blue-900 dark:text-blue-100&quot;,
      subtextColor: &quot;text-blue-800 dark:text-blue-300&quot;
    },
    warning: {
      icon: AlertTriangle,
      gradient: &quot;from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20&quot;,
      border: &quot;border-amber-200/50 dark:border-amber-800/50&quot;,
      iconBg: &quot;from-amber-500 to-orange-500&quot;,
      textColor: &quot;text-amber-900 dark:text-amber-100&quot;,
      subtextColor: &quot;text-amber-800 dark:text-amber-300&quot;
    },
    error: {
      icon: AlertTriangle,
      gradient: &quot;from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20&quot;,
      border: &quot;border-red-200/50 dark:border-red-800/50&quot;,
      iconBg: &quot;from-red-500 to-rose-500&quot;,
      textColor: &quot;text-red-900 dark:text-red-100&quot;,
      subtextColor: &quot;text-red-800 dark:text-red-300&quot;
    },
    success: {
      icon: CheckCircle,
      gradient: &quot;from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20&quot;,
      border: &quot;border-green-200/50 dark:border-green-800/50&quot;,
      iconBg: &quot;from-green-500 to-emerald-500&quot;,
      textColor: &quot;text-green-900 dark:text-green-100&quot;,
      subtextColor: &quot;text-green-800 dark:text-green-300&quot;
    },
    tip: {
      icon: Lightbulb,
      gradient: &quot;from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20&quot;,
      border: &quot;border-purple-200/50 dark:border-purple-800/50&quot;,
      iconBg: &quot;from-purple-500 to-violet-500&quot;,
      textColor: &quot;text-purple-900 dark:text-purple-100&quot;,
      subtextColor: &quot;text-purple-800 dark:text-purple-300&quot;
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <div className={`p-6 rounded-2xl shadow-lg border ${config.gradient} ${config.border} my-8`}>
      <div className=&quot;flex items-start gap-4&quot;>
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${config.iconBg} shadow-lg`}>
          <IconComponent className=&quot;h-5 w-5 text-white&quot; />
        </div>
        <div className={`flex-1 ${config.textColor}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Professional Code Block with Copy Button
function CodeBlock({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className=&quot;relative group my-6&quot;>
      <pre 
        className={`p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-700 overflow-x-auto shadow-xl ${className}`}
        {...props}
      >
        <code className=&quot;text-slate-300 dark:text-slate-200 font-mono text-sm leading-relaxed&quot;>
          {children}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className=&quot;absolute top-4 right-4 p-2 rounded-lg bg-slate-800 dark:bg-slate-700 border border-slate-600 dark:border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-700 dark:hover:bg-slate-600&quot;
      >
        {copied ? (
          <Check className=&quot;h-4 w-4 text-green-400&quot; />
        ) : (
          <Copy className=&quot;h-4 w-4 text-slate-400&quot; />
        )}
      </button>
    </div>
  );
}

// Professional Link Component
function CustomLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href?.startsWith('http');
  const isInternal = href?.startsWith('/');
  
  if (isExternal) {
    return (
      <a
        href={href}
        target=&quot;_blank&quot;
        rel=&quot;noopener noreferrer&quot;
        className=&quot;inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors group&quot;
        {...props}
      >
        {children}
        <ExternalLink className=&quot;h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity&quot; />
      </a>
    );
  }
  
  if (isInternal) {
    return (
      <Link
        href={href}
        className=&quot;text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors&quot;
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <a
      href={href}
      className=&quot;text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors&quot;
      {...props}
    >
      {children}
    </a>
  );
}

// Professional Table Component
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className=&quot;overflow-x-auto my-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg&quot;>
      <table className=&quot;w-full&quot;>
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className=&quot;bg-slate-50 dark:bg-slate-800&quot;>
      {children}
    </thead>
  );
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className=&quot;border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors&quot;>
      {children}
    </tr>
  );
}

function TableCell({ children, isHeader = false }: { children: React.ReactNode; isHeader?: boolean }) {
  const Tag = isHeader ? 'th' : 'td';
  return (
    <Tag className={`px-6 py-4 text-left ${isHeader ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
      {children}
    </Tag>
  );
}

// Professional Blockquote Component
function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className=&quot;border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 py-6 px-8 rounded-r-2xl my-8 shadow-lg&quot;>
      <div className=&quot;text-slate-700 dark:text-slate-300 text-lg leading-relaxed italic&quot;>
        {children}
      </div>
    </blockquote>
  );
}

// Professional Heading Components
function Heading({ level, children, id, ...props }: { level: 1 | 2 | 3 | 4; children: React.ReactNode; id?: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes = {
    1: &quot;text-4xl lg:text-5xl font-bold mb-8 pb-6 border-b border-slate-200 dark:border-slate-700&quot;,
    2: &quot;text-3xl lg:text-4xl font-bold mb-6 mt-16&quot;,
    3: &quot;text-2xl lg:text-3xl font-bold mb-4 mt-12&quot;,
    4: &quot;text-xl lg:text-2xl font-bold mb-3 mt-10&quot;
  };

  return (
    <Tag 
      id={id}
      className={`${sizes[level]} bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent scroll-mt-20`}
      {...props}
    >
      {children}
    </Tag>
  );
}

// Export Professional MDX Components
export const mdxComponents: MDXComponents = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  p: (props) => <p className=&quot;text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6&quot; {...props} />,
  a: CustomLink,
  pre: CodeBlock,
  blockquote: Blockquote,
  table: Table,
  thead: TableHead,
  tr: TableRow,
  th: (props) => <TableCell isHeader {...props} />,
  td: TableCell,
  Alert,
  ul: (props) => <ul className=&quot;space-y-2 mb-6 pl-6&quot; {...props} />,
  ol: (props) => <ol className=&quot;space-y-2 mb-6 pl-6&quot; {...props} />,
  li: (props) => <li className=&quot;text-slate-700 dark:text-slate-300 leading-relaxed&quot; {...props} />,
  strong: (props) => <strong className=&quot;font-semibold text-slate-900 dark:text-white&quot; {...props} />,
  em: (props) => <em className=&quot;italic text-slate-800 dark:text-slate-200&quot; {...props} />,
  code: (props) => (
    <code 
      className=&quot;bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-medium&quot; 
      {...props} 
    />
  ),
  hr: (props) => <hr className=&quot;border-slate-200 dark:border-slate-700 my-12&quot; {...props} />,
};