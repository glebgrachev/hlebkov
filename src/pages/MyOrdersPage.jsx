import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [paymentChecked, setPaymentChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()

  const fetchOrders = async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
  }

  // Убираем параметр orderId из URL после обработки
  const removeOrderIdFromUrl = () => {
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }

  useEffect(() => {
    const getUserAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login', { state: { redirect: '/my-orders' } })
        return
      }
      setUser(user)
      await fetchOrders(user.id)
      setLoading(false)
    }
    getUserAndOrders()
  }, [navigate])

  // Проверка оплаты (отдельный useEffect, зависит от location)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const orderId = urlParams.get('orderId')
    
    if (orderId && user && !paymentChecked) {
      setPaymentChecked(true)
      
      fetch(`/api/check-payment?orderId=${orderId}`)
        .then(res => res.json())
        .then(async (data) => {
          if (data.status === 'succeeded') {
            clearCart()
            await fetchOrders(user.id)
            alert('Оплата прошла успешно! Корзина очищена.')
          }
          // Убираем orderId из URL, чтобы не повторять проверку
          removeOrderIdFromUrl()
        })
        .catch(err => {
          console.error('Ошибка проверки платежа:', err)
          removeOrderIdFromUrl()
        })
    }
  }, [location, user, paymentChecked, clearCart])

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Загрузка ваших заказов...</div>
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">Мои заказы</h1>
      <p className="text-text-mid mb-8">Здесь вы можете отслеживать статус ваших заказов</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 card-bg rounded-2xl">
          <p className="text-text-mid mb-4">У вас пока нет заказов</p>
          <Link to="/catalog" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-bg rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <span className="font-semibold text-lg">Заказ №{order.id}</span>
                  <span className="text-text-mid text-sm ml-3">
                    от {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'new' ? 'Новый' : order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-text-mid text-sm">и ещё {order.items.length - 3} товара...</div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="font-semibold">Итого: {order.total} ₽</span>
                <Link to={`/order/${order.id}`} className="text-primary hover:underline text-sm">
                  Подробнее →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrdersPage