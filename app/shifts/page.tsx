&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Plus,
  Filter,
  Search,
} from &quot;lucide-react&quot;;
import { format } from &quot;date-fns&quot;;

interface Shift {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  status: string;
  brand?: { name: string };
  location?: { name: string };
  event?: { title: string };
  organizationId: string;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "&quot;,
    brandId: &quot;&quot;,
    locationId: &quot;&quot;,
    search: &quot;&quot;,
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newShift, setNewShift] = useState({
    title: &quot;&quot;,
    description: &quot;&quot;,
    startDateTime: &quot;&quot;,
    endDateTime: &quot;&quot;,
    locationId: &quot;&quot;,
    brandId: &quot;&quot;,
    organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
  });

  useEffect(() => {
    fetchShifts();
  }, [filters]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
        ...(filters.status && { status: filters.status }),
        ...(filters.brandId && { brandId: filters.brandId }),
        ...(filters.locationId && { locationId: filters.locationId }),
      });

      const response = await fetch(`/api/shifts?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setShifts(data.data || []);
      }
    } catch (error) {
      console.error(&quot;Error fetching shifts:&quot;, error);
    } finally {
      setLoading(false);
    }
  };

  const createShift = async () => {
    try {
      const response = await fetch(&quot;/api/shifts&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          ...newShift,
          startDateTime: new Date(newShift.startDateTime),
          endDateTime: new Date(newShift.endDateTime),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateDialog(false);
        setNewShift({
          title: &quot;&quot;,
          description: &quot;&quot;,
          startDateTime: &quot;&quot;,
          endDateTime: &quot;&quot;,
          locationId: &quot;&quot;,
          brandId: &quot;&quot;,
          organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
        });
        fetchShifts();
      }
    } catch (error) {
      console.error(&quot;Error creating shift:&quot;, error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: &quot;Draft&quot;, variant: &quot;secondary&quot; as const },
      scheduled: { label: &quot;Scheduled&quot;, variant: &quot;default&quot; as const },
      in_progress: { label: &quot;In Progress&quot;, variant: &quot;default&quot; as const },
      completed: { label: &quot;Completed&quot;, variant: &quot;secondary&quot; as const },
      cancelled: { label: &quot;Cancelled&quot;, variant: &quot;destructive&quot; as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredShifts = shifts.filter((shift) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        shift.title.toLowerCase().includes(searchLower) ||
        shift.description?.toLowerCase().includes(searchLower) ||
        shift.brand?.name.toLowerCase().includes(searchLower) ||
        shift.location?.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex justify-between items-center mb-6&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Shift Management</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage workforce shifts and scheduling
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className=&quot;mr-2 h-4 w-4&quot; />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className=&quot;max-w-md&quot;>
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>
                Create a new workforce shift for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className=&quot;space-y-4&quot;>
              <div>
                <Label htmlFor=&quot;title&quot;>Shift Title</Label>
                <Input
                  id=&quot;title&quot;
                  value={newShift.title}
                  onChange={(e) =>
                    setNewShift({ ...newShift, title: e.target.value })
                  }
                  placeholder=&quot;Enter shift title&quot;
                />
              </div>
              <div>
                <Label htmlFor=&quot;description&quot;>Description</Label>
                <Textarea
                  id=&quot;description&quot;
                  value={newShift.description}
                  onChange={(e) =>
                    setNewShift({ ...newShift, description: e.target.value })
                  }
                  placeholder=&quot;Enter shift description&quot;
                />
              </div>
              <div className=&quot;grid grid-cols-2 gap-4&quot;>
                <div>
                  <Label htmlFor=&quot;startDateTime&quot;>Start Date & Time</Label>
                  <Input
                    id=&quot;startDateTime&quot;
                    type=&quot;datetime-local&quot;
                    value={newShift.startDateTime}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        startDateTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor=&quot;endDateTime&quot;>End Date & Time</Label>
                  <Input
                    id=&quot;endDateTime&quot;
                    type=&quot;datetime-local&quot;
                    value={newShift.endDateTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, endDateTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={createShift} className=&quot;w-full&quot;>
                Create Shift
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className=&quot;mb-6&quot;>
        <CardHeader>
          <CardTitle className=&quot;text-lg&quot;>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-4&quot;>
            <div className=&quot;flex-1 min-w-[200px]&quot;>
              <Label htmlFor=&quot;search&quot;>Search</Label>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-2 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                <Input
                  id=&quot;search&quot;
                  placeholder=&quot;Search shifts...&quot;
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className=&quot;pl-8&quot;
                />
              </div>
            </div>
            <div className=&quot;min-w-[150px]&quot;>
              <Label htmlFor=&quot;status&quot;>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder=&quot;All Statuses&quot; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;all&quot;>All Statuses</SelectItem>
                  <SelectItem value=&quot;draft&quot;>Draft</SelectItem>
                  <SelectItem value=&quot;scheduled&quot;>Scheduled</SelectItem>
                  <SelectItem value=&quot;in_progress&quot;>In Progress</SelectItem>
                  <SelectItem value=&quot;completed&quot;>Completed</SelectItem>
                  <SelectItem value=&quot;cancelled&quot;>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className=&quot;animate-pulse&quot;>
              <CardHeader>
                <div className=&quot;h-4 bg-gray-200 rounded w-3/4&quot;></div>
                <div className=&quot;h-3 bg-gray-200 rounded w-1/2&quot;></div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-2&quot;>
                  <div className=&quot;h-3 bg-gray-200 rounded w-full&quot;></div>
                  <div className=&quot;h-3 bg-gray-200 rounded w-2/3&quot;></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShifts.length === 0 ? (
        <Card>
          <CardContent className=&quot;text-center py-12&quot;>
            <Calendar className=&quot;mx-auto h-12 w-12 text-muted-foreground mb-4&quot; />
            <h3 className=&quot;text-lg font-medium mb-2&quot;>No shifts found</h3>
            <p className=&quot;text-muted-foreground mb-4&quot;>
              {filters.search || filters.status
                ? &quot;No shifts match your current filters.&quot;
                : &quot;Create your first shift to get started.&quot;}
            </p>
            {!filters.search && !filters.status && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className=&quot;mr-2 h-4 w-4&quot; />
                Create Shift
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className=&quot;hover:shadow-md transition-shadow&quot;>
              <CardHeader>
                <div className=&quot;flex justify-between items-start&quot;>
                  <div>
                    <CardTitle className=&quot;text-lg&quot;>{shift.title}</CardTitle>
                    <CardDescription>
                      {shift.description || &quot;No description provided&quot;}
                    </CardDescription>
                  </div>
                  {getStatusBadge(shift.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-3&quot;>
                  <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                    <Clock className=&quot;mr-2 h-4 w-4&quot; />
                    <span>
                      {format(new Date(shift.startDateTime), &quot;MMM d, h:mm a&quot;)} -
                      {format(new Date(shift.endDateTime), &quot;h:mm a&quot;)}
                    </span>
                  </div>

                  {shift.location && (
                    <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                      <MapPin className=&quot;mr-2 h-4 w-4&quot; />
                      <span>{shift.location.name}</span>
                    </div>
                  )}

                  {shift.brand && (
                    <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                      <Building2 className=&quot;mr-2 h-4 w-4&quot; />
                      <span>{shift.brand.name}</span>
                    </div>
                  )}

                  {shift.event && (
                    <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                      <Calendar className=&quot;mr-2 h-4 w-4&quot; />
                      <span>Event: {shift.event.title}</span>
                    </div>
                  )}
                </div>

                <div className=&quot;mt-4 flex gap-2&quot;>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;flex-1&quot;>
                    Edit
                  </Button>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;flex-1">
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
