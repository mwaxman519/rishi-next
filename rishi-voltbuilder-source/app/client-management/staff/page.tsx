"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useAuthorization } from "../../hooks/useAuthorization";

// Mock data for staff

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
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
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "on leave":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            On Leave
          </Badge>
        );
      case "training":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Training
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to get certification badge
  const getCertificationBadge = (certified: boolean) => {
    return certified ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Certified
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Not Certified
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staff Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage client staff assignments and scheduling
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search staff..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className="flex items-center gap-1"
            disabled={!checkPermission("assign:staff")}
          >
            <Plus className="h-4 w-4" /> Assign Staff
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Client / Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>Assigned Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div>{staff.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" /> {staff.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{staff.client}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {staff.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell>
                      {getCertificationBadge(staff.certified)}
                    </TableCell>
                    <TableCell>{staff.assignedSince}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={!checkPermission("edit:staff")}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={!checkPermission("schedule:staff")}
                          >
                            <CalendarClock className="h-4 w-4 mr-2" /> View
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Phone className="h-4 w-4 mr-2" /> Contact
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {staff.certified ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-yellow-600"
                              disabled={
                                !checkPermission("manage:certifications")
                              }
                            >
                              <AlertCircle className="h-4 w-4 mr-2" /> Revoke
                              Certification
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600"
                              disabled={
                                !checkPermission("manage:certifications")
                              }
                            >
                              <ClipboardCheck className="h-4 w-4 mr-2" /> Mark
                              as Certified
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            disabled={!checkPermission("remove:staff")}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
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
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
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
