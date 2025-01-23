import { MegaMenuProps, MenuItem } from "@/state/dataTypes/interfaces";
import { useAppDispatch } from "@/state/store/redux";
import { selectMenuItem, SerializableMenuItem } from "@/state/store/global";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const MegaMenu: React.FC<MegaMenuProps> = ({ menuData, userRole }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    const { icon, ...serializableItem } = item;
    dispatch(selectMenuItem(serializableItem as SerializableMenuItem));
    setIsOpen(false);
    router.push("/dashboard");
  };

  const filteredMenuData = menuData
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles ? item.roles.includes(userRole) : true
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className="relative">
      {/* Trigger Button */}
      <button
        className="text-gray-500 font-medium hover:text-indigo-700 transition-all flex items-center"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center">
          <Menu className="mr-2" />
          Menu
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          className="
            absolute top-full left-1/2 transform -translate-x-1/2
            mt-2 bg-white shadow-lg rounded-lg
            w-[90vw] max-w-4xl
            z-50
            px-6 py-4
          "
        >
          {/* Responsive Grid */}
          <div
            className={`grid gap-6 p-4 ${
              filteredMenuData.length === 1
                ? "grid-cols-1"
                : filteredMenuData.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : filteredMenuData.length === 3
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {filteredMenuData.map((group, index) => (
              <div key={index} className="flex flex-col space-y-4">
                {/* Group Heading */}
                <div className="flex items-center space-x-2">
                  {group.icon && <span className="text-lg">{group.icon}</span>}
                  <h6 className="font-semibold text-gray-600">
                    {group.heading}
                  </h6>
                </div>

                {/* Items */}
                <ul className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button
                        onClick={() => handleItemClick(item)}
                        className="flex items-center w-full px-4 py-2 hover:bg-gray-100 rounded-md transition-all"
                      >
                        {item.icon && (
                          <span className="mr-3 text-lg flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        <div className="text-left">
                          <h5 className="font-semibold text-gray-800">
                            {item.title}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MegaMenu;
