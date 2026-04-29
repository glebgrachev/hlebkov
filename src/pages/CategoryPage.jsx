import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastProduct, setToastProduct] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (categoryError) {
        console.error('Категория не найдена', categoryError)
        setLoading(false)
        return
      }

      setCategory(categoryData)

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('name')

      if (!productsError) setProducts(productsData || [])
      setLoading(false)
    }

    fetchCategoryAndProducts()
  }, [slug])

  const handleAddToCart = (product) => {
    addToCart(product)
    setToastProduct(product)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setToastProduct(null)
    }, 2000)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-text-mid mb-4">Категория не найдена</p>
        <Link to="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-center mb-2">{category.name}</h1>
      <p className="text-center text-text-mid mb-8">
        {products.length} товаров
      </p>

      {products.length === 0 ? (
        <p className="text-center text-text-mid">В этой категории пока нет товаров</p>
      ) : (
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
      )}

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

export default CategoryPage