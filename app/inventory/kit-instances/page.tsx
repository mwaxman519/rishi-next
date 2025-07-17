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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  Plus,
  Filter,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Archive,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Kit instances data
const kitInstancesData = {
  stats: {
    activeInstances: 45,
    inPreparation: 8,
    inTransit: 12,
    deployed: 22,
    returning: 3,
    totalValue: 24580,
  },
  instances: [
    {
      id: "KI-001",
      templateName: "Product Demo Standard",
      templateId: "KT-001",
      bookingRef: "BK-2025-0145",
      status: "deployed",
      location: "Green Dragon Dispensary",
      agent: "Sarah Johnson",
      agentId: "BA-045",
      startDate: "2025-01-15",
      endDate: "2025-01-16",
      items: 12,
      totalValue: 485,
      completeness: 100,
    },
    {
      id: "KI-002",
      templateName: "Trade Show Premium",
      templateId: "KT-002",
      bookingRef: "BK-2025-0148",
      status: "in_preparation",
      location: "San Jose Convention Center",
      agent: "Mike Chen",
      agentId: "BA-022",
      startDate: "2025-01-18",
      endDate: "2025-01-20",
      items: 25,
      totalValue: 1251,
      completeness: 75,
    },
    {
      id: "KI-003",
      templateName: "Street Team Activation",
      templateId: "KT-003",
      bookingRef: "BK-2025-0142",
      status: "in_transit",
      location: "Venice Beach Boardwalk",
      agent: "Emma Wilson",
      agentId: "BA-033",
      startDate: "2025-01-16",
      endDate: "2025-01-16",
      items: 8,
      totalValue: 320,
      completeness: 100,
    },
    {
      id: "KI-004",
      templateName: "Product Demo Standard",
      templateId: "KT-001",
      bookingRef: "BK-2025-0141",
      status: "returning",
      location: "Purple Haze Collective",
      agent: "James Rodriguez",
      agentId: "BA-018",
      startDate: "2025-01-14",
      endDate: "2025-01-14",
      items: 12,
      totalValue: 485,
      completeness: 92,
    },
    {
      id: "KI-005",
      templateName: "Luxury Event Package",
      templateId: "KT-004",
      bookingRef: "BK-2025-0150",
      status: "in_preparation",
      location: "Beverly Hills Hotel",
      agent: "Lisa Park",
      agentId: "BA-041",
      startDate: "2025-01-22",
      endDate: "2025-01-22",
      items: 18,
      totalValue: 2150,
      completeness: 40,
    },
  ],
  itemDetails: {
    "KI-001": [
      { name: "Folding Table", quantity: 1, status: "deployed" },
      { name: "Tablecloth", quantity: 1, status: "deployed" },
      { name: "Product Samples", quantity: 6, status: "deployed" },
      { name: "Brochures", quantity: 100, status: "deployed" },
      { name: "Banner Stand", quantity: 1, status: "deployed" },
      { name: "Storage Tote", quantity: 1, status: "deployed" },
    ],
    "KI-002": [
      { name: "Display Booth", quantity: 1, status: "packed" },
      { name: "LED Panels", quantity: 2, status: "packed" },
      { name: "Demo Tables", quantity: 3, status: "preparing" },
      { name: "Premium Samples", quantity: 12, status: "packed" },
      { name: "Marketing Materials", quantity: 500, status: "preparing" },
    ],
  },
};

// Kit instance card
const KitInstanceCard = ({ instance }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-50 text-green-700 border-green-200";
      case "in_preparation":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in_transit":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "returning":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{instance.templateName}</h3>
              <p className="text-xs text-gray-500">{instance.id} • {instance.bookingRef}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(instance.status)} border`}>
            {instance.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="truncate">{instance.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span>{instance.agent}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Completeness</span>
            <span className="font-semibold">{instance.completeness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getCompletenessColor(instance.completeness)}`}
              style={{ width: `${instance.completeness}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Items: </span>
              <span className="font-semibold">{instance.items}</span>
            </div>
            <div>
              <span className="text-gray-600">Value: </span>
              <span className="font-semibold">${instance.totalValue}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(instance.startDate).toLocaleDateString()}</span>
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-xs">
              View Details
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Timeline view component
const TimelineView = ({ instances }) => {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active Today
        </Badge>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <Archive className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      </div>

      <div className="space-y-3">
        {instances.map((instance) => {
          const isToday = instance.startDate === today;
          const isPast = new Date(instance.endDate) < new Date(today);
          const isFuture = new Date(instance.startDate) > new Date(today);

          return (
            <Card key={instance.id} className={`${isToday ? 'border-green-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-gray-500">
                        {new Date(instance.startDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(instance.startDate).getDate()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{instance.templateName}</h4>
                        <Badge className={`${getStatusColor(instance.status)} border text-xs`}>
                          {instance.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {instance.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {instance.agent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">${instance.totalValue}</div>
                    <div className="text-xs text-gray-500">{instance.items} items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case "deployed":
      return "bg-green-50 text-green-700 border-green-200";
    case "in_preparation":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "in_transit":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "returning":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function KitInstancesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const { toast } = useToast();

  const filteredInstances = kitInstancesData.instances.filter((instance) => {
    const matchesSearch = 
      instance.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.bookingRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || instance.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kit Instances</h1>
          <p className="text-sm text-gray-600">
            Active kits assigned to bookings and agents
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Instance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">{kitInstancesData.stats.activeInstances}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Preparing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {kitInstancesData.stats.inPreparation}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-purple-600">
                {kitInstancesData.stats.inTransit}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Deployed</p>
              <p className="text-2xl font-bold text-green-600">
                {kitInstancesData.stats.deployed}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Returning</p>
              <p className="text-2xl font-bold text-orange-600">
                {kitInstancesData.stats.returning}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">
                ${kitInstancesData.stats.totalValue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by template, location, agent, or booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_preparation">In Preparation</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="returning">Returning</SelectItem>
          </SelectContent>
        </Select>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "timeline")}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInstances.map((instance) => (
            <KitInstanceCard key={instance.id} instance={instance} />
          ))}
        </div>
      ) : (
        <TimelineView instances={filteredInstances} />
      )}
    </div>
  );
}