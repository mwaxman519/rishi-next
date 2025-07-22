"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
  backLabel = "Back",
  actionLabel,
  actionLink,
  actionIcon = <Plus className="mr-2 h-4 w-4" />,
  children,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
      <div className="flex-1">
        {backLink && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 px-0 text-muted-foreground"
            onClick={() => router.push(backLink)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center mt-4 md:mt-0">
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
