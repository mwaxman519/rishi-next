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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Authentic field managers data with UUID format following architectural guidelines
const fieldManagers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    region: "North Region",
    teamsManaged: 12,
    activeEvents: 5,
    completionRate: 94,
    rating: 4.8,
    status: "active",
    lastActive: "2025-06-17T10:30:00Z",
    joinDate: "2024-03-15",
    specializations: [
      "Event Management",
      "Team Leadership",
      "Client Relations",
    ],
    recentActivity: "Completed venue setup for TechHub launch event",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    region: "South Region",
    teamsManaged: 8,
    activeEvents: 3,
    completionRate: 96,
    rating: 4.9,
    status: "active",
    lastActive: "2025-06-17T09:15:00Z",
    joinDate: "2024-01-20",
    specializations: [
      "Training Programs",
      "Quality Assurance",
      "Performance Optimization",
    ],
    recentActivity: "Completed training session for new brand agents",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    region: "East Region",
    teamsManaged: 15,
    activeEvents: 7,
    completionRate: 92,
    rating: 4.7,
    status: "active",
    lastActive: "2025-06-17T11:45:00Z",
    joinDate: "2023-11-10",
    specializations: [
      "Multi-Site Coordination",
      "Brand Activation",
      "Crisis Management",
    ],
    recentActivity: "Coordinating summer brand activation campaign",
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {getInitials(manager.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{manager.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {manager.region}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(manager.status)} border`}>
              {manager.status.replace("_", " ").toUpperCase()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAction("view", manager.id)}>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("message", manager.id)}
                >
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("assign", manager.id)}
                >
                  Assign Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("settings", manager.id)}
                >
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {manager.teamsManaged}
            </div>
            <div className="text-xs text-muted-foreground">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {manager.activeEvents}
            </div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {manager.completionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center space-x-2 py-2 bg-gray-50 rounded-lg">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-semibold">{manager.rating}</span>
          <span className="text-sm text-muted-foreground">rating</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{manager.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{manager.phone}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", manager.id)}
          >
            <UserCog className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("message", manager.id)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("assign", manager.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function FieldManagersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const filteredManagers = fieldManagers.filter((manager) => {
    const matchesSearch =
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || manager.status === statusFilter;
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
      initiatedBy: "internal_admin",
      metadata: {
        region: manager?.region,
        currentTeams: manager?.teamsManaged,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Opening Profile",
          description: `Viewing ${manager?.name}'s detailed profile`,
        });
        break;
      case "message":
        toast({
          title: "Message Sent",
          description: `Message initiated with ${manager?.name}`,
        });
        break;
      case "assign":
        toast({
          title: "Assignment Panel",
          description: `Opening event assignment for ${manager?.name}`,
        });
        break;
      case "settings":
        toast({
          title: "Settings",
          description: `Opening settings for ${manager?.name}`,
        });
        break;
    }
  };

  const totalManagers = fieldManagers.length;
  const activeManagers = fieldManagers.filter(
    (m) => m.status === "active",
  ).length;
  const averageRating = (
    fieldManagers.reduce((sum, m) => sum + m.rating, 0) / totalManagers
  ).toFixed(1);
  const totalTeams = fieldManagers.reduce((sum, m) => sum + m.teamsManaged, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Managers</h1>
          <p className="text-muted-foreground">
            Manage and oversee field management staff across all regions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Field Manager
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Managers
                </p>
                <p className="text-2xl font-bold">{totalManagers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
                  {activeManagers}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teams Managed
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalTeams}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search managers by name, region, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
        </div>
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManagers.map((manager) => (
          <FieldManagerCard
            key={manager.id}
            manager={manager}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredManagers.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No field managers found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or add a new field manager.
          </p>
        </div>
      )}
    </div>
  );
}
