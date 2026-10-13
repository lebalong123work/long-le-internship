import { useCallback, useState, type ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toast } from "@/components/common/Toast";
import { ConfirmationDialog } from "@/components/modal/ConfirmationDialog";
import { UserFormModal } from "@/components/modal/UserFormModal";
import { UserTable } from "@/components/table/UserTable";
import { Toolbar } from "@/components/toolbar/Toolbar";
import type { User } from "@/types/user";

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

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const handleOpenAddModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleRequestDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userToDelete.id),
    );
    setToast({ message: "Delete success user", type: "success" });
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleSubmitUser = (userData: Omit<User, "id">) => {
    if (formMode === "create") {
      setUsers((currentUsers) => [
        ...currentUsers,
        { ...userData, id: crypto.randomUUID() },
      ]);
      setToast({ message: "Create success a new user", type: "success" });
    } else if (selectedUser) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, ...userData } : user,
        ),
      );
      setToast({ message: "Update success a user", type: "success" });
    }

    setIsFormModalOpen(false);
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
            onDelete={handleRequestDelete}
          />
          <UserFormModal
            isOpen={isFormModalOpen}
            mode={formMode}
            initialData={selectedUser}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleSubmitUser}
          />
          <ConfirmationDialog
            isOpen={isDeleteModalOpen}
            title="Are You Sure?"
            message="You won't be able to revert this."
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
          <Toast
            message={toast?.message ?? ""}
            type={toast?.type ?? "success"}
            isOpen={toast !== null}
            onClose={handleCloseToast}
          />
        </div>
      }
    />
  );
}
