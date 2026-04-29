import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

function PrivacyPage() {
  const [privacyText, setPrivacyText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrivacy = async () => {
      const { data, error } = await supabase
        .from('about_us')
        .select('privacy_policy')
        .eq('id', 1)
        .maybeSingle()  // вместо .single()
      
      console.log('Данные политики:', data, error)
      
      if (data?.privacy_policy) {
        setPrivacyText(data.privacy_policy)
      }
      setLoading(false)
    }
    fetchPrivacy()
  }, [])

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text-dark mb-6">
          Политика обработки персональных данных
        </h1>
        <div className="text-text-mid whitespace-pre-line leading-relaxed">
          {privacyText || 'Текст политики не загружен.'}
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <Link to="/" className="text-primary hover:underline">← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage