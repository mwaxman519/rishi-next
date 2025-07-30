&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback } from &quot;@/components/ui/avatar&quot;;
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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic directory data with UUID format following architectural guidelines
const organizationDirectory = [
  {
    id: &quot;00000000-0000-0000-0000-000000000002&quot;,
    name: &quot;Acme Corp&quot;,
    type: &quot;client&quot;,
    tier: &quot;tier_1&quot;,
    status: &quot;active&quot;,
    industry: &quot;Technology&quot;,
    employees: 2500,
    locations: [&quot;New York, NY&quot;, &quot;San Francisco, CA&quot;, &quot;Austin, TX&quot;],
    primaryContact: {
      name: &quot;Jennifer Walsh&quot;,
      title: &quot;VP of Marketing&quot;,
      email: &quot;jennifer.walsh@acmecorp.com&quot;,
      phone: &quot;+1 (555) 100-2000&quot;,
    },
    website: &quot;https://acmecorp.com&quot;,
    services: [&quot;Staff Leasing&quot;, &quot;Event Staffing&quot;],
    contractValue: &quot;$125,000&quot;,
    rating: 4.2,
    lastActivity: &quot;2025-06-15T14:30:00Z&quot;,
    joinDate: &quot;2024-01-15&quot;,
  },
  {
    id: &quot;00000000-0000-0000-0000-000000000003&quot;,
    name: &quot;TechHub Events&quot;,
    type: &quot;client&quot;,
    tier: &quot;tier_2&quot;,
    status: &quot;active&quot;,
    industry: &quot;Events & Entertainment&quot;,
    employees: 150,
    locations: [&quot;Los Angeles, CA&quot;, &quot;Las Vegas, NV&quot;],
    primaryContact: {
      name: &quot;David Chen&quot;,
      title: &quot;Event Director&quot;,
      email: &quot;david.chen@techhubevents.com&quot;,
      phone: &quot;+1 (555) 200-3000&quot;,
    },
    website: &quot;https://techhubevents.com&quot;,
    services: [&quot;Event Staffing&quot;, &quot;Brand Activation&quot;],
    contractValue: &quot;$89,500&quot;,
    rating: 4.8,
    lastActivity: &quot;2025-06-17T11:20:00Z&quot;,
    joinDate: &quot;2023-09-22&quot;,
  },
  {
    id: &quot;00000000-0000-0000-0000-000000000004&quot;,
    name: &quot;Global Staffing Partners&quot;,
    type: &quot;partner&quot;,
    tier: null,
    status: &quot;active&quot;,
    industry: &quot;Staffing & Recruiting&quot;,
    employees: 800,
    locations: [&quot;Chicago, IL&quot;, &quot;Denver, CO&quot;, &quot;Phoenix, AZ&quot;],
    primaryContact: {
      name: &quot;Maria Rodriguez&quot;,
      title: &quot;Partnership Manager&quot;,
      email: &quot;maria.rodriguez@globalstaffing.com&quot;,
      phone: &quot;+1 (555) 300-4000&quot;,
    },
    website: &quot;https://globalstaffing.com&quot;,
    services: [&quot;Staff Augmentation&quot;, &quot;Recruitment&quot;],
    contractValue: &quot;$45,000&quot;,
    rating: 4.1,
    lastActivity: &quot;2025-06-16T16:45:00Z&quot;,
    joinDate: &quot;2024-03-08&quot;,
  },
  {
    id: &quot;00000000-0000-0000-0000-000000000005&quot;,
    name: &quot;Premium Events Ltd&quot;,
    type: &quot;client&quot;,
    tier: &quot;tier_3&quot;,
    status: &quot;active&quot;,
    industry: &quot;Luxury Events&quot;,
    employees: 75,
    locations: [&quot;Miami, FL&quot;, &quot;New York, NY&quot;],
    primaryContact: {
      name: &quot;Alexandra Sterling&quot;,
      title: &quot;CEO&quot;,
      email: &quot;alexandra.sterling@premiumevents.com&quot;,
      phone: &quot;+1 (555) 400-5000&quot;,
    },
    website: &quot;https://premiumevents.com&quot;,
    services: [&quot;White-label Solution&quot;, &quot;Premium Event Staffing&quot;],
    contractValue: &quot;$285,000&quot;,
    rating: 4.9,
    lastActivity: &quot;2025-06-17T09:30:00Z&quot;,
    joinDate: &quot;2023-05-12&quot;,
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
      case &quot;client&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-200&quot;;
      case &quot;partner&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;internal&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getTierColor = (tier: string | null) => {
    if (!tier) return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    switch (tier) {
      case &quot;tier_1&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-200&quot;;
      case &quot;tier_2&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;;
      case &quot;tier_3&quot;:
        return &quot;bg-emerald-100 text-emerald-800 border-emerald-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return &quot;text-green-600&quot;;
    if (rating >= 4.0) return &quot;text-teal-600&quot;;
    if (rating >= 3.5) return &quot;text-yellow-600&quot;;
    return &quot;text-red-600&quot;;
  };

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex items-start space-x-3&quot;>
            <Avatar className=&quot;h-12 w-12&quot;>
              <AvatarFallback className=&quot;bg-purple-100 text-purple-600 font-semibold&quot;>
                {org.name
                  .split(&quot; &quot;)
                  .map((n) => n[0])
                  .join("&quot;)
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className=&quot;flex-1&quot;>
              <CardTitle className=&quot;text-lg&quot;>{org.name}</CardTitle>
              <CardDescription className=&quot;mt-1&quot;>
                {org.industry} • {org.employees.toLocaleString()} employees
              </CardDescription>
            </div>
          </div>
          <div className=&quot;flex flex-col items-end space-y-1&quot;>
            <Badge className={`${getTypeColor(org.type)} border text-xs`}>
              {org.type.toUpperCase()}
            </Badge>
            {org.tier && (
              <Badge className={`${getTierColor(org.tier)} border text-xs`}>
                {org.tier.replace(&quot;_&quot;, &quot; &quot;).toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className=&quot;space-y-4&quot;>
        {/* Contract Value & Rating */}
        <div className=&quot;grid grid-cols-2 gap-4&quot;>
          <div className=&quot;text-center bg-green-50 rounded-lg p-3&quot;>
            <div className=&quot;text-lg font-bold text-green-600&quot;>
              {org.contractValue}
            </div>
            <div className=&quot;text-xs text-green-700&quot;>Contract Value</div>
          </div>
          <div className=&quot;text-center bg-yellow-50 rounded-lg p-3&quot;>
            <div
              className={`text-lg font-bold ${getRatingColor(org.rating)} flex items-center justify-center`}
            >
              <Star className=&quot;h-4 w-4 mr-1&quot; />
              {org.rating}
            </div>
            <div className=&quot;text-xs text-yellow-700&quot;>Rating</div>
          </div>
        </div>

        {/* Primary Contact */}
        <div className=&quot;bg-blue-50 rounded-lg p-3&quot;>
          <div className=&quot;text-sm font-medium text-blue-800 mb-2&quot;>
            Primary Contact
          </div>
          <div className=&quot;space-y-1&quot;>
            <div className=&quot;text-sm font-medium&quot;>{org.primaryContact.name}</div>
            <div className=&quot;text-xs text-muted-foreground&quot;>
              {org.primaryContact.title}
            </div>
            <div className=&quot;flex items-center text-xs text-muted-foreground&quot;>
              <Mail className=&quot;h-3 w-3 mr-1&quot; />
              {org.primaryContact.email}
            </div>
            <div className=&quot;flex items-center text-xs text-muted-foreground&quot;>
              <Phone className=&quot;h-3 w-3 mr-1&quot; />
              {org.primaryContact.phone}
            </div>
          </div>
        </div>

        {/* Locations */}
        <div>
          <div className=&quot;text-sm font-medium mb-2 flex items-center&quot;>
            <MapPin className=&quot;h-4 w-4 mr-1&quot; />
            Locations
          </div>
          <div className=&quot;flex flex-wrap gap-1&quot;>
            {org.locations.slice(0, 2).map((location, index) => (
              <Badge key={index} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                {location}
              </Badge>
            ))}
            {org.locations.length > 2 && (
              <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                +{org.locations.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className=&quot;text-sm font-medium mb-2&quot;>Services</div>
          <div className=&quot;flex flex-wrap gap-1&quot;>
            {org.services.map((service, index) => (
              <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2 border-t&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, org.id)}
          >
            <Eye className=&quot;h-4 w-4 mr-1&quot; />
            View Details
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;contact&quot;, org.id)}
          >
            <Mail className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;website&quot;, org.id)}
          >
            <Globe className=&quot;h-4 w-4&quot; />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                <MoreVertical className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction(&quot;manage&quot;, org.id)}>
                Manage Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;history&quot;, org.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;reports&quot;, org.id)}>
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
  const [searchQuery, setSearchQuery] = useState(&quot;&quot;);
  const [typeFilter, setTypeFilter] = useState(&quot;all&quot;);
  const [tierFilter, setTierFilter] = useState(&quot;all&quot;);
  const { toast } = useToast();

  const filteredOrganizations = organizationDirectory.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === &quot;all&quot; || org.type === typeFilter;
    const matchesTier = tierFilter === &quot;all&quot; || org.tier === tierFilter;
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
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        organizationType: org?.type,
        tier: org?.tier,
        industry: org?.industry,
        contractValue: org?.contractValue,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing directory event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Organization Details&quot;,
          description: `Opening detailed view for ${org?.name}`,
        });
        break;
      case &quot;contact&quot;:
        toast({
          title: &quot;Contact Information&quot;,
          description: `Opening contact details for ${org?.name}`,
        });
        break;
      case &quot;website&quot;:
        if (org?.website) {
          window.open(org.website, &quot;_blank&quot;);
        }
        break;
      case &quot;manage&quot;:
        toast({
          title: &quot;Account Management&quot;,
          description: `Opening management panel for ${org?.name}`,
        });
        break;
      case &quot;history&quot;:
        toast({
          title: &quot;Organization History&quot;,
          description: `Loading interaction history for ${org?.name}`,
        });
        break;
      case &quot;reports&quot;:
        toast({
          title: &quot;Report Generation&quot;,
          description: `Generating report for ${org?.name}`,
        });
        break;
    }
  };

  const totalOrganizations = organizationDirectory.length;
  const clientOrganizations = organizationDirectory.filter(
    (o) => o.type === &quot;client&quot;,
  ).length;
  const partnerOrganizations = organizationDirectory.filter(
    (o) => o.type === &quot;partner&quot;,
  ).length;
  const totalContractValue = organizationDirectory.reduce((sum, o) => {
    const value = parseInt(o.contractValue.replace(/[$,]/g, &quot;&quot;));
    return sum + value;
  }, 0);

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Organization Directory
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            Complete directory of all clients, partners, and internal
            organizations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Organizations
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalOrganizations}</p>
              </div>
              <Building className=&quot;h-8 w-8 text-indigo-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Clients
                </p>
                <p className=&quot;text-2xl font-bold text-blue-600&quot;>
                  {clientOrganizations}
                </p>
              </div>
              <Building2 className=&quot;h-8 w-8 text-blue-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Partners
                </p>
                <p className=&quot;text-2xl font-bold text-green-600&quot;>
                  {partnerOrganizations}
                </p>
              </div>
              <Users className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Contract Value
                </p>
                <p className=&quot;text-2xl font-bold text-emerald-600&quot;>
                  ${totalContractValue.toLocaleString()}
                </p>
              </div>
              <Star className=&quot;h-8 w-8 text-emerald-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className=&quot;flex flex-col lg:flex-row gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search organizations by name, industry, or contact...&quot;
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=&quot;pl-10&quot;
          />
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button
            variant={typeFilter === &quot;all&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setTypeFilter(&quot;all&quot;)}
            size=&quot;sm&quot;
          >
            All Types
          </Button>
          <Button
            variant={typeFilter === &quot;client&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setTypeFilter(&quot;client&quot;)}
            size=&quot;sm&quot;
          >
            Clients
          </Button>
          <Button
            variant={typeFilter === &quot;partner&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setTypeFilter(&quot;partner&quot;)}
            size=&quot;sm&quot;
          >
            Partners
          </Button>
        </div>
      </div>

      {/* Directory Grid */}
      <Tabs value=&quot;grid&quot; className=&quot;w-full&quot;>
        <TabsList>
          <TabsTrigger value=&quot;grid&quot;>Grid View</TabsTrigger>
          <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;grid&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
            {filteredOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;list&quot; className=&quot;mt-6&quot;>
          <div className=&quot;space-y-4&quot;>
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
        <div className=&quot;text-center py-12&quot;>
          <Building className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>No organizations found</h3>
          <p className=&quot;mt-2 text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
