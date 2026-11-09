import { CheckCircle, Users } from "lucide-react";
import { SummaryCard } from "./SummaryCard";
import { useSummaryStore } from "@/store/useSummaryStore";
import { useApprovedUsersToday } from "@/service/user/UserService";

export const StatusSummary = () => {
  const total = useSummaryStore((state) => state.totalPendientes);
  const { data, isLoading } = useApprovedUsersToday();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Pendientes"
        value={total}
        color="from-blue-200 to-indigo-200 border-blue-100 text-blue-900"
        icon={<Users className="h-8 w-8 text-blue-500" strokeWidth={2} />}
        loading={isLoading}
      />
      <SummaryCard
        title="Aprobados Hoy"
        value={data ? data.count : "--"}
        color="from-green-200 to-emerald-200 border-green-100 text-green-900"
        icon={
          <CheckCircle className="h-8 w-8 text-green-500" strokeWidth={2} />
        }
        loading={isLoading}
      />
    </div>
  );
};
