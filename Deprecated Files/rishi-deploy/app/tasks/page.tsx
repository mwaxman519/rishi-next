"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  FileText,
  GraduationCap,
  Package,
  UserCheck,
  DollarSign,
  Camera,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Eye,
  Play,
  Check,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type:
    | "event_report"
    | "mileage_submission"
    | "clock_in_out"
    | "training_required"
    | "logistics_kit"
    | "shadowing"
    | "personnel_update"
    | "photo_submission"
    | "compliance_check";
  priority: "low" | "medium" | "high" | "urgent";
  status: "assigned" | "in_progress" | "completed" | "overdue" | "cancelled";
  assignedBy: string;
  assignedByRole: "client_user" | "field_manager" | "internal_admin";
  dueDate: string;
  location?: string;
  eventId?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  instructions?: string;
  attachments?: string[];
  submissionData?: any;
  reviewNotes?: string;
  isRecurring: boolean;
  tags?: string[];
  completedAt?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real tasks from API with proper event-driven architecture
    const fetchTasks = async () => {
      try {
        // In production, this would fetch from /api/tasks
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on tab, search, and filters
  useEffect(() => {
    let filtered = tasks;

    if (selectedTab !== "all") {
      filtered = filtered.filter((task) => {
        switch (selectedTab) {
          case "assigned":
            return task.status === "assigned";
          case "active":
            return task.status === "in_progress";
          case "completed":
            return task.status === "completed";
          case "overdue":
            return (
              task.status === "overdue" ||
              (task.status !== "completed" && isOverdue(task.dueDate))
            );
          default:
            return true;
        }
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((task) => task.type === typeFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.location &&
            task.location.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedTab, searchTerm, typeFilter, priorityFilter]);

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "event_report":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "mileage_submission":
        return "bg-green-100 text-green-800 border-green-300";
      case "clock_in_out":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "training_required":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "logistics_kit":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "shadowing":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "personnel_update":
        return "bg-pink-100 text-pink-800 border-pink-300";
      case "photo_submission":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "compliance_check":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "event_report":
        return <FileText className="h-4 w-4" />;
      case "mileage_submission":
        return <DollarSign className="h-4 w-4" />;
      case "clock_in_out":
        return <Clock className="h-4 w-4" />;
      case "training_required":
        return <GraduationCap className="h-4 w-4" />;
      case "logistics_kit":
        return <Package className="h-4 w-4" />;
      case "shadowing":
        return <UserCheck className="h-4 w-4" />;
      case "personnel_update":
        return <User className="h-4 w-4" />;
      case "photo_submission":
        return <Camera className="h-4 w-4" />;
      case "compliance_check":
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300";
      case "assigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckSquare className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "assigned":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatTaskType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleStartTask = async (taskId: string) => {
    // Update task status to in_progress via API
    console.log("Starting task:", taskId);
  };

  const handleCompleteTask = async (taskId: string) => {
    // Update task status to completed via API
    console.log("Completing task:", taskId);
  };

  const handleViewTask = (task: Task) => {
    // Open task details modal or page
    console.log("View task:", task);
  };

  const getTabCounts = () => {
    const assigned = tasks.filter((t) => t.status === "assigned").length;
    const active = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter(
      (t) =>
        t.status === "overdue" ||
        (t.status !== "completed" && isOverdue(t.dueDate)),
    ).length;

    return { assigned, active, completed, overdue };
  };

  const { assigned, active, completed, overdue } = getTabCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">
            Manage assigned tasks including reports, mileage, training,
            logistics, shadowing, and personnel updates. Tasks can be assigned
            by Client Users, Field Managers, and Internal Admins.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">{assigned}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{active}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completed}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks, assigners, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="event_report">Event Reports</option>
            <option value="mileage_submission">Mileage</option>
            <option value="clock_in_out">Time Tracking</option>
            <option value="training_required">Training</option>
            <option value="logistics_kit">Logistics</option>
            <option value="shadowing">Shadowing</option>
            <option value="personnel_update">Personnel</option>
            <option value="photo_submission">Photos</option>
            <option value="compliance_check">Compliance</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assigned})</TabsTrigger>
          <TabsTrigger value="active">Active ({active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {/* Empty State */}
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Tasks Found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect with authentic data sources to display real task
                assignments. Tasks will appear here once proper API integration
                is established.
              </p>
              <div className="flex justify-center gap-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request New Task
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
