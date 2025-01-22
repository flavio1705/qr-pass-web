import { NextResponse } from "next/server"
import QRCode from "qrcode"
import sharp from "sharp"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const { name, id } = await request.json()

  try {
    // Generate QR code
    const qrContent = JSON.stringify({
      id: id,
      nombre: name,
  });
    const qrCodeBuffer = await QRCode.toBuffer(qrContent, { width: 300, margin: 1 })

    // Create a white background image
    const backgroundBuffer = await sharp({
      create: {
        width: 350,
        height: 350,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer()

    // Overlay QR code on the white background
    const finalImageBuffer = await sharp(backgroundBuffer)
      .composite([{ input: qrCodeBuffer, gravity: "center" }])
      .png()
      .toBuffer()

    // Upload the image to Supabase Storage
    const fileName = `qr-${id}-${Date.now()}.png`
    const { error } = await supabase.storage.from("qr-codes").upload(fileName, finalImageBuffer, {
      contentType: "image/png",
    })

    if (error) {
      throw error
    }

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("qr-codes").getPublicUrl(fileName)

    return NextResponse.json({ imageUrl: publicUrl })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}