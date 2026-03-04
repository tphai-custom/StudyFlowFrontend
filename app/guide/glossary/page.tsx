import Link from "next/link";

const GLOSSARY_TERMS = [
  {
    term: "Deep work",
    definition:
      "Làm việc tập trung sâu không bị gián đoạn, thường kéo dài 45-90 phút. Là thời gian bạn hoàn toàn tập trung vào học mà không check điện thoại, mạng xã hội.",
    example: "Ví dụ: Học Toán 60 phút liên tục, tắt thông báo, không bị xao nhãng.",
  },
  {
    term: "Buffer",
    definition:
      "Thời gian dự phòng giữa các phiên học (thường tính theo %). Giúp bạn có thời gian nghỉ ngơi, chuẩn bị, và tránh nhồi lịch.",
    example: "Ví dụ: Buffer 10% cho phiên 60p = 6p buffer → tổng 66p (60p học + 6p nghỉ).",
  },
  {
    term: "Habit (Thói quen)",
    definition:
      "Hoạt động lặp lại đều đặn hàng ngày hoặc hàng tuần. Không phải nhiệm vụ có deadline mà là thói quen bạn muốn duy trì.",
    example: "Ví dụ: Đọc sách mỗi tối 30p, chạy bộ sáng thứ 2-4-6, học từ vựng mỗi ngày 15p.",
  },
  {
    term: "Milestone (Mốc nhỏ)",
    definition:
      "Một bước hoặc giai đoạn trong một nhiệm vụ lớn. Giúp chia task lớn thành các phần nhỏ dễ quản lý hơn.",
    example: 'Ví dụ: Task "Ôn kiểm tra Toán" → Milestone 1: "Ôn lý thuyết 90p", Milestone 2: "Làm bài tập 120p", Milestone 3: "Xem lại lỗi 60p".',
  },
  {
    term: "Template (Kế hoạch mẫu)",
    definition:
      "Kế hoạch có sẵn với cấu trúc và nhiệm vụ đã định trước. Bạn có thể import và chỉnh sửa theo nhu cầu.",
    example: 'Ví dụ: Template "Ôn thi 2 tuần" có sẵn các task và lịch trình gợi ý.',
  },
  {
    term: "Program (Chương trình học)",
    definition:
      "Một chuỗi nhiệm vụ và milestones liên quan đến một mục tiêu cụ thể. Phức tạp hơn Template vì có nhiều bước và cấu trúc chi tiết.",
    example: 'Ví dụ: Program "Tăng điểm Toán từ 6 lên 8" gồm nhiều milestones: nắm lý thuyết, luyện bài tập, ôn đề thi...',
  },
  {
    term: "Xuất .ics",
    definition:
      "Tạo file lịch theo chuẩn iCalendar (.ics) để bạn import vào ứng dụng lịch khác như Google Calendar, Apple Calendar, Outlook.",
    example: "Sau khi tạo kế hoạch, bấm 'Xuất .ics' → tải file → import vào Google Calendar.",
  },
  {
    term: "Slot rảnh (Free slot)",
    definition:
      "Khung giờ trống trong tuần mà bạn có thể dùng để học. Hệ thống sẽ xếp các phiên học vào các slot này.",
    example: "Ví dụ: Thứ 2, 19:00-21:00 (120 phút), Thứ 4, 19:00-20:30 (90 phút).",
  },
  {
    term: "Làm sạch slot",
    definition:
      "Quá trình tự động gộp slot trùng, cắt slot quá dài (>3 giờ), làm tròn phút lẻ để tối ưu cho việc xếp lịch.",
    example: "Ví dụ: 2 slot Thứ 2 19:00-20:00 và 19:30-20:30 → gộp thành 19:00-20:30.",
  },
  {
    term: "Completion rate (Tỷ lệ hoàn thành)",
    definition:
      "Phần trăm (%) các phiên học đã hoàn tất so với tổng số phiên trong kế hoạch.",
    example: "Ví dụ: 20 phiên, đã hoàn thành 15 → Completion rate = 75%.",
  },
  {
    term: "Điểm khả thi",
    definition:
      "Số từ 0-100 đánh giá độ khả thi của kế hoạch dựa trên: tổng phút/ngày, buffer, số slot hợp lệ, deadline gần.",
    example: "Ví dụ: Điểm 85 = Tốt (kế hoạch rất khả thi), điểm 50 = Cần cải thiện (có thể quá tải).",
  },
  {
    term: "Khoá cài đặt",
    definition:
      "Tính năng cho phép phụ huynh đặt cứng một số cài đặt (giới hạn phút/ngày, preset nghỉ, buffer...) để con không thể tự thay đổi. Khi một trường bị khoá, planner của con luôn dùng giá trị phụ huynh đặt, bất kể cài đặt riêng của con là bao nhiêu.",
    example: 'Ví dụ: Phụ huynh khoá "Giới hạn phút học/ngày = 225". Con thấy biểu tượng 🔒 và dòng chữ "Giá trị đang áp dụng: 225 phút/ngày (Phụ huynh đặt)". Kế hoạch tự động dùng 225 phút.',
  },
  {
    term: "Chế độ thời lượng (Duration Mode)",
    definition:
      "Cách bạn cung cấp thông tin thời lượng cho một nhiệm vụ. Có 2 chế độ: Chính xác (biết đúng số phút) hoặc Ước lượng (khoảng từ–đến). Planner dùng số chính xác (exact) hoặc trung bình (min+max)/2 (estimate) để chia lịch.",
    example: 'Ví dụ: Ôn Toán Chính xác = 120 phút. Ôn Văn Ước lượng = 60–90 phút → planner dùng 75 phút.',
  },
  {
    term: "Phong cách chia lịch (Scheduling Style)",
    definition:
      "Chiến lược phân bổ thời gian học trong các ngày trước deadline. Front-load: xếp phiên học sớm nhất có thể. Balanced: rải đều các ngày. Deadline-loaded: xếp phiên học gần sát deadline. Lưu ý: deadline luôn được ưu tiên tuyệt đối — phong cách chỉ là xu hướng, không bao giờ làm task deadline sớm bị xếp chậm hơn task deadline muộn.",
    example: 'Ví dụ: Task A deadline ngày 5 (front-load) và Task B deadline ngày 10 (deadline-loaded). Ngày 3 còn slot → Task A luôn được xếp trước vì deadline gần hơn, dù Task B dùng style "gần deadline".',
  },
  {
    term: "Nhiệm vụ phụ huynh",
    definition:
      "Nhiệm vụ do phụ huynh giao thông qua tính năng 'Giao nhiệm vụ'. Khi học sinh bấm 'Thêm vào kế hoạch', hệ thống tự động tạo một nhiệm vụ thật (có badge 👨‍👩‍👧 Từ phụ huynh) trong danh sách Nhiệm vụ. Học sinh không thể xóa hoặc sửa nội dung gốc của nhiệm vụ bắt buộc.",
    example: 'Ví dụ: Ba giao "Ôn tập Toán 90p, Balanced". Học sinh bấm "Thêm vào kế hoạch" → task "Ôn tập Toán" xuất hiện trong Nhiệm vụ với badge "Từ phụ huynh 🔒" → planner tự xếp lịch.',
  },
  {
    term: "Độ ưu tiên theo Deadline (Urgency Score)",
    definition:
      "Công thức planner dùng để tránh tình trạng bỏ sót task deadline gần: urgency = phút còn lại / số ngày còn lại. Task nào urgency cao hơn sẽ được xếp lịch trước trong ngày. Kết hợp với style_weight để tạo ra thứ tự ưu tiên cuối cùng.",
    example: "Ví dụ: Task A còn 120p, deadline sau 1 ngày → urgency=120. Task B còn 300p, deadline sau 7 ngày → urgency≈43. Planner ưu tiên Task A trong các ngày còn lại.",
  },
  {
    term: "Xem theo cấp",
    definition:
      "Xem kế hoạch từ tổng quan (tuần/tháng) → chi tiết (ngày) → chi tiết hơn (phiên học cụ thể).",
    example: "Ví dụ: Xem lịch tuần → bấm vào Thứ 2 → xem các phiên học trong ngày → bấm phiên Toán → xem chi tiết nhiệm vụ.",
  },
];

export default function GlossaryPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Giải thích thuật ngữ</h1>
        <p className="text-sm text-zinc-400">
          Tìm hiểu ý nghĩa của các thuật ngữ được sử dụng trong StudyFlow
        </p>
      </header>

      <div className="space-y-3">
        {GLOSSARY_TERMS.map((item, index) => (
          <div key={index} className="card">
            <h2 className="text-lg font-semibold text-emerald-300 mb-2">{item.term}</h2>
            <p className="text-sm text-zinc-300 mb-2">{item.definition}</p>
            <p className="text-xs text-zinc-500 italic">{item.example}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <p className="text-sm text-zinc-400">
          💡 <strong>Mẹo:</strong> Khi thấy thuật ngữ trong app, di chuột vào để xem tooltip giải thích nhanh.
        </p>
      </div>
    </div>
  );
}
