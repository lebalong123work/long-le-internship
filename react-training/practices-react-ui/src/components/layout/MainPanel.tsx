import React from "react";

interface MainPanelProps {
  mainContent: React.ReactNode;
}

export const MainPanel: React.FC<MainPanelProps> = ({ mainContent }) => {
  return (
    <div className="manager">
      <main className="main">{mainContent}</main>
    </div>
  );
};
