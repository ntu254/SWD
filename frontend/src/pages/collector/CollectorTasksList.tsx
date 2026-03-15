import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
} from "lucide-react";

import { tasksApi } from "../../api";
import type { Task } from "../../types";
import { StatusBadge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { formatPriorityLabel } from "../../lib/labels";
import { EmptyState, PageHeader, SectionHeader } from "../../components/ui/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

function normalizeCollectorTaskStatus(status: string) {
  if (status === "IN_PROGRESS") return "ON_THE_WAY";
  if (status === "COLLECTED") return "COMPLETED";
  return status;
}

export const CollectorTasksList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["collector-tasks"],
    queryFn: () => tasksApi.getMyTasks().then((response) => response.data),
    refetchInterval: 30_000,
  });

  const tasks: Task[] = data?.data?.content ?? [];

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian thu gom</span>}
        title="Nhiệm vụ của tôi"
        description="Theo dõi các điểm đã phân công, ngày hẹn và tiến độ lộ trình trực tiếp trong một danh sách gọn gàng hơn."
      />

      <Card className="overflow-hidden">
        <SectionHeader
          title="Nhiệm vụ được giao"
          description="Chọn một dòng để mở chi tiết nhiệm vụ và cập nhật trạng thái theo đúng luồng hiện tại."
        />

        <CardContent className="pt-5 sm:pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="Chưa có nhiệm vụ nào"
              description="Nhiệm vụ sẽ xuất hiện ở đây ngay khi doanh nghiệp phân công cho bạn."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Ngày hẹn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.taskId}
                    onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                  >
                    {(() => {
                      const normalizedStatus = normalizeCollectorTaskStatus(task.status);

                      return (
                        <>
                          <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                        <span className="font-semibold text-[var(--text-primary)]">
                          {task.areaName || "Không rõ"}
                        </span>
                      </div>
                          </TableCell>
                          <TableCell>
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {formatPriorityLabel(task.priority)}
                      </span>
                          </TableCell>
                          <TableCell className="text-[var(--text-secondary)]">
                      {task.scheduledDate ?? "Chưa lên lịch"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={normalizedStatus} />
                          </TableCell>
                          <TableCell className="text-right">
                            {normalizedStatus === "ASSIGNED" ? (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-blue-700">
                          <Navigation className="h-4 w-4" />
                          Bắt đầu
                        </span>
                            ) : normalizedStatus === "ON_THE_WAY" ? (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-cyan-700">
                          <MapPin className="h-4 w-4" />
                          Đang đi
                        </span>
                            ) : (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-emerald-700">
                          <PackageCheck className="h-4 w-4" />
                          Xong
                        </span>
                            )}
                          </TableCell>
                        </>
                      );
                    })()}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
