import { useState } from 'react';
import { useExpenses, useCategories, useVendors, usePaymentMethods, useBanks } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type ExpenseEntry } from '../backend';
import { Principal } from '@dfinity/principal';
import NumericCell from '../components/NumericCell';

export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: banks = [], isLoading: banksLoading } = useBanks();

  const handleEdit = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const isLoading = expensesLoading || categoriesLoading || vendorsLoading || paymentMethodsLoading || banksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingExpense(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              expense={editingExpense}
              categories={categories}
              vendors={vendors}
              paymentMethods={paymentMethods}
              banks={banks}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No expenses recorded yet. Click "Add Expense" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id.toString()}>
                      <TableCell>{new Date(Number(expense.date) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>{categories.find(([id]) => id === expense.category)?.[1] || 'Unknown'}</TableCell>
                      <TableCell>{vendors.find(([id]) => id === expense.vendor)?.[1] || 'Unknown'}</TableCell>
                      <TableCell>{expense.description || '-'}</TableCell>
                      <NumericCell value={expense.amount} format="currency" />
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell>
                        {expense.bank ? banks.find(([id]) => id === expense.bank)?.[1] || 'Unknown' : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteExpenseButton expenseId={expense.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExpenseFormProps {
  expense: ExpenseEntry | null;
  categories: Array<[bigint, string]>;
  vendors: Array<[bigint, string]>;
  paymentMethods: string[];
  banks: Array<[bigint, string]>;
  onClose: () => void;
}

function ExpenseForm({ expense, categories, vendors, paymentMethods, banks, onClose }: ExpenseFormProps) {
  const { createExpense, updateExpense } = useExpenses();
  const [formData, setFormData] = useState({
    date: expense ? new Date(Number(expense.date) / 1000000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: expense?.category.toString() || '',
    vendor: expense?.vendor.toString() || '',
    description: expense?.description || '',
    amount: expense?.amount.toString() || '',
    paymentMethod: expense?.paymentMethod || '',
    bank: expense?.bank?.toString() || '',
  });

  const [errors, setErrors] = useState({
    paymentMethod: '',
    vendor: '',
    bank: '',
  });

  const requiresBank = formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card';

  const validateForm = () => {
    const newErrors = {
      paymentMethod: '',
      vendor: '',
      bank: '',
    };

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.vendor) {
      newErrors.vendor = 'Vendor is required';
    }

    if (requiresBank && !formData.bank) {
      newErrors.bank = 'Bank is required for Credit Card or Debit Card payments';
    }

    setErrors(newErrors);
    return !newErrors.paymentMethod && !newErrors.vendor && !newErrors.bank;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const expenseData: ExpenseEntry = {
      id: expense?.id || BigInt(0),
      owner: expense?.owner || Principal.anonymous(),
      date: BigInt(new Date(formData.date).getTime() * 1000000),
      category: BigInt(formData.category),
      vendor: BigInt(formData.vendor),
      description: formData.description,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      bank: formData.bank ? BigInt(formData.bank) : undefined,
    };

    if (expense) {
      updateExpense.mutate({ id: expense.id, expense: expenseData }, { onSuccess: onClose });
    } else {
      createExpense.mutate(expenseData, { onSuccess: onClose });
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value, bank: '' });
    setErrors({ ...errors, paymentMethod: '', bank: '' });
  };

  const isSubmitting = createExpense.isPending || updateExpense.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {categories.map(([id, name]) => (
                  <SelectItem key={id.toString()} value={id.toString()}>
                    {name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor" className="flex items-center gap-1">
            Vendor <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={formData.vendor} 
            onValueChange={(value) => {
              setFormData({ ...formData, vendor: value });
              setErrors({ ...errors, vendor: '' });
            }}
          >
            <SelectTrigger id="vendor" className={errors.vendor ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {vendors.map(([id, name]) => (
                  <SelectItem key={id.toString()} value={id.toString()}>
                    {name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          {errors.vendor && <p className="text-sm text-destructive">{errors.vendor}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="flex items-center gap-1">
            Payment Method <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger id="paymentMethod" className={errors.paymentMethod ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentMethod && <p className="text-sm text-destructive">{errors.paymentMethod}</p>}
        </div>

        {requiresBank && (
          <div className="space-y-2">
            <Label htmlFor="bank" className="flex items-center gap-1">
              Bank <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.bank} 
              onValueChange={(value) => {
                setFormData({ ...formData, bank: value });
                setErrors({ ...errors, bank: '' });
              }}
            >
              <SelectTrigger id="bank" className={errors.bank ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {banks.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No banks available. Add banks in Master Data.
                    </div>
                  ) : (
                    banks.map(([id, name]) => (
                      <SelectItem key={id.toString()} value={id.toString()}>
                        {name}
                      </SelectItem>
                    ))
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
            {errors.bank && <p className="text-sm text-destructive">{errors.bank}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter expense description (optional)"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {expense ? 'Updating...' : 'Creating...'}
            </>
          ) : expense ? (
            'Update Expense'
          ) : (
            'Create Expense'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeleteExpenseButton({ expenseId }: { expenseId: bigint }) {
  const { deleteExpense } = useExpenses();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense.mutate(expenseId);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteExpense.isPending}>
      {deleteExpense.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
