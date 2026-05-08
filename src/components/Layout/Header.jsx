import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function Header() {
  const { totalItems } = useCart()
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    address: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfileData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || ''
      })
    }
  }

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setShowMenu(false)
        setShowProfileModal(false)
      } else if (session?.user) {
        fetchProfile(session.user.id)
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

  const openProfileModal = () => {
    if (user) {
      fetchProfile(user.id)
      setShowProfileModal(true)
      setShowMenu(false)
      setProfileError('')
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    setProfileError('')
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    setProfileError('')

    const updateData = {}
    if (profileData.full_name.trim()) updateData.full_name = profileData.full_name.trim()
    if (profileData.phone.trim()) updateData.phone = profileData.phone.trim()
    if (profileData.address.trim()) updateData.address = profileData.address.trim()

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      setProfileError('Ошибка при сохранении')
      console.error(error)
    } else {
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
        setShowProfileModal(false)
      }, 1500)
    }
    setProfileLoading(false)
  }

  return (
    <>
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
                    <button
                      onClick={openProfileModal}
                      className="block w-full text-left px-4 py-2 text-base text-text-dark hover:bg-gray-50 transition"
                    >
                      Мои данные
                    </button>
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

      {/* Модальное окно редактирования профиля */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Мои данные</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {profileError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {profileError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Улица, дом, квартира"
                />
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition disabled:opacity-50"
              >
                {profileLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast уведомление об успехе */}
      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Данные обновлены</span>
          </div>
        </div>
      )}
    </>
  )
}

export default Header