import Link from "next/link";

export default function ParentAssignTasksPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Giao nhiệm vụ & khóa nhiệm vụ</h1>
        <p className="text-sm text-zinc-400">Cách phụ huynh tạo nhiệm vụ cho con và khóa không cho xóa</p>
      </header>

      <div className="space-y-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Giao nhiệm vụ cho con</h2>
          <p className="text-sm text-zinc-300">
            Vào{" "}
            <Link href="/parent" className="text-emerald-400 underline">Trang Phụ huynh</Link> →
            Chọn con → Tab <strong>"Giao nhiệm vụ"</strong> →
            Điền tên nhiệm vụ, môn học, deadline, độ khó và thời gian ước tính →
            Nhấn <strong>"Giao nhiệm vụ"</strong>.
          </p>
        </div>

        <div className="card space-y-2 border-amber-500/30">
          <h2 className="text-lg font-semibold text-amber-300">Nhiệm vụ bị khóa – Luật bảo vệ</h2>
          <p className="text-sm text-zinc-300">
            Nhiệm vụ do phụ huynh giao sẽ được đánh dấu <strong>"Khóa bởi phụ huynh"</strong>.
          </p>
          <ul className="text-sm text-zinc-300 list-disc list-inside space-y-1">
            <li>Học sinh <strong>không thể xóa</strong> nhiệm vụ đã bị khóa.</li>
            <li>Học sinh vẫn có thể xem và đánh dấu tiến độ.</li>
            <li>Chỉ phụ huynh (hoặc admin) mới có thể chỉnh sửa hoặc xóa nhiệm vụ khóa.</li>
          </ul>
          <p className="text-sm text-zinc-400 mt-1">
            Quy tắc này được thực thi ở backend – không thể bypass bằng cách thao tác giao diện.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">Xóa hoặc chỉnh sửa nhiệm vụ đã giao</h2>
          <p className="text-sm text-zinc-300">
            Chỉ tài khoản phụ huynh hoặc admin mới có thể xóa nhiệm vụ đã khóa.
            Vào tab <strong>"Nhiệm vụ"</strong> → tìm nhiệm vụ cần sửa → nhấn biểu tượng chỉnh sửa.
          </p>
        </div>
      </div>
    </div>
  );
}
