&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { FileText, ArrowRight } from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import Link from &quot;next/link&quot;;

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to event-data (removing the 3-second delay)
    router.replace(&quot;/event-data&quot;);
  }, [router]);

  return (
    <div className=&quot;container mx-auto p-6&quot;>
      <div className=&quot;max-w-2xl mx-auto&quot;>
        <Card>
          <CardHeader className=&quot;text-center&quot;>
            <div className=&quot;mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4&quot;>
              <FileText className=&quot;h-6 w-6 text-blue-600&quot; />
            </div>
            <CardTitle className=&quot;text-2xl&quot;>Reports Feature Updated</CardTitle>
            <CardDescription className=&quot;text-base&quot;>
              Reports functionality has been enhanced and moved to Event Data
              Management
            </CardDescription>
          </CardHeader>
          <CardContent className=&quot;text-center space-y-4&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              You'll be automatically redirected to the new Event Data page,
              which now includes comprehensive reporting with Jotform
              integration and photo management workflows.
            </p>

            <div className=&quot;flex flex-col sm:flex-row gap-4 justify-center&quot;>
              <Link href=&quot;/event-data&quot;>
                <Button className=&quot;w-full sm:w-auto&quot;>
                  Go to Event Data
                  <ArrowRight className=&quot;h-4 w-4 ml-2&quot; />
                </Button>
              </Link>
              <Link href=&quot;/dashboard&quot;>
                <Button variant=&quot;outline&quot; className=&quot;w-full sm:w-auto&quot;>
                  Return to Dashboard
                </Button>
              </Link>
            </div>

            <div className=&quot;text-sm text-muted-foreground pt-4&quot;>
              Redirecting automatically in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
