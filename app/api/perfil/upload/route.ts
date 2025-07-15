import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('foto') as File

  if (!file) {
    return NextResponse.json({ mensaje: 'No se encontró archivo' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const upload = await cloudinary.uploader.upload_stream(
    { folder: 'usuarios' },
    (err, result) => {
      if (err || !result) {
        return NextResponse.json({ mensaje: 'Error al subir imagen' }, { status: 500 })
      }
    }
  )

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'usuarios' },
    (err, result) => {
      if (err || !result) {
        return NextResponse.json({ mensaje: 'Error al subir imagen' }, { status: 500 })
      }
      return NextResponse.json({ url: result.secure_url })
    }
  )

  stream.end(buffer)
  return new Promise((resolve) => {
    stream.on('finish', () => {
      resolve(undefined)
    })
  })
}
