# Specification

## Summary
**Goal:** Allow users to explicitly select the month and year for Monthly reports on the Reports page before running/printing.

**Planned changes:**
- Update the Reports page “Report Configuration” so that when Report Type = “Monthly”, the UI shows a Month selector and Year selector (English labels).
- Derive the report startDate/endDate from the selected month/year and use that range for existing revenue/expenses/COGS totals filtering.
- Update the “Financial Summary - … to …” header to reflect the selected month’s computed date range.
- Ensure “Print Report” prints using the currently selected month/year for Monthly reports.
- Preserve existing behavior for other report types (Daily date selection; 3/6 Months range relative to a reference date control; Annual year selection with Jan 1–Dec 31 range), keeping inputs understandable and consistent with the selected report type.

**User-visible outcome:** On Monthly reports, users can choose a specific month and year, see the correct date range reflected in the summary header, and print the report for that selected month without picking an arbitrary day; other report types continue to work as before.
