import Link from "next/link";

export default function ParentAccountControlsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Quản lý tài khoản & giới hạn học</h1>
        <p className="text-sm text-zinc-400">Khóa/mở tài khoản và thiết lập giới hạn từ admin</p>
      </header>

      <div className="space-y-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Giới hạn giờ học hàng ngày</h2>
          <p className="text-sm text-zinc-300">
            Học sinh có thể tự cài giới hạn phút/ngày trong{" "}
            <Link href="/settings" className="text-emerald-400 underline">Cài đặt</Link>.
            Phụ huynh có thể đề xuất điều chỉnh thông qua phần giao nhiệm vụ hoặc liên hệ admin.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Khóa/mở tài khoản (Admin)</h2>
          <p className="text-sm text-zinc-300">
            Tính năng khóa tài khoản chỉ có thể thực hiện bởi quản trị viên hệ thống.
            Nếu cần khóa tài khoản học sinh, liên hệ quản trị viên qua trang Admin.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Hủy liên kết với con</h2>
          <p className="text-sm text-zinc-300">
            Vào{" "}
            <Link href="/parent" className="text-emerald-400 underline">Trang Phụ huynh</Link> →
            Chọn con → Nhấn <strong>"Hủy liên kết"</strong>. 
            Học sinh có thể reset mã liên kết từ hồ sơ của mình để ngắt tất cả kết nối.
          </p>
        </div>
      </div>
    </div>
  );
}
