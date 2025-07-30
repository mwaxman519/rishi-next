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
  BadgeCheck,
  MapPin,
  Calendar,
  Users,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  Award,
  Activity,
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic brand agents data with UUID format following architectural guidelines
const brandAgents = [
  {
    id: &quot;660e8400-e29b-41d4-a716-446655440001&quot;,
    name: &quot;Taylor Martinez&quot;,
    email: &quot;taylor.martinez@company.com&quot;,
    phone: &quot;+1 (555) 123-4567&quot;,
    location: &quot;Los Angeles, CA&quot;,
    fieldManager: &quot;Sarah Johnson&quot;,
    fieldManagerId: &quot;550e8400-e29b-41d4-a716-446655440001&quot;,
    eventsCompleted: 39,
    activeEvents: 2,
    rating: 4.6,
    status: &quot;active&quot;,
    availability: &quot;busy&quot;,
    lastActive: &quot;2025-06-17T10:30:00Z&quot;,
    joinDate: &quot;2024-03-15&quot;,
    skills: [&quot;Product Demo&quot;, &quot;Customer Engagement&quot;, &quot;Retail Sales&quot;, &quot;Spanish&quot;],
    certifications: [&quot;Retail Excellence&quot;, &quot;Customer Service Pro&quot;],
    recentActivity: &quot;Completed product demo event at Downtown Mall&quot;,
  },
  {
    id: &quot;660e8400-e29b-41d4-a716-446655440002&quot;,
    name: &quot;Amanda Lewis&quot;,
    email: &quot;amanda.lewis@company.com&quot;,
    phone: &quot;+1 (555) 234-5678&quot;,
    location: &quot;Portland, OR&quot;,
    fieldManager: &quot;Michael Chen&quot;,
    fieldManagerId: &quot;550e8400-e29b-41d4-a716-446655440002&quot;,
    eventsCompleted: 5,
    activeEvents: 1,
    rating: 4.8,
    status: &quot;on_leave&quot;,
    availability: &quot;unavailable&quot;,
    lastActive: &quot;2025-06-15T16:20:00Z&quot;,
    joinDate: &quot;2024-05-08&quot;,
    skills: [&quot;Brand Activation&quot;, &quot;Event Coordination&quot;, &quot;Social Media&quot;],
    certifications: [&quot;Brand Ambassador Pro&quot;],
    recentActivity: &quot;On medical leave - returning July 1st&quot;,
  },
  {
    id: &quot;660e8400-e29b-41d4-a716-446655440003&quot;,
    name: &quot;Hannah Wilson&quot;,
    email: &quot;hannah.wilson@company.com&quot;,
    phone: &quot;+1 (555) 345-6789&quot;,
    location: &quot;Denver, CO&quot;,
    fieldManager: &quot;Lisa Rodriguez&quot;,
    fieldManagerId: &quot;550e8400-e29b-41d4-a716-446655440003&quot;,
    eventsCompleted: 16,
    activeEvents: 1,
    rating: 3.6,
    status: &quot;active&quot;,
    availability: &quot;busy&quot;,
    lastActive: &quot;2025-06-17T11:45:00Z&quot;,
    joinDate: &quot;2023-11-10&quot;,
    skills: [&quot;Trade Shows&quot;, &quot;B2B Networking&quot;, &quot;Presentation&quot;],
    certifications: [&quot;Professional Development&quot;],
    recentActivity: &quot;Attending corporate trade show this week&quot;,
  },
  {
    id: &quot;660e8400-e29b-41d4-a716-446655440004&quot;,
    name: &quot;Justin Moore&quot;,
    email: &quot;justin.moore@company.com&quot;,
    phone: &quot;+1 (555) 456-7890&quot;,
    location: &quot;Chicago, IL&quot;,
    fieldManager: &quot;Sarah Johnson&quot;,
    fieldManagerId: &quot;550e8400-e29b-41d4-a716-446655440001&quot;,
    eventsCompleted: 12,
    activeEvents: 0,
    rating: 4.3,
    status: &quot;active&quot;,
    availability: &quot;available&quot;,
    lastActive: &quot;2025-06-17T09:15:00Z&quot;,
    joinDate: &quot;2024-01-20&quot;,
    skills: [&quot;Fashion Retail&quot;, &quot;Visual Merchandising&quot;, &quot;Customer Consultation&quot;],
    certifications: [&quot;Retail Sales&quot;, &quot;Visual Display&quot;],
    recentActivity: &quot;Available for new assignments&quot;,
  },
  {
    id: &quot;660e8400-e29b-41d4-a716-446655440005&quot;,
    name: &quot;Nicole Lee&quot;,
    email: &quot;nicole.lee@company.com&quot;,
    phone: &quot;+1 (555) 567-8901&quot;,
    location: &quot;Boston, MA&quot;,
    fieldManager: &quot;Lisa Rodriguez&quot;,
    fieldManagerId: &quot;550e8400-e29b-41d4-a716-446655440003&quot;,
    eventsCompleted: 26,
    activeEvents: 3,
    rating: 3.8,
    status: &quot;active&quot;,
    availability: &quot;busy&quot;,
    lastActive: &quot;2025-06-17T12:00:00Z&quot;,
    joinDate: &quot;2023-08-05&quot;,
    skills: [&quot;Tech Products&quot;, &quot;Product Training&quot;, &quot;Customer Support&quot;],
    certifications: [&quot;Tech Specialist&quot;, &quot;Customer Excellence&quot;],
    recentActivity: &quot;Managing multiple tech product launches&quot;,
  },
];

interface BrandAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  fieldManager: string;
  fieldManagerId: string;
  eventsCompleted: number;
  activeEvents: number;
  rating: number;
  status: string;
  availability: string;
  lastActive: string;
  joinDate: string;
  skills: string[];
  certifications: string[];
  recentActivity: string;
}

const BrandAgentCard = ({
  agent,
  onAction,
}: {
  agent: BrandAgent;
  onAction: (action: string, agentId: string) => void;
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case &quot;available&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;busy&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-200&quot;;
      case &quot;unavailable&quot;:
        return &quot;bg-red-100 text-red-800 border-red-200&quot;;
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
    if (rating >= 4.0) return &quot;text-blue-600&quot;;
    if (rating >= 3.5) return &quot;text-yellow-600&quot;;
    return &quot;text-red-600&quot;;
  };

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex items-center space-x-3&quot;>
            <Avatar className=&quot;h-12 w-12&quot;>
              <AvatarFallback className=&quot;bg-purple-100 text-purple-600 font-semibold&quot;>
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className=&quot;text-lg&quot;>{agent.name}</CardTitle>
              <CardDescription className=&quot;flex items-center mt-1&quot;>
                <MapPin className=&quot;h-4 w-4 mr-1&quot; />
                {agent.location}
              </CardDescription>
            </div>
          </div>
          <div className=&quot;flex flex-col items-end space-y-1&quot;>
            <Badge className={`${getStatusColor(agent.status)} border text-xs`}>
              {agent.status.replace(&quot;_&quot;, &quot; &quot;).toUpperCase()}
            </Badge>
            <Badge
              className={`${getAvailabilityColor(agent.availability)} border text-xs`}
            >
              {agent.availability.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className=&quot;space-y-4&quot;>
        {/* Performance Metrics */}
        <div className=&quot;grid grid-cols-3 gap-4&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>
              {agent.eventsCompleted}
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Completed</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-2xl font-bold text-orange-600&quot;>
              {agent.activeEvents}
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Active</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div
              className={`text-2xl font-bold ${getRatingColor(agent.rating)}`}
            >
              {agent.rating}
            </div>
            <div className=&quot;text-xs text-muted-foreground&quot;>Rating</div>
          </div>
        </div>

        {/* Field Manager */}
        <div className=&quot;bg-blue-50 rounded-lg p-3&quot;>
          <div className=&quot;flex items-center justify-between&quot;>
            <div>
              <p className=&quot;text-sm font-medium text-blue-800&quot;>Field Manager</p>
              <p className=&quot;text-sm text-blue-600&quot;>{agent.fieldManager}</p>
            </div>
            <BadgeCheck className=&quot;h-5 w-5 text-blue-600&quot; />
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className=&quot;text-sm font-medium mb-2&quot;>Core Skills</div>
          <div className=&quot;flex flex-wrap gap-1&quot;>
            {agent.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                {skill}
              </Badge>
            ))}
            {agent.skills.length > 3 && (
              <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                +{agent.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className=&quot;pt-2 border-t&quot;>
          <div className=&quot;text-sm text-muted-foreground&quot;>
            <span className=&quot;font-medium&quot;>Recent: </span>
            {agent.recentActivity}
          </div>
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, agent.id)}
          >
            <BadgeCheck className=&quot;h-4 w-4 mr-1&quot; />
            View
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;message&quot;, agent.id)}
          >
            <MessageSquare className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;assign&quot;, agent.id)}
          >
            <Calendar className=&quot;h-4 w-4&quot; />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                <MoreVertical className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction(&quot;schedule&quot;, agent.id)}>
                View Schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction(&quot;performance&quot;, agent.id)}
              >
                Performance Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;training&quot;, agent.id)}>
                Training Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default function BrandAgentsPage() {
  const [searchQuery, setSearchQuery] = useState(&quot;&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [availabilityFilter, setAvailabilityFilter] = useState(&quot;all&quot;);
  const { toast } = useToast();

  const filteredAgents = brandAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.fieldManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === &quot;all&quot; || agent.status === statusFilter;
    const matchesAvailability =
      availabilityFilter === &quot;all&quot; || agent.availability === availabilityFilter;
    return matchesSearch && matchesStatus && matchesAvailability;
  });

  const handleAction = async (action: string, agentId: string) => {
    const agent = brandAgents.find((a) => a.id === agentId);

    // Event-driven architecture: Publish events for actions
    const eventPayload = {
      eventType: `brand_agent_${action}`,
      timestamp: new Date().toISOString(),
      agentId,
      agentName: agent?.name,
      fieldManagerId: agent?.fieldManagerId,
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        location: agent?.location,
        currentStatus: agent?.status,
        availability: agent?.availability,
        rating: agent?.rating,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Opening Profile&quot;,
          description: `Viewing ${agent?.name}'s detailed profile`,
        });
        break;
      case &quot;message&quot;:
        toast({
          title: &quot;Message Initiated&quot;,
          description: `Starting conversation with ${agent?.name}`,
        });
        break;
      case &quot;assign&quot;:
        toast({
          title: &quot;Assignment Panel&quot;,
          description: `Opening event assignment for ${agent?.name}`,
        });
        break;
      case &quot;schedule&quot;:
        toast({
          title: &quot;Schedule View&quot;,
          description: `Loading ${agent?.name}'s schedule`,
        });
        break;
      case &quot;performance&quot;:
        toast({
          title: &quot;Performance Review&quot;,
          description: `Opening performance metrics for ${agent?.name}`,
        });
        break;
      case &quot;training&quot;:
        toast({
          title: &quot;Training Records&quot;,
          description: `Accessing training history for ${agent?.name}`,
        });
        break;
    }
  };

  const totalAgents = brandAgents.length;
  const activeAgents = brandAgents.filter((a) => a.status === &quot;active&quot;).length;
  const availableAgents = brandAgents.filter(
    (a) => a.availability === &quot;available&quot;,
  ).length;
  const averageRating = (
    brandAgents.reduce((sum, a) => sum + a.rating, 0) / totalAgents
  ).toFixed(1);

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Brand Agents</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage and oversee brand agents across all locations and events
          </p>
        </div>
        <Button>
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Add Brand Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Agents
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalAgents}</p>
              </div>
              <Users className=&quot;h-8 w-8 text-purple-600&quot; />
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
                  {activeAgents}
                </p>
              </div>
              <Activity className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Available
                </p>
                <p className=&quot;text-2xl font-bold text-blue-600&quot;>
                  {availableAgents}
                </p>
              </div>
              <TrendingUp className=&quot;h-8 w-8 text-blue-600&quot; />
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
            placeholder=&quot;Search agents by name, location, manager, or skills...&quot;
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=&quot;pl-10&quot;
          />
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button
            variant={statusFilter === &quot;all&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;all&quot;)}
            size=&quot;sm&quot;
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === &quot;active&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;active&quot;)}
            size=&quot;sm&quot;
          >
            Active
          </Button>
          <Button
            variant={availabilityFilter === &quot;available&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setAvailabilityFilter(&quot;available&quot;)}
            size=&quot;sm&quot;
          >
            Available
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
        {filteredAgents.map((agent) => (
          <BrandAgentCard
            key={agent.id}
            agent={agent}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className=&quot;text-center py-12&quot;>
          <BadgeCheck className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>No brand agents found</h3>
          <p className=&quot;mt-2 text-muted-foreground">
            Try adjusting your search criteria or add a new brand agent.
          </p>
        </div>
      )}
    </div>
  );
}
