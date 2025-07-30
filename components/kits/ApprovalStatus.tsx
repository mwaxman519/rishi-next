&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from &quot;@/components/ui/dialog&quot;;
import { CheckCircle2, XCircle, Clock, AlertCircle } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { ApprovalStatusUpdate } from &quot;@/hooks/useKits&quot;;

interface ApprovalStatusProps {
  status: string;
  itemType: &quot;kit&quot; | &quot;template&quot;;
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
  const [action, setAction] = useState<&quot;approve&quot; | &quot;reject&quot; | null>(null);
  const [notes, setNotes] = useState("&quot;);

  const { toast } = useToast();
  const { checkPermission } = useAuthorization();

  const canApprove = checkPermission(
    `approve:${itemType === &quot;kit&quot; ? &quot;kits&quot; : &quot;kit-templates&quot;}`,
  );

  const handleSubmit = () => {
    if (!action) return;

    try {
      onApprove({
        approvalStatus: action === &quot;approve&quot; ? &quot;approved&quot; : &quot;rejected&quot;,
        approvalNotes: notes,
      });

      toast({
        title: `${itemType === &quot;kit&quot; ? &quot;Kit&quot; : &quot;Template&quot;} ${action === &quot;approve&quot; ? &quot;approved&quot; : &quot;rejected&quot;}`,
        description: `The ${itemType} has been successfully ${action === &quot;approve&quot; ? &quot;approved&quot; : &quot;rejected&quot;}.`,
      });

      setShowDialog(false);
      setNotes(&quot;&quot;);
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: `Failed to ${action} ${itemType}. Please try again.`,
        variant: &quot;destructive&quot;,
      });
    }
  };

  const openDialog = (actionType: &quot;approve&quot; | &quot;reject&quot;) => {
    setAction(actionType);
    setShowDialog(true);
  };

  const renderStatus = () => {
    switch (status) {
      case &quot;approved&quot;:
        return (
          <Badge className=&quot;bg-green-100 text-green-800 border-green-300 hover:bg-green-200&quot;>
            <CheckCircle2 className=&quot;h-3.5 w-3.5 mr-1&quot; />
            Approved
          </Badge>
        );
      case &quot;rejected&quot;:
        return (
          <Badge className=&quot;bg-red-100 text-red-800 border-red-300 hover:bg-red-200&quot;>
            <XCircle className=&quot;h-3.5 w-3.5 mr-1&quot; />
            Rejected
          </Badge>
        );
      case &quot;pending&quot;:
        return (
          <Badge className=&quot;bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200&quot;>
            <Clock className=&quot;h-3.5 w-3.5 mr-1&quot; />
            Pending Approval
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  return (
    <div className=&quot;flex flex-wrap gap-2 items-center&quot;>
      {renderStatus()}

      {status === &quot;pending&quot; && canApprove && (
        <div className=&quot;flex space-x-2&quot;>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            className=&quot;border-green-500 text-green-600 hover:bg-green-50&quot;
            onClick={() => openDialog(&quot;approve&quot;)}
            disabled={isApproving}
          >
            <CheckCircle2 className=&quot;h-4 w-4 mr-1&quot; />
            Approve
          </Button>

          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            className=&quot;border-red-500 text-red-600 hover:bg-red-50&quot;
            onClick={() => openDialog(&quot;reject&quot;)}
            disabled={isApproving}
          >
            <XCircle className=&quot;h-4 w-4 mr-1&quot; />
            Reject
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === &quot;approve&quot; ? &quot;Approve&quot; : &quot;Reject&quot;}{&quot; &quot;}
              {itemType === &quot;kit&quot; ? &quot;Kit&quot; : &quot;Template&quot;}
            </DialogTitle>
            <DialogDescription>
              {action === &quot;approve&quot;
                ? `This will approve the ${itemType} and make it available for use.`
                : `This will reject the ${itemType} and prevent it from being used.`}
            </DialogDescription>
          </DialogHeader>

          <div className=&quot;py-4&quot;>
            <Textarea
              placeholder={`Add notes about why you&apos;re ${action === &quot;approve&quot; ? &quot;approving&quot; : &quot;rejecting&quot;} this ${itemType} (optional)`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className=&quot;flex space-x-2 justify-end&quot;>
            <DialogClose asChild>
              <Button variant=&quot;outline&quot;>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              variant={action === &quot;approve&quot; ? &quot;default&quot; : &quot;destructive&quot;}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <span className=&quot;animate-spin mr-2&quot;>◌</span>
                  Processing...
                </>
              ) : (
                <>
                  {action === &quot;approve&quot; ? (
                    <>
                      <CheckCircle2 className=&quot;h-4 w-4 mr-2&quot; />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className=&quot;h-4 w-4 mr-2" />
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
