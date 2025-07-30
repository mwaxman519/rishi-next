&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import { kitsClient } from &quot;@/client/services/kits&quot;;
import { KitTemplateDTO, ComponentType } from &quot;@/services/kits&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import {
  Package,
  ArrowLeft,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Server,
  Wrench,
  ShoppingBag,
  Box,
  FileText,
  MoreHorizontal,
} from &quot;lucide-react&quot;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from &quot;@/components/ui/alert-dialog&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { format } from &quot;date-fns&quot;;
import { useSession } from &quot;next-auth/react&quot;;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from &quot;../../../components/ui/collapsible&quot;;

interface KitTemplateDetailProps {
  templateId: number;
  canApprove?: boolean;
}

export default function KitTemplateDetail({
  templateId,
  canApprove = false,
}: KitTemplateDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [template, setTemplate] = useState<KitTemplateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("&quot;);
  const [processingApproval, setProcessingApproval] = useState(false);

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await kitsClient.getTemplateById(templateId);
        setTemplate(data);
        setError(null);
      } catch (err) {
        console.error(&quot;Error fetching template:&quot;, err);
        setError(&quot;Failed to load template data. Please try again.&quot;);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to load template details&quot;,
          variant: &quot;destructive&quot;,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, toast]);

  // Handle template approval
  const handleApproveTemplate = async () => {
    if (!template) return;

    try {
      setProcessingApproval(true);
      await kitsClient.approveTemplate(template.id);

      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              approvalStatus: &quot;approved&quot;,
              approvedById: session?.user?.id,
            }
          : null,
      );

      toast({
        title: &quot;Success&quot;,
        description: &quot;Template approved successfully&quot;,
        variant: &quot;success&quot;,
      });

      setApprovalDialogOpen(false);
    } catch (err) {
      console.error(&quot;Error approving template:&quot;, err);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to approve template&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setProcessingApproval(false);
    }
  };

  // Handle template rejection
  const handleRejectTemplate = async () => {
    if (!template) return;

    try {
      setProcessingApproval(true);
      await kitsClient.rejectTemplate(template.id, rejectionReason);

      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              approvalStatus: &quot;rejected&quot;,
              approvalNotes: rejectionReason,
            }
          : null,
      );

      toast({
        title: &quot;Template Rejected&quot;,
        description: &quot;Template has been rejected with feedback&quot;,
        variant: &quot;default&quot;,
      });

      setRejectionDialogOpen(false);
      setRejectionReason(&quot;&quot;);
    } catch (err) {
      console.error(&quot;Error rejecting template:&quot;, err);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to reject template&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setProcessingApproval(false);
    }
  };

  // Render component type icon
  const getComponentTypeIcon = (type: ComponentType) => {
    switch (type) {
      case ComponentType.HARDWARE:
        return <Server className=&quot;h-4 w-4&quot; />;
      case ComponentType.TOOL:
        return <Wrench className=&quot;h-4 w-4&quot; />;
      case ComponentType.CONSUMABLE:
        return <ShoppingBag className=&quot;h-4 w-4&quot; />;
      case ComponentType.PACKAGING:
        return <Box className=&quot;h-4 w-4&quot; />;
      case ComponentType.DOCUMENTATION:
        return <FileText className=&quot;h-4 w-4&quot; />;
      default:
        return <Package className=&quot;h-4 w-4&quot; />;
    }
  };

  if (loading) {
    return (
      <div className=&quot;flex justify-center items-center min-h-[500px]&quot;>
        <div className=&quot;inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]&quot;></div>
        <p className=&quot;ml-2&quot;>Loading template details...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className=&quot;rounded-md bg-destructive/15 p-4 text-destructive&quot;>
        <p>{error || &quot;Template not found&quot;}</p>
        <Button variant=&quot;outline&quot; className=&quot;mt-4&quot; asChild>
          <Link href=&quot;/inventory/templates&quot;>
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; /> Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  const renderApprovalStatus = () => {
    switch (template.approvalStatus) {
      case &quot;approved&quot;:
        return (
          <div className=&quot;flex items-center text-green-600&quot;>
            <CheckCircle className=&quot;h-5 w-5 mr-2&quot; />
            <span>Approved</span>
          </div>
        );
      case &quot;rejected&quot;:
        return (
          <div className=&quot;flex items-center text-red-600&quot;>
            <XCircle className=&quot;h-5 w-5 mr-2&quot; />
            <span>Rejected</span>
          </div>
        );
      case &quot;pending&quot;:
      default:
        return (
          <div className=&quot;flex items-center text-amber-600&quot;>
            <AlertCircle className=&quot;h-5 w-5 mr-2&quot; />
            <span>Pending Review</span>
          </div>
        );
    }
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div className=&quot;flex items-center gap-2&quot;>
          <Button variant=&quot;outline&quot; size=&quot;icon&quot; asChild>
            <Link href=&quot;/inventory/templates&quot;>
              <ArrowLeft className=&quot;h-4 w-4&quot; />
            </Link>
          </Button>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>{template.name}</h1>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button variant=&quot;outline&quot; asChild>
            <Link href={`/inventory/templates/${templateId}/edit`}>
              <Edit className=&quot;mr-2 h-4 w-4&quot; /> Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;icon&quot;>
                <MoreHorizontal className=&quot;h-4 w-4&quot; />
                <span className=&quot;sr-only&quot;>More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align=&quot;end&quot;>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/inventory/templates/${templateId}/edit`}>
                  <Edit className=&quot;mr-2 h-4 w-4&quot; />
                  Edit Template
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Copy className=&quot;mr-2 h-4 w-4&quot; />
                Duplicate Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
        <div className=&quot;md:col-span-2 space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              {template.description && (
                <CardDescription className=&quot;mt-2&quot;>
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div>
                    <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Brand
                    </div>
                    <div>
                      {template.brand?.name || `Brand ID: ${template.brandId}`}
                    </div>
                  </div>
                  <div>
                    <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Status
                    </div>
                    <div className=&quot;flex items-center gap-3&quot;>
                      {renderApprovalStatus()}
                      <Separator orientation=&quot;vertical&quot; className=&quot;h-4&quot; />
                      {template.active ? (
                        <Badge variant=&quot;secondary&quot;>Active</Badge>
                      ) : (
                        <Badge
                          variant=&quot;outline&quot;
                          className=&quot;text-muted-foreground&quot;
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {template.instructions && (
                  <div>
                    <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Instructions
                    </div>
                    <div className=&quot;mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap&quot;>
                      {template.instructions}
                    </div>
                  </div>
                )}

                {template.approvalStatus === &quot;rejected&quot; &&
                  template.approvalNotes && (
                    <div className=&quot;bg-destructive/10 p-3 rounded-md border border-destructive/20&quot;>
                      <div className=&quot;text-sm font-medium text-destructive&quot;>
                        Rejection Reason
                      </div>
                      <div className=&quot;mt-1 text-destructive&quot;>
                        {template.approvalNotes}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between&quot;>
              <CardTitle>
                Components ({template.components?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.components && template.components.length > 0 ? (
                <div className=&quot;space-y-4&quot;>
                  {template.components.map((component, index) => (
                    <Collapsible key={component.id || index}>
                      <CollapsibleTrigger className=&quot;flex items-center justify-between w-full p-3 hover:bg-accent rounded-md&quot;>
                        <div className=&quot;flex items-center&quot;>
                          {getComponentTypeIcon(component.type)}
                          <span className=&quot;ml-2 font-medium&quot;>
                            {component.name}
                          </span>
                          {component.isRequired === false && (
                            <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                              Optional
                            </Badge>
                          )}
                        </div>
                        <div className=&quot;flex items-center gap-3&quot;>
                          <Badge variant=&quot;outline&quot;>
                            {component.quantity}{&quot; &quot;}
                            {component.quantity > 1 ? &quot;units&quot; : &quot;unit&quot;}
                          </Badge>
                          <ChevronRight className=&quot;h-4 w-4 transition-transform ui-expanded:rotate-90&quot; />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className=&quot;p-3 pl-8 bg-muted/50 rounded-md mt-1&quot;>
                        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                          <div>
                            <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                              Type
                            </div>
                            <div>{component.type}</div>
                          </div>
                          <div>
                            <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                              Quantity
                            </div>
                            <div>{component.quantity}</div>
                          </div>
                          {component.unitCost !== undefined && (
                            <div>
                              <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                                Unit Cost
                              </div>
                              <div>${component.unitCost?.toFixed(2)}</div>
                            </div>
                          )}
                          {component.sku && (
                            <div>
                              <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                                SKU
                              </div>
                              <div>{component.sku}</div>
                            </div>
                          )}
                          {component.barcode && (
                            <div>
                              <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                                Barcode
                              </div>
                              <div>{component.barcode}</div>
                            </div>
                          )}
                          {component.description && (
                            <div className=&quot;md:col-span-2&quot;>
                              <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                                Description
                              </div>
                              <div>{component.description}</div>
                            </div>
                          )}
                          {component.notes && (
                            <div className=&quot;md:col-span-2&quot;>
                              <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                                Notes
                              </div>
                              <div>{component.notes}</div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className=&quot;text-center py-8 border border-dashed rounded-md&quot;>
                  <Package className=&quot;h-10 w-10 mx-auto text-muted-foreground&quot; />
                  <p className=&quot;mt-2 text-muted-foreground&quot;>
                    No components defined
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div>
                <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Created
                </div>
                <div>{format(new Date(template.createdAt), &quot;PPP&quot;)}</div>
              </div>
              <div>
                <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Last Updated
                </div>
                <div>{format(new Date(template.updatedAt), &quot;PPP&quot;)}</div>
              </div>
              {template.approvedById && (
                <div>
                  <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Approved By
                  </div>
                  <div>User ID: {template.approvedById}</div>
                </div>
              )}
              {template.approvalDate && (
                <div>
                  <div className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Approval Date
                  </div>
                  <div>{format(new Date(template.approvalDate), &quot;PPP&quot;)}</div>
                </div>
              )}
            </CardContent>
            {canApprove && template.approvalStatus === &quot;pending&quot; && (
              <CardFooter className=&quot;border-t pt-5 flex flex-col gap-2&quot;>
                <Button
                  className=&quot;w-full&quot;
                  variant=&quot;default&quot;
                  onClick={() => setApprovalDialogOpen(true)}
                >
                  <CheckCircle className=&quot;mr-2 h-4 w-4&quot; />
                  Approve Template
                </Button>
                <Button
                  className=&quot;w-full&quot;
                  variant=&quot;outline&quot;
                  onClick={() => setRejectionDialogOpen(true)}
                >
                  <XCircle className=&quot;mr-2 h-4 w-4&quot; />
                  Reject Template
                </Button>
              </CardFooter>
            )}
          </Card>

          {template.components && template.components.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className=&quot;font-medium&quot;>
                        Total Components
                      </TableCell>
                      <TableCell className=&quot;text-right&quot;>
                        {template.components.length}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className=&quot;font-medium&quot;>Total Items</TableCell>
                      <TableCell className=&quot;text-right&quot;>
                        {template.components.reduce(
                          (sum, comp) => sum + (comp.quantity || 0),
                          0,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className=&quot;font-medium&quot;>Total Cost</TableCell>
                      <TableCell className=&quot;text-right&quot;>
                        $
                        {template.components
                          .reduce(
                            (sum, comp) =>
                              sum + (comp.unitCost || 0) * (comp.quantity || 0),
                            0,
                          )
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Kit Instances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-center py-4&quot;>
                <p className=&quot;text-muted-foreground&quot;>
                  No kit instances created yet
                </p>
                <Button
                  className=&quot;mt-2&quot;
                  size=&quot;sm&quot;
                  variant=&quot;outline&quot;
                  onClick={() => {}}
                >
                  <Package className=&quot;mr-2 h-4 w-4&quot; />
                  Create Kit Instance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Confirmation Dialog */}
      <AlertDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this kit template? Once approved,
              it can be used to create kit instances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingApproval}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveTemplate}
              disabled={processingApproval}
            >
              {processingApproval ? (
                <>
                  <span className=&quot;inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2&quot;></span>
                  Processing...
                </>
              ) : (
                &quot;Approve&quot;
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Dialog */}
      <AlertDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Template</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this template. This feedback
              will be visible to the template creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className=&quot;py-4&quot;>
            <Textarea
              placeholder=&quot;Enter rejection reason...&quot;
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className=&quot;min-h-[100px]&quot;
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingApproval}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectTemplate}
              disabled={processingApproval || !rejectionReason.trim()}
            >
              {processingApproval ? (
                <>
                  <span className=&quot;inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2&quot;></span>
                  Processing...
                </>
              ) : (
                &quot;Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
