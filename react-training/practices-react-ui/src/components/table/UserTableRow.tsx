import type { User } from "@/types/user";

interface UserTableRowProps {
  user: User;
  index: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTableRow({
  user,
  index,
  onEdit,
  onDelete,
}: UserTableRowProps) {
  return (
    <tr className="table-row">
      <td>{index + 1}</td>
      <td>{user.email}</td>
      <td>{user.first_name}</td>
      <td>{user.last_name}</td>
      <td>{user.phone_number}</td>
      <td>
        <div className="table-actions">
          <button
            className="action-link"
            type="button"
            aria-label={`Edit ${user.email}`}
            onClick={() => onEdit(user)}
          >
            Edit
          </button>
          <button
            className="action-link action-link--danger"
            type="button"
            aria-label={`Delete ${user.email}`}
            onClick={() => onDelete(user)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
