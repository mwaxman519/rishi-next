import { Metadata } from "next";
import KitTemplatesClient from "./client-page";

export const metadata: Metadata = {
  title: "Kit Templates | Rishi Platform",
  description: "Manage and configure kit templates for field operations",
};

export default function KitTemplatesPage() {
  return <KitTemplatesClient />;
}
