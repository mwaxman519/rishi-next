"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { kitsClient } from "@/client/services/kits";
import { KitTemplateDTO } from "@/services/kits";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useOrganizationContext } from "@/contexts/organization-context";

export default function KitTemplateList() {
  const router = useRouter();
  const { toast } = useToast();
  const { organization } = useOrganizationContext();
  const [templates, setTemplates] = useState<KitTemplateDTO[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<KitTemplateDTO[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await kitsClient.getTemplates();
        setTemplates(data);
        setFilteredTemplates(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load kit templates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Handle filtering when search term or filters change
  useEffect(() => {
    let results = templates;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter((template) => {
        if (statusFilter === "active") return template.active;
        if (statusFilter === "inactive") return !template.active;
        if (statusFilter === "pending")
          return template.approvalStatus === "pending";
        if (statusFilter === "approved")
          return template.approvalStatus === "approved";
        if (statusFilter === "rejected")
          return template.approvalStatus === "rejected";
        return true;
      });
    }

    // Filter by brand
    if (brandFilter !== "all") {
      results = results.filter(
        (template) => template.brandId.toString() === brandFilter,
      );
    }

    setFilteredTemplates(results);
  }, [searchTerm, statusFilter, brandFilter, templates]);

  // Get unique brands from templates
  const brands = Array.from(new Set(templates.map((t) => t.brandId))).map(
    (brandId) => {
      const template = templates.find((t) => t.brandId === brandId);
      return {
        id: brandId,
        name: template?.brand?.name || `Brand ${brandId}`,
      };
    },
  );

  const renderStatusBadge = (template: KitTemplateDTO) => {
    // Approval status badge
    let approvalStatusBadge;
    switch (template.approvalStatus) {
      case "approved":
        approvalStatusBadge = (
          <Badge variant="success" className="mr-2">
            Approved
          </Badge>
        );
        break;
      case "rejected":
        approvalStatusBadge = (
          <Badge variant="destructive" className="mr-2">
            Rejected
          </Badge>
        );
        break;
      case "pending":
      default:
        approvalStatusBadge = (
          <Badge variant="outline" className="mr-2">
            Pending Review
          </Badge>
        );
    }

    // Active/Inactive badge
    const activeBadge = template.active ? (
      <Badge variant="secondary">Active</Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        Inactive
      </Badge>
    );

    return (
      <>
        {approvalStatusBadge}
        {activeBadge}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
        <p className="ml-2">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kit Templates</h1>
          <p className="text-muted-foreground">
            Manage and create kit templates for field operations
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/templates/new">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {brands.length > 0 && (
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {templates.length === 0
              ? "You haven't created any kit templates yet."
              : "No templates match your current filters."}
          </p>
          {templates.length === 0 ? (
            <Button asChild className="mt-4">
              <Link href="/inventory/templates/new">
                <Plus className="mr-2 h-4 w-4" /> Create Template
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setBrandFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold">
                    {template.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/templates/${template.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/templates/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Template
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="mt-2">
                  {template.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Components</div>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {template.components?.length || 0} Items
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Brand</div>
                    <div className="mt-1 text-sm">
                      {template.brand?.name || `Brand ID: ${template.brandId}`}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {renderStatusBadge(template)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(template.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span>
                    Last updated{" "}
                    {formatDistanceToNow(new Date(template.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
