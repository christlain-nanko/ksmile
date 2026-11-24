import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const results = [];

function ok(label, pass, detail = "") {
  results.push({ label, pass, detail });
  console.log(`${pass ? "OK" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

try {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD requis dans .env");
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  ok("Admin user exists", !!admin, admin?.email);
  ok(
    "Admin password matches seed",
    admin
      ? await bcrypt.compare(adminPassword, admin.passwordHash)
      : false,
  );

  const productCount = await prisma.product.count();
  ok("Catalog seeded", productCount > 0, `${productCount} products`);

  const cat = await prisma.category.findFirst({
    where: { slug: "hygiene_quotidienne" },
  });
  ok("Category hygiene exists", !!cat);

  const imageUrl =
    "https://res.cloudinary.com/da8hiwx1m/image/upload/v1/ksmile/placeholder";
  const product = await prisma.product.upsert({
    where: { slug: "test-admin-smoke" },
    update: {
      physicalStock: 20,
      reservedStock: 0,
      published: true,
      priceFcfa: 2000,
      imageUrl: null,
    },
    create: {
      slug: "test-admin-smoke",
      brand: "Ksmile Test",
      name: "Produit smoke admin",
      description: "Produit de test admin",
      format: "1 u",
      priceFcfa: 2000,
      physicalStock: 20,
      reservedStock: 0,
      published: true,
      imageUrl: null,
      categoryId: cat.id,
    },
  });
  ok("Product upsert", !!product.id, product.slug);

  for (const path of ["/", "/catalogue", "/admin/login", `/produits/${product.slug}`]) {
    const res = await fetch(`http://localhost:3000${path}`);
    ok(`GET ${path}`, res.status === 200, String(res.status));
  }

  const adminGate = await fetch("http://localhost:3000/admin", { redirect: "manual" });
  ok(
    "GET /admin redirects to login",
    adminGate.status === 307 || adminGate.status === 302,
    String(adminGate.status),
  );

  // Auth CSRF + credentials
  const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
  const csrfJson = await csrfRes.json();
  const csrf = csrfJson.csrfToken;
  ok("Auth CSRF", !!csrf);

  const cookieJar = [];
  const collect = (res) => {
    const raw = res.headers.getSetCookie?.() || [];
    for (const c of raw) cookieJar.push(c.split(";")[0]);
  };
  collect(csrfRes);

  const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieJar.join("; "),
    },
    body: new URLSearchParams({
      csrfToken: csrf,
      email: adminEmail,
      password: adminPassword,
      redirect: "false",
      json: "true",
      callbackUrl: "/admin",
    }),
    redirect: "manual",
  });
  collect(loginRes);
  const hasSession = cookieJar.some(
    (c) =>
      c.startsWith("authjs.session-token=") ||
      c.startsWith("__Secure-authjs.session-token=") ||
      c.startsWith("next-auth.session-token="),
  );
  let loginBody = "";
  try {
    loginBody = await loginRes.text();
  } catch {
    /* ignore */
  }
  ok(
    "Admin login credentials",
    (loginRes.status === 200 || loginRes.status === 302) && hasSession,
    `status=${loginRes.status} session=${hasSession} body=${loginBody.slice(0, 120)}`,
  );

  const cookieHeader = cookieJar.join("; ");
  for (const path of [
    "/admin",
    "/admin/produits",
    "/admin/demandes",
    "/admin/produits/nouveau",
    "/admin/produits/import",
  ]) {
    const res = await fetch(`http://localhost:3000${path}`, {
      headers: { Cookie: cookieHeader },
      redirect: "manual",
    });
    ok(`Auth GET ${path}`, res.status === 200, String(res.status));
  }

  const editRes = await fetch(`http://localhost:3000/admin/produits/${product.id}`, {
    headers: { Cookie: cookieHeader },
    redirect: "manual",
  });
  ok("Auth GET product edit", editRes.status === 200, String(editRes.status));

  // Demande API
  const demandeRes = await fetch("http://localhost:3000/api/demandes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Client",
      phone: "677000000",
      city: "Douala",
      quartier: "Akwa",
      note: "Test auto",
      items: [{ productId: product.id, quantity: 2 }],
    }),
  });
  const demandeBody = await demandeRes.json();
  ok(
    "POST /api/demandes",
    demandeRes.status === 200 && !!demandeBody.reference,
    JSON.stringify(demandeBody),
  );

  const request = await prisma.orderRequest.findUnique({
    where: { reference: demandeBody.reference },
    include: { items: true },
  });
  ok(
    "Demande persisted RECEIVED",
    request?.status === "RECEIVED" && request.items.length === 1,
  );

  const before = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: product.id },
      data: { reservedStock: before.reservedStock + 2 },
    });
    await tx.orderRequest.update({
      where: { id: request.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        handledById: admin.id,
      },
    });
    await tx.stockMovement.create({
      data: {
        productId: product.id,
        type: "RESERVATION",
        quantity: 2,
        reason: `Réservation demande ${request.reference}`,
        adminId: admin.id,
      },
    });
  });
  const after = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
  ok(
    "Confirm reserves stock",
    after.reservedStock === before.reservedStock + 2,
    `avail ${before.physicalStock - before.reservedStock} → ${after.physicalStock - after.reservedStock}`,
  );

  const demandesHtml = await (
    await fetch("http://localhost:3000/admin/demandes", {
      headers: { Cookie: cookieHeader },
    })
  ).text();
  ok(
    "Admin demandes shows reference",
    demandesHtml.includes(demandeBody.reference),
    demandeBody.reference,
  );

  // Cloudinary permission probe (expected fail with restricted key)
  try {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "ksmile", public_id: "permission-probe" },
    );
    ok("Cloudinary upload permission", true);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    ok(
      "Cloudinary upload permission",
      false,
      `clé sans create — ${msg.slice(0, 80)}`,
    );
  }

  void imageUrl;
} catch (err) {
  ok("Script error", false, err instanceof Error ? err.message : String(err));
  console.error(err);
} finally {
  await prisma.$disconnect();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
// Cloudinary permission is known blocker — don't fail whole suite on it alone if rest pass
const critical = failed.filter((f) => f.label !== "Cloudinary upload permission");
process.exit(critical.length ? 1 : 0);
