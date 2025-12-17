export default function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-4 w-full text-left">
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
      
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   bg-white dark:bg-slate-900 
                   dark:border-slate-700 
                   text-slate-900 dark:text-white
                   placeholder-slate-400 dark:placeholder-slate-500"
      
      />
    </div>
  );
}