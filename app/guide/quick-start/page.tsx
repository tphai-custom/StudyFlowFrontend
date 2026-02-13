import Link from "next/link";

export default function QuickStartPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Bắt đầu nhanh (3 bước)</h1>
        <p className="text-sm text-zinc-400">
          Làm theo 3 bước đơn giản để tạo kế hoạch học đầu tiên của bạn
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
                Nhập các nhiệm vụ bạn cần hoàn thành: môn học, tên nhiệm vụ, deadline, độ khó, và ước lượng
                thời gian cần thiết. Hệ thống sẽ dùng thông tin này để xếp lịch hợp lý.
              </p>
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
