import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase text-zinc-400">Giới thiệu</p>
        <h1 className="text-3xl font-semibold">Giới thiệu & Hướng dẫn</h1>
        <p className="text-sm text-zinc-400">
          Tìm hiểu cách dùng StudyFlow hiệu quả để lập kế hoạch học tập hợp lý
        </p>
      </header>

      <div className="grid-auto">
        <Link href="/guide/quick-start" className="card hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h2 className="text-lg font-semibold mb-2">Bắt đầu nhanh (3 bước)</h2>
              <p className="text-sm text-zinc-400">
                Hướng dẫn nhanh 3 bước để bạn có thể tạo kế hoạch học đầu tiên ngay lập tức
              </p>
            </div>
          </div>
        </Link>

        <Link href="/guide/best-practices" className="card hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h2 className="text-lg font-semibold mb-2">Cách dùng tối ưu</h2>
              <p className="text-sm text-zinc-400">
                Các mẹo và chiến lược để sử dụng StudyFlow hiệu quả nhất
              </p>
            </div>
          </div>
        </Link>

        <Link href="/guide/glossary" className="card hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <h2 className="text-lg font-semibold mb-2">Giải thích thuật ngữ</h2>
              <p className="text-sm text-zinc-400">
                Tìm hiểu ý nghĩa của các thuật ngữ như Deep work, Buffer, Milestone, Template...
              </p>
            </div>
          </div>
        </Link>

        <Link href="/guide/faq" className="card hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-3">
            <span className="text-3xl">❓</span>
            <div>
              <h2 className="text-lg font-semibold mb-2">Câu hỏi thường gặp</h2>
              <p className="text-sm text-zinc-400">
                Giải đáp các thắc mắc phổ biến khi sử dụng StudyFlow
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
