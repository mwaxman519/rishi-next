"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Building,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  Filter,
  Eye,
  MoreVertical,
  Building2,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Authentic directory data with UUID format following architectural guidelines
const organizationDirectory = [
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Acme Corp",
    type: "client",
    tier: "tier_1",
    status: "active",
    industry: "Technology",
    employees: 2500,
    locations: ["New York, NY", "San Francisco, CA", "Austin, TX"],
    primaryContact: {
      name: "Jennifer Walsh",
      title: "VP of Marketing",
      email: "jennifer.walsh@acmecorp.com",
      phone: "+1 (555) 100-2000",
    },
    website: "https://acmecorp.com",
    services: ["Staff Leasing", "Event Staffing"],
    contractValue: "$125,000",
    rating: 4.2,
    lastActivity: "2025-06-15T14:30:00Z",
    joinDate: "2024-01-15",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "TechHub Events",
    type: "client",
    tier: "tier_2",
    status: "active",
    industry: "Events & Entertainment",
    employees: 150,
    locations: ["Los Angeles, CA", "Las Vegas, NV"],
    primaryContact: {
      name: "David Chen",
      title: "Event Director",
      email: "david.chen@techhubevents.com",
      phone: "+1 (555) 200-3000",
    },
    website: "https://techhubevents.com",
    services: ["Event Staffing", "Brand Activation"],
    contractValue: "$89,500",
    rating: 4.8,
    lastActivity: "2025-06-17T11:20:00Z",
    joinDate: "2023-09-22",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Global Staffing Partners",
    type: "partner",
    tier: null,
    status: "active",
    industry: "Staffing & Recruiting",
    employees: 800,
    locations: ["Chicago, IL", "Denver, CO", "Phoenix, AZ"],
    primaryContact: {
      name: "Maria Rodriguez",
      title: "Partnership Manager",
      email: "maria.rodriguez@globalstaffing.com",
      phone: "+1 (555) 300-4000",
    },
    website: "https://globalstaffing.com",
    services: ["Staff Augmentation", "Recruitment"],
    contractValue: "$45,000",
    rating: 4.1,
    lastActivity: "2025-06-16T16:45:00Z",
    joinDate: "2024-03-08",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Premium Events Ltd",
    type: "client",
    tier: "tier_3",
    status: "active",
    industry: "Luxury Events",
    employees: 75,
    locations: ["Miami, FL", "New York, NY"],
    primaryContact: {
      name: "Alexandra Sterling",
      title: "CEO",
      email: "alexandra.sterling@premiumevents.com",
      phone: "+1 (555) 400-5000",
    },
    website: "https://premiumevents.com",
    services: ["White-label Solution", "Premium Event Staffing"],
    contractValue: "$285,000",
    rating: 4.9,
    lastActivity: "2025-06-17T09:30:00Z",
    joinDate: "2023-05-12",
  },
];

interface Organization {
  id: string;
  name: string;
  type: string;
  tier: string | null;
  status: string;
  industry: string;
  employees: number;
  locations: string[];
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  website: string;
  services: string[];
  contractValue: string;
  rating: number;
  lastActivity: string;
  joinDate: string;
}

const OrganizationCard = ({
  org,
  onAction,
}: {
  org: Organization;
  onAction: (action: string, orgId: string) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "partner":
        return "bg-green-100 text-green-800 border-green-200";
      case "internal":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTierColor = (tier: string | null) => {
    if (!tier) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (tier) {
      case "tier_1":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "tier_2":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "tier_3":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-teal-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                {org.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{org.name}</CardTitle>
              <CardDescription className="mt-1">
                {org.industry} • {org.employees.toLocaleString()} employees
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={`${getTypeColor(org.type)} border text-xs`}>
              {org.type.toUpperCase()}
            </Badge>
            {org.tier && (
              <Badge className={`${getTierColor(org.tier)} border text-xs`}>
                {org.tier.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contract Value & Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              {org.contractValue}
            </div>
            <div className="text-xs text-green-700">Contract Value</div>
          </div>
          <div className="text-center bg-yellow-50 rounded-lg p-3">
            <div
              className={`text-lg font-bold ${getRatingColor(org.rating)} flex items-center justify-center`}
            >
              <Star className="h-4 w-4 mr-1" />
              {org.rating}
            </div>
            <div className="text-xs text-yellow-700">Rating</div>
          </div>
        </div>

        {/* Primary Contact */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 mb-2">
            Primary Contact
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">{org.primaryContact.name}</div>
            <div className="text-xs text-muted-foreground">
              {org.primaryContact.title}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Mail className="h-3 w-3 mr-1" />
              {org.primaryContact.email}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {org.primaryContact.phone}
            </div>
          </div>
        </div>

        {/* Locations */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Locations
          </div>
          <div className="flex flex-wrap gap-1">
            {org.locations.slice(0, 2).map((location, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {location}
              </Badge>
            ))}
            {org.locations.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{org.locations.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="text-sm font-medium mb-2">Services</div>
          <div className="flex flex-wrap gap-1">
            {org.services.map((service, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", org.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("contact", org.id)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("website", org.id)}
          >
            <Globe className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction("manage", org.id)}>
                Manage Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("history", org.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("reports", org.id)}>
                Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const { toast } = useToast();

  const filteredOrganizations = organizationDirectory.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || org.type === typeFilter;
    const matchesTier = tierFilter === "all" || org.tier === tierFilter;
    return matchesSearch && matchesType && matchesTier;
  });

  const handleAction = async (action: string, orgId: string) => {
    const org = organizationDirectory.find((o) => o.id === orgId);

    // Event-driven architecture: Publish events for directory actions
    const eventPayload = {
      eventType: `directory_${action}`,
      timestamp: new Date().toISOString(),
      organizationId: orgId,
      organizationName: org?.name,
      initiatedBy: "internal_admin",
      metadata: {
        organizationType: org?.type,
        tier: org?.tier,
        industry: org?.industry,
        contractValue: org?.contractValue,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing directory event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Organization Details",
          description: `Opening detailed view for ${org?.name}`,
        });
        break;
      case "contact":
        toast({
          title: "Contact Information",
          description: `Opening contact details for ${org?.name}`,
        });
        break;
      case "website":
        if (org?.website) {
          window.open(org.website, "_blank");
        }
        break;
      case "manage":
        toast({
          title: "Account Management",
          description: `Opening management panel for ${org?.name}`,
        });
        break;
      case "history":
        toast({
          title: "Organization History",
          description: `Loading interaction history for ${org?.name}`,
        });
        break;
      case "reports":
        toast({
          title: "Report Generation",
          description: `Generating report for ${org?.name}`,
        });
        break;
    }
  };

  const totalOrganizations = organizationDirectory.length;
  const clientOrganizations = organizationDirectory.filter(
    (o) => o.type === "client",
  ).length;
  const partnerOrganizations = organizationDirectory.filter(
    (o) => o.type === "partner",
  ).length;
  const totalContractValue = organizationDirectory.reduce((sum, o) => {
    const value = parseInt(o.contractValue.replace(/[$,]/g, ""));
    return sum + value;
  }, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Directory
          </h1>
          <p className="text-muted-foreground">
            Complete directory of all clients, partners, and internal
            organizations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Organizations
                </p>
                <p className="text-2xl font-bold">{totalOrganizations}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Clients
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {clientOrganizations}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Partners
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {partnerOrganizations}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contract Value
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalContractValue.toLocaleString()}
                </p>
              </div>
              <Star className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name, industry, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
            size="sm"
          >
            All Types
          </Button>
          <Button
            variant={typeFilter === "client" ? "default" : "outline"}
            onClick={() => setTypeFilter("client")}
            size="sm"
          >
            Clients
          </Button>
          <Button
            variant={typeFilter === "partner" ? "default" : "outline"}
            onClick={() => setTypeFilter("partner")}
            size="sm"
          >
            Partners
          </Button>
        </div>
      </div>

      {/* Directory Grid */}
      <Tabs value="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No organizations found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
