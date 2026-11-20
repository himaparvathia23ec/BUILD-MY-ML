# BuildMyML Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Owner-Only Project Access**: A project document in `/projects/{projectId}` can only be read, listed, updated, or deleted when `resource.data.ownerId == request.auth.uid`.
2. **Identity Integrity**: On creation of `/users/{userId}` or `/projects/{projectId}`, the `uid` / `ownerId` field must strictly match `request.auth.uid`, and `request.auth.token.email_verified == true`.
3. **Immutable Audit Fields**: `id`, `ownerId`, and `createdAt` can never be changed after creation. `createdAt` and `updatedAt` must strictly equal `request.time`.
4. **PII Isolation**: `/users/{userId}` documents contain user email and profile info. Listing `/users` is strictly denied (`allow list: if false`), and `get` is restricted to `request.auth.uid == userId`.
5. **Terminal State Locking**: Once a project is transitioned to `status: 'archived'`, blueprint/content edits are blocked.
6. **Strict Key & Volumetric Validation**: Shadow fields are rejected via `hasAll` + `hasOnly` on create and `affectedKeys().hasOnly(...)` on update; all strings and arrays enforce explicit `.size()` bounds.

## 2. Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Read `/projects/proj_1` with `auth = null`.
2. **Cross-Tenant Get**: Authenticated user `uid_b` attempts `get` on `/projects/proj_a` owned by `uid_a`.
3. **Blanket Collection List**: User `uid_b` attempts `list` on `/projects` without `where('ownerId', '==', 'uid_b')`.
4. **Users PII Scrape**: Authenticated user `uid_b` attempts `get` on `/users/uid_a` or `list` on `/users`.
5. **Owner Spoofing on Create**: User `uid_b` creates `/projects/proj_x` with `ownerId: "uid_a"`.
6. **Unverified Email Write**: User with `email_verified: false` attempts to create `/projects/proj_x`.
7. **Shadow Field Injection**: User `uid_a` creates `/projects/proj_x` with extra field `isAdmin: true`.
8. **Timestamp Forgery**: User `uid_a` creates `/projects/proj_x` with client-supplied `createdAt` != `request.time`.
9. **ID Poisoning**: User attempts to write `/projects/invalid$id!with*spaces` or a 500-char document ID.
10. **Immutable Field Tamper**: User `uid_a` updates `/projects/proj_a` attempting to change `ownerId` or `createdAt`.
11. **Oversized Prompt Exhaustion**: User `uid_a` submits `prompt` exceeding 8,000 characters.
12. **Terminal State Mutation**: User `uid_a` attempts to edit `blueprint` or `title` after `status == 'archived'`.
