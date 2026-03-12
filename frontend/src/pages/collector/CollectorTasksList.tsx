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
import { EmptyState, PageHeader, SectionHeader } from "../../components/ui/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

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
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="My tasks"
        description="Keep track of assigned stops, scheduled dates and live route progress from one cleaner task list."
      />

      <Card className="overflow-hidden">
        <SectionHeader
          title="Assigned tasks"
          description="Select any row to open task details and update the existing status flow."
        />

        <CardContent className="pt-5 sm:pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="No tasks assigned"
              description="Assigned tasks will appear here as soon as enterprise dispatches them."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location area</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.taskId}
                    onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                        <span className="font-semibold text-[var(--text-primary)]">
                          {task.areaName || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {task.priority || "Normal"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">
                      {task.scheduledDate ?? "Unscheduled"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {task.status === "ASSIGNED" ? (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-blue-700">
                          <Navigation className="h-4 w-4" />
                          Start
                        </span>
                      ) : task.status === "ON_THE_WAY" ? (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-cyan-700">
                          <MapPin className="h-4 w-4" />
                          Transit
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-emerald-700">
                          <PackageCheck className="h-4 w-4" />
                          Done
                        </span>
                      )}
                    </TableCell>
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
