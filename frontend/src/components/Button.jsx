export default function Button({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full py-2.5 text-sm font-semibold rounded-lg
                 bg-blue-600 text-white hover:bg-blue-700
                 focus:outline-none focus:ring-2 focus:ring-blue-400
                 transition-colors"
    >
      {children}
    </button>
  );
}
