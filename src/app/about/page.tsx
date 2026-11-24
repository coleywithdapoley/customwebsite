import Link from "next/link";

export const metadata = {
  title: "About — SEYDEHWON®",
  description: "Visionary fashion from Detroit. The Head.",
};

export default function AboutPage() {
  return (
    <main className="min-h-full bg-sey-bg px-5 pb-32 pt-28 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.3em] text-sey-muted uppercase">
          The brand
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight uppercase sm:text-5xl">
          Pioneering fashion in Detroit
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-sey-ink/85">
          Seydehwon is a visionary fashion brand founded in 2023 by artist
          Seydehwon Nagbe. Crafting garments that exude vibrant energy and
          unparalleled craftsmanship, the designs are inspired by a discerning
          eye for design and a dedication to creativity.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-sey-ink/85">
          At the heart of the brand is <strong>The Head</strong> — a distinctive
          symbol representing breaking free from narrow perceptions of Black
          men.
        </p>
        <Link
          href="/?cat=clothing"
          className="mt-10 inline-flex rounded-full bg-sey-ink px-6 py-3 text-sm tracking-wide text-sey-white uppercase"
        >
          Enter the store
        </Link>
      </div>
    </main>
  );
}
