import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CogsItemsTab from './cogs/CogsItemsTab';
import CogsPurchasesTab from './cogs/CogsPurchasesTab';
import CogsSalesTab from './cogs/CogsSalesTab';
import CogsSummaryTab from './cogs/CogsSummaryTab';

export default function CogsPage() {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cost of Goods Sold (COGS)</h1>
        <p className="text-muted-foreground">Track inventory costs and goods sold</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="summary">Summary & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <CogsItemsTab />
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <CogsPurchasesTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <CogsSalesTab />
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <CogsSummaryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
