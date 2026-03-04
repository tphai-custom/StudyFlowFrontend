import Link from "next/link";

export default function QuickStartPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Bắt đầu nhanh (4 bước)</h1>
        <p className="text-sm text-zinc-400">
          Làm theo 4 bước đơn giản để tạo kế hoạch học và kết nối với phụ huynh
        </p>
      </header>

      <div className="space-y-4">
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-black">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Nhập thời gian rảnh</h2>
              <p className="text-sm text-zinc-300 mb-3">
                Trước tiên, hãy cho StudyFlow biết bạn có những khung giờ nào trong tuần để học.
                Ví dụ: Thứ 2, 19:00-21:00; Thứ 4, 19:00-20:30...
              </p>
              <Link
                href="/free-time"
                className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                → Vào trang Thời gian rảnh
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-black">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Tạo nhiệm vụ học tập</h2>
              <p className="text-sm text-zinc-300 mb-3">
                Nhập các nhiệm vụ bạn cần hoàn thành: môn học, tên nhiệm vụ, deadline, độ khó, và thời lượng cần thiết.
                Hệ thống sẽ dùng thông tin này để xếp lịch hợp lý.
              </p>
              <div className="mb-3 space-y-1.5">
                <div className="flex items-start gap-2 text-xs text-zinc-400">
                  <span>🎯</span>
                  <span><strong className="text-zinc-300">Chế độ thời lượng:</strong> Chọn <em>Chính xác</em> (biết đúng số phút) hoặc <em>Ước lượng</em> (khoảng từ–đến), hệ thống dùng trung bình để chia lịch.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-zinc-400">
                  <span>⚖️</span>
                  <span><strong className="text-zinc-300">Phong cách chia lịch:</strong> <em>Front-load</em> (hoàn thành sớm), <em>Balanced</em> (rải đều), hoặc <em>Deadline-loaded</em> (tập trung gần deadline).</span>
                </div>
              </div>
              <Link
                href="/tasks"
                className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                → Vào trang Nhiệm vụ
              </Link>
              <p className="mt-2 text-xs text-zinc-500">
                💡 Mẹo: Bấm "Điền thử bằng ví dụ" để xem ví dụ cách nhập nhiệm vụ
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-black">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Tạo kế hoạch</h2>
              <p className="text-sm text-zinc-300 mb-3">
                Sau khi đã có thời gian rảnh và nhiệm vụ, bấm "Tạo kế hoạch". Hệ thống sẽ tự động xếp lịch
                các phiên học phù hợp với thời gian bạn có. Nếu không đủ thời gian, StudyFlow sẽ đưa ra
                gợi ý điều chỉnh.
              </p>
              <Link
                href="/plan"
                className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                → Vào trang Kế hoạch
              </Link>
            </div>
          </div>
        </div>

        <div className="card border-indigo-500/30 bg-indigo-500/5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-black">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Trao đổi với phụ huynh</h2>
              <p className="text-sm text-zinc-300 mb-3">
                Nhận nhắc nhở và gợi ý từ phụ huynh, phản hồi nhanh ngay trong app. Nhiệm vụ và thói quen
                phụ huynh giao sẽ tự động xuất hiện trong kế hoạch của bạn. Nhiệm vụ bắt buộc (🔒) được
                ưu tiên xếp lịch và hiển thị badge <strong>"Phụ huynh giao"</strong> trên lịch.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/exchange"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  → Vào Trao đổi
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600"
                >
                  → Xem Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-4">
          <h3 className="mb-2 font-semibold text-sky-200">🎉 Xong rồi!</h3>
          <p className="text-sm text-zinc-300">
            Sau khi tạo kế hoạch, bạn có thể:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
            <li>Xem kế hoạch theo Năm/Tháng/Tuần/Ngày</li>
            <li>Xuất file .ics để import vào Google Calendar</li>
            <li>Xem phiên học hôm nay ở trang "Hôm nay"</li>
            <li>Điều chỉnh cài đặt (giới hạn phút/ngày, buffer, preset nghỉ...)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
