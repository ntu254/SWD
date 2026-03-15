import { Building2, Clock, LayoutDashboard, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function EnterpriseProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Hồ sơ doanh nghiệp"
        description="Màn hồ sơ doanh nghiệp giờ đã đồng bộ với giao diện chung, còn luồng chỉnh sửa chi tiết sẽ được bổ sung ở bản phát hành sau."
      />

      <PagePlaceholder
        icon={Building2}
        eyebrow={<span className="shell-chip shell-chip-accent">Khu vực dự kiến</span>}
        title="Công cụ hồ sơ doanh nghiệp đang nằm trong lộ trình."
        description="Khu vực này sẽ chứa thông tin cơ sở, tùy chọn liên hệ và dữ liệu vận hành mà không làm thay đổi quyền tài khoản doanh nghiệp hiện tại."
        tone="sky"
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/enterprise/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Về tổng quan
            </Button>
            <Button variant="outline" onClick={() => navigate("/enterprise/capabilities")}>
              <MapPin className="mr-2 h-4 w-4" />
              Đăng ký phạm vi phục vụ
            </Button>
            <Button variant="outline" onClick={() => navigate("/enterprise/analytics")}>
              <Clock className="mr-2 h-4 w-4" />
              Xem phân tích
            </Button>
          </div>
        }
      />
    </div>
  );
}
