import { Award, Clock, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

const weeklyTrend = [
  { day: "Mon", completed: 5, routeTime: 6.1 },
  { day: "Tue", completed: 6, routeTime: 5.8 },
  { day: "Wed", completed: 7, routeTime: 5.4 },
  { day: "Thu", completed: 5, routeTime: 6.4 },
  { day: "Fri", completed: 8, routeTime: 5.1 },
  { day: "Sat", completed: 6, routeTime: 5.6 },
  { day: "Sun", completed: 4, routeTime: 4.7 },
];

const categoryBreakdown = [
  { label: "Residential", value: 18 },
  { label: "Commercial", value: 11 },
  { label: "Industrial", value: 7 },
  { label: "Recycling", value: 9 },
];

export function CollectorPerformancePage() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Performance"
        description="A chart-based view of your weekly output, route time and collection mix."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Tasks completed"
          value={41}
          description="This week across all assigned routes."
          tone="mint"
          featured
        />
        <StatCard
          icon={Clock}
          label="Average route time"
          value="5.6 h"
          description="Measured from start to final pickup."
          tone="sky"
        />
        <StatCard
          icon={Award}
          label="Completion rate"
          value="92%"
          description="Based on assigned versus completed tasks."
          tone="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Weekly completion trend"
            description="Daily completions visualised with a proper area chart."
          />
          <div className="h-[320px] px-3 pb-3 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,110,125,0.12)" />
                <XAxis dataKey="day" stroke="#8c98a3" fontSize={12} />
                <YAxis stroke="#8c98a3" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 18,
                    border: "1px solid rgba(94,110,125,0.12)",
                    background: "rgba(255,255,255,0.96)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#6aa08c"
                  fill="#c9e2d7"
                  strokeWidth={3}
                  name="Completed tasks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Collections by category"
            description="Where this week&apos;s workload has been concentrated."
          />
          <div className="h-[320px] px-3 pb-3 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,110,125,0.12)" />
                <XAxis dataKey="label" stroke="#8c98a3" fontSize={12} />
                <YAxis stroke="#8c98a3" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 18,
                    border: "1px solid rgba(94,110,125,0.12)",
                    background: "rgba(255,255,255,0.96)",
                  }}
                />
                <Bar dataKey="value" fill="#7791d4" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
