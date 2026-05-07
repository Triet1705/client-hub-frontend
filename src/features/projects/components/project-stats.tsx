import { SummaryCard } from "@/components/ui/summary-card";
import { formatFiat } from "@/lib/utils";

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
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        label="Active Projects"
        value={activeProjects ?? 0}
        badge={{ label: "Active", variant: "emerald" }}
        isLoading={isLoading}
      />
      <SummaryCard
        label="Awaiting Payment"
        value={formatFiat(awaitingPaymentAmount)}
        badge={{ label: "Action needed", variant: "rose" }}
        isLoading={isLoading}
      />
      <SummaryCard
        label="Upcoming Deadlines"
        value={upcomingDeadlines ?? 0}
        badge={{ label: "Next 30 days", variant: "amber" }}
        isLoading={isLoading}
      />
    </section>
  );
}