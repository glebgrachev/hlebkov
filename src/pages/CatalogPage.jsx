import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastProduct, setToastProduct] = useState(null)
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
    setToastProduct(product)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setToastProduct(null)
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
              <div className="text-6xl mb-4">{product.image_url || '🥖'}</div>
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

      {/* Toast уведомление */}
      {showToast && toastProduct && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-notification">
          <div className="bg-[#DEFAE6] text-[#1A4D2A] px-6 py-3 rounded-full shadow-lg text-base font-medium">
            {toastProduct.name} добавлен в корзину
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogPage