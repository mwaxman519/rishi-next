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
} from &quot;lucide-react&quot;;

interface EventDataSubmission {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  agentName: string;
  status:
    | &quot;pending&quot;
    | &quot;submitted&quot;
    | &quot;under_review&quot;
    | &quot;approved&quot;
    | &quot;rejected&quot;
    | &quot;needs_revision&quot;;
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
  const [selectedTab, setSelectedTab] = useState(&quot;all&quot;);
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real submissions from API
    const fetchSubmissions = async () => {
      try {
        // In production, this would fetch from /api/event-data/submissions
        setLoading(false);
      } catch (error) {
        console.error(&quot;Error fetching event data submissions:&quot;, error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Filter submissions based on tab, search, and status
  useEffect(() => {
    let filtered = submissions;

    if (selectedTab !== &quot;all&quot;) {
      filtered = filtered.filter((sub) => {
        switch (selectedTab) {
          case &quot;missing&quot;:
            return sub.status === &quot;pending&quot;;
          case &quot;submitted&quot;:
            return [&quot;submitted&quot;, &quot;under_review&quot;].includes(sub.status);
          case &quot;completed&quot;:
            return [&quot;approved&quot;, &quot;rejected&quot;, &quot;needs_revision&quot;].includes(
              sub.status,
            );
          default:
            return true;
        }
      });
    }

    if (statusFilter !== &quot;all&quot;) {
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
      case &quot;pending&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-300&quot;;
      case &quot;submitted&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-300&quot;;
      case &quot;under_review&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-300&quot;;
      case &quot;approved&quot;:
        return &quot;bg-green-100 text-green-800 border-green-300&quot;;
      case &quot;rejected&quot;:
        return &quot;bg-red-100 text-red-800 border-red-300&quot;;
      case &quot;needs_revision&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-300&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-300&quot;;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case &quot;pending&quot;:
        return <Clock className=&quot;h-4 w-4&quot; />;
      case &quot;submitted&quot;:
      case &quot;under_review&quot;:
        return <FileText className=&quot;h-4 w-4&quot; />;
      case &quot;approved&quot;:
        return <CheckCircle className=&quot;h-4 w-4&quot; />;
      case &quot;rejected&quot;:
        return <XCircle className=&quot;h-4 w-4&quot; />;
      case &quot;needs_revision&quot;:
        return <AlertTriangle className=&quot;h-4 w-4&quot; />;
      default:
        return <FileText className=&quot;h-4 w-4&quot; />;
    }
  };

  const handleCreateSubmission = () => {
    // Open Jotform for new submission
    window.open(&quot;https://form.jotform.com/event-data-submission&quot;, &quot;_blank&quot;);
  };

  const handleViewSubmission = (submission: EventDataSubmission) => {
    // Open submission details modal or page
    console.log(&quot;View submission:&quot;, submission);
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === &quot;approved&quot;) return false;
    return new Date(dueDate) < new Date();
  };

  const getTabCounts = () => {
    const missing = submissions.filter((s) => s.status === &quot;pending&quot;).length;
    const submitted = submissions.filter((s) =>
      [&quot;submitted&quot;, &quot;under_review&quot;].includes(s.status),
    ).length;
    const completed = submissions.filter((s) =>
      [&quot;approved&quot;, &quot;rejected&quot;, &quot;needs_revision&quot;].includes(s.status),
    ).length;

    return { missing, submitted, completed };
  };

  const { missing, submitted, completed } = getTabCounts();

  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center h-64&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto&quot;></div>
          <p className=&quot;mt-2 text-gray-600&quot;>
            Loading event data submissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-start&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900&quot;>
            Event Data Submissions
          </h1>
          <p className=&quot;text-gray-600 mt-1&quot;>
            Submit qualitative and quantitative event surveys through Jotforms.
            Include demo table, shelf images, and additional photos for
            management review.
          </p>
        </div>
        <Button
          onClick={handleCreateSubmission}
          className=&quot;flex items-center gap-2&quot;
        >
          <Plus className=&quot;h-4 w-4&quot; />
          New Submission
        </Button>
      </div>

      {/* Summary Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>
                  Missing Data
                </p>
                <p className=&quot;text-2xl font-bold text-yellow-600&quot;>{missing}</p>
              </div>
              <Clock className=&quot;h-8 w-8 text-yellow-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>
                  Under Review
                </p>
                <p className=&quot;text-2xl font-bold text-blue-600&quot;>{submitted}</p>
              </div>
              <FileText className=&quot;h-8 w-8 text-blue-600&quot; />
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
              <CheckCircle className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-gray-600&quot;>
                  Photos Submitted
                </p>
                <p className=&quot;text-2xl font-bold text-purple-600&quot;>
                  {submissions.reduce((sum, s) => sum + s.photoCount, 0)}
                </p>
              </div>
              <Camera className=&quot;h-8 w-8 text-purple-600&quot; />
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
              placeholder=&quot;Search events, locations, or agents...&quot;
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=&quot;pl-10&quot;
            />
          </div>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className=&quot;px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500&quot;
          >
            <option value=&quot;all&quot;>All Status</option>
            <option value=&quot;pending&quot;>Pending</option>
            <option value=&quot;submitted&quot;>Submitted</option>
            <option value=&quot;under_review&quot;>Under Review</option>
            <option value=&quot;approved&quot;>Approved</option>
            <option value=&quot;rejected&quot;>Rejected</option>
            <option value=&quot;needs_revision&quot;>Needs Revision</option>
          </select>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
            <Filter className=&quot;h-4 w-4 mr-2&quot; />
            Filters
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className=&quot;p-12 text-center&quot;>
          <div className=&quot;mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4&quot;>
            <FileText className=&quot;h-12 w-12 text-gray-400&quot; />
          </div>
          <h3 className=&quot;text-xl font-medium text-gray-900 mb-2&quot;>
            No Event Data Found
          </h3>
          <p className=&quot;text-gray-600 mb-6 max-w-md mx-auto&quot;>
            Connect with authentic data sources to display real event
            submissions. Event data will appear here once proper API integration
            is established.
          </p>
          <div className=&quot;flex justify-center gap-4&quot;>
            <Button onClick={handleCreateSubmission}>
              <Plus className=&quot;h-4 w-4 mr-2&quot; />
              Create First Submission
            </Button>
            <Button variant=&quot;outline&quot;>
              <FileText className=&quot;h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
