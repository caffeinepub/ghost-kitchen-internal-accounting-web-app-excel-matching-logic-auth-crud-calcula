# Specification

## Summary
**Goal:** Let users choose specific contiguous 3-month and 6-month report windows on the Reports page using a month/year selector (full-month ranges), and ensure consistent date-range calculations across Monthly, 3 Months, and 6 Months report types.

**Planned changes:**
- Replace the current single “Reference Date” picker for the “3 Months” report type with a month/year-based selector that computes an exact 3-consecutive-month (full calendar month) range.
- Replace the current single “Reference Date” picker for the “6 Months” report type with a month/year-based selector that computes an exact 6-consecutive-month (full calendar month) range.
- Standardize report start/end date calculation so Monthly / 3 Months / 6 Months all use full-month windows (start = first day of first month; end = last day of last month, end-of-day), and ensure switching between report types does not cause runtime errors or invalid dates.
- Ensure report filtering/queries and the Financial Summary header reflect the selected computed start/end dates for multi-month windows.

**User-visible outcome:** On the Reports tab, users can select which contiguous 3-month or 6-month period they want (via month/year selection), and the report data and header dates correctly match the chosen full-month range without errors when switching report types.
