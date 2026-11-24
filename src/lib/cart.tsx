"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "ksmile-cart-v2";

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    variantId?: string,
  ) => void;
  setQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  itemCount: number;
  subtotalFcfa: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? "default"}`;
}

function snapshot(
  product: Product,
  variantId?: string,
): Omit<CartItem, "productId" | "variantId" | "quantity"> {
  const variant = product.variants?.find((v) => v.id === variantId);
  return {
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    format: variant?.format ?? product.format,
    priceFcfa: variant?.priceFcfa ?? product.priceFcfa,
    stockAvailable: variant?.stockAvailable ?? product.stockAvailable,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (product: Product, quantity = 1, variantId?: string) => {
      const snap = snapshot(product, variantId);
      setItems((prev) => {
        const key = itemKey(product.id, variantId);
        const existing = prev.find(
          (i) => itemKey(i.productId, i.variantId) === key,
        );
        if (existing) {
          return prev.map((i) =>
            itemKey(i.productId, i.variantId) === key
              ? { ...i, ...snap, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [
          ...prev,
          { productId: product.id, variantId, quantity, ...snap },
        ];
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      setItems((prev) => {
        const key = itemKey(productId, variantId);
        if (quantity <= 0) {
          return prev.filter((i) => itemKey(i.productId, i.variantId) !== key);
        }
        return prev.map((i) =>
          itemKey(i.productId, i.variantId) === key ? { ...i, quantity } : i,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = itemKey(productId, variantId);
    setItems((prev) =>
      prev.filter((i) => itemKey(i.productId, i.variantId) !== key),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { itemCount, subtotalFcfa } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      count += item.quantity;
      subtotal += item.priceFcfa * item.quantity;
    }
    return { itemCount: count, subtotalFcfa: subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
      itemCount,
      subtotalFcfa,
    }),
    [
      items,
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
      itemCount,
      subtotalFcfa,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
