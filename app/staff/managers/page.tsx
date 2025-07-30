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
  Plus,
  UserCog,
  MapPin,
  Calendar,
  Users,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic field managers data with UUID format following architectural guidelines
const fieldManagers = [
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440001&quot;,
    name: &quot;Sarah Johnson&quot;,
    email: &quot;sarah.johnson@company.com&quot;,
    phone: &quot;+1 (555) 123-4567&quot;,
    region: &quot;North Region&quot;,
    teamsManaged: 12,
    activeEvents: 5,
    completionRate: 94,
    rating: 4.8,
    status: &quot;active&quot;,
    lastActive: &quot;2025-06-17T10:30:00Z&quot;,
    joinDate: &quot;2024-03-15&quot;,
    specializations: [
      &quot;Event Management&quot;,
      &quot;Team Leadership&quot;,
      &quot;Client Relations&quot;,
    ],
    recentActivity: &quot;Completed venue setup for TechHub launch event&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440002&quot;,
    name: &quot;Michael Chen&quot;,
    email: &quot;michael.chen@company.com&quot;,
    phone: &quot;+1 (555) 234-5678&quot;,
    region: &quot;South Region&quot;,
    teamsManaged: 8,
    activeEvents: 3,
    completionRate: 96,
    rating: 4.9,
    status: &quot;active&quot;,
    lastActive: &quot;2025-06-17T09:15:00Z&quot;,
    joinDate: &quot;2024-01-20&quot;,
    specializations: [
      &quot;Training Programs&quot;,
      &quot;Quality Assurance&quot;,
      &quot;Performance Optimization&quot;,
    ],
    recentActivity: &quot;Completed training session for new brand agents&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440003&quot;,
    name: &quot;Lisa Rodriguez&quot;,
    email: &quot;lisa.rodriguez@company.com&quot;,
    phone: &quot;+1 (555) 345-6789&quot;,
    region: &quot;East Region&quot;,
    teamsManaged: 15,
    activeEvents: 7,
    completionRate: 92,
    rating: 4.7,
    status: &quot;active&quot;,
    lastActive: &quot;2025-06-17T11:45:00Z&quot;,
    joinDate: &quot;2023-11-10&quot;,
    specializations: [
      &quot;Multi-Site Coordination&quot;,
      &quot;Brand Activation&quot;,
      &quot;Crisis Management&quot;,
    ],
    recentActivity: &quot;Coordinating summer brand activation campaign&quot;,
  },
];

interface FieldManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  teamsManaged: number;
  activeEvents: number;
  completionRate: number;
  rating: number;
  status: string;
  lastActive: string;
  joinDate: string;
  specializations: string[];
  recentActivity: string;
}

const FieldManagerCard = ({
  manager,
  onAction,
}: {
  manager: FieldManager;
  onAction: (action: string, managerId: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;active&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;on_leave&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;;
      case &quot;inactive&quot;:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
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

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex items-center space-x-3&quot;>
            <Avatar className=&quot;h-12 w-12&quot;>
              <AvatarFallback className=&quot;bg-blue-100 text-blue-600 font-semibold&quot;>
                {getInitials(manager.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className=&quot;text-lg&quot;>{manager.name}</CardTitle>
              <CardDescription className=&quot;flex items-center mt-1&quot;>
                <MapPin className=&quot;h-4 w-4 mr-1&quot; />
                {manager.region}
              </CardDescription>
            </div>
          </div>
          <div className=&quot;flex items-center space-x-2&quot;>
            <Badge className={`${getStatusColor(manager.status)} border`}>
              {manager.status.replace(&quot;_&quot;, &quot; &quot;).toUpperCase()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant=&quot;ghost&quot; size=&quot;sm&quot;>
                  <MoreVertical className=&quot;h-4 w-4&quot; />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAction(&quot;view&quot;, manager.id)}>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction(&quot;message&quot;, manager.id)}
                >
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction(&quot;assign&quot;, manager.id)}
                >
                  Assign Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction(&quot;settings&quot;, manager.id)}
                >
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className=&quot;space-y-4&quot;>
        {/* Performance Metrics */}
        <div className=&quot;grid grid-cols-3 gap-4&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>
              {manager.teamsManaged}
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Teams</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>
              {manager.activeEvents}
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Events</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-2xl font-bold text-purple-600&quot;>
              {manager.completionRate}%
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Success</div>
          </div>
        </div>

        {/* Rating */}
        <div className=&quot;flex items-center justify-center space-x-2 py-2 bg-gray-50 rounded-lg&quot;>
          <Star className=&quot;h-4 w-4 text-yellow-500 fill-current&quot; />
          <span className=&quot;font-semibold&quot;>{manager.rating}</span>
          <span className=&quot;text-sm text-muted-foreground&quot;>rating</span>
        </div>

        {/* Contact Info */}
        <div className=&quot;space-y-2&quot;>
          <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
            <Mail className=&quot;h-4 w-4 mr-2&quot; />
            <span className=&quot;truncate&quot;>{manager.email}</span>
          </div>
          <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
            <Phone className=&quot;h-4 w-4 mr-2&quot; />
            <span>{manager.phone}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, manager.id)}
          >
            <UserCog className=&quot;h-4 w-4 mr-1&quot; />
            View
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;message&quot;, manager.id)}
          >
            <MessageSquare className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;assign&quot;, manager.id)}
          >
            <Calendar className=&quot;h-4 w-4&quot; />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function FieldManagersPage() {
  const [searchQuery, setSearchQuery] = useState(&quot;&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const { toast } = useToast();

  const filteredManagers = fieldManagers.filter((manager) => {
    const matchesSearch =
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === &quot;all&quot; || manager.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (action: string, managerId: string) => {
    const manager = fieldManagers.find((m) => m.id === managerId);

    // Event-driven architecture: Publish events for actions
    const eventPayload = {
      eventType: `field_manager_${action}`,
      timestamp: new Date().toISOString(),
      managerId,
      managerName: manager?.name,
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        region: manager?.region,
        currentTeams: manager?.teamsManaged,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Opening Profile&quot;,
          description: `Viewing ${manager?.name}'s detailed profile`,
        });
        break;
      case &quot;message&quot;:
        toast({
          title: &quot;Message Sent&quot;,
          description: `Message initiated with ${manager?.name}`,
        });
        break;
      case &quot;assign&quot;:
        toast({
          title: &quot;Assignment Panel&quot;,
          description: `Opening event assignment for ${manager?.name}`,
        });
        break;
      case &quot;settings&quot;:
        toast({
          title: &quot;Settings&quot;,
          description: `Opening settings for ${manager?.name}`,
        });
        break;
    }
  };

  const totalManagers = fieldManagers.length;
  const activeManagers = fieldManagers.filter(
    (m) => m.status === &quot;active&quot;,
  ).length;
  const averageRating = (
    fieldManagers.reduce((sum, m) => sum + m.rating, 0) / totalManagers
  ).toFixed(1);
  const totalTeams = fieldManagers.reduce((sum, m) => sum + m.teamsManaged, 0);

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Field Managers</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage and oversee field management staff across all regions
          </p>
        </div>
        <Button>
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Add Field Manager
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Managers
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalManagers}</p>
              </div>
              <Users className=&quot;h-8 w-8 text-blue-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Active
                </p>
                <p className=&quot;text-2xl font-bold text-green-600&quot;>
                  {activeManagers}
                </p>
              </div>
              <TrendingUp className=&quot;h-8 w-8 text-green-600&quot; />
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

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Teams Managed
                </p>
                <p className=&quot;text-2xl font-bold text-purple-600&quot;>
                  {totalTeams}
                </p>
              </div>
              <UserCog className=&quot;h-8 w-8 text-purple-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search managers by name, region, or email...&quot;
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=&quot;pl-10&quot;
          />
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button
            variant={statusFilter === &quot;all&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;all&quot;)}
          >
            All
          </Button>
          <Button
            variant={statusFilter === &quot;active&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;active&quot;)}
          >
            Active
          </Button>
        </div>
      </div>

      {/* Managers Grid */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {filteredManagers.map((manager) => (
          <FieldManagerCard
            key={manager.id}
            manager={manager}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredManagers.length === 0 && (
        <div className=&quot;text-center py-12&quot;>
          <UserCog className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>No field managers found</h3>
          <p className=&quot;mt-2 text-muted-foreground">
            Try adjusting your search criteria or add a new field manager.
          </p>
        </div>
      )}
    </div>
  );
}
