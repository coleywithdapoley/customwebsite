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
    <main className="min-h-full bg-sey-bg pb-32 pt-24">
      <ProductView product={product} />
    </main>
  );
}
