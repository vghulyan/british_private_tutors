"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdminRegisterNewUserMutation,
  useGetAllUsersQuery,
  useSoftDeleteUserMutation,
} from "@/state/store/admin/adminApi";
import ModeratorTable from "./helper/ModeratorsTable";
import { User } from "@/state/dataTypes/interfaces";
import ModeratorCard from "./helper/ModeratorCard"; // New card component for viewing moderator details

// Validation schema
const adminRegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  role: z.enum(["MODERATOR"], { required_error: "Role is required" }),
});

type AdminFormData = z.infer<typeof adminRegisterSchema>;

const AdminRegisterNewUser: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const [registerNewUser] = useAdminRegisterNewUserMutation();
  const [deleteUser] = useSoftDeleteUserMutation();
  const { data: allUsers, isLoading, isError } = useGetAllUsersQuery();
  const moderators =
    allUsers?.filter((user) => user.role === "MODERATOR") || [];
  // console.log("moderators: ", moderators);
  const [selectedModerator, setSelectedModerator] = useState<User | null>(null);

  const onSubmit = async (data: AdminFormData) => {
    try {
      await registerNewUser(data).unwrap();
      alert("Moderator registered successfully!");
    } catch (error: any) {
      alert(`Error: ${error.data?.message || "Failed to register moderator."}`);
    }
  };

  const handleViewModerator = (moderator: User) => {
    console.log("handle view moderator ", moderator);
    setSelectedModerator(moderator);
  };

  const handleDeleteModerator = async (moderatorId: string) => {
    console.log("Deleting moderator with ID:", moderatorId);
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(moderatorId).unwrap();
    }
    // Implement your logic for deleting the moderator
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 w-full">
      {/* Registration Form */}
      <div className="lg:w-[20%] bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Register Moderator
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter email"
              className={`w-full p-2 border rounded ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Enter password"
              className={`w-full p-2 border rounded ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              {...register("firstName")}
              placeholder="Enter first name"
              className={`w-full p-2 border rounded ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName")}
              placeholder="Enter last name"
              className={`w-full p-2 border rounded ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              {...register("role")}
              className={`w-full p-2 border rounded ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              defaultValue="MODERATOR"
            >
              <option value="MODERATOR">Moderator</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      {/* Moderators Table */}
      <div className="lg:w-[50%] bg-white shadow-md rounded-md">
        <ModeratorTable
          data={moderators}
          isLoading={isLoading}
          isError={isError}
          onViewModerator={handleViewModerator}
          onDeleteModerator={handleDeleteModerator}
        />
      </div>

      {/* Moderator Details */}
      <div className="lg:w-[30%] bg-white shadow-md rounded-md">
        {selectedModerator ? (
          <ModeratorCard moderator={selectedModerator} />
        ) : (
          <p className="text-gray-600">Select a moderator to view details.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRegisterNewUser;
