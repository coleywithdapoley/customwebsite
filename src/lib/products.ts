export type ProductCategory = "clothing" | "caps" | "bags" | "shoes";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  color: string;
  description: string;
  fill: string;
  accent?: string;
  shape: "hoodie" | "jacket" | "tee" | "longsleeve" | "cap" | "bag" | "shoe";
};

export const products: Product[] = [
  {
    id: "1",
    slug: "head-hoodie-crimson",
    name: "The Head Hoodie",
    price: 120,
    category: "clothing",
    color: "Crimson",
    fill: "#c41e3a",
    shape: "hoodie",
    description: "Signature fleece. The Head mark on chest. Detroit-made energy.",
  },
  {
    id: "2",
    slug: "vision-jacket-cobalt",
    name: "Vision Jacket",
    price: 185,
    category: "clothing",
    color: "Cobalt",
    fill: "#1e4fd6",
    shape: "jacket",
    description: "Structured shell. Vibrant blue. Built to move through the city.",
  },
  {
    id: "3",
    slug: "pioneer-tee-ink",
    name: "Pioneer Tee",
    price: 55,
    category: "clothing",
    color: "Ink",
    fill: "#1a1a1a",
    shape: "tee",
    description: "Heavyweight cotton. Clean mark. Everyday uniform.",
  },
  {
    id: "4",
    slug: "field-crew-olive",
    name: "Field Crew",
    price: 95,
    category: "clothing",
    color: "Olive",
    fill: "#5c6b45",
    shape: "longsleeve",
    description: "Relaxed crew. Washed olive. Soft hand feel.",
  },
  {
    id: "5",
    slug: "pulse-hoodie-gold",
    name: "Pulse Hoodie",
    price: 125,
    category: "clothing",
    color: "Gold",
    fill: "#d4a017",
    shape: "hoodie",
    description: "Bold gold fleece. Vibrancy you can feel.",
  },
  {
    id: "6",
    slug: "night-jacket-violet",
    name: "Night Jacket",
    price: 195,
    category: "clothing",
    color: "Violet",
    fill: "#5b2c8a",
    shape: "jacket",
    description: "Deep violet shell. Unparalleled craftsmanship.",
  },
  {
    id: "7",
    slug: "studio-tee-cream",
    name: "Studio Tee",
    price: 52,
    category: "clothing",
    color: "Cream",
    fill: "#e8e0d4",
    shape: "tee",
    description: "Soft cream tee. Quiet luxury, loud intention.",
  },
  {
    id: "8",
    slug: "metro-crew-rose",
    name: "Metro Crew",
    price: 98,
    category: "clothing",
    color: "Rose",
    fill: "#c45c6a",
    shape: "longsleeve",
    description: "Rose crewneck. Soft fleece. City nights.",
  },
  {
    id: "9",
    slug: "head-cap-black",
    name: "The Head Cap",
    price: 40,
    category: "caps",
    color: "Black",
    fill: "#222222",
    shape: "cap",
    description: "Structured cap with embroidered Head mark.",
  },
  {
    id: "10",
    slug: "day-tote-canvas",
    name: "Day Tote",
    price: 75,
    category: "bags",
    color: "Canvas",
    fill: "#b8a88a",
    shape: "bag",
    description: "Heavy canvas tote. Room for the day.",
  },
  {
    id: "11",
    slug: "court-runner-white",
    name: "Court Runner",
    price: 140,
    category: "shoes",
    color: "White",
    fill: "#f0f0ee",
    accent: "#111111",
    shape: "shoe",
    description: "Clean runner. Soft sole. All-day Detroit miles.",
  },
  {
    id: "12",
    slug: "flare-hoodie-teal",
    name: "Flare Hoodie",
    price: 122,
    category: "clothing",
    color: "Teal",
    fill: "#0d7377",
    shape: "hoodie",
    description: "Teal fleece. Bright energy. Soft interior.",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getByCategory(category: ProductCategory | "store") {
  if (category === "store") return products.filter((p) => p.category === "clothing");
  return products.filter((p) => p.category === category);
}

export function formatPrice(n: number) {
  return `$${n}`;
}
