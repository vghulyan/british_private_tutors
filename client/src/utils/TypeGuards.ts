import { UserRole } from "@/state/dataTypes/enums";
import { Admin, Moderator, Employee } from "@/state/dataTypes/interfaces";

export function isEmployee(
  profile: Admin | Employee | Moderator
): profile is Employee {
  return (profile as Employee).dob !== undefined;
}

export function isModerator(
  profile: Admin | Employee | Moderator
): profile is Moderator {
  return (profile as Moderator).userId !== undefined;
}

export function isAdminr(
  profile: Admin | Employee | Moderator
): profile is Admin {
  return (profile as Admin).userId !== undefined;
}

export function isValidRole(
  role: UserRole | null
): role is UserRole.ADMIN | UserRole.MODERATOR | UserRole.EMPLOYEE {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.MODERATOR ||
    role === UserRole.EMPLOYEE
  );
}
