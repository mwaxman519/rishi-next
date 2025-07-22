"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  MoreVertical,
  FileEdit,
  FileText,
  Download,
  Mail,
  Building,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { useAuthorization } from "@/hooks/useAuthorization";

// Mock data for invoices
const mockInvoices = [
  {
    id: "INV-2024-0101",
    client: "Evergreen Dispensary",
    amount: "$2,450.00",
    dueDate: "2024-05-15",
    status: "Paid",
    description: "April 2024 Services",
    issueDate: "2024-04-01",
    paymentDate: "2024-04-10",
  },
  {
    id: "INV-2024-0102",
    client: "Emerald Coast Cannabis",
    amount: "$3,150.00",
    dueDate: "2024-05-15",
    status: "Pending",
    description: "April 2024 Services",
    issueDate: "2024-04-01",
    paymentDate: null,
  },
  {
    id: "INV-2024-0103",
    client: "Healing Leaves Medical",
    amount: "$1,850.00",
    dueDate: "2024-05-15",
    status: "Paid",
    description: "April 2024 Services",
    issueDate: "2024-04-01",
    paymentDate: "2024-04-05",
  },
  {
    id: "INV-2024-0104",
    client: "GreenPath Wellness",
    amount: "$2,250.00",
    dueDate: "2024-05-15",
    status: "Overdue",
    description: "April 2024 Services",
    issueDate: "2024-04-01",
    paymentDate: null,
  },
  {
    id: "INV-2024-0105",
    client: "Herbal Solutions",
    amount: "$1,650.00",
    dueDate: "2024-05-15",
    status: "Pending",
    description: "April 2024 Services",
    issueDate: "2024-04-01",
    paymentDate: null,
  },
];

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: 1,
    client: "Evergreen Dispensary",
    type: "Credit Card",
    lastFour: "4242",
    expiryDate: "05/2025",
    default: true,
    status: "Active",
    addedDate: "2023-10-05",
  },
  {
    id: 2,
    client: "Emerald Coast Cannabis",
    type: "ACH Bank Transfer",
    lastFour: "7890",
    expiryDate: "N/A",
    default: true,
    status: "Active",
    addedDate: "2023-11-10",
  },
  {
    id: 3,
    client: "Healing Leaves Medical",
    type: "Credit Card",
    lastFour: "5678",
    expiryDate: "08/2026",
    default: true,
    status: "Active",
    addedDate: "2024-01-15",
  },
  {
    id: 4,
    client: "GreenPath Wellness",
    type: "Credit Card",
    lastFour: "9012",
    expiryDate: "12/2024",
    default: true,
    status: "Expired",
    addedDate: "2023-09-20",
  },
  {
    id: 5,
    client: "Herbal Solutions",
    type: "ACH Bank Transfer",
    lastFour: "3456",
    expiryDate: "N/A",
    default: true,
    status: "Active",
    addedDate: "2024-03-05",
  },
];

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");
  const { checkPermission } = useAuthorization();

  // Filter invoices based on search query
  const filteredInvoices = mockInvoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter payment methods based on search query
  const filteredPaymentMethods = mockPaymentMethods.filter(
    (method) =>
      method.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to get status badge color for invoices
  const getInvoiceStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Overdue
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to get status badge color for payment methods
  const getPaymentMethodStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Expired
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to get payment method icon
  const getPaymentMethodIcon = (type: string) => {
    if (type.toLowerCase().includes("credit card")) {
      return <CreditCard className="h-4 w-4 text-blue-600" />;
    } else if (
      type.toLowerCase().includes("ach") ||
      type.toLowerCase().includes("bank")
    ) {
      return <Building className="h-4 w-4 text-indigo-600" />;
    } else {
      return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage client invoices, billing, and payment information
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder={`Search ${activeTab}...`}
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className="flex items-center gap-1"
            disabled={
              !checkPermission(
                activeTab === "invoices"
                  ? "create:invoices"
                  : "manage:payment-methods",
              )
            }
          >
            <Plus className="h-4 w-4" />
            {activeTab === "invoices" ? "Create Invoice" : "Add Payment Method"}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="invoices"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Invoices</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment-methods"
            className="flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment Methods</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            {invoice.id}
                          </div>
                        </TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell className="font-medium">
                          {invoice.amount}
                        </TableCell>
                        <TableCell>{invoice.issueDate}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          {getInvoiceStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Invoice Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={!checkPermission("view:invoices")}
                              >
                                <FileText className="h-4 w-4 mr-2" /> View
                                Invoice
                              </DropdownMenuItem>
                              {invoice.status !== "Paid" && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  disabled={!checkPermission("edit:invoices")}
                                >
                                  <FileEdit className="h-4 w-4 mr-2" /> Edit
                                  Invoice
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer">
                                <Download className="h-4 w-4 mr-2" /> Download
                                PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" /> Email Invoice
                              </DropdownMenuItem>
                              {invoice.status === "Pending" && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-green-600"
                                  disabled={!checkPermission("manage:invoices")}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark
                                  as Paid
                                </DropdownMenuItem>
                              )}
                              {invoice.status === "Overdue" && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-yellow-600"
                                  disabled={!checkPermission("manage:invoices")}
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" /> Send
                                  Reminder
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Client</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Last 4</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaymentMethods.length > 0 ? (
                    filteredPaymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">
                          {method.client}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(method.type)}
                            {method.type}
                          </div>
                        </TableCell>
                        <TableCell>•••• {method.lastFour}</TableCell>
                        <TableCell>{method.expiryDate}</TableCell>
                        <TableCell>{method.default ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          {getPaymentMethodStatusBadge(method.status)}
                        </TableCell>
                        <TableCell>{method.addedDate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Payment Method Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={
                                  !checkPermission("manage:payment-methods")
                                }
                              >
                                <FileEdit className="h-4 w-4 mr-2" /> Edit
                                Payment Method
                              </DropdownMenuItem>
                              {!method.default && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  disabled={
                                    !checkPermission("manage:payment-methods")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" /> Set
                                  as Default
                                </DropdownMenuItem>
                              )}
                              {method.status === "Expired" && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-yellow-600"
                                  disabled={
                                    !checkPermission("manage:payment-methods")
                                  }
                                >
                                  <Clock className="h-4 w-4 mr-2" /> Update
                                  Expiry
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        No payment methods found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
