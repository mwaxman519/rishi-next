&quot;use client&quot;;

import { ReactNode } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { ArrowLeft, Plus } from &quot;lucide-react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  actionLabel?: string;
  actionLink?: string;
  actionIcon?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  backLink,
  backLabel = &quot;Back&quot;,
  actionLabel,
  actionLink,
  actionIcon = <Plus className=&quot;mr-2 h-4 w-4&quot; />,
  children,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b&quot;>
      <div className=&quot;flex-1&quot;>
        {backLink && (
          <Button
            variant=&quot;ghost&quot;
            size=&quot;sm&quot;
            className=&quot;mb-2 px-0 text-muted-foreground&quot;
            onClick={() => router.push(backLink)}
          >
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
            {backLabel}
          </Button>
        )}
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>{title}</h1>
        {description && (
          <p className=&quot;text-muted-foreground mt-1&quot;>{description}</p>
        )}
      </div>

      <div className=&quot;flex flex-col md:flex-row gap-2 items-center mt-4 md:mt-0&quot;>
        {children}

        {actionLabel && actionLink && (
          <Button onClick={() => router.push(actionLink)}>
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
