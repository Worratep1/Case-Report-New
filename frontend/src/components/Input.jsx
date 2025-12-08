export default function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="mb-4 w-full text-left">
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   text-sm"
      />
    </div>
  );
}
