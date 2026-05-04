import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { useCart } from '../../context/CartContext'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const { addToCart } = useCart()

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

  const handleAddToCart = (product) => {
    addToCart(product)
    setModalProduct(product)
    setShowCartModal(true)
    setTimeout(() => {
      setShowCartModal(false)
      setTimeout(() => setModalProduct(null), 300)
    }, 2000)
  }

  if (loading) return <div className="py-8 text-center">Загрузка товаров...</div>
  if (products.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-[#2D2B26] mb-2">
            Популярное сегодня
          </h2>
          <p className="text-[#6B635C]">
            То, что наши гости любят больше всего
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-[#EDE6DD] hover:border-[#D96E2A] hover-lift fade-in transition">
              <Link to={`/product/${product.id}`}>
                <div className="p-4 pb-0">
                  <div className="aspect-square overflow-hidden rounded-xl bg-warm-bg">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl bg-warm-bg">🥖</div>
                    )}
                  </div>
                </div>
              </Link>
              <div className="p-4 pt-2">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-lg text-[#2D2B26] mb-1 hover:text-primary transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                {product.weight && (
                  <p className="text-xs text-[#6B635C] mb-2">{product.weight}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-[#2D2B26]">{product.price} ₽</span>
                  {product.old_price && (
                    <span className="text-sm text-[#6B635C] line-through">{product.old_price} ₽</span>
                  )}
                </div>
                <button 
                  className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition-all scale-hover"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToCart(product)
                  }}
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно добавления в корзину */}
      {showCartModal && modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-fade-in">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Товар добавлен!</h3>
            <p className="text-text-mid">{modalProduct.name} в корзине</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Products