import { useState } from 'react';
import { useCogsPurchases, useCogsItems, useVendors } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type CogsPurchase } from '../../backend';
import { Principal } from '@dfinity/principal';
import NumericCell from '../../components/NumericCell';

export default function CogsPurchasesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CogsPurchase | null>(null);

  const { data: purchases = [], isLoading: purchasesLoading } = useCogsPurchases();
  const { data: items = [], isLoading: itemsLoading } = useCogsItems();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();

  const handleEdit = (purchase: CogsPurchase) => {
    setEditingPurchase(purchase);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPurchase(null);
  };

  const isLoading = purchasesLoading || itemsLoading || vendorsLoading;

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
          <h2 className="text-xl font-semibold">Purchases</h2>
          <p className="text-sm text-muted-foreground">Record inventory purchases</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPurchase(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}</DialogTitle>
            </DialogHeader>
            <PurchaseForm purchase={editingPurchase} items={items} vendors={vendors} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No purchases recorded yet. Click "Add Purchase" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => {
                    const totalCost = purchase.quantity * purchase.unitCost;
                    return (
                      <TableRow key={purchase.id.toString()}>
                        <TableCell>
                          {new Date(Number(purchase.purchaseDate) / 1000000).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {items.find((item) => item.id === purchase.itemId)?.name || 'Unknown'}
                        </TableCell>
                        <NumericCell value={purchase.quantity} format="number" />
                        <NumericCell value={purchase.unitCost} format="currency" />
                        <NumericCell value={totalCost} format="currency" />
                        <TableCell>
                          {purchase.vendor ? vendors.find(([id]) => id === purchase.vendor)?.[1] || 'Unknown' : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(purchase)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <DeletePurchaseButton purchaseId={purchase.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PurchaseFormProps {
  purchase: CogsPurchase | null;
  items: Array<{ id: bigint; name: string }>;
  vendors: Array<[bigint, string]>;
  onClose: () => void;
}

function PurchaseForm({ purchase, items, vendors, onClose }: PurchaseFormProps) {
  const { createPurchase, updatePurchase } = useCogsPurchases();
  const [formData, setFormData] = useState({
    purchaseDate: purchase
      ? new Date(Number(purchase.purchaseDate) / 1000000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    itemId: purchase?.itemId.toString() || '',
    quantity: purchase?.quantity.toString() || '',
    unitCost: purchase?.unitCost.toString() || '',
    vendor: purchase?.vendor?.toString() || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vendorId = formData.vendor ? BigInt(formData.vendor) : null;

    if (purchase) {
      updatePurchase.mutate(
        {
          id: purchase.id,
          itemId: BigInt(formData.itemId),
          purchaseDate: BigInt(new Date(formData.purchaseDate).getTime() * 1000000),
          quantity: parseFloat(formData.quantity),
          unitCost: parseFloat(formData.unitCost),
          vendor: vendorId,
        },
        { onSuccess: onClose }
      );
    } else {
      createPurchase.mutate(
        {
          itemId: BigInt(formData.itemId),
          purchaseDate: BigInt(new Date(formData.purchaseDate).getTime() * 1000000),
          quantity: parseFloat(formData.quantity),
          unitCost: parseFloat(formData.unitCost),
          vendor: vendorId,
        },
        { onSuccess: onClose }
      );
    }
  };

  const handleVendorChange = (value: string) => {
    if (value === '__none__') {
      setFormData({ ...formData, vendor: undefined });
    } else {
      setFormData({ ...formData, vendor: value });
    }
  };

  const isSubmitting = createPurchase.isPending || updatePurchase.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
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

        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor (Optional)</Label>
        <Select value={formData.vendor} onValueChange={handleVendorChange}>
          <SelectTrigger id="vendor">
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              <SelectItem value="__none__">None</SelectItem>
              {vendors.map(([id, name]) => (
                <SelectItem key={id.toString()} value={id.toString()}>
                  {name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {purchase ? 'Updating...' : 'Creating...'}
            </>
          ) : purchase ? (
            'Update Purchase'
          ) : (
            'Create Purchase'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeletePurchaseButton({ purchaseId }: { purchaseId: bigint }) {
  const { deletePurchase } = useCogsPurchases();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase.mutate(purchaseId);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deletePurchase.isPending}>
      {deletePurchase.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
