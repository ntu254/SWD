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
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian thu gom</span>}
        title="Hiệu suất"
        description="Biểu đồ theo dõi sản lượng tuần, thời gian di chuyển và cơ cấu thu gom của bạn."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Nhiệm vụ hoàn thành"
          value={41}
          description="Trong tuần này trên toàn bộ tuyến được giao."
          tone="mint"
          featured
        />
        <StatCard
          icon={Clock}
          label="Thời gian tuyến trung bình"
          value="5.6 h"
          description="Tính từ lúc bắt đầu đến điểm thu gom cuối cùng."
          tone="sky"
        />
        <StatCard
          icon={Award}
          label="Tỷ lệ hoàn thành"
          value="92%"
          description="Dựa trên số nhiệm vụ được giao và đã hoàn tất."
          tone="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Xu hướng hoàn thành theo tuần"
            description="Số nhiệm vụ hoàn thành mỗi ngày được hiển thị bằng biểu đồ vùng."
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
                  name="Nhiệm vụ hoàn thành"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Thu gom theo nhóm"
            description="Khối lượng công việc trong tuần tập trung nhiều ở nhóm nào."
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
