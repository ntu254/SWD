import { Clock, Recycle, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function EnterprisePickupPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Schedule pickup"
        description="This pickup surface has been redesigned into the shared shell and reserved for the next iteration of the enterprise collection request flow."
      />

      <PagePlaceholder
        icon={Recycle}
        eyebrow={<span className="shell-chip shell-chip-accent">Planned surface</span>}
        title="Pickup scheduling is coming next."
        description="Soon this page will coordinate enterprise pickup requests, route timing and site readiness checks while preserving the same backend permissions."
        tone="mint"
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/enterprise/tasks")}>
              <Route className="mr-2 h-4 w-4" />
              Review tasks
            </Button>
            <Button variant="outline" onClick={() => navigate("/enterprise/dashboard")}>
              <Clock className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </div>
        }
      />
    </div>
  );
}
