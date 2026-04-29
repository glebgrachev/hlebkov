import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Header() {
  const { totalItems } = useCart()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-[#FDF8F0]/95 backdrop-blur-sm border-b border-[#EDE6DD]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-bold text-[#2D2B26] scale-hover">
          Хлебков
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/catalog" className="hidden md:block text-text-dark hover:text-primary transition">
            Каталог
          </Link>
          {user && (
            <Link to="/my-orders" className="hidden md:block text-text-dark hover:text-primary transition">
              Мои заказы
            </Link>
          )}
          <Link to="/cart" className="relative scale-hover">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-text-dark"
            >
              <path d="M2 7L4 18H20L22 7H2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M7 7V5C7 3.5 8 2 10 2H14C16 2 17 3.5 17 5V7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header