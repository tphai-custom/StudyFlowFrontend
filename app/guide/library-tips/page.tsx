import Link from "next/link";

export default function LibraryTipsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Dùng Thư viện hiệu quả</h1>
        <p className="text-sm text-zinc-400">Tìm tài liệu theo môn, lớp và tạo nhiệm vụ từ tài liệu</p>
      </header>

      <div className="space-y-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">1. Tìm tài liệu phù hợp</h2>
          <p className="text-sm text-zinc-300">
            Vào <Link href="/library" className="text-emerald-400 underline">Thư viện</Link> → Chọn môn 
            (5 môn: Toán, Ngữ văn, Tiếng Anh, Lịch sử, Địa lí) → Chọn lớp (6–10) → Chọn loại tài liệu 
            (Bài học / Tóm tắt / Bài tập / Video...).
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">2. Tìm kiếm từ khóa</h2>
          <p className="text-sm text-zinc-300">
            Dùng ô tìm kiếm để lọc nhanh. Hệ thống tìm theo tên, mô tả và tags. 
            Tìm kiếm có độ trễ 350ms để tránh gửi quá nhiều request khi bạn gõ liên tục.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">3. Tạo nhiệm vụ từ tài liệu</h2>
          <p className="text-sm text-zinc-300">
            Trên mỗi card tài liệu, nhấn nút <strong>"+ Tạo nhiệm vụ từ tài liệu"</strong>. 
            Bạn sẽ được chuyển đến trang Nhiệm vụ với tên và môn đã được điền sẵn — 
            chỉ cần thêm deadline và thời gian ước tính.
          </p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">4. Lưu ý</h2>
          <ul className="text-sm text-zinc-300 list-disc list-inside space-y-1">
            <li>Thư viện hiển thị tài liệu hệ thống (dùng chung) và tài liệu bạn tự tạo.</li>
            <li>Quản trị viên có thể seed thêm dữ liệu mẫu bất kỳ lúc nào.</li>
            <li>Nếu thư viện trống, yêu cầu admin nhấn "Seed dữ liệu thư viện".</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
