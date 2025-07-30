import { Button } from &quot;@/components/ui/button&quot;;
import { ArrowLeft } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function LocationNotFound() {
  return (
    <div className=&quot;flex flex-col items-center justify-center min-h-[60vh] p-6&quot;>
      <div className=&quot;text-center space-y-5 max-w-md&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Location Not Found
        </h1>
        <p className=&quot;text-muted-foreground&quot;>
          The location you are looking for doesn&apos;t exist or you may not have
          permission to view it.
        </p>
        <Button asChild>
          <Link href=&quot;/locations&quot;>
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
            Back to Locations
          </Link>
        </Button>
      </div>
    </div>
  );
}
