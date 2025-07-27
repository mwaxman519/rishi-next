"use client";

import React from "react";
import Link from "next/link";
import { MDXComponents } from "mdx/types";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb, 
  Code, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

// Professional Alert Component
function Alert({ type = "info", children }: { type?: "info" | "warning" | "error" | "success" | "tip"; children: React.ReactNode }) {
  const configs = {
    info: {
      icon: Info,
      gradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-200/50 dark:border-blue-800/50",
      iconBg: "from-blue-500 to-indigo-500",
      textColor: "text-blue-900 dark:text-blue-100",
      subtextColor: "text-blue-800 dark:text-blue-300"
    },
    warning: {
      icon: AlertTriangle,
      gradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      border: "border-amber-200/50 dark:border-amber-800/50",
      iconBg: "from-amber-500 to-orange-500",
      textColor: "text-amber-900 dark:text-amber-100",
      subtextColor: "text-amber-800 dark:text-amber-300"
    },
    error: {
      icon: AlertTriangle,
      gradient: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      border: "border-red-200/50 dark:border-red-800/50",
      iconBg: "from-red-500 to-rose-500",
      textColor: "text-red-900 dark:text-red-100",
      subtextColor: "text-red-800 dark:text-red-300"
    },
    success: {
      icon: CheckCircle,
      gradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200/50 dark:border-green-800/50",
      iconBg: "from-green-500 to-emerald-500",
      textColor: "text-green-900 dark:text-green-100",
      subtextColor: "text-green-800 dark:text-green-300"
    },
    tip: {
      icon: Lightbulb,
      gradient: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
      border: "border-purple-200/50 dark:border-purple-800/50",
      iconBg: "from-purple-500 to-violet-500",
      textColor: "text-purple-900 dark:text-purple-100",
      subtextColor: "text-purple-800 dark:text-purple-300"
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <div className={`p-6 rounded-2xl shadow-lg border ${config.gradient} ${config.border} my-8`}>
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${config.iconBg} shadow-lg`}>
          <IconComponent className="h-5 w-5 text-white" />
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
    <div className="relative group my-6">
      <pre 
        className={`p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-700 overflow-x-auto shadow-xl ${className}`}
        {...props}
      >
        <code className="text-slate-300 dark:text-slate-200 font-mono text-sm leading-relaxed">
          {children}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 dark:bg-slate-700 border border-slate-600 dark:border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-700 dark:hover:bg-slate-600"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-slate-400" />
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
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
        {...props}
      >
        {children}
        <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }
  
  if (isInternal) {
    return (
      <Link
        href={href}
        className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      {...props}
    >
      {children}
    </a>
  );
}

// Professional Table Component
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto my-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800">
      {children}
    </thead>
  );
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 py-6 px-8 rounded-r-2xl my-8 shadow-lg">
      <div className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed italic">
        {children}
      </div>
    </blockquote>
  );
}

// Professional Heading Components
function Heading({ level, children, id, ...props }: { level: 1 | 2 | 3 | 4; children: React.ReactNode; id?: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes = {
    1: "text-4xl lg:text-5xl font-bold mb-8 pb-6 border-b border-slate-200 dark:border-slate-700",
    2: "text-3xl lg:text-4xl font-bold mb-6 mt-16",
    3: "text-2xl lg:text-3xl font-bold mb-4 mt-12",
    4: "text-xl lg:text-2xl font-bold mb-3 mt-10"
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
  p: (props) => <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6" {...props} />,
  a: CustomLink,
  pre: CodeBlock,
  blockquote: Blockquote,
  table: Table,
  thead: TableHead,
  tr: TableRow,
  th: (props) => <TableCell isHeader {...props} />,
  td: TableCell,
  Alert,
  ul: (props) => <ul className="space-y-2 mb-6 pl-6" {...props} />,
  ol: (props) => <ol className="space-y-2 mb-6 pl-6" {...props} />,
  li: (props) => <li className="text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic text-slate-800 dark:text-slate-200" {...props} />,
  code: (props) => (
    <code 
      className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-medium" 
      {...props} 
    />
  ),
  hr: (props) => <hr className="border-slate-200 dark:border-slate-700 my-12" {...props} />,
};