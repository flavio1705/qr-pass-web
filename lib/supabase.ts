import { createClient } from "@supabase/supabase-js"

const supabaseUrl = 'https://ufiowjesiwvkydlqfrke.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmaW93amVzaXd2a3lkbHFmcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzUxODAsImV4cCI6MjA1MDgxMTE4MH0.Q6YTCy-3-O_8qkh1Lyylz7D8m-I0zPK1XJwdJPbMsw4'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)