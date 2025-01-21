import React from "react";
import { useGetAllUsersQuery } from "@/state/store/admin/adminApi"; // Adjust the path
import { User } from "@/state/dataTypes/interfaces";
import Table, { Column } from "@/app/UI/components/Table";

interface ModeratorTableProps {
  data: User[]; // Pass the filtered moderators directly
  isLoading: boolean; // Loading state from parent
  isError: boolean; // Error state from parent
  onViewModerator: (moderator: User) => void; // Callback for viewing a moderator
  onDeleteModerator: (moderatorId: string) => void; // Callback for deleting a moderator
}

const ModeratorTable: React.FC<ModeratorTableProps> = ({
  data,
  isLoading,
  isError,
  onViewModerator,
  onDeleteModerator,
}) => {
  const columns: Column[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: "firstName",
      label: "First Name",
      sortable: true,
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: "lastName",
      label: "Last Name",
      sortable: true,
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value: string) => <span>{value || "N/A"}</span>,
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_val: any, row: any) => {
        const moderator = row as User;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModerator(moderator)}
              className="text-blue-500 hover:text-blue-700"
            >
              View
            </button>
            <button
              onClick={() => onDeleteModerator(moderator.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load moderators.</p>;

  return (
    <div className="p-0">
      <h2 className="text-lg font-semibold mb-4">Moderators</h2>
      <Table
        columns={columns}
        data={data}
        initialPageSize={5}
        showGlobalFilter={false}
        getRowProps={(row) => ({
          className: "hover:bg-gray-100",
        })}
      />
    </div>
  );
};

export default ModeratorTable;
