import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_FOLDER || "ksmile";

let configured = false;

function ensureConfig() {
  if (configured) return;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary non configuré. Renseigne CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryReady() {
  return Boolean(cloudName && apiKey && apiSecret);
}

export async function uploadProductImage(file: File): Promise<string> {
  ensureConfig();

  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image.");
  }
  // ~8 Mo
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image trop lourde (max 8 Mo).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
          use_filename: true,
        },
        (error, uploaded) => {
          if (error || !uploaded?.secure_url) {
            reject(error ?? new Error("Échec upload Cloudinary."));
            return;
          }
          resolve({ secure_url: uploaded.secure_url });
        },
      );
      stream.end(buffer);
    });
    return result.secure_url;
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Échec upload Cloudinary.";
    if (message.includes("403") || message.toLowerCase().includes("permission")) {
      throw new Error(
        "Cloudinary refuse l’upload (clé sans permission create). Donne une clé API complète ou colle une URL d’image.",
      );
    }
    throw new Error(message);
  }
}
