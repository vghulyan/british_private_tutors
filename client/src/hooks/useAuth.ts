// src/hooks/useAuth.ts

import { useSelector } from "react-redux";
import { RootState } from "../state/store/redux";
import { selectAuth } from "@/state/store/auth/authSlice";

export const useAuth = () => {
  const auth = useSelector(selectAuth);
  return auth;
};
