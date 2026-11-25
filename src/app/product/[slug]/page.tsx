import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import { ProductView } from "@/components/seydehwon/product-view";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product ? `${product.name} — SEYDEHWON®` : "Product",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <main className="min-h-full bg-[#f3f1ec] pb-36 [background-image:radial-gradient(#d5d0c8_0.7px,transparent_0.8px)] [background-size:8px_8px]">
      <ProductView product={product} />
    </main>
  );
}
