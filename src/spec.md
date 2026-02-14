# Specification

## Summary
**Goal:** Use Internet Identity principal-based roles as the sole access control mechanism, with automatic default user provisioning and an admin UI/API for role management.

**Planned changes:**
- Frontend: Remove the credential-login gating step so Internet Identity sign-in enters the app directly, and route guards/navigation read roles from the backend for the signed-in principal.
- Backend: Persist user roles keyed by principal; auto-create a user on first login with default role = employee and return that role on subsequent requests.
- Backend: Add admin-only APIs to list known principals with roles and to update a user’s role.
- Frontend: Update Settings to show a backend-backed table of principal IDs and roles, and allow admins to change roles via the new API (removing any mock credential-related content).
- Frontend: Ensure admin-only pages (e.g., Settings, Master Data) are hidden and protected consistently based on the backend-stored role, and refresh role-dependent UI after role updates.
- Backend: Add/adjust upgrade-safe migration logic if needed to preserve existing canister data while introducing principal->role storage.

**User-visible outcome:** Users sign in with Internet Identity and are automatically treated as Employees by default; admins can view principals in Settings and promote/demote roles, and admin-only navigation/pages are accessible only to admins.
