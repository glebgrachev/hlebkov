import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_popular', true)
      .eq('is_active', true)
      .limit(4)

    if (!error) setProducts(data || [])
    setLoading(false)
  }

  if (loading) return <div className="py-16 text-center">Загрузка товаров...</div>
  if (products.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-[#2D2B26] mb-2">
            Популярное сегодня
          </h2>
          <p className="text-[#6B635C]">
            То, что наши гости любят больше всего
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#EDE6DD] hover-lift fade-in"
            >
              <div className="p-6 text-center">
                <div className="text-6xl mb-4 scale-hover inline-block">
                  {product.image_url || '🥖'}
                </div>
                <h3 className="font-semibold text-lg text-[#2D2B26] mb-1">{product.name}</h3>
                {product.weight && (
                  <p className="text-xs text-[#6B635C] mb-2">{product.weight}</p>
                )}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xl font-bold text-[#2D2B26]">{product.price} ₽</span>
                  {product.old_price && (
                    <span className="text-sm text-[#6B635C] line-through">{product.old_price} ₽</span>
                  )}
                </div>
                <button className="w-full bg-[#D96E2A] text-white py-2 rounded-full hover:bg-[#B8531E] transition-all scale-hover">
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Products