import Link from "next/link";

export default function ParentTrackProgressPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Theo dõi kế hoạch & tiến độ</h1>
        <p className="text-sm text-zinc-400">Cách phụ huynh xem nhiệm vụ, kế hoạch và thống kê</p>
      </header>

      <div className="space-y-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Xem nhiệm vụ của con</h2>
          <p className="text-sm text-zinc-300">
            Vào{" "}
            <Link href="/parent" className="text-emerald-400 underline">Trang Phụ huynh</Link> →
            Chọn tên con từ danh sách → Tab <strong>"Nhiệm vụ"</strong>.
            Bạn thấy toàn bộ danh sách nhiệm vụ kèm deadline, môn học, tiến độ.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Xem kế hoạch tuần/ngày</h2>
          <p className="text-sm text-zinc-300">
            Tab <strong>"Kế hoạch"</strong> hiển thị các phiên học đã được lên lịch theo ngày.
            Bạn có thể xem lịch chi tiết giờ nào học môn gì.
          </p>
          <p className="text-sm text-zinc-300">
            Để xem lịch đầy đủ: Tab <strong>"Lịch"</strong> hoặc bấm{" "}
            <Link href="/calendar" className="text-emerald-400 underline">Lịch lớn</Link>.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Xem thống kê</h2>
          <p className="text-sm text-zinc-300">
            Tab <strong>"Thống kê"</strong> hiển thị tổng phút học theo ngày/tuần, 
            phân tích theo môn và tỷ lệ hoàn thành. Dữ liệu cập nhật theo thời gian thực.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Hôm nay</h2>
          <p className="text-sm text-zinc-300">
            Xem nhanh những gì con cần học hôm nay qua tab <strong>"Hôm nay"</strong> 
            hoặc trang{" "}
            <Link href="/today" className="text-emerald-400 underline">Hôm nay</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
