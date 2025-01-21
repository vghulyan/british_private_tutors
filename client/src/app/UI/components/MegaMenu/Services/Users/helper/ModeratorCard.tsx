import React from "react";
import { User } from "@/state/dataTypes/interfaces";

interface ModeratorCardProps {
  moderator: User;
}

const ModeratorCard: React.FC<{ moderator?: User }> = ({ moderator }) => {
  if (!moderator) {
    return <p className="text-gray-600">No moderator selected.</p>;
  }
  console.log("selectedModerator", moderator);
  return (
    <div className="bg-white shadow-md rounded-md p-4 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Moderator Details
      </h2>

      {/* Profile Picture */}
      {/* {moderator.avatarUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={moderator.avatarUrl}
            alt={`${moderator.firstName} ${moderator.lastName}`}
            className="w-24 h-24 rounded-full border border-gray-300"
          />
        </div>
      )} */}

      {/* Basic Details */}
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          <span className="font-bold">Name:</span> {moderator.firstName}{" "}
          {moderator.lastName}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-bold">Email:</span> {moderator.email}
        </p>
        {moderator.title && (
          <p className="text-sm text-gray-700">
            <span className="font-bold">Title:</span> {moderator.title}
          </p>
        )}
        <p className="text-sm text-gray-700">
          <span className="font-bold">Role:</span> {moderator.role}
        </p>
      </div>

      {/* Additional Information */}
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-700">
          <span className="font-bold">Created At:</span>{" "}
          {new Date(moderator.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-bold">Updated At:</span>{" "}
          {new Date(moderator.updatedAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-bold">Email Verified:</span>{" "}
          {moderator.isEmailVerified ? "Yes" : "No"}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-bold">Two-Factor Enabled:</span>{" "}
          {moderator.twoFactorEnabled ? "Yes" : "No"}
        </p>
      </div>

      {/* Phone Numbers */}
      {moderator.phoneNumbers && moderator.phoneNumbers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Phone Numbers:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {moderator.phoneNumbers.map((phone, index) => (
              <li key={index}>{phone.fullNumber}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Addresses */}
      {moderator.addresses && moderator.addresses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Addresses:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {moderator.addresses.map((address, index) => (
              <li key={index}>
                {address.address1}, {address.city}, {address.region},{" "}
                {address.zipCode}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notifications */}
      {moderator.notifications && moderator.notifications.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Notifications:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {moderator.notifications?.map((notification, index) => (
              <li key={index}>{notification.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModeratorCard;
