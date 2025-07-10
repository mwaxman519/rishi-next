import React, { useState } from "react";
import { Link } from "wouter";
import { NavItem } from "@shared/navigation-constants";
import * as Icons from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationProvider";

interface TopBarProps {
  items: NavItem[];
}

const TopBar: React.FC<TopBarProps> = ({ items }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { currentOrganization, userOrganizations, switchOrganization } =
    useOrganizationContext();

  const toggleDropdown = (path: string) => {
    setOpenDropdown((prev) => (prev === path ? null : path));
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const renderDropdownItems = (children: NavItem[]) => {
    return (
      <ul className="dropdown-menu">
        {children.map((item) => (
          <li key={item.path} className="dropdown-item">
            <Link href={item.path} onClick={closeDropdowns}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="top-bar">
      <div className="organization-selector">
        {currentOrganization && (
          <div className="current-organization">
            <span className="org-name">{currentOrganization.name}</span>
            <button
              className="org-switcher"
              onClick={() => toggleDropdown("organizations")}
            >
              <Icons.ChevronDown size={16} />
            </button>
            {openDropdown === "organizations" && (
              <ul className="dropdown-menu org-menu">
                {userOrganizations.map((org: { id: string; name: string }) => (
                  <li
                    key={org.id}
                    className={`dropdown-item ${org.id === currentOrganization.id ? "active" : ""}`}
                    onClick={() => {
                      switchOrganization(org.id);
                      closeDropdowns();
                    }}
                  >
                    {org.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="top-actions">
        {items.map((item) => (
          <div key={item.path} className="action-item">
            {item.children ? (
              <div className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown(item.path)}
                >
                  {item.icon && (Icons as any)[item.icon] && (
                    <span className="action-icon">
                      {React.createElement((Icons as any)[item.icon], {
                        size: 20,
                      })}
                    </span>
                  )}
                  <span className="action-label">{item.label}</span>
                </button>
                {openDropdown === item.path &&
                  renderDropdownItems(item.children)}
              </div>
            ) : (
              <Link href={item.path} className="action-link">
                {item.icon && (Icons as any)[item.icon] && (
                  <span className="action-icon">
                    {React.createElement((Icons as any)[item.icon], {
                      size: 20,
                    })}
                  </span>
                )}
                <span className="action-label">{item.label}</span>
              </Link>
            )}
          </div>
        ))}

        <div className="user-profile">
          <button
            className="user-button"
            onClick={() => toggleDropdown("user")}
          >
            <div className="avatar">
              <Icons.User size={20} />
            </div>
          </button>
          {openDropdown === "user" && (
            <ul className="dropdown-menu user-menu">
              <li className="dropdown-item">
                <Link href="/profile" onClick={closeDropdowns}>
                  Profile
                </Link>
              </li>
              <li className="dropdown-item">
                <Link href="/settings" onClick={closeDropdowns}>
                  Settings
                </Link>
              </li>
              <li className="dropdown-item">
                <Link href="/api/auth/logout" onClick={closeDropdowns}>
                  Logout
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
