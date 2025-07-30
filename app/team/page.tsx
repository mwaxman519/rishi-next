import { Metadata } from &quot;next&quot;;
import Link from &quot;next/link&quot;;
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
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;

export const metadata: Metadata = {
  title: &quot;Team Management | Rishi Workforce Management&quot;,
  description: &quot;Manage your team members and assignments&quot;,
};

// Generate sample team members to simulate large team dataset
const generateTeamMembers = () => {
  const firstNames = [
    &quot;Sarah&quot;,
    &quot;Michael&quot;,
    &quot;Emily&quot;,
    &quot;David&quot;,
    &quot;Jessica&quot;,
    &quot;Ryan&quot;,
    &quot;Ashley&quot;,
    &quot;Kevin&quot;,
    &quot;Amanda&quot;,
    &quot;Brandon&quot;,
    &quot;Stephanie&quot;,
    &quot;Tyler&quot;,
    &quot;Rachel&quot;,
    &quot;Justin&quot;,
    &quot;Nicole&quot;,
    &quot;Matthew&quot;,
    &quot;Lauren&quot;,
    &quot;Daniel&quot;,
    &quot;Megan&quot;,
    &quot;Christopher&quot;,
    &quot;Hannah&quot;,
    &quot;Andrew&quot;,
    &quot;Brittany&quot;,
    &quot;Joshua&quot;,
    &quot;Samantha&quot;,
    &quot;Nicholas&quot;,
    &quot;Elizabeth&quot;,
    &quot;Anthony&quot;,
    &quot;Taylor&quot;,
    &quot;William&quot;,
  ];
  const lastNames = [
    &quot;Johnson&quot;,
    &quot;Chen&quot;,
    &quot;Rodriguez&quot;,
    &quot;Park&quot;,
    &quot;Smith&quot;,
    &quot;Williams&quot;,
    &quot;Brown&quot;,
    &quot;Davis&quot;,
    &quot;Miller&quot;,
    &quot;Wilson&quot;,
    &quot;Moore&quot;,
    &quot;Taylor&quot;,
    &quot;Anderson&quot;,
    &quot;Thomas&quot;,
    &quot;Jackson&quot;,
    &quot;White&quot;,
    &quot;Harris&quot;,
    &quot;Martin&quot;,
    &quot;Thompson&quot;,
    &quot;Garcia&quot;,
    &quot;Martinez&quot;,
    &quot;Robinson&quot;,
    &quot;Clark&quot;,
    &quot;Lewis&quot;,
    &quot;Lee&quot;,
    &quot;Walker&quot;,
    &quot;Hall&quot;,
    &quot;Allen&quot;,
    &quot;Young&quot;,
    &quot;King&quot;,
  ];
  const cities = [
    &quot;San Francisco, CA&quot;,
    &quot;Los Angeles, CA&quot;,
    &quot;Chicago, IL&quot;,
    &quot;Seattle, WA&quot;,
    &quot;New York, NY&quot;,
    &quot;Boston, MA&quot;,
    &quot;Austin, TX&quot;,
    &quot;Denver, CO&quot;,
    &quot;Portland, OR&quot;,
    &quot;Miami, FL&quot;,
  ];
  const specialties = [
    [&quot;Product Demo&quot;, &quot;Corporate Events&quot;],
    [&quot;Trade Shows&quot;, &quot;Retail Activation&quot;],
    [&quot;Consumer Events&quot;, &quot;Sampling&quot;],
    [&quot;Tech Events&quot;, &quot;B2B Demos&quot;],
    [&quot;Fashion Shows&quot;, &quot;Pop-up Events&quot;],
    [&quot;Food Sampling&quot;, &quot;Store Activation&quot;],
    [&quot;Auto Shows&quot;, &quot;Product Launch&quot;],
    [&quot;Health & Wellness&quot;, &quot;Fitness Events&quot;],
    [&quot;Gaming Events&quot;, &quot;Tech Conferences&quot;],
    [&quot;Beauty Events&quot;, &quot;Lifestyle Shows&quot;],
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
      role: Math.random() > 0.7 ? &quot;Lead Brand Agent&quot; : &quot;Brand Agent&quot;,
      status:
        Math.random() > 0.8
          ? Math.random() > 0.5
            ? &quot;inactive&quot;
            : &quot;on_leave&quot;
          : &quot;active&quot;,
      location: cities[Math.floor(Math.random() * cities.length)],
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      eventsCompleted: Math.floor(Math.random() * 50) + 1,
      availability: Math.random() > 0.3 ? &quot;available&quot; : &quot;busy&quot;,
      specialties: specialties[Math.floor(Math.random() * specialties.length)],
    });
  }

  return teamMembers;
};

const teamMembers = generateTeamMembers();

export default function TeamPage() {
  return (
    <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
      <div className=&quot;container mx-auto p-4 space-y-6&quot;>
        {/* Header */}
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex justify-between items-center&quot;>
              <div>
                <h1 className=&quot;text-2xl font-bold text-gray-900 dark:text-white&quot;>
                  Team Management
                </h1>
                <p className=&quot;text-gray-600 dark:text-gray-400 text-sm mt-1&quot;>
                  Manage your brand agents and team assignments
                </p>
              </div>
              <Button className=&quot;bg-blue-600 hover:bg-blue-700 text-white&quot;>
                <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
                Add Team Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400&quot;>
                    Total Members
                  </p>
                  <p className=&quot;text-xl font-bold text-gray-900 dark:text-white&quot;>
                    {teamMembers.length}
                  </p>
                </div>
                <Users className=&quot;h-6 w-6 text-blue-600&quot; />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400&quot;>
                    Active Members
                  </p>
                  <p className=&quot;text-xl font-bold text-gray-900 dark:text-white&quot;>
                    {teamMembers.filter((m) => m.status === &quot;active&quot;).length}
                  </p>
                </div>
                <Activity className=&quot;h-6 w-6 text-green-600&quot; />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400&quot;>
                    Total Events
                  </p>
                  <p className=&quot;text-xl font-bold text-gray-900 dark:text-white&quot;>
                    {teamMembers.reduce((sum, m) => sum + m.eventsCompleted, 0)}
                  </p>
                </div>
                <Award className=&quot;h-6 w-6 text-purple-600&quot; />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400&quot;>
                    Avg Rating
                  </p>
                  <p className=&quot;text-xl font-bold text-gray-900 dark:text-white&quot;>
                    {(
                      teamMembers.reduce((sum, m) => sum + m.rating, 0) /
                      teamMembers.length
                    ).toFixed(1)}
                  </p>
                </div>
                <Star className=&quot;h-6 w-6 text-orange-600&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className=&quot;p-0&quot;>
            {/* Filters and Search */}
            <div className=&quot;p-4 border-b border-gray-200 dark:border-gray-600&quot;>
              <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
                <div className=&quot;flex-1&quot;>
                  <div className=&quot;relative&quot;>
                    <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4&quot; />
                    <Input
                      placeholder=&quot;Search team members...&quot;
                      className=&quot;pl-10&quot;
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className=&quot;w-[180px]&quot;>
                    <SelectValue placeholder=&quot;Filter by status&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                    <SelectItem value=&quot;active&quot;>Active</SelectItem>
                    <SelectItem value=&quot;inactive&quot;>Inactive</SelectItem>
                    <SelectItem value=&quot;on_leave&quot;>On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className=&quot;w-[180px]&quot;>
                    <SelectValue placeholder=&quot;Filter by role&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Roles</SelectItem>
                    <SelectItem value=&quot;brand-agent&quot;>Brand Agent</SelectItem>
                    <SelectItem value=&quot;lead-brand-agent&quot;>
                      Lead Brand Agent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Members List */}
            <div className=&quot;divide-y divide-gray-200 dark:divide-gray-600&quot;>
              {/* Table Header */}
              <div className=&quot;grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300&quot;>
                <div className=&quot;col-span-3&quot;>Name</div>
                <div className=&quot;col-span-2&quot;>Role</div>
                <div className=&quot;col-span-1&quot;>Status</div>
                <div className=&quot;col-span-2&quot;>Location</div>
                <div className=&quot;col-span-1&quot;>Rating</div>
                <div className=&quot;col-span-1&quot;>Events</div>
                <div className=&quot;col-span-1&quot;>Availability</div>
                <div className=&quot;col-span-1&quot;>Actions</div>
              </div>

              {/* Team Members Rows */}
              {teamMembers.slice(0, 20).map((member) => (
                <div
                  key={member.id}
                  className=&quot;grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors&quot;
                >
                  <div className=&quot;col-span-3 flex items-center space-x-3&quot;>
                    <Avatar className=&quot;h-10 w-10&quot;>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className=&quot;bg-blue-500 text-white text-sm font-medium&quot;>
                        {member.name
                          .split(&quot; &quot;)
                          .map((n) => n[0])
                          .join("&quot;)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className=&quot;font-medium text-gray-900 dark:text-white&quot;>
                        {member.name}
                      </div>
                      <div className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className=&quot;col-span-2 flex items-center&quot;>
                    <span className=&quot;text-sm text-gray-700 dark:text-gray-300&quot;>
                      {member.role}
                    </span>
                  </div>

                  <div className=&quot;col-span-1 flex items-center&quot;>
                    <Badge
                      variant={
                        member.status === &quot;active&quot;
                          ? &quot;default&quot;
                          : member.status === &quot;inactive&quot;
                            ? &quot;destructive&quot;
                            : &quot;secondary&quot;
                      }
                      className=&quot;text-xs&quot;
                    >
                      {member.status === &quot;active&quot;
                        ? &quot;Active&quot;
                        : member.status === &quot;inactive&quot;
                          ? &quot;Inactive&quot;
                          : &quot;On Leave&quot;}
                    </Badge>
                  </div>

                  <div className=&quot;col-span-2 flex items-center&quot;>
                    <div className=&quot;flex items-center text-sm text-gray-600 dark:text-gray-400&quot;>
                      <MapPin className=&quot;h-3 w-3 mr-1 text-gray-400 dark:text-gray-500&quot; />
                      {member.location}
                    </div>
                  </div>

                  <div className=&quot;col-span-1 flex items-center&quot;>
                    <div className=&quot;flex items-center&quot;>
                      <Star className=&quot;h-3 w-3 text-yellow-500 fill-current mr-1&quot; />
                      <span className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300&quot;>
                        {member.rating}
                      </span>
                    </div>
                  </div>

                  <div className=&quot;col-span-1 flex items-center&quot;>
                    <span className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300&quot;>
                      {member.eventsCompleted}
                    </span>
                  </div>

                  <div className=&quot;col-span-1 flex items-center&quot;>
                    <Badge
                      variant={
                        member.availability === &quot;available&quot;
                          ? &quot;outline&quot;
                          : &quot;secondary&quot;
                      }
                      className=&quot;text-xs&quot;
                    >
                      {member.availability === &quot;available&quot;
                        ? &quot;Available&quot;
                        : &quot;Busy&quot;}
                    </Badge>
                  </div>

                  <div className=&quot;col-span-1 flex items-center&quot;>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant=&quot;ghost&quot;
                          size=&quot;sm&quot;
                          className=&quot;h-8 w-8 p-0&quot;
                        >
                          <MoreVertical className=&quot;h-4 w-4&quot; />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align=&quot;end&quot;>
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
                          <Mail className=&quot;h-4 w-4 mr-2&quot; />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className=&quot;h-4 w-4 mr-2&quot; />
                          Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className=&quot;flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-600&quot;>
              <div className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>
                Showing 1-20 of {teamMembers.length} team members
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; disabled>
                  Previous
                </Button>
                <Button variant=&quot;default&quot; size=&quot;sm&quot;>
                  1
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  2
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  3
                </Button>
                <span className=&quot;text-gray-400 dark:text-gray-500&quot;>...</span>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  {Math.ceil(teamMembers.length / 20)}
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;sm">
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
