// This module ensures a smooth upgrade path by keeping the old state type and migration logic available.
module {
  public func run(old : { nextCategoryId : Nat }) : { nextCategoryId : Nat } {
    { nextCategoryId = old.nextCategoryId };
  };
};
