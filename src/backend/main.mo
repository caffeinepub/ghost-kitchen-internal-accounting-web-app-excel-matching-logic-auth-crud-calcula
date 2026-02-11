import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // State variables for CRUD
  var nextCategoryId = 1;
  var nextVendorId = 1;
  var nextPaymentMethodId = 1;
  var nextExpenseId = 1;
  var nextRevenueId = 1;

  let categories = Map.empty<Nat, Text>();
  let vendors = Map.empty<Nat, Text>();
  let paymentMethods = Map.empty<Nat, Text>();
  let expenses = Map.empty<Nat, ExpenseEntry>();
  let revenue = Map.empty<Nat, RevenueEntry>();

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Data types
  type ExpenseEntry = {
    id : Nat;
    date : Time.Time;
    amount : Float;
    category : Nat;
    vendor : Nat;
    paymentMethod : Nat;
    description : Text;
  };

  type RevenueEntry = {
    id : Nat;
    date : Time.Time;
    amount : Float;
    category : Nat;
    description : Text;
  };

  module ExpenseEntry {
    public func compareByDate(e1 : ExpenseEntry, e2 : ExpenseEntry) : Order.Order {
      Int.compare(e1.date, e2.date);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Categories CRUD
  public shared ({ caller }) func createCategory(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create categories");
    };
    let id = nextCategoryId;
    categories.add(id, name);
    nextCategoryId += 1;
    id;
  };

  public shared ({ caller }) func updateCategory(id : Nat, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found");
    };
    categories.remove(id);
  };

  public query ({ caller }) func getCategories() : async [(Nat, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    categories.toArray();
  };

  // Vendors CRUD
  public shared ({ caller }) func createVendor(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vendors");
    };
    let id = nextVendorId;
    vendors.add(id, name);
    nextVendorId += 1;
    id;
  };

  public shared ({ caller }) func updateVendor(id : Nat, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update vendors");
    };
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?_) {
        vendors.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteVendor(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vendors");
    };
    if (not vendors.containsKey(id)) {
      Runtime.trap("Vendor not found");
    };
    vendors.remove(id);
  };

  public query ({ caller }) func getVendors() : async [(Nat, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vendors");
    };
    vendors.toArray();
  };

  // Payment Methods CRUD
  public shared ({ caller }) func createPaymentMethod(method : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment methods");
    };
    let id = nextPaymentMethodId;
    paymentMethods.add(id, method);
    nextPaymentMethodId += 1;
    id;
  };

  public shared ({ caller }) func updatePaymentMethod(id : Nat, newMethod : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment methods");
    };
    switch (paymentMethods.get(id)) {
      case (null) { Runtime.trap("Payment method not found") };
      case (?_) {
        paymentMethods.add(id, newMethod);
      };
    };
  };

  public shared ({ caller }) func deletePaymentMethod(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete payment methods");
    };
    if (not paymentMethods.containsKey(id)) {
      Runtime.trap("Payment method not found");
    };
    paymentMethods.remove(id);
  };

  public query ({ caller }) func getPaymentMethods() : async [(Nat, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment methods");
    };
    paymentMethods.toArray();
  };

  // Expense Entries CRUD
  public shared ({ caller }) func createExpense(expense : ExpenseEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create expenses");
    };
    let id = nextExpenseId;
    let newExpense = { expense with id };
    expenses.add(id, newExpense);
    nextExpenseId += 1;
    id;
  };

  public shared ({ caller }) func updateExpense(id : Nat, updatedExpense : ExpenseEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?_) {
        let expenseWithId = { updatedExpense with id };
        expenses.add(id, expenseWithId);
      };
    };
  };

  public shared ({ caller }) func deleteExpense(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };
    if (not expenses.containsKey(id)) {
      Runtime.trap("Expense not found");
    };
    expenses.remove(id);
  };

  public query ({ caller }) func getExpenses() : async [ExpenseEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.values().toArray().sort(ExpenseEntry.compareByDate);
  };

  // Revenue Entries CRUD
  public shared ({ caller }) func createRevenue(revenueEntry : RevenueEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create revenue entries");
    };
    let id = nextRevenueId;
    let newRevenue = { revenueEntry with id };
    revenue.add(id, newRevenue);
    nextRevenueId += 1;
    id;
  };

  public shared ({ caller }) func updateRevenue(id : Nat, updatedRevenue : RevenueEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update revenue entries");
    };
    switch (revenue.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?_) {
        let revenueWithId = { updatedRevenue with id };
        revenue.add(id, revenueWithId);
      };
    };
  };

  public shared ({ caller }) func deleteRevenue(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete revenue entries");
    };
    if (not revenue.containsKey(id)) {
      Runtime.trap("Revenue entry not found");
    };
    revenue.remove(id);
  };

  public query ({ caller }) func getRevenueEntries() : async [RevenueEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view revenue entries");
    };
    revenue.values().toArray();
  };
};
