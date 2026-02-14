import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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

  type YearMonthBucket = {
    year : Int;
    month : Nat; // 1-12
  };

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

  // User provisioning tracking
  let provisionedUsers = Map.empty<Principal, Bool>();

  // Credential database: employeeId -> (passwordHash, role)
  type CredentialRecord = {
    passwordHash : Text;
    role : AccessControl.UserRole;
  };

  let credentialDatabase = Map.empty<Nat, CredentialRecord>();

  // Credential Session State
  type CredentialSession = {
    employeeId : Nat;
    role : AccessControl.UserRole;
    isActive : Bool;
  };

  let credentialSessions = Map.empty<Principal, CredentialSession>();

  // Automatic user provisioning with default role (employee = #user)
  func ensureUserProvisioned(caller : Principal) {
    if (caller.isAnonymous()) {
      return; // Anonymous users remain as guests
    };
    
    switch (provisionedUsers.get(caller)) {
      case (?_) {
        // User already provisioned
      };
      case (null) {
        // First time seeing this principal - provision with default employee role (#user)
        AccessControl.assignRole(accessControlState, caller, caller, #user);
        provisionedUsers.add(caller, true);
      };
    };
  };

  // Admin API: List all users with their roles
  public type UserInfo = {
    principal : Principal;
    role : AccessControl.UserRole;
  };

  public query ({ caller }) func listUsers() : async [UserInfo] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    
    provisionedUsers.keys().toArray().map(
      func(p : Principal) : UserInfo {
        {
          principal = p;
          role = AccessControl.getUserRole(accessControlState, p);
        }
      }
    );
  };

  // Admin API: Change a user's role
  public shared ({ caller }) func changeUserRole(user : Principal, newRole : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change user roles");
    };
    
    // Ensure the user exists in our system
    switch (provisionedUsers.get(user)) {
      case (null) {
        Runtime.trap("User not found in system");
      };
      case (?_) {
        AccessControl.assignRole(accessControlState, caller, user, newRole);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    ensureUserProvisioned(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Credential-Based Login Session Functions

  type LoginCredentials = {
    employeeId : Nat;
    password : Text;
  };

  // Simple hash function for demonstration (in production, use proper cryptographic hashing)
  func hashPassword(password : Text) : Text {
    password # "_hashed";
  };

  // Admin function to register credentials (only admins can create user credentials)
  public shared ({ caller }) func registerCredentials(employeeId : Nat, password : Text, role : AccessControl.UserRole) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can register credentials");
    };

    let passwordHash = hashPassword(password);
    let record : CredentialRecord = {
      passwordHash;
      role;
    };
    credentialDatabase.add(employeeId, record);
  };

  public shared ({ caller }) func loginWithCredentials(credentials : LoginCredentials) : async AccessControl.UserRole {
    ensureUserProvisioned(caller);
    switch (credentialDatabase.get(credentials.employeeId)) {
      case (null) {
        Runtime.trap("Invalid credentials: Employee ID not found");
      };
      case (?record) {
        let providedHash = hashPassword(credentials.password);
        if (providedHash != record.passwordHash) {
          Runtime.trap("Invalid credentials: Incorrect password");
        };

        let session : CredentialSession = {
          employeeId = credentials.employeeId;
          role = record.role;
          isActive = true;
        };

        credentialSessions.add(caller, session);
        AccessControl.assignRole(accessControlState, caller, caller, record.role);

        record.role;
      };
    };
  };

  public shared ({ caller }) func logout() : async () {
    credentialSessions.remove(caller);
    AccessControl.assignRole(accessControlState, caller, caller, #guest);
  };

  public query ({ caller }) func getCurrentRole() : async {
    #unauthenticated;
    #authenticated : AccessControl.UserRole;
  } {
    ensureUserProvisioned(caller);
    switch (credentialSessions.get(caller)) {
      case (?session) {
        if (session.isActive) { #authenticated(session.role) } else {
          #unauthenticated;
        };
      };
      case (null) {
        let role = AccessControl.getUserRole(accessControlState, caller);
        switch (role) {
          case (#guest) { #unauthenticated };
          case (_) { #authenticated(role) };
        };
      };
    };
  };

  // Master Data Management - Owner/Admin Only

  public shared ({ caller }) func createCategory(name : Text) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let id = nextCategoryId;
    categories.add(id, name);
    nextCategoryId += 1;
    id;
  };

  public shared ({ caller }) func updateCategory(id : Nat, newName : Text) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found");
    };
    categories.remove(id);
  };

  public query ({ caller }) func getCategories() : async [(Nat, Text)] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access categories");
    };
    categories.toArray();
  };

  public shared ({ caller }) func createVendor(name : Text) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create vendors");
    };
    let id = nextVendorId;
    vendors.add(id, name);
    nextVendorId += 1;
    id;
  };

  public shared ({ caller }) func updateVendor(id : Nat, newName : Text) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update vendors");
    };
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?_) {
        vendors.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteVendor(id : Nat) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete vendors");
    };
    if (not vendors.containsKey(id)) {
      Runtime.trap("Vendor not found");
    };
    vendors.remove(id);
  };

  public query ({ caller }) func getVendors() : async [(Nat, Text)] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access vendors");
    };
    vendors.toArray();
  };

  public shared ({ caller }) func createBank(name : Text) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create banks");
    };
    let id = nextBankId;
    banks.add(id, name);
    nextBankId += 1;
    id;
  };

  public shared ({ caller }) func updateBank(id : Nat, newName : Text) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update banks");
    };
    switch (banks.get(id)) {
      case (null) { Runtime.trap("Bank not found") };
      case (?_) {
        banks.add(id, newName);
      };
    };
  };

  public shared ({ caller }) func deleteBank(id : Nat) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete banks");
    };
    if (not banks.containsKey(id)) {
      Runtime.trap("Bank not found");
    };
    banks.remove(id);
  };

  public query ({ caller }) func getBanks() : async [(Nat, Text)] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access banks");
    };
    banks.toArray();
  };

  public query ({ caller }) func getPaymentMethods() : async [Text] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access payment methods");
    };
    paymentMethods;
  };

  // Expense Management - Managers can create/update, only Owners can delete

  public shared ({ caller }) func createExpense(expense : ExpenseEntry) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create expenses");
    };
    validatePaymentMethod(expense.paymentMethod, expense.bank);
    let id = nextExpenseId;
    let newExpense = { expense with id; owner = caller };
    expenses.add(id, newExpense);
    nextExpenseId += 1;
    id;
  };

  public shared ({ caller }) func updateExpense(id : Nat, updatedExpense : ExpenseEntry) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete expenses");
    };
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?_) {
        expenses.remove(id);
      };
    };
  };

  public query ({ caller }) func getExpenses() : async [ExpenseEntry] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access expenses");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      expenses.values().toArray();
    } else {
      expenses.values().toArray().filter(func(e : ExpenseEntry) : Bool { e.owner == caller });
    };
    filtered.sort(ExpenseEntry.compareByDate);
  };

  // Revenue Management - Managers can create/update, only Owners can delete

  public shared ({ caller }) func createRevenue(revenueEntry : RevenueEntry) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create revenue");
    };
    let id = nextRevenueId;
    let newRevenue = { revenueEntry with id; owner = caller };
    revenue.add(id, newRevenue);
    nextRevenueId += 1;
    id;
  };

  public shared ({ caller }) func updateRevenue(id : Nat, updatedRevenue : RevenueEntry) : async () {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update revenue");
    };
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete revenue");
    };
    switch (revenue.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?_) {
        revenue.remove(id);
      };
    };
  };

  public query ({ caller }) func getRevenueEntries() : async [RevenueEntry] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access revenue");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      revenue.values().toArray();
    } else {
      revenue.values().toArray().filter(func(r : RevenueEntry) : Bool { r.owner == caller });
    };
  };

  // COGS Inventory Management - Owner/Admin Only

  public shared ({ caller }) func createCogsItem(name : Text, defaultUnitCost : Float, vendor : ?Nat) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create COGS items");
    };
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update COGS items");
    };
    switch (cogsItems.get(id)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?existing) {
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete COGS items");
    };
    switch (cogsItems.get(id)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?_) {
        cogsItems.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsItems() : async [CogsItem] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access COGS items");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsItems.values().toArray();
    } else {
      cogsItems.values().toArray().filter(func(item) { item.owner == caller });
    };
    filtered;
  };

  public shared ({ caller }) func createCogsPurchase(itemId : Nat, purchaseDate : Time.Time, quantity : Float, unitCost : Float, vendor : ?Nat) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create COGS purchases");
    };
    switch (cogsItems.get(itemId)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?item) {
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update COGS purchases");
    };
    switch (cogsPurchases.get(id)) {
      case (null) { Runtime.trap("COGS purchase not found") };
      case (?existing) {
        switch (cogsItems.get(itemId)) {
          case (null) { Runtime.trap("COGS item not found") };
          case (?_) {};
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete COGS purchases");
    };
    switch (cogsPurchases.get(id)) {
      case (null) { Runtime.trap("COGS purchase not found") };
      case (?_) {
        cogsPurchases.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsPurchases() : async [CogsPurchase] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access COGS purchases");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsPurchases.values().toArray();
    } else {
      cogsPurchases.values().toArray().filter(func(p) { p.owner == caller });
    };
    filtered.sort(CogsPurchase.compareByDate);
  };

  public shared ({ caller }) func createCogsSale(itemId : Nat, saleDate : Time.Time, quantity : Float) : async Nat {
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create COGS sales");
    };
    switch (cogsItems.get(itemId)) {
      case (null) { Runtime.trap("COGS item not found") };
      case (?item) {
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update COGS sales");
    };
    switch (cogsSales.get(id)) {
      case (null) { Runtime.trap("COGS sale not found") };
      case (?existing) {
        switch (cogsItems.get(itemId)) {
          case (null) { Runtime.trap("COGS item not found") };
          case (?_) {};
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
    ensureUserProvisioned(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete COGS sales");
    };
    switch (cogsSales.get(id)) {
      case (null) { Runtime.trap("COGS sale not found") };
      case (?_) {
        cogsSales.remove(id);
      };
    };
  };

  public query ({ caller }) func getCogsSales() : async [CogsSale] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access COGS sales");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdmin) {
      cogsSales.values().toArray();
    } else {
      cogsSales.values().toArray().filter(func(s) { s.owner == caller });
    };
    filtered.sort(CogsSale.compareByDate);
  };

  public query ({ caller }) func calculateCogsForPeriod(startDate : Time.Time, endDate : Time.Time) : async Float {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate COGS");
    };
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

  func bucketToYearMonth(bucket : Int) : YearMonthBucket {
    let monthsSinceEpoch = bucket.toNat();
    let epochMonth = 1.toInt() + ((monthsSinceEpoch % 12).toInt());
    let epochYear = 1970.toInt() + ((monthsSinceEpoch / 12).toInt());
    { year = epochYear; month = (epochMonth % 12).toNat() };
  };

  func yearMonthToBucket(year : Int, month : Nat) : Int {
    if (month < 1 or month > 12) {
      Runtime.trap("Invalid year/month: " # year.toText() # " " # month.toText());
    };
    let yearsSince1970 = year - 1970.toInt();
    let monthsFrom1970 = yearsSince1970 * 12;
    let monthsInYear = (month - 1) : Int;
    monthsFrom1970 + monthsInYear;
  };

  public query ({ caller }) func getCogsTrends() : async [(YearMonthBucket, Float)] {
    ensureUserProvisioned(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access COGS trends");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let allSales = if (isAdmin) {
      cogsSales.values().toArray();
    } else {
      cogsSales.values().toArray().filter(func(s) { s.owner == caller });
    };

    let bucketedSales = allSales.foldLeft(
      Map.empty<Int, Float>(),
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

    bucketedSales.toArray().map(
      func((bucket, amount)) {
        (bucketToYearMonth(bucket), amount);
      }
    );
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
