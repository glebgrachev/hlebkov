import { Link, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useState } from 'react'

function AdminLayout() {
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const menuItems = [
    { path: '/admin/orders', label: 'Заказы', icon: '📦' },
    { path: '/admin/categories', label: 'Категории', icon: '📂' },
    { path: '/admin/products', label: 'Товары', icon: '🛒' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen bg-warm-bg">
      {/* Сайдбар */}
      <aside className="w-64 bg-warm-bg border-r border-border flex-shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-display font-bold text-primary">Админ-панель</h2>
          <p className="text-xs text-text-mid mt-1">Управление магазином</p>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-text-dark hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <span className="text-xl">🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Контент */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Модальное окно подтверждения выхода */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl animate-fade-in">
            <div className="flex justify-end -mt-2 -mr-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="text-xl font-semibold mb-2">Выйти из аккаунта?</h3>
            <p className="text-text-mid mb-6">Вы действительно хотите выйти из профиля?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
              >
                Выйти
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-400 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout