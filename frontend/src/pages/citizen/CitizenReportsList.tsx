import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, MapPin } from "lucide-react";

import { reportsApi } from "../../api";
import type { WasteReport } from "../../types";
import { StatusBadge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
} from "../../components/ui/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export const CitizenReportsList: React.FC = () => {
  const navigate = useNavigate();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["citizen-reports"],
    queryFn: () => reportsApi.getMine().then((response) => response.data),
  });

  const reports: WasteReport[] = reportsData?.data?.content || [];

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian công dân</span>}
        title="Báo cáo của tôi"
        description="Xem lại tất cả báo cáo bạn đã gửi, gồm trạng thái hiện tại, vị trí và ảnh minh chứng."
      />

      <Card className="overflow-hidden">
        <SectionHeader
          title="Lịch sử gửi báo cáo"
          description="Chọn một dòng bất kỳ để mở trang chi tiết báo cáo."
        />

        <CardContent className="pt-5 sm:pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Chưa gửi báo cáo nào"
              description="Sau khi bạn gửi báo cáo rác, nó sẽ xuất hiện ở đây cùng trạng thái và vị trí hiện tại."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Ảnh</TableHead>
                  <TableHead>Loại rác</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.reportId}
                    onClick={() => navigate(`/citizen/reports/${report.reportId}`)}
                  >
                    <TableCell>
                      {report.reportPhotoUrl ? (
                        <div className="h-14 w-14 overflow-hidden rounded-[18px] border border-[var(--stroke-soft)] bg-white">
                          <img
                            src={report.reportPhotoUrl}
                            alt="Ảnh rác"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="shell-icon-chip h-14 w-14">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--text-primary)]">
                      {report.wasteTypeName || "Không rõ"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
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
