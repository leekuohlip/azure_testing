import "dotenv/config";
import { PrismaClient, AuthProvider } from "@prisma/client";
import { hash } from "crypto";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "test" || process.env.SEED_DISABLE === "1") {
    console.log("Seeding disabled for test/CI.");
    return;
  }

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" }
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" }
  });

  console.log("Seeded roles:", adminRole.name, userRole.name);

  // Hash password before creating user
  const password = "zxczxc";  // Replace with desired initial password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create admin user with admin role
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: hashedPassword,
      profile: { create: { fullName: "Admin One" } },
      accounts: { create: { provider: AuthProvider.GOOGLE, providerAccountId: "sample" } },
      roles: { create: { roleId: adminRole.id } }
    }
  });

  console.log("Seeded admin user:", admin.email);
}

main().finally(() => prisma.$disconnect());
