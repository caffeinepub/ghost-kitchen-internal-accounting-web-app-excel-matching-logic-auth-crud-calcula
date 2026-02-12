import { useState } from 'react';
import { useRevenue, useCategories } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type RevenueEntry } from '../backend';
import { Principal } from '@dfinity/principal';
import NumericCell from '../components/NumericCell';

export default function RevenuePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueEntry | null>(null);

  const { data: revenueEntries = [], isLoading: revenueLoading } = useRevenue();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const handleEdit = (revenue: RevenueEntry) => {
    setEditingRevenue(revenue);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRevenue(null);
  };

  const isLoading = revenueLoading || categoriesLoading;

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
          <h1 className="text-3xl font-bold">Revenue</h1>
          <p className="text-muted-foreground">Track daily sales and revenue</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRevenue(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRevenue ? 'Edit Revenue' : 'Add New Revenue'}</DialogTitle>
            </DialogHeader>
            <RevenueForm revenue={editingRevenue} categories={categories} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No revenue recorded yet. Click "Add Revenue" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  revenueEntries.map((revenue) => (
                    <TableRow key={revenue.id.toString()}>
                      <TableCell>{new Date(Number(revenue.date) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>{categories.find(([id]) => id === revenue.category)?.[1] || 'Unknown'}</TableCell>
                      <TableCell>{revenue.description}</TableCell>
                      <NumericCell value={revenue.amount} format="currency" />
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(revenue)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteRevenueButton revenueId={revenue.id} />
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

interface RevenueFormProps {
  revenue: RevenueEntry | null;
  categories: Array<[bigint, string]>;
  onClose: () => void;
}

function RevenueForm({ revenue, categories, onClose }: RevenueFormProps) {
  const { createRevenue, updateRevenue } = useRevenue();
  const [formData, setFormData] = useState({
    date: revenue
      ? new Date(Number(revenue.date) / 1000000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    category: revenue?.category.toString() || '',
    description: revenue?.description || '',
    amount: revenue?.amount.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const revenueData: RevenueEntry = {
      id: revenue?.id || BigInt(0),
      owner: revenue?.owner || Principal.anonymous(),
      date: BigInt(new Date(formData.date).getTime() * 1000000),
      category: BigInt(formData.category),
      description: formData.description,
      amount: parseFloat(formData.amount),
    };

    if (revenue) {
      updateRevenue.mutate({ id: revenue.id, revenue: revenueData }, { onSuccess: onClose });
    } else {
      createRevenue.mutate(revenueData, { onSuccess: onClose });
    }
  };

  const isSubmitting = createRevenue.isPending || updateRevenue.isPending;

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
          ) : revenue ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeleteRevenueButton({ revenueId }: { revenueId: bigint }) {
  const { deleteRevenue } = useRevenue();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this revenue entry?')) {
      setIsDeleting(true);
      deleteRevenue.mutate(revenueId, {
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
