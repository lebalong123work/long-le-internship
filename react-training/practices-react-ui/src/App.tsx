import { useState, type ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserFormModal } from "@/components/modal/UserFormModal";
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
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const handleOpenAddModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleSubmitUser = (userData: Omit<User, "id">) => {
    if (formMode === "create") {
      setUsers((currentUsers) => [
        ...currentUsers,
        { ...userData, id: crypto.randomUUID() },
      ]);
    } else if (selectedUser) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, ...userData } : user,
        ),
      );
    }

    setIsUserFormOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) =>
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
            onOpenAddModal={handleOpenAddModal}
          />
          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={(user) => console.info("Delete user:", user)}
          />
          <UserFormModal
            isOpen={isUserFormOpen}
            mode={formMode}
            initialData={selectedUser}
            onClose={() => setIsUserFormOpen(false)}
            onSubmit={handleSubmitUser}
          />
        </div>
      }
    />
  );
}
