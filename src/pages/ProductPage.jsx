import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastProduct, setToastProduct] = useState(null)
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
    setToastProduct(product)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setToastProduct(null)
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

export default ProductPage