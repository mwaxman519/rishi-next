&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import { kitsClient } from &quot;@/client/services/kits&quot;;
import { KitTemplateDTO } from &quot;@/services/kits&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import {
  Package,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit,
  Eye,
  MoreHorizontal,
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { formatDistanceToNow } from &quot;date-fns&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useOrganizationContext } from &quot;@/contexts/organization-context&quot;;

export default function KitTemplateList() {
  const router = useRouter();
  const { toast } = useToast();
  const { organization } = useOrganizationContext();
  const [templates, setTemplates] = useState<KitTemplateDTO[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<KitTemplateDTO[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [brandFilter, setBrandFilter] = useState(&quot;all&quot;);
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
        console.error(&quot;Error fetching templates:&quot;, err);
        setError(&quot;Failed to load templates. Please try again.&quot;);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to load kit templates&quot;,
          variant: &quot;destructive&quot;,
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
    if (statusFilter !== &quot;all&quot;) {
      results = results.filter((template) => {
        if (statusFilter === &quot;active&quot;) return template.active;
        if (statusFilter === &quot;inactive&quot;) return !template.active;
        if (statusFilter === &quot;pending&quot;)
          return template.approvalStatus === &quot;pending&quot;;
        if (statusFilter === &quot;approved&quot;)
          return template.approvalStatus === &quot;approved&quot;;
        if (statusFilter === &quot;rejected&quot;)
          return template.approvalStatus === &quot;rejected&quot;;
        return true;
      });
    }

    // Filter by brand
    if (brandFilter !== &quot;all&quot;) {
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
      case &quot;approved&quot;:
        approvalStatusBadge = (
          <Badge variant=&quot;success&quot; className=&quot;mr-2&quot;>
            Approved
          </Badge>
        );
        break;
      case &quot;rejected&quot;:
        approvalStatusBadge = (
          <Badge variant=&quot;destructive&quot; className=&quot;mr-2&quot;>
            Rejected
          </Badge>
        );
        break;
      case &quot;pending&quot;:
      default:
        approvalStatusBadge = (
          <Badge variant=&quot;outline&quot; className=&quot;mr-2&quot;>
            Pending Review
          </Badge>
        );
    }

    // Active/Inactive badge
    const activeBadge = template.active ? (
      <Badge variant=&quot;secondary&quot;>Active</Badge>
    ) : (
      <Badge variant=&quot;outline&quot; className=&quot;text-muted-foreground&quot;>
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
      <div className=&quot;flex justify-center items-center min-h-[500px]&quot;>
        <div className=&quot;inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]&quot;></div>
        <p className=&quot;ml-2&quot;>Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className=&quot;rounded-md bg-destructive/15 p-4 text-destructive&quot;>
        <p>{error}</p>
        <Button
          variant=&quot;outline&quot;
          className=&quot;mt-4&quot;
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex flex-col gap-4 md:flex-row md:items-center md:justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Kit Templates</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage and create kit templates for field operations
          </p>
        </div>
        <Button asChild>
          <Link href=&quot;/inventory/templates/new&quot;>
            <Plus className=&quot;mr-2 h-4 w-4&quot; /> Create Template
          </Link>
        </Button>
      </div>

      <div className=&quot;grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center&quot;>
        <div className=&quot;relative&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search templates...&quot;
            className=&quot;pl-8&quot;
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className=&quot;w-[180px]&quot;>
            <SlidersHorizontal className=&quot;mr-2 h-4 w-4&quot; />
            <SelectValue placeholder=&quot;Filter by status&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Statuses</SelectItem>
            <SelectItem value=&quot;active&quot;>Active</SelectItem>
            <SelectItem value=&quot;inactive&quot;>Inactive</SelectItem>
            <SelectItem value=&quot;pending&quot;>Pending Review</SelectItem>
            <SelectItem value=&quot;approved&quot;>Approved</SelectItem>
            <SelectItem value=&quot;rejected&quot;>Rejected</SelectItem>
          </SelectContent>
        </Select>
        {brands.length > 0 && (
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className=&quot;w-[180px]&quot;>
              <Filter className=&quot;mr-2 h-4 w-4&quot; />
              <SelectValue placeholder=&quot;Filter by brand&quot; />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;all&quot;>All Brands</SelectItem>
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
        <div className=&quot;rounded-md border border-dashed p-8 text-center&quot;>
          <Package className=&quot;mx-auto h-10 w-10 text-muted-foreground&quot; />
          <h3 className=&quot;mt-4 text-lg font-semibold&quot;>No templates found</h3>
          <p className=&quot;mt-2 text-sm text-muted-foreground&quot;>
            {templates.length === 0
              ? &quot;You haven&apos;t created any kit templates yet.&quot;
              : &quot;No templates match your current filters.&quot;}
          </p>
          {templates.length === 0 ? (
            <Button asChild className=&quot;mt-4&quot;>
              <Link href=&quot;/inventory/templates/new&quot;>
                <Plus className=&quot;mr-2 h-4 w-4&quot; /> Create Template
              </Link>
            </Button>
          ) : (
            <Button
              variant=&quot;outline&quot;
              className=&quot;mt-4&quot;
              onClick={() => {
                setSearchTerm(&quot;&quot;);
                setStatusFilter(&quot;all&quot;);
                setBrandFilter(&quot;all&quot;);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-3&quot;>
          {filteredTemplates.map((template) => (
            <Card key={template.id} className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;text-xl font-semibold&quot;>
                    {template.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant=&quot;ghost&quot; size=&quot;icon&quot; className=&quot;h-8 w-8&quot;>
                        <MoreHorizontal className=&quot;h-4 w-4&quot; />
                        <span className=&quot;sr-only&quot;>Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align=&quot;end&quot;>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/templates/${template.id}`}>
                          <Eye className=&quot;mr-2 h-4 w-4&quot; />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/templates/${template.id}/edit`}>
                          <Edit className=&quot;mr-2 h-4 w-4&quot; />
                          Edit Template
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className=&quot;mt-2&quot;>
                  {template.description || &quot;No description provided&quot;}
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;pb-3&quot;>
                <div className=&quot;space-y-4&quot;>
                  <div>
                    <div className=&quot;text-sm font-medium&quot;>Components</div>
                    <div className=&quot;mt-1&quot;>
                      <Badge variant=&quot;outline&quot;>
                        {template.components?.length || 0} Items
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className=&quot;text-sm font-medium&quot;>Brand</div>
                    <div className=&quot;mt-1 text-sm&quot;>
                      {template.brand?.name || `Brand ID: ${template.brandId}`}
                    </div>
                  </div>
                  <Separator />
                  <div className=&quot;flex flex-wrap gap-2&quot;>
                    {renderStatusBadge(template)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className=&quot;pt-1 text-xs text-muted-foreground&quot;>
                <div className=&quot;flex justify-between w-full&quot;>
                  <span>
                    Created{&quot; &quot;}
                    {formatDistanceToNow(new Date(template.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span>
                    Last updated{&quot; "}
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
