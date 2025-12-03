// src/pages/ReportPage.jsx
import { Link } from "react-router-dom";
import ButtonCancel from "../components/ButtonBack";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";

export default function ReportPage() {
  const navigate = useNavigate();
  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-left">
          Report
        </h1>

        <div className="space-y-4">
          {/* Daily Report */}
          <Link
            to="/deilyreport"
            className="flex items-center gap-4 rounded-2xl bg-blue-50 px-4 py-4 hover:bg-blue-100 transition-colors"
          >
            {/* Icon */}
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-slate-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M8 14h3" />
                <path d="M8 18h3" />
                <path d="M14 14h2" />
              </svg>
            </div> */}

            {/* Text */}
            <div>
              <div className="text-base font-semibold text-slate-900" >
                Daily Report
              </div>
              <div className="text-sm text-slate-600">รายงานประจำวัน</div>
            </div>
          </Link>

          {/* Custom Report */}
          <Link
            to="/customreport"
            className="flex items-center gap-4 rounded-2xl bg-blue-50 px-4 py-4 hover:bg-blue-100 transition-colors"
          >
            {/* Icon */}
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-slate-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="14" height="16" rx="2" />
                <path d="M14 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h14" />
                <path d="M18 16l3 3" />
                <circle cx="16" cy="14" r="3" />
              </svg>
            </div> */}

            {/* Text */}
            <div>
              <div className="text-base font-semibold text-slate-900">
                Custom Report
              </div>
              <div className="text-sm text-slate-600">กำหนดเองรายงาน</div>
            </div>
          </Link>
          <div className="text-left p-1">
            <ButtonBack onClick={() => navigate("/menu")}>
              Back
            </ButtonBack>
          </div>
        </div>
      </div>
    </div>
  );
}
