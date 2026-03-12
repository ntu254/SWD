import { Building2, Clock, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function EnterpriseProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Company profile"
        description="The company profile view now matches the shared eco-premium shell while the editable profile workflow remains scheduled for a later release."
      />

      <PagePlaceholder
        icon={Building2}
        eyebrow={<span className="shell-chip shell-chip-accent">Planned surface</span>}
        title="Enterprise profile tools are on the roadmap."
        description="This area will host facility details, contact preferences and operating metadata without changing your existing enterprise account permissions."
        tone="sky"
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/enterprise/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/enterprise/analytics")}>
              <Clock className="mr-2 h-4 w-4" />
              View analytics
            </Button>
          </div>
        }
      />
    </div>
  );
}
