import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  MapPin,
  Navigation,
  PackageCheck,
} from "lucide-react";

import type { Task } from "../../types";
import { StatusBadge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { PageHeader, SectionHeader } from "../../components/ui/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const MOCK_TASKS: Task[] = [
  {
    taskId: "t1",
    reportId: "1",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u1",
    areaId: "a1",
    areaName: "Downtown Area",
    status: "ASSIGNED",
    priority: "HIGH",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    taskId: "t2",
    reportId: "2",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u2",
    areaId: "a1",
    areaName: "North Suburbs",
    status: "ON_THE_WAY",
    priority: "NORMAL",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    taskId: "t3",
    reportId: "3",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u3",
    areaId: "a1",
    areaName: "Industrial Zone",
    status: "COLLECTED",
    priority: "NORMAL",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CollectorTasksList: React.FC = () => {
  const navigate = useNavigate();

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
              {MOCK_TASKS.map((task) => (
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
                    {task.priority === "HIGH" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-red-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Urgent
                      </span>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {task.priority || "Normal"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)]">
                    {task.scheduledDate}
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
                    ) : null}
                    {task.status === "ON_THE_WAY" ? (
                      <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-cyan-700">
                        <MapPin className="h-4 w-4" />
                        Transit
                      </span>
                    ) : null}
                    {task.status === "COLLECTED" ? (
                      <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-emerald-700">
                        <PackageCheck className="h-4 w-4" />
                        Done
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
