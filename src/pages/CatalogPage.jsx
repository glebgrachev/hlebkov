import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (!error) setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
    setModalProduct(product)
    setShowCartModal(true)
    setTimeout(() => {
      setShowCartModal(false)
      setTimeout(() => setModalProduct(null), 300)
    }, 2000)
  }

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-center mb-8">Весь каталог</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-border hover-lift p-6 text-center">
            <Link to={`/product/${product.id}`}>
              <div className="mb-4">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-32 h-32 object-cover rounded-xl mx-auto"
                  />
                ) : (
                  <div className="text-6xl">🥖</div>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1 hover:text-primary">{product.name}</h3>
              <div className="text-xl font-bold mt-2">{product.price} ₽</div>
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-primary text-white py-2 rounded-full mt-3 hover:bg-primary-dark transition"
            >
              В корзину
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно добавления в корзину */}
      {showCartModal && modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-fade-in-up">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Товар добавлен!</h3>
            <p className="text-text-mid">{modalProduct.name} в корзине</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogPage