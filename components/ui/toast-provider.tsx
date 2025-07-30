&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { ToastContext, Toaster } from &quot;./toaster&quot;;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
