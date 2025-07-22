"use client";

import { useState } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApprovalStatusUpdate } from "@/hooks/useKits";

interface ApprovalStatusProps {
  status: string;
  itemType: "kit" | "template";
  itemId: number;
  onApprove: (data: ApprovalStatusUpdate) => void;
  isApproving?: boolean;
}

export default function ApprovalStatus({
  status,
  itemType,
  itemId,
  onApprove,
  isApproving = false,
}: ApprovalStatusProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");

  const { toast } = useToast();
  const { checkPermission } = useAuthorization();

  const canApprove = checkPermission(
    `approve:${itemType === "kit" ? "kits" : "kit-templates"}`,
  );

  const handleSubmit = () => {
    if (!action) return;

    try {
      onApprove({
        approvalStatus: action === "approve" ? "approved" : "rejected",
        approvalNotes: notes,
      });

      toast({
        title: `${itemType === "kit" ? "Kit" : "Template"} ${action === "approve" ? "approved" : "rejected"}`,
        description: `The ${itemType} has been successfully ${action === "approve" ? "approved" : "rejected"}.`,
      });

      setShowDialog(false);
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} ${itemType}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const openDialog = (actionType: "approve" | "reject") => {
    setAction(actionType);
    setShowDialog(true);
  };

  const renderStatus = () => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending Approval
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {renderStatus()}

      {status === "pending" && canApprove && (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => openDialog("approve")}
            disabled={isApproving}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Approve
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => openDialog("reject")}
            disabled={isApproving}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"}{" "}
              {itemType === "kit" ? "Kit" : "Template"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? `This will approve the ${itemType} and make it available for use.`
                : `This will reject the ${itemType} and prevent it from being used.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder={`Add notes about why you're ${action === "approve" ? "approving" : "rejecting"} this ${itemType} (optional)`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              variant={action === "approve" ? "default" : "destructive"}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Processing...
                </>
              ) : (
                <>
                  {action === "approve" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
