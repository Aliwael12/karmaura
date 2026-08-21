import { StoreProvider } from "@/context/store";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Overlays from "@/components/Overlays";
import Tracker from "@/components/Tracker";
import { ArtDefs } from "@/components/ObjectArt";

/**
 * The shop's chrome. Everything a customer sees hangs off this; /admin sits
 * outside the group and so inherits none of it.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ArtDefs />
      <Tracker />
      <div className="km-shell flex min-h-screen flex-col bg-forest">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Overlays />
    </StoreProvider>
  );
}
