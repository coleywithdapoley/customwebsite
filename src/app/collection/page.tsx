import { CurvedGallery } from "@/components/seydehwon/curved-gallery";

export const metadata = {
  title: "Gallery — SEYDEHWON®",
  description: "A white gallery. Scroll to walk past the pictures.",
};

export default function CollectionPage() {
  return (
    <main className="min-h-full bg-white">
      <CurvedGallery />
    </main>
  );
}
