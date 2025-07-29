"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";

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
    status: "",
    brandId: "",
    locationId: "",
    search: "",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newShift, setNewShift] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    locationId: "",
    brandId: "",
    organizationId: "00000000-0000-0000-0000-000000000001",
  });

  useEffect(() => {
    fetchShifts();
  }, [filters]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        organizationId: "00000000-0000-0000-0000-000000000001",
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
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createShift = async () => {
    try {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          title: "",
          description: "",
          startDateTime: "",
          endDateTime: "",
          locationId: "",
          brandId: "",
          organizationId: "00000000-0000-0000-0000-000000000001",
        });
        fetchShifts();
      }
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      scheduled: { label: "Scheduled", variant: "default" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "secondary" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-muted-foreground">
            Manage workforce shifts and scheduling
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>
                Create a new workforce shift for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Shift Title</Label>
                <Input
                  id="title"
                  value={newShift.title}
                  onChange={(e) =>
                    setNewShift({ ...newShift, title: e.target.value })
                  }
                  placeholder="Enter shift title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newShift.description}
                  onChange={(e) =>
                    setNewShift({ ...newShift, description: e.target.value })
                  }
                  placeholder="Enter shift description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDateTime">Start Date & Time</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
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
                  <Label htmlFor="endDateTime">End Date & Time</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={newShift.endDateTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, endDateTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={createShift} className="w-full">
                Create Shift
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search shifts..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-8"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No shifts found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.status
                ? "No shifts match your current filters."
                : "Create your first shift to get started."}
            </p>
            {!filters.search && !filters.status && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Shift
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{shift.title}</CardTitle>
                    <CardDescription>
                      {shift.description || "No description provided"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(shift.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(shift.startDateTime), "MMM d, h:mm a")} -
                      {format(new Date(shift.endDateTime), "h:mm a")}
                    </span>
                  </div>

                  {shift.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{shift.location.name}</span>
                    </div>
                  )}

                  {shift.brand && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>{shift.brand.name}</span>
                    </div>
                  )}

                  {shift.event && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Event: {shift.event.title}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
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
