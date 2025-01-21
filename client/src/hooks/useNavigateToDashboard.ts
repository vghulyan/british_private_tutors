import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/state/store/redux";
import { selectMenuItem } from "@/state/store/global";

export const useNavigateToDashboard = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(() => {
    const menuItem = {
      title: "Dashboard",
      link: "/dashboard",
      componentPath: "MegaMenu/Dashboard/Dashboard",
      description: "Dashboard page.",
    };
    dispatch(selectMenuItem(menuItem));
    router.push("/dashboard");
  }, [dispatch, router]);
};
