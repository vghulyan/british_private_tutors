import React from "react";
import { LoaderPinwheel } from "lucide-react"; // Adjust this import if needed

interface LoadingMessageProps {
  label?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({
  label = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center space-y-2">
        <LoaderPinwheel className="animate-spin text-gray-500 h-10 w-10 mx-auto" />
        <div className="text-lg font-semibold text-gray-700">{label}</div>
      </div>
    </div>
  );
};

export default LoadingMessage;
