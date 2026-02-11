# Specification

## Summary
**Goal:** Build a secure, desktop-optimized internal accounting web app for a ghost kitchen that replaces Excel data entry/storage while preserving the spreadsheet’s calculation logic and producing dashboard KPIs and print-friendly reports.

**Planned changes:**
- Add secure authentication via Internet Identity and enforce authenticated access across all accounting screens and backend data APIs (centralized authorization to remain future-ready for roles).
- Implement persistent backend data models and CRUD APIs for Expenses, Sales/Revenue, COGS, Categories, Vendors, and Payment Methods, with fields aligned to the existing spreadsheet columns.
- Build desktop-optimized form + table UIs for entering, validating, listing, editing, and deleting Expenses, Sales/Revenue, and COGS using editable dropdown master data.
- Add master-data management screens for Categories, Vendors, and Payment Methods, including safe handling that prevents deleting items that are in use (or an equivalent safe strategy).
- Implement a dedicated, testable calculation layer that produces category totals, monthly totals, annual summaries, profit & loss, margins, and platform fee impacts matching the provided Excel formulas 1:1, plus automated tests against sample expected outputs once available.
- Create a KPI dashboard with selectable time windows (current day/month, last 3/6/12 months) and configurable red/green performance indicators.
- Add a Reports section with spreadsheet-style, audit-friendly, print-ready views (daily, monthly expenses, monthly P&L, 3/6/12-month, annual) with print CSS suitable for browser “Print to PDF”.
- Apply a consistent professional accounting UI theme (neutral gray/slate base, readable numeric tables, consistent green/red semantics, print-friendly layouts).

**User-visible outcome:** Users can log in with Internet Identity, manage accounting entries and dropdown master data via clean desktop forms, view KPI dashboards over common time ranges, and generate/print audit-friendly reports whose totals and summaries match the existing Excel logic once formulas are provided.
