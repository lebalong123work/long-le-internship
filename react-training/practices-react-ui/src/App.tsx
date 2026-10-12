import { useState, type ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserTable } from "@/components/table/UserTable";
import { Toolbar } from "@/components/toolbar/Toolbar";
import type { User } from "@/scripts/types/user";

const mockUsers: User[] = [
  {
    id: 1,
    email: "alex.johnson@example.com",
    first_name: "Alex",
    last_name: "Johnson",
    phone_number: "+1 555-0101",
  },
  {
    id: 2,
    email: "sam.lee@example.com",
    first_name: "Sam",
    last_name: "Lee",
    phone_number: "+1 555-0102",
  },
  {
    id: 3,
    email: "jordan.taylor@example.com",
    first_name: "Jordan",
    last_name: "Taylor",
    phone_number: "+1 555-0103",
  },
];

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const filteredUsers = mockUsers.filter((user) =>
    [user.email, user.first_name, user.last_name, user.phone_number].some(
      (value) => value.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    ),
  );

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
          <UserTable
            users={filteredUsers}
            onEdit={(user) => console.info("Edit user:", user)}
            onDelete={(user) => console.info("Delete user:", user)}
          />
        </div>
      }
    />
  );
}
