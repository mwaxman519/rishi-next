"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Search, Filter, ArrowLeft } from "lucide-react";

// Mock data for kit templates
const mockKitTemplates = [
  {
    id: "1",
    name: "Demo Setup Kit",
    description: "Complete setup for product demonstrations",
    category: "Demo",
    itemCount: 12,
    status: "active",
    lastUsed: "2024-06-20",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Marketing Materials Kit",
    description: "Brochures, banners, and promotional materials",
    category: "Marketing",
    itemCount: 8,
    status: "active",
    lastUsed: "2024-06-18",
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Training Kit",
    description: "Educational materials and training resources",
    category: "Training",
    itemCount: 15,
    status: "inactive",
    lastUsed: "2024-05-30",
    createdAt: "2024-03-05",
  },
];

export default function KitTemplatesClient() {
  const [templates, setTemplates] = useState(mockKitTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/kits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kit Management
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kit Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage and configure reusable kit templates
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Package className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium ml-2">{template.itemCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium ml-2">{template.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Used:</span>
                  <span className="font-medium ml-2">{template.lastUsed}</span>
                </div>
                <div>
                  <Badge
                    variant={
                      template.status === "active" ? "default" : "secondary"
                    }
                  >
                    {template.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first kit template"}
          </p>
        </div>
      )}
    </div>
  );
}
