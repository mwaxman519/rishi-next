&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  useOrganization,
  UserOrganization,
} from &quot;@/contexts/OrganizationProvider&quot;;
import { Check, ChevronDown, Building2, Settings } from &quot;lucide-react&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from &quot;@/components/ui/dropdown-menu&quot;;

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const {
    userOrganizations,
    currentOrganization,
    switchOrganization,
    isLoading,
  } = useOrganization();
  const [open, setOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  if (isLoading) {
    return <Skeleton className=&quot;h-9 w-[200px] md:w-[250px]&quot; />;
  }

  if (!currentOrganization || userOrganizations.length === 0) {
    return (
      <Button
        variant=&quot;outline&quot;
        className=&quot;min-w-[200px] md:min-w-[250px] justify-start text-muted-foreground&quot;
        disabled
      >
        <Building2 className=&quot;mr-2 h-4 w-4&quot; />
        <span>No organization selected</span>
      </Button>
    );
  }

  const handleOrganizationSelect = async (organizationId: string) => {
    if (currentOrganization?.id === organizationId) return;

    try {
      setIsSwitching(true);
      console.log(`Attempting to switch to organization: ${organizationId}`);
      await switchOrganization(organizationId);
      toast({
        title: &quot;Organization switched&quot;,
        description: &quot;Successfully switched organization context&quot;,
      });
      setOpen(false);
    } catch (error) {
      console.error(&quot;Failed to switch organization:&quot;, error);
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

  // Get organization type specific styles
  const getOrgTypeStyles = (type?: string) => {
    if (!type) {
      return {
        bgColor: &quot;bg-gray-100&quot;,
        textColor: &quot;text-gray-700&quot;,
      };
    }

    switch (type.toLowerCase()) {
      case &quot;internal&quot;:
        return {
          bgColor: &quot;bg-purple-100&quot;,
          textColor: &quot;text-purple-700&quot;,
        };
      case &quot;client&quot;:
        return {
          bgColor: &quot;bg-blue-100&quot;,
          textColor: &quot;text-blue-700&quot;,
        };
      case &quot;partner&quot;:
        return {
          bgColor: &quot;bg-green-100&quot;,
          textColor: &quot;text-green-700&quot;,
        };
      default:
        return {
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

  const orgStyles = getOrgTypeStyles(currentOrganization.type);

  return (
    <div className={className}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant=&quot;outline&quot;
            className=&quot;justify-start min-w-[200px] md:min-w-[250px] pl-3&quot;
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
        <DropdownMenuContent align=&quot;start&quot; className=&quot;w-[250px]&quot;>
          <DropdownMenuLabel>Organization Context</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className=&quot;max-h-[300px] overflow-auto&quot;>
            {userOrganizations.map((org: UserOrganization) => {
              const isActive = currentOrganization?.id === org.id;
              const styles = getOrgTypeStyles(org.type);
              return (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org.id)}
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
                    {isActive && (
                      <Check className=&quot;ml-2 h-4 w-4 text-green-600&quot; />
                    )}
                  </div>
                </DropdownMenuItem>
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
    </div>
  );
}
