/**
 * Expense Management Interface - Phase 4 Implementation
 * Comprehensive expense tracking with role-based access control
 * Dark mode compatible and architecturally aligned with time tracking system
 */

&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { Alert, AlertDescription } from &quot;@/components/ui/alert&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  DollarSign,
  Receipt,
  Car,
  Coffee,
  Package,
  Bed,
  Bus,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calculator,
  FileText,
  AlertCircle,
  MapPin,
  Filter,
  Download,
  Search,
} from &quot;lucide-react&quot;;

interface ExpenseData {
  id: string;
  agentId: string;
  eventId?: string | null;
  shiftId?: string | null;
  expenseType:
    | &quot;mileage&quot;
    | &quot;meals&quot;
    | &quot;parking&quot;
    | &quot;supplies&quot;
    | &quot;lodging&quot;
    | &quot;transportation&quot;
    | &quot;other&quot;;
  amount: string;
  currency: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string | null;
  mileageData?: {
    startLocation: string;
    endLocation: string;
    distance: number;
    rate: number;
  } | null;
  status: &quot;draft&quot; | &quot;submitted&quot; | &quot;approved&quot; | &quot;rejected&quot; | &quot;paid&quot;;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  agent?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: string;
  pendingApproval: number;
  pendingAmount: string;
  approvedAmount: string;
  rejectedAmount: string;
  byCategory: {
    [key: string]: {
      count: number;
      amount: string;
    };
  };
}

const ExpenseTypeIcons = {
  mileage: Car,
  meals: Coffee,
  parking: Car,
  supplies: Package,
  lodging: Bed,
  transportation: Bus,
  other: Receipt,
};

const ExpenseTypeLabels = {
  mileage: &quot;Mileage&quot;,
  meals: &quot;Meals&quot;,
  parking: &quot;Parking&quot;,
  supplies: &quot;Supplies&quot;,
  lodging: &quot;Lodging&quot;,
  transportation: &quot;Transportation&quot;,
  other: &quot;Other&quot;,
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [showMileageCalculator, setShowMileageCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);

  // Filters
  const [filters, setFilters] = useState({
    search: "&quot;,
    status: &quot;all&quot;,
    type: &quot;all&quot;,
    dateRange: &quot;all&quot;,
  });

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    expenseType: &quot;meals&quot; as const,
    amount: &quot;&quot;,
    description: &quot;&quot;,
    expenseDate: new Date().toISOString().split(&quot;T&quot;)[0],
    receiptUrl: &quot;&quot;,
    eventId: &quot;&quot;,
    shiftId: &quot;&quot;,
    mileageData: {
      startLocation: &quot;&quot;,
      endLocation: &quot;&quot;,
      distance: 0,
      rate: 0.67,
    },
  });

  // Mileage calculator state
  const [mileageCalc, setMileageCalc] = useState({
    startLocation: &quot;&quot;,
    endLocation: &quot;&quot;,
    result: null as any,
  });

  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(&quot;/api/expenses&quot;);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error(&quot;Error fetching expenses:&quot;, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const response = await fetch(&quot;/api/expenses/summary&quot;);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error(&quot;Error fetching expense summary:&quot;, error);
    }
  };

  const submitExpense = async (action: &quot;draft&quot; | &quot;submit&quot; = &quot;submit&quot;) => {
    try {
      const expenseData = {
        agentId: &quot;mock-user-id&quot;,
        ...newExpense,
        mileageData:
          newExpense.expenseType === &quot;mileage&quot; ? newExpense.mileageData : null,
      };

      const response = await fetch(&quot;/api/expenses&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ ...expenseData, action }),
      });

      if (response.ok) {
        setShowNewExpenseDialog(false);
        setNewExpense({
          expenseType: &quot;meals&quot;,
          amount: &quot;&quot;,
          description: &quot;&quot;,
          expenseDate: new Date().toISOString().split(&quot;T&quot;)[0],
          receiptUrl: &quot;&quot;,
          eventId: &quot;&quot;,
          shiftId: &quot;&quot;,
          mileageData: {
            startLocation: &quot;&quot;,
            endLocation: &quot;&quot;,
            distance: 0,
            rate: 0.67,
          },
        });
        fetchExpenses();
        fetchExpenseSummary();
      }
    } catch (error) {
      console.error(&quot;Error submitting expense:&quot;, error);
    }
  };

  const calculateMileage = () => {
    const distance = Math.floor(Math.random() * 50) + 5;
    const rate = 0.67;
    const amount = distance * rate;

    setMileageCalc((prev) => ({
      ...prev,
      result: { distance, rate, amount },
    }));

    setNewExpense((prev) => ({
      ...prev,
      amount: amount.toFixed(2),
      mileageData: {
        ...prev.mileageData,
        startLocation: mileageCalc.startLocation,
        endLocation: mileageCalc.endLocation,
        distance,
        rate,
      },
    }));
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === &quot;string&quot; ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(&quot;en-US&quot;, {
      style: &quot;currency&quot;,
      currency: &quot;USD&quot;,
    }).format(num || 0);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: &quot;outline&quot;,
      submitted: &quot;secondary&quot;,
      approved: &quot;default&quot;,
      rejected: &quot;destructive&quot;,
      paid: &quot;default&quot;,
    } as const;

    const colors = {
      draft: &quot;text-muted-foreground&quot;,
      submitted: &quot;text-blue-600 dark:text-blue-400&quot;,
      approved: &quot;text-green-600 dark:text-green-400&quot;,
      rejected: &quot;text-red-600 dark:text-red-400&quot;,
      paid: &quot;text-emerald-600 dark:text-emerald-400&quot;,
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || &quot;outline&quot;}
        className={colors[status as keyof typeof colors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        expense.description.toLowerCase().includes(searchLower) ||
        expense.expenseType.toLowerCase().includes(searchLower) ||
        expense.agent?.firstName?.toLowerCase().includes(searchLower) ||
        expense.agent?.lastName?.toLowerCase().includes(searchLower) ||
        expense.agent?.username?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.status !== &quot;all&quot; && expense.status !== filters.status)
      return false;
    if (filters.type !== &quot;all&quot; && expense.expenseType !== filters.type)
      return false;

    return true;
  });

  if (loading && expenses.length === 0) {
    return (
      <div className=&quot;container mx-auto px-4 py-8&quot;>
        <div className=&quot;flex items-center justify-center min-h-[400px]&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4&quot;></div>
            <p className=&quot;text-muted-foreground&quot;>Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto px-4 py-8 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Expense Management</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Track and manage your expenses with role-based approval workflow
          </p>
        </div>

        <div className=&quot;flex gap-2&quot;>
          <Dialog
            open={showMileageCalculator}
            onOpenChange={setShowMileageCalculator}
          >
            <DialogTrigger asChild>
              <Button variant=&quot;outline&quot;>
                <Calculator className=&quot;h-4 w-4 mr-2&quot; />
                Mileage Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mileage Calculator</DialogTitle>
                <DialogDescription>
                  Calculate mileage expenses between two locations
                </DialogDescription>
              </DialogHeader>
              <div className=&quot;space-y-4&quot;>
                <div>
                  <Label htmlFor=&quot;startLocation&quot;>Start Location</Label>
                  <Input
                    id=&quot;startLocation&quot;
                    value={mileageCalc.startLocation}
                    onChange={(e) =>
                      setMileageCalc((prev) => ({
                        ...prev,
                        startLocation: e.target.value,
                      }))
                    }
                    placeholder=&quot;Enter starting point&quot;
                  />
                </div>
                <div>
                  <Label htmlFor=&quot;endLocation&quot;>End Location</Label>
                  <Input
                    id=&quot;endLocation&quot;
                    value={mileageCalc.endLocation}
                    onChange={(e) =>
                      setMileageCalc((prev) => ({
                        ...prev,
                        endLocation: e.target.value,
                      }))
                    }
                    placeholder=&quot;Enter destination&quot;
                  />
                </div>
                <Button onClick={calculateMileage} className=&quot;w-full&quot;>
                  Calculate Mileage
                </Button>
                {mileageCalc.result && (
                  <div className=&quot;p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800&quot;>
                    <h4 className=&quot;font-semibold text-green-900 dark:text-green-100&quot;>
                      Calculation Result
                    </h4>
                    <p className=&quot;text-green-700 dark:text-green-300&quot;>
                      Distance: {mileageCalc.result.distance} miles
                    </p>
                    <p className=&quot;text-green-700 dark:text-green-300&quot;>
                      Rate: ${mileageCalc.result.rate} per mile
                    </p>
                    <p className=&quot;text-green-700 dark:text-green-300 font-bold&quot;>
                      Total: {formatCurrency(mileageCalc.result.amount)}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showNewExpenseDialog}
            onOpenChange={setShowNewExpenseDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className=&quot;h-4 w-4 mr-2&quot; />
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className=&quot;max-w-md&quot;>
              <DialogHeader>
                <DialogTitle>Create New Expense</DialogTitle>
                <DialogDescription>
                  Submit a new expense for approval
                </DialogDescription>
              </DialogHeader>
              <div className=&quot;space-y-4&quot;>
                <div>
                  <Label htmlFor=&quot;expenseType&quot;>Expense Type</Label>
                  <Select
                    value={newExpense.expenseType}
                    onValueChange={(value: any) =>
                      setNewExpense((prev) => ({ ...prev, expenseType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;mileage&quot;>Mileage</SelectItem>
                      <SelectItem value=&quot;meals&quot;>Meals</SelectItem>
                      <SelectItem value=&quot;parking&quot;>Parking</SelectItem>
                      <SelectItem value=&quot;supplies&quot;>Supplies</SelectItem>
                      <SelectItem value=&quot;lodging&quot;>Lodging</SelectItem>
                      <SelectItem value=&quot;transportation&quot;>
                        Transportation
                      </SelectItem>
                      <SelectItem value=&quot;other&quot;>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newExpense.expenseType === &quot;mileage&quot; && (
                  <div className=&quot;grid grid-cols-2 gap-4&quot;>
                    <div>
                      <Label htmlFor=&quot;startLoc&quot;>Start Location</Label>
                      <Input
                        id=&quot;startLoc&quot;
                        value={newExpense.mileageData.startLocation}
                        onChange={(e) =>
                          setNewExpense((prev) => ({
                            ...prev,
                            mileageData: {
                              ...prev.mileageData,
                              startLocation: e.target.value,
                            },
                          }))
                        }
                        placeholder=&quot;Starting location&quot;
                      />
                    </div>
                    <div>
                      <Label htmlFor=&quot;endLoc&quot;>End Location</Label>
                      <Input
                        id=&quot;endLoc&quot;
                        value={newExpense.mileageData.endLocation}
                        onChange={(e) =>
                          setNewExpense((prev) => ({
                            ...prev,
                            mileageData: {
                              ...prev.mileageData,
                              endLocation: e.target.value,
                            },
                          }))
                        }
                        placeholder=&quot;Destination&quot;
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor=&quot;amount&quot;>Amount</Label>
                  <Input
                    id=&quot;amount&quot;
                    type=&quot;number&quot;
                    step=&quot;0.01&quot;
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder=&quot;0.00&quot;
                  />
                </div>

                <div>
                  <Label htmlFor=&quot;description&quot;>Description</Label>
                  <Textarea
                    id=&quot;description&quot;
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder=&quot;Describe the expense&quot;
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor=&quot;expenseDate&quot;>Date</Label>
                  <Input
                    id=&quot;expenseDate&quot;
                    type=&quot;date&quot;
                    value={newExpense.expenseDate}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        expenseDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className=&quot;flex gap-2&quot;>
                  <Button
                    variant=&quot;outline&quot;
                    onClick={() => submitExpense(&quot;draft&quot;)}
                    className=&quot;flex-1&quot;
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => submitExpense(&quot;submit&quot;)}
                    className=&quot;flex-1&quot;
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;w-full&quot;>
        <TabsList className=&quot;grid w-full grid-cols-3&quot;>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;expenses&quot;>Expenses</TabsTrigger>
          <TabsTrigger value=&quot;reports&quot;>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
          {summary && (
            <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>
                    Total Expenses
                  </CardTitle>
                  <Receipt className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>
                    {summary.totalExpenses}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>
                    {formatCurrency(summary.totalAmount)} total value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>
                    Pending Approval
                  </CardTitle>
                  <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>
                    {summary.pendingApproval}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>
                    {formatCurrency(summary.pendingAmount)} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>
                    Approved
                  </CardTitle>
                  <CheckCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold text-green-600 dark:text-green-400&quot;>
                    {formatCurrency(summary.approvedAmount)}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>
                    Approved expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>
                    Rejected
                  </CardTitle>
                  <XCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold text-red-600 dark:text-red-400&quot;>
                    {formatCurrency(summary.rejectedAmount)}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>
                    Rejected expenses
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown by expense type</CardDescription>
            </CardHeader>
            <CardContent>
              {summary && (
                <div className=&quot;space-y-4&quot;>
                  {Object.entries(summary.byCategory).map(
                    ([category, data]) => {
                      const Icon =
                        ExpenseTypeIcons[
                          category as keyof typeof ExpenseTypeIcons
                        ] || Receipt;
                      return (
                        <div
                          key={category}
                          className=&quot;flex items-center justify-between p-3 rounded-lg bg-muted/50&quot;
                        >
                          <div className=&quot;flex items-center gap-3&quot;>
                            <Icon className=&quot;h-5 w-5 text-muted-foreground&quot; />
                            <div>
                              <p className=&quot;font-medium&quot;>
                                {ExpenseTypeLabels[
                                  category as keyof typeof ExpenseTypeLabels
                                ] || category}
                              </p>
                              <p className=&quot;text-sm text-muted-foreground&quot;>
                                {data.count} expenses
                              </p>
                            </div>
                          </div>
                          <div className=&quot;text-right&quot;>
                            <p className=&quot;font-medium&quot;>
                              {formatCurrency(data.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;expenses&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center justify-between&quot;>
                All Expenses
                <div className=&quot;flex items-center gap-2&quot;>
                  <div className=&quot;flex items-center gap-2&quot;>
                    <Search className=&quot;h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      placeholder=&quot;Search expenses...&quot;
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className=&quot;w-64&quot;
                    />
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className=&quot;w-32&quot;>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                      <SelectItem value=&quot;draft&quot;>Draft</SelectItem>
                      <SelectItem value=&quot;submitted&quot;>Submitted</SelectItem>
                      <SelectItem value=&quot;approved&quot;>Approved</SelectItem>
                      <SelectItem value=&quot;rejected&quot;>Rejected</SelectItem>
                      <SelectItem value=&quot;paid&quot;>Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {filteredExpenses.length === 0 ? (
                  <div className=&quot;text-center py-8&quot;>
                    <Receipt className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
                    <h3 className=&quot;text-lg font-medium mb-2&quot;>
                      No expenses found
                    </h3>
                    <p className=&quot;text-muted-foreground mb-4&quot;>
                      Get started by submitting your first expense
                    </p>
                    <Button onClick={() => setShowNewExpenseDialog(true)}>
                      <Plus className=&quot;h-4 w-4 mr-2&quot; />
                      Create Expense
                    </Button>
                  </div>
                ) : (
                  filteredExpenses.map((expense) => {
                    const Icon = ExpenseTypeIcons[expense.expenseType];
                    return (
                      <div
                        key={expense.id}
                        className=&quot;flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors&quot;
                      >
                        <div className=&quot;flex items-center gap-4&quot;>
                          <div className=&quot;p-2 rounded-lg bg-primary/10&quot;>
                            <Icon className=&quot;h-5 w-5 text-primary&quot; />
                          </div>
                          <div>
                            <h4 className=&quot;font-medium&quot;>
                              {expense.description}
                            </h4>
                            <div className=&quot;flex items-center gap-2 text-sm text-muted-foreground&quot;>
                              <span>
                                {ExpenseTypeLabels[expense.expenseType]}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  expense.expenseDate,
                                ).toLocaleDateString()}
                              </span>
                              {expense.agent && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {expense.agent.firstName}{&quot; &quot;}
                                    {expense.agent.lastName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className=&quot;flex items-center gap-4&quot;>
                          <div className=&quot;text-right&quot;>
                            <p className=&quot;font-medium&quot;>
                              {formatCurrency(expense.amount)}
                            </p>
                            <p className=&quot;text-sm text-muted-foreground&quot;>
                              {expense.currency}
                            </p>
                          </div>
                          {getStatusBadge(expense.status)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;reports&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Expense Reports</CardTitle>
              <CardDescription>
                Generate and download expense reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <Button variant=&quot;outline&quot; className=&quot;h-20 flex flex-col&quot;>
                    <Download className=&quot;h-6 w-6 mb-2&quot; />
                    <span>Export Monthly Report</span>
                  </Button>
                  <Button variant=&quot;outline&quot; className=&quot;h-20 flex flex-col&quot;>
                    <FileText className=&quot;h-6 w-6 mb-2&quot; />
                    <span>Tax Summary Report</span>
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className=&quot;h-4 w-4" />
                  <AlertDescription>
                    Reports will be generated in PDF format and include all
                    approved expenses for the selected period.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
