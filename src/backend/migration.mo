import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    categories : Map.Map<Nat, Text>;
    vendors : Map.Map<Nat, Text>;
    banks : Map.Map<Nat, Text>;
    expenses : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      date : Int;
      amount : Float;
      category : Nat;
      vendor : Nat;
      paymentMethod : Text;
      description : Text;
      bank : ?Nat;
    }>;
    revenue : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      date : Int;
      amount : Float;
      category : Nat;
      description : Text;
    }>;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    nextCategoryId : Nat;
    nextVendorId : Nat;
    nextExpenseId : Nat;
    nextRevenueId : Nat;
    nextBankId : Nat;
    paymentMethods : [Text];
  };

  type NewActor = {
    categories : Map.Map<Nat, Text>;
    vendors : Map.Map<Nat, Text>;
    banks : Map.Map<Nat, Text>;
    expenses : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      date : Int;
      amount : Float;
      category : Nat;
      vendor : Nat;
      paymentMethod : Text;
      description : Text;
      bank : ?Nat;
    }>;
    revenue : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      date : Int;
      amount : Float;
      category : Nat;
      description : Text;
    }>;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    nextCategoryId : Nat;
    nextVendorId : Nat;
    nextExpenseId : Nat;
    nextRevenueId : Nat;
    nextBankId : Nat;
    paymentMethods : [Text];
    cogsItems : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      name : Text;
      defaultUnitCost : Float;
      vendor : ?Nat;
    }>;
    cogsPurchases : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      itemId : Nat;
      purchaseDate : Int;
      quantity : Float;
      unitCost : Float;
      vendor : ?Nat;
    }>;
    cogsSales : Map.Map<Nat, {
      id : Nat;
      owner : Principal.Principal;
      itemId : Nat;
      saleDate : Int;
      quantity : Float;
    }>;
    nextCogsItemId : Nat;
    nextCogsPurchaseId : Nat;
    nextCogsSaleId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newCogsItems = Map.empty<Nat, { id : Nat; owner : Principal.Principal; name : Text; defaultUnitCost : Float; vendor : ?Nat }>();
    let newCogsPurchases = Map.empty<Nat, { id : Nat; owner : Principal.Principal; itemId : Nat; purchaseDate : Int; quantity : Float; unitCost : Float; vendor : ?Nat }>();
    let newCogsSales = Map.empty<Nat, { id : Nat; owner : Principal.Principal; itemId : Nat; saleDate : Int; quantity : Float }>();

    {
      old with
      cogsItems = newCogsItems;
      cogsPurchases = newCogsPurchases;
      cogsSales = newCogsSales;
      nextCogsItemId = 1;
      nextCogsPurchaseId = 1;
      nextCogsSaleId = 1;
    };
  };
};
