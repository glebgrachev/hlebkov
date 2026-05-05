import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
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
    setModalProduct(product)
    setShowCartModal(true)
    setTimeout(() => {
      setShowCartModal(false)
      setTimeout(() => setModalProduct(null), 300)
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
        {products.length} {products.length === 1 ? 'товар' : products.length < 5 ? 'товара' : 'товаров'}
      </p>

      {products.length === 0 ? (
        <p className="text-center text-text-mid">В этой категории пока нет товаров</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-border hover:border-primary hover-lift fade-in transition">
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
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                {product.weight && (
                  <p className="text-xs text-text-mid mb-2">{product.weight}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-text-dark">{product.price} ₽</span>
                  {product.old_price && (
                    <span className="text-sm text-text-mid line-through">{product.old_price} ₽</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition-all scale-hover"
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default CategoryPage