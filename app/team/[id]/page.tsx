import { Metadata } from &quot;next&quot;;
import { notFound } from &quot;next/navigation&quot;;
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
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import Link from &quot;next/link&quot;;

interface TeamMemberDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data for team member details
const getTeamMemberById = (id: string) => {
  const members = {
    &quot;1&quot;: {
      id: &quot;1&quot;,
      name: &quot;Sarah Johnson&quot;,
      role: &quot;Brand Agent&quot;,
      email: &quot;sarah.johnson@rishievents.com&quot;,
      personalEmail: &quot;sarah.j.personal@gmail.com&quot;,
      phone: &quot;+1 (555) 123-4567&quot;,
      address: {
        street: &quot;1234 Market Street, Apt 5B&quot;,
        city: &quot;San Francisco&quot;,
        state: &quot;CA&quot;,
        zipCode: &quot;94103&quot;,
        country: &quot;United States&quot;,
      },
      location: &quot;San Francisco, CA&quot;,
      status: &quot;active&quot;,
      rating: 4.8,
      eventsCompleted: 24,
      joinDate: &quot;2024-01-15&quot;,
      manager: &quot;Emily Davis&quot;,
      managerId: &quot;3&quot;,
      department: &quot;Field Operations&quot;,
      employeeId: &quot;EMP-2024-001&quot;,
      shirtSize: &quot;M&quot;,
      lastDeviceType: &quot;iPhone 14 Pro&quot;,
      emergencyContact: {
        name: &quot;John Johnson&quot;,
        relationship: &quot;Spouse&quot;,
        phone: &quot;+1 (555) 987-6543&quot;,
      },
      personalInfo: {
        dateOfBirth: &quot;1995-03-15&quot;,
        ssn: &quot;***-**-4567&quot;,
        workEligibility: &quot;US Citizen&quot;,
        driversLicense: &quot;CA-D1234567&quot;,
      },
      bankingInfo: {
        accountType: &quot;Direct Deposit&quot;,
        bankName: &quot;Wells Fargo&quot;,
        routingLast4: &quot;1234&quot;,
      },
      specialties: [&quot;Product Demo&quot;, &quot;Corporate Events&quot;],
      avatar: &quot;/avatars/sarah.jpg&quot;,
      bio: &quot;Experienced brand agent with 3+ years in product demonstrations and corporate events. Specializes in tech product launches and B2B engagement.&quot;,
      skills: [
        { name: &quot;Product Demo&quot;, level: 95 },
        { name: &quot;Public Speaking&quot;, level: 88 },
        { name: &quot;Customer Engagement&quot;, level: 92 },
        { name: &quot;Event Coordination&quot;, level: 85 },
      ],
      recentEvents: [
        {
          id: 1,
          name: &quot;Tech Conference 2024&quot;,
          date: &quot;2024-06-10&quot;,
          status: &quot;completed&quot;,
          rating: 4.9,
        },
        {
          id: 2,
          name: &quot;Product Launch Demo&quot;,
          date: &quot;2024-06-05&quot;,
          status: &quot;completed&quot;,
          rating: 4.7,
        },
        {
          id: 3,
          name: &quot;Corporate Training&quot;,
          date: &quot;2024-05-28&quot;,
          status: &quot;completed&quot;,
          rating: 4.8,
        },
      ],
      performance: {
        onTimeRate: 96,
        customerSatisfaction: 4.8,
        eventCompletionRate: 100,
        responseTime: &quot;< 2 hours&quot;,
      },
      certifications: [
        &quot;Brand Ambassador Certification&quot;,
        &quot;Product Demo Specialist&quot;,
        &quot;Corporate Events Training&quot;,
      ],
    },
    &quot;2&quot;: {
      id: &quot;2&quot;,
      name: &quot;Michael Chen&quot;,
      role: &quot;Brand Agent&quot;,
      email: &quot;michael.chen@rishievents.com&quot;,
      personalEmail: &quot;mike.chen.personal@yahoo.com&quot;,
      phone: &quot;+1 (555) 234-5678&quot;,
      address: {
        street: &quot;789 Sunset Boulevard, Unit 12&quot;,
        city: &quot;Los Angeles&quot;,
        state: &quot;CA&quot;,
        zipCode: &quot;90210&quot;,
        country: &quot;United States&quot;,
      },
      location: &quot;Los Angeles, CA&quot;,
      status: &quot;active&quot;,
      rating: 4.9,
      eventsCompleted: 31,
      joinDate: &quot;2023-11-08&quot;,
      manager: &quot;Emily Davis&quot;,
      managerId: &quot;3&quot;,
      department: &quot;Field Operations&quot;,
      employeeId: &quot;EMP-2023-007&quot;,
      shirtSize: &quot;L&quot;,
      lastDeviceType: &quot;Samsung Galaxy S24&quot;,
      emergencyContact: {
        name: &quot;Linda Chen&quot;,
        relationship: &quot;Mother&quot;,
        phone: &quot;+1 (555) 876-5432&quot;,
      },
      personalInfo: {
        dateOfBirth: &quot;1992-08-22&quot;,
        ssn: &quot;***-**-9876&quot;,
        workEligibility: &quot;Green Card Holder&quot;,
        driversLicense: &quot;CA-D9876543&quot;,
      },
      bankingInfo: {
        accountType: &quot;Direct Deposit&quot;,
        bankName: &quot;Chase Bank&quot;,
        routingLast4: &quot;5678&quot;,
      },
      specialties: [&quot;Trade Shows&quot;, &quot;Retail Activation&quot;],
      avatar: &quot;/avatars/michael.jpg&quot;,
      bio: &quot;Senior brand agent with extensive experience in trade shows and retail activation campaigns. Known for exceptional client relationships.&quot;,
      skills: [
        { name: &quot;Trade Show Management&quot;, level: 98 },
        { name: &quot;Retail Activation&quot;, level: 95 },
        { name: &quot;Client Relations&quot;, level: 93 },
        { name: &quot;Team Leadership&quot;, level: 87 },
      ],
      recentEvents: [
        {
          id: 4,
          name: &quot;Retail Expo 2024&quot;,
          date: &quot;2024-06-12&quot;,
          status: &quot;completed&quot;,
          rating: 5.0,
        },
        {
          id: 5,
          name: &quot;Brand Activation Campaign&quot;,
          date: &quot;2024-06-08&quot;,
          status: &quot;completed&quot;,
          rating: 4.8,
        },
        {
          id: 6,
          name: &quot;Trade Show Demo&quot;,
          date: &quot;2024-06-01&quot;,
          status: &quot;completed&quot;,
          rating: 4.9,
        },
      ],
      performance: {
        onTimeRate: 98,
        customerSatisfaction: 4.9,
        eventCompletionRate: 100,
        responseTime: &quot;< 1 hour&quot;,
      },
      certifications: [
        &quot;Trade Show Specialist&quot;,
        &quot;Retail Marketing Certification&quot;,
        &quot;Team Leadership Training&quot;,
      ],
    },
    &quot;3&quot;: {
      id: &quot;3&quot;,
      name: &quot;Emily Davis&quot;,
      role: &quot;Field Manager&quot;,
      email: &quot;emily.davis@rishievents.com&quot;,
      personalEmail: &quot;emily.davis.work@outlook.com&quot;,
      phone: &quot;+1 (555) 345-6789&quot;,
      address: {
        street: &quot;456 Oak Avenue&quot;,
        city: &quot;Portland&quot;,
        state: &quot;OR&quot;,
        zipCode: &quot;97201&quot;,
        country: &quot;United States&quot;,
      },
      location: &quot;Portland, OR&quot;,
      status: &quot;active&quot;,
      rating: 4.9,
      eventsCompleted: 45,
      joinDate: &quot;2022-03-10&quot;,
      manager: &quot;Director of Operations&quot;,
      managerId: &quot;dir-001&quot;,
      department: &quot;Field Operations&quot;,
      employeeId: &quot;EMP-2022-003&quot;,
      shirtSize: &quot;S&quot;,
      lastDeviceType: 'iPad Pro 11&quot;',
      emergencyContact: {
        name: &quot;Robert Davis&quot;,
        relationship: &quot;Father&quot;,
        phone: &quot;+1 (555) 654-3210&quot;,
      },
      personalInfo: {
        dateOfBirth: &quot;1988-11-30&quot;,
        ssn: &quot;***-**-1234&quot;,
        workEligibility: &quot;US Citizen&quot;,
        driversLicense: &quot;OR-D1122334&quot;,
      },
      bankingInfo: {
        accountType: &quot;Direct Deposit&quot;,
        bankName: &quot;Bank of America&quot;,
        routingLast4: &quot;9876&quot;,
      },
      specialties: [&quot;Team Management&quot;, &quot;Operations&quot;],
      avatar: &quot;/avatars/emily.jpg&quot;,
      bio: &quot;Experienced field manager overseeing multiple brand agents and ensuring operational excellence across all events.&quot;,
      skills: [
        { name: &quot;Team Management&quot;, level: 95 },
        { name: &quot;Operations&quot;, level: 92 },
        { name: &quot;Strategic Planning&quot;, level: 88 },
        { name: &quot;Quality Assurance&quot;, level: 90 },
      ],
      recentEvents: [],
      performance: {
        onTimeRate: 99,
        customerSatisfaction: 4.9,
        eventCompletionRate: 100,
        responseTime: &quot;< 30 minutes&quot;,
      },
      certifications: [
        &quot;Management Training&quot;,
        &quot;Operations Excellence&quot;,
        &quot;Safety Coordinator&quot;,
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
      title: &quot;Team Member Not Found | Rishi Workforce Management&quot;,
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
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header with Back Button */}
      <div className=&quot;flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4&quot;>
        <Button variant=&quot;outline&quot; size=&quot;sm&quot; asChild className=&quot;w-fit&quot;>
          <Link href=&quot;/team&quot;>
            <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
            Back to Team
          </Link>
        </Button>
        <div className=&quot;flex-1&quot;>
          <h1 className=&quot;text-2xl sm:text-3xl font-bold tracking-tight&quot;>
            Team Member Profile
          </h1>
          <p className=&quot;text-muted-foreground text-sm sm:text-base&quot;>
            Detailed information and performance metrics
          </p>
        </div>
        <div className=&quot;flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2&quot;>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;w-full sm:w-auto&quot;>
            <MessageSquare className=&quot;h-4 w-4 mr-2&quot; />
            Send Message
          </Button>
          <Button size=&quot;sm&quot; className=&quot;w-full sm:w-auto&quot;>
            <Edit className=&quot;h-4 w-4 mr-2&quot; />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className=&quot;p-6&quot;>
          <div className=&quot;flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-6&quot;>
            <div className=&quot;flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto&quot;>
              <Avatar className=&quot;h-24 w-24 flex-shrink-0&quot;>
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className=&quot;text-lg&quot;>
                  {member.name
                    .split(&quot; &quot;)
                    .map((n) => n[0])
                    .join(&quot;&quot;)}
                </AvatarFallback>
              </Avatar>

              <div className=&quot;flex-1 text-center sm:text-left space-y-4&quot;>
                <div>
                  <div className=&quot;flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3&quot;>
                    <h2 className=&quot;text-2xl font-bold&quot;>{member.name}</h2>
                    <Badge
                      variant={
                        member.status === &quot;active&quot; ? &quot;default&quot; : &quot;secondary&quot;
                      }
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <p className=&quot;text-lg text-muted-foreground&quot;>{member.role}</p>
                  <p className=&quot;text-sm text-muted-foreground mt-2&quot;>
                    {member.bio}
                  </p>
                </div>

                <div className=&quot;grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3&quot;>
                  <div className=&quot;flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg&quot;>
                    <Mail className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                    <span className=&quot;text-sm truncate&quot;>{member.email}</span>
                  </div>
                  <div className=&quot;flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg&quot;>
                    <Phone className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                    <span className=&quot;text-sm truncate&quot;>{member.phone}</span>
                  </div>
                  <div className=&quot;flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg&quot;>
                    <MapPin className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                    <span className=&quot;text-sm truncate&quot;>{member.location}</span>
                  </div>
                  <div className=&quot;flex items-center justify-center sm:justify-start space-x-2 min-w-0 p-2 bg-muted/30 rounded-lg&quot;>
                    <Calendar className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                    <span className=&quot;text-sm truncate&quot;>
                      Joined {new Date(member.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className=&quot;flex flex-col items-center lg:items-end space-y-2 w-full lg:w-auto&quot;>
              <div className=&quot;flex items-center space-x-1&quot;>
                <Star className=&quot;h-5 w-5 text-yellow-400&quot; />
                <span className=&quot;text-xl font-bold&quot;>{member.rating}</span>
              </div>
              <p className=&quot;text-sm text-muted-foreground text-center lg:text-right&quot;>
                {member.eventsCompleted} events completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue=&quot;personal&quot; className=&quot;space-y-6&quot;>
        <div className=&quot;w-full overflow-x-auto&quot;>
          <TabsList className=&quot;grid w-full grid-cols-3 sm:grid-cols-6 min-w-max sm:min-w-full&quot;>
            <TabsTrigger value=&quot;personal&quot; className=&quot;text-xs sm:text-sm&quot;>
              Personal Info
            </TabsTrigger>
            <TabsTrigger value=&quot;work&quot; className=&quot;text-xs sm:text-sm&quot;>
              Work Details
            </TabsTrigger>
            <TabsTrigger value=&quot;performance&quot; className=&quot;text-xs sm:text-sm&quot;>
              Performance
            </TabsTrigger>
            <TabsTrigger value=&quot;events&quot; className=&quot;text-xs sm:text-sm&quot;>
              Recent Events
            </TabsTrigger>
            <TabsTrigger value=&quot;skills&quot; className=&quot;text-xs sm:text-sm&quot;>
              Skills
            </TabsTrigger>
            <TabsTrigger value=&quot;emergency&quot; className=&quot;text-xs sm:text-sm&quot;>
              Emergency
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value=&quot;personal&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {/* Contact Information */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Mail className=&quot;h-5 w-5 mr-2 text-blue-600&quot; />
                  Contact Information
                </CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Mail className=&quot;h-4 w-4 text-blue-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Work Email</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Mail className=&quot;h-4 w-4 text-green-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Personal Email</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.personalEmail}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Phone className=&quot;h-4 w-4 text-purple-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Phone Number</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.phone}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Smartphone className=&quot;h-4 w-4 text-orange-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Last Device</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.lastDeviceType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Home className=&quot;h-5 w-5 mr-2 text-green-600&quot; />
                  Address Information
                </CardTitle>
                <CardDescription>Residential address details</CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-3&quot;>
                  <div className=&quot;flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <MapPin className=&quot;h-4 w-4 text-green-600 mt-0.5&quot; />
                    <div className=&quot;flex-1&quot;>
                      <p className=&quot;text-sm font-medium&quot;>Home Address</p>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        <p>{member.address.street}</p>
                        <p>
                          {member.address.city}, {member.address.state}{&quot; &quot;}
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
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <User className=&quot;h-5 w-5 mr-2 text-purple-600&quot; />
                  Personal Details
                </CardTitle>
                <CardDescription>
                  Identity and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;grid grid-cols-2 gap-4&quot;>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Calendar className=&quot;h-4 w-4 text-purple-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        Date of Birth
                      </p>
                      <p className=&quot;text-sm&quot;>
                        {new Date(
                          member.personalInfo.dateOfBirth,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Shield className=&quot;h-4 w-4 text-blue-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        SSN
                      </p>
                      <p className=&quot;text-sm&quot;>{member.personalInfo.ssn}</p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Shield className=&quot;h-4 w-4 text-green-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        Work Eligibility
                      </p>
                      <p className=&quot;text-sm&quot;>
                        {member.personalInfo.workEligibility}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <CreditCard className=&quot;h-4 w-4 text-orange-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        Driver's License
                      </p>
                      <p className=&quot;text-sm&quot;>
                        {member.personalInfo.driversLicense}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uniform & Equipment */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Building className=&quot;h-5 w-5 mr-2 text-orange-600&quot; />
                  Uniform & Equipment
                </CardTitle>
                <CardDescription>
                  Size and equipment information
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;grid grid-cols-2 gap-4&quot;>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <User className=&quot;h-4 w-4 text-orange-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        Shirt Size
                      </p>
                      <p className=&quot;text-lg font-semibold&quot;>
                        {member.shirtSize}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Smartphone className=&quot;h-4 w-4 text-blue-600&quot; />
                    <div>
                      <p className=&quot;text-xs font-medium text-muted-foreground&quot;>
                        Device Type
                      </p>
                      <p className=&quot;text-sm&quot;>{member.lastDeviceType}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;work&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {/* Employment Details */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Building className=&quot;h-5 w-5 mr-2 text-blue-600&quot; />
                  Employment Details
                </CardTitle>
                <CardDescription>Official work information</CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;grid grid-cols-1 gap-4&quot;>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <User className=&quot;h-4 w-4 text-blue-600&quot; />
                    <div>
                      <p className=&quot;text-sm font-medium&quot;>Employee ID</p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {member.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Building className=&quot;h-4 w-4 text-green-600&quot; />
                    <div>
                      <p className=&quot;text-sm font-medium&quot;>Department</p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Users className=&quot;h-4 w-4 text-purple-600&quot; />
                    <div>
                      <p className=&quot;text-sm font-medium&quot;>Direct Manager</p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {member.manager}
                      </p>
                    </div>
                  </div>
                  <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                    <Calendar className=&quot;h-4 w-4 text-orange-600&quot; />
                    <div>
                      <p className=&quot;text-sm font-medium&quot;>Hire Date</p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <CreditCard className=&quot;h-5 w-5 mr-2 text-green-600&quot; />
                  Banking Information
                </CardTitle>
                <CardDescription>Payroll and payment details</CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <CreditCard className=&quot;h-4 w-4 text-green-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Payment Method</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.bankingInfo.accountType}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Building className=&quot;h-4 w-4 text-blue-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Bank Name</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {member.bankingInfo.bankName}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50&quot;>
                  <Shield className=&quot;h-4 w-4 text-purple-600&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>Routing (Last 4)</p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      ****{member.bankingInfo.routingLast4}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className=&quot;lg:col-span-2 overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <TrendingUp className=&quot;h-5 w-5 mr-2 text-purple-600&quot; />
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  Current performance metrics and ratings
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;grid grid-cols-2 md:grid-cols-4 gap-6&quot;>
                  <div className=&quot;text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20&quot;>
                    <div className=&quot;text-2xl font-bold text-blue-600&quot;>
                      {member.performance.onTimeRate}%
                    </div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      On-time Rate
                    </div>
                  </div>
                  <div className=&quot;text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20&quot;>
                    <div className=&quot;text-2xl font-bold text-green-600&quot;>
                      {member.performance.customerSatisfaction}/5.0
                    </div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Customer Rating
                    </div>
                  </div>
                  <div className=&quot;text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20&quot;>
                    <div className=&quot;text-2xl font-bold text-purple-600&quot;>
                      {member.performance.eventCompletionRate}%
                    </div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Completion Rate
                    </div>
                  </div>
                  <div className=&quot;text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20&quot;>
                    <div className=&quot;text-2xl font-bold text-orange-600&quot;>
                      {member.performance.responseTime}
                    </div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Response Time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;emergency&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {/* Emergency Contact */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <AlertTriangle className=&quot;h-5 w-5 mr-2 text-red-600&quot; />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Primary emergency contact information
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-4&quot;>
                <div className=&quot;flex items-center space-x-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800&quot;>
                  <User className=&quot;h-5 w-5 text-red-600&quot; />
                  <div>
                    <p className=&quot;font-medium text-red-900 dark:text-red-100&quot;>
                      {member.emergencyContact.name}
                    </p>
                    <p className=&quot;text-sm text-red-700 dark:text-red-300&quot;>
                      {member.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
                <div className=&quot;flex items-center space-x-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800&quot;>
                  <Phone className=&quot;h-5 w-5 text-orange-600&quot; />
                  <div>
                    <p className=&quot;font-medium text-orange-900 dark:text-orange-100&quot;>
                      Emergency Phone
                    </p>
                    <p className=&quot;text-sm text-orange-700 dark:text-orange-300&quot;>
                      {member.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20&quot;>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common profile management actions
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-3&quot;>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start h-12&quot;
                  asChild
                >
                  <Link href={`/team/${member.id}/edit`}>
                    <Edit className=&quot;h-4 w-4 mr-3&quot; />
                    Edit Profile Details
                  </Link>
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start h-12&quot;
                  asChild
                >
                  <Link href={`/team/${member.id}/assign`}>
                    <UserPlus className=&quot;h-4 w-4 mr-3&quot; />
                    Assign to Event
                  </Link>
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start h-12&quot;
                  asChild
                >
                  <Link href={`/team/${member.id}/message`}>
                    <MessageSquare className=&quot;h-4 w-4 mr-3&quot; />
                    Send Message
                  </Link>
                </Button>
                <Button variant=&quot;outline&quot; className=&quot;w-full justify-start h-12&quot;>
                  <Calendar className=&quot;h-4 w-4 mr-3&quot; />
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;performance&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className=&quot;flex items-center&quot;>
                  <TrendingUp className=&quot;h-5 w-5 mr-2&quot; />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className=&quot;space-y-4&quot;>
                <div className=&quot;flex justify-between&quot;>
                  <span className=&quot;text-sm&quot;>On-time Rate</span>
                  <span className=&quot;font-medium&quot;>
                    {member.performance.onTimeRate}%
                  </span>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <span className=&quot;text-sm&quot;>Customer Satisfaction</span>
                  <span className=&quot;font-medium&quot;>
                    {member.performance.customerSatisfaction}/5.0
                  </span>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <span className=&quot;text-sm&quot;>Completion Rate</span>
                  <span className=&quot;font-medium&quot;>
                    {member.performance.eventCompletionRate}%
                  </span>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <span className=&quot;text-sm&quot;>Response Time</span>
                  <span className=&quot;font-medium&quot;>
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
                <div className=&quot;flex flex-wrap gap-2&quot;>
                  {member.specialties.map((specialty, index) => (
                    <Badge key={index} variant=&quot;outline&quot;>
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
              <CardContent className=&quot;space-y-2&quot;>
                <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                  <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
                  Assign to Event
                </Button>
                <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                  <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                  View Schedule
                </Button>
                <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                  <MessageSquare className=&quot;h-4 w-4 mr-2&quot; />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;performance&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className=&quot;space-y-6&quot;>
                <div>
                  <div className=&quot;flex justify-between mb-2&quot;>
                    <span className=&quot;text-sm font-medium&quot;>On-time Rate</span>
                    <span className=&quot;text-sm&quot;>
                      {member.performance.onTimeRate}%
                    </span>
                  </div>
                  <Progress
                    value={member.performance.onTimeRate}
                    className=&quot;h-2&quot;
                  />
                </div>
                <div>
                  <div className=&quot;flex justify-between mb-2&quot;>
                    <span className=&quot;text-sm font-medium&quot;>
                      Event Completion
                    </span>
                    <span className=&quot;text-sm&quot;>
                      {member.performance.eventCompletionRate}%
                    </span>
                  </div>
                  <Progress
                    value={member.performance.eventCompletionRate}
                    className=&quot;h-2&quot;
                  />
                </div>
                <div>
                  <div className=&quot;flex justify-between mb-2&quot;>
                    <span className=&quot;text-sm font-medium&quot;>
                      Customer Satisfaction
                    </span>
                    <span className=&quot;text-sm&quot;>
                      {member.performance.customerSatisfaction}/5.0
                    </span>
                  </div>
                  <Progress
                    value={(member.performance.customerSatisfaction / 5) * 100}
                    className=&quot;h-2&quot;
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
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span>Events Completed</span>
                    <span className=&quot;font-bold&quot;>8</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span>Hours Logged</span>
                    <span className=&quot;font-bold&quot;>64</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span>Average Rating</span>
                    <span className=&quot;font-bold&quot;>4.8/5.0</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span>Client Feedback</span>
                    <span className=&quot;font-bold&quot;>12 positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;events&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Latest event assignments and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {member.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className=&quot;flex items-center justify-between p-4 border rounded-lg&quot;
                  >
                    <div className=&quot;space-y-1&quot;>
                      <h4 className=&quot;font-medium&quot;>{event.name}</h4>
                      <div className=&quot;flex items-center space-x-4 text-sm text-muted-foreground&quot;>
                        <div className=&quot;flex items-center&quot;>
                          <Calendar className=&quot;h-3 w-3 mr-1&quot; />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <Badge variant=&quot;secondary&quot;>{event.status}</Badge>
                      </div>
                    </div>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Star className=&quot;h-4 w-4 text-yellow-400&quot; />
                      <span className=&quot;font-medium&quot;>{event.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;skills&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>Proficiency levels in key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-6&quot;>
                {member.skills.map((skill, index) => (
                  <div key={index}>
                    <div className=&quot;flex justify-between mb-2&quot;>
                      <span className=&quot;text-sm font-medium&quot;>{skill.name}</span>
                      <span className=&quot;text-sm&quot;>{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className=&quot;h-2&quot; />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;certifications&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Professional certifications and training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                {member.certifications.map((cert, index) => (
                  <div key={index} className=&quot;flex items-center space-x-3&quot;>
                    <Award className=&quot;h-5 w-5 text-green-600" />
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
