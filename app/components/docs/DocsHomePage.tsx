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
import { formatRelativeTime } from &quot;../../lib/client-utils&quot;;
import { DocInfo, DocTree } from &quot;../../lib/docs&quot;;

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
    <div className=&quot;min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900&quot;>
      <div className=&quot;max-w-7xl mx-auto px-8 py-16&quot;>
        {/* Stunning Hero Section */}
        <header className=&quot;mb-20 text-center&quot;>
          {/* Professional Logo/Icon */}
          <div className=&quot;inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 mb-10&quot;>
            <BookOpen className=&quot;w-12 h-12 text-white&quot; />
          </div>
          
          {/* Main Title */}
          <h1 className=&quot;text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight&quot;>
            Documentation Portal
          </h1>
          
          {/* Subtitle */}
          <p className=&quot;text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed&quot;>
            Comprehensive guides, API references, and resources for internal teams to excel with the 
            <span className=&quot;font-semibold text-slate-900 dark:text-white&quot;> Rishi Platform</span>
          </p>

          {/* Professional Search Interface */}
          <div className=&quot;relative max-w-3xl mx-auto mb-8&quot;>
            <div className=&quot;absolute inset-y-0 left-0 flex items-center pl-6&quot;>
              <Search className=&quot;h-7 w-7 text-slate-400 dark:text-slate-500&quot; />
            </div>
            <input
              type=&quot;text&quot;
              placeholder=&quot;Search documentation, guides, and API references...&quot;
              className=&quot;w-full h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl pl-16 pr-6 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-xl font-medium&quot;
            />
            <div className=&quot;absolute inset-y-0 right-0 flex items-center pr-6&quot;>
              <div className=&quot;px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400&quot;>
                ⌘K
              </div>
            </div>
          </div>
          
          {/* Professional Stats */}
          <div className=&quot;flex justify-center gap-12 text-center&quot;>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;text-3xl font-bold text-slate-900 dark:text-white&quot;>301</div>
              <div className=&quot;text-sm text-slate-600 dark:text-slate-400 font-medium&quot;>Documentation Files</div>
            </div>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;text-3xl font-bold text-slate-900 dark:text-white&quot;>14</div>
              <div className=&quot;text-sm text-slate-600 dark:text-slate-400 font-medium&quot;>Major Categories</div>
            </div>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;text-3xl font-bold text-slate-900 dark:text-white&quot;>∞</div>
              <div className=&quot;text-sm text-slate-600 dark:text-slate-400 font-medium&quot;>Possibilities</div>
            </div>
          </div>
        </header>

      {/* Featured Documentation Categories */}
      <section className=&quot;mb-20&quot;>
        <div className=&quot;text-center mb-16&quot;>
          <h2 className=&quot;text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent&quot;>
            Documentation Categories
          </h2>
          <p className=&quot;text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto&quot;>
            Explore comprehensive documentation organized by features and functionality
          </p>
        </div>
        <div className=&quot;grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8&quot;>
          {featuredCategories.map((category, index) => (
            <Link
              key={index}
              href={category.path}
              className=&quot;group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 transform&quot;
            >
              {/* Gradient Background Animation */}
              <div className=&quot;absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500&quot;></div>
              
              {/* Content */}
              <div className=&quot;relative p-8 space-y-6&quot;>
                {/* Icon Header */}
                <div className=&quot;flex items-start justify-between&quot;>
                  <div className=&quot;flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300&quot;>
                    <category.icon className=&quot;w-8 h-8 text-white&quot; />
                  </div>
                  <div className=&quot;opacity-0 group-hover:opacity-100 transition-opacity duration-300&quot;>
                    <div className=&quot;w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-sm&quot;></div>
                  </div>
                </div>
                
                {/* Title & Description */}
                <div className=&quot;space-y-3&quot;>
                  <h3 className=&quot;text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300&quot;>
                    {category.title}
                  </h3>
                  <p className=&quot;text-slate-600 dark:text-slate-400 leading-relaxed text-lg&quot;>
                    {category.description}
                  </p>
                </div>
                
                {/* Hover Arrow */}
                <div className=&quot;flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300&quot;>
                  <div className=&quot;flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium&quot;>
                    <span>Explore</span>
                    <svg className=&quot;w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;>
                      <path strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot; strokeWidth={2} d=&quot;M17 8l4 4m0 0l-4 4m4-4H3&quot; />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className=&quot;mb-20&quot;>
        <div className=&quot;flex items-center justify-between mb-12&quot;>
          <div>
            <h2 className=&quot;text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent&quot;>
              Recent Updates
            </h2>
            <p className=&quot;text-xl text-slate-600 dark:text-slate-400&quot;>
              Stay up-to-date with the latest documentation changes
            </p>
          </div>
          <Link
            href=&quot;/docs/recent-changes&quot;
            className=&quot;group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5&quot;
          >
            <span>View all</span>
            <svg className=&quot;w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;>
              <path strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot; strokeWidth={2} d=&quot;M17 8l4 4m0 0l-4 4m4-4H3&quot; />
            </svg>
          </Link>
        </div>
        <div className=&quot;space-y-6&quot;>
          {recentDocuments.map((doc, index) => (
            <Link
              key={index}
              href={`/docs/${doc.path}`}
              className=&quot;group block relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform&quot;
            >
              {/* Gradient Background Animation */}
              <div className=&quot;absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500&quot;></div>
              
              {/* Content */}
              <div className=&quot;relative p-8&quot;>
                <div className=&quot;flex items-start justify-between&quot;>
                  <div className=&quot;flex-1 space-y-4&quot;>
                    <div className=&quot;flex items-center gap-3&quot;>
                      <div className=&quot;w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-sm&quot;></div>
                      <h3 className=&quot;text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300&quot;>
                        {doc.title}
                      </h3>
                    </div>
                    <p className=&quot;text-slate-600 dark:text-slate-400 leading-relaxed text-lg line-clamp-2&quot;>
                      {doc.excerpt}
                    </p>
                  </div>
                  <div className=&quot;flex flex-col items-end gap-4 ml-8&quot;>
                    <span className=&quot;flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full font-medium&quot;>
                      <Clock className=&quot;h-4 w-4&quot; />
                      {formatRelativeTime(doc.lastModified)}
                    </span>
                    <div className=&quot;opacity-0 group-hover:opacity-100 transition-opacity duration-300&quot;>
                      <div className=&quot;flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium&quot;>
                        <span>Read more</span>
                        <svg className=&quot;w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;>
                          <path strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot; strokeWidth={2} d=&quot;M17 8l4 4m0 0l-4 4m4-4H3&quot; />
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
      <section className=&quot;mb-20&quot;>
        <div className=&quot;text-center mb-16&quot;>
          <h2 className=&quot;text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent&quot;>
            Quick Start Guide
          </h2>
          <p className=&quot;text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto&quot;>
            Jump right in with these essential resources to get productive immediately
          </p>
        </div>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-8&quot;>
          <Link
            href=&quot;/docs/README&quot;
            className=&quot;p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform&quot;
          >
            <h3 className=&quot;text-xl font-semibold mb-3 flex items-center text-slate-900 dark:text-white&quot;>
              <BookOpen className=&quot;h-6 w-6 mr-3 text-teal-600 dark:text-teal-400&quot; />
              Quick Start Guide
            </h3>
            <p className=&quot;text-slate-600 dark:text-slate-400 leading-relaxed&quot;>
              Get up and running quickly with our platform - comprehensive overview and setup instructions
            </p>
          </Link>
          <Link
            href=&quot;/docs/api-reference&quot;
            className=&quot;p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform&quot;
          >
            <h3 className=&quot;text-xl font-semibold mb-3 flex items-center text-slate-900 dark:text-white&quot;>
              <FileText className=&quot;h-6 w-6 mr-3 text-purple-600 dark:text-purple-400&quot; />
              API Reference
            </h3>
            <p className=&quot;text-slate-600 dark:text-slate-400 leading-relaxed&quot;>
              Explore our API documentation and endpoints - complete technical reference guide
            </p>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
