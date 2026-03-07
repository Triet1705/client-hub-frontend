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
      <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Active</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{displayCount(activeProjects)}</span>
        </div>
      </div>

      <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all">
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

      <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upcoming Deadlines</p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">Next 30 days</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{displayCount(upcomingDeadlines)}</span>
        </div>
      </div>
    </section>
  );
}