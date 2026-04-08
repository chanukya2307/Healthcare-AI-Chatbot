export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </label>
  );
}
