# StudyFlow Frontend

StudyFlow là ứng dụng web giúp học sinh không quên deadline và không học dồn bằng cách tự động tạo lịch học tối ưu.

## 🎯 Mục tiêu

StudyFlow giải quyết 3 vấn đề lớn của học sinh:

1. **Quên deadline / trễ hạn** - Thay vì ghi "to-do" chung chung, StudyFlow tạo lịch học cụ thể với từng phiên học được phân bổ hợp lý.

2. **Học dồn sát ngày** - Hệ thống tự động phân bổ thời gian học dựa trên:
   - Deadline của nhiệm vụ
   - Độ khó của bài
   - Thời gian rảnh thực tế
   - Ngăn chặn việc để tất cả vào phút cuối

3. **Kế hoạch không thực tế** - Hệ thống kiểm tra và cảnh báo khi:
   - Lịch học quá dày
   - Thời gian ước tính không hợp lý
   - Giờ rảnh không đủ để hoàn thành nhiệm vụ

## ✨ Tính năng chính

### 1. Quản lý nhiệm vụ thông minh
- Thêm nhiệm vụ với thông tin chi tiết:
  - Tên và mô tả
  - Deadline cụ thể
  - Độ khó (Dễ / Trung bình / Khó / Rất khó)
  - Thời gian ước tính (giờ và phút)
- Theo dõi tiến độ hoàn thành
- Đánh giá mức độ khẩn cấp tự động

### 2. Thuật toán lập lịch tối ưu
- Ưu tiên nhiệm vụ theo deadline và độ khó
- Tự động phân bổ phiên học phù hợp với:
  - Thời gian rảnh đã cài đặt
  - Giới hạn giờ học mỗi ngày
  - Khoảng cách hợp lý giữa các phiên (tránh học dồn)
- Điều chỉnh thời gian dựa trên độ khó của bài

### 3. Cài đặt thời gian rảnh
- Thiết lập khung giờ rảnh cho từng ngày trong tuần
- Cài đặt giới hạn số giờ học tối đa mỗi ngày
- Đảm bảo lịch học thực tế và khả thi

### 4. Kiểm tra tính khả thi
- Cảnh báo khi lịch học không thực tế
- Phát hiện việc lên lịch quá nhiều trong một ngày
- Cảnh báo khi không đủ thời gian để hoàn thành trước deadline

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

### Build production
```bash
npm run build
npm start
```

## 📖 Hướng dẫn sử dụng

### Bước 1: Cài đặt thời gian rảnh
1. Click vào nút "⚙️ Cài đặt thời gian rảnh"
2. Thiết lập số giờ học tối đa mỗi ngày (khuyến nghị: 3-4 giờ)
3. Thêm khung giờ rảnh cho từng ngày trong tuần
   - Ví dụ: Thứ 2 từ 18:00 - 21:00
4. Click "Lưu cài đặt"

### Bước 2: Thêm nhiệm vụ
1. Click vào nút "➕ Thêm nhiệm vụ"
2. Điền thông tin:
   - **Tên nhiệm vụ**: Rõ ràng, cụ thể (VD: "Ôn tập Chương 3 Toán học")
   - **Mô tả**: Chi tiết về nội dung cần học
   - **Deadline**: Ngày nộp bài / thi
   - **Độ khó**: Đánh giá độ phức tạp của bài
   - **Thời gian ước tính**: Thời gian cần để hoàn thành (hãy ước tính thực tế!)
3. Click "Thêm nhiệm vụ"

### Bước 3: Xem và theo dõi lịch học
- **Panel bên trái**: Danh sách tất cả nhiệm vụ
  - Màu sắc thể hiện mức độ khẩn cấp
  - Thanh tiến độ cho mỗi nhiệm vụ
  - Có thể đánh dấu hoàn thành hoặc xóa
  
- **Panel bên phải**: Lịch học được tạo tự động
  - Hiển thị theo từng ngày
  - Mỗi phiên học có giờ bắt đầu, kết thúc và thời lượng
  - Phân bổ hợp lý dựa trên thuật toán

### Bước 4: Lưu ý khi sử dụng
- ⚠️ Hãy ước tính thời gian thực tế, không "thổi phồng" hoặc giảm bớt
- ⚠️ Chỉ thiết lập khung giờ rảnh mà bạn thực sự có thể học
- ⚠️ Nếu có cảnh báo về lịch không khả thi, hãy điều chỉnh:
  - Tăng thời gian rảnh
  - Giảm số giờ ước tính của nhiệm vụ
  - Chia nhỏ nhiệm vụ lớn thành nhiều nhiệm vụ nhỏ hơn

## 🏗️ Kiến trúc

### Tech Stack
- **Framework**: Next.js 16 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage (phía client)

### Cấu trúc thư mục
```
StudyFlowFrontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── TaskList.tsx       # Danh sách nhiệm vụ
│   ├── TaskForm.tsx       # Form thêm nhiệm vụ
│   ├── ScheduleView.tsx   # Hiển thị lịch học
│   └── AvailabilityForm.tsx # Form cài đặt thời gian rảnh
├── lib/                   # Business logic
│   └── scheduler.ts       # Thuật toán lập lịch
├── utils/                 # Utility functions
│   └── taskUtils.ts       # Các hàm xử lý nhiệm vụ
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

### Core Algorithm (scheduler.ts)

Thuật toán lập lịch thông minh bao gồm:

1. **Ưu tiên hóa nhiệm vụ**:
   - Sắp xếp theo deadline (gần nhất trước)
   - Ưu tiên nhiệm vụ khó hơn (cần nhiều thời gian hơn)

2. **Điều chỉnh thời gian theo độ khó**:
   - Dễ: x1.0
   - Trung bình: x1.2
   - Khó: x1.5
   - Rất khó: x2.0

3. **Phân bổ phiên học**:
   - Chia nhiệm vụ thành nhiều phiên (25-120 phút/phiên)
   - Tự động spacing giữa các phiên để tránh học dồn
   - Buffer 1 ngày trước deadline

4. **Validation**:
   - Kiểm tra tổng thời gian mỗi ngày không vượt giới hạn
   - Cảnh báo khi scheduling quá dày đặc
   - Cảnh báo khi không đủ thời gian trước deadline

## 🔮 Phát triển tương lai

- [ ] Tích hợp với Google Calendar
- [ ] Notification/Reminder qua email hoặc push notification
- [ ] Theo dõi thời gian học thực tế (time tracking)
- [ ] Thống kê và báo cáo hiệu suất học tập
- [ ] Sync dữ liệu qua cloud (Firebase/Supabase)
- [ ] Mobile app (React Native)
- [ ] Chế độ Pomodoro timer tích hợp
- [ ] Gamification (điểm thưởng, streak, achievements)

## 📝 License

ISC

## 🤝 Contributing

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.
