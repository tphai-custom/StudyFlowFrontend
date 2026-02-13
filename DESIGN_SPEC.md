# StudyFlow MVP - Comprehensive UX Design Specification

## A) INFORMATION ARCHITECTURE (IA)

### Current vs New Navigation Structure

#### NEW: Mảng Lớn (Main Sections)

1. **Giới thiệu & Hướng dẫn** (NEW - Introduction & Guide)
   - Bắt đầu nhanh (3 bước)
   - Cách dùng tối ưu
   - Giải thích thuật ngữ
   - Câu hỏi thường gặp

2. **Tổng quan** (Dashboard)
   - Overview stats
   - Phiên học sắp tới
   - Hôm nay nên làm gì? (NEW)

3. **Nhiệm vụ** (Tasks)
   - Form tạo nhiệm vụ
   - Danh sách nhiệm vụ

4. **Thời gian rảnh** (Free Time)
   - Form nhập slot
   - Danh sách slot đã nhập
   - Sau khi làm sạch

5. **Kế hoạch** (Plan Creator)
   - Năm
   - Tháng
   - Tuần
   - Ngày
   - Lịch lớn

6. **Hôm nay** (Today)
   - Today's sessions

7. **Habits** (Thói quen)
   - Habit list

8. **Thống kê** (Stats)
   - Statistics overview

9. **Templates** (Kế hoạch mẫu)
   - Template library
   - Filters: mục tiêu, thời gian, khối lớp

10. **Programs** (Chương trình học)
    - Category: Tăng điểm môn cụ thể
    - Category: Ôn thi theo mốc thời gian
    - Category: Kỹ năng
    - Category: STEM

11. **Thư viện** (Library)
    - Study materials

12. **Cài đặt** (Settings)
    - Cài đặt chung
    - Hồ sơ học tập

13. **Phản hồi** (Feedback)
    - User feedback

14. **Demo/Seed** (Demo Data)
    - Create sample data
    - Demo flow guide

---

## B) DETAILED SCREEN CHANGES

### HÌNH 1: Dashboard (Tổng quan)

#### Changes:
1. **Add "Hôm nay nên làm gì?" section**
   - Quick action buttons based on user state:
     - If no tasks: "Thêm nhiệm vụ đầu tiên"
     - If no slots: "Nhập thời gian rảnh"
     - If tasks + slots, no plan: "Tạo kế hoạch"
     - If plan exists: "Xem phiên học hôm nay"

2. **Add tooltips for English terms**
   - "Completion rate": Tooltip: "Tỷ lệ hoàn thành - % phiên học đã hoàn tất so với tổng số"
   - "Tasks": Tooltip: "Nhiệm vụ học tập - công việc cần hoàn thành có deadline"
   - "Slot rảnh hợp lệ": Tooltip: "Các khung giờ trống đã được làm sạch (gộp, cắt) để xếp lịch"

3. **Add onboarding tour trigger**
   - Small "?" icon in header
   - Click to start 3-step tour

#### New Sections:
- **"Hôm nay nên làm gì?"** card with smart suggestions

---

### HÌNH 2: Tasks (Nhiệm vụ học tập)

#### Changes:
1. **Add "Điền thử bằng ví dụ" button**
   - Autofills form with example data:
     - Môn học: "Toán"
     - Tên nhiệm vụ: "Ôn kiểm tra chương 3: Hàm số bậc 2"
     - Deadline: 7 days from now
     - Độ khó: 3
     - Ước lượng: 6-8 giờ
     - Tiêu chí: ["Giải đúng 8/10 bài tập mẫu", "Nhớ công thức đỉnh và delta"]
     - Milestones: ["Ôn lý thuyết - 90p", "Làm bài tập - 120p", "Xem lại lỗi - 60p"]

2. **Improve placeholders and microcopy**
   - Subject: "Ví dụ: Toán, Vật lý, Tiếng Anh"
   - Title: "Ví dụ: Ôn kiểm tra chương 3"
   - Content focus: "Ví dụ: Giải 3 dạng chính, note lỗi hay gặp"
   - Add hint: "💡 Mẹo: Nhấn Enter để thêm tiêu chí nhanh, Tab để chuyển trường"

3. **Add feasibility warnings**
   - If estimate > 480 minutes: "⚠️ Ước lượng khá lớn (>8h). Cân nhắc chia nhỏ thành nhiều task."
   - If deadline < 48 hours: "⚠️ Deadline rất gần! Đảm bảo có đủ slot rảnh."

4. **Add keyboard shortcuts**
   - Display hint: "Phím tắt: Tab = chuyển trường, Enter = thêm tiêu chí mới"

---

### HÌNH 3: Free Time (Thời gian rảnh)

#### Changes:
1. **Add keyboard navigation hint**
   - "💡 Mẹo: Dùng phím Tab để di chuyển giữa các trường nhanh hơn"

2. **Update slot list after cleaning**
   - Show "Slot sau làm sạch" list replaces "Slot đã nhập" when cleaned
   - OR show both lists side by side for comparison

3. **Add undo/restore functionality**
   - Button: "Hoàn tác lần làm sạch gần nhất"
   - Button: "Khôi phục phiên bản trước"
   - Store last 2 versions of slot data

4. **Add inline edit for slots**
   - Each slot has "Chỉnh sửa" button
   - Opens inline editor or modal

5. **Show cleaning report**
   - After cleaning, show summary:
     - "Đã gộp 2 slot trùng giờ"
     - "Đã cắt 1 slot vượt giới hạn 3 giờ"
     - "Đã làm tròn phút lẻ cho 3 slot"

---

### HÌNH 4: Plan (Kế hoạch)

#### Changes:
1. **Make suggestions actionable**
   - Replace generic text with action buttons:
     - "Tăng giới hạn phút/ngày lên 210" → [Áp dụng]
     - "Giảm thời lượng Toán từ 120 → 90 phút" → [Áp dụng]
     - "Dời deadline Vật lý sang 25/02" → [Đề xuất ngày]
     - "Thêm slot rảnh Thứ 5 19:00-20:00" → [Mở form]

2. **Implement drill-down navigation**
   - Lịch lớn (calendar view): Click on day → open day detail
   - Day detail: Click on session → open task/milestone detail
   - Add breadcrumb: "Kế hoạch > Tuần > 13/02 > Toán 19:00"

3. **Add feasibility score**
   - Display: "Điểm khả thi: 75/100"
   - Calculation factors:
     - Total minutes/day vs daily limit
     - Buffer availability
     - Valid slots count
     - Deadline proximity
   - Color: Green (80-100), Yellow (60-79), Red (<60)

4. **Integrate library suggestions**
   - When viewing task session: "📚 Tài liệu liên quan: [Công thức Toán 10]"

5. **Remove "drill-down" term**
   - Replace with: "Xem theo cấp (tổng quan → chi tiết)"
   - Add explanation: "Bấm từ lịch tuần để mở chi tiết ngày, bấm vào phiên học để xem nhiệm vụ"

---

### HÌNH 5: Templates (Kế hoạch mẫu)

#### Changes:
1. **Make templates editable**
   - After import, show preview with edit capability
   - Can change: subject, minutes/day, checklist items

2. **Add more template categories**
   - Ôn kiểm tra nhanh (1-2 tuần)
   - Ôn thi dài hạn (1-3 tháng)
   - Luyện đề (mỗi tuần)
   - Cải thiện môn yếu (liên tục)

3. **Add filters**
   - By goal: "Tăng điểm", "Duy trì", "Nâng cao"
   - By time: "Ít thời gian (<2h/ngày)", "Nhiều thời gian (>3h/ngày)"
   - By grade: "Lớp 10", "Lớp 11", "Lớp 12"

4. **Add preview before import**
   - Modal showing: tasks, duration, daily minutes
   - Button: "Chỉnh sửa trước khi import" / "Import ngay"

---

### HÌNH 6: Programs (Chương trình học)

#### Changes:
1. **Organize by categories**
   - **Tăng điểm môn cụ thể**: Toán, Vật lý, Tiếng Anh
   - **Ôn thi theo mốc**: Kiểm tra 15p, Giữa kỳ, Cuối kỳ
   - **Kỹ năng**: Đọc hiểu, Viết, Ghi nhớ, Tư duy logic
   - **STEM**: Luyện bài tập, Dự án nhỏ, Thí nghiệm

2. **Add search and tags**
   - Search box: "Tìm chương trình..."
   - Tags: #toán, #ngắn-hạn, #kỹ-năng, #khó

3. **Add preview before import**
   - Show program structure: milestones → tasks
   - Allow customization before creating

4. **Auto-generate tasks from program**
   - After import, create tasks + milestones + checklists
   - User confirms before creating

---

### HÌNH 7: Settings (Cài đặt)

#### Changes:
1. **Add rest time window selection**
   - "Khung giờ không xếp lịch"
   - From: 21:30, To: 06:00
   - Preset options: "Nghỉ đêm (21:30-06:00)", "Nghỉ trưa (11:30-13:00)", "Tự chọn"

2. **Add study session preference**
   - "Ưu tiên học buổi nào?"
   - Options: Sáng (06:00-12:00), Chiều (12:00-18:00), Tối (18:00-22:00)
   - Intensity: Thấp / Vừa / Cao

3. **Improve buffer explanation**
   - Add tooltip: "Buffer = thời gian dự phòng giữa các phiên để tránh nhồi lịch, nghỉ ngơi, chuẩn bị"
   - Example: "Với buffer 10%, phiên 60p sẽ mất 66p (60p học + 6p buffer)"

4. **Add Pomodoro preset options**
   - Dropdown with presets:
     - "Pomodoro classic: 25p học / 5p nghỉ"
     - "Deep work: 45p học / 10p nghỉ"
     - "Focus long: 50p học / 10p nghỉ"
     - "Custom: Tự nhập"

---

### HÌNH 8: Profile (Hồ sơ học tập)

#### Changes:
1. **Make timezone a dropdown**
   - Dropdown with common zones:
     - "Asia/Ho_Chi_Minh (GMT+7)"
     - "Asia/Bangkok (GMT+7)"
     - "Asia/Singapore (GMT+8)"

2. **Make break preset a dropdown**
   - Use same presets as Settings

3. **Add quick subject assessment**
   - Section: "Đánh giá nhanh môn học"
   - Checkboxes for weak subjects: □ Toán □ Vật lý □ Hóa học
   - Checkboxes for strong subjects: □ Văn □ Anh □ Sử
   - Purpose: "Giúp hệ thống gợi ý template/program phù hợp"

---

### HÌNH 9: Demo/Seed (Demo dữ liệu)

#### Changes:
1. **Add detailed explanation**
   - Title: "Tạo dữ liệu mẫu để demo"
   - Description: "Chỉ cần 1 click để tạo dữ liệu mẫu (tasks, slots, habits, library) giúp BGK xem ngay luồng lập kế hoạch, không cần nhập tay. Phù hợp cho demo, testing, và làm quen với app."

2. **Add demo flow checklist**
   - "Luồng demo gợi ý:"
   - [ ] Bước 1: Bấm "Tạo sample data"
   - [ ] Bước 2: Vào trang "Kế hoạch" → Bấm "Tạo kế hoạch"
   - [ ] Bước 3: Xem phần "Không đủ thời gian" và "Gợi ý điều chỉnh"
   - [ ] Bước 4: Bấm "Xuất .ics" để tải file lịch

3. **Ensure "not enough time" scenario**
   - Seed data includes:
     - 3 tasks (total 12-15 hours)
     - 3 slots (total 4-5 hours)
     - 2 habits (1 hour)
     - 2 library items
   - Result: At least 1 task unscheduled → triggers suggestions

4. **Add confirmation for delete**
   - Modal: "Xác nhận xóa toàn bộ dữ liệu demo?"
   - Warning: "Hành động này không thể hoàn tác. Tất cả tasks, slots, habits, library, plans sẽ bị xóa."
   - Buttons: "Hủy" / "Xóa tất cả"

---

## C) UX COPY (Vietnamese)

### Dashboard
- **Title**: "Tổng quan"
- **Subtitle**: "Nắm nhanh nhiệm vụ, slot rảnh và phiên học sắp tới"
- **Empty state**: "Chào mừng! Hãy bắt đầu bằng cách thêm nhiệm vụ đầu tiên hoặc nhập thời gian rảnh."

### Giới thiệu & Hướng dẫn (NEW)
- **Title**: "Giới thiệu & Hướng dẫn"
- **Subtitle**: "Tìm hiểu cách dùng StudyFlow hiệu quả"

#### Bắt đầu nhanh
- **Title**: "Bắt đầu nhanh (3 bước)"
- **Content**:
  1. Nhập thời gian rảnh (trang "Thời gian rảnh")
  2. Tạo nhiệm vụ với deadline (trang "Nhiệm vụ")
  3. Bấm "Tạo kế hoạch" (trang "Kế hoạch")

#### Cách dùng tối ưu
- **Title**: "Cách dùng tối ưu"
- **Content**:
  - Nhập thời gian rảnh TRƯỚC → giúp hệ thống biết bạn có bao nhiêu giờ
  - Ước lượng thời gian nhiệm vụ KHẢ THI → tránh quá lạc quan
  - Đặt buffer để tránh nhồi lịch → cần thời gian nghỉ và chuẩn bị
  - Xem kế hoạch theo nhiều cấp: Tuần → Ngày → Phiên học

#### Giải thích thuật ngữ
- **Deep work**: Làm việc tập trung sâu không bị gián đoạn, thường 45-90 phút
- **Buffer**: Thời gian dự phòng giữa các phiên học (ví dụ 10% = 6 phút cho phiên 60p)
- **Habit**: Thói quen lặp lại đều đặn (ví dụ: đọc sách mỗi tối, chạy bộ sáng)
- **Milestone**: Mốc nhỏ trong task lớn (ví dụ: "Ôn lý thuyết" trong task "Ôn kiểm tra")
- **Template**: Kế hoạch mẫu có sẵn để import nhanh
- **Program**: Chương trình học có sẵn với nhiều nhiệm vụ và milestone
- **Xuất .ics**: Tạo file lịch để import vào Google Calendar, Outlook...

#### Câu hỏi thường gặp
- **Q**: "Tại sao task của tôi không được xếp lịch?"
  **A**: Có thể do: (1) Không đủ slot rảnh, (2) Deadline quá gần, (3) Vượt giới hạn phút/ngày. Xem phần "Gợi ý điều chỉnh".

- **Q**: "Làm sạch slot là gì?"
  **A**: Hệ thống tự động gộp slot trùng, cắt slot quá dài, làm tròn phút lẻ để tối ưu xếp lịch.

- **Q**: "Điểm khả thi là gì?"
  **A**: Số từ 0-100 đánh giá độ khả thi của kế hoạch dựa trên thời gian, buffer, slot hợp lệ, deadline.

### Tasks
- **Empty state**: "Chưa có nhiệm vụ. Hãy thêm nhiệm vụ đầu tiên để bắt đầu lập kế hoạch!"
- **Success message**: "✓ Đã lưu nhiệm vụ thành công"
- **Validation errors**:
  - "Tên nhiệm vụ không được để trống"
  - "Deadline phải là thời điểm trong tương lai"
  - "Ước lượng tối thiểu phải nhỏ hơn tối đa"

### Free Time
- **Empty state**: "Chưa có slot rảnh. Hãy nhập thời gian rảnh trong tuần để hệ thống có thể xếp lịch!"
- **Cleaning warnings**:
  - "⚠️ Slot Thứ 2 18:00-21:00 quá dài (3 giờ). Đã cắt thành 2 slot 90 phút."
  - "✓ Đã gộp 2 slot Thứ 4 trùng nhau thành 1 slot"

### Plan
- **Empty state**: "Chưa có kế hoạch. Đảm bảo đã có task và slot rảnh, sau đó bấm 'Tạo kế hoạch'."
- **Not enough time**: "Không đủ thời gian cho các nhiệm vụ sau:"
- **Suggestions title**: "Gợi ý điều chỉnh để xếp lịch đủ"
- **Feasibility score**:
  - "Điểm khả thi: Tốt (80-100)"
  - "Điểm khả thi: Trung bình (60-79)"
  - "Điểm khả thi: Cần cải thiện (<60)"

### Templates
- **Empty state**: "Chưa có template. Duyệt thư viện template để import nhanh!"
- **Import modal**: "Xem trước và chỉnh sửa template trước khi import"

### Programs
- **Empty state**: "Chưa có program. Chọn chương trình phù hợp với mục tiêu học tập!"
- **Categories**:
  - "Tăng điểm môn cụ thể"
  - "Ôn thi theo mốc thời gian"
  - "Kỹ năng: đọc hiểu, viết, ghi nhớ"
  - "STEM: luyện bài tập và dự án"

### Settings
- **Rest window label**: "Khung giờ không xếp lịch (nghỉ ngơi)"
- **Study preference label**: "Ưu tiên học buổi nào trong ngày?"
- **Buffer tooltip**: "Thời gian dự phòng giữa các phiên để nghỉ và chuẩn bị. Ví dụ: 10% buffer cho phiên 60p = 66p (60p học + 6p buffer)"

### Demo/Seed
- **Main description**: "Tạo dữ liệu mẫu (1 click) để BGK xem ngay luồng lập kế hoạch, không cần nhập tay. Bộ sample bao gồm tasks, slots, habits, và library items."
- **Delete confirmation**: "⚠️ Xác nhận xóa toàn bộ dữ liệu demo? Hành động này không thể hoàn tác."

---

## D) ACCEPTANCE CRITERIA & EDGE CASES

### Dashboard (Hình 1)
**Acceptance Criteria:**
1. "Hôm nay nên làm gì?" section shows correct action based on data state
2. Tooltips appear on hover for all English terms
3. Stats display correctly (tasks, slots, completion rate)

**Edge Cases:**
1. No tasks, no slots, no plan → Show "Thêm nhiệm vụ đầu tiên"
2. Has tasks but all past deadline → Show "Cập nhật deadline hoặc thêm task mới"

### Tasks (Hình 2)
**Acceptance Criteria:**
1. "Điền thử bằng ví dụ" button fills all fields with valid example data
2. Feasibility warnings appear when estimate > 480 min or deadline < 48h
3. Keyboard hints display below form
4. Form validation prevents invalid data submission

**Edge Cases:**
1. User clicks "Điền thử" while form has partial data → Show confirm modal "Ghi đè dữ liệu hiện tại?"
2. Estimate max < estimate min → Show error "Ước lượng tối đa phải >= tối thiểu"

### Free Time (Hình 3)
**Acceptance Criteria:**
1. Keyboard hint displays above form
2. Cleaning report shows specific changes made
3. Undo button restores previous slot version
4. Inline edit updates slot correctly

**Edge Cases:**
1. User deletes all slots then undoes → Slots restored correctly
2. Cleaning results in 0 valid slots → Show warning "Không có slot hợp lệ. Hãy thêm slot dài hơn 30 phút."

### Plan (Hình 4)
**Acceptance Criteria:**
1. Suggestions have "Áp dụng" buttons that trigger actual changes
2. Drill-down navigation works: calendar → day → session → task
3. Feasibility score displays with color coding
4. Library suggestions appear for relevant tasks

**Edge Cases:**
1. Apply suggestion "increase daily limit" → Settings updated, plan regenerated
2. No library items for a subject → Don't show suggestion

### Templates (Hình 5)
**Acceptance Criteria:**
1. Templates are editable after import
2. Filters work correctly (goal, time, grade)
3. Preview modal shows accurate template structure
4. Import creates tasks correctly

**Edge Cases:**
1. Import template with 0 free slots → Show warning "Cần thêm slot rảnh để áp dụng template"
2. Template conflicts with existing tasks → Show option to merge or replace

### Programs (Hình 6)
**Acceptance Criteria:**
1. Programs organized by clear categories
2. Search works across all program fields
3. Preview shows program structure accurately
4. Import creates tasks + milestones

**Edge Cases:**
1. Search returns 0 results → Show "Không tìm thấy. Thử từ khóa khác?"
2. Program has 10+ tasks → Show warning "Chương trình khá lớn. Đảm bảo có đủ thời gian."

### Settings (Hình 7)
**Acceptance Criteria:**
1. Rest window selection saves correctly
2. Study preference (morning/afternoon/evening) applies to planning
3. Buffer tooltip explains clearly
4. Pomodoro presets populate focus/rest times

**Edge Cases:**
1. Rest window 22:00-06:00 spans midnight → Handled correctly
2. User sets buffer to 0% → Show warning "Không buffer có thể gây nhồi lịch"

### Profile (Hình 8)
**Acceptance Criteria:**
1. Timezone dropdown populated with common zones
2. Break preset dropdown matches Settings options
3. Subject assessment checkboxes save correctly
4. Profile data affects template/program suggestions

**Edge Cases:**
1. User selects all subjects as weak → Show note "Cân nhắc chọn môn ưu tiên trước"
2. No subjects selected → Templates/programs show all options

### Demo/Seed (Hình 9)
**Acceptance Criteria:**
1. Seed creates exact data set: 3 tasks, 3 slots, 2 habits, 2 library
2. Demo flow checklist displays correctly
3. At least 1 task unscheduled (not enough time scenario)
4. Delete confirmation modal appears
5. Delete button removes all demo data

**Edge Cases:**
1. Seed when data already exists → Show modal "Ghi đè dữ liệu hiện tại?"
2. User cancels delete confirmation → No data deleted
3. Seed fails midway → Rollback all changes

---

## E) IMPLEMENTATION SUGGESTIONS

### Phase 1: Core Infrastructure

#### 1.1 Create Guide Page Components
```typescript
// src/components/GuidePage.tsx
export function GuidePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}

// app/guide/page.tsx - Main guide page
// app/guide/quick-start/page.tsx - 3-step quick start
// app/guide/best-practices/page.tsx - Optimal usage
// app/guide/glossary/page.tsx - Term explanations
// app/guide/faq/page.tsx - FAQ
```

#### 1.2 Tooltip System
```typescript
// src/components/Tooltip.tsx
export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </span>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-zinc-800 p-2 text-xs text-zinc-200 shadow-lg">
          {content}
        </div>
      )}
    </span>
  );
}
```

#### 1.3 Onboarding Tour
```typescript
// src/components/OnboardingTour.tsx
export function OnboardingTour() {
  // Use state to track tour step (0-2)
  // Show overlay highlighting specific UI elements
  // Provide "Next" / "Skip" buttons
}
```

### Phase 2: Feature Implementation

#### 2.1 Dashboard Enhancements
```typescript
// Add to app/dashboard/page.tsx
function NextStepSuggestion({ tasks, slots, plan }) {
  if (tasks.length === 0) {
    return <Link href="/tasks">Thêm nhiệm vụ đầu tiên</Link>;
  }
  if (slots.length === 0) {
    return <Link href="/free-time">Nhập thời gian rảnh</Link>;
  }
  if (!plan) {
    return <Link href="/plan">Tạo kế hoạch</Link>;
  }
  return <Link href="/today">Xem phiên học hôm nay</Link>;
}
```

#### 2.2 Task Form with Example
```typescript
// Add to app/tasks/page.tsx
const exampleTask = {
  subject: "Toán",
  title: "Ôn kiểm tra chương 3: Hàm số bậc 2",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  difficulty: 3,
  durationEstimateMin: 6,
  durationEstimateMax: 8,
  durationUnit: "hours",
  successCriteria: ["Giải đúng 8/10 bài tập mẫu", "Nhớ công thức đỉnh và delta"],
  milestones: [
    { title: "Ôn lý thuyết", minutesEstimate: 90 },
    { title: "Làm bài tập", minutesEstimate: 120 },
    { title: "Xem lại lỗi", minutesEstimate: 60 },
  ],
};

function handleFillExample() {
  setFormValues(exampleTask);
}

// Add button in form
<button type="button" onClick={handleFillExample}>
  Điền thử bằng ví dụ
</button>
```

#### 2.3 Free Time Improvements
```typescript
// Add to app/free-time/page.tsx
const [slotHistory, setSlotHistory] = useState<FreeSlot[][]>([]);

function handleClean() {
  // Save current slots to history
  setSlotHistory([...slotHistory, slots]);
  // Perform cleaning
  const cleaned = cleanSlots(slots);
  setSlots(cleaned.slots);
  // Show report
  setCleaningReport(cleaned.warnings);
}

function handleUndo() {
  if (slotHistory.length > 0) {
    const previous = slotHistory[slotHistory.length - 1];
    setSlots(previous);
    setSlotHistory(slotHistory.slice(0, -1));
  }
}

// Add UI
<button onClick={handleUndo} disabled={slotHistory.length === 0}>
  Hoàn tác lần làm sạch gần nhất
</button>
```

#### 2.4 Plan with Actionable Suggestions
```typescript
// Enhance src/lib/planner/generatePlan.ts
export type ActionableSuggestion = {
  type: string;
  message: string;
  action: {
    type: "increase_limit" | "reduce_task" | "add_slot";
    payload: any;
  };
};

// In app/plan/page.tsx
function applySuggestion(suggestion: ActionableSuggestion) {
  if (suggestion.action.type === "increase_limit") {
    // Update settings
    await updateSettings({ dailyLimitMinutes: suggestion.action.payload.newLimit });
    // Regenerate plan
    await rebuildPlan();
  }
  // ... handle other suggestion types
}

// UI
{suggestions.map((sug, idx) => (
  <div key={idx}>
    <p>{sug.message}</p>
    <button onClick={() => applySuggestion(sug)}>Áp dụng</button>
  </div>
))}
```

#### 2.5 Feasibility Score
```typescript
// src/lib/planner/feasibilityScore.ts
export function calculateFeasibilityScore(
  tasks: Task[],
  slots: FreeSlot[],
  settings: AppSettings
): number {
  let score = 100;
  
  // Factor 1: Total time vs available time
  const totalTaskMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const totalSlotMinutes = slots.reduce((sum, s) => sum + s.capacityMinutes, 0);
  if (totalTaskMinutes > totalSlotMinutes) {
    score -= 30;
  }
  
  // Factor 2: Buffer availability
  if (settings.bufferPercent < 5) {
    score -= 10;
  }
  
  // Factor 3: Valid slots count
  if (slots.length < 3) {
    score -= 20;
  }
  
  // Factor 4: Deadline proximity
  const urgentTasks = tasks.filter(t => {
    const daysUntil = (new Date(t.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    return daysUntil < 3;
  });
  if (urgentTasks.length > 0) {
    score -= urgentTasks.length * 5;
  }
  
  return Math.max(0, Math.min(100, score));
}
```

#### 2.6 Template & Program Filters
```typescript
// src/lib/constants/templates.ts
export const TEMPLATES: TemplatePlan[] = [
  {
    id: "tmpl-1",
    name: "Ôn kiểm tra nhanh",
    durationDays: 7,
    recommendedMinutesPerDay: 90,
    forWho: "Học sinh chuẩn bị kiểm tra trong 1 tuần",
    recommendedFor: ["ít-thời-gian", "lớp-10", "tăng-điểm"],
    tasks: [ /* ... */ ],
  },
  // ... more templates
];

// app/templates/page.tsx
const [filters, setFilters] = useState({
  goal: "",
  time: "",
  grade: "",
});

const filteredTemplates = TEMPLATES.filter(t => {
  if (filters.goal && !t.recommendedFor.includes(filters.goal)) return false;
  if (filters.time && !t.recommendedFor.includes(filters.time)) return false;
  if (filters.grade && !t.recommendedFor.includes(filters.grade)) return false;
  return true;
});

// UI with dropdowns
<select onChange={(e) => setFilters({ ...filters, goal: e.target.value })}>
  <option value="">Tất cả mục tiêu</option>
  <option value="tăng-điểm">Tăng điểm</option>
  <option value="duy-trì">Duy trì</option>
</select>
```

#### 2.7 Settings Enhancements
```typescript
// Enhance src/lib/types.ts AppSettings
export type AppSettings = {
  // ... existing fields
  restWindows: Array<{ start: string; end: string }>; // NEW
  studyPreference: {  // NEW
    morning: "low" | "medium" | "high";
    afternoon: "low" | "medium" | "high";
    evening: "low" | "medium" | "high";
  };
};

// app/settings/page.tsx
<div>
  <label>Khung giờ không xếp lịch</label>
  <select>
    <option value="night">Nghỉ đêm (21:30-06:00)</option>
    <option value="lunch">Nghỉ trưa (11:30-13:00)</option>
    <option value="custom">Tự chọn</option>
  </select>
</div>
```

#### 2.8 Demo/Seed Improvements
```typescript
// Enhance src/lib/seed/demoData.ts
export async function seedDemoData() {
  // Create tasks that EXCEED available time
  const tasks = [
    { subject: "Toán", estimatedMinutes: 300, /* ... */ },
    { subject: "Vật lý", estimatedMinutes: 240, /* ... */ },
    { subject: "Hóa", estimatedMinutes: 180, /* ... */ },
  ]; // Total: 720 minutes
  
  // Create limited slots
  const slots = [
    { weekday: 1, startTime: "19:00", endTime: "20:30", capacityMinutes: 90 },
    { weekday: 3, startTime: "19:00", endTime: "20:30", capacityMinutes: 90 },
    { weekday: 5, startTime: "19:00", endTime: "21:00", capacityMinutes: 120 },
  ]; // Total: 300 minutes per week
  
  // This ensures "not enough time" scenario
  
  await Promise.all([
    ...tasks.map(t => saveTask(t)),
    ...slots.map(s => saveSlot(s)),
    // ... habits, library
  ]);
}

// app/demo/page.tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

<button onClick={() => setShowDeleteConfirm(true)}>
  Xoá toàn bộ data demo
</button>

{showDeleteConfirm && (
  <Modal>
    <p>⚠️ Xác nhận xóa toàn bộ dữ liệu demo?</p>
    <p>Hành động này không thể hoàn tác.</p>
    <button onClick={() => { handleReset(); setShowDeleteConfirm(false); }}>
      Xóa tất cả
    </button>
    <button onClick={() => setShowDeleteConfirm(false)}>Hủy</button>
  </Modal>
)}
```

### Phase 3: Polish & Testing

#### 3.1 Empty States
Add to all pages:
```typescript
{items.length === 0 && (
  <div className="card text-center">
    <p className="text-zinc-400">Empty state message</p>
    <Link href="/relevant-page" className="btn-primary">Action button</Link>
  </div>
)}
```

#### 3.2 Change Log
```typescript
// src/lib/storage/changeLog.ts
export type ChangeLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  details: string;
};

export async function logChange(action: string, details: string) {
  const entry: ChangeLogEntry = {
    id: crypto.randomUUID(),
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  // Save to IndexedDB
}
```

#### 3.3 Glossary Component
```typescript
// src/components/GlossaryTerm.tsx
export function GlossaryTerm({ term, children }: { term: string; children: React.ReactNode }) {
  const definition = GLOSSARY[term];
  return (
    <Tooltip content={definition}>
      <span className="underline decoration-dotted">{children}</span>
    </Tooltip>
  );
}

// Usage
<p>
  <GlossaryTerm term="deep-work">Deep work</GlossaryTerm> giúp tập trung tốt hơn.
</p>
```

---

## SUMMARY

This specification covers all 9 mandatory requirements plus additional practical enhancements:

✅ Giới thiệu & Hướng dẫn section with 4 sub-pages
✅ Task form with examples and feasibility warnings  
✅ Free time with undo/restore and cleaning report
✅ Plan with actionable suggestions and drill-down
✅ Templates with filters and edit capability
✅ Programs with categories and search
✅ Settings with rest windows and preferences
✅ Profile with dropdowns and quick assessment
✅ Demo with detailed explanation and confirmation

**Implementation Priority:**
1. Core infrastructure (tooltips, guide pages, navigation)
2. High-impact features (actionable suggestions, example autofill, feasibility score)
3. UX polish (empty states, change log, keyboard hints)
4. Testing and refinement

**Estimated Effort:** 2-3 days for MVP implementation, 1-2 days for polish and testing.
