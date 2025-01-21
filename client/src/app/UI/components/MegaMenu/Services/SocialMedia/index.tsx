"use client";

import React, { useState } from "react";

import GenerateQrCode from "./GenerateQrCode";

const TABS = [
  {
    label: "Generate QR Code",
    component: <GenerateQrCode />,
  },
];

const SocialAccounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-0 md:p-1 lg:p-2 xl:p-4">
      {/* Tabs Navigation */}
      <div className="border-b p-0 md:p-1 lg:p-2 xl:p-4">
        <ul className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start overflow-x-auto">
          {TABS.map((tab, index) => (
            <li
              key={index}
              className={`cursor-pointer pb-2 px-3 text-sm sm:text-base rounded-md ${
                activeTab === index
                  ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Active Tab Content */}
      <div className="bg-white shadow-sm rounded-md p-1 md:p-2 lg:p-3 xl:p-4">
        {TABS[activeTab].component}
      </div>
    </div>
  );
};

export default SocialAccounts;
