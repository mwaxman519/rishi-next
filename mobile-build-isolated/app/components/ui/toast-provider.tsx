"use client";

import * as React from "react";
import { ToastContext, Toaster } from "./toaster";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
