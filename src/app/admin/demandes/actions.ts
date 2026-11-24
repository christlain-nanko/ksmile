"use server";

import { revalidatePath } from "next/cache";
import type { Prisma, RequestStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { availableStock } from "@/lib/slug";

type Tx = Prisma.TransactionClient;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user;
}

async function reserveStock(tx: Tx, requestId: string, adminId: string) {
  const request = await tx.orderRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { items: true },
  });

  for (const item of request.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: item.variantId },
      });
      const avail = availableStock(variant.physicalStock, variant.reservedStock);
      if (avail < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${item.productName} (dispo: ${avail}).`,
        );
      }
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { reservedStock: variant.reservedStock + item.quantity },
      });
    } else {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: item.productId },
      });
      const avail = availableStock(product.physicalStock, product.reservedStock);
      if (avail < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${item.productName} (dispo: ${avail}).`,
        );
      }
      await tx.product.update({
        where: { id: product.id },
        data: { reservedStock: product.reservedStock + item.quantity },
      });
    }

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "RESERVATION",
        quantity: item.quantity,
        reason: `Réservation demande ${request.reference}`,
        adminId,
      },
    });
  }
}

async function releaseStock(tx: Tx, requestId: string, adminId: string) {
  const request = await tx.orderRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { items: true },
  });

  for (const item of request.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: item.variantId },
      });
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          reservedStock: Math.max(0, variant.reservedStock - item.quantity),
        },
      });
    } else {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: item.productId },
      });
      await tx.product.update({
        where: { id: product.id },
        data: {
          reservedStock: Math.max(0, product.reservedStock - item.quantity),
        },
      });
    }

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "RELEASE",
        quantity: item.quantity,
        reason: `Libération demande ${request.reference}`,
        adminId,
      },
    });
  }
}

async function deliverStock(tx: Tx, requestId: string, adminId: string) {
  const request = await tx.orderRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { items: true },
  });

  for (const item of request.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: item.variantId },
      });
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          physicalStock: Math.max(0, variant.physicalStock - item.quantity),
          reservedStock: Math.max(0, variant.reservedStock - item.quantity),
        },
      });
    } else {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: item.productId },
      });
      await tx.product.update({
        where: { id: product.id },
        data: {
          physicalStock: Math.max(0, product.physicalStock - item.quantity),
          reservedStock: Math.max(0, product.reservedStock - item.quantity),
        },
      });
    }

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "SALE_DELIVERY",
        quantity: item.quantity,
        reason: `Livraison demande ${request.reference}`,
        adminId,
      },
    });
  }
}

export async function updateRequestStatus(
  requestId: string,
  nextStatus: RequestStatus,
) {
  const admin = await requireAdmin();
  const request = await prisma.orderRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  if (request.status === nextStatus) return;

  if (nextStatus === "CONFIRMED") {
    if (request.status !== "RECEIVED") {
      throw new Error("Seule une demande reçue peut être confirmée.");
    }
    await prisma.$transaction(async (tx) => {
      await reserveStock(tx, requestId, admin.id);
      await tx.orderRequest.update({
        where: { id: requestId },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          handledById: admin.id,
        },
      });
    });
  } else if (nextStatus === "CANCELLED") {
    if (request.status === "FULFILLED" || request.status === "CANCELLED") {
      throw new Error("Cette demande ne peut plus être annulée.");
    }
    await prisma.$transaction(async (tx) => {
      if (request.status === "CONFIRMED") {
        await releaseStock(tx, requestId, admin.id);
      }
      await tx.orderRequest.update({
        where: { id: requestId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          handledById: admin.id,
        },
      });
    });
  } else if (nextStatus === "FULFILLED") {
    if (request.status !== "CONFIRMED") {
      throw new Error("Confirmez la demande avant de la marquer livrée.");
    }
    await prisma.$transaction(async (tx) => {
      await deliverStock(tx, requestId, admin.id);
      await tx.orderRequest.update({
        where: { id: requestId },
        data: {
          status: "FULFILLED",
          fulfilledAt: new Date(),
          handledById: admin.id,
        },
      });
    });
  } else {
    throw new Error("Transition de statut non supportée.");
  }

  revalidateCatalog();
  revalidatePath("/admin");
  revalidatePath("/admin/demandes");
  revalidatePath("/admin/produits");
  revalidatePath("/");
  revalidatePath("/catalogue");
}
