interface ProjectStatsProps {
  activeProjects?: number;
  awaitingPaymentAmount?: string;
  upcomingDeadlines?: number;
  isLoading?: boolean;
}

export function ProjectStats({
  activeProjects,
  awaitingPaymentAmount,
  upcomingDeadlines,
  isLoading = false,
}: ProjectStatsProps) {
  const formatCurrency = (val?: string) =>
    val
      ? `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "$0.00";

  const displayCount = (val?: number) => (isLoading ? "—" : (val ?? 0).toString());

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Active</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{displayCount(activeProjects)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Payment</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400">Action needed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white font-mono">
              {isLoading ? "—" : formatCurrency(awaitingPaymentAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upcoming Deadlines</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">Next 30 days</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{displayCount(upcomingDeadlines)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}