import { NextResponse } from "next/server"
import twilio from "twilio"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

const accountSid = process.env.NEXT_PUBLIC_accountSid;
const authToken = process.env.NEXT_PUBLIC_authToken; 
const client = twilio(accountSid, authToken)

export async function POST(request: Request) {
  const { ids } = await request.json()
  let sentCount = 0

  for (const id of ids) {
    const docRef = doc(db, "personas", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const person = docSnap.data()
      try {
         // Generate QR code
        const qrResponse = await fetch("http://localhost:3000/api/generate-qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: person.NOMBRE_APELLIDO, id: person.id }),
        })

        if (!qrResponse.ok) {
          throw new Error("Failed to generate QR code")
        }

        const { imageUrl } = await qrResponse.json()
         

        console.log(`Sending message to ${person.TELEFONO}...`);
        

        await client.messages.create({
          body: `Hola ${person.NOMBRE_APELLIDO}, Utiliza este código QR para acceder a las Milongas 
          asignadas en el 10º Tango Salta Fest. Si has recibido este código, por favor confirma enviando 
          un mensaje de texto al 3874099043.`,
          from: "whatsapp:+14155238886", // Reemplaza con tu número de Twilio WhatsApp
          to: `whatsapp:+${person.TELEFONO}`,
          mediaUrl: [imageUrl],
        })
        sentCount++
      } catch (error) {
        console.error(`Error sending message to ${person.NOMBRE_APELLIDO}:`, error)
      }
    }
  }

  return NextResponse.json({ sentCount })
}