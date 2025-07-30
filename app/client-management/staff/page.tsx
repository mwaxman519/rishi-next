&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Users,
  User,
  Plus,
  Search,
  MoreVertical,
  Edit,
  CalendarClock,
  Phone,
  Mail,
  ClipboardCheck,
  AlertCircle,
  Trash2,
} from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;../../components/ui/dropdown-menu&quot;;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;../../components/ui/table&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;

// Mock data for staff

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const { checkPermission } = useAuthorization();

  // Filter staff based on search query
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const data = await response.json();
          setStaff(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case &quot;active&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            Active
          </Badge>
        );
      case &quot;on leave&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;
          >
            On Leave
          </Badge>
        );
      case &quot;training&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-blue-50 text-blue-700 border-blue-200&quot;
          >
            Training
          </Badge>
        );
      case &quot;inactive&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-gray-50 text-gray-700 border-gray-200&quot;
          >
            Inactive
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  // Function to get certification badge
  const getCertificationBadge = (certified: boolean) => {
    return certified ? (
      <Badge
        variant=&quot;outline&quot;
        className=&quot;bg-green-50 text-green-700 border-green-200&quot;
      >
        Certified
      </Badge>
    ) : (
      <Badge
        variant=&quot;outline&quot;
        className=&quot;bg-red-50 text-red-700 border-red-200&quot;
      >
        Not Certified
      </Badge>
    );
  };

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
            Staff Management
          </h1>
          <p className=&quot;mt-1 text-gray-600 dark:text-gray-400&quot;>
            Manage client staff assignments and scheduling
          </p>
        </div>

        <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
            <Input
              type=&quot;search&quot;
              placeholder=&quot;Search staff...&quot;
              className=&quot;pl-8 w-full sm:w-[250px]&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className=&quot;flex items-center gap-1&quot;
            disabled={!checkPermission(&quot;assign:staff&quot;)}
          >
            <Plus className=&quot;h-4 w-4&quot; /> Assign Staff
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className=&quot;p-0&quot;>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=&quot;w-[250px]&quot;>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Client / Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>Assigned Since</TableHead>
                <TableHead className=&quot;text-right&quot;>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className=&quot;font-medium&quot;>
                      <div className=&quot;flex items-center&quot;>
                        <div className=&quot;flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3&quot;>
                          <User className=&quot;h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
                        </div>
                        <div>
                          <div>{staff.name}</div>
                          <div className=&quot;text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1&quot;>
                            <Mail className=&quot;h-3 w-3&quot; /> {staff.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>
                      <div>
                        <div className=&quot;font-medium&quot;>{staff.client}</div>
                        <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                          {staff.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell>
                      {getCertificationBadge(staff.certified)}
                    </TableCell>
                    <TableCell>{staff.assignedSince}</TableCell>
                    <TableCell className=&quot;text-right&quot;>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                            <MoreVertical className=&quot;h-4 w-4&quot; />
                            <span className=&quot;sr-only&quot;>Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=&quot;end&quot;>
                          <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;edit:staff&quot;)}
                          >
                            <Edit className=&quot;h-4 w-4 mr-2&quot; /> Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;schedule:staff&quot;)}
                          >
                            <CalendarClock className=&quot;h-4 w-4 mr-2&quot; /> View
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className=&quot;cursor-pointer&quot;>
                            <Phone className=&quot;h-4 w-4 mr-2&quot; /> Contact
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {staff.certified ? (
                            <DropdownMenuItem
                              className=&quot;cursor-pointer text-yellow-600&quot;
                              disabled={
                                !checkPermission(&quot;manage:certifications&quot;)
                              }
                            >
                              <AlertCircle className=&quot;h-4 w-4 mr-2&quot; /> Revoke
                              Certification
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className=&quot;cursor-pointer text-green-600&quot;
                              disabled={
                                !checkPermission(&quot;manage:certifications&quot;)
                              }
                            >
                              <ClipboardCheck className=&quot;h-4 w-4 mr-2&quot; /> Mark
                              as Certified
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className=&quot;cursor-pointer text-red-600&quot;
                            disabled={!checkPermission(&quot;remove:staff&quot;)}
                          >
                            <Trash2 className=&quot;h-4 w-4 mr-2&quot; /> Remove
                            Assignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className=&quot;text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No staff assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
