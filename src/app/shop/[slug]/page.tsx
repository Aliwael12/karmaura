import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import Reveal from "@/components/Reveal";
import { PRODUCTS, getProduct, relatedTo } from "@/lib/products";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.blurb };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedTo(product);

  return (
    <>
      <ProductDetail product={product} />

      <section
        className="km-gutter bg-cream text-forest"
        style={{
          paddingBlock: "clamp(34px,5cqw,80px) clamp(60px,8cqw,110px)",
        }}
      >
        <Reveal delay={0}>
          <h2
            className="font-serif text-[clamp(24px,4cqw,38px)]"
            style={{ marginBottom: "clamp(20px,3cqw,34px)" }}
          >
            Sits well with
          </h2>
        </Reveal>
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]"
          style={{ gap: "clamp(14px,2cqw,26px)" }}
        >
          {related.map((other, i) => (
            <Reveal key={other.id} delay={i * 70}>
              <ProductCard product={other} compact />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
