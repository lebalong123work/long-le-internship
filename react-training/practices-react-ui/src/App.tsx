import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserManagementPage } from "@/pages/UserManagementPage";

export default function App() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      mainContent={<UserManagementPage />}
    />
  );
}
