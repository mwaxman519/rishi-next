"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { kitsClient } from "@/client/services/kits";
import { KitTemplateDTO, ComponentType } from "@/services/kits";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

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
  const [rejectionReason, setRejectionReason] = useState("");
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
        console.error("Error fetching template:", err);
        setError("Failed to load template data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load template details",
          variant: "destructive",
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
              approvalStatus: "approved",
              approvedById: session?.user?.id,
            }
          : null,
      );

      toast({
        title: "Success",
        description: "Template approved successfully",
        variant: "success",
      });

      setApprovalDialogOpen(false);
    } catch (err) {
      console.error("Error approving template:", err);
      toast({
        title: "Error",
        description: "Failed to approve template",
        variant: "destructive",
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
              approvalStatus: "rejected",
              approvalNotes: rejectionReason,
            }
          : null,
      );

      toast({
        title: "Template Rejected",
        description: "Template has been rejected with feedback",
        variant: "default",
      });

      setRejectionDialogOpen(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Error rejecting template:", err);
      toast({
        title: "Error",
        description: "Failed to reject template",
        variant: "destructive",
      });
    } finally {
      setProcessingApproval(false);
    }
  };

  // Render component type icon
  const getComponentTypeIcon = (type: ComponentType) => {
    switch (type) {
      case ComponentType.HARDWARE:
        return <Server className="h-4 w-4" />;
      case ComponentType.TOOL:
        return <Wrench className="h-4 w-4" />;
      case ComponentType.CONSUMABLE:
        return <ShoppingBag className="h-4 w-4" />;
      case ComponentType.PACKAGING:
        return <Box className="h-4 w-4" />;
      case ComponentType.DOCUMENTATION:
        return <FileText className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
        <p className="ml-2">Loading template details...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        <p>{error || "Template not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/inventory/templates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  const renderApprovalStatus = () => {
    switch (template.approvalStatus) {
      case "approved":
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            <span>Rejected</span>
          </div>
        );
      case "pending":
      default:
        return (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Pending Review</span>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/inventory/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/inventory/templates/${templateId}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/inventory/templates/${templateId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              {template.description && (
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Brand
                    </div>
                    <div>
                      {template.brand?.name || `Brand ID: ${template.brandId}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Status
                    </div>
                    <div className="flex items-center gap-3">
                      {renderApprovalStatus()}
                      <Separator orientation="vertical" className="h-4" />
                      {template.active ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {template.instructions && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Instructions
                    </div>
                    <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {template.instructions}
                    </div>
                  </div>
                )}

                {template.approvalStatus === "rejected" &&
                  template.approvalNotes && (
                    <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                      <div className="text-sm font-medium text-destructive">
                        Rejection Reason
                      </div>
                      <div className="mt-1 text-destructive">
                        {template.approvalNotes}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Components ({template.components?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.components && template.components.length > 0 ? (
                <div className="space-y-4">
                  {template.components.map((component, index) => (
                    <Collapsible key={component.id || index}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-md">
                        <div className="flex items-center">
                          {getComponentTypeIcon(component.type)}
                          <span className="ml-2 font-medium">
                            {component.name}
                          </span>
                          {component.isRequired === false && (
                            <Badge variant="outline" className="ml-2">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {component.quantity}{" "}
                            {component.quantity > 1 ? "units" : "unit"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 transition-transform ui-expanded:rotate-90" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pl-8 bg-muted/50 rounded-md mt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Type
                            </div>
                            <div>{component.type}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Quantity
                            </div>
                            <div>{component.quantity}</div>
                          </div>
                          {component.unitCost !== undefined && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Unit Cost
                              </div>
                              <div>${component.unitCost?.toFixed(2)}</div>
                            </div>
                          )}
                          {component.sku && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                SKU
                              </div>
                              <div>{component.sku}</div>
                            </div>
                          )}
                          {component.barcode && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Barcode
                              </div>
                              <div>{component.barcode}</div>
                            </div>
                          )}
                          {component.description && (
                            <div className="md:col-span-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                Description
                              </div>
                              <div>{component.description}</div>
                            </div>
                          )}
                          {component.notes && (
                            <div className="md:col-span-2">
                              <div className="text-sm font-medium text-muted-foreground">
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
                <div className="text-center py-8 border border-dashed rounded-md">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No components defined
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Created
                </div>
                <div>{format(new Date(template.createdAt), "PPP")}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div>{format(new Date(template.updatedAt), "PPP")}</div>
              </div>
              {template.approvedById && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Approved By
                  </div>
                  <div>User ID: {template.approvedById}</div>
                </div>
              )}
              {template.approvalDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Approval Date
                  </div>
                  <div>{format(new Date(template.approvalDate), "PPP")}</div>
                </div>
              )}
            </CardContent>
            {canApprove && template.approvalStatus === "pending" && (
              <CardFooter className="border-t pt-5 flex flex-col gap-2">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => setApprovalDialogOpen(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Template
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setRejectionDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
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
                      <TableCell className="font-medium">
                        Total Components
                      </TableCell>
                      <TableCell className="text-right">
                        {template.components.length}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Items</TableCell>
                      <TableCell className="text-right">
                        {template.components.reduce(
                          (sum, comp) => sum + (comp.quantity || 0),
                          0,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Cost</TableCell>
                      <TableCell className="text-right">
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
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  No kit instances created yet
                </p>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() => {}}
                >
                  <Package className="mr-2 h-4 w-4" />
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
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></span>
                  Processing...
                </>
              ) : (
                "Approve"
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
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
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
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></span>
                  Processing...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
