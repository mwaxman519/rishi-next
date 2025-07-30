import React, { useState, useEffect } from &quot;react&quot;;
import { Link, useLocation } from &quot;wouter&quot;;
import { NavItem } from &quot;@shared/navigation-constants&quot;;
import * as Icons from &quot;lucide-react&quot;;

interface SidebarProps {
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items: propItems }) => {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Create a mutable copy of the items array
  const [items, setItems] = useState<NavItem[]>([]);

  // Initialize items from props when component mounts
  useEffect(() => {
    setItems([...propItems]);
  }, [propItems]);

  // Log for debugging
  console.log(&quot;Sidebar items received:&quot;, propItems.length);
  console.log(&quot;Sidebar items detail:&quot;, JSON.stringify(propItems, null, 2));

  // Specifically log Brand Agents section
  const brandAgentsSection = items.find((i) => i.label === &quot;Brand Agents&quot;);
  if (brandAgentsSection) {
    console.log(
      &quot;Brand Agents section found:&quot;,
      JSON.stringify(brandAgentsSection, null, 2),
    );
    console.log(
      &quot;Brand Agents children count:&quot;,
      brandAgentsSection.children?.length || 0,
    );
    if (brandAgentsSection.children && brandAgentsSection.children.length > 0) {
      console.log(
        &quot;Brand Agents children labels:&quot;,
        brandAgentsSection.children.map((c) => c.label),
      );
    }
  } else {
    console.log(&quot;Brand Agents section NOT found in sidebar items&quot;);
  }

  useEffect(() => {
    // Auto-expand section if we&apos;re on a child page
    const newOpenSections: Record<string, boolean> = { ...openSections };

    // Check all nav items
    items.forEach((item) => {
      // Support both path and href (for backwards compatibility)
      const itemPath = (item.href || item.path || &quot;/&quot;) as string;
      if (item.children && location.startsWith(itemPath)) {
        newOpenSections[itemPath] = true;
      }
    });

    setOpenSections(newOpenSections);
  }, [location, items]);

  // Toggle a section open/closed
  const toggleSection = (path: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Check if a path is the current active page
  const isActivePath = (path: string) => {
    if (path === &quot;/&quot;) {
      return location === path;
    }
    return location === path || location.startsWith(`${path}/`);
  };

  // Render a navigation section with collapsible children
  const renderNavSection = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    // Support both path and href (for backwards compatibility)
    const itemPath = (item.href || item.path || &quot;/&quot;) as string;
    const isOpen = openSections[itemPath] || false;
    const isActive = isActivePath(itemPath);

    // Get the icon if specified
    let Icon = null;
    if (item.icon) {
      if (typeof item.icon === &quot;string&quot;) {
        // Handle string icon names from the lucide-react library
        Icon = (Icons as any)[item.icon] || Icons.Circle;
      } else {
        // Handle JSX element icons
        Icon = () => item.icon;
      }
    }

    return (
      <div key={itemPath} className=&quot;nav-section&quot;>
        {/* Section header - either a link or a toggle button */}
        {hasChildren ? (
          <button
            className={`nav-section-header ${isActive ? &quot;active&quot; : "&quot;}`}
            onClick={() => toggleSection(itemPath)}
          >
            <div className=&quot;nav-section-title&quot;>
              {Icon && <Icon size={20} className=&quot;nav-icon&quot; />}
              <span>{item.label}</span>
            </div>
            <Icons.ChevronDown
              className={`nav-arrow ${isOpen ? &quot;open&quot; : &quot;&quot;}`}
              size={18}
            />
          </button>
        ) : (
          <Link
            href={itemPath}
            className={`nav-section-header ${isActive ? &quot;active&quot; : &quot;&quot;}`}
          >
            <div className=&quot;nav-section-title&quot;>
              {Icon && <Icon size={20} className=&quot;nav-icon&quot; />}
              <span>{item.label}</span>
            </div>
          </Link>
        )}

        {/* Section children */}
        {hasChildren && (
          <div className={`nav-section-children ${isOpen ? &quot;open&quot; : &quot;&quot;}`}>
            {/* Debug logging for Brand Agents section */}
            {item.label === &quot;Brand Agents&quot; ? (
              <>
                {console.log(
                  &quot;Sidebar: Brand Agents children rendering:&quot;,
                  JSON.stringify(
                    item.children?.map((c) => ({
                      label: c.label,
                      path: c.path,
                    })),
                    null,
                    2,
                  ),
                )}
              </>
            ) : null}
            {item.children?.map((child) => {
              const childPath = (child.href || child.path || &quot;/&quot;) as string;
              if (
                item.label === &quot;Brand Agents&quot; &&
                child.label === &quot;My Availability&quot;
              ) {
                console.log(
                  &quot;Sidebar: Rendering My Availability item with path:&quot;,
                  childPath,
                );
              }
              return (
                <Link
                  key={childPath}
                  href={childPath}
                  className={`nav-child-link ${isActivePath(childPath) ? &quot;active&quot; : &quot;&quot;}`}
                >
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // NO LONGER adding My Availability to top level - it should only be in Brand Agents section

  return (
    <div className=&quot;sidebar&quot;>
      <div className=&quot;sidebar-header&quot;>
        <Link href=&quot;/&quot; className=&quot;sidebar-logo&quot;>
          <h1 className=&quot;app-title&quot;>Rishi</h1>
        </Link>
      </div>

      <div className=&quot;sidebar-content">
        {items.map((item) => renderNavSection(item))}
      </div>
    </div>
  );
};

export default Sidebar;
