/**
 * prisma/seed.ts
 *
 * To run this file:
 *   npx prisma db seed
 * (assuming your package.json is set up for seeding).
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import * as bcrypt from "bcrypt";
import {
  PrismaClient,
  UserRole,
  PhoneType,
  AddressType,
  EmployeeStatus,
  Gender,
} from "@prisma/client";

const prisma = new PrismaClient();

console.log("NODE_ENV: (seed)", process.env.NODE_ENV);

const currentEnv = process.env.NODE_ENV || "development";

// Map NODE_ENV to the corresponding .env file
const envFileMap: Record<string, string> = {
  production: ".env.production",
  staging: ".env.staging",
  development: ".env.development",
};

// Resolve the correct .env file based on the current environment
const envFilePath = path.resolve(__dirname, "../../", envFileMap[currentEnv]);
console.log("\n\nenvFilePath --> ", envFilePath);
// Load the environment file
dotenv.config({ path: envFilePath });

interface SeedPhoneNumber {
  fullNumber: string;
  type?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
}

interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  role: UserRole; // ADMIN, MODERATOR, EMPLOYER, EMPLOYEE
  isEmailVerified?: boolean;
  notes?: string | null;
  phoneNumbers?: SeedPhoneNumber[];
}

interface SeedEmployee {
  userEmail: string;
  dob: string;
  gender: Gender;
  status: EmployeeStatus;
}

interface SeedAddress {
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zipCode: string;
  country: string;
  userEmail: string;
  type: AddressType;
}

interface SeedCountry {
  name: string;
  code: string;
  dialingCode: string;
}

interface SeedAdmin {
  userEmail: string;
}

interface SeedModerator {
  userEmail: string;
}

async function clearDatabase() {
  console.log("Clearing existing data...");

  await prisma.phoneNumber.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.moderator.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.country.deleteMany({});
  await prisma.errorLog.deleteMany({});

  console.log("Existing data cleared!");
}

async function seedCountries(countries: SeedCountry[]) {
  for (const country of countries) {
    await prisma.country.create({
      data: country,
    });
    console.log(`Seeded country: ${country.name}`);
  }
}

async function seedAddresses(addresses: SeedAddress[]) {
  for (const address of addresses) {
    const user = await prisma.user.findUnique({
      where: { email: address.userEmail },
    });

    if (user) {
      await prisma.address.create({
        data: {
          address1: address.address1,
          address2: address.address2 ?? undefined,
          city: address.city,
          region: address.region,
          zipCode: address.zipCode,
          type: address.type,
          country: { connect: { name: address.country } },
          user: { connect: { id: user.id } },
        },
      });
      console.log(`Seeded address for user: ${address.userEmail}`);
    }
  }
}

async function seedEmployees(employees: SeedEmployee[]) {
  for (const employee of employees) {
    const user = await prisma.user.findUnique({
      where: { email: employee.userEmail },
    });

    if (user) {
      await prisma.employee.create({
        data: {
          dob: new Date(employee.dob),
          gender: employee.gender,
          status: employee.status,
          user: { connect: { id: user.id } },
        },
      });
      console.log(`Seeded employee: ${employee.userEmail}`);
    }
  }
}

async function seedAdmin(admin: SeedAdmin) {
  const user = await prisma.user.findUnique({
    where: { email: admin.userEmail },
  });

  if (user) {
    await prisma.admin.create({
      data: {
        user: { connect: { id: user.id } },
      },
    });
    console.log(`Seeded admin: ${admin.userEmail}`);
  }
}

async function seedModerators(moderators: SeedModerator[]) {
  for (const moderator of moderators) {
    const user = await prisma.user.findUnique({
      where: { email: moderator.userEmail },
    });

    if (user) {
      await prisma.moderator.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
      console.log(`Seeded moderator: ${moderator.userEmail}`);
    }
  }
}

async function main() {
  await clearDatabase(); // Clear all tables

  // Load the JSON file
  const seedPath = path.join(__dirname, "..", "seed.json");
  console.log("seedPath", seedPath);
  const rawData = fs.readFileSync(seedPath, "utf-8");
  const data = JSON.parse(rawData);

  // Seed countries
  await seedCountries(data.countries);

  // Process Users
  const seedUsers = data.users as SeedUser[];
  for (const seedUser of seedUsers) {
    const hashedPassword = await bcrypt.hash(seedUser.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: seedUser.email,
        password: hashedPassword,
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        title: seedUser.title,
        role: seedUser.role,
        isEmailVerified: seedUser.isEmailVerified ?? false,
        notes: seedUser.notes ?? undefined,
      },
    });

    console.log(`Created user: ${createdUser.email}`);

    if (seedUser.phoneNumbers && seedUser.phoneNumbers.length > 0) {
      for (const pn of seedUser.phoneNumbers) {
        await prisma.phoneNumber.create({
          data: {
            fullNumber: pn.fullNumber,
            type: pn.type as PhoneType,
            isPrimary: pn.isPrimary ?? false,
            isVerified: pn.isVerified ?? false,
            userId: createdUser.id,
          },
        });
      }
    }
  }

  // Seed addresses
  await seedAddresses(data.addresses);

  // Seed employees
  await seedEmployees(data.employees);

  // Seed admin
  await seedAdmin(data.admin);

  // Seed moderators
  await seedModerators(data.moderators);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
