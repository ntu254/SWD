import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  UserRound,
  Clock3,
} from "lucide-react";

import { tasksApi } from "../../api";
import type { Task } from "../../types";
import { StatusBadge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
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

function formatTaskDateTime(value?: string | null) {
  if (!value) {
    return "Chua co thoi diem";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chua co thoi diem";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        eyebrow={<span className="shell-chip shell-chip-primary">Khong gian thu gom</span>}
        title="Nhiem vu cua toi"
        description="Theo doi nguoi gui bao cao, khu vuc, loai rac va thoi diem tao de collector den dung diem can thu gom."
      />

      <Card className="overflow-hidden">
        <SectionHeader
          title="Nhiem vu duoc giao"
          description="Danh sach nay hien thong tin tu bao cao cong dan de ban nhin ro ten nguoi gui, khu vuc va ngay gio phat sinh."
        />

        <CardContent className="pt-5 sm:pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="Chua co nhiem vu nao"
              description="Nhiem vu se xuat hien o day ngay khi doanh nghiep phan cong cho ban."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cong dan</TableHead>
                  <TableHead>Khu vuc va loai rac</TableHead>
                  <TableHead>Ngay gio bao cao</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead className="text-right">Hanh dong</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const normalizedStatus = normalizeCollectorTaskStatus(task.status);
                  const reporterName = task.report?.reporterName || "Chua ro cong dan";
                  const areaName = task.areaName || task.report?.areaName || "Chua ro khu vuc";
                  const wasteTypeName = task.report?.wasteTypeName || "Chua ro loai rac";
                  const createdAt = formatTaskDateTime(task.report?.createdAt || task.createdAt);

                  return (
                    <TableRow
                      key={task.taskId}
                      onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                    >
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-[var(--text-muted)]" />
                            <span className="font-semibold text-[var(--text-primary)]">
                              {reporterName}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {task.report?.reportId
                              ? `Ma bao cao: ${task.report.reportId.slice(0, 8)}`
                              : "Dang dong bo bao cao"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                            <span className="font-semibold text-[var(--text-primary)]">
                              {areaName}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {wasteTypeName}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />
                          <span>{createdAt}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={normalizedStatus} />
                      </TableCell>

                      <TableCell className="text-right">
                        {normalizedStatus === "ASSIGNED" ? (
                          <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-blue-700">
                            <Navigation className="h-4 w-4" />
                            Bat dau
                          </span>
                        ) : normalizedStatus === "ON_THE_WAY" ? (
                          <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-cyan-700">
                            <MapPin className="h-4 w-4" />
                            Dang di
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-emerald-700">
                            <PackageCheck className="h-4 w-4" />
                            Xong
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
