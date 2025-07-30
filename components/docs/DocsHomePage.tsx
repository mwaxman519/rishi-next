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
import { formatRelativeTime } from "@/components/../lib/client-utils";
import { DocInfo, DocTree } from "@/components/../lib/docs";

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
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
          Documentation Portal
        </h1>
        <p className="text-lg text-[rgb(var(--muted-foreground))] max-w-3xl">
          Comprehensive guides, API references, and resources for internal teams
        </p>

        {/* Search box */}
        <div className="relative max-w-2xl mt-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
          </div>
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full h-12 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-lg pl-10 pr-4 text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
          />
        </div>
      </header>

      {/* Featured Documentation Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--foreground))]">
          Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((category, index) => (
            <Link
              key={index}
              href={category.path}
              className="group flex items-start p-6 rounded-2xl transition-all duration-300 border border-[rgb(var(--border))] shadow-sm hover:shadow-md hover:border-[rgb(var(--primary))] hover:shadow-[rgba(var(--primary),0.05)]"
            >
              <div className="flex-shrink-0 mr-4 mt-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[rgba(var(--primary),0.1)] to-[rgba(var(--secondary),0.1)] text-[rgb(var(--primary))] group-hover:from-[rgba(var(--primary),0.15)] group-hover:to-[rgba(var(--secondary),0.15)]">
                  <category.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))]">
                  {category.title}
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
            Recent Updates
          </h2>
          <Link
            href="/docs/recent-changes"
            className="text-sm font-medium text-[rgb(var(--primary))] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {recentDocuments.map((doc, index) => (
            <Link
              key={index}
              href={`/docs/${doc.path}`}
              className="block p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] line-clamp-2">
                    {doc.excerpt}
                  </p>
                </div>
                <span className="flex items-center text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap ml-4">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(doc.lastModified)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--foreground))]">
          Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/docs/getting-started"
            className="p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]">
              <BookOpen className="h-5 w-5 mr-2 text-[rgb(var(--primary))]" />
              Quick Start Guide
            </h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Get up and running quickly with our platform
            </p>
          </Link>
          <Link
            href="/docs/api"
            className="p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]">
              <FileText className="h-5 w-5 mr-2 text-[rgb(var(--primary))]" />
              API Reference
            </h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Explore our API documentation and endpoints
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
