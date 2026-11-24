import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/slug";

const bodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  city: z.string().min(1),
  quartier: z.string().min(1),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

function makeRef() {
  return `KSM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    let subtotal = 0;
    const lines: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      unitPriceFcfa: number;
      productName: string;
      format: string;
    }> = [];

    for (const item of body.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      if (!product || !product.published) {
        return NextResponse.json(
          { error: "Un produit du panier est introuvable." },
          { status: 400 },
        );
      }
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : undefined;
      const stock = variant
        ? availableStock(variant.physicalStock, variant.reservedStock)
        : availableStock(product.physicalStock, product.reservedStock);
      if (stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour ${product.name} (disponible: ${stock}).`,
          },
          { status: 400 },
        );
      }
      const unit = variant?.priceFcfa ?? product.priceFcfa;
      subtotal += unit * item.quantity;
      lines.push({
        productId: product.id,
        variantId: variant?.id,
        quantity: item.quantity,
        unitPriceFcfa: unit,
        productName: product.name,
        format: variant?.format ?? product.format,
      });
    }

    const reference = makeRef();
    await prisma.orderRequest.create({
      data: {
        reference,
        customerName: body.name,
        phone: body.phone,
        city: body.city,
        quartier: body.quartier,
        note: body.note || null,
        subtotalFcfa: subtotal,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            unitPriceFcfa: l.unitPriceFcfa,
            productName: l.productName,
            format: l.format,
          })),
        },
      },
    });

    return NextResponse.json({ reference });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Impossible d’enregistrer la demande." },
      { status: 400 },
    );
  }
}
