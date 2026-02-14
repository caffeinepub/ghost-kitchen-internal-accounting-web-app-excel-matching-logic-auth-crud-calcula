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
export interface CogsPurchase {
    id: bigint;
    itemId: bigint;
    purchaseDate: Time;
    owner: Principal;
    vendor?: bigint;
    quantity: number;
    unitCost: number;
}
export interface LoginCredentials {
    password: string;
    employeeId: bigint;
}
export interface YearMonthBucket {
    month: bigint;
    year: bigint;
}
export interface CogsItem {
    id: bigint;
    defaultUnitCost: number;
    owner: Principal;
    name: string;
    vendor?: bigint;
}
export interface RevenueEntry {
    id: bigint;
    owner: Principal;
    date: Time;
    description: string;
    category: bigint;
    amount: number;
}
export interface ExpenseEntry {
    id: bigint;
    paymentMethod: string;
    owner: Principal;
    bank?: bigint;
    date: Time;
    description: string;
    vendor: bigint;
    category: bigint;
    amount: number;
}
export interface UserInfo {
    principal: Principal;
    role: UserRole;
}
export interface UserProfile {
    name: string;
}
export interface CogsSale {
    id: bigint;
    itemId: bigint;
    owner: Principal;
    quantity: number;
    saleDate: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateCogsForPeriod(startDate: Time, endDate: Time): Promise<number>;
    changeUserRole(user: Principal, newRole: UserRole): Promise<void>;
    createBank(name: string): Promise<bigint>;
    createCategory(name: string): Promise<bigint>;
    createCogsItem(name: string, defaultUnitCost: number, vendor: bigint | null): Promise<bigint>;
    createCogsPurchase(itemId: bigint, purchaseDate: Time, quantity: number, unitCost: number, vendor: bigint | null): Promise<bigint>;
    createCogsSale(itemId: bigint, saleDate: Time, quantity: number): Promise<bigint>;
    createExpense(expense: ExpenseEntry): Promise<bigint>;
    createRevenue(revenueEntry: RevenueEntry): Promise<bigint>;
    createVendor(name: string): Promise<bigint>;
    deleteBank(id: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteCogsItem(id: bigint): Promise<void>;
    deleteCogsPurchase(id: bigint): Promise<void>;
    deleteCogsSale(id: bigint): Promise<void>;
    deleteExpense(id: bigint): Promise<void>;
    deleteRevenue(id: bigint): Promise<void>;
    deleteVendor(id: bigint): Promise<void>;
    getBanks(): Promise<Array<[bigint, string]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<[bigint, string]>>;
    getCogsItems(): Promise<Array<CogsItem>>;
    getCogsPurchases(): Promise<Array<CogsPurchase>>;
    getCogsSales(): Promise<Array<CogsSale>>;
    getCogsTrends(): Promise<Array<[YearMonthBucket, number]>>;
    getCurrentRole(): Promise<{
        __kind__: "unauthenticated";
        unauthenticated: null;
    } | {
        __kind__: "authenticated";
        authenticated: UserRole;
    }>;
    getExpenses(): Promise<Array<ExpenseEntry>>;
    getPaymentMethods(): Promise<Array<string>>;
    getRevenueEntries(): Promise<Array<RevenueEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendors(): Promise<Array<[bigint, string]>>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(): Promise<Array<UserInfo>>;
    loginWithCredentials(credentials: LoginCredentials): Promise<UserRole>;
    logout(): Promise<void>;
    registerCredentials(employeeId: bigint, password: string, role: UserRole): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBank(id: bigint, newName: string): Promise<void>;
    updateCategory(id: bigint, newName: string): Promise<void>;
    updateCogsItem(id: bigint, name: string, defaultUnitCost: number, vendor: bigint | null): Promise<void>;
    updateCogsPurchase(id: bigint, itemId: bigint, purchaseDate: Time, quantity: number, unitCost: number, vendor: bigint | null): Promise<void>;
    updateCogsSale(id: bigint, itemId: bigint, saleDate: Time, quantity: number): Promise<void>;
    updateExpense(id: bigint, updatedExpense: ExpenseEntry): Promise<void>;
    updateRevenue(id: bigint, updatedRevenue: RevenueEntry): Promise<void>;
    updateVendor(id: bigint, newName: string): Promise<void>;
}
