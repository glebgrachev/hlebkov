import { supabase } from '../services/supabase'

export const uploadImage = async (file, folder) => {
  if (!file) return null
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `uploads/${folder}/${fileName}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file)

  if (error) {
    console.error('Ошибка загрузки:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return publicUrl
}