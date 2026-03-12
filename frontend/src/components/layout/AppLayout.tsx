import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden">
      <a href="#app-main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-y-0 left-0 hidden w-[calc(var(--sidebar-width)+3rem)] lg:block"
          style={{ background: "var(--sidebar-accent)" }}
        />
        <div className="absolute inset-x-[18%] top-0 h-72 rounded-full bg-[rgba(107,170,132,0.08)] blur-[100px]" />
        <div className="absolute bottom-[-80px] right-[-40px] h-80 w-80 rounded-full bg-[rgba(78,123,217,0.12)] blur-[100px]" />
      </div>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-[rgba(31,39,39,0.2)] backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        className={`
          fixed left-0 top-0 z-40 h-screen w-[var(--sidebar-width)] transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-3 lg:pl-[calc(var(--sidebar-width)+0.75rem)] lg:pr-3 lg:py-3">
        <main
          id="app-main-content"
          className="custom-scroll mt-2 min-h-0 flex-1 overflow-y-auto"
        >
          <div className="page-enter mx-auto h-full max-w-[1440px]">
            <div className="shell-panel min-h-full p-3 sm:p-4 lg:p-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
