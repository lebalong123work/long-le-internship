import { useState, type ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toolbar } from "@/components/toolbar/Toolbar";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  return (
    <AppLayout
      sidebar={<Sidebar />}
      mainContent={
        <div id="user-management">
          <Toolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onOpenAddModal={() =>
              console.info("The add-user modal is not implemented yet.")
            }
          />
          <h1>Management User</h1>
        </div>
      }
    />
  );
}
