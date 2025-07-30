&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
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
} from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;../../components/ui/dropdown-menu&quot;;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;../../components/ui/table&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;../../components/ui/tabs&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;

// Mock data for invoices

// Mock data for payment methods

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [activeTab, setActiveTab] = useState(&quot;invoices&quot;);
  const { checkPermission } = useAuthorization();

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter payment methods based on search query
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [invoicesResponse, paymentMethodsResponse] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/payment-methods')
        ]);

        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setInvoices(invoicesData.data || []);
        }

        if (paymentMethodsResponse.ok) {
          const paymentMethodsData = await paymentMethodsResponse.json();
          setPaymentMethods(paymentMethodsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const filteredPaymentMethods = paymentMethods.filter(
    (method) =>
      method.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to get status badge color for invoices
  const getInvoiceStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case &quot;paid&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            Paid
          </Badge>
        );
      case &quot;pending&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;
          >
            Pending
          </Badge>
        );
      case &quot;overdue&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-red-50 text-red-700 border-red-200&quot;
          >
            Overdue
          </Badge>
        );
      case &quot;draft&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-gray-50 text-gray-700 border-gray-200&quot;
          >
            Draft
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  // Function to get status badge color for payment methods
  const getPaymentMethodStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case &quot;active&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            Active
          </Badge>
        );
      case &quot;expired&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-red-50 text-red-700 border-red-200&quot;
          >
            Expired
          </Badge>
        );
      case &quot;inactive&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-gray-50 text-gray-700 border-gray-200&quot;
          >
            Inactive
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  // Function to get payment method icon
  const getPaymentMethodIcon = (type: string) => {
    if (type.toLowerCase().includes(&quot;credit card&quot;)) {
      return <CreditCard className=&quot;h-4 w-4 text-blue-600&quot; />;
    } else if (
      type.toLowerCase().includes(&quot;ach&quot;) ||
      type.toLowerCase().includes(&quot;bank&quot;)
    ) {
      return <Building className=&quot;h-4 w-4 text-indigo-600&quot; />;
    } else {
      return <Receipt className=&quot;h-4 w-4 text-gray-600&quot; />;
    }
  };

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
            Billing Management
          </h1>
          <p className=&quot;mt-1 text-gray-600 dark:text-gray-400&quot;>
            Manage client invoices, billing, and payment information
          </p>
        </div>

        <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
            <Input
              type=&quot;search&quot;
              placeholder={`Search ${activeTab}...`}
              className=&quot;pl-8 w-full sm:w-[250px]&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className=&quot;flex items-center gap-1&quot;
            disabled={
              !checkPermission(
                activeTab === &quot;invoices&quot;
                  ? &quot;create:invoices&quot;
                  : &quot;manage:payment-methods&quot;,
              )
            }
          >
            <Plus className=&quot;h-4 w-4&quot; />
            {activeTab === &quot;invoices&quot; ? &quot;Create Invoice&quot; : &quot;Add Payment Method&quot;}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue=&quot;invoices&quot;
        className=&quot;mb-6&quot;
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value=&quot;invoices&quot; className=&quot;flex items-center gap-1&quot;>
            <FileText className=&quot;h-4 w-4&quot; />
            <span>Invoices</span>
          </TabsTrigger>
          <TabsTrigger
            value=&quot;payment-methods&quot;
            className=&quot;flex items-center gap-1&quot;
          >
            <CreditCard className=&quot;h-4 w-4&quot; />
            <span>Payment Methods</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;invoices&quot;>
          <Card>
            <CardContent className=&quot;p-0&quot;>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className=&quot;w-[150px]&quot;>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className=&quot;text-right&quot;>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className=&quot;font-medium&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <div className=&quot;flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3&quot;>
                              <FileText className=&quot;h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
                            </div>
                            {invoice.id}
                          </div>
                        </TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell className=&quot;font-medium&quot;>
                          {invoice.amount}
                        </TableCell>
                        <TableCell>{invoice.issueDate}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          {getInvoiceStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className=&quot;text-right&quot;>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                                <MoreVertical className=&quot;h-4 w-4&quot; />
                                <span className=&quot;sr-only&quot;>Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align=&quot;end&quot;>
                              <DropdownMenuLabel>
                                Invoice Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className=&quot;cursor-pointer&quot;
                                disabled={!checkPermission(&quot;view:invoices&quot;)}
                              >
                                <FileText className=&quot;h-4 w-4 mr-2&quot; /> View
                                Invoice
                              </DropdownMenuItem>
                              {invoice.status !== &quot;Paid&quot; && (
                                <DropdownMenuItem
                                  className=&quot;cursor-pointer&quot;
                                  disabled={!checkPermission(&quot;edit:invoices&quot;)}
                                >
                                  <FileEdit className=&quot;h-4 w-4 mr-2&quot; /> Edit
                                  Invoice
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className=&quot;cursor-pointer&quot;>
                                <Download className=&quot;h-4 w-4 mr-2&quot; /> Download
                                PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className=&quot;cursor-pointer&quot;>
                                <Mail className=&quot;h-4 w-4 mr-2&quot; /> Email Invoice
                              </DropdownMenuItem>
                              {invoice.status === &quot;Pending&quot; && (
                                <DropdownMenuItem
                                  className=&quot;cursor-pointer text-green-600&quot;
                                  disabled={!checkPermission(&quot;manage:invoices&quot;)}
                                >
                                  <CheckCircle2 className=&quot;h-4 w-4 mr-2&quot; /> Mark
                                  as Paid
                                </DropdownMenuItem>
                              )}
                              {invoice.status === &quot;Overdue&quot; && (
                                <DropdownMenuItem
                                  className=&quot;cursor-pointer text-yellow-600&quot;
                                  disabled={!checkPermission(&quot;manage:invoices&quot;)}
                                >
                                  <AlertCircle className=&quot;h-4 w-4 mr-2&quot; /> Send
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
                        className=&quot;text-center py-8 text-gray-500 dark:text-gray-400&quot;
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

        <TabsContent value=&quot;payment-methods&quot;>
          <Card>
            <CardContent className=&quot;p-0&quot;>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className=&quot;w-[250px]&quot;>Client</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Last 4</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className=&quot;text-right&quot;>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaymentMethods.length > 0 ? (
                    filteredPaymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className=&quot;font-medium&quot;>
                          {method.client}
                        </TableCell>
                        <TableCell>
                          <div className=&quot;flex items-center gap-2&quot;>
                            {getPaymentMethodIcon(method.type)}
                            {method.type}
                          </div>
                        </TableCell>
                        <TableCell>•••• {method.lastFour}</TableCell>
                        <TableCell>{method.expiryDate}</TableCell>
                        <TableCell>{method.default ? &quot;Yes&quot; : &quot;No&quot;}</TableCell>
                        <TableCell>
                          {getPaymentMethodStatusBadge(method.status)}
                        </TableCell>
                        <TableCell>{method.addedDate}</TableCell>
                        <TableCell className=&quot;text-right&quot;>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                                <MoreVertical className=&quot;h-4 w-4&quot; />
                                <span className=&quot;sr-only&quot;>Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align=&quot;end&quot;>
                              <DropdownMenuLabel>
                                Payment Method Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className=&quot;cursor-pointer&quot;
                                disabled={
                                  !checkPermission(&quot;manage:payment-methods&quot;)
                                }
                              >
                                <FileEdit className=&quot;h-4 w-4 mr-2&quot; /> Edit
                                Payment Method
                              </DropdownMenuItem>
                              {!method.default && (
                                <DropdownMenuItem
                                  className=&quot;cursor-pointer&quot;
                                  disabled={
                                    !checkPermission(&quot;manage:payment-methods&quot;)
                                  }
                                >
                                  <CheckCircle2 className=&quot;h-4 w-4 mr-2&quot; /> Set
                                  as Default
                                </DropdownMenuItem>
                              )}
                              {method.status === &quot;Expired&quot; && (
                                <DropdownMenuItem
                                  className=&quot;cursor-pointer text-yellow-600&quot;
                                  disabled={
                                    !checkPermission(&quot;manage:payment-methods&quot;)
                                  }
                                >
                                  <Clock className=&quot;h-4 w-4 mr-2&quot; /> Update
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
                        className=&quot;text-center py-8 text-gray-500 dark:text-gray-400"
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
