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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Stunning Hero Section */}
        <header className="mb-20 text-center">
          {/* Professional Logo/Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 mb-10">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          
          {/* Main Title */}
          <h1 className="text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight">
            Documentation Portal
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
            Comprehensive guides, API references, and resources for internal teams to excel with the 
            <span className="font-semibold text-slate-900 dark:text-white"> Rishi Platform</span>
          </p>

          {/* Professional Search Interface */}
          <div className="relative max-w-3xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 flex items-center pl-6">
              <Search className="h-7 w-7 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search documentation, guides, and API references..."
              className="w-full h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl pl-16 pr-6 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-xl font-medium"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-6">
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400">
                ⌘K
              </div>
            </div>
          </div>
          
          {/* Professional Stats */}
          <div className="flex justify-center gap-12 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">301</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Documentation Files</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">14</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Major Categories</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">∞</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Possibilities</div>
            </div>
          </div>
        </header>

      {/* Featured Documentation Categories */}
      <section className="mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Documentation Categories
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Explore comprehensive documentation organized by features and functionality
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredCategories.map((category, index) => (
            <Link
              key={index}
              href={category.path}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 transform"
            >
              {/* Gradient Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative p-8 space-y-6">
                {/* Icon Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-sm"></div>
                  </div>
                </div>
                
                {/* Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    {category.description}
                  </p>
                </div>
                
                {/* Hover Arrow */}
                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <span>Explore</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
              Recent Updates
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Stay up-to-date with the latest documentation changes
            </p>
          </div>
          <Link
            href="/docs/recent-changes"
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>View all</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="space-y-6">
          {recentDocuments.map((doc, index) => (
            <Link
              key={index}
              href={`/docs/${doc.path}`}
              className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform"
            >
              {/* Gradient Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-sm"></div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg line-clamp-2">
                      {doc.excerpt}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4 ml-8">
                    <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full font-medium">
                      <Clock className="h-4 w-4" />
                      {formatRelativeTime(doc.lastModified)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                        <span>Read more</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Quick Start Guide
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Jump right in with these essential resources to get productive immediately
          </p>
        </div>
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
