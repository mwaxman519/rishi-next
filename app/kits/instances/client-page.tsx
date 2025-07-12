"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Package } from "lucide-react";

// Mock data for kit instances


export default function KitInstancesClient() {
  const router = useRouter();

  // Use mock data for demonstration
  const kitInstances = mockKitInstances;
  const isLoadingInstances = false;
  const instancesError = null;
  const kitTemplates = mockKitTemplates;
  const isLoadingTemplates = false;
  const templatesError = null;

  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKits, setFilteredKits] = useState<KitDTO[]>([]);

  // Form state for creating new kit instance
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    brandRegionId: "1", // Default value
    notes: "",
  });

  // Filter kits based on search query and selected tab
  useEffect(() => {
    // Guard against undefined or empty kitInstances
    if (
      !kitInstances ||
      !Array.isArray(kitInstances) ||
      kitInstances.length === 0
    ) {
      setFilteredKits([]);
      return;
    }

    // Create a safe shallow copy of the array
    let filtered = [...kitInstances];

    try {
      // Apply search filter if there's a query
      if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((kit) => {
          try {
            // Safely access potentially undefined properties with optional chaining
            const name =
              typeof kit?.name === "string" ? kit.name.toLowerCase() : "";
            const description =
              typeof kit?.description === "string"
                ? kit.description.toLowerCase()
                : "";
            const templateName =
              typeof kit?.template?.name === "string"
                ? kit.template.name.toLowerCase()
                : "";

            return (
              name.includes(query) ||
              description.includes(query) ||
              templateName.includes(query)
            );
          } catch (err) {
            console.error("Error filtering individual kit:", err);
            return false;
          }
        });
      }

      // Apply tab filter
      if (selectedTab === "assigned") {
        filtered = filtered.filter((kit) => {
          try {
            return Boolean(kit?.assignedToActivityId);
          } catch (err) {
            console.error("Error checking assigned status:", err);
            return false;
          }
        });
      } else if (selectedTab === "available") {
        filtered = filtered.filter((kit) => {
          try {
            return !kit?.assignedToActivityId && kit?.status === "available";
          } catch (err) {
            console.error("Error checking available status:", err);
            return false;
          }
        });
      }
    } catch (error) {
      console.error("Error filtering kits:", error);
      // In case of error, return empty array to prevent further issues
      filtered = [];
    }

    // Simply update the filtered kits with the new array - React's memo will handle the comparison
    setFilteredKits(filtered);
  }, [kitInstances, searchQuery, selectedTab]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle template selection
  const handleTemplateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, templateId: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create new kit instance (mock implementation)
      const newKit = {
        id: `kit-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        templateId: formData.templateId,
        template: kitTemplates.find((t) => t.id === formData.templateId),
        status: "available" as const,
        condition: "good" as const,
        assignedToActivityId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: formData.notes,
      };

      console.log("Created kit instance:", newKit);

      // Reset form
      setFormData({
        name: "",
        description: "",
        templateId: "",
        brandRegionId: "1",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to create kit instance:", error);
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "in_use":
        return <Badge className="bg-blue-500">In Use</Badge>;
      case "damaged":
        return <Badge className="bg-red-500">{status}</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kit Instances</h1>
        <Button onClick={() => router.push("/kits/templates")}>
          View Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Create new kit instance */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create New Kit Instance</CardTitle>
            <CardDescription>
              Register a physical kit based on a template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kit Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter unique kit name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateId">Kit Template</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTemplates ? (
                      <SelectItem value="loading" disabled>
                        Loading templates...
                      </SelectItem>
                    ) : kitTemplates &&
                      Array.isArray(kitTemplates) &&
                      kitTemplates.length > 0 ? (
                      kitTemplates.map((template) =>
                        template && template.id ? (
                          <SelectItem
                            key={template.id}
                            value={template.id ? String(template.id) : ""}
                          >
                            {template.name || "Unnamed Template"}
                          </SelectItem>
                        ) : null,
                      )
                    ) : (
                      <SelectItem value="no-templates" disabled>
                        No templates available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Kit Instance
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Section - Kit instances list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kit Inventory</CardTitle>
            <CardDescription>
              Manage your physical kit inventory
            </CardDescription>

            <div className="mt-4 space-y-4">
              <Input
                placeholder="Search by name, description or template name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <Tabs
                defaultValue="all"
                value={selectedTab}
                onValueChange={setSelectedTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Kits</TabsTrigger>
                  <TabsTrigger value="available">Available</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingInstances ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredKits.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No kits found</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : selectedTab !== "all"
                      ? `No ${selectedTab} kits available`
                      : "Create your first kit instance"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredKits && Array.isArray(filteredKits) ? (
                  filteredKits.map((kit) =>
                    kit ? (
                      <div
                        key={kit.id || `kit-${Math.random()}`}
                        className="py-4 flex justify-between items-start"
                      >
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium">
                              {kit?.name || "No Name"}
                            </h3>
                            <div className="ml-3">
                              {getStatusBadge(kit?.status || "unknown")}
                            </div>
                            {kit?.assignedToActivityId ? (
                              <Badge variant="outline" className="ml-2">
                                Assigned
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-500">
                            Template:{" "}
                            {kit?.template?.name || "Unknown Template"}
                          </p>
                          {kit?.notes &&
                          typeof kit.notes === "string" &&
                          kit.notes.trim() !== "" ? (
                            <p className="text-sm mt-1 text-gray-600">
                              Notes: {kit.notes}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              kit?.id &&
                              router.push(`/kits/instances/${kit.id}`)
                            }
                            disabled={!kit?.id}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ) : null,
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Error loading kit data
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6">
            <div className="flex justify-between w-full text-sm text-gray-500">
              <span>Total: {filteredKits.length} kits</span>
              {selectedTab === "available" && (
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  Available for assignment
                </span>
              )}
              {selectedTab === "assigned" && (
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                  Currently assigned to activities
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
