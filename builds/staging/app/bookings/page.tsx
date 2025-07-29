"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState, useMemo } from "react";
import { AppLayout } from "../components/app-layout";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Building,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Expanded cannabis booking dataset for performance testing
const generateBookings = () => {
  const statuses = [
    "confirmed",
    "pending_approval",
    "staff_assigned",
    "completed",
  ]; // Removed equipment_deployed
  const priorities = ["high", "medium", "low"];
  const types = [
    "product_demo",
    "conference_booth",
    "staff_training",
    "trade_show",
    "product_launch",
    "grand_opening",
  ];
  const states = [
    "California",
    "Colorado",
    "Oregon",
    "Nevada",
    "Washington",
    "Arizona",
    "New York",
    "Florida",
    "Texas",
  ];
  const regions = {
    California: [
      "Northern California",
      "Southern California",
      "Central Valley",
      "Bay Area",
    ],
    Colorado: [
      "Denver Metro",
      "Colorado Springs",
      "Boulder County",
      "Western Slope",
    ],
    Oregon: [
      "Portland Metro",
      "Eugene-Springfield",
      "Medford-Ashland",
      "Eastern Oregon",
    ],
    Nevada: ["Las Vegas", "Reno-Tahoe", "Carson City", "Rural Nevada"],
    Washington: ["Seattle Metro", "Spokane", "Tacoma", "Vancouver"],
    Arizona: ["Phoenix Metro", "Tucson", "Flagstaff", "Yuma"],
    "New York": ["NYC Metro", "Buffalo", "Rochester", "Syracuse"],
    Florida: ["Miami-Dade", "Tampa Bay", "Orlando", "Jacksonville"],
    Texas: ["Houston", "Dallas-Fort Worth", "Austin", "San Antonio"],
  };
  const clients = [
    "Green Valley Dispensary",
    "Rocky Mountain Events",
    "Pacific Northwest Growers",
    "Desert Bloom Cannabis",
    "Emerald City Cannabis",
    "Desert Sun Dispensary",
    "Golden State Cannabis",
    "Mile High Collective",
    "Coastal Cannabis Co",
    "Mountain View Dispensary",
  ];
  const brands = [
    "Cannabis Solutions Inc",
    "Denver Cannabis Co",
    "Oregon Green Solutions",
    "Nevada Premium",
    "Seattle Cannabis Group",
    "Arizona Cannabis Co",
    "California Premier",
    "Colorado Collective",
    "Pacific Coast Cannabis",
    "Southwest Solutions",
  ];
  const staffNames = [
    "Sarah Johnson",
    "Mike Chen",
    "Lisa Rodriguez",
    "James Wilson",
    "Anna Thompson",
    "Carlos Martinez",
    "Emily Davis",
    "Robert Brown",
    "Jessica Lee",
    "David Kim",
    "Rachel Green",
    "Michelle Adams",
    "Tom Wilson",
    "Katie Park",
    "Alex Rivera",
    "Chris Taylor",
    "Amanda White",
    "Steven Garcia",
    "Nicole Johnson",
    "Kevin Lee",
    "Maria Lopez",
    "Jason Smith",
    "Elena Rodriguez",
  ];

  const bookings = [];
  for (let i = 1; i <= 1000; i++) {
    const dateScheduled = new Date(
      2024,
      11,
      Math.floor(Math.random() * 30) + 1,
    );
    const budget = Math.floor(Math.random() * 8000) + 1000;
    const selectedState = states[Math.floor(Math.random() * states.length)];
    const selectedRegion =
      regions[selectedState][
        Math.floor(Math.random() * regions[selectedState].length)
      ];
    const staffCount = Math.floor(Math.random() * 8) + 1;
    const assignedStaff = [];
    for (let j = 0; j < staffCount; j++) {
      const staffMember =
        staffNames[Math.floor(Math.random() * staffNames.length)];
      if (!assignedStaff.includes(staffMember)) {
        assignedStaff.push(staffMember);
      }
    }

    bookings.push({
      id: `550e8400-e29b-41d4-a716-${String(i).padStart(12, "0")}`,
      title: `${types[Math.floor(Math.random() * types.length)].replace("_", " ")} #${i}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      bookingType: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dateScheduled: dateScheduled.toISOString().split("T")[0],
      timeStart: `${Math.floor(Math.random() * 12) + 8}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
      state: selectedState,
      region: selectedRegion,
      assignedStaff: assignedStaff,
      staffCount: assignedStaff.length,
      budget: budget,
      estimatedRevenue: Math.floor(budget * (1.2 + Math.random() * 0.5)),
      stage: `stage_${Math.floor(Math.random() * 8) + 1}`,
    });
  }
  return bookings.sort(
    (a, b) =>
      new Date(b.dateScheduled).getTime() - new Date(a.dateScheduled).getTime(),
  );
};

const cannabisBookings = generateBookings();

// Efficient status/priority indicators
const getStatusColor = (status: string) => {
  const colors = {
    completed: "bg-green-500",
    confirmed: "bg-blue-500",
    staff_assigned: "bg-purple-500",
    pending_approval: "bg-yellow-500",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500";
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };
  return colors[priority as keyof typeof colors] || "bg-gray-500";
};

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("dateScheduled");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 50;

  // Get available regions for the selected state
  const availableRegions = useMemo(() => {
    if (stateFilter === "all") return [];
    const stateBookings = cannabisBookings.filter(
      (b) => b.state === stateFilter,
    );
    return [...new Set(stateBookings.map((b) => b.region))].sort();
  }, [stateFilter]);

  // Efficient filtering and sorting with useMemo
  const filteredBookings = useMemo(() => {
    let filtered = cannabisBookings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.client.toLowerCase().includes(query) ||
          b.brand.toLowerCase().includes(query) ||
          b.state.toLowerCase().includes(query) ||
          b.region.toLowerCase().includes(query) ||
          b.assignedStaff.some((staff) => staff.toLowerCase().includes(query)),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((b) => b.priority === priorityFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.bookingType === typeFilter);
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter((b) => b.state === stateFilter);
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter((b) => b.region === regionFilter);
    }

    if (staffFilter) {
      filtered = filtered.filter((b) =>
        b.assignedStaff.some((staff) =>
          staff.toLowerCase().includes(staffFilter.toLowerCase()),
        ),
      );
    }

    if (clientFilter) {
      filtered = filtered.filter((b) =>
        b.client.toLowerCase().includes(clientFilter.toLowerCase()),
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((b) =>
        b.brand.toLowerCase().includes(brandFilter.toLowerCase()),
      );
    }

    if (dateFromFilter) {
      filtered = filtered.filter((b) => b.dateScheduled >= dateFromFilter);
    }

    if (dateToFilter) {
      filtered = filtered.filter((b) => b.dateScheduled <= dateToFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];

      // Handle date sorting
      if (sortField === "dateScheduled") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle numeric sorting
      if (
        sortField === "budget" ||
        sortField === "estimatedRevenue" ||
        sortField === "staffCount"
      ) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    typeFilter,
    stateFilter,
    regionFilter,
    staffFilter,
    clientFilter,
    brandFilter,
    dateFromFilter,
    dateToFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setStateFilter("all");
    setRegionFilter("all");
    setStaffFilter("");
    setClientFilter("");
    setBrandFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleViewBooking = (bookingId: string) => {
    alert(`Viewing booking: ${bookingId}`);
  };

  const handleEditBooking = (bookingId: string) => {
    alert(`Editing booking: ${bookingId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cannabis Bookings</h1>
            <p className="text-sm text-muted-foreground">
              {filteredBookings.length} of {cannabisBookings.length} bookings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filters
            {filtersVisible ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Collapsible Filters */}
        {filtersVisible && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="staff_assigned">
                      Staff Assigned
                    </SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="product_demo">Product Demo</SelectItem>
                    <SelectItem value="conference_booth">Conference</SelectItem>
                    <SelectItem value="staff_training">Training</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="product_launch">Launch</SelectItem>
                    <SelectItem value="grand_opening">Opening</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={stateFilter}
                  onValueChange={(value) => {
                    setStateFilter(value);
                    setRegionFilter("all");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="California">California</SelectItem>
                    <SelectItem value="Colorado">Colorado</SelectItem>
                    <SelectItem value="Oregon">Oregon</SelectItem>
                    <SelectItem value="Nevada">Nevada</SelectItem>
                    <SelectItem value="Washington">Washington</SelectItem>
                    <SelectItem value="Arizona">Arizona</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="Florida">Florida</SelectItem>
                    <SelectItem value="Texas">Texas</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={regionFilter}
                  onValueChange={setRegionFilter}
                  disabled={stateFilter === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region/Territory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Staff Member"
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <Input
                  placeholder="Client"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                />

                <Input
                  placeholder="Brand"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Efficient Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted/50 border-b grid grid-cols-12 gap-2 p-3 text-xs font-medium text-muted-foreground">
            <div
              className="col-span-3 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("title")}
            >
              Booking{" "}
              {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("client")}
            >
              Client/Brand{" "}
              {sortField === "client" && (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("dateScheduled")}
            >
              Schedule{" "}
              {sortField === "dateScheduled" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("staffCount")}
            >
              Staff{" "}
              {sortField === "staffCount" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("budget")}
            >
              Budget{" "}
              {sortField === "budget" && (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("status")}
            >
              Status{" "}
              {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
            </div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-12 gap-2 p-3 hover:bg-muted/30 text-sm"
              >
                <div className="col-span-3">
                  <div className="font-medium truncate">{booking.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {booking.bookingType.replace("_", " ")}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(booking.priority)}`}
                    ></div>
                    <span className="text-xs capitalize">
                      {booking.priority}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-medium truncate">{booking.client}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {booking.brand}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.state}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {booking.region}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-medium">
                    {new Date(booking.dateScheduled).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.timeStart}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Stage {booking.stage.replace("stage_", "")}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3" />
                    <span className="text-sm">{booking.staffCount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.assignedStaff.slice(0, 2).join(", ")}
                    {booking.assignedStaff.length > 2 &&
                      ` +${booking.assignedStaff.length - 2}`}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-medium">
                    ${booking.budget.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">
                    ${booking.estimatedRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                    ></div>
                    <span className="text-xs truncate">
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex gap-1">
                    <button
                      className="p-1 hover:bg-muted rounded"
                      title="View"
                      onClick={() => handleViewBooking(booking.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-muted rounded"
                      title="Edit"
                      onClick={() => handleEditBooking(booking.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{" "}
              {filteredBookings.length} results
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold">{filteredBookings.length}</div>
              <div className="text-xs text-muted-foreground">
                Total Bookings
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold">
                $
                {filteredBookings
                  .reduce((sum, b) => sum + b.budget, 0)
                  .toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold">
                {filteredBookings.reduce((sum, b) => sum + b.staffCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Staff Assigned
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold">
                {new Set(filteredBookings.map((b) => b.state)).size}
              </div>
              <div className="text-xs text-muted-foreground">Active States</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
