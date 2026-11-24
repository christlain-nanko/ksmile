"use client";

import { useState } from "react";

export function ImageUploadField({
  defaultUrl,
}: {
  defaultUrl?: string | null;
}) {
  const [preview, setPreview] = useState(defaultUrl ?? "");
  const [keepUrl, setKeepUrl] = useState(defaultUrl ?? "");

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-semibold">Image produit</label>
        <input type="hidden" name="imageUrl" value={keepUrl} />
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-ksmile-muted file:mr-3 file:rounded-md file:border-0 file:bg-ksmile-green file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ksmile-green-dark"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              setPreview(keepUrl);
              return;
            }
            setPreview(URL.createObjectURL(file));
          }}
        />
        <p className="mt-1 text-xs text-ksmile-muted">
          JPG, PNG ou WebP. Upload Cloudinary dans le dossier{" "}
          <code>ksmile</code> (ou colle une URL ci-dessous).
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          Ou URL image (si pas d’upload)
        </label>
        <input
          type="text"
          inputMode="url"
          value={keepUrl}
          onChange={(e) => {
            setKeepUrl(e.target.value);
            if (!e.target.value) setPreview("");
            else setPreview(e.target.value);
          }}
          placeholder="https://…"
          className="w-full rounded-md border border-ksmile-line px-3 py-2.5 text-sm outline-none focus:border-ksmile-green"
        />
      </div>

      {preview ? (
        <div className="flex items-end gap-3">
          <img
            src={preview}
            alt="Aperçu"
            className="h-28 w-28 border border-ksmile-line object-cover"
          />
          {keepUrl ? (
            <button
              type="button"
              className="text-sm font-semibold text-ksmile-danger"
              onClick={() => {
                setKeepUrl("");
                setPreview("");
              }}
            >
              Retirer l’image
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
