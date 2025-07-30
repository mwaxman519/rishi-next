import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { Card, CardContent, CardHeader } from &quot;@/components/ui/card&quot;;

export default function LocationDetailLoading() {
  return (
    <div className=&quot;p-6&quot;>
      {/* Header skeleton */}
      <div className=&quot;flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4&quot;>
        <div className=&quot;flex items-center&quot;>
          <Skeleton className=&quot;h-10 w-24 mr-2&quot; />
          <Skeleton className=&quot;h-8 w-48&quot; />
        </div>

        <div className=&quot;flex items-center gap-2&quot;>
          <Skeleton className=&quot;h-10 w-24&quot; />
        </div>
      </div>

      {/* Status badges skeleton */}
      <div className=&quot;flex flex-wrap gap-2 mb-6&quot;>
        <Skeleton className=&quot;h-6 w-24&quot; />
        <Skeleton className=&quot;h-6 w-20&quot; />
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
        {/* Location details skeleton */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          <Card>
            <CardHeader>
              <Skeleton className=&quot;h-6 w-48 mb-2&quot; />
              <Skeleton className=&quot;h-4 w-72&quot; />
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <div>
                  <Skeleton className=&quot;h-4 w-24 mb-3&quot; />
                  <div className=&quot;space-y-2&quot;>
                    <Skeleton className=&quot;h-5 w-full&quot; />
                    <Skeleton className=&quot;h-5 w-full&quot; />
                    <Skeleton className=&quot;h-5 w-2/3&quot; />
                  </div>
                </div>

                <div>
                  <Skeleton className=&quot;h-4 w-36 mb-3&quot; />
                  <div className=&quot;space-y-3&quot;>
                    <Skeleton className=&quot;h-5 w-full&quot; />
                    <Skeleton className=&quot;h-5 w-full&quot; />
                    <Skeleton className=&quot;h-5 w-3/4&quot; />
                  </div>
                </div>
              </div>

              <Skeleton className=&quot;h-px w-full my-4&quot; />

              <div>
                <Skeleton className=&quot;h-4 w-32 mb-3&quot; />
                <div className=&quot;space-y-3&quot;>
                  <Skeleton className=&quot;h-5 w-56&quot; />
                  <Skeleton className=&quot;h-5 w-48&quot; />
                  <Skeleton className=&quot;h-5 w-40&quot; />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className=&quot;h-6 w-24&quot; />
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex justify-between&quot;>
                <Skeleton className=&quot;h-5 w-40&quot; />
                <Skeleton className=&quot;h-5 w-28&quot; />
              </div>
              <div className=&quot;flex justify-between&quot;>
                <Skeleton className=&quot;h-5 w-36&quot; />
                <Skeleton className=&quot;h-5 w-28&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map skeleton */}
        <div>
          <Card className=&quot;h-full&quot;>
            <CardHeader>
              <Skeleton className=&quot;h-6 w-32&quot; />
            </CardHeader>
            <CardContent className=&quot;p-0&quot;>
              <Skeleton className=&quot;h-[400px] w-full&quot; />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
