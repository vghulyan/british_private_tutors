import { EmployeeStatus, Gender, SeverityLevel } from "@prisma/client";
import { Response } from "express";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";

// const prisma = new PrismaClient();
import { extractErrorDetails, logError } from "../utils/errorLogService";
import prisma from "../utils/prisma";

export const getEmployeeProfile = async (
  req: AuthRequest, // AuthRequest contains user info from JWT
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId; // Extract userId from the authenticated request

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    // Fetch the employee associated with the authenticated user and ensure the user is not deleted
    const employeeProfile = await prisma.employee.findFirst({
      where: {
        userId,
        user: {
          isDeleted: false, // Ensure the user is not marked as deleted
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            addresses: true, // Include the addresses via the user relation
            twoFactorEnabled: true,
          },
        },
      },
    });

    if (!employeeProfile) {
      sendResponse(res, 404, STATUS.ERROR, "Employee not found.");
      return;
    }
    // console.log("employee: ", JSON.stringify(employeeProfile, null, 2));

    // If employee is found, return the profile
    sendResponse(res, 200, STATUS.SUCCESS, "Employee profile found.", {
      employeeProfile,
    });
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_EMPLOYEE_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });

    if (error instanceof Error) {
      console.error("Error fetching employee profile:", {
        message: error.message,
        stack: error.stack,
      });
      sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
      return;
    } else {
      console.error("Unknown error occurred");
      sendResponse(res, 500, STATUS.ERROR, "Unknown error occurred.");
      return;
    }
  }
};

// createEmployee: Register a new employee with detailed profiles.
export const createEmployee = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // Extract userId from the authenticated request

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  try {
    // Verify the user exists and has the EMPLOYEE role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "EMPLOYEE") {
      sendResponse(
        res,
        403,
        STATUS.ERROR,
        "User does not have the required role."
      );
      return;
    }

    // Check if the employee already exists for the current user
    const existingEmployee = await prisma.employee.findFirst({
      where: { userId },
    });

    if (existingEmployee) {
      sendResponse(
        res,
        409,
        STATUS.ERROR,
        "Employee already exists for this user."
      );
      return;
    }

    const { dob, gender, status } = req.body;

    // Create Employee, linked to the userId
    const employee = await prisma.employee.create({
      data: {
        dob: new Date(dob),
        gender: gender as Gender,
        status: status as EmployeeStatus,
        userId, // Linking employee to the user via userId
      },
    });

    sendResponse(res, 201, STATUS.SUCCESS, "Employee created successfully", {
      employee,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "CREATE_EMPLOYEE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error creating employee:", {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : "",
    });
    sendResponse(res, 500, STATUS.ERROR, "Internal server error");
    return;
  }
};

// Suggested
// PUT
// src/controllers/employeeController.ts
export const editProfile = async (req: AuthRequest, res: Response) => {
  console.log("edit profile.");
  const userId = req.user?.userId; // Extract userId from the authenticated request

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  try {
    // Verify the user exists and has the EMPLOYEE role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "EMPLOYEE") {
      sendResponse(
        res,
        403,
        STATUS.ERROR,
        "User does not have the required role."
      );
      return;
    }

    const { firstName, lastName, dob, gender, status, notes } = req.body;

    // Check if the employee exists and their associated user is not deleted
    const employee = await prisma.employee.findFirst({
      where: {
        userId: userId,
        isDeleted: false, // Ensure the employee is not deleted
        user: {
          isDeleted: false, // Ensure the associated user is not deleted
        },
      },
      include: {
        user: true,
      },
    });

    if (!employee) {
      sendResponse(
        res,
        404,
        STATUS.ERROR,
        "Employee not found or user is deleted."
      );
      return;
    }

    // Update the user details if provided
    await prisma.user.update({
      where: { id: employee.userId },
      data: {
        firstName: firstName || employee.user.firstName,
        lastName: lastName || employee.user.lastName,
        notes: notes || employee.user.notes,
      },
    });

    // Update Employee-specific fields
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        dob: dob ? new Date(dob) : employee.dob,
        gender: gender || employee.gender,
        status: status || employee.status,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Employee updated successfully", {
      employee,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "EDIT_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    if (error instanceof Error) {
      console.error("Error editing employee:", {
        message: error.message,
        stack: error.stack,
      });
      sendResponse(res, 500, STATUS.ERROR, "Internal server error");
      return;
    } else {
      sendResponse(res, 500, STATUS.ERROR, "Unknown error occurred");
      return;
    }
  }
};

// Suggested
// Delete
export const removeEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    // Check if employee exists and is not already deleted using the userId
    const employee = await prisma.employee.findFirst({
      where: { userId }, // Find employee by userId
      include: { user: true }, // To fetch associated user details
    });

    if (!employee || employee.isDeleted) {
      sendResponse(
        res,
        404,
        STATUS.ERROR,
        "Employee not found or already deleted."
      );
      return;
    }

    // Soft delete the employee
    await prisma.employee.update({
      where: { id: employee.id }, // Using employee.id since it's the primary key
      data: { isDeleted: true },
    });

    // Soft delete the related user (set isDeleted to true)
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Employee removed successfully (soft deleted)."
    );
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "REMOVE_EMPLOYEE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error removing employee:", error);

    sendResponse(res, 500, STATUS.ERROR, "Internal server error");
    return;
  }
};

// GET
// SEARCH EMPLOYEE - FILTER
export const searchEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, gender, status } = req.query;

    const filters: any = {
      isDeleted: false,
    };

    if (firstName) {
      filters.user = {
        ...filters.user,
        firstName: {
          contains: String(firstName),
          mode: "insensitive",
        },
      };
    }

    if (lastName) {
      filters.user = {
        ...filters.user,
        lastName: {
          contains: String(lastName),
          mode: "insensitive",
        },
      };
    }

    if (gender && Object.values(Gender).includes(gender as Gender)) {
      filters.gender = gender as Gender;
    }

    if (
      status &&
      Object.values(EmployeeStatus).includes(status as EmployeeStatus)
    ) {
      filters.status = status as EmployeeStatus;
    }

    const employees = await prisma.employee.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Employees fetched successfully.", {
      employees,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "SEARCH_EMPLOYEES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error searching employees:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};
