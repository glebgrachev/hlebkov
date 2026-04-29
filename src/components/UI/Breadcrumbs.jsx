import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)
  const [productName, setProductName] = useState(null)
  const [categoryName, setCategoryName] = useState(null)

  useEffect(() => {
    const fetchNames = async () => {
      if (pathnames[0] === 'product' && pathnames[1]) {
        const { data } = await supabase
          .from('products')
          .select('name')
          .eq('id', pathnames[1])
          .single()
        if (data) setProductName(data.name)
      } else {
        setProductName(null)
      }

      if (pathnames[0] === 'category' && pathnames[1]) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', pathnames[1])
          .single()
        if (data) setCategoryName(data.name)
      } else {
        setCategoryName(null)
      }
    }
    fetchNames()
  }, [location])

  if (pathnames.length === 0) return null

  // Страница корзины
  if (pathnames[0] === 'cart') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Корзина</span>
        </div>
      </div>
    )
  }

  // Страница оформления заказа
  if (pathnames[0] === 'checkout') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/cart" className="hover:text-primary transition">Корзина</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Оформление</span>
        </div>
      </div>
    )
  }

  // Мои заказы
  if (pathnames[0] === 'my-orders') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Мои заказы</span>
        </div>
      </div>
    )
  }

  // Детальный заказ
  if (pathnames[0] === 'order' && pathnames[1]) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/my-orders" className="hover:text-primary transition">Мои заказы</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Заказ №{pathnames[1]}</span>
        </div>
      </div>
    )
  }

  // Страница товара
  if (pathnames[0] === 'product') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <Link to="/catalog" className="hover:text-primary transition">Каталог</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">{productName || 'Товар'}</span>
        </div>
      </div>
    )
  }

  // Страница категории
  if (pathnames[0] === 'category') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">{categoryName || 'Категория'}</span>
        </div>
      </div>
    )
  }

  // Страница каталога
  if (pathnames[0] === 'catalog') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Каталог</span>
        </div>
      </div>
    )
  }

  // Политика конфиденциальности
  if (pathnames[0] === 'privacy') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Политика конфиденциальности</span>
        </div>
      </div>
    )
  }

  // Оферта
  if (pathnames[0] === 'offer') {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-text-mid">
          <Link to="/" className="hover:text-primary transition">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-text-dark">Договор оферты</span>
        </div>
      </div>
    )
  }

  return null
}

export default Breadcrumbs