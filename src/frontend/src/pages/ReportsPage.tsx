import { useState, useMemo } from 'react';
import { useExpenses, useRevenue, useCategories, useBanks, usePaymentMethods, useCogsTotal } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Loader2, Printer } from 'lucide-react';
import NumericCell from '../components/NumericCell';

type ReportType = 'daily' | 'monthly' | '3month' | '6month' | '1year';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: revenue = [], isLoading: revenueLoading } = useRevenue();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: banks = [], isLoading: banksLoading } = useBanks();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();

  const { startDate, endDate } = useMemo(() => {
    const date = new Date(selectedDate);
    let start: Date;
    let end: Date;

    switch (reportType) {
      case 'daily':
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        break;
      case 'monthly':
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        break;
      case '3month':
        start = new Date(date.getFullYear(), date.getMonth() - 2, 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        break;
      case '6month':
        start = new Date(date.getFullYear(), date.getMonth() - 5, 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        break;
      case '1year':
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
        break;
    }

    return { startDate: start, endDate: end };
  }, [reportType, selectedDate]);

  const startTimestamp = BigInt(startDate.getTime() * 1000000);
  const endTimestamp = BigInt(endDate.getTime() * 1000000);

  const { data: cogsTotalValue = 0, isLoading: cogsLoading } = useCogsTotal(startTimestamp, endTimestamp);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = expense.date;
      const inDateRange = expenseDate >= startTimestamp && expenseDate <= endTimestamp;
      const matchesPaymentMethod = paymentMethodFilter === 'all' || expense.paymentMethod === paymentMethodFilter;
      const matchesBank =
        bankFilter === 'all' || (expense.bank && expense.bank.toString() === bankFilter);
      return inDateRange && matchesPaymentMethod && matchesBank;
    });
  }, [expenses, startTimestamp, endTimestamp, paymentMethodFilter, bankFilter]);

  const filteredRevenue = useMemo(() => {
    return revenue.filter((rev) => {
      const revDate = rev.date;
      return revDate >= startTimestamp && revDate <= endTimestamp;
    });
  }, [revenue, startTimestamp, endTimestamp]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalRevenue - totalExpenses - cogsTotalValue;

  const expensesByBank = useMemo(() => {
    const grouped = new Map<string, typeof filteredExpenses>();
    filteredExpenses.forEach((expense) => {
      const bankId = expense.bank?.toString() || 'none';
      if (!grouped.has(bankId)) {
        grouped.set(bankId, []);
      }
      grouped.get(bankId)!.push(expense);
    });
    return grouped;
  }, [filteredExpenses]);

  const expensesByPaymentMethod = useMemo(() => {
    const grouped = new Map<string, typeof filteredExpenses>();
    filteredExpenses.forEach((expense) => {
      const method = expense.paymentMethod;
      if (!grouped.has(method)) {
        grouped.set(method, []);
      }
      grouped.get(method)!.push(expense);
    });
    return grouped;
  }, [filteredExpenses]);

  const handlePrint = () => {
    window.print();
  };

  const isLoading = expensesLoading || revenueLoading || categoriesLoading || banksLoading || paymentMethodsLoading || cogsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and view financial reports</p>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="3month">3 Months</SelectItem>
                  <SelectItem value="6month">6 Months</SelectItem>
                  <SelectItem value="1year">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bank</label>
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {banks.map(([id, name]) => (
                    <SelectItem key={id.toString()} value={id.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Financial Summary - {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-sm font-semibold">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Total Expenses</span>
              <span className="text-sm font-semibold text-destructive">-${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">COGS</span>
              <span className="text-sm font-semibold text-destructive">-${cogsTotalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-semibold">Net Profit</span>
              <span className={`text-base font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="by-bank">By Bank</TabsTrigger>
          <TabsTrigger value="by-payment">By Payment Method</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No expenses found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id.toString()}>
                        <TableCell>{new Date(Number(expense.date) / 1000000).toLocaleDateString()}</TableCell>
                        <TableCell>{categories.find(([id]) => id === expense.category)?.[1] || 'Unknown'}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell>
                          {expense.bank ? banks.find(([id]) => id === expense.bank)?.[1] || 'Unknown' : '-'}
                        </TableCell>
                        <NumericCell value={expense.amount} format="currency" />
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRevenue.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No revenue found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRevenue.map((rev) => (
                      <TableRow key={rev.id.toString()}>
                        <TableCell>{new Date(Number(rev.date) / 1000000).toLocaleDateString()}</TableCell>
                        <TableCell>{categories.find(([id]) => id === rev.category)?.[1] || 'Unknown'}</TableCell>
                        <TableCell>{rev.description || '-'}</TableCell>
                        <NumericCell value={rev.amount} format="currency" />
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-bank">
          <div className="space-y-4">
            {Array.from(expensesByBank.entries()).map(([bankId, bankExpenses]) => {
              const bankName = bankId === 'none' ? 'No Bank' : banks.find(([id]) => id.toString() === bankId)?.[1] || 'Unknown';
              const bankTotal = bankExpenses.reduce((sum, e) => sum + e.amount, 0);

              return (
                <Card key={bankId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{bankName}</span>
                      <span className="text-lg">${bankTotal.toFixed(2)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankExpenses.map((expense) => (
                          <TableRow key={expense.id.toString()}>
                            <TableCell>{new Date(Number(expense.date) / 1000000).toLocaleDateString()}</TableCell>
                            <TableCell>{categories.find(([id]) => id === expense.category)?.[1] || 'Unknown'}</TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                            <TableCell>{expense.paymentMethod}</TableCell>
                            <NumericCell value={expense.amount} format="currency" />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-payment">
          <div className="space-y-4">
            {Array.from(expensesByPaymentMethod.entries()).map(([method, methodExpenses]) => {
              const methodTotal = methodExpenses.reduce((sum, e) => sum + e.amount, 0);

              return (
                <Card key={method}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{method}</span>
                      <span className="text-lg">${methodTotal.toFixed(2)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {methodExpenses.map((expense) => (
                          <TableRow key={expense.id.toString()}>
                            <TableCell>{new Date(Number(expense.date) / 1000000).toLocaleDateString()}</TableCell>
                            <TableCell>{categories.find(([id]) => id === expense.category)?.[1] || 'Unknown'}</TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                            <TableCell>
                              {expense.bank ? banks.find(([id]) => id === expense.bank)?.[1] || 'Unknown' : '-'}
                            </TableCell>
                            <NumericCell value={expense.amount} format="currency" />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
