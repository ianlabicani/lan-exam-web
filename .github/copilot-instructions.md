# Copilot Instructions for lan-exam-web

**Project**: Computer-Based Examination and Monitoring System (CBEMS) - Angular 20+ frontend  
**Architecture**: Standalone components, signals, role-based routing (Teacher/Student/Admin)

## Core Architecture

### Multi-role routing pattern

- **Root routes** (`app.routes.ts`): Login redirects to `/login`, then branches by role
- **Teacher path** (`/teacher`): Protected by `isTeacherGuard`, loads teacher-specific services via `teacherServices` providers
- **Student path** (`/student`): Protected by `isStudentGuard`, loads student-specific services via `studentProviders` array
- **Auth flow**: `AuthService` manages `currentUser` signal; guards check auth status; `authInterceptor` adds JWT token to requests

### Service organization

- **Core services** (`src/app/core/`): Singleton auth, interceptors, guards, shared models
- **Feature services**: Grouped by role (student/teacher) and injected via route-level providers, not global—this prevents students accessing teacher services
- **Example**: `TakenExamService`, `ExamActivityLogService` are student-only; instantiated at student route level

## Key Conventions & Patterns

### Standalone components (Angular 20+)

- All components use `standalone: true` (implicit in the decorator)
- Import dependencies directly in component's `imports` array (e.g., `RouterOutlet`, `Navbar`, `FontAwesomeModule`)
- No `NgModule` files

### Component structure

- Split into `.ts`, `.html`, `.css` files (do NOT inline templates)
- Example: `Login` component at `src/app/auth/login/` has `login.ts`, `login.html`, `login.css`
- Use `ChangeDetectionStrategy.OnPush` in `@Component` decorators
- Inject dependencies with `inject()` function, not constructor parameters

### Signals for state

- Use `signal()` for component state (e.g., `currentUser = signal<IAuthUser | null>`)
- Use `computed()` for derived state
- Update with `.set()` or `.update()`, never `mutate()`
- Example: `authService.currentUser` is a signal; guards and interceptors call it to check auth

### Templates

- Use native control flow: `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`)
- Use `async` pipe for observables
- Use class bindings (`[class.active]="condition"`) instead of `ngClass`
- Use style bindings (`[style.color]="color"`) instead of `ngStyle`

### Forms

- Use **Reactive Forms** (NOT template-driven forms)
- Example: login form likely uses `FormGroup`, `FormControl` from `@angular/forms`

## Critical Integration Points

### Authentication & Authorization

- **Login**: Post to `http://127.0.0.1:8000/api/login` (Laravel backend)
- **Token storage**: JWT token stored in localStorage as `lan-exam-user`
- **Interceptor** (`auth.interceptor.ts`): Auto-attaches token to all HTTP requests
- **Guards**: `authGuard` (core), `isTeacherGuard`, `isStudentGuard` (feature-specific)

### Role-based feature loading

- When routing to `/teacher` or `/student`, route providers inject role-specific services
- This lazy-loads dependencies and ensures role isolation
- New feature services should be added to either `teacherServices` or `studentProviders`

### Testing

- Tests are skipped by default in `angular.json` schematics (`"skipTests": true`)
- When creating services/components, generate with `ng generate component name` then add tests manually if needed

## Styling & UI

- **Framework**: Tailwind CSS v4+ (configured in `tailwindcss`/`postcss`)
- **Icons**: FontAwesome (@fortawesome packages)
- Use Tailwind utilities in templates; avoid custom CSS unless necessary
- Component-level styles in `.css` files alongside templates

## File Naming & Locations

- **Components**: `src/app/{feature}/{component-name}/`
- **Services**: `src/app/{feature}/services/` or `src/app/core/services/`
- **Guards**: `src/app/{feature}/guards/`
- **Models/Interfaces**: `src/app/{feature}/models/` or `src/app/core/models/`
- **Routes**: `{feature}.routes.ts` (e.g., `student.routes.ts`)

## When Adding Features

1. **New role-specific service**: Add to `src/app/{role}/services/`, export in `{role}.providers.ts`
2. **New component in a role**: Create in `src/app/{role}/{feature}/`, import in parent component
3. **New route**: Add to appropriate `.routes.ts` file with guards; lazy-load component with `loadComponent()`
4. **HTTP calls**: Inject `HttpClient` in service, use `authInterceptor` (automatic auth header)
5. **State in components**: Use `signal()` + `inject()`, set `ChangeDetectionStrategy.OnPush`

---

_For detailed Angular best practices, see `.github/instructions/angular.instructions.md` and https://angular.dev/style-guide_
