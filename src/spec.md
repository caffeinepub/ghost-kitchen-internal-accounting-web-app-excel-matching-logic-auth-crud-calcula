# Specification

## Summary
**Goal:** Implement a functional Cost of Goods Sold (COGS) module with item tracking, purchase/sale recording, vendor linkage, and reporting (total COGS and monthly trends), integrated into dashboard and reports.

**Planned changes:**
- Add backend models and CRUD endpoints for COGS items (name, default unit cost, optional vendor linkage) with per-user ownership, vendor ID validation, and basic field validation.
- Add backend models and CRUD endpoints for COGS purchases (date, item, quantity purchased, unit cost, optional vendor) with per-user ownership and validation.
- Add backend models and CRUD endpoints for COGS sales (date, item, quantity sold) with per-user ownership and validation.
- Add backend endpoints to compute total COGS for a date range and a monthly COGS time series trend over a requested range, with deterministic behavior and safe handling for missing purchase history.
- Replace the static /cogs “Coming Soon” page with UI to manage COGS items, purchases, and sales, plus a summary view showing total COGS for a selected time window and a simple trend visualization.
- Extend the frontend React Query layer with hooks for COGS items/purchases/sales CRUD and COGS total/trend queries, including appropriate cache invalidation after mutations.
- Update dashboard and reports to display computed COGS and incorporate it into net profit calculations (revenue - expenses - COGS), including existing print views.

**User-visible outcome:** Users can manage COGS items (optionally linked to vendors), record purchases and sales, and view computed total COGS and monthly trend data; dashboard KPIs and reports show COGS and updated net profit calculations.
