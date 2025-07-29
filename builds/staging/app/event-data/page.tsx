"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


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
  FileText,
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

interface EventDataSubmission {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  agentName: string;
  status:
    | "pending"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "needs_revision";
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  jotformUrl?: string;
  photoCount: number;
  approvalNotes?: string;
  rejectionReason?: string;
  dueDate: string;
}

export default function EventDataPage() {
  const [submissions, setSubmissions] = useState<EventDataSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    EventDataSubmission[]
  >([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real submissions from API
    const fetchSubmissions = async () => {
      try {
        // In production, this would fetch from /api/event-data/submissions
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event data submissions:", error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Filter submissions based on tab, search, and status
  useEffect(() => {
    let filtered = submissions;

    if (selectedTab !== "all") {
      filtered = filtered.filter((sub) => {
        switch (selectedTab) {
          case "missing":
            return sub.status === "pending";
          case "submitted":
            return ["submitted", "under_review"].includes(sub.status);
          case "completed":
            return ["approved", "rejected", "needs_revision"].includes(
              sub.status,
            );
          default:
            return true;
        }
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.agentName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, selectedTab, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "under_review":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "needs_revision":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "submitted":
      case "under_review":
        return <FileText className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "needs_revision":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateSubmission = () => {
    // Open Jotform for new submission
    window.open("https://form.jotform.com/event-data-submission", "_blank");
  };

  const handleViewSubmission = (submission: EventDataSubmission) => {
    // Open submission details modal or page
    console.log("View submission:", submission);
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "approved") return false;
    return new Date(dueDate) < new Date();
  };

  const getTabCounts = () => {
    const missing = submissions.filter((s) => s.status === "pending").length;
    const submitted = submissions.filter((s) =>
      ["submitted", "under_review"].includes(s.status),
    ).length;
    const completed = submissions.filter((s) =>
      ["approved", "rejected", "needs_revision"].includes(s.status),
    ).length;

    return { missing, submitted, completed };
  };

  const { missing, submitted, completed } = getTabCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Loading event data submissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Event Data Submissions
          </h1>
          <p className="text-gray-600 mt-1">
            Submit qualitative and quantitative event surveys through Jotforms.
            Include demo table, shelf images, and additional photos for
            management review.
          </p>
        </div>
        <Button
          onClick={handleCreateSubmission}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Submission
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Missing Data
                </p>
                <p className="text-2xl font-bold text-yellow-600">{missing}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-blue-600">{submitted}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
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
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Photos Submitted
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {submissions.reduce((sum, s) => sum + s.photoCount, 0)}
                </p>
              </div>
              <Camera className="h-8 w-8 text-purple-600" />
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
              placeholder="Search events, locations, or agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Event Data Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect with authentic data sources to display real event
            submissions. Event data will appear here once proper API integration
            is established.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleCreateSubmission}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Submission
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
