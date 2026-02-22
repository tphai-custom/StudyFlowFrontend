import Link from "next/link";

export default function ParentLinkChildPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Bắt đầu: Liên kết con</h1>
        <p className="text-sm text-zinc-400">Cách liên kết tài khoản phụ huynh với tài khoản học sinh</p>
      </header>

      <div className="space-y-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Bước 1 – Lấy mã liên kết từ học sinh</h2>
          <p className="text-sm text-zinc-300">
            Học sinh cần đăng nhập vào StudyFlow → vào <strong>Hồ sơ học tập</strong> → 
            phần <strong>"Mã liên kết"</strong> → nhấn <strong>"Tạo mã liên kết"</strong> nếu chưa có.
          </p>
          <p className="text-sm text-zinc-300">
            Mã có dạng 8 ký tự, ví dụ: <code className="bg-zinc-800 px-1 rounded">A3B7X2Z1</code>
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Bước 2 – Phụ huynh nhập mã liên kết</h2>
          <p className="text-sm text-zinc-300">
            Đăng nhập bằng tài khoản phụ huynh → vào{" "}
            <Link href="/parent" className="text-emerald-400 underline">Trang Phụ huynh</Link> → 
            Nhập <strong>username</strong> của học sinh và <strong>mã liên kết 8 ký tự</strong> → 
            Nhấn <strong>"Liên kết"</strong>.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Sau khi liên kết thành công</h2>
          <p className="text-sm text-zinc-300">
            Bạn có thể xem nhiệm vụ, kế hoạch, giao nhiệm vụ và theo dõi tiến độ học tập của con từ 
            trang Phụ huynh. Mỗi lần học sinh cập nhật, phụ huynh thấy thay đổi ngay lập tức.
          </p>
        </div>

        <div className="card space-y-2 border-amber-500/30">
          <h2 className="text-lg font-semibold text-amber-300">Lưu ý quan trọng</h2>
          <ul className="text-sm text-zinc-300 list-disc list-inside space-y-1">
            <li>Mỗi phụ huynh có thể liên kết với nhiều học sinh.</li>
            <li>Mỗi học sinh có thể có nhiều phụ huynh theo dõi.</li>
            <li>Học sinh có thể xoay vòng (reset) mã liên kết nếu muốn hủy quyền truy cập.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
