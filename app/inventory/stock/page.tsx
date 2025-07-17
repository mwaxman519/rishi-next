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
  Users,
  AlertTriangle,
  CheckCircle,
  Box,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
  ArrowUpDown,
  Truck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Stock items assigned to brand agents
const stockData = {
  stats: {
    totalItems: 186,
    assignedItems: 156,
    unassignedItems: 30,
    itemsForRepair: 8,
    totalAgents: 28,
    agentsWithoutItems: 3,
  },
  stockItems: [
    {
      id: "SI-001",
      serialNumber: "TBL-2024-001",
      itemType: "Folding Table",
      category: "Furniture",
      assignedTo: "Sarah Johnson",
      agentId: "BA-045",
      status: "assigned",
      condition: "good",
      assignedDate: "2024-06-15",
      lastInspection: "2025-01-05",
      region: "Northern California",
      notes: "6ft aluminum folding table",
    },
    {
      id: "SI-002",
      serialNumber: "TOTE-2024-015",
      itemType: "Storage Tote",
      category: "Storage",
      assignedTo: "Mike Chen",
      agentId: "BA-022",
      status: "assigned",
      condition: "excellent",
      assignedDate: "2024-08-20",
      lastInspection: "2025-01-10",
      region: "Southern California",
      notes: "Large 70L tote with wheels",
    },
    {
      id: "SI-003",
      serialNumber: "TC-2024-042",
      itemType: "Tablecloth",
      category: "Textiles",
      assignedTo: "Emma Wilson",
      agentId: "BA-033",
      status: "assigned",
      condition: "fair",
      assignedDate: "2024-09-10",
      lastInspection: "2024-12-20",
      region: "Bay Area",
      notes: "Purple branded tablecloth - needs cleaning",
    },
    {
      id: "SI-004",
      serialNumber: "TBL-2024-002",
      itemType: "Folding Table",
      category: "Furniture",
      assignedTo: null,
      agentId: null,
      status: "available",
      condition: "good",
      assignedDate: null,
      lastInspection: "2025-01-15",
      region: "Warehouse",
      notes: "4ft square folding table",
    },
    {
      id: "SI-005",
      serialNumber: "DISP-2024-008",
      itemType: "Display Stand",
      category: "Display",
      assignedTo: "James Rodriguez",
      agentId: "BA-018",
      status: "assigned",
      condition: "repair_needed",
      assignedDate: "2024-07-25",
      lastInspection: "2025-01-08",
      region: "Central Valley",
      notes: "Adjustable height - wobbly base needs fixing",
    },
    {
      id: "SI-006",
      serialNumber: "TOTE-2024-022",
      itemType: "Storage Tote",
      category: "Storage",
      assignedTo: null,
      agentId: null,
      status: "available",
      condition: "excellent",
      assignedDate: null,
      lastInspection: "2025-01-12",
      region: "Warehouse",
      notes: "Medium 45L tote",
    },
    {
      id: "SI-007",
      serialNumber: "TC-2024-055",
      itemType: "Tablecloth",
      category: "Textiles",
      assignedTo: "Lisa Park",
      agentId: "BA-041",
      status: "assigned",
      condition: "excellent",
      assignedDate: "2024-11-01",
      lastInspection: "2025-01-14",
      region: "Orange County",
      notes: "Black branded tablecloth - new",
    },
    {
      id: "SI-008",
      serialNumber: "SIGN-2024-012",
      itemType: "Banner Stand",
      category: "Signage",
      assignedTo: "David Kim",
      agentId: "BA-029",
      status: "assigned",
      condition: "good",
      assignedDate: "2024-10-15",
      lastInspection: "2025-01-02",
      region: "San Diego",
      notes: "Retractable banner stand 33\"x81\"",
    },
  ],
  agentSummary: [
    {
      agentId: "BA-045",
      name: "Sarah Johnson",
      itemCount: 4,
      items: ["Table", "Tote", "2 Tablecloths"],
      lastActivity: "2025-01-15",
      status: "active",
    },
    {
      agentId: "BA-022",
      name: "Mike Chen",
      itemCount: 3,
      items: ["Table", "Tote", "Banner"],
      lastActivity: "2025-01-14",
      status: "active",
    },
    {
      agentId: "BA-033",
      name: "Emma Wilson",
      itemCount: 2,
      items: ["Tablecloth", "Tote"],
      lastActivity: "2025-01-10",
      status: "active",
    },
    {
      agentId: "BA-051",
      name: "Tom Anderson",
      itemCount: 0,
      items: [],
      lastActivity: "2025-01-05",
      status: "onboarding",
    },
  ],
};

// Stock item row component
const StockItemRow = ({ item }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-50 text-green-700 border-green-200";
      case "available":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "repair_needed":
        return "bg-red-50 text-red-700 border-red-200";
      case "missing":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-700";
      case "good":
        return "bg-purple-100 text-purple-700";
      case "fair":
        return "bg-yellow-100 text-yellow-700";
      case "repair_needed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{item.serialNumber}</TableCell>
      <TableCell>{item.itemType}</TableCell>
      <TableCell>
        <Badge className={`${getStatusColor(item.status)} border`}>
          {item.status.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell>
        {item.assignedTo ? (
          <div>
            <div className="font-medium">{item.assignedTo}</div>
            <div className="text-xs text-gray-500">{item.agentId}</div>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getConditionBadge(item.condition)}>
          {item.condition.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell>{item.region}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCheck className="w-4 h-4 mr-2" />
              Assign/Reassign
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Inspection
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <UserX className="w-4 h-4 mr-2" />
              Mark as Missing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Agent summary card
const AgentSummaryCard = ({ agent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "onboarding":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{agent.name}</h3>
              <p className="text-xs text-gray-500">{agent.agentId}</p>
            </div>
          </div>
          <Badge className={getStatusColor(agent.status)}>
            {agent.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Items Assigned</span>
            <span className="font-semibold">{agent.itemCount}</span>
          </div>
          
          {agent.items.length > 0 ? (
            <div className="text-xs text-gray-600">
              {agent.items.join(" • ")}
            </div>
          ) : (
            <div className="text-xs text-red-600">
              No items assigned - needs onboarding kit
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">Last Active</span>
            <span className="text-xs">
              {new Date(agent.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StockManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("items");
  const { toast } = useToast();

  const filteredItems = stockData.stockItems.filter((item) => {
    const matchesSearch = 
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-sm text-gray-600">
            Track individual items assigned to brand agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Stock Item
          </Button>
          <Button size="sm" variant="outline">
            <Truck className="w-4 h-4 mr-2" />
            Bulk Assignment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{stockData.stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-green-600">
                {stockData.stats.assignedItems}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-purple-600">
                {stockData.stats.unassignedItems}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">For Repair</p>
              <p className="text-2xl font-bold text-red-600">
                {stockData.stats.itemsForRepair}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold">{stockData.stats.totalAgents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Need Items</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stockData.stats.agentsWithoutItems}
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
            placeholder="Search by serial number, item type, or agent..."
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
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="repair_needed">Needs Repair</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Stock Items</TabsTrigger>
          <TabsTrigger value="agents">Agent Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Items Registry</CardTitle>
              <CardDescription>
                Individual items tracked by serial number and assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Item Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <StockItemRow key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stockData.agentSummary.map((agent) => (
              <AgentSummaryCard key={agent.agentId} agent={agent} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}