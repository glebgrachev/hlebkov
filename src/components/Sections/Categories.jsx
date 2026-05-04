import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (!error) setCategories(data || [])
    setLoading(false)
  }

  if (loading) return <div className="py-8 text-center">Загрузка категорий...</div>
  if (categories.length === 0) return null

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-center text-[#2D2B26] mb-6">
          Что мы печём
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="bg-white rounded-2xl p-4 text-center hover-lift border border-[#EDE6DD] hover:border-[#D96E2A] group transition-all block"
            >
              {cat.image_url ? (
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  className="w-30 h-30 object-cover rounded-full mx-auto mb-3 scale-hover"
                />
              ) : (
                <div className="text-5xl mb-3 scale-hover">{cat.icon || '🍞'}</div>
              )}
              <h3 className="font-semibold text-base text-[#2D2B26]">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories