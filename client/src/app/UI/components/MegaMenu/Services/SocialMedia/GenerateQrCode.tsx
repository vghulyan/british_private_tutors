import React, { useState } from "react";

import { QrCode } from "@/state/dataTypes/interfaces";
import {
  useDeleteQrCodeMutation,
  useGenerateQrCodeMutation,
  useGetAllQrCodesQuery,
} from "@/state/store/admin/adminApi";

const GenerateQrCode = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [generateQrCode] = useGenerateQrCodeMutation();
  const { data: qrCodesResponse, isLoading, refetch } = useGetAllQrCodesQuery();
  const [deleteQrCode] = useDeleteQrCodeMutation();

  const handleSubmit = async () => {
    await generateQrCode({ name, url });
    setName("");
    setUrl("");
    refetch();
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this QR code?");
    if (confirmed) {
      await deleteQrCode(id);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Generate QR Code Form */}
      <div>
        <h1>Generate QR Code</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 rounded mb-2"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="border p-2 rounded mb-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Generate
        </button>
      </div>

      {/* List of Generated QR Codes */}
      <div>
        <h1>Generated QR Codes</h1>
        <ul className="space-y-4">
          {isLoading && <p>Loading...</p>}
          {qrCodesResponse?.result?.qrcodes &&
            qrCodesResponse.result.qrcodes.map((qr: QrCode) => (
              <li
                key={qr.id}
                className="flex items-center justify-between border p-4 rounded"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={qr.qrCodeImage}
                    alt={qr.name}
                    className="w-32 h-32"
                  />
                  <div>
                    <p className="font-bold">{qr.name}</p>
                    <p>{qr.url}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(qr.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default GenerateQrCode;
