import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

function OfferPage() {
  const [offerText, setOfferText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffer = async () => {
      const { data, error } = await supabase
        .from('about_us')
        .select('offer_text')
        .eq('id', 1)
        .maybeSingle()  // вместо .single()
      
      console.log('Данные оферты:', data, error)
      
      if (data?.offer_text) {
        setOfferText(data.offer_text)
      }
      setLoading(false)
    }
    fetchOffer()
  }, [])

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text-dark mb-6">
          Договор оферты
        </h1>
        <div className="text-text-mid whitespace-pre-line leading-relaxed">
          {offerText || 'Текст оферты не загружен.'}
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <Link to="/" className="text-primary hover:underline">← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  )
}

export default OfferPage