import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Header() {
  const { totalItems } = useCart()
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setShowMenu(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowMenu(false)
    navigate('/')
    window.location.reload() // 👈 принудительно перезагружаем страницу
  }

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

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 text-text-dark hover:text-primary transition"
              >
                <span>👤</span>
                <span className="hidden md:inline">Профиль</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
                  <Link
                    to="/my-orders"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-2 text-text-dark hover:bg-gray-50 transition"
                  >
                    Мои заказы
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50 transition"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary-dark transition"
            >
              Войти
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