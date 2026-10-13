import type { User } from "@/types/user";
import { EmptyState } from "./EmptyState";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="table-scroll">
      <table className="table-user">
        <UserTableHeader />
        <tbody>
          {users.length === 0 ? (
            <EmptyState />
          ) : (
            users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
