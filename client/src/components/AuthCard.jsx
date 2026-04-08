export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Healthcare Assistant
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 text-sm text-slate-300">{footer}</div> : null}
    </div>
  );
}
