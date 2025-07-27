"use client";

import { useState } from "react";
import {
  Building,
  ChevronDown,
  Check,
  LogOut,
  Users,
  Settings,
  Briefcase,
  BuildingIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganization } from "@/contexts/OrganizationProvider";
import { toast } from "@/hooks/use-toast";

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
        icon: <BuildingIcon className="h-4 w-4 text-gray-500" />,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    }

    switch (type.toLowerCase()) {
      case "internal":
        return {
          icon: <Building className="h-4 w-4 text-purple-500" />,
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
        };
      case "client":
        return {
          icon: <Briefcase className="h-4 w-4 text-blue-500" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      case "partner":
        return {
          icon: <Users className="h-4 w-4 text-green-500" />,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      default:
        return {
          icon: <BuildingIcon className="h-4 w-4 text-gray-500" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
    }
  };

  // Function to get organization tier badge
  const getOrgTierBadge = (tier?: string | null) => {
    if (!tier) return null;

    const tierColors: Record<string, string> = {
      "1": "bg-gray-100 text-gray-800",
      "2": "bg-blue-100 text-blue-800",
      "3": "bg-purple-100 text-purple-800",
    };

    const tierNames: Record<string, string> = {
      "1": "Tier 1",
      "2": "Tier 2",
      "3": "Tier 3",
    };

    const bgColor = tierColors[tier] || "bg-gray-100 text-gray-800";
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
        title: "Organization switched",
        description: "Successfully switched organization context",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error switching organization:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to switch organization",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Return placeholder during initial load
  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-[240px] justify-start opacity-70"
        disabled
      >
        <div className="h-4 w-4 mr-2 rounded animate-pulse bg-muted"></div>
        <div className="h-4 w-32 rounded animate-pulse bg-muted"></div>
      </Button>
    );
  }

  // If no current organization
  if (!currentOrganization) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-[240px] justify-start text-muted-foreground"
        disabled
      >
        <Building className="mr-2 h-4 w-4" />
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
          variant="outline"
          size="sm"
          className="w-[240px] justify-start pl-3"
          disabled={isSwitching}
        >
          <div className="flex items-center flex-1 space-x-2 overflow-hidden">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${currentOrganization.id}.png`}
                alt={currentOrganization.name}
              />
              <AvatarFallback className={orgStyles.bgColor}>
                {currentOrganization.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {currentOrganization.name}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel>Organization Context</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-auto">
          {userOrganizations.map((org) => {
            const isActive = currentOrganization.id === org.id;
            const styles = getOrgTypeStyles(org.type);
            return (
              <DropdownMenuCheckboxItem
                key={org.id}
                checked={isActive}
                onSelect={() => handleSwitchOrg(org.id)}
                disabled={isSwitching}
                className="cursor-pointer"
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${org.id}.png`}
                      alt={org.name}
                    />
                    <AvatarFallback className={styles.bgColor}>
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <span className="text-sm">{org.name}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
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
            href="/settings/organizations"
            className="cursor-pointer flex w-full items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Manage Organizations</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
