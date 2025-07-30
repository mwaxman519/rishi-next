&quot;use client&quot;;

import React, { useState, useMemo } from &quot;react&quot;;
import { AppLayout } from &quot;../components/app-layout&quot;;
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
} from &quot;lucide-react&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;../../components/ui/select&quot;;

// Expanded cannabis booking dataset for performance testing
const generateBookings = () => {
  const statuses = [
    &quot;confirmed&quot;,
    &quot;pending_approval&quot;,
    &quot;staff_assigned&quot;,
    &quot;completed&quot;,
  ]; // Removed equipment_deployed
  const priorities = [&quot;high&quot;, &quot;medium&quot;, &quot;low&quot;];
  const types = [
    &quot;product_demo&quot;,
    &quot;conference_booth&quot;,
    &quot;staff_training&quot;,
    &quot;trade_show&quot;,
    &quot;product_launch&quot;,
    &quot;grand_opening&quot;,
  ];
  const states = [
    &quot;California&quot;,
    &quot;Colorado&quot;,
    &quot;Oregon&quot;,
    &quot;Nevada&quot;,
    &quot;Washington&quot;,
    &quot;Arizona&quot;,
    &quot;New York&quot;,
    &quot;Florida&quot;,
    &quot;Texas&quot;,
  ];
  const regions = {
    California: [
      &quot;Northern California&quot;,
      &quot;Southern California&quot;,
      &quot;Central Valley&quot;,
      &quot;Bay Area&quot;,
    ],
    Colorado: [
      &quot;Denver Metro&quot;,
      &quot;Colorado Springs&quot;,
      &quot;Boulder County&quot;,
      &quot;Western Slope&quot;,
    ],
    Oregon: [
      &quot;Portland Metro&quot;,
      &quot;Eugene-Springfield&quot;,
      &quot;Medford-Ashland&quot;,
      &quot;Eastern Oregon&quot;,
    ],
    Nevada: [&quot;Las Vegas&quot;, &quot;Reno-Tahoe&quot;, &quot;Carson City&quot;, &quot;Rural Nevada&quot;],
    Washington: [&quot;Seattle Metro&quot;, &quot;Spokane&quot;, &quot;Tacoma&quot;, &quot;Vancouver&quot;],
    Arizona: [&quot;Phoenix Metro&quot;, &quot;Tucson&quot;, &quot;Flagstaff&quot;, &quot;Yuma&quot;],
    &quot;New York&quot;: [&quot;NYC Metro&quot;, &quot;Buffalo&quot;, &quot;Rochester&quot;, &quot;Syracuse&quot;],
    Florida: [&quot;Miami-Dade&quot;, &quot;Tampa Bay&quot;, &quot;Orlando&quot;, &quot;Jacksonville&quot;],
    Texas: [&quot;Houston&quot;, &quot;Dallas-Fort Worth&quot;, &quot;Austin&quot;, &quot;San Antonio&quot;],
  };
  const clients = [
    &quot;Green Valley Dispensary&quot;,
    &quot;Rocky Mountain Events&quot;,
    &quot;Pacific Northwest Growers&quot;,
    &quot;Desert Bloom Cannabis&quot;,
    &quot;Emerald City Cannabis&quot;,
    &quot;Desert Sun Dispensary&quot;,
    &quot;Golden State Cannabis&quot;,
    &quot;Mile High Collective&quot;,
    &quot;Coastal Cannabis Co&quot;,
    &quot;Mountain View Dispensary&quot;,
  ];
  const brands = [
    &quot;Cannabis Solutions Inc&quot;,
    &quot;Denver Cannabis Co&quot;,
    &quot;Oregon Green Solutions&quot;,
    &quot;Nevada Premium&quot;,
    &quot;Seattle Cannabis Group&quot;,
    &quot;Arizona Cannabis Co&quot;,
    &quot;California Premier&quot;,
    &quot;Colorado Collective&quot;,
    &quot;Pacific Coast Cannabis&quot;,
    &quot;Southwest Solutions&quot;,
  ];
  const staffNames = [
    &quot;Sarah Johnson&quot;,
    &quot;Mike Chen&quot;,
    &quot;Lisa Rodriguez&quot;,
    &quot;James Wilson&quot;,
    &quot;Anna Thompson&quot;,
    &quot;Carlos Martinez&quot;,
    &quot;Emily Davis&quot;,
    &quot;Robert Brown&quot;,
    &quot;Jessica Lee&quot;,
    &quot;David Kim&quot;,
    &quot;Rachel Green&quot;,
    &quot;Michelle Adams&quot;,
    &quot;Tom Wilson&quot;,
    &quot;Katie Park&quot;,
    &quot;Alex Rivera&quot;,
    &quot;Chris Taylor&quot;,
    &quot;Amanda White&quot;,
    &quot;Steven Garcia&quot;,
    &quot;Nicole Johnson&quot;,
    &quot;Kevin Lee&quot;,
    &quot;Maria Lopez&quot;,
    &quot;Jason Smith&quot;,
    &quot;Elena Rodriguez&quot;,
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
      id: `550e8400-e29b-41d4-a716-${String(i).padStart(12, &quot;0&quot;)}`,
      title: `${types[Math.floor(Math.random() * types.length)].replace(&quot;_&quot;, &quot; &quot;)} #${i}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      bookingType: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dateScheduled: dateScheduled.toISOString().split(&quot;T&quot;)[0],
      timeStart: `${Math.floor(Math.random() * 12) + 8}:00 ${Math.random() > 0.5 ? &quot;AM&quot; : &quot;PM&quot;}`,
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
    completed: &quot;bg-green-500&quot;,
    confirmed: &quot;bg-blue-500&quot;,
    staff_assigned: &quot;bg-purple-500&quot;,
    pending_approval: &quot;bg-yellow-500&quot;,
  };
  return colors[status as keyof typeof colors] || &quot;bg-gray-500&quot;;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: &quot;bg-red-500&quot;,
    medium: &quot;bg-yellow-500&quot;,
    low: &quot;bg-green-500&quot;,
  };
  return colors[priority as keyof typeof colors] || &quot;bg-gray-500&quot;;
};

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [priorityFilter, setPriorityFilter] = useState(&quot;all&quot;);
  const [typeFilter, setTypeFilter] = useState(&quot;all&quot;);
  const [stateFilter, setStateFilter] = useState(&quot;all&quot;);
  const [regionFilter, setRegionFilter] = useState(&quot;all&quot;);
  const [staffFilter, setStaffFilter] = useState(&quot;&quot;);
  const [clientFilter, setClientFilter] = useState(&quot;&quot;);
  const [brandFilter, setBrandFilter] = useState(&quot;&quot;);
  const [dateFromFilter, setDateFromFilter] = useState(&quot;&quot;);
  const [dateToFilter, setDateToFilter] = useState(&quot;&quot;);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(&quot;dateScheduled&quot;);
  const [sortDirection, setSortDirection] = useState<&quot;asc&quot; | &quot;desc&quot;>(&quot;desc&quot;);
  const itemsPerPage = 50;

  // Get available regions for the selected state
  const availableRegions = useMemo(() => {
    if (stateFilter === &quot;all&quot;) return [];
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

    if (statusFilter !== &quot;all&quot;) {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (priorityFilter !== &quot;all&quot;) {
      filtered = filtered.filter((b) => b.priority === priorityFilter);
    }

    if (typeFilter !== &quot;all&quot;) {
      filtered = filtered.filter((b) => b.bookingType === typeFilter);
    }

    if (stateFilter !== &quot;all&quot;) {
      filtered = filtered.filter((b) => b.state === stateFilter);
    }

    if (regionFilter !== &quot;all&quot;) {
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
      if (sortField === &quot;dateScheduled&quot;) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle numeric sorting
      if (
        sortField === &quot;budget&quot; ||
        sortField === &quot;estimatedRevenue&quot; ||
        sortField === &quot;staffCount&quot;
      ) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle string sorting
      if (typeof aValue === &quot;string&quot;) {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === &quot;asc&quot;) {
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
    setSearchQuery(&quot;&quot;);
    setStatusFilter(&quot;all&quot;);
    setPriorityFilter(&quot;all&quot;);
    setTypeFilter(&quot;all&quot;);
    setStateFilter(&quot;all&quot;);
    setRegionFilter(&quot;all&quot;);
    setStaffFilter(&quot;&quot;);
    setClientFilter(&quot;&quot;);
    setBrandFilter(&quot;&quot;);
    setDateFromFilter(&quot;&quot;);
    setDateToFilter(&quot;&quot;);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === &quot;asc&quot; ? &quot;desc&quot; : &quot;asc&quot;);
    } else {
      setSortField(field);
      setSortDirection(&quot;desc&quot;);
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
      <div className=&quot;space-y-4&quot;>
        {/* Header */}
        <div className=&quot;flex items-center justify-between&quot;>
          <div>
            <h1 className=&quot;text-2xl font-bold&quot;>Cannabis Bookings</h1>
            <p className=&quot;text-sm text-muted-foreground&quot;>
              {filteredBookings.length} of {cannabisBookings.length} bookings
            </p>
          </div>
          <div className=&quot;flex gap-2&quot;>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <Download className=&quot;mr-1 h-4 w-4&quot; />
              Export
            </Button>
            <Button size=&quot;sm&quot;>
              <Plus className=&quot;mr-1 h-4 w-4&quot; />
              New
            </Button>
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className=&quot;flex gap-2&quot;>
          <div className=&quot;relative flex-1&quot;>
            <Search className=&quot;absolute left-3 top-2.5 h-4 w-4 text-muted-foreground&quot; />
            <Input
              placeholder=&quot;Search bookings...&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=&quot;pl-10&quot;
            />
          </div>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <Filter className=&quot;mr-1 h-4 w-4&quot; />
            Filters
            {filtersVisible ? (
              <ChevronUp className=&quot;ml-1 h-4 w-4&quot; />
            ) : (
              <ChevronDown className=&quot;ml-1 h-4 w-4&quot; />
            )}
          </Button>
        </div>

        {/* Collapsible Filters */}
        {filtersVisible && (
          <Card>
            <CardContent className=&quot;pt-4&quot;>
              <div className=&quot;grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3&quot;>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Status&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                    <SelectItem value=&quot;confirmed&quot;>Confirmed</SelectItem>
                    <SelectItem value=&quot;pending_approval&quot;>Pending</SelectItem>
                    <SelectItem value=&quot;staff_assigned&quot;>
                      Staff Assigned
                    </SelectItem>
                    <SelectItem value=&quot;completed&quot;>Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Priority&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Priority</SelectItem>
                    <SelectItem value=&quot;high&quot;>High</SelectItem>
                    <SelectItem value=&quot;medium&quot;>Medium</SelectItem>
                    <SelectItem value=&quot;low&quot;>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Type&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Types</SelectItem>
                    <SelectItem value=&quot;product_demo&quot;>Product Demo</SelectItem>
                    <SelectItem value=&quot;conference_booth&quot;>Conference</SelectItem>
                    <SelectItem value=&quot;staff_training&quot;>Training</SelectItem>
                    <SelectItem value=&quot;trade_show&quot;>Trade Show</SelectItem>
                    <SelectItem value=&quot;product_launch&quot;>Launch</SelectItem>
                    <SelectItem value=&quot;grand_opening&quot;>Opening</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={stateFilter}
                  onValueChange={(value) => {
                    setStateFilter(value);
                    setRegionFilter(&quot;all&quot;);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;State&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All States</SelectItem>
                    <SelectItem value=&quot;California&quot;>California</SelectItem>
                    <SelectItem value=&quot;Colorado&quot;>Colorado</SelectItem>
                    <SelectItem value=&quot;Oregon&quot;>Oregon</SelectItem>
                    <SelectItem value=&quot;Nevada&quot;>Nevada</SelectItem>
                    <SelectItem value=&quot;Washington&quot;>Washington</SelectItem>
                    <SelectItem value=&quot;Arizona&quot;>Arizona</SelectItem>
                    <SelectItem value=&quot;New York&quot;>New York</SelectItem>
                    <SelectItem value=&quot;Florida&quot;>Florida</SelectItem>
                    <SelectItem value=&quot;Texas&quot;>Texas</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={regionFilter}
                  onValueChange={setRegionFilter}
                  disabled={stateFilter === &quot;all&quot;}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Region/Territory&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder=&quot;Staff Member&quot;
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                />
              </div>

              <div className=&quot;grid grid-cols-2 md:grid-cols-4 gap-3 mt-3&quot;>
                <Input
                  placeholder=&quot;Client&quot;
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                />

                <Input
                  placeholder=&quot;Brand&quot;
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                />
              </div>

              <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-3 mt-3&quot;>
                <div>
                  <label className=&quot;text-xs text-muted-foreground&quot;>
                    Date From
                  </label>
                  <Input
                    type=&quot;date&quot;
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className=&quot;text-xs text-muted-foreground&quot;>
                    Date To
                  </label>
                  <Input
                    type=&quot;date&quot;
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
                <div className=&quot;flex items-end&quot;>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Efficient Table */}
        <div className=&quot;border rounded-lg overflow-hidden&quot;>
          {/* Table Header */}
          <div className=&quot;bg-muted/50 border-b grid grid-cols-12 gap-2 p-3 text-xs font-medium text-muted-foreground&quot;>
            <div
              className=&quot;col-span-3 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;title&quot;)}
            >
              Booking{&quot; &quot;}
              {sortField === &quot;title&quot; && (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div
              className=&quot;col-span-2 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;client&quot;)}
            >
              Client/Brand{&quot; &quot;}
              {sortField === &quot;client&quot; && (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div
              className=&quot;col-span-2 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;dateScheduled&quot;)}
            >
              Schedule{&quot; &quot;}
              {sortField === &quot;dateScheduled&quot; &&
                (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div
              className=&quot;col-span-1 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;staffCount&quot;)}
            >
              Staff{&quot; &quot;}
              {sortField === &quot;staffCount&quot; &&
                (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div
              className=&quot;col-span-2 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;budget&quot;)}
            >
              Budget{&quot; &quot;}
              {sortField === &quot;budget&quot; && (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div
              className=&quot;col-span-1 cursor-pointer hover:text-foreground&quot;
              onClick={() => handleSort(&quot;status&quot;)}
            >
              Status{&quot; &quot;}
              {sortField === &quot;status&quot; && (sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;)}
            </div>
            <div className=&quot;col-span-1&quot;>Actions</div>
          </div>

          {/* Table Body */}
          <div className=&quot;divide-y&quot;>
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className=&quot;grid grid-cols-12 gap-2 p-3 hover:bg-muted/30 text-sm&quot;
              >
                <div className=&quot;col-span-3&quot;>
                  <div className=&quot;font-medium truncate&quot;>{booking.title}</div>
                  <div className=&quot;text-xs text-muted-foreground truncate&quot;>
                    {booking.bookingType.replace(&quot;_&quot;, &quot; &quot;)}
                  </div>
                  <div className=&quot;flex items-center gap-1 mt-1&quot;>
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(booking.priority)}`}
                    ></div>
                    <span className=&quot;text-xs capitalize&quot;>
                      {booking.priority}
                    </span>
                  </div>
                </div>

                <div className=&quot;col-span-2&quot;>
                  <div className=&quot;font-medium truncate&quot;>{booking.client}</div>
                  <div className=&quot;text-xs text-muted-foreground truncate&quot;>
                    {booking.brand}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>
                    {booking.state}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground truncate&quot;>
                    {booking.region}
                  </div>
                </div>

                <div className=&quot;col-span-2&quot;>
                  <div className=&quot;font-medium&quot;>
                    {new Date(booking.dateScheduled).toLocaleDateString()}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>
                    {booking.timeStart}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>
                    Stage {booking.stage.replace(&quot;stage_&quot;, &quot;&quot;)}
                  </div>
                </div>

                <div className=&quot;col-span-1&quot;>
                  <div className=&quot;flex items-center gap-1 mb-1&quot;>
                    <Users className=&quot;h-3 w-3&quot; />
                    <span className=&quot;text-sm&quot;>{booking.staffCount}</span>
                  </div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>
                    {booking.assignedStaff.slice(0, 2).join(&quot;, &quot;)}
                    {booking.assignedStaff.length > 2 &&
                      ` +${booking.assignedStaff.length - 2}`}
                  </div>
                </div>

                <div className=&quot;col-span-2&quot;>
                  <div className=&quot;font-medium&quot;>
                    ${booking.budget.toLocaleString()}
                  </div>
                  <div className=&quot;text-xs text-green-600&quot;>
                    ${booking.estimatedRevenue.toLocaleString()}
                  </div>
                </div>

                <div className=&quot;col-span-1&quot;>
                  <div className=&quot;flex items-center gap-1&quot;>
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                    ></div>
                    <span className=&quot;text-xs truncate&quot;>
                      {booking.status.replace(&quot;_&quot;, &quot; &quot;)}
                    </span>
                  </div>
                </div>

                <div className=&quot;col-span-1&quot;>
                  <div className=&quot;flex gap-1&quot;>
                    <button
                      className=&quot;p-1 hover:bg-muted rounded&quot;
                      title=&quot;View&quot;
                      onClick={() => handleViewBooking(booking.id)}
                    >
                      <Eye className=&quot;h-3 w-3&quot; />
                    </button>
                    <button
                      className=&quot;p-1 hover:bg-muted rounded&quot;
                      title=&quot;Edit&quot;
                      onClick={() => handleEditBooking(booking.id)}
                    >
                      <Edit className=&quot;h-3 w-3&quot; />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className=&quot;flex items-center justify-between&quot;>
            <div className=&quot;text-sm text-muted-foreground&quot;>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{&quot; &quot;}
              {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{&quot; &quot;}
              {filteredBookings.length} results
            </div>
            <div className=&quot;flex gap-1&quot;>
              <Button
                variant=&quot;outline&quot;
                size=&quot;sm&quot;
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
                    variant={currentPage === pageNum ? &quot;default&quot; : &quot;outline&quot;}
                    size=&quot;sm&quot;
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant=&quot;outline&quot;
                size=&quot;sm&quot;
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
        <div className=&quot;grid grid-cols-2 md:grid-cols-4 gap-4&quot;>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;text-lg font-bold&quot;>{filteredBookings.length}</div>
              <div className=&quot;text-xs text-muted-foreground&quot;>
                Total Bookings
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;text-lg font-bold&quot;>
                $
                {filteredBookings
                  .reduce((sum, b) => sum + b.budget, 0)
                  .toLocaleString()}
              </div>
              <div className=&quot;text-xs text-muted-foreground&quot;>Total Budget</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;text-lg font-bold&quot;>
                {filteredBookings.reduce((sum, b) => sum + b.staffCount, 0)}
              </div>
              <div className=&quot;text-xs text-muted-foreground&quot;>
                Staff Assigned
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;text-lg font-bold&quot;>
                {new Set(filteredBookings.map((b) => b.state)).size}
              </div>
              <div className=&quot;text-xs text-muted-foreground">Active States</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
