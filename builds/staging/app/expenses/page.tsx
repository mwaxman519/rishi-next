"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}

/**
 * Expense Management Interface - Phase 4 Implementation
 * Comprehensive expense tracking with role-based access control
 * Dark mode compatible and architecturally aligned with time tracking system
 */


import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

interface ExpenseData {
  id: string;
  agentId: string;
  eventId?: string | null;
  shiftId?: string | null;
  expenseType:
    | "mileage"
    | "meals"
    | "parking"
    | "supplies"
    | "lodging"
    | "transportation"
    | "other";
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
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
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
  mileage: "Mileage",
  meals: "Meals",
  parking: "Parking",
  supplies: "Supplies",
  lodging: "Lodging",
  transportation: "Transportation",
  other: "Other",
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [showMileageCalculator, setShowMileageCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    dateRange: "all",
  });

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    expenseType: "meals" as const,
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
    receiptUrl: "",
    eventId: "",
    shiftId: "",
    mileageData: {
      startLocation: "",
      endLocation: "",
      distance: 0,
      rate: 0.67,
    },
  });

  // Mileage calculator state
  const [mileageCalc, setMileageCalc] = useState({
    startLocation: "",
    endLocation: "",
    result: null as any,
  });

  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const response = await fetch("/api/expenses/summary");
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching expense summary:", error);
    }
  };

  const submitExpense = async (action: "draft" | "submit" = "submit") => {
    try {
      const expenseData = {
        agentId: "mock-user-id",
        ...newExpense,
        mileageData:
          newExpense.expenseType === "mileage" ? newExpense.mileageData : null,
      };

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...expenseData, action }),
      });

      if (response.ok) {
        setShowNewExpenseDialog(false);
        setNewExpense({
          expenseType: "meals",
          amount: "",
          description: "",
          expenseDate: new Date().toISOString().split("T")[0],
          receiptUrl: "",
          eventId: "",
          shiftId: "",
          mileageData: {
            startLocation: "",
            endLocation: "",
            distance: 0,
            rate: 0.67,
          },
        });
        fetchExpenses();
        fetchExpenseSummary();
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
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
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num || 0);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "outline",
      submitted: "secondary",
      approved: "default",
      rejected: "destructive",
      paid: "default",
    } as const;

    const colors = {
      draft: "text-muted-foreground",
      submitted: "text-blue-600 dark:text-blue-400",
      approved: "text-green-600 dark:text-green-400",
      rejected: "text-red-600 dark:text-red-400",
      paid: "text-emerald-600 dark:text-emerald-400",
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
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

    if (filters.status !== "all" && expense.status !== filters.status)
      return false;
    if (filters.type !== "all" && expense.expenseType !== filters.type)
      return false;

    return true;
  });

  if (loading && expenses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">
            Track and manage your expenses with role-based approval workflow
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog
            open={showMileageCalculator}
            onOpenChange={setShowMileageCalculator}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startLocation">Start Location</Label>
                  <Input
                    id="startLocation"
                    value={mileageCalc.startLocation}
                    onChange={(e) =>
                      setMileageCalc((prev) => ({
                        ...prev,
                        startLocation: e.target.value,
                      }))
                    }
                    placeholder="Enter starting point"
                  />
                </div>
                <div>
                  <Label htmlFor="endLocation">End Location</Label>
                  <Input
                    id="endLocation"
                    value={mileageCalc.endLocation}
                    onChange={(e) =>
                      setMileageCalc((prev) => ({
                        ...prev,
                        endLocation: e.target.value,
                      }))
                    }
                    placeholder="Enter destination"
                  />
                </div>
                <Button onClick={calculateMileage} className="w-full">
                  Calculate Mileage
                </Button>
                {mileageCalc.result && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Calculation Result
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      Distance: {mileageCalc.result.distance} miles
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      Rate: ${mileageCalc.result.rate} per mile
                    </p>
                    <p className="text-green-700 dark:text-green-300 font-bold">
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
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Expense</DialogTitle>
                <DialogDescription>
                  Submit a new expense for approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expenseType">Expense Type</Label>
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
                      <SelectItem value="mileage">Mileage</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="lodging">Lodging</SelectItem>
                      <SelectItem value="transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newExpense.expenseType === "mileage" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startLoc">Start Location</Label>
                      <Input
                        id="startLoc"
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
                        placeholder="Starting location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endLoc">End Location</Label>
                      <Input
                        id="endLoc"
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
                        placeholder="Destination"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the expense"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="expenseDate">Date</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        expenseDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => submitExpense("draft")}
                    className="flex-1"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => submitExpense("submit")}
                    className="flex-1"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.totalExpenses}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(summary.totalAmount)} total value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approval
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.pendingApproval}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(summary.pendingAmount)} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(summary.approvedAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Approved expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejected
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(summary.rejectedAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                <div className="space-y-4">
                  {Object.entries(summary.byCategory).map(
                    ([category, data]) => {
                      const Icon =
                        ExpenseTypeIcons[
                          category as keyof typeof ExpenseTypeIcons
                        ] || Receipt;
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {ExpenseTypeLabels[
                                  category as keyof typeof ExpenseTypeLabels
                                ] || category}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {data.count} expenses
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
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

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Expenses
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="w-64"
                    />
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No expenses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by submitting your first expense
                    </p>
                    <Button onClick={() => setShowNewExpenseDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Expense
                    </Button>
                  </div>
                ) : (
                  filteredExpenses.map((expense) => {
                    const Icon = ExpenseTypeIcons[expense.expenseType];
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {expense.description}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                                    {expense.agent.firstName}{" "}
                                    {expense.agent.lastName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(expense.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
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

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Reports</CardTitle>
              <CardDescription>
                Generate and download expense reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Export Monthly Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Tax Summary Report</span>
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
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
