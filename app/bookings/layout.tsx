&quot;use client&quot;;

import React from &quot;react&quot;;

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className=&quot;container py-6&quot;>{children}</div>;
}
