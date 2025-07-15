import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary"; // 👈 import correcto del tipo

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest): Promise<Response> {
  const form = await req.formData();
  const file = form.get("foto") as File;

  if (!file) {
    return NextResponse.json({ mensaje: "No se encontró archivo" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "usuarios" },
      (err, res) => {
        if (err || !res) {
          reject(err || new Error("Sin respuesta de Cloudinary"));
          return;
        }
        resolve(res);
      }
    );
    stream.end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
