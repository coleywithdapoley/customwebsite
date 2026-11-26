import { CurvedGallery } from "@/components/seydehwon/curved-gallery";

export const metadata = {
  title: "Gallery — SEYDEHWON®",
  description: "A curved gallery hall. Scroll to walk past the paintings, then into the store.",
};

export default function CollectionPage() {
  return (
    <main className="min-h-full bg-[#3d3832]">
      <CurvedGallery />
    </main>
  );
}
