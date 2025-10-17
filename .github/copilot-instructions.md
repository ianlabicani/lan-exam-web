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

## Teacher Feature Architecture

### Backend API Endpoints

- **Exams**: `GET/POST /api/teacher/exams`, `GET/PATCH /api/teacher/exams/{id}`, `PATCH /api/teacher/exams/{id}/status`
- **Exam Items**: `GET/POST /api/teacher/exams/{id}/items`, `PATCH/DELETE /api/teacher/exams/{id}/items/{itemId}`
- **Grading**: `GET /api/teacher/exams/{id}/taken-exams`, `GET /api/teacher/exams/{id}/taken-exams/{takenExamId}`, `POST /api/teacher/exams/{id}/taken-exams/{takenExamId}/grade`
- **Analytics**: `GET /api/teacher/exams/{id}/analytics` (stats, performance metrics)
- **Activity Logs**: `GET /api/teacher/taken-exams/{takenExamId}/activity-logs`

### Key Services

**`ExamService`** (`teacher/services/exam.service.ts`)

- `index()`: List all exams with pagination/filters
- `show(id)`: Get exam details with items
- `store(payload)`: Create new exam
- `update(id, payload)`: Update exam metadata
- `updateStatus(id, status)`: Publish/archive exams
- `destroy(id)`: Delete exam

**`ExamItemService`** (to create)

- `create(examId, itemData)`: Add question (MCQ, essay, matching, etc.)
- `update(examId, itemId, data)`: Update question
- `reorder(examId, items)`: Reorder questions
- `delete(examId, itemId)`: Remove question

**`GradingService`** (to create)

- `getTakenExams(examId)`: Get list of student submissions
- `getTakenExam(examId, takenExamId)`: Get student's answers & feedback
- `gradeSubmission(examId, takenExamId, answers)`: Submit grades for essays/short answers

**`AnalyticsService`** (to create)

- `getExamStats(examId)`: Overall exam statistics (submissions, avg score, completion rate)
- `getStudentPerformance(examId)`: Per-student breakdown with scores and time-on-exam

**`ActivityLogService`** (to create, mirrors student's `ExamActivityLogService`)

- `getActivityLogs(takenExamId)`: View student's activity (tab switches, idle time, focus events)

### Core Models

```typescript
// Exam
interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: "draft" | "published" | "active" | "archived";
  total_points: number;
  items?: ExamItem[];
  created_at: Date;
  updated_at: Date;
}

// ExamItem (question)
interface ExamItem {
  id: number;
  exam_id: number;
  type: "mcq" | "essay" | "true_false" | "short_answer" | "matching" | "fill_blank";
  question: string;
  points: number;
  order: number;
  data: Record<string, any>; // Varies by type (options, correct_answer, etc.)
  created_at: Date;
  updated_at: Date;
}

// TakenExam (student submission)
interface TakenExam {
  id: number;
  exam_id: number;
  student_id: number;
  student: { id: number; name: string; email: string };
  started_at: Date;
  submitted_at?: Date;
  score?: number;
  is_graded: boolean;
  answers: StudentAnswer[];
  created_at: Date;
  updated_at: Date;
}

// StudentAnswer
interface StudentAnswer {
  id: number;
  item_id: number;
  taken_exam_id: number;
  answer: string | Record<string, any>; // Depends on question type
  is_correct?: boolean; // For auto-graded questions
  score?: number; // For manually graded questions
  feedback?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Dashboard Patterns

**Teacher Dashboard** (`teacher/dashboard/`)

- **Stats cards**: Total exams, Active, Published, Drafts, Avg completion rate (via `computed()`)
- **Exam progress grid**: Shows submission count, progress bar, status badge
- **Recent activity feed**: Submissions, publications, grading events (fetched from API or activity table)
- **Quick actions**: Link to create exam, manage exams, grade work, schedule

**Exam List** (`teacher/exams/list-exams/`)

- Table with: Title, Year/Sections, Time window, Status, Actions (View & Manage)
- Fetch from `ExamService.index()` on init
- Calculate duration in minutes: `Math.round((endDate - startDate) / 60000)`

### Exam Creation & Management Flow

1. **Create Exam** (`create-exam/`)

   - Form: Title, Description, Year, Sections (multi-select), Start/End time, Total points
   - Submit to `ExamService.store()`, then navigate to View Exam

2. **View Exam** (`view-exam/`)
   - Main details panel
   - **List Items** (`list-exam-items/`): Grid/table of questions
     - Create/Update/Delete buttons → modals for each question type
     - Item forms: `mcq-form-modal`, `essay-form-modal`, `matching-form-modal`, etc.
   - **Taken Exams** (`taken-exams/list-taken-exams/`): Student submissions list with status
   - **Grading** (`grading/`): Auto-graded results + manual grading for essays

### Grading Flow

**Grading List** (`teacher/exams/view-exam/taken-exams/`)

- Show all student submissions: Student name, Status (pending/graded), Score, Actions
- Filter by: Status, Score range

**Grading Detail** (`grading/show/`)

- Left panel: Student answers (read-only for auto-graded, editable for essays)
- Right panel: Feedback input, score adjustment
- For essays/short answers: Show student answer + input field for feedback + points awarded
- Submit grades → `GradingService.gradeSubmission()`

### Analytics/Reports

**Analytics Page** (`teacher/exams/{id}/analytics/`)

- **Overall stats**: Total attempts, avg score, completion rate, time-on-exam stats
- **Per-question analytics**: % correct per question, difficulty ranking
- **Student performance chart**: Bar/pie showing score distribution
- **Activity monitoring**: Avg idle time, tab switches (if available from logs)

### Question Type Handling

Each question type has:

1. **Form modal** for creation/editing (e.g., `mcq-form-modal/`)
2. **UI component** for display during grading (e.g., `mcq-item/`)
3. **API data structure** in `ExamItem.data`

Examples:

- **MCQ**: `data: { options: ['A', 'B', 'C', 'D'], correct_answer: 'B' }`
- **Essay**: `data: { rubric?: string }` (no right answer; teacher grades)
- **Matching**: `data: { left: [...], right: [...], pairs: [{ left_idx, right_idx }] }`
- **True/False**: `data: { correct_answer: true }`
- **Short Answer**: `data: { correct_answer?: string, case_sensitive?: boolean }`
- **Fill Blank**: `data: { text: 'The capital of France is ___', answers: ['Paris'] }`

---

_For detailed Angular best practices, see `.github/instructions/angular.instructions.md` and https://angular.dev/style-guide_
