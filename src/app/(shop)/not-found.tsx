import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="km-gutter grid min-h-[70vh] place-items-center bg-forest py-24 text-center">
      <div>
        <Image
          src="/brand/emblem.png"
          alt=""
          width={340}
          height={380}
          className="mx-auto mb-8 h-16 w-auto animate-aura opacity-80"
        />
        <p className="km-eyebrow mb-4 text-gold-bright">Nothing here</p>
        <h1 className="mb-5 font-serif text-[clamp(30px,6cqw,58px)] leading-[1.06] text-cream italic">
          This room is empty
        </h1>
        <p className="mx-auto mb-9 max-w-[42ch] text-[15px] leading-[1.7] text-cream/70">
          The page you were looking for has been put away. The collection, the
          story and the atelier are all still where you left them.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="km-btn km-btn-dark">
            The collection
          </Link>
          <Link href="/" className="km-btn km-btn-quiet">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
