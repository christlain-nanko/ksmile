/**
 * Sync admin account from env (safe to run on every container start).
 * Does not touch products/categories.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

if (!email || !password) {
  console.error("[ksmile] ADMIN_EMAIL et ADMIN_PASSWORD sont requis.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Administrateur Ksmile" },
    create: {
      email,
      name: "Administrateur Ksmile",
      passwordHash,
    },
  });
  console.log(`[ksmile] Admin OK: ${admin.email}`);
} finally {
  await prisma.$disconnect();
}
