/**
 * BA Roster Management Page
 *
 * Comprehensive brand agent roster management interface with assignment
 * tracking, skills management, and real-time roster optimization.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";

interface BrandAgent {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  skills: any[];
  brandAssignments: any[];
  isActive: boolean;
}

interface NewAssignment {
  userId: string;
  brandId: string;
  assignmentRole: string;
  startDate: string;
  endDate?: string;
  territoryIds?: string[];
}

export default function RosterManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    "00000000-0000-0000-0000-000000000001",
  );
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    userId: "",
    brandId: "",
    assignmentRole: "primary",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Fetch brand agents from API
  const {
    data: brandAgents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brand-agents", selectedOrganization, selectedBrand],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId: selectedOrganization,
      });

      if (selectedBrand) {
        params.append("brandId", selectedBrand);
      }

      const response = await fetch(`/api/roster/brand-agents?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch brand agents");
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: !!selectedOrganization,
  });

  // Fetch organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await fetch("/api/organizations/user");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      return await response.json();
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: NewAssignment) => {
      const response = await fetch("/api/roster/brand-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to create assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-agents"] });
      setShowAssignmentDialog(false);
      setNewAssignment({
        userId: "",
        brandId: "",
        assignmentRole: "primary",
        startDate: new Date().toISOString().split("T")[0],
      });
      toast({
        title: "Assignment Created",
        description: "Brand agent has been successfully assigned.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter agents based on search
  const filteredAgents = brandAgents.filter((agent: BrandAgent) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${agent.firstName || ""} ${agent.lastName || ""}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      agent.email.toLowerCase().includes(searchLower)
    );
  });

  // Calculate roster metrics
  const rosterMetrics = {
    totalAgents: brandAgents.length,
    activeAssignments: brandAgents.reduce(
      (sum: number, agent: BrandAgent) => sum + agent.brandAssignments.length,
      0,
    ),
    skillsCoverage: brandAgents.reduce(
      (sum: number, agent: BrandAgent) => sum + agent.skills.length,
      0,
    ),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brand Agent Roster
          </h1>
          <p className="text-muted-foreground">
            Manage brand agent assignments, skills, and territory coverage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog
            open={showAssignmentDialog}
            onOpenChange={setShowAssignmentDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Agent to Brand</DialogTitle>
                <DialogDescription>
                  Create a new brand agent assignment with role and territory
                  specifications.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role-select">Assignment Role</Label>
                  <Select
                    value={newAssignment.assignmentRole}
                    onValueChange={(value) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        assignmentRole: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Agent</SelectItem>
                      <SelectItem value="backup">Backup Agent</SelectItem>
                      <SelectItem value="seasonal">Seasonal Agent</SelectItem>
                      <SelectItem value="temporary">Temporary Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newAssignment.startDate}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newAssignment.endDate || ""}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        endDate: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignmentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      createAssignmentMutation.mutate(newAssignment)
                    }
                    disabled={createAssignmentMutation.isPending}
                  >
                    {createAssignmentMutation.isPending
                      ? "Creating..."
                      : "Create Assignment"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roster Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rosterMetrics.totalAgents}
            </div>
            <p className="text-xs text-muted-foreground">Active brand agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Assignments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rosterMetrics.activeAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              Current brand assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skills Coverage
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rosterMetrics.skillsCoverage}
            </div>
            <p className="text-xs text-muted-foreground">
              Total skills tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Brands</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Agent Assignments</CardTitle>
          <CardDescription>
            Current roster with assignment details and skills overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-muted-foreground">
                Failed to load brand agents
              </p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No agents found matching your criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent: BrandAgent) => (
                <div
                  key={agent.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {agent.firstName?.charAt(0) ||
                        agent.email.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {agent.firstName && agent.lastName
                            ? `${agent.firstName} ${agent.lastName}`
                            : agent.email}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {agent.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {agent.brandAssignments.map((assignment, index) => (
                          <Badge key={index} variant="secondary">
                            {assignment.role}
                          </Badge>
                        ))}
                        {agent.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {agent.brandAssignments.length} assignments
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {agent.skills.length} skills
                      </span>
                      {agent.phone && <span>{agent.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
