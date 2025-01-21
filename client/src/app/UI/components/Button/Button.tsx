import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string; // For additional custom styling
  disabled?: boolean;
  children?: React.ReactNode;
}

/*
<div className="mt-2">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-indigo-900 rounded-full shadow-sm text-white text-xs font-semibold"
                  onClick={() => handleManageContract("view")}
                >
                  View Contract
                </button>
              </div>
            </div>
            */
/*
Default
<Button
  type="button"
  label="View Contract"
  onClick={() => handleManageContract("view")}
/>
<Button
  type="button"
  label="Terminate Contract"
  //onClick={() => handleManageContract("view")}
  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full shadow-sm text-slate-800 text-xs font-semibold"
/>

Reset
<Button
  type="button"
  label="Reset"
  // onClick={() => console.log("Button clicked")}
  className="bg-gray-500 text-white"
/>
*/
const Button: React.FC<ButtonProps> = ({
  type = "button",
  label,
  onClick,
  // className = "text-white bg-indigo-600 hover:bg-indigo-700",
  className = "px-4 py-2 bg-indigo-900 rounded-full shadow-sm text-white text-xs font-semibold",
  disabled = false,
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`transition duration-1000 ease-in-out transform hover:-translate-y-1 hover:scale-110 rounded-lg border border-indigo-600 whitespace-nowrap ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <>
        {label && <span>{label}</span>}
        {children && <span className="ml-2">{children}</span>}
      </>
    </button>
  );
};

export default Button;
