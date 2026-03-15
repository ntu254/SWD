import { Clock, TrendingUp, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function CollectorProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian thu gom</span>}
        title="Hồ sơ nhân viên thu gom"
        description="Giao diện này đã đồng bộ với hệ thống chung, còn luồng quản lý tài khoản sẽ được bổ sung ở bản phát hành sau."
      />

      <PagePlaceholder
        icon={User}
        eyebrow={<span className="shell-chip shell-chip-accent">Khu vực dự kiến</span>}
        title="Quản lý hồ sơ sẽ có trong bản tiếp theo."
        description="Bạn sẽ có thể cập nhật thông tin cá nhân, tùy chọn làm việc và thời gian sẵn sàng nhận tuyến ngay tại đây khi luồng cài đặt tài khoản được phát hành."
        tone="violet"
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/collector/performance")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Xem hiệu suất
            </Button>
            <Button variant="outline" onClick={() => navigate("/collector/dashboard")}>
              <Clock className="mr-2 h-4 w-4" />
              Về tổng quan
            </Button>
          </div>
        }
      />
    </div>
  );
}
