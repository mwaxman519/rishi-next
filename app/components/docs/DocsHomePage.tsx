"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  FileText,
  Folders,
  Package,
  Search,
  Star,
  LayoutDashboard,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { formatRelativeTime } from "../../lib/client-utils";
import { DocInfo, DocTree } from "../../lib/docs";

// Categories reflecting the actual folder structure in Docs directory
const featuredCategories = [
  {
    title: "Getting Started",
    description: "Essential guides to get up and running quickly",
    path: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "API Reference",
    description: "Detailed API documentation and examples",
    path: "/docs/api",
    icon: FileText,
  },
  {
    title: "Architecture",
    description: "System architecture and design patterns",
    path: "/docs/architecture",
    icon: Folders,
  },
  {
    title: "Business",
    description: "Business strategy and roadmap",
    path: "/docs/business",
    icon: LayoutDashboard,
  },
  {
    title: "CSS",
    description: "Styling and CSS guidelines",
    path: "/docs/css",
    icon: Sparkles,
  },
  {
    title: "Deployment",
    description: "Deployment guides and procedures",
    path: "/docs/deployment",
    icon: LayoutDashboard,
  },
  {
    title: "Design",
    description: "Design guidelines and assets",
    path: "/docs/design",
    icon: Sparkles,
  },
  {
    title: "Development Guides",
    description: "Development guides and best practices",
    path: "/docs/development-guides",
    icon: Package,
  },
  {
    title: "Features",
    description: "Detailed feature documentation",
    path: "/docs/features",
    icon: Star,
  },
  {
    title: "Testing",
    description: "Testing methodologies and practices",
    path: "/docs/testing",
    icon: ClipboardCheck,
  },
];

interface DocsHomePageProps {
  docTree: DocTree;
  recentDocuments: DocInfo[];
}

export function DocsHomePage({ docTree, recentDocuments }: DocsHomePageProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 mb-8 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Documentation Portal
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Comprehensive guides, API references, and resources for internal teams to excel with the Rishi Platform
          </p>

          {/* Search box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            />
          </div>
        </header>

      {/* Featured Documentation Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
          Documentation Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCategories.map((category, index) => (
            <Link
              key={index}
              href={category.path}
              className="group flex items-start p-8 rounded-2xl transition-all duration-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:border-teal-300 dark:hover:border-teal-600 hover:-translate-y-1 transform"
            >
              <div className="flex-shrink-0 mr-4 mt-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <category.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Recent Updates
          </h2>
          <Link
            href="/docs/recent-changes"
            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium hover:underline transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-6">
          {recentDocuments.map((doc, index) => (
            <Link
              key={index}
              href={`/docs/${doc.path}`}
              className="block p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.excerpt}
                  </p>
                </div>
                <span className="flex items-center text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatRelativeTime(doc.lastModified)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
          Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/docs/README"
            className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform"
          >
            <h3 className="text-xl font-semibold mb-3 flex items-center text-slate-900 dark:text-white">
              <BookOpen className="h-6 w-6 mr-3 text-teal-600 dark:text-teal-400" />
              Quick Start Guide
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Get up and running quickly with our platform - comprehensive overview and setup instructions
            </p>
          </Link>
          <Link
            href="/docs/api-reference"
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform"
          >
            <h3 className="text-xl font-semibold mb-3 flex items-center text-slate-900 dark:text-white">
              <FileText className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
              API Reference
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore our API documentation and endpoints - complete technical reference guide
            </p>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
