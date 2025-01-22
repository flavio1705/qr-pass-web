import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // List all files in the 'qr-codes' bucket
    const { data: files, error } = await supabase.storage.from("qr-codes").list()

    if (error) {
      throw error
    }

    // Filter and delete files older than one hour
    const oldFiles = files.filter((file) => file.created_at < oneHourAgo)
    for (const file of oldFiles) {
      const { error } = await supabase.storage.from("qr-codes").remove([file.name])

      if (error) {
        console.error(`Failed to delete file ${file.name}:`, error)
      }
    }

    return NextResponse.json({ message: `Deleted ${oldFiles.length} old files` })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json({ error: "Failed to clean up files" }, { status: 500 })
  }
}