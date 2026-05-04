import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Header() {
  const { totalItems } = useCart()
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FDF8F0]/95 backdrop-blur-sm border-b border-[#EDE6DD]">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/android-chrome-192x192.png" 
            alt="Хлебков" 
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <Link to="/" className="text-2xl md:text-3xl font-display font-bold text-[#2D2B26] scale-hover">
            Хлебков
          </Link>
          <span className="text-[10px] md:text-xs text-text-mid tracking-wider whitespace-nowrap -mb-1">
            с 1998 года
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/catalog" className="hidden md:block text-sm uppercase tracking-wider text-text-dark hover:text-primary transition">
            Каталог
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1 text-sm uppercase tracking-wider text-text-dark hover:text-primary transition"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  className="text-text-dark"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round"/>
                </svg>
                <span className="hidden md:inline">Профиль</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
                  <Link
                    to="/my-orders"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-2 text-base text-text-dark hover:bg-gray-50 transition"
                  >
                    Мои заказы
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base text-red-500 hover:bg-gray-50 transition"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-sm uppercase tracking-wider bg-primary text-white px-3 py-1 rounded-full hover:bg-primary-dark transition"
            >
              Войти
            </Link>
          )}

          <Link to="/cart" className="relative scale-hover">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className="text-text-dark"
            >
              <path d="M2 7L4 18H20L22 7H2Z" stroke="currentColor" fill="none"/>
              <path d="M7 7V5C7 3.5 8 2 10 2H14C16 2 17 3.5 17 5V7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
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