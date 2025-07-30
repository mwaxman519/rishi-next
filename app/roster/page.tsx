/**
 * BA Roster Management Page
 *
 * Comprehensive brand agent roster management interface with assignment
 * tracking, skills management, and real-time roster optimization.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
} from &quot;lucide-react&quot;;

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
    &quot;00000000-0000-0000-0000-000000000001&quot;,
  );
  const [selectedBrand, setSelectedBrand] = useState<string>("&quot;);
  const [searchTerm, setSearchTerm] = useState<string>(&quot;&quot;);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    userId: &quot;&quot;,
    brandId: &quot;&quot;,
    assignmentRole: &quot;primary&quot;,
    startDate: new Date().toISOString().split(&quot;T&quot;)[0],
  });

  // Fetch brand agents from API
  const {
    data: brandAgents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [&quot;brand-agents&quot;, selectedOrganization, selectedBrand],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId: selectedOrganization,
      });

      if (selectedBrand) {
        params.append(&quot;brandId&quot;, selectedBrand);
      }

      const response = await fetch(`/api/roster/brand-agents?${params}`);
      if (!response.ok) {
        throw new Error(&quot;Failed to fetch brand agents&quot;);
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: !!selectedOrganization,
  });

  // Fetch organizations
  const { data: organizations = [] } = useQuery({
    queryKey: [&quot;organizations&quot;],
    queryFn: async () => {
      const response = await fetch(&quot;/api/organizations/user&quot;);
      if (!response.ok) throw new Error(&quot;Failed to fetch organizations&quot;);
      return await response.json();
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: NewAssignment) => {
      const response = await fetch(&quot;/api/roster/brand-agents&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || &quot;Failed to create assignment&quot;);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;brand-agents&quot;] });
      setShowAssignmentDialog(false);
      setNewAssignment({
        userId: &quot;&quot;,
        brandId: &quot;&quot;,
        assignmentRole: &quot;primary&quot;,
        startDate: new Date().toISOString().split(&quot;T&quot;)[0],
      });
      toast({
        title: &quot;Assignment Created&quot;,
        description: &quot;Brand agent has been successfully assigned.&quot;,
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Assignment Failed&quot;,
        description: error.message,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Filter agents based on search
  const filteredAgents = brandAgents.filter((agent: BrandAgent) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${agent.firstName || &quot;&quot;} ${agent.lastName || &quot;&quot;}`.toLowerCase();

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
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Page Header */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Brand Agent Roster
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage brand agent assignments, skills, and territory coverage
          </p>
        </div>
        <div className=&quot;flex items-center space-x-2&quot;>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
            <Download className=&quot;h-4 w-4 mr-2&quot; />
            Export
          </Button>
          <Dialog
            open={showAssignmentDialog}
            onOpenChange={setShowAssignmentDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
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
              <div className=&quot;space-y-4&quot;>
                <div>
                  <Label htmlFor=&quot;role-select&quot;>Assignment Role</Label>
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
                      <SelectItem value=&quot;primary&quot;>Primary Agent</SelectItem>
                      <SelectItem value=&quot;backup&quot;>Backup Agent</SelectItem>
                      <SelectItem value=&quot;seasonal&quot;>Seasonal Agent</SelectItem>
                      <SelectItem value=&quot;temporary&quot;>Temporary Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor=&quot;start-date&quot;>Start Date</Label>
                  <Input
                    id=&quot;start-date&quot;
                    type=&quot;date&quot;
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
                  <Label htmlFor=&quot;end-date&quot;>End Date (Optional)</Label>
                  <Input
                    id=&quot;end-date&quot;
                    type=&quot;date&quot;
                    value={newAssignment.endDate || &quot;&quot;}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        endDate: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                <div className=&quot;flex justify-end space-x-2&quot;>
                  <Button
                    variant=&quot;outline&quot;
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
                      ? &quot;Creating...&quot;
                      : &quot;Create Assignment&quot;}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roster Metrics */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Agents</CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {rosterMetrics.totalAgents}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Active brand agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Active Assignments
            </CardTitle>
            <CheckCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {rosterMetrics.activeAssignments}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Current brand assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Skills Coverage
            </CardTitle>
            <Star className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {rosterMetrics.skillsCoverage}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Total skills tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className=&quot;pt-6&quot;>
          <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
            <div className=&quot;flex-1&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-2 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                <Input
                  placeholder=&quot;Search agents by name or email...&quot;
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=&quot;pl-8&quot;
                />
              </div>
            </div>
            <div className=&quot;flex gap-2&quot;>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className=&quot;w-[180px]&quot;>
                  <SelectValue placeholder=&quot;Filter by brand&quot; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;&quot;>All Brands</SelectItem>
                </SelectContent>
              </Select>
              <Button variant=&quot;outline&quot; size=&quot;icon&quot;>
                <Filter className=&quot;h-4 w-4&quot; />
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
            <div className=&quot;space-y-4&quot;>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className=&quot;flex items-center space-x-4 p-4 border rounded-lg&quot;
                >
                  <div className=&quot;w-12 h-12 bg-gray-200 rounded-full animate-pulse&quot; />
                  <div className=&quot;flex-1 space-y-2&quot;>
                    <div className=&quot;h-4 bg-gray-200 rounded animate-pulse&quot; />
                    <div className=&quot;h-3 bg-gray-200 rounded animate-pulse w-2/3&quot; />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className=&quot;text-center py-8&quot;>
              <AlertCircle className=&quot;h-8 w-8 text-red-500 mx-auto mb-2&quot; />
              <p className=&quot;text-muted-foreground&quot;>
                Failed to load brand agents
              </p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className=&quot;text-center py-8&quot;>
              <Users className=&quot;h-8 w-8 text-muted-foreground mx-auto mb-2&quot; />
              <p className=&quot;text-muted-foreground&quot;>
                No agents found matching your criteria
              </p>
            </div>
          ) : (
            <div className=&quot;space-y-4&quot;>
              {filteredAgents.map((agent: BrandAgent) => (
                <div
                  key={agent.id}
                  className=&quot;flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50&quot;
                >
                  <div className=&quot;w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center&quot;>
                    <span className=&quot;text-blue-600 font-semibold&quot;>
                      {agent.firstName?.charAt(0) ||
                        agent.email.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className=&quot;flex-1&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <div>
                        <h3 className=&quot;font-semibold&quot;>
                          {agent.firstName && agent.lastName
                            ? `${agent.firstName} ${agent.lastName}`
                            : agent.email}
                        </h3>
                        <p className=&quot;text-sm text-muted-foreground&quot;>
                          {agent.email}
                        </p>
                      </div>
                      <div className=&quot;flex items-center space-x-2&quot;>
                        {agent.brandAssignments.map((assignment, index) => (
                          <Badge key={index} variant=&quot;secondary&quot;>
                            {assignment.role}
                          </Badge>
                        ))}
                        {agent.isActive ? (
                          <Badge variant=&quot;default&quot;>Active</Badge>
                        ) : (
                          <Badge variant=&quot;secondary&quot;>Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className=&quot;mt-2 flex items-center space-x-4 text-sm text-muted-foreground&quot;>
                      <span className=&quot;flex items-center&quot;>
                        <Users className=&quot;h-3 w-3 mr-1&quot; />
                        {agent.brandAssignments.length} assignments
                      </span>
                      <span className=&quot;flex items-center&quot;>
                        <Star className=&quot;h-3 w-3 mr-1" />
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
