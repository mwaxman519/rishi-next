import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Building,
  Target,
  Activity,
  Briefcase,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const metadata: Metadata = {
  title: "Team Management | Rishi Workforce Management",
  description: "Manage your team members and assignments",
};

// Generate sample team members to simulate large team dataset
const generateTeamMembers = () => {
  const firstNames = [
    "Sarah",
    "Michael",
    "Emily",
    "David",
    "Jessica",
    "Ryan",
    "Ashley",
    "Kevin",
    "Amanda",
    "Brandon",
    "Stephanie",
    "Tyler",
    "Rachel",
    "Justin",
    "Nicole",
    "Matthew",
    "Lauren",
    "Daniel",
    "Megan",
    "Christopher",
    "Hannah",
    "Andrew",
    "Brittany",
    "Joshua",
    "Samantha",
    "Nicholas",
    "Elizabeth",
    "Anthony",
    "Taylor",
    "William",
  ];
  const lastNames = [
    "Johnson",
    "Chen",
    "Rodriguez",
    "Park",
    "Smith",
    "Williams",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
  ];
  const cities = [
    "San Francisco, CA",
    "Los Angeles, CA",
    "Chicago, IL",
    "Seattle, WA",
    "New York, NY",
    "Boston, MA",
    "Austin, TX",
    "Denver, CO",
    "Portland, OR",
    "Miami, FL",
  ];
  const specialties = [
    ["Product Demo", "Corporate Events"],
    ["Trade Shows", "Retail Activation"],
    ["Consumer Events", "Sampling"],
    ["Tech Events", "B2B Demos"],
    ["Fashion Shows", "Pop-up Events"],
    ["Food Sampling", "Store Activation"],
    ["Auto Shows", "Product Launch"],
    ["Health & Wellness", "Fitness Events"],
    ["Gaming Events", "Tech Conferences"],
    ["Beauty Events", "Lifestyle Shows"],
  ];

  const teamMembers = [];

  for (let i = 0; i < 150; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const id = `member-${i + 1}`;

    teamMembers.push({
      id,
      name,
      email: `${firstName?.toLowerCase()}.${lastName?.toLowerCase()}@company.com`,
      avatar: `/avatars/${firstName?.toLowerCase()}.jpg`,
      role: Math.random() > 0.7 ? "Lead Brand Agent" : "Brand Agent",
      status:
        Math.random() > 0.8
          ? Math.random() > 0.5
            ? "inactive"
            : "on_leave"
          : "active",
      location: cities[Math.floor(Math.random() * cities.length)],
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      eventsCompleted: Math.floor(Math.random() * 50) + 1,
      availability: Math.random() > 0.3 ? "available" : "busy",
      specialties: specialties[Math.floor(Math.random() * specialties.length)],
    });
  }

  return teamMembers;
};

const teamMembers = generateTeamMembers();

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Team Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Manage your brand agents and team assignments
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total Members
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {teamMembers.length}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Active Members
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {teamMembers.filter((m) => m.status === "active").length}
                  </p>
                </div>
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {teamMembers.reduce((sum, m) => sum + m.eventsCompleted, 0)}
                  </p>
                </div>
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Avg Rating
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(
                      teamMembers.reduce((sum, m) => sum + m.rating, 0) /
                      teamMembers.length
                    ).toFixed(1)}
                  </p>
                </div>
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            {/* Filters and Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search team members..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="brand-agent">Brand Agent</SelectItem>
                    <SelectItem value="lead-brand-agent">
                      Lead Brand Agent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Members List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1">Rating</div>
                <div className="col-span-1">Events</div>
                <div className="col-span-1">Availability</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Team Members Rows */}
              {teamMembers.slice(0, 20).map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="col-span-3 flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {member.role}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <Badge
                      variant={
                        member.status === "active"
                          ? "default"
                          : member.status === "inactive"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.status === "active"
                        ? "Active"
                        : member.status === "inactive"
                          ? "Inactive"
                          : "On Leave"}
                    </Badge>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                      {member.location}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {member.rating}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {member.eventsCompleted}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <Badge
                      variant={
                        member.availability === "available"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.availability === "available"
                        ? "Available"
                        : "Busy"}
                    </Badge>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/team/${member.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/team/${member.id}/edit`}>
                            Edit Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing 1-20 of {teamMembers.length} team members
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="default" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <span className="text-gray-400 dark:text-gray-500">...</span>
                <Button variant="outline" size="sm">
                  {Math.ceil(teamMembers.length / 20)}
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
