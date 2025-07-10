"use client";

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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Authentic brand agents data with UUID format following architectural guidelines
const brandAgents = [
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "Taylor Martinez",
    email: "taylor.martinez@company.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    fieldManager: "Sarah Johnson",
    fieldManagerId: "550e8400-e29b-41d4-a716-446655440001",
    eventsCompleted: 39,
    activeEvents: 2,
    rating: 4.6,
    status: "active",
    availability: "busy",
    lastActive: "2025-06-17T10:30:00Z",
    joinDate: "2024-03-15",
    skills: ["Product Demo", "Customer Engagement", "Retail Sales", "Spanish"],
    certifications: ["Retail Excellence", "Customer Service Pro"],
    recentActivity: "Completed product demo event at Downtown Mall",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440002",
    name: "Amanda Lewis",
    email: "amanda.lewis@company.com",
    phone: "+1 (555) 234-5678",
    location: "Portland, OR",
    fieldManager: "Michael Chen",
    fieldManagerId: "550e8400-e29b-41d4-a716-446655440002",
    eventsCompleted: 5,
    activeEvents: 1,
    rating: 4.8,
    status: "on_leave",
    availability: "unavailable",
    lastActive: "2025-06-15T16:20:00Z",
    joinDate: "2024-05-08",
    skills: ["Brand Activation", "Event Coordination", "Social Media"],
    certifications: ["Brand Ambassador Pro"],
    recentActivity: "On medical leave - returning July 1st",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440003",
    name: "Hannah Wilson",
    email: "hannah.wilson@company.com",
    phone: "+1 (555) 345-6789",
    location: "Denver, CO",
    fieldManager: "Lisa Rodriguez",
    fieldManagerId: "550e8400-e29b-41d4-a716-446655440003",
    eventsCompleted: 16,
    activeEvents: 1,
    rating: 3.6,
    status: "active",
    availability: "busy",
    lastActive: "2025-06-17T11:45:00Z",
    joinDate: "2023-11-10",
    skills: ["Trade Shows", "B2B Networking", "Presentation"],
    certifications: ["Professional Development"],
    recentActivity: "Attending corporate trade show this week",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440004",
    name: "Justin Moore",
    email: "justin.moore@company.com",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    fieldManager: "Sarah Johnson",
    fieldManagerId: "550e8400-e29b-41d4-a716-446655440001",
    eventsCompleted: 12,
    activeEvents: 0,
    rating: 4.3,
    status: "active",
    availability: "available",
    lastActive: "2025-06-17T09:15:00Z",
    joinDate: "2024-01-20",
    skills: ["Fashion Retail", "Visual Merchandising", "Customer Consultation"],
    certifications: ["Retail Sales", "Visual Display"],
    recentActivity: "Available for new assignments",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440005",
    name: "Nicole Lee",
    email: "nicole.lee@company.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    fieldManager: "Lisa Rodriguez",
    fieldManagerId: "550e8400-e29b-41d4-a716-446655440003",
    eventsCompleted: 26,
    activeEvents: 3,
    rating: 3.8,
    status: "active",
    availability: "busy",
    lastActive: "2025-06-17T12:00:00Z",
    joinDate: "2023-08-05",
    skills: ["Tech Products", "Product Training", "Customer Support"],
    certifications: ["Tech Specialist", "Customer Excellence"],
    recentActivity: "Managing multiple tech product launches",
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
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "on_leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
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
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {agent.location}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={`${getStatusColor(agent.status)} border text-xs`}>
              {agent.status.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge
              className={`${getAvailabilityColor(agent.availability)} border text-xs`}
            >
              {agent.availability.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {agent.eventsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {agent.activeEvents}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getRatingColor(agent.rating)}`}
            >
              {agent.rating}
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>

        {/* Field Manager */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Field Manager</p>
              <p className="text-sm text-blue-600">{agent.fieldManager}</p>
            </div>
            <BadgeCheck className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="text-sm font-medium mb-2">Core Skills</div>
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {agent.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Recent: </span>
            {agent.recentActivity}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", agent.id)}
          >
            <BadgeCheck className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("message", agent.id)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("assign", agent.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction("schedule", agent.id)}>
                View Schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction("performance", agent.id)}
              >
                Performance Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("training", agent.id)}>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
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
      statusFilter === "all" || agent.status === statusFilter;
    const matchesAvailability =
      availabilityFilter === "all" || agent.availability === availabilityFilter;
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
      initiatedBy: "internal_admin",
      metadata: {
        location: agent?.location,
        currentStatus: agent?.status,
        availability: agent?.availability,
        rating: agent?.rating,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Opening Profile",
          description: `Viewing ${agent?.name}'s detailed profile`,
        });
        break;
      case "message":
        toast({
          title: "Message Initiated",
          description: `Starting conversation with ${agent?.name}`,
        });
        break;
      case "assign":
        toast({
          title: "Assignment Panel",
          description: `Opening event assignment for ${agent?.name}`,
        });
        break;
      case "schedule":
        toast({
          title: "Schedule View",
          description: `Loading ${agent?.name}'s schedule`,
        });
        break;
      case "performance":
        toast({
          title: "Performance Review",
          description: `Opening performance metrics for ${agent?.name}`,
        });
        break;
      case "training":
        toast({
          title: "Training Records",
          description: `Accessing training history for ${agent?.name}`,
        });
        break;
    }
  };

  const totalAgents = brandAgents.length;
  const activeAgents = brandAgents.filter((a) => a.status === "active").length;
  const availableAgents = brandAgents.filter(
    (a) => a.availability === "available",
  ).length;
  const averageRating = (
    brandAgents.reduce((sum, a) => sum + a.rating, 0) / totalAgents
  ).toFixed(1);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Agents</h1>
          <p className="text-muted-foreground">
            Manage and oversee brand agents across all locations and events
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Agents
                </p>
                <p className="text-2xl font-bold">{totalAgents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeAgents}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {availableAgents}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
            placeholder="Search agents by name, location, manager, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={availabilityFilter === "available" ? "default" : "outline"}
            onClick={() => setAvailabilityFilter("available")}
            size="sm"
          >
            Available
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <BrandAgentCard
            key={agent.id}
            agent={agent}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No brand agents found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or add a new brand agent.
          </p>
        </div>
      )}
    </div>
  );
}
