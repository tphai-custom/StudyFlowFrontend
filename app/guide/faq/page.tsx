import Link from "next/link";

const FAQ_ITEMS = [
  {
    question: "Tại sao task của tôi không được xếp lịch?",
    answer:
      "Có thể do một trong các lý do sau: (1) Không đủ slot rảnh trong tuần, (2) Deadline quá gần so với thời gian cần thiết, (3) Tổng thời gian vượt giới hạn phút/ngày. Hãy xem phần 'Gợi ý điều chỉnh' ở trang Kế hoạch để biết cách khắc phục.",
  },
  {
    question: "Làm sạch slot là gì? Tại sao cần làm sạch?",
    answer:
      "Làm sạch slot là quá trình tự động gộp các slot trùng nhau, cắt slot quá dài (>3 giờ), và làm tròn phút lẻ. Điều này giúp tối ưu hóa việc xếp lịch và đảm bảo các phiên học có độ dài hợp lý.",
  },
  {
    question: "Điểm khả thi là gì? Điểm bao nhiêu là tốt?",
    answer:
      "Điểm khả thi (0-100) đánh giá độ thực tế của kế hoạch dựa trên thời gian, buffer, số slot hợp lệ, và deadline. Điểm 80-100 = Tốt, 60-79 = Trung bình, <60 = Cần cải thiện. Nếu điểm thấp, hãy áp dụng các gợi ý điều chỉnh.",
  },
  {
    question: "Buffer là gì? Nên đặt buffer bao nhiêu?",
    answer:
      "Buffer là thời gian dự phòng giữa các phiên học (ví dụ: 10% = 6 phút cho phiên 60p). Nó giúp bạn có thời gian nghỉ, chuẩn bị, và không bị stress. Khuyến nghị: 10-15% buffer.",
  },
  {
    question: "Làm sao để xuất lịch sang Google Calendar?",
    answer:
      "Sau khi tạo kế hoạch, bấm nút 'Xuất .ics' ở trang Kế hoạch. File .ics sẽ được tải xuống. Sau đó vào Google Calendar → Settings → Import & Export → chọn file .ics vừa tải.",
  },
  {
    question: "Tôi có thể chỉnh sửa kế hoạch sau khi tạo không?",
    answer:
      "Hiện tại, bạn cần tạo lại kế hoạch nếu muốn thay đổi (thêm/sửa task, slot). Hệ thống sẽ tự động tạo plan mới với version cao hơn. Trong tương lai sẽ có tính năng chỉnh sửa trực tiếp.",
  },
  {
    question: "Template và Program khác nhau như thế nào?",
    answer:
      "Template là kế hoạch mẫu đơn giản với các task gợi ý. Program phức tạp hơn, bao gồm nhiều milestones và cấu trúc chi tiết hơn, phù hợp với mục tiêu dài hạn.",
  },
  {
    question: "Tôi nên ước lượng thời gian nhiệm vụ như thế nào?",
    answer:
      "Hãy thực tế và ước lượng dư một chút. Nếu bạn nghĩ cần 2 giờ, hãy ước lượng 2.5-3 giờ. Tránh quá lạc quan vì sẽ dẫn đến quá tải. Nhớ rằng hệ thống sẽ thêm buffer nữa.",
  },
  {
    question: "Tại sao có phiên học bị đánh dấu là 'break'?",
    answer:
      "Hệ thống tự động thêm các phiên nghỉ (break) giữa các phiên học dài để bạn không bị quá tải. Các phiên break này dựa trên preset nghỉ (ví dụ: Pomodoro 25/5).",
  },
  {
    question: "Làm sao biết tôi có quá nhiều hoặc quá ít nhiệm vụ?",
    answer:
      "Sau khi tạo kế hoạch, xem phần 'Không đủ thời gian' và 'Điểm khả thi'. Nếu có nhiều task không được xếp lịch hoặc điểm thấp, bạn có quá nhiều nhiệm vụ. Nếu lịch rỗng, bạn có thể thêm nhiệm vụ hoặc habits.",
  },
  {
    question: "Tôi có thể dùng StudyFlow trên điện thoại không?",
    answer:
      "StudyFlow là web app, bạn có thể truy cập trên trình duyệt di động. Tuy nhiên, giao diện được tối ưu cho màn hình lớn (laptop/desktop). Phiên bản mobile app có thể được phát triển trong tương lai.",
  },
  {
    question: "Dữ liệu của tôi được lưu ở đâu?",
    answer:
      "Tất cả dữ liệu được lưu cục bộ trong trình duyệt (IndexedDB). Không có server backend, dữ liệu không được đồng bộ giữa các thiết bị. Hãy cẩn thận khi xóa cache trình duyệt.",
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Câu hỏi thường gặp</h1>
        <p className="text-sm text-zinc-400">
          Giải đáp các thắc mắc phổ biến khi sử dụng StudyFlow
        </p>
      </header>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="card">
            <h2 className="text-lg font-semibold text-sky-300 mb-2">
              Q: {item.question}
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              <strong className="text-emerald-400">A:</strong> {item.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <p className="text-sm text-zinc-400">
          ❓ <strong>Không tìm thấy câu trả lời?</strong> Hãy vào trang{" "}
          <Link href="/feedback" className="text-emerald-400 hover:underline">
            Phản hồi
          </Link>{" "}
          để gửi câu hỏi của bạn.
        </p>
      </div>
    </div>
  );
}
