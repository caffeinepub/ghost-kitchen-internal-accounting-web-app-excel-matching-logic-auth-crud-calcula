import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type UserProfile = {
    name : Text;
  };

  type ExpenseEntry = {
    id : Nat;
    owner : Principal;
    date : Time.Time;
    amount : Float;
    category : Nat;
    vendor : Nat;
    paymentMethod : Text;
    description : Text;
    bank : ?Nat;
  };

  type RevenueEntry = {
    id : Nat;
    owner : Principal;
    date : Time.Time;
    amount : Float;
    category : Nat;
    description : Text;
  };

  type CogsItem = {
    id : Nat;
    owner : Principal;
    name : Text;
    defaultUnitCost : Float;
    vendor : ?Nat;
  };

  type CogsPurchase = {
    id : Nat;
    owner : Principal;
    itemId : Nat;
    purchaseDate : Time.Time;
    quantity : Float;
    unitCost : Float;
    vendor : ?Nat;
  };

  type CogsSale = {
    id : Nat;
    owner : Principal;
    itemId : Nat;
    saleDate : Time.Time;
    quantity : Float;
  };

  module ExpenseEntry {
    public func compareByDate(e1 : ExpenseEntry, e2 : ExpenseEntry) : Order.Order {
      Int.compare(e1.date, e2.date);
    };
  };

  module CogsPurchase {
    public func compareByDate(p1 : CogsPurchase, p2 : CogsPurchase) : Order.Order {
      Int.compare(p1.purchaseDate, p2.purchaseDate);
    };
  };

  module CogsSale {
    public func compareByDate(s1 : CogsSale, s2 : CogsSale) : Order.Order {
      Int.compare(s1.saleDate, s2.saleDate);
    };
  };

  var nextCategoryId = 1;
  var nextVendorId = 1;
  var nextExpenseId = 1;
  var nextRevenueId = 1;
  var nextBankId = 1;
  var nextCogsItemId = 1;
  var nextCogsPurchaseId = 1;
  var nextCogsSaleId = 1;

  let categories = Map.empty<Nat, Text>();
  let vendors = Map.empty<Nat, Text>();
  let banks = Map.empty<Nat, Text>();
  let expenses = Map.empty<Nat, ExpenseEntry>();
  let revenue = Map.empty<Nat, RevenueEntry>();
  let cogsItems = Map.empty<Nat, CogsItem>();
  let cogsPurchases = Map.empty<Nat, CogsPurchase>();
  let cogsSales = Map.empty<Nat, CogsSale>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let paymentMethods : [Text] = ["Cash", "Credit Card", "Debit Card", "Check"];

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    authorizeUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    authorizeUser(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createCategory(name : Text) : async Nat {
    authorizeUser(caller);
    let id = nextCategoryId;
    categories.add(id, name);
    nextCategoryId += 1;
    id;
  };

  public shared ({ caller }) func updateCategory(id : Nat, newName : Text) : async () {
    authorizeUser(caller);
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    authorizeUser(caller);
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found");
    };
    categories.remove(id);
  };

  public query ({ caller }) func getCategories() : async [(Nat, Text)] {
    authorizeUser(caller);
    categories.toArray();
  };

  public shared ({ caller }) func createVendor(name : Text) : async Nat {
    authorizeUser(caller);
    let id = nextVendorId;
    vendors.add(id, name);
    nextVendorId += 1;
    id;
  };

  public shared ({ caller }) func updateVendor(id : Nat, newName : Text) : async () {
    authorizeUser(caller);
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?_) {
        vendors.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteVendor(id : Nat) : async () {
    authorizeUser(caller);
    if (not vendors.containsKey(id)) {
      Runtime.trap("Vendor not found");
    };
    vendors.remove(id);
  };

  public query ({ caller }) func getVendors() : async [(Nat, Text)] {
    authorizeUser(caller);
    vendors.toArray();
  };

  public shared ({ caller }) func createBank(name : Text) : async Nat {
    authorizeUser(caller);
    let id = nextBankId;
    banks.add(id, name);
    nextBankId += 1;
    id;
  };

  public shared ({ caller }) func updateBank(id : Nat, newName : Text) : async () {
    authorizeUser(caller);
    switch (banks.get(id)) {
      case (null) { Runtime.trap("Bank not found") };
      case (?_) {
        banks.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteBank(id : Nat) : async () {
    authorizeUser(caller);
    if (not banks.containsKey(id)) {
      Runtime.trap("Bank not found");
    };
    banks.remove(id);
  };

  public query ({ caller }) func getBanks() : async [(Nat, Text)] {
    authorizeUser(caller);
    banks.toArray();
  };

  public query ({ caller }) func getPaymentMethods() : async [Text] {
    authorizeUser(caller);
    paymentMethods;
  };

  public shared ({ caller }) func createExpense(expense : ExpenseEntry) : async Nat {
    authorizeUser(caller);
    validatePaymentMethod(expense.paymentMethod, expense.bank);
    let id = nextExpenseId;
    let newExpense = { expense with id; owner = caller };
    expenses.add(id, newExpense);
    nextExpenseId += 1;
    id;
  };

  public shared ({ caller }) func updateExpense(id : Nat, updatedExpense : ExpenseEntry) : async () {
    authorizeUser(caller);
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own expenses");
        };
        validatePaymentMethod(updatedExpense.paymentMethod, updatedExpense.bank);
        let expenseWithId = { updatedExpense with id; owner = existing.owner };
        expenses.add(id, expenseWithId);
      };
    };
  };

  public shared ({ caller }) func deleteExpense(id : Nat) : async () {
    authorizeUser(caller);
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own expenses");
        };
        expenses.remove(id);
      };
    };
  };

  public query ({ caller }) func getExpenses() : async [ExpenseEntry] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      expenses.values().toArray();
    } else {
      expenses.values().toArray().filter(func(e : ExpenseEntry) : Bool { e.owner == caller });
    };
    filtered.sort(ExpenseEntry.compareByDate);
  };

  public shared ({ caller }) func createRevenue(revenueEntry : RevenueEntry) : async Nat {
    authorizeUser(caller);
    let id = nextRevenueId;
    let newRevenue = { revenueEntry with id; owner = caller };
    revenue.add(id, newRevenue);
    nextRevenueId += 1;
    id;
  };

  public shared ({ caller }) func updateRevenue(id : Nat, updatedRevenue : RevenueEntry) : async () {
    authorizeUser(caller);
    switch (revenue.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own revenue entries");
        };
        let revenueWithId = { updatedRevenue with id; owner = existing.owner };
        revenue.add(id, revenueWithId);
      };
    };
  };

  public shared ({ caller }) func deleteRevenue(id : Nat) : async () {
    authorizeUser(caller);
    switch (revenue.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own revenue entries");
        };
        revenue.remove(id);
      };
    };
  };

  public query ({ caller }) func getRevenueEntries() : async [RevenueEntry] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      revenue.values().toArray();
    } else {
      revenue.values().toArray().filter(func(r : RevenueEntry) : Bool { r.owner == caller });
    };
  };

  // COGS Inventory Management

  public shared ({ caller }) func createCogsItem(name : Text, defaultUnitCost : Float, vendor : ?Nat) : async Nat {
    authorizeUser(caller);
    let id = nextCogsItemId;
    let item : CogsItem = {
      id;
      owner = caller;
      name;
      defaultUnitCost;
      vendor;
    };
    cogsItems.add(id, item);
    nextCogsItemId += 1;
    id;
  };

  public shared ({ caller }) func updateCogsItem(id : Nat, name : Text, defaultUnitCost : Float, vendor : ?Nat) : async () {
    authorizeUser(caller);
    switch (cogsItems.get(id)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own COGS items");
        };
        let updatedItem = {
          existing with
          name;
          defaultUnitCost;
          vendor;
        };
        cogsItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteCogsItem(id : Nat) : async () {
    authorizeUser(caller);
    switch (cogsItems.get(id)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own COGS items");
        };
        cogsItems.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsItems() : async [CogsItem] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsItems.values().toArray();
    } else {
      cogsItems.values().toArray().filter(func(item) { item.owner == caller });
    };
    filtered;
  };

  public shared ({ caller }) func createCogsPurchase(itemId : Nat, purchaseDate : Time.Time, quantity : Float, unitCost : Float, vendor : ?Nat) : async Nat {
    authorizeUser(caller);
    switch (cogsItems.get(itemId)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?item) {
        if (item.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only purchase your own COGS items");
        };
        let id = nextCogsPurchaseId;
        let purchase : CogsPurchase = {
          id;
          owner = caller;
          itemId;
          purchaseDate;
          quantity;
          unitCost;
          vendor;
        };
        cogsPurchases.add(id, purchase);
        nextCogsPurchaseId += 1;
        id;
      };
    };
  };

  public shared ({ caller }) func updateCogsPurchase(id : Nat, itemId : Nat, purchaseDate : Time.Time, quantity : Float, unitCost : Float, vendor : ?Nat) : async () {
    authorizeUser(caller);
    switch (cogsPurchases.get(id)) {
      case (null) { Runtime.trap("COGS purchase not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own COGS purchases");
        };
        switch (cogsItems.get(itemId)) {
          case (null) { Runtime.trap("COGS item not found") };
          case (?item) {
            if (item.owner != existing.owner and not AccessControl.isAdmin(accessControlState, existing.owner)) {
              Runtime.trap("Unauthorized: Can only update your own COGS item purchases");
            };
          };
        };
        let updatedPurchase = {
          existing with
          itemId;
          purchaseDate;
          quantity;
          unitCost;
          vendor;
        };
        cogsPurchases.add(id, updatedPurchase);
      };
    };
  };

  public shared ({ caller }) func deleteCogsPurchase(id : Nat) : async () {
    authorizeUser(caller);
    switch (cogsPurchases.get(id)) {
      case (null) { Runtime.trap("COGS purchase not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own COGS purchases");
        };
        cogsPurchases.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsPurchases() : async [CogsPurchase] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsPurchases.values().toArray();
    } else {
      cogsPurchases.values().toArray().filter(func(p) { p.owner == caller });
    };
    filtered.sort(CogsPurchase.compareByDate);
  };

  public shared ({ caller }) func createCogsSale(itemId : Nat, saleDate : Time.Time, quantity : Float) : async Nat {
    authorizeUser(caller);
    switch (cogsItems.get(itemId)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?item) {
        if (item.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only sell your own COGS items");
        };
        let id = nextCogsSaleId;
        let sale : CogsSale = {
          id;
          owner = caller;
          itemId;
          saleDate;
          quantity;
        };
        cogsSales.add(id, sale);
        nextCogsSaleId += 1;
        id;
      };
    };
  };

  public shared ({ caller }) func updateCogsSale(id : Nat, itemId : Nat, saleDate : Time.Time, quantity : Float) : async () {
    authorizeUser(caller);
    switch (cogsSales.get(id)) {
      case (null) { Runtime.trap("COGS sale not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own COGS sales");
        };
        switch (cogsItems.get(itemId)) {
          case (null) { Runtime.trap("COGS item not found") };
          case (?item) {
            if (item.owner != existing.owner and not AccessControl.isAdmin(accessControlState, existing.owner)) {
              Runtime.trap("Unauthorized: Can only update your own COGS item sales");
            };
          };
        };
        let updatedSale = {
          existing with
          itemId;
          saleDate;
          quantity;
        };
        cogsSales.add(id, updatedSale);
      };
    };
  };

  public shared ({ caller }) func deleteCogsSale(id : Nat) : async () {
    authorizeUser(caller);
    switch (cogsSales.get(id)) {
      case (null) { Runtime.trap("COGS sale not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own COGS sales");
        };
        cogsSales.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsSales() : async [CogsSale] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsSales.values().toArray();
    } else {
      cogsSales.values().toArray().filter(func(s) { s.owner == caller });
    };
    filtered.sort(CogsSale.compareByDate);
  };

  public query ({ caller }) func calculateCogsForPeriod(startDate : Time.Time, endDate : Time.Time) : async Float {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    let userPurchases = cogsPurchases.values().toArray().filter(
      func(p) {
        let ownerMatch = if (isAdmin) { true } else { p.owner == caller };
        ownerMatch and p.purchaseDate >= startDate and p.purchaseDate <= endDate
      }
    );
    let userSales = cogsSales.values().toArray().filter(
      func(s) {
        let ownerMatch = if (isAdmin) { true } else { s.owner == caller };
        ownerMatch and s.saleDate >= startDate and s.saleDate <= endDate
      }
    );

    let totalPurchasesCost = userPurchases.foldLeft(
      0.0,
      func(acc, purchase) {
        acc + (purchase.quantity * purchase.unitCost);
      },
    );

    let totalSalesCost = userSales.foldLeft(
      0.0,
      func(acc, sale) {
        switch (cogsItems.get(sale.itemId)) {
          case (null) { acc };
          case (?item) { acc + (sale.quantity * item.defaultUnitCost) };
        };
      },
    );

    totalPurchasesCost - totalSalesCost;
  };

  public query ({ caller }) func getCogsTrends() : async [(Time.Time, Float)] {
    authorizeUser(caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    let allSales = if (isAdmin) {
      cogsSales.values().toArray();
    } else {
      cogsSales.values().toArray().filter(func(s) { s.owner == caller });
    };
    
    let bucketedSales = allSales.foldLeft(
      Map.empty<Time.Time, Float>(),
      func(acc, sale) {
        let bucket = sale.saleDate / (30 * 24 * 60 * 60 * 1000000000);
        let amount = switch (cogsItems.get(sale.itemId)) {
          case (null) { 0.0 };
          case (?item) { sale.quantity * item.defaultUnitCost };
        };
        let current = switch (acc.get(bucket)) {
          case (null) { 0.0 };
          case (?v) { v };
        };
        acc.add(bucket, current + amount);
        acc;
      },
    );
    bucketedSales.toArray();
  };

  func authorizeUser(caller : Principal.Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func validatePaymentMethod(method : Text, bank : ?Nat) {
    switch (paymentMethods.find(func(m) { m == method })) {
      case (null) { Runtime.trap("Invalid payment method. Only: Cash, Credit Card, Debit Card, Check") };
      case (?_) {
        let requiresBank = method == "Credit Card" or method == "Debit Card";
        if (requiresBank and bank == null) {
          Runtime.trap("Bank selection is required for Credit Card or Debit Card payments");
        } else if (not requiresBank and bank != null) {
          Runtime.trap("Bank should only be specified for Credit Card or Debit Card payments");
        };
      };
    };
  };
};
