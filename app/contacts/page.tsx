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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic contacts data with UUID format following architectural guidelines
const contactsData = [
  {
    id: &quot;990e8400-e29b-41d4-a716-446655440001&quot;,
    name: &quot;Jennifer Walsh&quot;,
    title: &quot;VP of Marketing&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000002&quot;,
    organization: &quot;Acme Corp&quot;,
    email: &quot;jennifer.walsh@acmecorp.com&quot;,
    phone: &quot;+1 (555) 100-2000&quot;,
    mobile: &quot;+1 (555) 100-2001&quot;,
    location: &quot;New York, NY&quot;,
    department: &quot;Marketing&quot;,
    type: &quot;primary&quot;,
    status: &quot;active&quot;,
    lastContact: &quot;2025-06-15T14:30:00Z&quot;,
    preferredContact: &quot;email&quot;,
    timezone: &quot;EST&quot;,
    notes: &quot;Prefers morning meetings. Key decision maker for event staffing.&quot;,
    tags: [&quot;Decision Maker&quot;, &quot;Marketing&quot;, &quot;Events&quot;],
    rating: 4.2,
    interactions: 23,
  },
  {
    id: &quot;990e8400-e29b-41d4-a716-446655440002&quot;,
    name: &quot;David Chen&quot;,
    title: &quot;Event Director&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000003&quot;,
    organization: &quot;TechHub Events&quot;,
    email: &quot;david.chen@techhubevents.com&quot;,
    phone: &quot;+1 (555) 200-3000&quot;,
    mobile: &quot;+1 (555) 200-3001&quot;,
    location: &quot;Los Angeles, CA&quot;,
    department: &quot;Operations&quot;,
    type: &quot;primary&quot;,
    status: &quot;active&quot;,
    lastContact: &quot;2025-06-17T11:20:00Z&quot;,
    preferredContact: &quot;phone&quot;,
    timezone: &quot;PST&quot;,
    notes: &quot;Responsive and detail-oriented. Handles large-scale tech events.&quot;,
    tags: [&quot;Operations&quot;, &quot;Tech Events&quot;, &quot;Responsive&quot;],
    rating: 4.8,
    interactions: 45,
  },
  {
    id: &quot;990e8400-e29b-41d4-a716-446655440003&quot;,
    name: &quot;Maria Rodriguez&quot;,
    title: &quot;Partnership Manager&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000004&quot;,
    organization: &quot;Global Staffing Partners&quot;,
    email: &quot;maria.rodriguez@globalstaffing.com&quot;,
    phone: &quot;+1 (555) 300-4000&quot;,
    mobile: &quot;+1 (555) 300-4001&quot;,
    location: &quot;Chicago, IL&quot;,
    department: &quot;Partnerships&quot;,
    type: &quot;primary&quot;,
    status: &quot;active&quot;,
    lastContact: &quot;2025-06-16T16:45:00Z&quot;,
    preferredContact: &quot;email&quot;,
    timezone: &quot;CST&quot;,
    notes:
      &quot;Strategic partner for staff augmentation. Weekly check-ins scheduled.&quot;,
    tags: [&quot;Partnership&quot;, &quot;Strategic&quot;, &quot;Weekly Meetings&quot;],
    rating: 4.1,
    interactions: 31,
  },
  {
    id: &quot;990e8400-e29b-41d4-a716-446655440004&quot;,
    name: &quot;Alexandra Sterling&quot;,
    title: &quot;CEO&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000005&quot;,
    organization: &quot;Premium Events Ltd&quot;,
    email: &quot;alexandra.sterling@premiumevents.com&quot;,
    phone: &quot;+1 (555) 400-5000&quot;,
    mobile: &quot;+1 (555) 400-5001&quot;,
    location: &quot;Miami, FL&quot;,
    department: &quot;Executive&quot;,
    type: &quot;executive&quot;,
    status: &quot;active&quot;,
    lastContact: &quot;2025-06-17T09:30:00Z&quot;,
    preferredContact: &quot;phone&quot;,
    timezone: &quot;EST&quot;,
    notes:
      &quot;High-value client. Prefers direct communication for premium services.&quot;,
    tags: [&quot;Executive&quot;, &quot;High Value&quot;, &quot;Premium&quot;],
    rating: 4.9,
    interactions: 18,
  },
  {
    id: &quot;990e8400-e29b-41d4-a716-446655440005&quot;,
    name: &quot;Robert Kim&quot;,
    title: &quot;Operations Manager&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000002&quot;,
    organization: &quot;Acme Corp&quot;,
    email: &quot;robert.kim@acmecorp.com&quot;,
    phone: &quot;+1 (555) 100-3000&quot;,
    mobile: &quot;+1 (555) 100-3001&quot;,
    location: &quot;San Francisco, CA&quot;,
    department: &quot;Operations&quot;,
    type: &quot;secondary&quot;,
    status: &quot;active&quot;,
    lastContact: &quot;2025-06-14T10:15:00Z&quot;,
    preferredContact: &quot;email&quot;,
    timezone: &quot;PST&quot;,
    notes: &quot;Handles day-to-day operations. Good for logistics coordination.&quot;,
    tags: [&quot;Operations&quot;, &quot;Logistics&quot;, &quot;Detail-oriented&quot;],
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
      case &quot;primary&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-200&quot;;
      case &quot;executive&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-200&quot;;
      case &quot;secondary&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(&quot; &quot;)
      .map((n) => n[0])
      .join("&quot;)
      .toUpperCase();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return &quot;text-green-600&quot;;
    if (rating >= 4.0) return &quot;text-teal-600&quot;;
    if (rating >= 3.5) return &quot;text-yellow-600&quot;;
    return &quot;text-red-600&quot;;
  };

  const formatLastContact = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return &quot;Yesterday&quot;;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex items-start space-x-3&quot;>
            <Avatar className=&quot;h-12 w-12&quot;>
              <AvatarFallback className=&quot;bg-purple-100 text-purple-600 font-semibold&quot;>
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className=&quot;flex-1&quot;>
              <CardTitle className=&quot;text-lg&quot;>{contact.name}</CardTitle>
              <CardDescription className=&quot;mt-1&quot;>
                {contact.title}
              </CardDescription>
              <div className=&quot;flex items-center mt-1&quot;>
                <Building className=&quot;h-3 w-3 mr-1 text-muted-foreground&quot; />
                <span className=&quot;text-sm text-muted-foreground&quot;>
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

      <CardContent className=&quot;space-y-4&quot;>
        {/* Contact Information */}
        <div className=&quot;grid grid-cols-1 gap-2&quot;>
          <div className=&quot;flex items-center text-sm&quot;>
            <Mail className=&quot;h-4 w-4 mr-2 text-teal-500&quot; />
            <span className=&quot;truncate&quot;>{contact.email}</span>
          </div>
          <div className=&quot;flex items-center text-sm&quot;>
            <Phone className=&quot;h-4 w-4 mr-2 text-green-500&quot; />
            <span>{contact.phone}</span>
          </div>
          <div className=&quot;flex items-center text-sm&quot;>
            <MapPin className=&quot;h-4 w-4 mr-2 text-red-500&quot; />
            <span>{contact.location}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className=&quot;grid grid-cols-2 gap-4&quot;>
          <div className=&quot;text-center bg-yellow-50 rounded-lg p-3&quot;>
            <div
              className={`text-lg font-bold ${getRatingColor(contact.rating)} flex items-center justify-center`}
            >
              <Star className=&quot;h-4 w-4 mr-1&quot; />
              {contact.rating}
            </div>
            <div className=&quot;text-xs text-yellow-700&quot;>Rating</div>
          </div>
          <div className=&quot;text-center bg-teal-50 rounded-lg p-3&quot;>
            <div className=&quot;text-lg font-bold text-teal-600&quot;>
              {contact.interactions}
            </div>
            <div className=&quot;text-xs text-teal-700&quot;>Interactions</div>
          </div>
        </div>

        {/* Last Contact */}
        <div className=&quot;bg-gray-50 rounded-lg p-3&quot;>
          <div className=&quot;flex items-center justify-between&quot;>
            <div>
              <p className=&quot;text-sm font-medium&quot;>Last Contact</p>
              <p className=&quot;text-xs text-muted-foreground&quot;>
                {formatLastContact(contact.lastContact)}
              </p>
            </div>
            <Calendar className=&quot;h-4 w-4 text-gray-500&quot; />
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className=&quot;text-sm font-medium mb-2&quot;>Tags</div>
          <div className=&quot;flex flex-wrap gap-1&quot;>
            {contact.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 2 && (
              <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                +{contact.tags.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Notes Preview */}
        <div className=&quot;bg-blue-50 rounded-lg p-3&quot;>
          <div className=&quot;text-sm font-medium text-blue-800 mb-1&quot;>Notes</div>
          <p className=&quot;text-xs text-blue-700 line-clamp-2&quot;>{contact.notes}</p>
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2 border-t&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, contact.id)}
          >
            <User className=&quot;h-4 w-4 mr-1&quot; />
            View
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;email&quot;, contact.id)}
          >
            <Mail className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;call&quot;, contact.id)}
          >
            <Phone className=&quot;h-4 w-4&quot; />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                <MoreVertical className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => onAction(&quot;schedule&quot;, contact.id)}
              >
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;history&quot;, contact.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;edit&quot;, contact.id)}>
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
  const [searchQuery, setSearchQuery] = useState(&quot;&quot;);
  const [typeFilter, setTypeFilter] = useState(&quot;all&quot;);
  const [organizationFilter, setOrganizationFilter] = useState(&quot;all&quot;);
  const { toast } = useToast();

  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === &quot;all&quot; || contact.type === typeFilter;
    const matchesOrg =
      organizationFilter === &quot;all&quot; ||
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
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        contactType: contact?.type,
        organization: contact?.organization,
        preferredContact: contact?.preferredContact,
        department: contact?.department,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing contact event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Contact Details&quot;,
          description: `Opening detailed view for ${contact?.name}`,
        });
        break;
      case &quot;email&quot;:
        if (contact?.email) {
          window.location.href = `mailto:${contact.email}`;
        }
        break;
      case &quot;call&quot;:
        toast({
          title: &quot;Initiating Call&quot;,
          description: `Calling ${contact?.name} at ${contact?.phone}`,
        });
        break;
      case &quot;schedule&quot;:
        toast({
          title: &quot;Schedule Meeting&quot;,
          description: `Opening calendar to schedule meeting with ${contact?.name}`,
        });
        break;
      case &quot;history&quot;:
        toast({
          title: &quot;Interaction History&quot;,
          description: `Loading interaction history for ${contact?.name}`,
        });
        break;
      case &quot;edit&quot;:
        toast({
          title: &quot;Edit Contact&quot;,
          description: `Opening edit form for ${contact?.name}`,
        });
        break;
    }
  };

  const totalContacts = contactsData.length;
  const primaryContacts = contactsData.filter(
    (c) => c.type === &quot;primary&quot;,
  ).length;
  const executiveContacts = contactsData.filter(
    (c) => c.type === &quot;executive&quot;,
  ).length;
  const averageRating = (
    contactsData.reduce((sum, c) => sum + c.rating, 0) / totalContacts
  ).toFixed(1);

  const uniqueOrganizations = [
    ...new Set(contactsData.map((c) => c.organization)),
  ];

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Contacts</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage and maintain relationships with key contacts across all
            organizations
          </p>
        </div>
        <Button>
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Contacts
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalContacts}</p>
              </div>
              <User className=&quot;h-8 w-8 text-indigo-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Primary Contacts
                </p>
                <p className=&quot;text-2xl font-bold text-blue-600&quot;>
                  {primaryContacts}
                </p>
              </div>
              <Star className=&quot;h-8 w-8 text-blue-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Executives
                </p>
                <p className=&quot;text-2xl font-bold text-purple-600&quot;>
                  {executiveContacts}
                </p>
              </div>
              <Building className=&quot;h-8 w-8 text-purple-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Avg Rating
                </p>
                <p className=&quot;text-2xl font-bold text-yellow-600&quot;>
                  {averageRating}
                </p>
              </div>
              <Star className=&quot;h-8 w-8 text-yellow-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className=&quot;flex flex-col lg:flex-row gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search contacts by name, organization, title, or email...&quot;
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
            variant={typeFilter === &quot;primary&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setTypeFilter(&quot;primary&quot;)}
            size=&quot;sm&quot;
          >
            Primary
          </Button>
          <Button
            variant={typeFilter === &quot;executive&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setTypeFilter(&quot;executive&quot;)}
            size=&quot;sm&quot;
          >
            Executive
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <Tabs value=&quot;grid&quot; className=&quot;w-full&quot;>
        <TabsList>
          <TabsTrigger value=&quot;grid&quot;>Grid View</TabsTrigger>
          <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;grid&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;list&quot; className=&quot;mt-6&quot;>
          <div className=&quot;space-y-4&quot;>
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
        <div className=&quot;text-center py-12&quot;>
          <User className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>No contacts found</h3>
          <p className=&quot;mt-2 text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
