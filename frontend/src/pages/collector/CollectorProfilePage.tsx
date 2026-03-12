import { Clock, TrendingUp, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function CollectorProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Collector profile"
        description="This surface is now aligned with the shared product shell while the account management workflow stays reserved for a later release."
      />

      <PagePlaceholder
        icon={User}
        eyebrow={<span className="shell-chip shell-chip-accent">Planned surface</span>}
        title="Profile management is coming next."
        description="You will be able to update personal details, operating preferences and route availability from here once the collector account settings flow is released."
        tone="violet"
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/collector/performance")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View performance
            </Button>
            <Button variant="outline" onClick={() => navigate("/collector/dashboard")}>
              <Clock className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </div>
        }
      />
    </div>
  );
}
