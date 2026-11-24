"use client";

import { useSearchParams } from "next/navigation";
import type { ProductCategory } from "@/lib/products";
import { VirtualRack } from "./virtual-rack";

export function HomeRack() {
  const params = useSearchParams();
  const raw = params.get("cat") ?? "clothing";
  const category = (
    ["store", "clothing", "caps", "bags", "shoes"].includes(raw)
      ? raw
      : "clothing"
  ) as ProductCategory | "store";

  return <VirtualRack category={category} />;
}
