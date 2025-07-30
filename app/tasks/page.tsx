&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;../components/ui/card&quot;;
import { Button } from &quot;../components/ui/button&quot;;
import { Badge } from &quot;../components/ui/badge&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;../components/ui/tabs&quot;;
import { Input } from &quot;../components/ui/input&quot;;
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
} from &quot;lucide-react&quot;;

interface Task {
  id: string;
  title: string;
  description: string;
  type:
    | &quot;event_report&quot;
    | &quot;mileage_submission&quot;
    | &quot;clock_in_out&quot;
    | &quot;training_required&quot;
    | &quot;logistics_kit&quot;
    | &quot;shadowing&quot;
    | &quot;personnel_update&quot;
    | &quot;photo_submission&quot;
    | &quot;compliance_check&quot;;
  priority: &quot;low&quot; | &quot;medium&quot; | &quot;high&quot; | &quot;urgent&quot;;
  status: &quot;assigned&quot; | &quot;in_progress&quot; | &quot;completed&quot; | &quot;overdue&quot; | &quot;cancelled&quot;;
  assignedBy: string;
  assignedByRole: &quot;client_user&quot; | &quot;field_manager&quot; | &quot;internal_admin&quot;;
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
  const [selectedTab, setSelectedTab] = useState(&quot;all&quot;);
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [typeFilter, setTypeFilter] = useState(&quot;all&quot;);
  const [priorityFilter, setPriorityFilter] = useState(&quot;all&quot;);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real tasks from API with proper event-driven architecture
    const fetchTasks = async () => {
      try {
        // In production, this would fetch from /api/tasks
        setLoading(false);
      } catch (error) {
        console.error(&quot;Error fetching tasks:&quot;, error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on tab, search, and filters
  useEffect(() => {
    let filtered = tasks;

    if (selectedTab !== &quot;all&quot;) {
      filtered = filtered.filter((task) => {
        switch (selectedTab) {
          case &quot;assigned&quot;:
            return task.status === &quot;assigned&quot;;
          case &quot;active&quot;:
            return task.status === &quot;in_progress&quot;;
          case &quot;completed&quot;:
            return task.status === &quot;completed&quot;;
          case &quot;overdue&quot;:
            return (
              task.status === &quot;overdue&quot; ||
              (task.status !== &quot;completed&quot; && isOverdue(task.dueDate))
            );
          default:
            return true;
        }
      });
    }

    if (typeFilter !== &quot;all&quot;) {
      filtered = filtered.filter((task) => task.type === typeFilter);
    }

    if (priorityFilter !== &quot;all&quot;) {
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
      case &quot;event_report&quot;:
        return &quot;bg-teal-100 text-teal-800 border-teal-300&quot;;
      case &quot;mileage_submission&quot;:
        return &quot;bg-green-100 text-green-800 border-green-300&quot;;
      case &quot;clock_in_out&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-300&quot;;
      case &quot;training_required&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-300&quot;;
      case &quot;logistics_kit&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-300&quot;;
      case &quot;shadowing&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-300&quot;;
      case &quot;personnel_update&quot;:
        return &quot;bg-pink-100 text-pink-800 border-pink-300&quot;;
      case &quot;photo_submission&quot;:
        return &quot;bg-cyan-100 text-cyan-800 border-cyan-300&quot;;
      case &quot;compliance_check&quot;:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case &quot;event_report&quot;:
        return <FileText className=&quot;h-4 w-4&quot; />;
      case &quot;mileage_submission&quot;:
        return <DollarSign className=&quot;h-4 w-4&quot; />;
      case &quot;clock_in_out&quot;:
        return <Clock className=&quot;h-4 w-4&quot; />;
      case &quot;training_required&quot;:
        return <GraduationCap className=&quot;h-4 w-4&quot; />;
      case &quot;logistics_kit&quot;:
        return <Package className=&quot;h-4 w-4&quot; />;
      case &quot;shadowing&quot;:
        return <UserCheck className=&quot;h-4 w-4&quot; />;
      case &quot;personnel_update&quot;:
        return <User className=&quot;h-4 w-4&quot; />;
      case &quot;photo_submission&quot;:
        return <Camera className=&quot;h-4 w-4&quot; />;
      case &quot;compliance_check&quot;:
        return <CheckSquare className=&quot;h-4 w-4&quot; />;
      default:
        return <CheckSquare className=&quot;h-4 w-4&quot; />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case &quot;urgent&quot;:
        return &quot;bg-red-100 text-red-800 border-red-300&quot;;
      case &quot;high&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-300&quot;;
      case &quot;medium&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-300&quot;;
      case &quot;low&quot;:
        return &quot;bg-green-100 text-green-800 border-green-300&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;completed&quot;:
        return &quot;bg-green-100 text-green-800 border-green-300&quot;;
      case &quot;in_progress&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-300&quot;;
      case &quot;overdue&quot;:
        return &quot;bg-red-100 text-red-800 border-red-300&quot;;
      case &quot;assigned&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-300&quot;;
      case &quot;cancelled&quot;:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case &quot;completed&quot;:
        return <CheckSquare className=&quot;h-4 w-4&quot; />;
      case &quot;in_progress&quot;:
        return <Play className=&quot;h-4 w-4&quot; />;
      case &quot;overdue&quot;:
        return <AlertCircle className=&quot;h-4 w-4&quot; />;
      case &quot;assigned&quot;:
        return <Clock className=&quot;h-4 w-4&quot; />;
      case &quot;cancelled&quot;:
        return <X className=&quot;h-4 w-4&quot; />;
      default:
        return <Clock className=&quot;h-4 w-4&quot; />;
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
      .split(&quot;_&quot;)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(&quot; &quot;);
  };

  const handleStartTask = async (taskId: string) => {
    // Update task status to in_progress via API
    console.log(&quot;Starting task:&quot;, taskId);
  };

  const handleCompleteTask = async (taskId: string) => {
    // Update task status to completed via API
    console.log(&quot;Completing task:&quot;, taskId);
  };

  const handleViewTask = (task: Task) => {
    // Open task details modal or page
    console.log(&quot;View task:&quot;, task);
  };

  const getTabCounts = () => {
    const assigned = tasks.filter((t) => t.status === &quot;assigned&quot;).length;
    const active = tasks.filter((t) => t.status === &quot;in_progress&quot;).length;
    const completed = tasks.filter((t) => t.status === &quot;completed&quot;).length;
    const overdue = tasks.filter(
      (t) =>
        t.status === &quot;overdue&quot; ||
        (t.status !== &quot;completed&quot; && isOverdue(t.dueDate)),
    ).length;

    return { assigned, active, completed, overdue };
  };

  const { assigned, active, completed, overdue } = getTabCounts();

  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center h-64&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto&quot;></div>
          <p className=&quot;mt-2 text-gray-600&quot;>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-start&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900&quot;>Task Management</h1>
          <p className=&quot;text-gray-600 mt-1&quot;>
            Manage assigned tasks including reports, mileage, training,
            logistics, shadowing, and personnel updates. Tasks can be assigned
            by Client Users, Field Managers, and Internal Admins.
          </p>
        </div>
        <Button>
          <Plus className=&quot;h-4 w-4 mr-2&quot; />
          Request Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>Assigned</p>
                <p className=&quot;text-2xl font-bold text-yellow-600&quot;>{assigned}</p>
              </div>
              <Clock className=&quot;h-8 w-8 text-yellow-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>Active</p>
                <p className=&quot;text-2xl font-bold text-blue-600&quot;>{active}</p>
              </div>
              <Play className=&quot;h-8 w-8 text-blue-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>Completed</p>
                <p className=&quot;text-2xl font-bold text-green-600&quot;>{completed}</p>
              </div>
              <CheckSquare className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>Overdue</p>
                <p className=&quot;text-2xl font-bold text-red-600&quot;>{overdue}</p>
              </div>
              <AlertCircle className=&quot;h-8 w-8 text-red-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
        <div className=&quot;flex-1&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4&quot; />
            <Input
              placeholder=&quot;Search tasks, assigners, or locations...&quot;
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=&quot;pl-10&quot;
            />
          </div>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className=&quot;px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500&quot;
          >
            <option value=&quot;all&quot;>All Types</option>
            <option value=&quot;event_report&quot;>Event Reports</option>
            <option value=&quot;mileage_submission&quot;>Mileage</option>
            <option value=&quot;clock_in_out&quot;>Time Tracking</option>
            <option value=&quot;training_required&quot;>Training</option>
            <option value=&quot;logistics_kit&quot;>Logistics</option>
            <option value=&quot;shadowing&quot;>Shadowing</option>
            <option value=&quot;personnel_update&quot;>Personnel</option>
            <option value=&quot;photo_submission&quot;>Photos</option>
            <option value=&quot;compliance_check&quot;>Compliance</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className=&quot;px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500&quot;
          >
            <option value=&quot;all&quot;>All Priorities</option>
            <option value=&quot;urgent&quot;>Urgent</option>
            <option value=&quot;high&quot;>High</option>
            <option value=&quot;medium&quot;>Medium</option>
            <option value=&quot;low&quot;>Low</option>
          </select>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
            <Filter className=&quot;h-4 w-4 mr-2&quot; />
            More Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className=&quot;grid w-full grid-cols-5&quot;>
          <TabsTrigger value=&quot;all&quot;>All Tasks</TabsTrigger>
          <TabsTrigger value=&quot;assigned&quot;>Assigned ({assigned})</TabsTrigger>
          <TabsTrigger value=&quot;active&quot;>Active ({active})</TabsTrigger>
          <TabsTrigger value=&quot;completed&quot;>Completed ({completed})</TabsTrigger>
          <TabsTrigger value=&quot;overdue&quot;>Overdue ({overdue})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className=&quot;mt-6&quot;>
          {/* Empty State */}
          <Card>
            <CardContent className=&quot;p-12 text-center&quot;>
              <div className=&quot;mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4&quot;>
                <CheckSquare className=&quot;h-12 w-12 text-gray-400&quot; />
              </div>
              <h3 className=&quot;text-xl font-medium text-gray-900 mb-2&quot;>
                No Tasks Found
              </h3>
              <p className=&quot;text-gray-600 mb-6 max-w-md mx-auto&quot;>
                Connect with authentic data sources to display real task
                assignments. Tasks will appear here once proper API integration
                is established.
              </p>
              <div className=&quot;flex justify-center gap-4&quot;>
                <Button>
                  <Plus className=&quot;h-4 w-4 mr-2&quot; />
                  Request New Task
                </Button>
                <Button variant=&quot;outline&quot;>
                  <FileText className=&quot;h-4 w-4 mr-2" />
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
