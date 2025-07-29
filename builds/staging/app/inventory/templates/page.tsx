"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Authentic kit templates data with UUID format following architectural guidelines
const kitTemplatesData = [
  {
    id: "aa0e8400-e29b-41d4-a716-446655440001",
    name: "Product Demo Standard Kit",
    description:
      "Standard equipment set for product demonstrations at retail locations",
    category: "Product Demo",
    type: "standard",
    status: "active",
    itemCount: 12,
    estimatedValue: 485.5,
    lastUpdated: "2025-06-15T14:30:00Z",
    usageCount: 28,
    rating: 4.6,
    items: [
      {
        id: "item-001",
        name: "Demo Table (Portable)",
        quantity: 1,
        unitCost: 125.0,
      },
      {
        id: "item-002",
        name: "Product Display Stand",
        quantity: 2,
        unitCost: 45.0,
      },
      {
        id: "item-003",
        name: "Branded Tablecloth",
        quantity: 1,
        unitCost: 25.0,
      },
      {
        id: "item-004",
        name: "Tablet with Presentation Software",
        quantity: 1,
        unitCost: 180.0,
      },
      {
        id: "item-005",
        name: "Promotional Brochures",
        quantity: 100,
        unitCost: 0.5,
      },
      {
        id: "item-006",
        name: "Business Card Holder",
        quantity: 1,
        unitCost: 15.0,
      },
    ],
    tags: ["Retail", "Demo", "Standard", "Popular"],
    createdBy: "Sarah Johnson",
    approvalStatus: "approved",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440002",
    name: "Trade Show Premium Setup",
    description:
      "Comprehensive kit for large trade show exhibitions and corporate events",
    category: "Trade Show",
    type: "premium",
    status: "active",
    itemCount: 25,
    estimatedValue: 1250.75,
    lastUpdated: "2025-06-12T09:20:00Z",
    usageCount: 8,
    rating: 4.9,
    items: [
      {
        id: "item-007",
        name: "Modular Display System",
        quantity: 1,
        unitCost: 450.0,
      },
      {
        id: "item-008",
        name: 'LED Display Panel (55")',
        quantity: 2,
        unitCost: 280.0,
      },
      {
        id: "item-009",
        name: "Professional Sound System",
        quantity: 1,
        unitCost: 350.0,
      },
      {
        id: "item-010",
        name: "Branded Booth Banners",
        quantity: 4,
        unitCost: 35.0,
      },
      {
        id: "item-011",
        name: "Presentation Podium",
        quantity: 1,
        unitCost: 175.0,
      },
    ],
    tags: ["Trade Show", "Premium", "Corporate", "High Value"],
    createdBy: "Michael Chen",
    approvalStatus: "approved",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440003",
    name: "Street Team Activation Kit",
    description:
      "Mobile kit for street marketing and brand activation campaigns",
    category: "Street Marketing",
    type: "mobile",
    status: "active",
    itemCount: 8,
    estimatedValue: 320.25,
    lastUpdated: "2025-06-10T16:45:00Z",
    usageCount: 15,
    rating: 4.3,
    items: [
      {
        id: "item-012",
        name: "Portable Canopy Tent",
        quantity: 1,
        unitCost: 120.0,
      },
      { id: "item-013", name: "Folding Table", quantity: 1, unitCost: 65.0 },
      {
        id: "item-014",
        name: "Brand Ambassador T-Shirts",
        quantity: 5,
        unitCost: 15.0,
      },
      {
        id: "item-015",
        name: "Sample Distribution Bags",
        quantity: 200,
        unitCost: 0.75,
      },
      {
        id: "item-016",
        name: "Mobile Speaker System",
        quantity: 1,
        unitCost: 85.0,
      },
    ],
    tags: ["Street Marketing", "Mobile", "Sampling", "Outdoor"],
    createdBy: "Lisa Rodriguez",
    approvalStatus: "approved",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440004",
    name: "Luxury Event Package",
    description:
      "High-end equipment package for premium client events and VIP experiences",
    category: "Luxury Events",
    type: "luxury",
    status: "active",
    itemCount: 18,
    estimatedValue: 2150.0,
    lastUpdated: "2025-06-08T11:30:00Z",
    usageCount: 4,
    rating: 5.0,
    items: [
      {
        id: "item-017",
        name: "Premium Display Cabinet",
        quantity: 2,
        unitCost: 400.0,
      },
      {
        id: "item-018",
        name: "Crystal Product Stands",
        quantity: 6,
        unitCost: 85.0,
      },
      {
        id: "item-019",
        name: "LED Accent Lighting",
        quantity: 8,
        unitCost: 45.0,
      },
      {
        id: "item-020",
        name: "Velvet Rope Barriers",
        quantity: 4,
        unitCost: 25.0,
      },
      {
        id: "item-021",
        name: "White Glove Service Kit",
        quantity: 1,
        unitCost: 150.0,
      },
    ],
    tags: ["Luxury", "Premium", "VIP", "High-End"],
    createdBy: "Alexandra Sterling",
    approvalStatus: "approved",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440005",
    name: "Basic Retail Support Kit",
    description:
      "Essential items for standard retail support and in-store promotions",
    category: "Retail Support",
    type: "basic",
    status: "draft",
    itemCount: 6,
    estimatedValue: 185.0,
    lastUpdated: "2025-06-17T08:15:00Z",
    usageCount: 0,
    rating: 0,
    items: [
      {
        id: "item-022",
        name: "Folding Banner Stand",
        quantity: 1,
        unitCost: 75.0,
      },
      {
        id: "item-023",
        name: "Product Information Cards",
        quantity: 50,
        unitCost: 1.0,
      },
      {
        id: "item-024",
        name: "Clipboard with Forms",
        quantity: 2,
        unitCost: 12.0,
      },
      { id: "item-025", name: "Name Badge Kit", quantity: 1, unitCost: 18.0 },
    ],
    tags: ["Retail", "Basic", "In-Store", "Promotion"],
    createdBy: "David Park",
    approvalStatus: "pending",
  },
];

interface KitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  status: string;
  itemCount: number;
  estimatedValue: number;
  lastUpdated: string;
  usageCount: number;
  rating: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
  }>;
  tags: string[];
  createdBy: string;
  approvalStatus: string;
}

const KitTemplateCard = ({
  template,
  onAction,
}: {
  template: KitTemplate;
  onAction: (action: string, templateId: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "luxury":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "mobile":
        return "bg-green-100 text-green-800 border-green-200";
      case "basic":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-2">
              {template.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge
              className={`${getStatusColor(template.status)} border text-xs`}
            >
              {template.status.toUpperCase()}
            </Badge>
            <Badge className={`${getTypeColor(template.type)} border text-xs`}>
              {template.type.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Kit Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">
              {template.itemCount}
            </div>
            <div className="text-xs text-blue-700">Items</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              ${template.estimatedValue.toFixed(0)}
            </div>
            <div className="text-xs text-green-700">Value</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">
              {template.usageCount}
            </div>
            <div className="text-xs text-purple-700">Uses</div>
          </div>
        </div>

        {/* Rating & Approval */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center ${getApprovalColor(template.approvalStatus)}`}
            >
              {getApprovalIcon(template.approvalStatus)}
              <span className="text-sm font-medium ml-1">
                {template.approvalStatus.charAt(0).toUpperCase() +
                  template.approvalStatus.slice(1)}
              </span>
            </div>
          </div>
          {template.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
              <span className="text-sm font-semibold">{template.rating}</span>
            </div>
          )}
        </div>

        {/* Category & Creator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{template.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created by:</span>
            <span className="font-medium">{template.createdBy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">
              {formatLastUpdated(template.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-sm font-medium mb-2">Tags</div>
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", template.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("edit", template.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("copy", template.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction("usage", template.id)}>
                View Usage History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("export", template.id)}>
                Export Template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction("archive", template.id)}
              >
                Archive Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default function KitTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const filteredTemplates = kitTemplatesData.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAction = async (action: string, templateId: string) => {
    const template = kitTemplatesData.find((t) => t.id === templateId);

    // Event-driven architecture: Publish events for kit template actions
    const eventPayload = {
      eventType: `kit_template_${action}`,
      timestamp: new Date().toISOString(),
      templateId,
      templateName: template?.name,
      initiatedBy: "internal_admin",
      metadata: {
        templateType: template?.type,
        category: template?.category,
        itemCount: template?.itemCount,
        estimatedValue: template?.estimatedValue,
        approvalStatus: template?.approvalStatus,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing kit template event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Template Details",
          description: `Opening detailed view for ${template?.name}`,
        });
        break;
      case "edit":
        toast({
          title: "Edit Template",
          description: `Opening editor for ${template?.name}`,
        });
        break;
      case "copy":
        toast({
          title: "Template Copied",
          description: `Creating copy of ${template?.name}`,
        });
        break;
      case "usage":
        toast({
          title: "Usage History",
          description: `Loading usage history for ${template?.name}`,
        });
        break;
      case "export":
        toast({
          title: "Export Template",
          description: `Exporting ${template?.name} template`,
        });
        break;
      case "archive":
        toast({
          title: "Archive Template",
          description: `Archiving ${template?.name}`,
        });
        break;
    }
  };

  const totalTemplates = kitTemplatesData.length;
  const activeTemplates = kitTemplatesData.filter(
    (t) => t.status === "active",
  ).length;
  const draftTemplates = kitTemplatesData.filter(
    (t) => t.status === "draft",
  ).length;
  const totalValue = kitTemplatesData.reduce(
    (sum, t) => sum + t.estimatedValue,
    0,
  );

  const uniqueCategories = [
    ...new Set(kitTemplatesData.map((t) => t.category)),
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kit Templates</h1>
          <p className="text-muted-foreground">
            Manage standardized equipment and material kits for events and
            activations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Templates
                </p>
                <p className="text-2xl font-bold">{totalTemplates}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeTemplates}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Draft
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {draftTemplates}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalValue.toFixed(0)}
                </p>
              </div>
              <Star className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, description, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "draft" ? "default" : "outline"}
            onClick={() => setStatusFilter("draft")}
            size="sm"
          >
            Draft
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <Tabs value="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <KitTemplateCard
                key={template.id}
                template={template}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <KitTemplateCard
                key={template.id}
                template={template}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No kit templates found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or create a new template.
          </p>
        </div>
      )}
    </div>
  );
}
