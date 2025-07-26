"use client";

import React, { useState } from "react";
import {
  useOrganization,
  UserOrganization,
} from "@/contexts/OrganizationProvider";
import { Check, ChevronDown, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    return <Skeleton className="h-9 w-[200px] md:w-[250px]" />;
  }

  if (!currentOrganization || userOrganizations.length === 0) {
    return (
      <Button
        variant="outline"
        className="min-w-[200px] md:min-w-[250px] justify-start text-muted-foreground"
        disabled
      >
        <Building2 className="mr-2 h-4 w-4" />
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
        title: "Organization switched",
        description: "Successfully switched organization context",
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to switch organization:", error);
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

  // Get organization type specific styles
  const getOrgTypeStyles = (type?: string) => {
    if (!type) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    }

    switch (type.toLowerCase()) {
      case "internal":
        return {
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
        };
      case "client":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      case "partner":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      default:
        return {
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

  const orgStyles = getOrgTypeStyles(currentOrganization.type);

  return (
    <div className={className}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-start min-w-[200px] md:min-w-[250px] pl-3"
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
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>Organization Context</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="max-h-[300px] overflow-auto">
            {userOrganizations.map((org: UserOrganization) => {
              const isActive = currentOrganization?.id === org.id;
              const styles = getOrgTypeStyles(org.type);
              return (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org.id)}
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
                    {isActive && (
                      <Check className="ml-2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </DropdownMenuItem>
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
    </div>
  );
}
