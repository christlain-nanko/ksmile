import Image from "next/image";

export function ProductImage({
  src,
  brand,
  name,
  priority,
  sizes = "(max-width: 640px) 50vw, 20vw",
}: {
  src?: string | null;
  brand: string;
  name: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${brand} ${name}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-2"
      />
    );
  }

  return (
    <span
      className="text-2xl font-bold tracking-tight text-ksmile-green/35 sm:text-3xl"
      aria-hidden
    >
      {brand.slice(0, 2).toUpperCase()}
    </span>
  );
}
