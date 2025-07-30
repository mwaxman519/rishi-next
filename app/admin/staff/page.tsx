&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Users, UserPlus, UserCheck, UserX, Clock } from &quot;lucide-react&quot;;

export default function StaffPage() {
  return (
    <div className=&quot;p-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>Staff Management</h1>
          <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
            Manage staff members, schedules, and availability
          </p>
        </div>
        <Button>
          <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
          Add Staff Member
        </Button>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6&quot;>
        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <Users className=&quot;h-4 w-4 mr-2&quot; />
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>247</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <UserCheck className=&quot;h-4 w-4 mr-2&quot; />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>189</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Ready to work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <Clock className=&quot;h-4 w-4 mr-2&quot; />
              On Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>34</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <UserX className=&quot;h-4 w-4 mr-2&quot; />
              Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-red-600&quot;>24</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Not available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>Manage and view all staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;space-y-3&quot;>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <div className=&quot;w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold&quot;>
                  M
                </div>
                <div>
                  <div className=&quot;font-semibold&quot;>Mike Johnson</div>
                  <div className=&quot;text-sm text-gray-600&quot;>Super Admin</div>
                </div>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Available</Badge>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>View</Button>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <div className=&quot;w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold&quot;>
                  S
                </div>
                <div>
                  <div className=&quot;font-semibold&quot;>Sarah Davis</div>
                  <div className=&quot;text-sm text-gray-600&quot;>Internal Admin</div>
                </div>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-blue-600&quot;>Working</Badge>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>View</Button>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <div className=&quot;w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold&quot;>
                  J
                </div>
                <div>
                  <div className=&quot;font-semibold&quot;>John Smith</div>
                  <div className=&quot;text-sm text-gray-600&quot;>Field Manager</div>
                </div>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Available</Badge>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>View</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Management Tools</CardTitle>
          <CardDescription>Manage staff schedules and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-3&quot;>
            <Button variant=&quot;outline&quot;>
              <Users className=&quot;h-4 w-4 mr-2&quot; />
              View All Staff
            </Button>
            <Button variant=&quot;outline&quot;>
              <Clock className=&quot;h-4 w-4 mr-2&quot; />
              Schedule Manager
            </Button>
            <Button variant=&quot;outline&quot;>
              <UserCheck className=&quot;h-4 w-4 mr-2&quot; />
              Availability Tracker
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}