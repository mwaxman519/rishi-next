import React, { useState } from &quot;react&quot;;
import { Link } from &quot;wouter&quot;;
import { NavItem } from &quot;@shared/navigation-constants&quot;;
import * as Icons from &quot;lucide-react&quot;;
import { useOrganizationContext } from &quot;@/contexts/OrganizationProvider&quot;;

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
      <ul className=&quot;dropdown-menu&quot;>
        {children.map((item) => (
          <li key={item.path} className=&quot;dropdown-item&quot;>
            <Link href={item.path} onClick={closeDropdowns}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className=&quot;top-bar&quot;>
      <div className=&quot;organization-selector&quot;>
        {currentOrganization && (
          <div className=&quot;current-organization&quot;>
            <span className=&quot;org-name&quot;>{currentOrganization.name}</span>
            <button
              className=&quot;org-switcher&quot;
              onClick={() => toggleDropdown(&quot;organizations&quot;)}
            >
              <Icons.ChevronDown size={16} />
            </button>
            {openDropdown === &quot;organizations&quot; && (
              <ul className=&quot;dropdown-menu org-menu&quot;>
                {userOrganizations.map((org: { id: string; name: string }) => (
                  <li
                    key={org.id}
                    className={`dropdown-item ${org.id === currentOrganization.id ? &quot;active&quot; : "&quot;}`}
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

      <div className=&quot;top-actions&quot;>
        {items.map((item) => (
          <div key={item.path} className=&quot;action-item&quot;>
            {item.children ? (
              <div className=&quot;dropdown&quot;>
                <button
                  className=&quot;dropdown-toggle&quot;
                  onClick={() => toggleDropdown(item.path)}
                >
                  {item.icon && (Icons as any)[item.icon] && (
                    <span className=&quot;action-icon&quot;>
                      {React.createElement((Icons as any)[item.icon], {
                        size: 20,
                      })}
                    </span>
                  )}
                  <span className=&quot;action-label&quot;>{item.label}</span>
                </button>
                {openDropdown === item.path &&
                  renderDropdownItems(item.children)}
              </div>
            ) : (
              <Link href={item.path} className=&quot;action-link&quot;>
                {item.icon && (Icons as any)[item.icon] && (
                  <span className=&quot;action-icon&quot;>
                    {React.createElement((Icons as any)[item.icon], {
                      size: 20,
                    })}
                  </span>
                )}
                <span className=&quot;action-label&quot;>{item.label}</span>
              </Link>
            )}
          </div>
        ))}

        <div className=&quot;user-profile&quot;>
          <button
            className=&quot;user-button&quot;
            onClick={() => toggleDropdown(&quot;user&quot;)}
          >
            <div className=&quot;avatar&quot;>
              <Icons.User size={20} />
            </div>
          </button>
          {openDropdown === &quot;user&quot; && (
            <ul className=&quot;dropdown-menu user-menu&quot;>
              <li className=&quot;dropdown-item&quot;>
                <Link href=&quot;/profile&quot; onClick={closeDropdowns}>
                  Profile
                </Link>
              </li>
              <li className=&quot;dropdown-item&quot;>
                <Link href=&quot;/settings&quot; onClick={closeDropdowns}>
                  Settings
                </Link>
              </li>
              <li className=&quot;dropdown-item&quot;>
                <Link href=&quot;/api/auth/logout" onClick={closeDropdowns}>
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
