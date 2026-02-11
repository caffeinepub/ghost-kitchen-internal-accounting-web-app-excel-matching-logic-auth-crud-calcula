import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type ExpenseEntry, type RevenueEntry } from '../backend';
import { type TimeWindow } from '../components/TimeWindowSelector';

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

// Categories Queries
export function useCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Array<[bigint, string]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

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

// Payment Methods Queries
export function usePaymentMethods() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Array<[bigint, string]>>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentMethods();
    },
    enabled: !!actor && !actorFetching,
  });

  const queryClient = useQueryClient();

  const createPaymentMethod = useMutation({
    mutationFn: async (method: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPaymentMethod(method);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, method }: { id: bigint; method: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentMethod(id, method);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  return {
    ...query,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
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

// Dashboard Data Query
export function useDashboardData(timeWindow: TimeWindow) {
  const { data: expenses = [] } = useExpenses();
  const { data: revenue = [] } = useRevenue();

  return useQuery({
    queryKey: ['dashboard', timeWindow],
    queryFn: () => {
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
      }

      const startTimestamp = BigInt(startDate.getTime() * 1000000);

      const filteredExpenses = expenses.filter((e) => e.date >= startTimestamp);
      const filteredRevenue = revenue.filter((r) => r.date >= startTimestamp);

      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const cogs = 0; // Placeholder until COGS is implemented

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        cogs,
      };
    },
    enabled: true,
  });
}
