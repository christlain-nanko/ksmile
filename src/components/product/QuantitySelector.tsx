"use client";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="inline-flex items-center border border-ksmile-line bg-white">
      <button
        type="button"
        aria-label="Diminuer la quantité"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center text-lg text-ksmile-green disabled:text-ksmile-line"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Augmenter la quantité"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center text-lg text-ksmile-green disabled:text-ksmile-line"
      >
        +
      </button>
    </div>
  );
}
