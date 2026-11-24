import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HowItWorksStrip } from "@/components/layout/HowItWorksStrip";
import { CartProvider } from "@/lib/cart";
import { getNavCategories } from "@/lib/catalog";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const universes = await getNavCategories();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header universes={universes} />
        <HowItWorksStrip />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
