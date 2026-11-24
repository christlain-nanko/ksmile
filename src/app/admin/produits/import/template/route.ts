import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { templateToBuffer } from "@/lib/product-import";

export const instant = false;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const buffer = templateToBuffer(
    categories.map((c) => ({ label: c.name, slug: c.slug })),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="ksmile-modele-produits.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
