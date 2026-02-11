import { useState } from 'react';
import { useExpenses, useCategories, useVendors, usePaymentMethods } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type ExpenseEntry } from '../backend';
import NumericCell from '../components/NumericCell';

export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();

  const handleEdit = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const isLoading = expensesLoading || categoriesLoading || vendorsLoading || paymentMethodsLoading;

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No expenses recorded yet. Click "Add Expense" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id.toString()}>
                      <TableCell>{new Date(Number(expense.date) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>{categories.find(([id]) => id === expense.category)?.[1] || 'Unknown'}</TableCell>
                      <TableCell>{vendors.find(([id]) => id === expense.vendor)?.[1] || 'Unknown'}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <NumericCell value={expense.amount} format="currency" />
                      <TableCell>
                        {paymentMethods.find(([id]) => id === expense.paymentMethod)?.[1] || 'Unknown'}
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
  paymentMethods: Array<[bigint, string]>;
  onClose: () => void;
}

function ExpenseForm({ expense, categories, vendors, paymentMethods, onClose }: ExpenseFormProps) {
  const { createExpense, updateExpense } = useExpenses();
  const [formData, setFormData] = useState({
    date: expense ? new Date(Number(expense.date) / 1000000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: expense?.category.toString() || '',
    vendor: expense?.vendor.toString() || '',
    description: expense?.description || '',
    amount: expense?.amount.toString() || '',
    paymentMethod: expense?.paymentMethod.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData: ExpenseEntry = {
      id: expense?.id || BigInt(0),
      date: BigInt(new Date(formData.date).getTime() * 1000000),
      category: BigInt(formData.category),
      vendor: BigInt(formData.vendor),
      description: formData.description,
      amount: parseFloat(formData.amount),
      paymentMethod: BigInt(formData.paymentMethod),
    };

    if (expense) {
      updateExpense.mutate({ id: expense.id, expense: expenseData }, { onSuccess: onClose });
    } else {
      createExpense.mutate(expenseData, { onSuccess: onClose });
    }
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
              {categories.map(([id, name]) => (
                <SelectItem key={id.toString()} value={id.toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
            <SelectTrigger id="vendor">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map(([id, name]) => (
                <SelectItem key={id.toString()} value={id.toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
        >
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map(([id, name]) => (
              <SelectItem key={id.toString()} value={id.toString()}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
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
              Saving...
            </>
          ) : expense ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeleteExpenseButton({ expenseId }: { expenseId: bigint }) {
  const { deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setIsDeleting(true);
      deleteExpense.mutate(expenseId, {
        onSettled: () => setIsDeleting(false),
      });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
