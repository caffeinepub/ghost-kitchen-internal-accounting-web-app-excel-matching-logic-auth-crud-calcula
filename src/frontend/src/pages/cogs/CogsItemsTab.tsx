import { useState } from 'react';
import { useCogsItems, useVendors } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { type CogsItem } from '../../backend';
import { Principal } from '@dfinity/principal';
import NumericCell from '../../components/NumericCell';

export default function CogsItemsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CogsItem | null>(null);

  const { data: items = [], isLoading: itemsLoading } = useCogsItems();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();

  const handleEdit = (item: CogsItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const isLoading = itemsLoading || vendorsLoading;

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
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          <p className="text-sm text-muted-foreground">Manage your inventory items and their default costs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <ItemForm item={editingItem} vendors={vendors} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Default Unit Cost</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No items recorded yet. Click "Add Item" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id.toString()}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <NumericCell value={item.defaultUnitCost} format="currency" />
                      <TableCell>
                        {item.vendor ? vendors.find(([id]) => id === item.vendor)?.[1] || 'Unknown' : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteItemButton itemId={item.id} />
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

interface ItemFormProps {
  item: CogsItem | null;
  vendors: Array<[bigint, string]>;
  onClose: () => void;
}

function ItemForm({ item, vendors, onClose }: ItemFormProps) {
  const { createItem, updateItem } = useCogsItems();
  const [formData, setFormData] = useState({
    name: item?.name || '',
    defaultUnitCost: item?.defaultUnitCost.toString() || '',
    vendor: item?.vendor?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vendorId = formData.vendor ? BigInt(formData.vendor) : null;

    if (item) {
      updateItem.mutate(
        {
          id: item.id,
          name: formData.name,
          defaultUnitCost: parseFloat(formData.defaultUnitCost),
          vendor: vendorId,
        },
        { onSuccess: onClose }
      );
    } else {
      createItem.mutate(
        {
          name: formData.name,
          defaultUnitCost: parseFloat(formData.defaultUnitCost),
          vendor: vendorId,
        },
        { onSuccess: onClose }
      );
    }
  };

  const isSubmitting = createItem.isPending || updateItem.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Tomatoes, Chicken Breast"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultUnitCost">Default Unit Cost</Label>
        <Input
          id="defaultUnitCost"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.defaultUnitCost}
          onChange={(e) => setFormData({ ...formData, defaultUnitCost: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor (Optional)</Label>
        <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
          <SelectTrigger id="vendor">
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              <SelectItem value="">None</SelectItem>
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
              {item ? 'Updating...' : 'Creating...'}
            </>
          ) : item ? (
            'Update Item'
          ) : (
            'Create Item'
          )}
        </Button>
      </div>
    </form>
  );
}

function DeleteItemButton({ itemId }: { itemId: bigint }) {
  const { deleteItem } = useCogsItems();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem.mutate(itemId);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteItem.isPending}>
      {deleteItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
