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
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  MessageSquare,
  MoreVertical,
  Star,
  Calendar,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Authentic contacts data with UUID format following architectural guidelines
const contactsData = [
  {
    id: "990e8400-e29b-41d4-a716-446655440001",
    name: "Jennifer Walsh",
    title: "VP of Marketing",
    organizationId: "00000000-0000-0000-0000-000000000002",
    organization: "Acme Corp",
    email: "jennifer.walsh@acmecorp.com",
    phone: "+1 (555) 100-2000",
    mobile: "+1 (555) 100-2001",
    location: "New York, NY",
    department: "Marketing",
    type: "primary",
    status: "active",
    lastContact: "2025-06-15T14:30:00Z",
    preferredContact: "email",
    timezone: "EST",
    notes: "Prefers morning meetings. Key decision maker for event staffing.",
    tags: ["Decision Maker", "Marketing", "Events"],
    rating: 4.2,
    interactions: 23,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440002",
    name: "David Chen",
    title: "Event Director",
    organizationId: "00000000-0000-0000-0000-000000000003",
    organization: "TechHub Events",
    email: "david.chen@techhubevents.com",
    phone: "+1 (555) 200-3000",
    mobile: "+1 (555) 200-3001",
    location: "Los Angeles, CA",
    department: "Operations",
    type: "primary",
    status: "active",
    lastContact: "2025-06-17T11:20:00Z",
    preferredContact: "phone",
    timezone: "PST",
    notes: "Responsive and detail-oriented. Handles large-scale tech events.",
    tags: ["Operations", "Tech Events", "Responsive"],
    rating: 4.8,
    interactions: 45,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440003",
    name: "Maria Rodriguez",
    title: "Partnership Manager",
    organizationId: "00000000-0000-0000-0000-000000000004",
    organization: "Global Staffing Partners",
    email: "maria.rodriguez@globalstaffing.com",
    phone: "+1 (555) 300-4000",
    mobile: "+1 (555) 300-4001",
    location: "Chicago, IL",
    department: "Partnerships",
    type: "primary",
    status: "active",
    lastContact: "2025-06-16T16:45:00Z",
    preferredContact: "email",
    timezone: "CST",
    notes:
      "Strategic partner for staff augmentation. Weekly check-ins scheduled.",
    tags: ["Partnership", "Strategic", "Weekly Meetings"],
    rating: 4.1,
    interactions: 31,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440004",
    name: "Alexandra Sterling",
    title: "CEO",
    organizationId: "00000000-0000-0000-0000-000000000005",
    organization: "Premium Events Ltd",
    email: "alexandra.sterling@premiumevents.com",
    phone: "+1 (555) 400-5000",
    mobile: "+1 (555) 400-5001",
    location: "Miami, FL",
    department: "Executive",
    type: "executive",
    status: "active",
    lastContact: "2025-06-17T09:30:00Z",
    preferredContact: "phone",
    timezone: "EST",
    notes:
      "High-value client. Prefers direct communication for premium services.",
    tags: ["Executive", "High Value", "Premium"],
    rating: 4.9,
    interactions: 18,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440005",
    name: "Robert Kim",
    title: "Operations Manager",
    organizationId: "00000000-0000-0000-0000-000000000002",
    organization: "Acme Corp",
    email: "robert.kim@acmecorp.com",
    phone: "+1 (555) 100-3000",
    mobile: "+1 (555) 100-3001",
    location: "San Francisco, CA",
    department: "Operations",
    type: "secondary",
    status: "active",
    lastContact: "2025-06-14T10:15:00Z",
    preferredContact: "email",
    timezone: "PST",
    notes: "Handles day-to-day operations. Good for logistics coordination.",
    tags: ["Operations", "Logistics", "Detail-oriented"],
    rating: 4.0,
    interactions: 19,
  },
];

interface Contact {
  id: string;
  name: string;
  title: string;
  organizationId: string;
  organization: string;
  email: string;
  phone: string;
  mobile: string;
  location: string;
  department: string;
  type: string;
  status: string;
  lastContact: string;
  preferredContact: string;
  timezone: string;
  notes: string;
  tags: string[];
  rating: number;
  interactions: number;
}

const ContactCard = ({
  contact,
  onAction,
}: {
  contact: Contact;
  onAction: (action: string, contactId: string) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "primary":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "executive":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "secondary":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-teal-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const formatLastContact = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{contact.name}</CardTitle>
              <CardDescription className="mt-1">
                {contact.title}
              </CardDescription>
              <div className="flex items-center mt-1">
                <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {contact.organization}
                </span>
              </div>
            </div>
          </div>
          <Badge className={`${getTypeColor(contact.type)} border text-xs`}>
            {contact.type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-teal-500" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-green-500" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            <span>{contact.location}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-yellow-50 rounded-lg p-3">
            <div
              className={`text-lg font-bold ${getRatingColor(contact.rating)} flex items-center justify-center`}
            >
              <Star className="h-4 w-4 mr-1" />
              {contact.rating}
            </div>
            <div className="text-xs text-yellow-700">Rating</div>
          </div>
          <div className="text-center bg-teal-50 rounded-lg p-3">
            <div className="text-lg font-bold text-teal-600">
              {contact.interactions}
            </div>
            <div className="text-xs text-teal-700">Interactions</div>
          </div>
        </div>

        {/* Last Contact */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Last Contact</p>
              <p className="text-xs text-muted-foreground">
                {formatLastContact(contact.lastContact)}
              </p>
            </div>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-sm font-medium mb-2">Tags</div>
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Notes Preview */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 mb-1">Notes</div>
          <p className="text-xs text-blue-700 line-clamp-2">{contact.notes}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", contact.id)}
          >
            <User className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("email", contact.id)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("call", contact.id)}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => onAction("schedule", contact.id)}
              >
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("history", contact.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("edit", contact.id)}>
                Edit Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const { toast } = useToast();

  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    const matchesOrg =
      organizationFilter === "all" ||
      contact.organization === organizationFilter;
    return matchesSearch && matchesType && matchesOrg;
  });

  const handleAction = async (action: string, contactId: string) => {
    const contact = contactsData.find((c) => c.id === contactId);

    // Event-driven architecture: Publish events for contact actions
    const eventPayload = {
      eventType: `contact_${action}`,
      timestamp: new Date().toISOString(),
      contactId,
      contactName: contact?.name,
      organizationId: contact?.organizationId,
      initiatedBy: "internal_admin",
      metadata: {
        contactType: contact?.type,
        organization: contact?.organization,
        preferredContact: contact?.preferredContact,
        department: contact?.department,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing contact event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Contact Details",
          description: `Opening detailed view for ${contact?.name}`,
        });
        break;
      case "email":
        if (contact?.email) {
          window.location.href = `mailto:${contact.email}`;
        }
        break;
      case "call":
        toast({
          title: "Initiating Call",
          description: `Calling ${contact?.name} at ${contact?.phone}`,
        });
        break;
      case "schedule":
        toast({
          title: "Schedule Meeting",
          description: `Opening calendar to schedule meeting with ${contact?.name}`,
        });
        break;
      case "history":
        toast({
          title: "Interaction History",
          description: `Loading interaction history for ${contact?.name}`,
        });
        break;
      case "edit":
        toast({
          title: "Edit Contact",
          description: `Opening edit form for ${contact?.name}`,
        });
        break;
    }
  };

  const totalContacts = contactsData.length;
  const primaryContacts = contactsData.filter(
    (c) => c.type === "primary",
  ).length;
  const executiveContacts = contactsData.filter(
    (c) => c.type === "executive",
  ).length;
  const averageRating = (
    contactsData.reduce((sum, c) => sum + c.rating, 0) / totalContacts
  ).toFixed(1);

  const uniqueOrganizations = [
    ...new Set(contactsData.map((c) => c.organization)),
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage and maintain relationships with key contacts across all
            organizations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contacts
                </p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <User className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Primary Contacts
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {primaryContacts}
                </p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Executives
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {executiveContacts}
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {averageRating}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, organization, title, or email..."
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
            variant={typeFilter === "primary" ? "default" : "outline"}
            onClick={() => setTypeFilter("primary")}
            size="sm"
          >
            Primary
          </Button>
          <Button
            variant={typeFilter === "executive" ? "default" : "outline"}
            onClick={() => setTypeFilter("executive")}
            size="sm"
          >
            Executive
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <Tabs value="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
