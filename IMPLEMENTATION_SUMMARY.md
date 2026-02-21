# StudyFlow — Tóm tắt triển khai hệ thống đăng nhập/phân quyền

> Cập nhật: 2026-02-21

---

## Tổng quan kiến trúc

| Phần | Công nghệ | Entry point |
|------|-----------|-------------|
| Frontend | Next.js 14 (App Router) | `StudyFlowFrontend/app/layout.tsx` |
| Backend | FastAPI (Python 3.11) | `StudyFlowBackend/main.py` |
| Database | PostgreSQL + SQLAlchemy async + Alembic | `StudyFlowBackend/app/database.py` |

---

## A. Thiết kế Role

### Roles
| Role | Mô tả | Đăng ký qua UI |
|------|-------|----------------|
| `student` | Sinh viên — toàn quyền với dữ liệu cá nhân | ✅ |
| `parent` | Phụ huynh — xem dữ liệu con đã liên kết (read-only) | ✅ |
| `admin` | Quản trị viên — quản lý user, thư viện hệ thống | ❌ Chỉ seed bằng script |

### Backend Role Guard (`app/core/deps.py`)
```python
def require_role(*roles: str) -> Callable:
    # Trả về FastAPI dependency kiểm tra role trong JWT token
```

---

## B. Database Schema

### Bảng `users`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | String (UUID) | PK |
| `username` | String(64), unique | lowercase, no spaces |
| `hashed_password` | String | bcrypt |
| `role` | String(16) | student / parent / admin |
| `last_name`, `first_name` | String(64) | |
| `date_of_birth` | Date | optional |
| `address`, `bio` | String | optional |
| `hobbies` | JSONB | list[str] |
| `link_code` | String(8), unique | 7-char code cho student |
| `is_active` | Boolean | khi admin khoá tài khoản |
| `created_at`, `updated_at` | DateTime(tz) | tự động |

### Bảng `parent_student_links`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | String | PK |
| `parent_id` | String | FK → users.id |
| `student_id` | String | FK → users.id |
| `status` | String(16) | pending / active / rejected |
| `created_at` | DateTime(tz) | |

### Bảng `parent_suggestions`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | String | PK |
| `parent_id`, `student_id` | String | FK → users.id |
| `type` | String(32) | loại gợi ý |
| `payload` | JSONB | chi tiết gợi ý |
| `message` | String(512) | |
| `status` | String(16) | pending / accepted / rejected |

### Tách dữ liệu theo user (`owner_user_id`)
Cột `owner_user_id` được thêm vào tất cả bảng dữ liệu:
- `tasks`
- `free_slots`
- `habits`
- `plan_records`
- `feedback`
- `import_drafts`

Mọi query đều lọc theo `owner_user_id` lấy từ JWT token — **không nhận user_id từ client**.

---

## C. Migration (Alembic)

Chuỗi migration:
1. `adaeee9ae341` — Tạo bảng gốc (tasks, free_slots, habits, plan_records, …)
2. `b1c2d3e4f5a6` — Thêm import_drafts
3. `c1d2e3f4a5b6` — Tạo users, owner_user_id, parent_student_links, parent_suggestions
4. `d2e3f4a5b6c7` — Idempotent fix: đảm bảo link_code + owner_user_id tồn tại

```bash
cd StudyFlowBackend
alembic upgrade head
```

---

## D. API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Requires | Mô tả |
|--------|------|----------|-------|
| POST | `/register` | — | Đăng ký (student/parent only) |
| POST | `/login` | — | Đăng nhập → JWT token |
| GET | `/me` | token | Thông tin user hiện tại |
| PUT | `/me` | token | Cập nhật profile |
| POST | `/rotate-link-code` | student | Tạo mã liên kết mới |

### Parent (`/api/v1/parent`)
| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| POST | `/link` | parent | Gửi yêu cầu liên kết (username + link_code) |
| GET | `/links` | parent | Tất cả liên kết của phụ huynh |
| GET | `/children` | parent | Con đã active |
| GET | `/incoming-links` | student | Yêu cầu đang chờ xác nhận |
| PATCH | `/links/{id}` | student | Chấp nhận/từ chối |
| GET | `/child/{id}/tasks` | parent | Nhiệm vụ của con (only if active link) |
| GET | `/child/{id}/plan` | parent | Kế hoạch của con |
| GET | `/child/{id}/habits` | parent | Thói quen của con |
| POST | `/child/{id}/suggestions` | parent | Gửi gợi ý |
| GET | `/my-suggestions` | student | Gợi ý nhận được |
| PATCH | `/suggestions/{id}` | student | Trả lời gợi ý |

### Admin (`/api/v1/admin`)
| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| GET | `/users` | admin | Danh sách tất cả user |
| GET | `/users/{id}` | admin | Chi tiết user |
| PATCH | `/users/{id}` | admin | Khoá/mở tài khoản |
| POST | `/users/{id}/reset-password` | admin | Đổi mật khẩu |
| GET | `/library/system` | admin | Thư viện hệ thống |
| POST | `/library` | admin | Thêm tài liệu hệ thống |
| DELETE | `/library/{id}` | admin | Xoá tài liệu |

---

## E. Frontend — Thay đổi UI theo Role

### Cấu trúc route guard (`src/components/ClientShell.tsx`)
- Chưa đăng nhập → redirect `/login`
- Role home: student → `/dashboard`, parent → `/parent`, admin → `/admin`
- Admin chỉ vào `/admin/*`
- Parent chỉ vào `/parent/*`
- Student-only routes: `/dashboard`, `/tasks`, `/free-time`, `/plan`, `/today`, `/habits`, `/stats`, `/templates`, `/programs`, `/imports`, `/library`, `/calendar`, `/demo`

### Menu theo role (`src/lib/constants/nav.ts`)

**STUDENT_NAV** — đầy đủ: Hướng dẫn, Tổng quan, Nhiệm vụ, Thời gian rảnh, Kế hoạch (Năm/Tháng/Tuần/Ngày/Lịch lớn), Hôm nay, Thói quen, Thống kê, Kế hoạch mẫu, Chương trình học, Import, Thư viện, Cài đặt (+Hồ sơ học tập), Phản hồi, Demo/Seed

**PARENT_NAV** — Tổng quan, **Liên kết con em**, Gợi ý đã gửi, Cài đặt (+Hồ sơ)

**ADMIN_NAV** — **Admin Dashboard**, Quản lý người dùng, Thư viện hệ thống, Cài đặt (+Hồ sơ)

### Sidebar (`src/components/ClientShell.tsx` + `SidebarNav.tsx`)
- Hiển thị: Họ tên, @username, role badge (Sinh viên / Phụ huynh / Quản trị viên)
- Nút Đăng xuất luôn hiển thị khi đăng nhập

---

## F. Trang quan trọng

### `/register`
- Radio: Sinh viên / Phụ huynh (Admin không hiển thị)
- Ghi chú: "Tài khoản quản trị do hệ thống cấp"
- Fields: họ, tên, username, mật khẩu, xác nhận, ngày sinh, địa chỉ, bio, sở thích
- Sau register: auto-login → redirect theo role

### `/login`
- username + password
- Redirect theo role sau login

### `/settings/profile` (Student)
- **Mã liên kết phụ huynh**: hiển thị code 7 ký tự + nút **Sao chép** + nút **Tạo mã mới**
- Cảnh báo khi rotate: mã cũ hết hiệu lực ngay (confirm dialog)
- **Yêu cầu liên kết đang chờ**: danh sách + nút Chấp nhận/Từ chối ngay trong trang
- Hồ sơ học tập: lớp, mục tiêu, môn yếu/mạnh, tốc độ, năng lượng, preset nghỉ, timezone

### `/parent/children` (Phụ huynh — Liên kết con em)
- **Hộp hướng dẫn 3 bước** ở đầu trang:
  1. Học sinh vào `Cài đặt → Hồ sơ học tập` lấy mã liên kết
  2. Phụ huynh nhập username + mã, gửi yêu cầu
  3. Học sinh chấp nhận → phụ huynh thấy dữ liệu
- Form liên kết + danh sách trạng thái

### `/parent` (Dashboard Phụ huynh)
- Xem danh sách con đã liên kết + truy cập nhanh Nhiệm vụ / Kế hoạch theo con

### `/admin` (Admin Dashboard)
- Stats cards: tổng user, sinh viên, phụ huynh, đang hoạt động
- Quick links: Quản lý người dùng, Thư viện hệ thống
- Bảng 5 người dùng mới nhất với role badges

---

## G. Seeding Admin

Admin **không thể đăng ký qua UI hoặc API** (backend block `role=admin` tại `/register`).

Tạo admin bằng script:
```bash
cd StudyFlowBackend
.\.venv\Scripts\activate.bat
python scripts/seed_admin.py
# Username: admin | Password: Nopass1!
```

---

## H. Chạy ứng dụng

### Backend
```bash
cd StudyFlowBackend
.\.venv\Scripts\activate.bat
alembic upgrade head              # chạy migrations
python scripts/seed_admin.py      # tạo tài khoản admin
uvicorn main:app --reload
# http://localhost:8000/docs
```

### Frontend
```bash
cd StudyFlowFrontend
npm install
# tạo .env.local với: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
# http://localhost:3000
```

---

## I. Tự kiểm tra (Self-Check)

| # | Checklist | Trạng thái | Ghi chú |
|---|-----------|-----------|---------|
| 1 | Admin không thể register bằng UI/API | ✅ PASS | Backend: `if payload.role == "admin": raise 403`. UI: không có option Admin trong radio |
| 2 | Dữ liệu tasks/plans/slots tách theo user | ✅ PASS | Mọi CRUD lọc `owner_user_id` từ JWT. `/reset` cũng xoá theo `owner_user_id` |
| 3 | Parent chỉ xem student đã APPROVED | ✅ PASS | `_require_active_link()` check `status="active"` trước mọi GET child data endpoint |
| 4 | Student thấy "Mã liên kết phụ huynh" + copy + rotate | ✅ PASS | `settings/profile`: code hiển thị + nút Sao chép + Tạo mã mới (confirm → POST `/auth/rotate-link-code` → update localStorage) |
| 5 | Parent page có hướng dẫn liên kết rõ ràng | ✅ PASS | Hộp 3 bước ở đầu `/parent/children` với mô tả chi tiết đường dẫn mảng lớn/mục nhỏ |
| 6 | Route guards hoạt động | ✅ PASS | `ClientShell.tsx`: redirect theo role; Backend: `require_role()` dependency |
| 7 | Demo/Seed chỉ seed cho user hiện tại | ✅ PASS | `seedDemoData()` gọi API với Bearer token → backend gán `owner_user_id` từ JWT |

---

## J. Files chính đã thay đổi / tạo mới

### Backend (`StudyFlowBackend/`)
| File | Loại thay đổi |
|------|---------|
| `app/routers/auth.py` | **Sửa**: Thêm `POST /rotate-link-code`; import `require_role` |
| `app/crud/user.py` | **Sửa**: Thêm `rotate_link_code()` |
| `app/models/user.py` | Đã có: `link_code` field, roles |
| `app/models/parent.py` | Đã có: `ParentStudentLink`, `ParentSuggestion` |
| `app/routers/parent.py` | Đã có: đầy đủ CRUD liên kết + xem dữ liệu con |
| `app/routers/admin.py` | Đã có: user management + library |
| `app/crud/parent.py` | Đã có: `list_suggestions_by_parent`, `update_suggestion_status` |
| `alembic/versions/c1d2e3f4a5b6_rbac_owner_user_id.py` | Đã có: Migration users + parent tables |
| `alembic/versions/d2e3f4a5b6c7_add_link_code_unique.py` | Đã có: Idempotent fix |
| `scripts/seed_admin.py` | Đã có: Script tạo admin |

### Frontend (`StudyFlowFrontend/`)
| File | Loại thay đổi |
|------|---------|
| `src/lib/api/auth.ts` | **Sửa**: Thêm `authRotateLinkCode()`, `authUpdateMe()` |
| `src/lib/constants/nav.ts` | **Sửa**: PARENT_NAV → "Liên kết con em"; ADMIN_NAV → "Admin Dashboard" |
| `src/components/ClientShell.tsx` | **Sửa**: admin home → `/admin` (thay vì `/admin/users`) |
| `app/settings/profile/page.tsx` | **Sửa**: Link code: Copy + Rotate + Incoming link requests panel |
| `app/parent/children/page.tsx` | **Sửa**: Thêm hộp hướng dẫn 3 bước |
| `app/admin/page.tsx` | **Thay thế**: Admin Dashboard với stats (thay thế redirect cũ) |
| `src/lib/auth.ts` | Đã có: `AuthUser`, `UserRole`, helpers |
| `src/lib/api/parent.ts` | Đã có: đầy đủ API parent/student |
| `src/lib/api/admin.ts` | Đã có: Admin API |
| `src/components/SidebarNav.tsx` | Đã có: Nav theo role |
| `app/login/page.tsx` | Đã có: Trang đăng nhập |
| `app/register/page.tsx` | Đã có: Trang đăng ký student/parent |
| `app/parent/page.tsx` | Đã có: Dashboard phụ huynh |


## What Was Implemented

### 1. New "Giới thiệu & Hướng dẫn" Section
**Location:** Added as first item in sidebar navigation

**Pages Created:**
- **Main Guide Page** (`/guide`): Landing page with 4 main sections
- **Bắt đầu nhanh** (`/guide/quick-start`): 3-step quick start guide with action buttons
- **Cách dùng tối ưu** (`/guide/best-practices`): 7 best practices for optimal use
- **Giải thích thuật ngữ** (`/guide/glossary`): 12 key terms with definitions and examples
- **Câu hỏi thường gặp** (`/guide/faq`): 12 common Q&A pairs

**Key Features:**
- Visual icons for each section (🚀, 💡, 📖, ❓)
- Direct action links to relevant pages
- Clear Vietnamese explanations for all technical terms
- No use of "drill-down" - replaced with "xem theo cấp (tổng quan → chi tiết)"

### 2. Dashboard Enhancements
**Location:** `/dashboard`

**New Features:**
- **"Hôm nay nên làm gì?" section**: Smart suggestions based on user state
  - If no tasks: suggests adding first task
  - If no slots: suggests adding free time
  - If no plan: suggests creating plan
  - If plan exists: suggests viewing today's sessions
- **Tooltips for English terms**:
  - "Tasks đang mở" → explains what tasks are
  - "Slot rảnh hợp lệ" → explains cleaned slots
  - "Completion rate" → explains percentage calculation

### 3. Task Form Improvements
**Location:** `/tasks`

**New Features:**
- **"Điền thử bằng ví dụ" button**: Auto-fills entire form with realistic example
  - Subject: "Toán"
  - Title: "Ôn kiểm tra chương 3: Hàm số bậc 2"
  - Complete with milestones and success criteria
- **Improved placeholders**: More specific examples for each field
- **Keyboard shortcuts hint**: Tab to navigate, Enter for new criteria
- **Feasibility warnings**:
  - Warning if estimate > 480 minutes (8 hours)
  - Warning if deadline < 48 hours
- **Better microcopy**: "Ví dụ: Toán, Vật lý, Tiếng Anh" for subject field

### 4. Free Time Improvements
**Location:** `/free-time`

**New Features:**
- **Keyboard navigation hint**: "Dùng phím Tab để di chuyển giữa các trường"
- **Undo functionality**: Button to restore previous slot version
- **Cleaning explanation**: Clear description of what cleaning does
- **Better empty states**: Helpful messages when no data exists

### 5. Plan Creator Enhancements
**Location:** `/plan`

**Changes:**
- **Removed "drill-down" terminology**: Replaced with Vietnamese explanation
- **New description**: "Xem theo cấp: Bấm từ lịch tuần để mở chi tiết ngày..."
- Better explanation of multi-level viewing

### 6. Templates Enhancements
**Location:** `/templates`

**New Features:**
- **Filter system** with 3 dropdowns:
  - Mục tiêu: Tăng điểm, Duy trì, Nâng cao
  - Thời gian: Ít thời gian (<2h/ngày), Nhiều thời gian (>3h/ngày)
  - Khối lớp: Lớp 10, 11, 12
- **Empty state message**: "Không tìm thấy template phù hợp..."
- **Better title**: Changed from "Template lịch học mẫu" to "Kế hoạch mẫu (Templates)"

### 7. Programs Enhancements
**Location:** `/programs`

**New Features:**
- **Search functionality**: Text input to search by name or target
- **Category filter** with 5 options:
  - Tất cả
  - Tăng điểm môn cụ thể
  - Ôn thi theo mốc thời gian
  - Kỹ năng: đọc hiểu, viết, ghi nhớ
  - STEM: luyện bài tập và dự án
- **Empty state message**: "Không tìm thấy chương trình phù hợp..."
- **Better title**: Changed to "Chương trình học (Programs)"

### 8. Demo/Seed Improvements
**Location:** `/demo`

**New Features:**
- **Detailed explanation**: "Tạo dữ liệu mẫu (1 click) để BGK xem ngay..."
- **5-step demo flow checklist**:
  1. Tạo sample data
  2. Vào trang Kế hoạch → Tạo kế hoạch
  3. Xem "Không đủ thời gian" và "Gợi ý điều chỉnh"
  4. Xuất .ics
  5. Thử xem các trang khác
- **Confirmation modal** for delete action with warning
- **Enhanced seed data**: Creates clear "not enough time" scenario
  - 3 tasks totaling 630 minutes
  - 3 slots totaling 300 minutes per week
  - Creates shortage of 330 minutes to trigger suggestions

## Technical Components Created

### Tooltip Component
**File:** `src/components/Tooltip.tsx`
- Reusable tooltip component for term explanations
- Hover-triggered with smooth animations
- Used throughout the app for English terms

### Updated Navigation
**File:** `src/lib/constants/nav.ts`
- Added "Giới thiệu & Hướng dẫn" section at top
- Changed "Habits" to "Thói quen"
- Changed "Templates" to "Kế hoạch mẫu"
- Changed "Programs" to "Chương trình học"

## UX Copy Guidelines Followed

✅ All explanations in Vietnamese
✅ No difficult English terms without tooltips
✅ "drill-down" replaced with "xem theo cấp"
✅ Consistent terminology:
  - "mảng lớn" = main sidebar sections
  - "mảng nhỏ" = sub-items/tabs
  - "mục" = sections within a page

## Empty States Added

All pages now have helpful empty states:
- Dashboard: Guides to next action
- Tasks: "Chưa có nhiệm vụ. Hãy thêm nhiệm vụ đầu tiên..."
- Free Time: "Chưa có slot rảnh. Hãy nhập thời gian rảnh..."
- Templates: "Không tìm thấy template phù hợp..."
- Programs: "Không tìm thấy chương trình phù hợp..."
- Demo: Clear instructions and flow checklist

## Demo Data Features

The seed data is specifically designed to demonstrate:
1. **Not enough time scenario**: Tasks require more time than available
2. **Multiple subjects**: Toán, Văn, KHTN
3. **Varied difficulty**: Levels 3, 4, 5
4. **Milestones**: Each task has 2 milestones
5. **Success criteria**: Each task has clear criteria
6. **Realistic deadlines**: 3, 5, 7 days ahead

## What Still Needs Implementation

Based on the original requirements, these items were not fully implemented due to scope:

1. **Onboarding tour component**: Interactive 3-step tour (would require additional state management)
2. **Actionable suggestions with "Áp dụng" buttons**: Would require more complex logic to apply changes
3. **Feasibility score (0-100)**: Calculation logic defined but not integrated into UI
4. **Inline edit for slots**: Would require additional state management
5. **Template/Program preview modals**: Would need modal component infrastructure
6. **Settings enhancements**: Rest windows, study preferences, Pomodoro presets
7. **Profile dropdowns**: Timezone and break preset dropdowns
8. **Change log system**: Would require additional storage and display logic

## Testing Notes

The application has been verified to:
- ✅ Build successfully (dev server works)
- ✅ All new pages are accessible
- ✅ Navigation works correctly
- ✅ Tooltips function properly
- ✅ Forms work with example data
- ✅ Filters and search work correctly

## Files Modified/Created

**Created (13 files):**
- `DESIGN_SPEC.md`
- `IMPLEMENTATION_SUMMARY.md`
- `app/guide/page.tsx`
- `app/guide/quick-start/page.tsx`
- `app/guide/best-practices/page.tsx`
- `app/guide/glossary/page.tsx`
- `app/guide/faq/page.tsx`
- `src/components/Tooltip.tsx`

**Modified (8 files):**
- `src/lib/constants/nav.ts`
- `app/dashboard/page.tsx`
- `app/tasks/page.tsx`
- `app/free-time/page.tsx`
- `app/plan/page.tsx`
- `app/templates/page.tsx`
- `app/programs/page.tsx`
- `app/demo/page.tsx`
- `src/lib/seed/demoData.ts`

## Impact Summary

This implementation significantly improves the UX for the StudyFlow MVP:

1. **Reduced learning curve**: Comprehensive guide reduces onboarding time
2. **Better discoverability**: Smart suggestions guide users to next actions
3. **Clearer terminology**: Vietnamese explanations make app accessible
4. **Improved input experience**: Examples and hints reduce errors
5. **Better organization**: Categories and filters make content findable
6. **Demo-ready**: Enhanced seed data clearly demonstrates key features

## Next Steps for Production

To complete the implementation:

1. Add onboarding tour with library like `react-joyride`
2. Implement feasibility scoring algorithm
3. Add actionable suggestions with state updates
4. Create modal component for previews
5. Complete Settings enhancements
6. Add Profile dropdowns with proper data
7. Implement change log system
8. Add comprehensive testing suite
9. Run security scan with CodeQL
10. Performance optimization

---

*Last Updated: 2026-02-13*
*Version: MVP 1.0*
