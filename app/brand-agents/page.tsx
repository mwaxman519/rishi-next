import { Metadata } from &quot;next&quot;;
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  Mail,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;

export const metadata: Metadata = {
  title: &quot;Brand Agents | Rishi Workforce Management&quot;,
  description: &quot;Manage your brand agent team and assignments&quot;,
};

const mockAgents = [
  {
    id: 1,
    name: &quot;Sarah Johnson&quot;,
    email: &quot;sarah.johnson@email.com&quot;,
    phone: &quot;+1 (555) 123-4567&quot;,
    status: &quot;active&quot;,
    rating: 4.8,
    completedEvents: 24,
    location: &quot;New York, NY&quot;,
    skills: [&quot;Product Demo&quot;, &quot;Customer Service&quot;, &quot;Sales&quot;],
    avatar: null,
  },
  {
    id: 2,
    name: &quot;Michael Chen&quot;,
    email: &quot;michael.chen@email.com&quot;,
    phone: &quot;+1 (555) 234-5678&quot;,
    status: &quot;active&quot;,
    rating: 4.9,
    completedEvents: 31,
    location: &quot;Los Angeles, CA&quot;,
    skills: [&quot;Event Setup&quot;, &quot;Logistics&quot;, &quot;Team Lead&quot;],
    avatar: null,
  },
  {
    id: 3,
    name: &quot;Emily Rodriguez&quot;,
    email: &quot;emily.rodriguez@email.com&quot;,
    phone: &quot;+1 (555) 345-6789&quot;,
    status: &quot;unavailable&quot;,
    rating: 4.7,
    completedEvents: 18,
    location: &quot;Chicago, IL&quot;,
    skills: [&quot;Brand Activation&quot;, &quot;Social Media&quot;, &quot;Photography&quot;],
    avatar: null,
  },
  {
    id: 4,
    name: &quot;David Thompson&quot;,
    email: &quot;david.thompson@email.com&quot;,
    phone: &quot;+1 (555) 456-7890&quot;,
    status: &quot;active&quot;,
    rating: 4.6,
    completedEvents: 22,
    location: &quot;Houston, TX&quot;,
    skills: [&quot;Technical Support&quot;, &quot;Training&quot;, &quot;Equipment&quot;],
    avatar: null,
  },
];

export default function BrandAgentsPage() {
  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Brand Agents</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage your brand agent team and assignments
          </p>
        </div>
        <Button>
          <Plus className=&quot;h-4 w-4 mr-2&quot; />
          Add Agent
        </Button>
      </div>

      {/* Filters */}
      <div className=&quot;flex gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4&quot; />
          <Input placeholder=&quot;Search agents...&quot; className=&quot;pl-10&quot; />
        </div>
        <Button variant=&quot;outline&quot;>
          <Filter className=&quot;h-4 w-4 mr-2&quot; />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Agents</CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>24</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Active Today</CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>18</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>75% availability</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Avg Rating</CardTitle>
            <Star className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>4.7</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Based on client feedback
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Events This Month
            </CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>142</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {mockAgents.map((agent) => (
          <Card key={agent.id} className=&quot;hover:shadow-md transition-shadow&quot;>
            <CardHeader>
              <div className=&quot;flex items-center space-x-4&quot;>
                <Avatar className=&quot;h-12 w-12&quot;>
                  <AvatarImage
                    src={agent.avatar || undefined}
                    alt={agent.name}
                  />
                  <AvatarFallback>
                    {agent.name
                      .split(&quot; &quot;)
                      .map((n) => n[0])
                      .join("&quot;)}
                  </AvatarFallback>
                </Avatar>
                <div className=&quot;flex-1&quot;>
                  <CardTitle className=&quot;text-lg&quot;>{agent.name}</CardTitle>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Badge
                      variant={
                        agent.status === &quot;active&quot; ? &quot;default&quot; : &quot;secondary&quot;
                      }
                    >
                      {agent.status}
                    </Badge>
                    <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                      <Star className=&quot;h-3 w-3 mr-1 fill-current text-yellow-500&quot; />
                      {agent.rating}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                  <MapPin className=&quot;h-4 w-4 mr-2&quot; />
                  {agent.location}
                </div>
                <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                  <Mail className=&quot;h-4 w-4 mr-2&quot; />
                  {agent.email}
                </div>
                <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                  <Phone className=&quot;h-4 w-4 mr-2&quot; />
                  {agent.phone}
                </div>
              </div>

              <div>
                <p className=&quot;text-sm font-medium mb-2&quot;>Skills</p>
                <div className=&quot;flex flex-wrap gap-1&quot;>
                  {agent.skills.map((skill) => (
                    <Badge key={skill} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className=&quot;pt-2 border-t&quot;>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  <span className=&quot;font-medium&quot;>{agent.completedEvents}</span>{&quot; &quot;}
                  events completed
                </p>
              </div>

              <div className=&quot;flex gap-2 pt-2&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;flex-1&quot;>
                  View Profile
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;flex-1">
                  Assign Event
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
