import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctqaowymqlhhhftrtdqy.supabase.co'
const supabaseAnonKey = 'sb_publishable_rD06mX-fi89DSZjsyvwN7A_db6YefBz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)