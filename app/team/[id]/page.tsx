import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Edit,
  MessageSquare,
  UserPlus,
  Home,
  Shield,
  Smartphone,
  User,
  CreditCard,
  AlertTriangle,
  Users,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface TeamMemberDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data for team member details
const getTeamMemberById = (id: string) => {
  const members = {
    "1": {
      id: "1",
      name: "Sarah Johnson",
      role: "Brand Agent",
      email: "sarah.johnson@rishievents.com",
      personalEmail: "sarah.j.personal@gmail.com",
      phone: "+1 (555) 123-4567",
      address: {
        street: "1234 Market Street, Apt 5B",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        country: "United States",
      },
      location: "San Francisco, CA",
      status: "active",
      rating: 4.8,
      eventsCompleted: 24,
      joinDate: "2024-01-15",
      manager: "Emily Davis",
      managerId: "3",
      department: "Field Operations",
      employeeId: "EMP-2024-001",
      shirtSize: "M",
      lastDeviceType: "iPhone 14 Pro",
      emergencyContact: {
        name: "John Johnson",
        relationship: "Spouse",
        phone: "+1 (555) 987-6543",
      },
      personalInfo: {
        dateOfBirth: "1995-03-15",
        ssn: "***-**-4567",
        workEligibility: "US Citizen",
        driversLicense: "CA-D1234567",
      },
      bankingInfo: {
        accountType: "Direct Deposit",
        bankName: "Wells Fargo",
        routingLast4: "1234",
      },
      specialties: ["Product Demo", "Corporate Events"],
      avatar: "/avatars/sarah.jpg",
      bio: "Experienced brand agent with 3+ years in product demonstrations and corporate events. Specializes in tech product launches and B2B engagement.",
      skills: [
        { name: "Product Demo", level: 95 },
        { name: "Public Speaking", level: 88 },
        { name: "Customer Engagement", level: 92 },
        { name: "Event Coordination", level: 85 },
      ],
      recentEvents: [
        {
          id: 1,
          name: "Tech Conference 2024",
          date: "2024-06-10",
          status: "completed",
          rating: 4.9,
        },
        {
          id: 2,
          name: "Product Launch Demo",
          date: "2024-06-05",
          status: "completed",
          rating: 4.7,
        },
        {
          id: 3,
          name: "Corporate Training",
          date: "2024-05-28",
          status: "completed",
          rating: 4.8,
        },
      ],
      performance: {
        onTimeRate: 96,
        customerSatisfaction: 4.8,
        eventCompletionRate: 100,
        responseTime: "< 2 hours",
      },
      certifications: [
        "Brand Ambassador Certification",
        "Product Demo Specialist",
        "Corporate Events Training",
      ],
    },
    "2": {
      id: "2",
      name: "Michael Chen",
      role: "Brand Agent",
      email: "michael.chen@rishievents.com",
      personalEmail: "mike.chen.personal@yahoo.com",
      phone: "+1 (555) 234-5678",
      address: {
        street: "789 Sunset Boulevard, Unit 12",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "United States",
      },
      location: "Los Angeles, CA",
      status: "active",
      rating: 4.9,
      eventsCompleted: 31,
      joinDate: "2023-11-08",
      manager: "Emily Davis",
      managerId: "3",
      department: "Field Operations",
      employeeId: "EMP-2023-007",
      shirtSize: "L",
      lastDeviceType: "Samsung Galaxy S24",
      emergencyContact: {
        name: "Linda Chen",
        relationship: "Mother",
        phone: "+1 (555) 876-5432",
      },
      personalInfo: {
        dateOfBirth: "1992-08-22",
        ssn: "***-**-9876",
        workEligibility: "Green Card Holder",
        driversLicense: "CA-D9876543",
      },
      bankingInfo: {
        accountType: "Direct Deposit",
        bankName: "Chase Bank",
        routingLast4: "5678",
      },
      specialties: ["Trade Shows", "Retail Activation"],
      avatar: "/avatars/michael.jpg",
      bio: "Senior brand agent with extensive experience in trade shows and retail activation campaigns. Known for exceptional client relationships.",
      skills: [
        { name: "Trade Show Management", level: 98 },
        { name: "Retail Activation", level: 95 },
        { name: "Client Relations", level: 93 },
        { name: "Team Leadership", level: 87 },
      ],
      recentEvents: [
        {
          id: 4,
          name: "Retail Expo 2024",
          date: "2024-06-12",
          status: "completed",
          rating: 5.0,
        },
        {
          id: 5,
          name: "Brand Activation Campaign",
          date: "2024-06-08",
          status: "completed",
          rating: 4.8,
        },
        {
          id: 6,
          name: "Trade Show Demo",
          date: "2024-06-01",
          status: "completed",
          rating: 4.9,
        },
      ],
      performance: {
        onTimeRate: 98,
        customerSatisfaction: 4.9,
        eventCompletionRate: 100,
        responseTime: "< 1 hour",
      },
      certifications: [
        "Trade Show Specialist",
        "Retail Marketing Certification",
        "Team Leadership Training",
      ],
    },
    "3": {
      id: "3",
      name: "Emily Davis",
      role: "Field Manager",
      email: "emily.davis@rishievents.com",
      personalEmail: "emily.davis.work@outlook.com",
      phone: "+1 (555) 345-6789",
      address: {
        street: "456 Oak Avenue",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        country: "United States",
      },
      location: "Portland, OR",
      status: "active",
      rating: 4.9,
      eventsCompleted: 45,
      joinDate: "2022-03-10",
      manager: "Director of Operations",
      managerId: "dir-001",
      department: "Field Operations",
      employeeId: "EMP-2022-003",
      shirtSize: "S",
      lastDeviceType: 'iPad Pro 11"',
      emergencyContact: {
        name: "Robert Davis",
        relationship: "Father",
        phone: "+1 (555) 654-3210",
      },
      personalInfo: {
        dateOfBirth: "1988-11-30",
        ssn: "***-**-1234",
        workEligibility: "US Citizen",
        driversLicense: "OR-D1122334",
      },
      bankingInfo: {
        accountType: "Direct Deposit",
        bankName: "Bank of America",
        routingLast4: "9876",
      },
      specialties: ["Team Management", "Operations"],
      avatar: "/avatars/emily.jpg",
      bio: "Experienced field manager overseeing multiple brand agents and ensuring operational excellence across all events.",
      skills: [
        { name: "Team Management", level: 95 },
        { name: "Operations", level: 92 },
        { name: "Strategic Planning", level: 88 },
        { name: "Quality Assurance", level: 90 },
      ],
      recentEvents: [],
      performance: {
        onTimeRate: 99,
        customerSatisfaction: 4.9,
        eventCompletionRate: 100,
        responseTime: "< 30 minutes",
      },
      certifications: [
        "Management Training",
        "Operations Excellence",
        "Safety Coordinator",
      ],
    },
  };

  return members[id as keyof typeof members] || null;
};

export async function generateMetadata({
  params,
}: TeamMemberDetailsProps): Promise<Metadata> {
  const { id } = await params;
  const member = getTeamMemberById(id);

  if (!member) {
    return {
      title: "Team Member Not Found | Rishi Workforce Management",
    };
  }

  return {
    title: `${member.name} - Team Member Profile | Rishi Workforce Management`,
    description: `View ${member.name}'s profile, performance metrics, and event history`,
  };
}

export default async function TeamMemberDetailsPage({
  params,
}: TeamMemberDetailsProps) {
  const { id } = await params;
  const member = getTeamMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/team">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Team Member Profile
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Detailed information and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-lg">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <h2 className="text-2xl font-bold">{member.name}</h2>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {member.bio}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{member.location}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      Joined {new Date(member.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end space-y-2 w-full lg:w-auto">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-xl font-bold">{member.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center lg:text-right">
                {member.eventsCompleted} events completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 min-w-max sm:min-w-full">
            <TabsTrigger value="personal" className="text-xs sm:text-sm">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="work" className="text-xs sm:text-sm">
              Work Details
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              Recent Events
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs sm:text-sm">
              Skills
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs sm:text-sm">
              Emergency
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Work Email</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Personal Email</p>
                    <p className="text-sm text-muted-foreground">
                      {member.personalEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm text-muted-foreground">
                      {member.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Smartphone className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Last Device</p>
                    <p className="text-sm text-muted-foreground">
                      {member.lastDeviceType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-green-600" />
                  Address Information
                </CardTitle>
                <CardDescription>Residential address details</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Home Address</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{member.address.street}</p>
                        <p>
                          {member.address.city}, {member.address.state}{" "}
                          {member.address.zipCode}
                        </p>
                        <p>{member.address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-600" />
                  Personal Details
                </CardTitle>
                <CardDescription>
                  Identity and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="text-sm">
                        {new Date(
                          member.personalInfo.dateOfBirth,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        SSN
                      </p>
                      <p className="text-sm">{member.personalInfo.ssn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Work Eligibility
                      </p>
                      <p className="text-sm">
                        {member.personalInfo.workEligibility}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Driver's License
                      </p>
                      <p className="text-sm">
                        {member.personalInfo.driversLicense}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uniform & Equipment */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-orange-600" />
                  Uniform & Equipment
                </CardTitle>
                <CardDescription>
                  Size and equipment information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <User className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Shirt Size
                      </p>
                      <p className="text-lg font-semibold">
                        {member.shirtSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Device Type
                      </p>
                      <p className="text-sm">{member.lastDeviceType}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employment Details */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Employment Details
                </CardTitle>
                <CardDescription>Official work information</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Employee ID</p>
                      <p className="text-sm text-muted-foreground">
                        {member.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Building className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Direct Manager</p>
                      <p className="text-sm text-muted-foreground">
                        {member.manager}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Hire Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Banking Information
                </CardTitle>
                <CardDescription>Payroll and payment details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      {member.bankingInfo.accountType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Building className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Bank Name</p>
                    <p className="text-sm text-muted-foreground">
                      {member.bankingInfo.bankName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Routing (Last 4)</p>
                    <p className="text-sm text-muted-foreground">
                      ****{member.bankingInfo.routingLast4}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  Current performance metrics and ratings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600">
                      {member.performance.onTimeRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      On-time Rate
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                    <div className="text-2xl font-bold text-green-600">
                      {member.performance.customerSatisfaction}/5.0
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer Rating
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600">
                      {member.performance.eventCompletionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completion Rate
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
                    <div className="text-2xl font-bold text-orange-600">
                      {member.performance.responseTime}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Response Time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emergency Contact */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Primary emergency contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <User className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      {member.emergencyContact.name}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {member.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      Emergency Phone
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {member.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common profile management actions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  asChild
                >
                  <Link href={`/team/${member.id}/edit`}>
                    <Edit className="h-4 w-4 mr-3" />
                    Edit Profile Details
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  asChild
                >
                  <Link href={`/team/${member.id}/assign`}>
                    <UserPlus className="h-4 w-4 mr-3" />
                    Assign to Event
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  asChild
                >
                  <Link href={`/team/${member.id}/message`}>
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Send Message
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12">
                  <Calendar className="h-4 w-4 mr-3" />
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">On-time Rate</span>
                  <span className="font-medium">
                    {member.performance.onTimeRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-medium">
                    {member.performance.customerSatisfaction}/5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-medium">
                    {member.performance.eventCompletionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="font-medium">
                    {member.performance.responseTime}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">On-time Rate</span>
                    <span className="text-sm">
                      {member.performance.onTimeRate}%
                    </span>
                  </div>
                  <Progress
                    value={member.performance.onTimeRate}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Event Completion
                    </span>
                    <span className="text-sm">
                      {member.performance.eventCompletionRate}%
                    </span>
                  </div>
                  <Progress
                    value={member.performance.eventCompletionRate}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Customer Satisfaction
                    </span>
                    <span className="text-sm">
                      {member.performance.customerSatisfaction}/5.0
                    </span>
                  </div>
                  <Progress
                    value={(member.performance.customerSatisfaction / 5) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Stats</CardTitle>
                <CardDescription>Current month performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Events Completed</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours Logged</span>
                    <span className="font-bold">64</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Feedback</span>
                    <span className="font-bold">12 positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Latest event assignments and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {member.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <Badge variant="secondary">{event.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{event.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>Proficiency levels in key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {member.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Professional certifications and training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {member.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
