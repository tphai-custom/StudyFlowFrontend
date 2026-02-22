import Link from "next/link";

const FAQS = [
  {
    q: "Con tôi không thấy mã liên kết ở đâu?",
    a: `Học sinh vào Hồ sơ học tập (phần Cài đặt) → kéo xuống phần "Mã liên kết" → nhấn "Tạo mã liên kết" nếu chưa có.`,
  },
  {
    q: "Tại sao tôi không thể xem kế hoạch của con?",
    a: `Cần phải liên kết tài khoản trước. Xem hướng dẫn liên kết con ở mục "Bắt đầu: Liên kết con".`,
  },
  {
    q: "Con có thể xóa nhiệm vụ tôi giao không?",
    a: `Không. Nhiệm vụ do phụ huynh giao được đánh dấu "khóa" – backend chặn học sinh xóa hoặc sửa.`,
  },
  {
    q: "Nếu con reset mã liên kết thì sao?",
    a: "Khi học sinh tạo mã mới, mã cũ mất hiệu lực ngay lập tức và bạn cần dùng mã mới để liên kết lại.",
  },
  {
    q: "Tôi có thể theo dõi nhiều con không?",
    a: "Có. Bạn có thể liên kết và theo dõi nhiều tài khoản học sinh từ cùng một tài khoản phụ huynh.",
  },
  {
    q: "Dữ liệu của con có an toàn không?",
    a: "Chỉ phụ huynh đã được liên kết chính thức mới xem được dữ liệu. Mọi API đều yêu cầu xác thực.",
  },
];

export default function ParentFaqPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link href="/guide" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Quay lại Hướng dẫn
        </Link>
        <h1 className="text-3xl font-semibold mt-2">FAQ Phụ huynh</h1>
        <p className="text-sm text-zinc-400">Câu hỏi thường gặp dành cho phụ huynh</p>
      </header>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card space-y-1">
            <p className="font-semibold text-zinc-100">{faq.q}</p>
            <p className="text-sm text-zinc-300">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
