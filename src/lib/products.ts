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
  image?: string;
  images?: string[];
  shape: "hoodie" | "jacket" | "tee" | "longsleeve" | "cap" | "bag" | "shoe";
};

export const products: Product[] = [
  {
    id: "1",
    slug: "piped-track-set-black",
    name: "Piped Track Set",
    price: 240,
    category: "clothing",
    color: "Black",
    fill: "#111111",
    shape: "jacket",
    image: "/images/cutouts/piped-black-set.webp",
    images: [
      "/images/cutouts/piped-black-set.webp",
      "/images/cutouts/piped-black-back.webp",
    ],
    description: "Black track set with white piping. Hooded jacket and wide pant.",
  },
  {
    id: "2",
    slug: "colorblock-track-set-peach",
    name: "Colorblock Track Set",
    price: 240,
    category: "clothing",
    color: "Peach",
    fill: "#e7b98a",
    shape: "jacket",
    image: "/images/cutouts/colorblock-peach-set.webp",
    images: [
      "/images/cutouts/colorblock-peach-set.webp",
      "/images/cutouts/colorblock-peach-jacket.webp",
      "/images/cutouts/colorblock-peach-pants.webp",
      "/images/cutouts/colorblock-peach-back.webp",
      "/images/cutouts/colorblock-face-back.webp",
    ],
    description: "Peach and mauve track set. Purple zip, seams, and SEYDEHWON patch.",
  },
  {
    id: "3",
    slug: "cropped-hood-set-charcoal",
    name: "Cropped Hood Set",
    price: 220,
    category: "clothing",
    color: "Charcoal",
    fill: "#3a3a3a",
    shape: "hoodie",
    image: "/images/cutouts/cropped-charcoal-set.webp",
    images: ["/images/cutouts/cropped-charcoal-set.webp"],
    description: "Cropped charcoal hoodie with a wide matching pant.",
  },
  {
    id: "4",
    slug: "fleece-set-pink",
    name: "Fleece Set",
    price: 220,
    category: "clothing",
    color: "Pink",
    fill: "#e7a8be",
    shape: "hoodie",
    image: "/images/cutouts/fleece-pink-set.webp",
    images: ["/images/cutouts/fleece-pink-set.webp"],
    description: "Pink fleece zip hoodie and wide pant. Small chest mark.",
  },
  {
    id: "5",
    slug: "fleece-set-sky",
    name: "Fleece Set",
    price: 220,
    category: "clothing",
    color: "Sky",
    fill: "#8ec8ea",
    shape: "hoodie",
    image: "/images/cutouts/fleece-sky-set.webp",
    images: [
      "/images/cutouts/fleece-sky-set.webp",
      "/images/cutouts/fleece-sky-hoodie.webp",
      "/images/cutouts/fleece-sky-back.webp",
      "/images/products/fleece-sky-mark.jpg",
    ],
    description: "Sky fleece set. Raised face mark on the chest, line drawing on the back.",
  },
  {
    id: "6",
    slug: "colorblock-shell-pink",
    name: "Colorblock Shell",
    price: 210,
    category: "clothing",
    color: "Pink",
    fill: "#f0a0c4",
    shape: "jacket",
    image: "/images/cutouts/colorblock-pink-jacket.webp",
    images: [
      "/images/cutouts/colorblock-pink-jacket.webp",
      "/images/cutouts/colorblock-pink-pants.webp",
    ],
    description: "Pink and black shell with white piping, and the matching wide pant.",
  },
  {
    id: "7",
    slug: "fleece-set-charcoal",
    name: "Fleece Set",
    price: 220,
    category: "clothing",
    color: "Charcoal",
    fill: "#4a4a4a",
    shape: "hoodie",
    image: "/images/cutouts/fleece-charcoal-set.webp",
    images: ["/images/cutouts/fleece-charcoal-set.webp"],
    description: "Charcoal fleece zip hoodie and wide pant. Small light chest mark.",
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
