import Link from "next/link";

export default function BestPracticesPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Cách dùng tối ưu</h1>
        <p className="text-sm text-zinc-400">
          Các mẹo và chiến lược để sử dụng StudyFlow hiệu quả nhất
        </p>
      </header>

      <div className="space-y-4">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3">1. Nhập thời gian rảnh TRƯỚC</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Luôn bắt đầu bằng cách nhập thời gian rảnh trong tuần. Điều này giúp hệ thống biết bạn có
            bao nhiêu giờ để học và xếp lịch chính xác hơn.
          </p>
          <p className="text-xs text-zinc-500">
            ❌ Sai: Tạo nhiệm vụ trước → không biết có đủ thời gian không<br />
            ✅ Đúng: Nhập slot rảnh → tạo nhiệm vụ → hệ thống biết khả thi hay không
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">2. Ước lượng thời gian KHẢ THI</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Đừng quá lạc quan với ước lượng thời gian. Tốt hơn là ước lượng dư một chút để tránh bị
            quá tải khi thực hiện.
          </p>
          <p className="text-xs text-zinc-500">
            💡 Mẹo: Nếu bạn nghĩ task cần 2 giờ, hãy ước lượng 2.5-3 giờ. Bạn sẽ có thời gian
            nghỉ ngơi và xử lý bất ngờ.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">3. Đặt buffer để tránh nhồi lịch</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Buffer là thời gian dự phòng giữa các phiên học. Nó giúp bạn có thời gian nghỉ ngơi,
            chuẩn bị, và không bị stress khi lịch quá kín.
          </p>
          <p className="text-xs text-zinc-500">
            💡 Khuyến nghị: Đặt buffer 10-15%. Ví dụ: phiên 60 phút → thực tế mất 66-69 phút
            (bao gồm buffer)
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">4. Xem kế hoạch theo nhiều cấp</h2>
          <p className="text-sm text-zinc-300 mb-2">
            StudyFlow cho phép xem kế hoạch từ tổng quan → chi tiết:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
            <li><strong>Tuần/Tháng:</strong> Nhìn tổng thể nhiệm vụ trong thời gian dài</li>
            <li><strong>Ngày:</strong> Xem chi tiết các phiên học trong ngày</li>
            <li><strong>Phiên học:</strong> Xem nhiệm vụ, tiêu chí, milestone cụ thể</li>
          </ul>
          <p className="mt-2 text-xs text-zinc-500">
            💡 Mẹo: Bấm vào lịch tuần để mở chi tiết ngày, bấm vào phiên học để xem nhiệm vụ
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">5. Sử dụng Milestones cho task lớn</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Với nhiệm vụ lớn (ví dụ: ôn thi cuối kỳ), hãy chia nhỏ thành các milestone. Hệ thống
            sẽ tự động tạo các phiên học riêng cho từng milestone.
          </p>
          <p className="text-xs text-zinc-500">
            Ví dụ: "Ôn kiểm tra Toán" → Milestone 1: "Ôn lý thuyết 90p", Milestone 2: "Làm bài tập 120p"
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">6. Thử nghiệm với Templates và Programs</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Nếu chưa biết bắt đầu từ đâu, hãy thử import một Template hoặc Program có sẵn.
            Bạn có thể chỉnh sửa sau khi import để phù hợp với mình.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">7. Kiểm tra Điểm khả thi</h2>
          <p className="text-sm text-zinc-300 mb-2">
            Sau khi tạo kế hoạch, xem &quot;Điểm khả thi&quot; (0-100). Nếu điểm thấp (&lt;60), hãy xem
            phần &quot;Gợi ý điều chỉnh&quot; và áp dụng các đề xuất.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <h3 className="mb-2 font-semibold text-emerald-200">📌 Tóm lại</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
            <li>Nhập slot rảnh trước</li>
            <li>Ước lượng thời gian thực tế (không quá lạc quan)</li>
            <li>Đặt buffer 10-15%</li>
            <li>Chia task lớn thành milestones</li>
            <li>Xem kế hoạch nhiều cấp (tuần → ngày → phiên học)</li>
            <li>Theo dõi điểm khả thi và gợi ý điều chỉnh</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
