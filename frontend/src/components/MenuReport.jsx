import { Link } from "react-router-dom";

export default function MenuPage() {
  return (
    <div>
      {/* ปุ่มตัวอย่าง */}
      <Link
        to="/report"
        className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white"
      >
        Report
      </Link>
    </div>
  );
}
