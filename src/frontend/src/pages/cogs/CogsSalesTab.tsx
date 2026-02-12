import { useState } from 'react';
import { useCogsSales, useCogsItems } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type CogsSale } from '../../backend';
import { Principal } from '@dfinity/principal';
import NumericCell from '../../components/NumericCell';

export default function CogsSalesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<CogsSale | null>(null);

  const { data: sales = [], isLoading: salesLoading } = useCogsSales();
  const { data: items = [], isLoading: itemsLoading } = useCogsItems();

  const handleEdit = (sale: CogsSale) => {
    setEditingSale(sale);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSale(null);
  };

  const isLoading = salesLoading || itemsLoading;

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
          <h2 className="text-xl font-semibold">Sales</h2>
          <p className="text-sm text-muted-foreground">Record inventory sales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSale(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSale ? 'Edit Sale' : 'Add New Sale'}</DialogTitle>
            </DialogHeader>
            <SaleForm sale={editingSale} items={items} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity Sold</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No sales recorded yet. Click "Add Sale" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id.toString()}>
                      <TableCell>{new Date(Number(sale.saleDate) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>{items.find((item) => item.id === sale.itemId)?.name || 'Unknown'}</TableCell>
                      <NumericCell value={sale.quantity} format="number" />
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(sale)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteSaleButton saleId={sale.id} />
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

interface SaleFormProps {
  sale: CogsSale | null;
  items: Array<{ id: bigint; name: string }>;
  onClose: () => void;
}

function SaleForm({ sale, items, onClose }: SaleFormProps) {
  const { createSale, updateSale } = useCogsSales();
  const [formData, setFormData] = useState({
    saleDate: sale
      ? new Date(Number(sale.saleDate) / 1000000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    itemId: sale?.itemId.toString() || '',
    quantity: sale?.quantity.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (sale) {
      updateSale.mutate(
        {
          id: sale.id,
          itemId: BigInt(formData.itemId),
          saleDate: BigInt(new Date(formData.saleDate).getTime() * 1000000),
          quantity: parseFloat(formData.quantity),
        },
        { onSuccess: onClose }
      );
    } else {
      createSale.mutate(
        {
          itemId: BigInt(formData.itemId),
          saleDate: BigInt(new Date(formData.saleDate).getTime() * 1000000),
          quantity: parseFloat(formData.quantity),
        },
        { onSuccess: onClose }
      );
    }
  };

  const isSubmitting = createSale.isPending || updateSale.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="saleDate">Sale Date</Label>
        <Input
          id="saleDate"
          type="date"
          value={formData.saleDate}
          onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemId">Item</Label>
        <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
          <SelectTrigger id="itemId">
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {items.map((item) => (
                <SelectItem key={item.id.toString()} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity Sold</Label>
        <Input
          id="quantity"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
              {sale ? 'Updating...' : 'Creating...'}
            </>
          ) : sale ? (
            'Update Sale'
          ) : (
            'Create Sale'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeleteSaleButton({ saleId }: { saleId: bigint }) {
  const { deleteSale } = useCogsSales();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this sale?')) {
      deleteSale.mutate(saleId);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteSale.isPending}>
      {deleteSale.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
