&quot;use client&quot;;

import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
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
} from &quot;lucide-react&quot;;
import { formatRelativeTime } from &quot;@/components/../lib/client-utils&quot;;
import { DocInfo, DocTree } from &quot;@/components/../lib/docs&quot;;

// Categories reflecting the actual folder structure in Docs directory
const featuredCategories = [
  {
    title: &quot;Getting Started&quot;,
    description: &quot;Essential guides to get up and running quickly&quot;,
    path: &quot;/docs/getting-started&quot;,
    icon: BookOpen,
  },
  {
    title: &quot;API Reference&quot;,
    description: &quot;Detailed API documentation and examples&quot;,
    path: &quot;/docs/api&quot;,
    icon: FileText,
  },
  {
    title: &quot;Architecture&quot;,
    description: &quot;System architecture and design patterns&quot;,
    path: &quot;/docs/architecture&quot;,
    icon: Folders,
  },
  {
    title: &quot;Business&quot;,
    description: &quot;Business strategy and roadmap&quot;,
    path: &quot;/docs/business&quot;,
    icon: LayoutDashboard,
  },
  {
    title: &quot;CSS&quot;,
    description: &quot;Styling and CSS guidelines&quot;,
    path: &quot;/docs/css&quot;,
    icon: Sparkles,
  },
  {
    title: &quot;Deployment&quot;,
    description: &quot;Deployment guides and procedures&quot;,
    path: &quot;/docs/deployment&quot;,
    icon: LayoutDashboard,
  },
  {
    title: &quot;Design&quot;,
    description: &quot;Design guidelines and assets&quot;,
    path: &quot;/docs/design&quot;,
    icon: Sparkles,
  },
  {
    title: &quot;Development Guides&quot;,
    description: &quot;Development guides and best practices&quot;,
    path: &quot;/docs/development-guides&quot;,
    icon: Package,
  },
  {
    title: &quot;Features&quot;,
    description: &quot;Detailed feature documentation&quot;,
    path: &quot;/docs/features&quot;,
    icon: Star,
  },
  {
    title: &quot;Testing&quot;,
    description: &quot;Testing methodologies and practices&quot;,
    path: &quot;/docs/testing&quot;,
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
    <div className=&quot;max-w-7xl mx-auto p-6&quot;>
      <header className=&quot;mb-12&quot;>
        <h1 className=&quot;text-3xl lg:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]&quot;>
          Documentation Portal
        </h1>
        <p className=&quot;text-lg text-[rgb(var(--muted-foreground))] max-w-3xl&quot;>
          Comprehensive guides, API references, and resources for internal teams
        </p>

        {/* Search box */}
        <div className=&quot;relative max-w-2xl mt-6&quot;>
          <div className=&quot;absolute inset-y-0 left-0 flex items-center pl-3&quot;>
            <Search className=&quot;h-5 w-5 text-[rgb(var(--muted-foreground))]&quot; />
          </div>
          <input
            type=&quot;text&quot;
            placeholder=&quot;Search documentation...&quot;
            className=&quot;w-full h-12 bg-[rgb(var(--background))] border border-[rgb(var(--input))] rounded-lg pl-10 pr-4 text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]&quot;
          />
        </div>
      </header>

      {/* Featured Documentation Categories */}
      <section className=&quot;mb-12&quot;>
        <h2 className=&quot;text-2xl font-bold mb-6 text-[rgb(var(--foreground))]&quot;>
          Categories
        </h2>
        <div className=&quot;grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
          {featuredCategories.map((category, index) => (
            <Link
              key={index}
              href={category.path}
              className=&quot;group flex items-start p-6 rounded-2xl transition-all duration-300 border border-[rgb(var(--border))] shadow-sm hover:shadow-md hover:border-[rgb(var(--primary))] hover:shadow-[rgba(var(--primary),0.05)]&quot;
            >
              <div className=&quot;flex-shrink-0 mr-4 mt-1&quot;>
                <div className=&quot;w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[rgba(var(--primary),0.1)] to-[rgba(var(--secondary),0.1)] text-[rgb(var(--primary))] group-hover:from-[rgba(var(--primary),0.15)] group-hover:to-[rgba(var(--secondary),0.15)]&quot;>
                  <category.icon className=&quot;w-5 h-5&quot; />
                </div>
              </div>
              <div>
                <h3 className=&quot;text-lg font-semibold mb-1 text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))]&quot;>
                  {category.title}
                </h3>
                <p className=&quot;text-sm text-[rgb(var(--muted-foreground))]&quot;>
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className=&quot;mb-12&quot;>
        <div className=&quot;flex items-center justify-between mb-6&quot;>
          <h2 className=&quot;text-2xl font-bold text-[rgb(var(--foreground))]&quot;>
            Recent Updates
          </h2>
          <Link
            href=&quot;/docs/recent-changes&quot;
            className=&quot;text-sm font-medium text-[rgb(var(--primary))] hover:underline&quot;
          >
            View all
          </Link>
        </div>
        <div className=&quot;space-y-4&quot;>
          {recentDocuments.map((doc, index) => (
            <Link
              key={index}
              href={`/docs/${doc.path}`}
              className=&quot;block p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm&quot;
            >
              <div className=&quot;flex items-start justify-between&quot;>
                <div className=&quot;flex-1&quot;>
                  <h3 className=&quot;text-lg font-semibold mb-2 text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]&quot;>
                    {doc.title}
                  </h3>
                  <p className=&quot;text-sm text-[rgb(var(--muted-foreground))] line-clamp-2&quot;>
                    {doc.excerpt}
                  </p>
                </div>
                <span className=&quot;flex items-center text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap ml-4&quot;>
                  <Clock className=&quot;h-3 w-3 mr-1&quot; />
                  {formatRelativeTime(doc.lastModified)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className=&quot;mb-12&quot;>
        <h2 className=&quot;text-2xl font-bold mb-6 text-[rgb(var(--foreground))]&quot;>
          Getting Started
        </h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <Link
            href=&quot;/docs/getting-started&quot;
            className=&quot;p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm&quot;
          >
            <h3 className=&quot;text-lg font-semibold mb-2 flex items-center text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]&quot;>
              <BookOpen className=&quot;h-5 w-5 mr-2 text-[rgb(var(--primary))]&quot; />
              Quick Start Guide
            </h3>
            <p className=&quot;text-sm text-[rgb(var(--muted-foreground))]&quot;>
              Get up and running quickly with our platform
            </p>
          </Link>
          <Link
            href=&quot;/docs/api&quot;
            className=&quot;p-6 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-200 hover:shadow-sm&quot;
          >
            <h3 className=&quot;text-lg font-semibold mb-2 flex items-center text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))]&quot;>
              <FileText className=&quot;h-5 w-5 mr-2 text-[rgb(var(--primary))]&quot; />
              API Reference
            </h3>
            <p className=&quot;text-sm text-[rgb(var(--muted-foreground))]&quot;>
              Explore our API documentation and endpoints
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
