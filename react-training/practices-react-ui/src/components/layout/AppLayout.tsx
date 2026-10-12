import React from "react";
import { MainPanel } from "./MainPanel";

interface AppLayoutProps {
  sidebar?: React.ReactNode;
  mainContent: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  sidebar,
  mainContent,
}) => {
  return (
    <div className="wrapper-manager">
      {sidebar}
      <MainPanel mainContent={mainContent} />
    </div>
  );
};
