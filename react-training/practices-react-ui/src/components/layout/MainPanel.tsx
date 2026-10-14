import React from "react";
import { TopNavigation } from "./TopNavigation";

interface MainPanelProps {
  mainContent: React.ReactNode;
}

export const MainPanel: React.FC<MainPanelProps> = ({ mainContent }) => {
  return (
    <div className="manager">
      <TopNavigation />
      <main className="main">{mainContent}</main>
    </div>
  );
};
