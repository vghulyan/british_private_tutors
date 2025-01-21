import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useAppDispatch } from "@/state/store/redux";
import { useUpdateUserMutation } from "@/state/store/user/userApi";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { selectMenuItem } from "@/state/store/global";
import { useNavigateToDashboard } from "@/hooks/useNavigateToDashboard";

const UpdateUserPage = () => {
  const navigateToDashboard = useNavigateToDashboard();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile, isSuccess, isError } = useProfile();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    notes: "",
  });
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    notes: "",
  });

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  // Pre-fill the input fields with profile data once it's available
  useEffect(() => {
    if (isSuccess && profile?.user) {
      const userData = {
        firstName: profile.user.firstName || "",
        lastName: profile.user.lastName || "",
        title: profile.user.title || "",
        notes: profile.user.notes || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [isSuccess, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize each input before sending to the backend
    const sanitizedData = {
      firstName: DOMPurify.sanitize(formData.firstName),
      lastName: DOMPurify.sanitize(formData.lastName),
      title: DOMPurify.sanitize(formData.title),
      notes: DOMPurify.sanitize(formData.notes),
    };

    await updateUser(sanitizedData).unwrap();
    navigateToDashboard();
  };

  const cancelUpdateHandler = () => {
    setFormData(originalData);
    navigateToDashboard();
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/3"
      >
        <h2 className="text-lg font-bold mb-4">Update User</h2>
        <label className="block mb-2">
          First Name:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </label>
        <label className="block mb-2">
          Last Name:
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </label>
        <label className="block mb-2">
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </label>
        <label className="block mb-2">
          Notes:
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </label>

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 px-4 py-2 rounded-md text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={cancelUpdateHandler}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserPage;
