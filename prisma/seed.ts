import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products as demoProducts, categories as demoCategories } from "../src/data/demo";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env");
  }
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

  for (const [index, cat] of demoCategories.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        shortName: cat.shortName,
        description: cat.description,
        sortOrder: index,
        inNav: cat.inNav,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        shortName: cat.shortName,
        description: cat.description,
        sortOrder: index,
        inNav: cat.inNav,
      },
    });
  }

  for (const p of demoProducts) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: p.category },
    });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        brand: p.brand,
        name: p.name,
        description: p.description,
        format: p.format,
        priceFcfa: p.priceFcfa,
        isNew: !!p.isNew,
        pack: !!p.pack,
        popular: !!p.popular,
        physicalStock: p.stockAvailable,
        reservedStock: 0,
        published: true,
        categoryId: category.id,
      },
      create: {
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        description: p.description,
        format: p.format,
        priceFcfa: p.priceFcfa,
        isNew: !!p.isNew,
        pack: !!p.pack,
        popular: !!p.popular,
        physicalStock: p.stockAvailable,
        reservedStock: 0,
        published: true,
        categoryId: category.id,
      },
    });

    if (p.variants?.length) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            label: v.label,
            format: v.format,
            priceFcfa: v.priceFcfa,
            physicalStock: v.stockAvailable,
            reservedStock: 0,
          },
        });
      }
    }
  }

  console.log("Seed OK");
  console.log(`Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
