import { Skeleton } from &quot;./skeleton&quot;

export function PageLoader() {
  return (
    <div className=&quot;space-y-6 p-6&quot;>
      <div className=&quot;space-y-2&quot;>
        <Skeleton className=&quot;h-8 w-[200px]&quot; />
        <Skeleton className=&quot;h-4 w-[400px]&quot; />
      </div>
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
        <Skeleton className=&quot;h-[200px] w-full&quot; />
        <Skeleton className=&quot;h-[200px] w-full&quot; />
        <Skeleton className=&quot;h-[200px] w-full&quot; />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className=&quot;space-y-3 p-4 border rounded-lg&quot;>
      <Skeleton className=&quot;h-4 w-[250px]&quot; />
      <Skeleton className=&quot;h-4 w-[200px]&quot; />
      <Skeleton className=&quot;h-4 w-[150px]&quot; />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className=&quot;space-y-2&quot;>
      <Skeleton className=&quot;h-8 w-full&quot; />
      <Skeleton className=&quot;h-8 w-full&quot; />
      <Skeleton className=&quot;h-8 w-full&quot; />
      <Skeleton className=&quot;h-8 w-full&quot; />
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className=&quot;space-y-3&quot;>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className=&quot;flex items-center space-x-3&quot;>
          <Skeleton className=&quot;h-8 w-8 rounded-full&quot; />
          <div className=&quot;space-y-2&quot;>
            <Skeleton className=&quot;h-4 w-[200px]&quot; />
            <Skeleton className=&quot;h-4 w-[150px]&quot; />
          </div>
        </div>
      ))}
    </div>
  )
}