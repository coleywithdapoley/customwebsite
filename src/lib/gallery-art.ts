export type Artwork = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  subtitle: string;
  image: string;
  productSlug: string;
  priceLabel: string;
};

/** Paintings for the gallery walls. Drop new files in public/images/gallery/paintings. */
const PAINTINGS: Omit<Artwork, "id" | "slug" | "artist" | "productSlug" | "priceLabel">[] = [
  {
    title: "Call Sam",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/call-sam.jpg",
  },
  {
    title: "Study",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/study.jpg",
  },
  {
    title: "Seascape",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/seascape.jpg",
  },
  {
    title: "Green Suit",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/green-suit.jpg",
  },
  {
    title: "Portrait",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/portrait.jpg",
  },
  {
    title: "Flowers",
    subtitle: "Seydehwon",
    image: "/images/gallery/paintings/flowers.jpg",
  },
];

export const artworks: Artwork[] = PAINTINGS.map((piece) => {
  const slug = piece.title.toLowerCase().replace(/\s+/g, "-");
  return {
    ...piece,
    id: slug,
    slug,
    artist: "Seydehwon",
    productSlug: "",
    priceLabel: "",
  };
});
