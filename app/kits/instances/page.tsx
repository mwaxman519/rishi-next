import { Metadata } from "next";

import KitInstancesClient from "./client-page";

export const metadata: Metadata = {
  title: "Kit Instances | Rishi Platform",
  description: "Manage physical kit instances for field operations",
};

export default function KitInstancesPage() {
  return <KitInstancesClient />;
}
