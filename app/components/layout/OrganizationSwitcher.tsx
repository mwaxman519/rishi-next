&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Building,
  ChevronDown,
  Check,
  LogOut,
  Users,
  Settings,
  Briefcase,
  BuildingIcon,
} from &quot;lucide-react&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { useOrganization } from &quot;@/contexts/OrganizationProvider&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;

export function OrganizationSwitcher() {
  const {
    userOrganizations,
    currentOrganization,
    switchOrganization,
    isLoading,
  } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Get organization type specific styles
  const getOrgTypeStyles = (type?: string) => {
    // Default styles if type is undefined
    if (!type) {
      return {
        icon: <BuildingIcon className=&quot;h-4 w-4 text-gray-500&quot; />,
        bgColor: &quot;bg-gray-100&quot;,
        textColor: &quot;text-gray-700&quot;,
      };
    }

    switch (type.toLowerCase()) {
      case &quot;internal&quot;:
        return {
          icon: <Building className=&quot;h-4 w-4 text-purple-500&quot; />,
          bgColor: &quot;bg-purple-100&quot;,
          textColor: &quot;text-purple-700&quot;,
        };
      case &quot;client&quot;:
        return {
          icon: <Briefcase className=&quot;h-4 w-4 text-blue-500&quot; />,
          bgColor: &quot;bg-blue-100&quot;,
          textColor: &quot;text-blue-700&quot;,
        };
      case &quot;partner&quot;:
        return {
          icon: <Users className=&quot;h-4 w-4 text-green-500&quot; />,
          bgColor: &quot;bg-green-100&quot;,
          textColor: &quot;text-green-700&quot;,
        };
      default:
        return {
          icon: <BuildingIcon className=&quot;h-4 w-4 text-gray-500&quot; />,
          bgColor: &quot;bg-gray-100&quot;,
          textColor: &quot;text-gray-700&quot;,
        };
    }
  };

  // Function to get organization tier badge
  const getOrgTierBadge = (tier?: string | null) => {
    if (!tier) return null;

    const tierColors: Record<string, string> = {
      &quot;1&quot;: &quot;bg-gray-100 text-gray-800&quot;,
      &quot;2&quot;: &quot;bg-blue-100 text-blue-800&quot;,
      &quot;3&quot;: &quot;bg-purple-100 text-purple-800&quot;,
    };

    const tierNames: Record<string, string> = {
      &quot;1&quot;: &quot;Tier 1&quot;,
      &quot;2&quot;: &quot;Tier 2&quot;,
      &quot;3&quot;: &quot;Tier 3&quot;,
    };

    const bgColor = tierColors[tier] || &quot;bg-gray-100 text-gray-800&quot;;
    const name = tierNames[tier] || `Tier ${tier}`;

    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${bgColor}`}>{name}</span>
    );
  };

  // Handle organization switch
  const handleSwitchOrg = async (orgId: string) => {
    if (currentOrganization?.id === orgId) return;

    try {
      setIsSwitching(true);
      await switchOrganization(orgId);
      toast({
        title: &quot;Organization switched&quot;,
        description: &quot;Successfully switched organization context&quot;,
      });
      setIsOpen(false);
    } catch (error) {
      console.error(&quot;Error switching organization:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description:
          error instanceof Error
            ? error.message
            : &quot;Failed to switch organization&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Return placeholder during initial load
  if (isLoading) {
    return (
      <Button
        variant=&quot;outline&quot;
        size=&quot;sm&quot;
        className=&quot;w-[240px] justify-start opacity-70&quot;
        disabled
      >
        <div className=&quot;h-4 w-4 mr-2 rounded animate-pulse bg-muted&quot;></div>
        <div className=&quot;h-4 w-32 rounded animate-pulse bg-muted&quot;></div>
      </Button>
    );
  }

  // If no current organization
  if (!currentOrganization) {
    return (
      <Button
        variant=&quot;outline&quot;
        size=&quot;sm&quot;
        className=&quot;w-[240px] justify-start text-muted-foreground&quot;
        disabled
      >
        <Building className=&quot;mr-2 h-4 w-4&quot; />
        <span>No organization selected</span>
      </Button>
    );
  }

  // Styling for current organization
  const orgStyles = getOrgTypeStyles(currentOrganization.type);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant=&quot;outline&quot;
          size=&quot;sm&quot;
          className=&quot;w-[240px] justify-start pl-3&quot;
          disabled={isSwitching}
        >
          <div className=&quot;flex items-center flex-1 space-x-2 overflow-hidden&quot;>
            <Avatar className=&quot;h-5 w-5&quot;>
              <AvatarImage
                src={`https://avatar.vercel.sh/${currentOrganization.id}.png`}
                alt={currentOrganization.name}
              />
              <AvatarFallback className={orgStyles.bgColor}>
                {currentOrganization.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className=&quot;flex-1 overflow-hidden&quot;>
              <p className=&quot;text-sm font-medium truncate&quot;>
                {currentOrganization.name}
              </p>
            </div>
            <ChevronDown className=&quot;h-4 w-4 opacity-50&quot; />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=&quot;w-[240px]&quot; align=&quot;start&quot;>
        <DropdownMenuLabel>Organization Context</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className=&quot;max-h-[300px] overflow-auto&quot;>
          {userOrganizations.map((org) => {
            const isActive = currentOrganization.id === org.id;
            const styles = getOrgTypeStyles(org.type);
            return (
              <DropdownMenuCheckboxItem
                key={org.id}
                checked={isActive}
                onSelect={() => handleSwitchOrg(org.id)}
                disabled={isSwitching}
                className=&quot;cursor-pointer&quot;
              >
                <div className=&quot;flex items-center w-full&quot;>
                  <Avatar className=&quot;h-5 w-5 mr-2&quot;>
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${org.id}.png`}
                      alt={org.name}
                    />
                    <AvatarFallback className={styles.bgColor}>
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className=&quot;flex-1 truncate&quot;>
                    <span className=&quot;text-sm&quot;>{org.name}</span>
                    <div className=&quot;flex items-center space-x-1 mt-0.5&quot;>
                      <span className={`text-xs ${styles.textColor}`}>
                        {org.type}
                      </span>
                      {getOrgTierBadge(org.tier)}
                    </div>
                  </div>
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href=&quot;/settings/organizations&quot;
            className=&quot;cursor-pointer flex w-full items-center&quot;
          >
            <Settings className=&quot;mr-2 h-4 w-4&quot; />
            <span>Manage Organizations</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
