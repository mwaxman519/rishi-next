&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic kit templates data with UUID format following architectural guidelines
const kitTemplatesData = [
  {
    id: &quot;aa0e8400-e29b-41d4-a716-446655440001&quot;,
    name: &quot;Product Demo Standard Kit&quot;,
    description:
      &quot;Standard equipment set for product demonstrations at retail locations&quot;,
    category: &quot;Product Demo&quot;,
    type: &quot;standard&quot;,
    status: &quot;active&quot;,
    itemCount: 12,
    estimatedValue: 485.5,
    lastUpdated: &quot;2025-06-15T14:30:00Z&quot;,
    usageCount: 28,
    rating: 4.6,
    items: [
      {
        id: &quot;item-001&quot;,
        name: &quot;Demo Table (Portable)&quot;,
        quantity: 1,
        unitCost: 125.0,
      },
      {
        id: &quot;item-002&quot;,
        name: &quot;Product Display Stand&quot;,
        quantity: 2,
        unitCost: 45.0,
      },
      {
        id: &quot;item-003&quot;,
        name: &quot;Branded Tablecloth&quot;,
        quantity: 1,
        unitCost: 25.0,
      },
      {
        id: &quot;item-004&quot;,
        name: &quot;Tablet with Presentation Software&quot;,
        quantity: 1,
        unitCost: 180.0,
      },
      {
        id: &quot;item-005&quot;,
        name: &quot;Promotional Brochures&quot;,
        quantity: 100,
        unitCost: 0.5,
      },
      {
        id: &quot;item-006&quot;,
        name: &quot;Business Card Holder&quot;,
        quantity: 1,
        unitCost: 15.0,
      },
    ],
    tags: [&quot;Retail&quot;, &quot;Demo&quot;, &quot;Standard&quot;, &quot;Popular&quot;],
    createdBy: &quot;Sarah Johnson&quot;,
    approvalStatus: &quot;approved&quot;,
  },
  {
    id: &quot;aa0e8400-e29b-41d4-a716-446655440002&quot;,
    name: &quot;Trade Show Premium Setup&quot;,
    description:
      &quot;Comprehensive kit for large trade show exhibitions and corporate events&quot;,
    category: &quot;Trade Show&quot;,
    type: &quot;premium&quot;,
    status: &quot;active&quot;,
    itemCount: 25,
    estimatedValue: 1250.75,
    lastUpdated: &quot;2025-06-12T09:20:00Z&quot;,
    usageCount: 8,
    rating: 4.9,
    items: [
      {
        id: &quot;item-007&quot;,
        name: &quot;Modular Display System&quot;,
        quantity: 1,
        unitCost: 450.0,
      },
      {
        id: &quot;item-008&quot;,
        name: 'LED Display Panel (55&quot;)',
        quantity: 2,
        unitCost: 280.0,
      },
      {
        id: &quot;item-009&quot;,
        name: &quot;Professional Sound System&quot;,
        quantity: 1,
        unitCost: 350.0,
      },
      {
        id: &quot;item-010&quot;,
        name: &quot;Branded Booth Banners&quot;,
        quantity: 4,
        unitCost: 35.0,
      },
      {
        id: &quot;item-011&quot;,
        name: &quot;Presentation Podium&quot;,
        quantity: 1,
        unitCost: 175.0,
      },
    ],
    tags: [&quot;Trade Show&quot;, &quot;Premium&quot;, &quot;Corporate&quot;, &quot;High Value&quot;],
    createdBy: &quot;Michael Chen&quot;,
    approvalStatus: &quot;approved&quot;,
  },
  {
    id: &quot;aa0e8400-e29b-41d4-a716-446655440003&quot;,
    name: &quot;Street Team Activation Kit&quot;,
    description:
      &quot;Mobile kit for street marketing and brand activation campaigns&quot;,
    category: &quot;Street Marketing&quot;,
    type: &quot;mobile&quot;,
    status: &quot;active&quot;,
    itemCount: 8,
    estimatedValue: 320.25,
    lastUpdated: &quot;2025-06-10T16:45:00Z&quot;,
    usageCount: 15,
    rating: 4.3,
    items: [
      {
        id: &quot;item-012&quot;,
        name: &quot;Portable Canopy Tent&quot;,
        quantity: 1,
        unitCost: 120.0,
      },
      { id: &quot;item-013&quot;, name: &quot;Folding Table&quot;, quantity: 1, unitCost: 65.0 },
      {
        id: &quot;item-014&quot;,
        name: &quot;Brand Ambassador T-Shirts&quot;,
        quantity: 5,
        unitCost: 15.0,
      },
      {
        id: &quot;item-015&quot;,
        name: &quot;Sample Distribution Bags&quot;,
        quantity: 200,
        unitCost: 0.75,
      },
      {
        id: &quot;item-016&quot;,
        name: &quot;Mobile Speaker System&quot;,
        quantity: 1,
        unitCost: 85.0,
      },
    ],
    tags: [&quot;Street Marketing&quot;, &quot;Mobile&quot;, &quot;Sampling&quot;, &quot;Outdoor&quot;],
    createdBy: &quot;Lisa Rodriguez&quot;,
    approvalStatus: &quot;approved&quot;,
  },
  {
    id: &quot;aa0e8400-e29b-41d4-a716-446655440004&quot;,
    name: &quot;Luxury Event Package&quot;,
    description:
      &quot;High-end equipment package for premium client events and VIP experiences&quot;,
    category: &quot;Luxury Events&quot;,
    type: &quot;luxury&quot;,
    status: &quot;active&quot;,
    itemCount: 18,
    estimatedValue: 2150.0,
    lastUpdated: &quot;2025-06-08T11:30:00Z&quot;,
    usageCount: 4,
    rating: 5.0,
    items: [
      {
        id: &quot;item-017&quot;,
        name: &quot;Premium Display Cabinet&quot;,
        quantity: 2,
        unitCost: 400.0,
      },
      {
        id: &quot;item-018&quot;,
        name: &quot;Crystal Product Stands&quot;,
        quantity: 6,
        unitCost: 85.0,
      },
      {
        id: &quot;item-019&quot;,
        name: &quot;LED Accent Lighting&quot;,
        quantity: 8,
        unitCost: 45.0,
      },
      {
        id: &quot;item-020&quot;,
        name: &quot;Velvet Rope Barriers&quot;,
        quantity: 4,
        unitCost: 25.0,
      },
      {
        id: &quot;item-021&quot;,
        name: &quot;White Glove Service Kit&quot;,
        quantity: 1,
        unitCost: 150.0,
      },
    ],
    tags: [&quot;Luxury&quot;, &quot;Premium&quot;, &quot;VIP&quot;, &quot;High-End&quot;],
    createdBy: &quot;Alexandra Sterling&quot;,
    approvalStatus: &quot;approved&quot;,
  },
  {
    id: &quot;aa0e8400-e29b-41d4-a716-446655440005&quot;,
    name: &quot;Basic Retail Support Kit&quot;,
    description:
      &quot;Essential items for standard retail support and in-store promotions&quot;,
    category: &quot;Retail Support&quot;,
    type: &quot;basic&quot;,
    status: &quot;draft&quot;,
    itemCount: 6,
    estimatedValue: 185.0,
    lastUpdated: &quot;2025-06-17T08:15:00Z&quot;,
    usageCount: 0,
    rating: 0,
    items: [
      {
        id: &quot;item-022&quot;,
        name: &quot;Folding Banner Stand&quot;,
        quantity: 1,
        unitCost: 75.0,
      },
      {
        id: &quot;item-023&quot;,
        name: &quot;Product Information Cards&quot;,
        quantity: 50,
        unitCost: 1.0,
      },
      {
        id: &quot;item-024&quot;,
        name: &quot;Clipboard with Forms&quot;,
        quantity: 2,
        unitCost: 12.0,
      },
      { id: &quot;item-025&quot;, name: &quot;Name Badge Kit&quot;, quantity: 1, unitCost: 18.0 },
    ],
    tags: [&quot;Retail&quot;, &quot;Basic&quot;, &quot;In-Store&quot;, &quot;Promotion&quot;],
    createdBy: &quot;David Park&quot;,
    approvalStatus: &quot;pending&quot;,
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
      case &quot;active&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;draft&quot;:
        return &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;;
      case &quot;archived&quot;:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case &quot;standard&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-200&quot;;
      case &quot;premium&quot;:
        return &quot;bg-purple-100 text-purple-800 border-purple-200&quot;;
      case &quot;luxury&quot;:
        return &quot;bg-amber-100 text-amber-800 border-amber-200&quot;;
      case &quot;mobile&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;basic&quot;:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case &quot;approved&quot;:
        return &quot;text-green-600&quot;;
      case &quot;pending&quot;:
        return &quot;text-yellow-600&quot;;
      case &quot;rejected&quot;:
        return &quot;text-red-600&quot;;
      default:
        return &quot;text-gray-600&quot;;
    }
  };

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case &quot;approved&quot;:
        return <CheckCircle className=&quot;h-4 w-4&quot; />;
      case &quot;pending&quot;:
        return <AlertCircle className=&quot;h-4 w-4&quot; />;
      default:
        return <AlertCircle className=&quot;h-4 w-4&quot; />;
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return &quot;Yesterday&quot;;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex-1&quot;>
            <CardTitle className=&quot;text-lg&quot;>{template.name}</CardTitle>
            <CardDescription className=&quot;mt-2&quot;>
              {template.description}
            </CardDescription>
          </div>
          <div className=&quot;flex flex-col items-end space-y-1&quot;>
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

      <CardContent className=&quot;space-y-4&quot;>
        {/* Kit Metrics */}
        <div className=&quot;grid grid-cols-3 gap-4&quot;>
          <div className=&quot;text-center bg-blue-50 rounded-lg p-3&quot;>
            <div className=&quot;text-lg font-bold text-blue-600&quot;>
              {template.itemCount}
            </div>
            <div className=&quot;text-xs text-blue-700&quot;>Items</div>
          </div>
          <div className=&quot;text-center bg-green-50 rounded-lg p-3&quot;>
            <div className=&quot;text-lg font-bold text-green-600&quot;>
              ${template.estimatedValue.toFixed(0)}
            </div>
            <div className=&quot;text-xs text-green-700&quot;>Value</div>
          </div>
          <div className=&quot;text-center bg-purple-50 rounded-lg p-3&quot;>
            <div className=&quot;text-lg font-bold text-purple-600&quot;>
              {template.usageCount}
            </div>
            <div className=&quot;text-xs text-purple-700&quot;>Uses</div>
          </div>
        </div>

        {/* Rating & Approval */}
        <div className=&quot;flex items-center justify-between bg-gray-50 rounded-lg p-3&quot;>
          <div className=&quot;flex items-center space-x-2&quot;>
            <div
              className={`flex items-center ${getApprovalColor(template.approvalStatus)}`}
            >
              {getApprovalIcon(template.approvalStatus)}
              <span className=&quot;text-sm font-medium ml-1&quot;>
                {template.approvalStatus.charAt(0).toUpperCase() +
                  template.approvalStatus.slice(1)}
              </span>
            </div>
          </div>
          {template.rating > 0 && (
            <div className=&quot;flex items-center&quot;>
              <Star className=&quot;h-4 w-4 text-yellow-500 fill-current mr-1&quot; />
              <span className=&quot;text-sm font-semibold&quot;>{template.rating}</span>
            </div>
          )}
        </div>

        {/* Category & Creator */}
        <div className=&quot;space-y-2&quot;>
          <div className=&quot;flex items-center justify-between text-sm&quot;>
            <span className=&quot;text-muted-foreground&quot;>Category:</span>
            <span className=&quot;font-medium&quot;>{template.category}</span>
          </div>
          <div className=&quot;flex items-center justify-between text-sm&quot;>
            <span className=&quot;text-muted-foreground&quot;>Created by:</span>
            <span className=&quot;font-medium&quot;>{template.createdBy}</span>
          </div>
          <div className=&quot;flex items-center justify-between text-sm&quot;>
            <span className=&quot;text-muted-foreground&quot;>Updated:</span>
            <span className=&quot;font-medium&quot;>
              {formatLastUpdated(template.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className=&quot;text-sm font-medium mb-2&quot;>Tags</div>
          <div className=&quot;flex flex-wrap gap-1&quot;>
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                +{template.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2 border-t&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, template.id)}
          >
            <Eye className=&quot;h-4 w-4 mr-1&quot; />
            View
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;edit&quot;, template.id)}
          >
            <Edit className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;copy&quot;, template.id)}
          >
            <Copy className=&quot;h-4 w-4&quot; />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                <MoreVertical className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction(&quot;usage&quot;, template.id)}>
                View Usage History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(&quot;export&quot;, template.id)}>
                Export Template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction(&quot;archive&quot;, template.id)}
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
  const [searchQuery, setSearchQuery] = useState(&quot;&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [categoryFilter, setCategoryFilter] = useState(&quot;all&quot;);
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
      statusFilter === &quot;all&quot; || template.status === statusFilter;
    const matchesCategory =
      categoryFilter === &quot;all&quot; || template.category === categoryFilter;
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
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        templateType: template?.type,
        category: template?.category,
        itemCount: template?.itemCount,
        estimatedValue: template?.estimatedValue,
        approvalStatus: template?.approvalStatus,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing kit template event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Template Details&quot;,
          description: `Opening detailed view for ${template?.name}`,
        });
        break;
      case &quot;edit&quot;:
        toast({
          title: &quot;Edit Template&quot;,
          description: `Opening editor for ${template?.name}`,
        });
        break;
      case &quot;copy&quot;:
        toast({
          title: &quot;Template Copied&quot;,
          description: `Creating copy of ${template?.name}`,
        });
        break;
      case &quot;usage&quot;:
        toast({
          title: &quot;Usage History&quot;,
          description: `Loading usage history for ${template?.name}`,
        });
        break;
      case &quot;export&quot;:
        toast({
          title: &quot;Export Template&quot;,
          description: `Exporting ${template?.name} template`,
        });
        break;
      case &quot;archive&quot;:
        toast({
          title: &quot;Archive Template&quot;,
          description: `Archiving ${template?.name}`,
        });
        break;
    }
  };

  const totalTemplates = kitTemplatesData.length;
  const activeTemplates = kitTemplatesData.filter(
    (t) => t.status === &quot;active&quot;,
  ).length;
  const draftTemplates = kitTemplatesData.filter(
    (t) => t.status === &quot;draft&quot;,
  ).length;
  const totalValue = kitTemplatesData.reduce(
    (sum, t) => sum + t.estimatedValue,
    0,
  );

  const uniqueCategories = [
    ...new Set(kitTemplatesData.map((t) => t.category)),
  ];

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Kit Templates</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage standardized equipment and material kits for events and
            activations
          </p>
        </div>
        <Button>
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Templates
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalTemplates}</p>
              </div>
              <Package className=&quot;h-8 w-8 text-indigo-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Active
                </p>
                <p className=&quot;text-2xl font-bold text-green-600&quot;>
                  {activeTemplates}
                </p>
              </div>
              <CheckCircle className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Draft
                </p>
                <p className=&quot;text-2xl font-bold text-yellow-600&quot;>
                  {draftTemplates}
                </p>
              </div>
              <Edit className=&quot;h-8 w-8 text-yellow-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Value
                </p>
                <p className=&quot;text-2xl font-bold text-emerald-600&quot;>
                  ${totalValue.toFixed(0)}
                </p>
              </div>
              <Star className=&quot;h-8 w-8 text-emerald-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className=&quot;flex flex-col lg:flex-row gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search templates by name, description, category, or tags...&quot;
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=&quot;pl-10&quot;
          />
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button
            variant={statusFilter === &quot;all&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;all&quot;)}
            size=&quot;sm&quot;
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === &quot;active&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;active&quot;)}
            size=&quot;sm&quot;
          >
            Active
          </Button>
          <Button
            variant={statusFilter === &quot;draft&quot; ? &quot;default&quot; : &quot;outline&quot;}
            onClick={() => setStatusFilter(&quot;draft&quot;)}
            size=&quot;sm&quot;
          >
            Draft
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <Tabs value=&quot;grid&quot; className=&quot;w-full&quot;>
        <TabsList>
          <TabsTrigger value=&quot;grid&quot;>Grid View</TabsTrigger>
          <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;grid&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
            {filteredTemplates.map((template) => (
              <KitTemplateCard
                key={template.id}
                template={template}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;list&quot; className=&quot;mt-6&quot;>
          <div className=&quot;space-y-4&quot;>
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
        <div className=&quot;text-center py-12&quot;>
          <Package className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>No kit templates found</h3>
          <p className=&quot;mt-2 text-muted-foreground">
            Try adjusting your search criteria or create a new template.
          </p>
        </div>
      )}
    </div>
  );
}
