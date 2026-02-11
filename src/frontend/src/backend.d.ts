import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface RevenueEntry {
    id: bigint;
    date: Time;
    description: string;
    category: bigint;
    amount: number;
}
export interface ExpenseEntry {
    id: bigint;
    paymentMethod: bigint;
    date: Time;
    description: string;
    vendor: bigint;
    category: bigint;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string): Promise<bigint>;
    createExpense(expense: ExpenseEntry): Promise<bigint>;
    createPaymentMethod(method: string): Promise<bigint>;
    createRevenue(revenueEntry: RevenueEntry): Promise<bigint>;
    createVendor(name: string): Promise<bigint>;
    deleteCategory(id: bigint): Promise<void>;
    deleteExpense(id: bigint): Promise<void>;
    deletePaymentMethod(id: bigint): Promise<void>;
    deleteRevenue(id: bigint): Promise<void>;
    deleteVendor(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<[bigint, string]>>;
    getExpenses(): Promise<Array<ExpenseEntry>>;
    getPaymentMethods(): Promise<Array<[bigint, string]>>;
    getRevenueEntries(): Promise<Array<RevenueEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendors(): Promise<Array<[bigint, string]>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCategory(id: bigint, newName: string): Promise<void>;
    updateExpense(id: bigint, updatedExpense: ExpenseEntry): Promise<void>;
    updatePaymentMethod(id: bigint, newMethod: string): Promise<void>;
    updateRevenue(id: bigint, updatedRevenue: RevenueEntry): Promise<void>;
    updateVendor(id: bigint, newName: string): Promise<void>;
}
