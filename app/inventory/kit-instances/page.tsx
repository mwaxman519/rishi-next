/**
 * Kit Instances Management Page
 * Displays and manages deployed kit instances in the field
 */

import { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Plus,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kit Instances | Rishi Platform",
  description: "Manage deployed kit instances and track their usage in the field",
};

// Mock data for demonstration
const mockKitInstances = [
  {
    id: "ki-001",
    templateName: "Sativa Solutions - LA Metro",
    templateId: "kt-001",
    instanceCode: "SS-LA-001",
    location: "Venice Beach Dispensary",
    assignedTo: "Sarah Johnson",
    status: "deployed",
    deployedAt: "2025-01-08T10:00:00Z",
    lastUpdate: "2025-01-09T14:30:00Z",
    itemCount: 15,
    consumedItems: 3,
    condition: "excellent",
    notes: "All items in good condition. Sample products replenished yesterday."
  },
  {
    id: "ki-002",
    templateName: "Indica Dreams - Orange County",
    templateId: "kt-002",
    instanceCode: "ID-OC-001",
    location: "Newport Cannabis Co.",
    assignedTo: "Mike Chen",
    status: "in-transit",
    deployedAt: "2025-01-09T08:00:00Z",
    lastUpdate: "2025-01-09T15:45:00Z",
    itemCount: 12,
    consumedItems: 0,
    condition: "good",
    notes: "En route to location. ETA 4:30 PM."
  },
  {
    id: "ki-003",
    templateName: "Hybrid Heaven - San Diego",
    templateId: "kt-003",
    instanceCode: "HH-SD-001",
    location: "Hillcrest Green Medicine",
    assignedTo: "Alex Rodriguez",
    status: "needs-replenishment",
    deployedAt: "2025-01-07T12:00:00Z",
    lastUpdate: "2025-01-09T11:15:00Z",
    itemCount: 18,
    consumedItems: 12,
    condition: "fair",
    notes: "Running low on pamphlets and samples. Replenishment requested."
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "deployed":
      return "bg-green-100 text-green-800";
    case "in-transit":
      return "bg-blue-100 text-blue-800";
    case "needs-replenishment":
      return "bg-yellow-100 text-yellow-800";
    case "maintenance":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "deployed":
      return <CheckCircle className="h-4 w-4" />;
    case "in-transit":
      return <Clock className="h-4 w-4" />;
    case "needs-replenishment":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

function KitInstancesContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kit Instances</h1>
          <p className="text-gray-600 mt-1">
            Track and manage deployed kit instances in the field
          </p>
        </div>
        <Link href="/inventory/new-kit">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Deploy New Kit
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search kit instances..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deployed</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Replenishment</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kit Instances List */}
      <div className="grid gap-4">
        {mockKitInstances.map((instance) => (
          <Card key={instance.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{instance.templateName}</CardTitle>
                    <p className="text-sm text-gray-600">Code: {instance.instanceCode}</p>
                  </div>
                </div>
                <Badge className={`flex items-center gap-1 ${getStatusColor(instance.status)}`}>
                  {getStatusIcon(instance.status)}
                  {instance.status.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{instance.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="font-medium">{instance.assignedTo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Deployed</p>
                    <p className="font-medium">
                      {new Date(instance.deployedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">
                      {instance.itemCount - instance.consumedItems} / {instance.itemCount}
                    </p>
                  </div>
                </div>
              </div>
              
              {instance.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{instance.notes}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Update Status
                </Button>
                {instance.status === "needs-replenishment" && (
                  <Button variant="outline" size="sm" className="text-yellow-600">
                    Request Replenishment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function KitInstancesPage() {
  return (
    <Suspense fallback={<div>Loading kit instances...</div>}>
      <KitInstancesContent />
    </Suspense>
  );
}