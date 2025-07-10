import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NavItem } from "@/shared/navigation-constants";
import * as Icons from "lucide-react";

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
  console.log("Sidebar items received:", propItems.length);
  console.log("Sidebar items detail:", JSON.stringify(propItems, null, 2));

  // Specifically log Brand Agents section
  const brandAgentsSection = items.find((i) => i.label === "Brand Agents");
  if (brandAgentsSection) {
    console.log(
      "Brand Agents section found:",
      JSON.stringify(brandAgentsSection, null, 2),
    );
    console.log(
      "Brand Agents children count:",
      brandAgentsSection.children?.length || 0,
    );
    if (brandAgentsSection.children && brandAgentsSection.children.length > 0) {
      console.log(
        "Brand Agents children labels:",
        brandAgentsSection.children.map((c) => c.label),
      );
    }
  } else {
    console.log("Brand Agents section NOT found in sidebar items");
  }

  useEffect(() => {
    // Auto-expand section if we're on a child page
    const newOpenSections: Record<string, boolean> = { ...openSections };

    // Check all nav items
    items.forEach((item) => {
      // Support both path and href (for backwards compatibility)
      const itemPath = (item.href || item.path || "/") as string;
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
    if (path === "/") {
      return location === path;
    }
    return location === path || location.startsWith(`${path}/`);
  };

  // Render a navigation section with collapsible children
  const renderNavSection = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    // Support both path and href (for backwards compatibility)
    const itemPath = (item.href || item.path || "/") as string;
    const isOpen = openSections[itemPath] || false;
    const isActive = isActivePath(itemPath);

    // Get the icon if specified
    let Icon = null;
    if (item.icon) {
      if (typeof item.icon === "string") {
        // Handle string icon names from the lucide-react library
        Icon = (Icons as any)[item.icon] || Icons.Circle;
      } else {
        // Handle JSX element icons
        Icon = () => item.icon;
      }
    }

    return (
      <div key={itemPath} className="nav-section">
        {/* Section header - either a link or a toggle button */}
        {hasChildren ? (
          <button
            className={`nav-section-header ${isActive ? "active" : ""}`}
            onClick={() => toggleSection(itemPath)}
          >
            <div className="nav-section-title">
              {Icon && <Icon size={20} className="nav-icon" />}
              <span>{item.label}</span>
            </div>
            <Icons.ChevronDown
              className={`nav-arrow ${isOpen ? "open" : ""}`}
              size={18}
            />
          </button>
        ) : (
          <Link
            href={itemPath}
            className={`nav-section-header ${isActive ? "active" : ""}`}
          >
            <div className="nav-section-title">
              {Icon && <Icon size={20} className="nav-icon" />}
              <span>{item.label}</span>
            </div>
          </Link>
        )}

        {/* Section children */}
        {hasChildren && (
          <div className={`nav-section-children ${isOpen ? "open" : ""}`}>
            {/* Debug logging for Brand Agents section */}
            {item.label === "Brand Agents" ? (
              <>
                {console.log(
                  "Sidebar: Brand Agents children rendering:",
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
              const childPath = (child.href || child.path || "/") as string;
              if (
                item.label === "Brand Agents" &&
                child.label === "My Availability"
              ) {
                console.log(
                  "Sidebar: Rendering My Availability item with path:",
                  childPath,
                );
              }
              return (
                <Link
                  key={childPath}
                  href={childPath}
                  className={`nav-child-link ${isActivePath(childPath) ? "active" : ""}`}
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
    <div className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <h1 className="app-title">Rishi</h1>
        </Link>
      </div>

      <div className="sidebar-content">
        {items.map((item) => renderNavSection(item))}
      </div>
    </div>
  );
};

export default Sidebar;
