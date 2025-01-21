// components/SkipNavigation.tsx

import React from "react";

const SkipNavigation = () => {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only bg-blue-500 text-white p-2 rounded-md"
    >
      Skip to Content
    </a>
  );
};

export default SkipNavigation;
