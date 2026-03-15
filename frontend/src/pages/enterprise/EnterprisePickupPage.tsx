import { Clock, MapPin, Recycle, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function EnterprisePickupPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Lên lịch thu gom"
        description="Khu vực này đã được đưa về giao diện chung và đang được giữ cho phiên bản tiếp theo của luồng yêu cầu thu gom từ doanh nghiệp."
      />

      <PagePlaceholder
        icon={Recycle}
        eyebrow={<span className="shell-chip shell-chip-accent">Khu vực dự kiến</span>}
        title="Tính năng lên lịch thu gom sẽ có ở bản tiếp theo."
        description="Trang này sắp hỗ trợ điều phối yêu cầu thu gom từ doanh nghiệp, thời gian tuyến đường và kiểm tra mức độ sẵn sàng tại điểm lấy mà vẫn giữ nguyên quyền backend hiện tại."
        tone="mint"
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/enterprise/capabilities")}>
              <MapPin className="mr-2 h-4 w-4" />
              Đăng ký phạm vi phục vụ
            </Button>
            <Button onClick={() => navigate("/enterprise/tasks")}>
              <Route className="mr-2 h-4 w-4" />
              Xem nhiệm vụ
            </Button>
            <Button variant="outline" onClick={() => navigate("/enterprise/dashboard")}>
              <Clock className="mr-2 h-4 w-4" />
              Về tổng quan
            </Button>
          </div>
        }
      />
    </div>
  );
}
