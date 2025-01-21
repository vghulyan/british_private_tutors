// export default EmailTemplateManager;
"use client";

import { EmailTemplate } from "@/state/dataTypes/interfaces";
import React, { useState } from "react";

import {
  useCreateEmailTemplateMutation,
  useGetEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
} from "@/state/store/admin/adminApi";
import Table from "../../../Table";

const EmailTemplateManager: React.FC = () => {
  // const templates = useAppSelector(selectedEmailTemplates);
  const { data: templates, isLoading } = useGetEmailTemplatesQuery();

  const [createTemplate] = useCreateEmailTemplateMutation();
  const [updateTemplate] = useUpdateEmailTemplateMutation();

  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [formState, setFormState] = useState<Partial<EmailTemplate>>({});
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormState(template); // Populate fields with selected template data
    setIsEditing(false); // Ensure it's not in edit mode when first selected
  };

  const handleCreateNewTemplate = () => {
    setFormState({});
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleInputChange = (key: keyof EmailTemplate, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (isEditing && formState.id) {
        await updateTemplate(formState).unwrap();
      } else {
        await createTemplate(formState).unwrap();
      }
      setFormState({});
      setSelectedTemplate(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleCancel = () => {
    setFormState({});
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  // Columns for Table
  const columns = [
    {
      key: "name",
      label: "Template Name",
      sortable: true,
      filterable: true,
      render: (value: string, row: EmailTemplate) => (
        <span
          onClick={() => handleSelectTemplate(row)}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_value: unknown, row: EmailTemplate) => (
        <button
          onClick={() => handleSelectTemplate(row)}
          className="text-indigo-600 hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  // Table data
  const tableData = templates?.result?.templates?.map((template) => ({
    id: template.id,
    name: template.name,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    updatedAt: template.updatedAt,
  }));

  return (
    <div className="p-0 md:p-1 lg:p-2 xl:p-4">
      <h1 className="text-xl font-bold mb-4">Email Template Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Templates List */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Templates</h2>
            {!isEditing && (
              <button
                onClick={handleCreateNewTemplate}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                New Template
              </button>
            )}
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto w-full border rounded-lg shadow-md bg-white">
              <Table
                columns={columns}
                data={tableData || []}
                initialPageSize={5}
                showGlobalFilter={false}
              />
            </div>
          )}
        </div>

        {/* Template Details */}
        <div>
          {selectedTemplate || isEditing ? (
            <div className="p-4 mb-4 border-2 border-gray-500 rounded-lg shadow-md hover:border-purple-700 transition duration-300 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold mb-2">
                  {isEditing && !formState.id
                    ? "New Template"
                    : "Template Details"}
                </h2>
                <button
                  onClick={toggleEditMode}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  {isEditing ? "Switch to Read" : "Edit"}
                </button>
              </div>
              <div className="space-y-2">
                <label>
                  Name:
                  <input
                    type="text"
                    placeholder="e.g. verification_email"
                    value={formState.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={!isEditing}
                  />
                </label>
                <label>
                  Subject:
                  <input
                    type="text"
                    placeholder="e.g. Verify Your Email Address"
                    value={formState.subject || ""}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    className="w-full border p-2 rounded"
                    disabled={!isEditing}
                  />
                </label>
                <label>
                  HTML Content:
                  <textarea
                    value={formState.htmlContent || ""}
                    rows={10}
                    onChange={(e) =>
                      handleInputChange("htmlContent", e.target.value)
                    }
                    className="w-full border p-2 rounded"
                    disabled={!isEditing}
                  />
                </label>
                <label>
                  Text Content:
                  <textarea
                    value={formState.textContent || ""}
                    rows={10}
                    onChange={(e) =>
                      handleInputChange("textContent", e.target.value)
                    }
                    className="w-full border p-2 rounded"
                    disabled={!isEditing}
                  />
                </label>
              </div>
              <div className="flex space-x-2 mt-4">
                {isEditing && (
                  <>
                    <button
                      onClick={handleCreateOrUpdate}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      {formState.id ? "Update" : "Create"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p>Select a template to view details or create a new template.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
