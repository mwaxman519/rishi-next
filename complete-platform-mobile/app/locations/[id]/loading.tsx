import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LocationDetailLoading() {
  return (
    <div className="p-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Skeleton className="h-10 w-24 mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Status badges skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location details skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-4 w-24 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-4 w-36 mb-3" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-px w-full my-4" />

              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map skeleton */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
