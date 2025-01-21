"use client";

import React, { useState, useEffect } from "react";

import {
  useSoftDeleteUserMutation,
  useGetAllUsersQuery,
} from "@/state/store/admin/adminApi";
import Table from "../../../Table";

interface TableUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  status: string;
}

export default function UsersPage() {
  const [deleteUser] = useSoftDeleteUserMutation();
  const { data: users, isLoading, isError, error } = useGetAllUsersQuery();
  const [tableData, setTableData] = useState<TableUser[]>([]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id).unwrap();
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      filterable: true,
    },
    {
      key: "isEmailVerified",
      label: "Email Verified",
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`py-1 px-2 rounded text-xs ${
            value ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <div
          className={`py-1.5 px-2.5 rounded-full flex justify-center w-20 items-center gap-1 ${
            value === "Active" ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          <span
            className={`font-medium text-xs ${
              value === "Active" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      render: (_value: unknown, row: TableUser) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (users) {
      const formattedUsers = users.map((user) => ({
        id: user.id,
        fullName: `${user.title || ""} ${user.firstName} ${
          user.lastName
        }`.trim(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        status: user.isDeleted ? "Inactive" : "Active",
      }));
      setTableData(formattedUsers);
    }
  }, [users]);

  if (isLoading) return <p>Loading...</p>;

  if (isError) {
    const errorMessage =
      "status" in error && error.status
        ? `Error: ${error.status}`
        : "Something went wrong.";
    return <p>{errorMessage}</p>;
  }

  return (
    <div className="w-full mb-4 md:mb-3 lg:mb-2 xl:mb-0">
      <h1 className="text-2xl font-semibold mb-4">All Users</h1>
      <Table
        columns={columns}
        data={tableData || []} // Ensure data is always an array
        initialPageSize={10}
        showGlobalFilter={true}
      />
    </div>
  );
}
