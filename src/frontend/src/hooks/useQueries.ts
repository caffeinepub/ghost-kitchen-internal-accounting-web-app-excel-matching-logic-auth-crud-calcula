import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type ExpenseEntry, type RevenueEntry, type CogsItem, type CogsPurchase, type CogsSale, type YearMonthBucket, type Time } from '../backend';
import { type TimeWindow } from '../components/TimeWindowSelector';
import { PAYMENT_METHODS } from '../lib/constants/paymentMethods';
import { RESTAURANT_CATEGORIES, CATEGORY_SEED_VERSION, CATEGORY_SEED_KEY } from '../lib/seed/restaurantCategories';
import { useEffect, useState } from 'react';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Categories Queries with auto-seeding
export function useCategories() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);

  const query = useQuery<Array<[bigint, string]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !actorFetching,
  });

  // Auto-seed restaurant categories on first load
  useEffect(() => {
    const seedCategories = async () => {
      if (!actor || actorFetching || isSeeding) return;
      
      const seedKey = `${CATEGORY_SEED_KEY}-${CATEGORY_SEED_VERSION}`;
      const alreadySeeded = localStorage.getItem(seedKey);
      
      // Only seed if we have data, it's empty, and we haven't seeded before
      if (query.data && query.data.length === 0 && !alreadySeeded) {
        setIsSeeding(true);
        try {
          // Create all default categories
          for (const categoryName of RESTAURANT_CATEGORIES) {
            await actor.createCategory(categoryName);
          }
          // Mark as seeded
          localStorage.setItem(seedKey, 'true');
          // Refetch categories
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (error) {
          console.error('Failed to seed categories:', error);
        } finally {
          setIsSeeding(false);
        }
      }
    };

    seedCategories();
  }, [actor, actorFetching, query.data, isSeeding, queryClient]);

  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || isSeeding,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Vendors Queries
export function useVendors() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Array<[bigint, string]>>({
    queryKey: ['vendors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVendors();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createVendor = useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVendor(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const updateVendor = useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVendor(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVendor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  return {
    ...query,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}

// Banks Queries
export function useBanks() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Array<[bigint, string]>>({
    queryKey: ['banks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBanks();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createBank = useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBank(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
    },
  });

  const updateBank = useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBank(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
    },
  });

  const deleteBank = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBank(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
    },
  });

  return {
    ...query,
    createBank,
    updateBank,
    deleteBank,
  };
}

// Payment Methods Query - Fixed list, read-only
export function usePaymentMethods() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<string[]>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend returns the fixed list, but we ensure it matches our constants
      const backendMethods = await actor.getPaymentMethods();
      // Use our fixed list as source of truth
      return PAYMENT_METHODS.slice();
    },
    enabled: !!actor && !actorFetching,
  });

  return query;
}

// Expenses Queries
export function useExpenses() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ExpenseEntry[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenses();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: async (expense: ExpenseEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, expense }: { id: bigint; expense: ExpenseEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateExpense(id, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}

// Revenue Queries
export function useRevenue() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<RevenueEntry[]>({
    queryKey: ['revenue'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRevenueEntries();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createRevenue = useMutation({
    mutationFn: async (revenue: RevenueEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRevenue(revenue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateRevenue = useMutation({
    mutationFn: async ({ id, revenue }: { id: bigint; revenue: RevenueEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRevenue(id, revenue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteRevenue = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteRevenue(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createRevenue,
    updateRevenue,
    deleteRevenue,
  };
}

// COGS Items Queries
export function useCogsItems() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CogsItem[]>({
    queryKey: ['cogsItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCogsItems();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createItem = useMutation({
    mutationFn: async ({ name, defaultUnitCost, vendor }: { name: string; defaultUnitCost: number; vendor: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCogsItem(name, defaultUnitCost, vendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsItems'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, name, defaultUnitCost, vendor }: { id: bigint; name: string; defaultUnitCost: number; vendor: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCogsItem(id, name, defaultUnitCost, vendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsItems'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCogsItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsItems'] });
    },
  });

  return {
    ...query,
    createItem,
    updateItem,
    deleteItem,
  };
}

// COGS Purchases Queries
export function useCogsPurchases() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CogsPurchase[]>({
    queryKey: ['cogsPurchases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCogsPurchases();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createPurchase = useMutation({
    mutationFn: async ({ itemId, purchaseDate, quantity, unitCost, vendor }: { itemId: bigint; purchaseDate: bigint; quantity: number; unitCost: number; vendor: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCogsPurchase(itemId, purchaseDate, quantity, unitCost, vendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updatePurchase = useMutation({
    mutationFn: async ({ id, itemId, purchaseDate, quantity, unitCost, vendor }: { id: bigint; itemId: bigint; purchaseDate: bigint; quantity: number; unitCost: number; vendor: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCogsPurchase(id, itemId, purchaseDate, quantity, unitCost, vendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deletePurchase = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCogsPurchase(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
}

// COGS Sales Queries
export function useCogsSales() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CogsSale[]>({
    queryKey: ['cogsSales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCogsSales();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createSale = useMutation({
    mutationFn: async ({ itemId, saleDate, quantity }: { itemId: bigint; saleDate: bigint; quantity: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCogsSale(itemId, saleDate, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsSales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['cogsTrends'] });
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({ id, itemId, saleDate, quantity }: { id: bigint; itemId: bigint; saleDate: bigint; quantity: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCogsSale(id, itemId, saleDate, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsSales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['cogsTrends'] });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCogsSale(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogsSales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['cogsTrends'] });
    },
  });

  return {
    ...query,
    createSale,
    updateSale,
    deleteSale,
  };
}

// COGS Total Query
export function useCogsTotal(startDate: Time, endDate: Time) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['cogsTotal', startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.calculateCogsForPeriod(startDate, endDate);
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}

// COGS Trends Query
export function useCogsTrends() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[YearMonthBucket, number]>>({
    queryKey: ['cogsTrends'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCogsTrends();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}

// Dashboard Data Query
export function useDashboardData(timeWindow: TimeWindow) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dashboard', timeWindow],
    queryFn: async () => {
      if (!actor) return null;

      const now = new Date();
      let startDate: Date;

      switch (timeWindow) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case '12months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const startTimestamp = BigInt(startDate.getTime() * 1000000);
      const endTimestamp = BigInt(now.getTime() * 1000000);

      const [expenses, revenue, cogs] = await Promise.all([
        actor.getExpenses(),
        actor.getRevenueEntries(),
        actor.calculateCogsForPeriod(startTimestamp, endTimestamp),
      ]);

      const filteredExpenses = expenses.filter(
        (e) => e.date >= startTimestamp && e.date <= endTimestamp
      );
      const filteredRevenue = revenue.filter(
        (r) => r.date >= startTimestamp && r.date <= endTimestamp
      );

      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
      const netProfit = totalRevenue - totalExpenses - cogs;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        totalExpenses,
        totalRevenue,
        cogs,
        netProfit,
        profitMargin,
      };
    },
    enabled: !!actor && !actorFetching,
  });
}
