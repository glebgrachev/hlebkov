import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product)
    setModalProduct(product)
    setShowCartModal(true)
    setTimeout(() => {
      setShowCartModal(false)
      setTimeout(() => setModalProduct(null), 300)
    }, 2000)
  }

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>
  if (!product) return <div className="container mx-auto px-4 py-16 text-center">Товар не найден</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 text-center">
            <div className="p-8 bg-warm-bg rounded-3xl inline-block">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-64 h-64 object-cover rounded-2xl"
                />
              ) : (
                <div className="text-9xl">🥖</div>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <h1 className="text-4xl font-display font-bold mb-2">{product.name}</h1>
            {product.weight && <p className="text-text-mid mb-4">Вес: {product.weight}</p>}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary-dark">{product.price} ₽</span>
              {product.old_price && (
                <span className="text-xl text-text-mid line-through">{product.old_price} ₽</span>
              )}
            </div>
            <p className="text-text-dark/80 leading-relaxed mb-8">
              {product.description || 'Свежая выпечка по нашему уникальному рецепту.'}
            </p>
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-3 rounded-full text-lg font-medium hover:bg-primary-dark transition"
            >
              Добавить в корзину
            </button>
          </div>
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
    </div>
  )
}

export default ProductPage