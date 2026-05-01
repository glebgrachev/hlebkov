import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'

function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cash'
  })
  const navigate = useNavigate()

  // Проверка авторизации
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login', { state: { redirect: '/checkout' } })
      } else {
        setUser(user)
      }
      setCheckingAuth(false)
    }
    getUser()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Корзина пуста')
      return
    }
    if (!formData.name || !formData.phone) {
      alert('Заполните имя и телефон')
      return
    }

    setLoading(true)

    const orderData = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_address: formData.address || 'Самовывоз',
      total: totalPrice,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      })),
      status: 'new',
      payment_method: formData.paymentMethod,
      user_id: user.id
    }

    try {
      // Создаём заказ
      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) throw error

      // Если оплата картой — создаём платёж и редиректим
      if (formData.paymentMethod === 'card') {
        const res = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        })
        const { paymentUrl } = await res.json()
        
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          alert('Ошибка создания платежа')
        }
      } else {
        // Наличные — просто очищаем корзину и показываем успех
        clearCart()
        alert('Заказ оформлен! Скоро свяжемся с вами.')
        navigate('/my-orders')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      alert('Ошибка при оформлении заказа')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return <div className="container mx-auto px-4 py-16 text-center">Проверка авторизации...</div>
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Корзина пуста</h1>
        <p className="text-text-mid mb-8">Добавьте товары из каталога</p>
        <button
          onClick={() => navigate('/catalog')}
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition"
        >
          Перейти в каталог
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Оформление заказа</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 card-bg rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-text-dark font-semibold mb-1">Имя *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary outline-none"
                placeholder="Иван"
              />
            </div>
            <div>
              <label className="block text-text-dark font-semibold mb-1">Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary outline-none"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            <div>
              <label className="block text-text-dark font-semibold mb-1">Адрес доставки</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary outline-none"
                placeholder="Улица, дом, квартира (оставьте пустым для самовывоза)"
              />
            </div>

            <div>
              <label className="block text-text-dark font-semibold mb-2">Способ оплаты</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  <span>Наличными при получении</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  <span>Банковской картой онлайн</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          </form>
        </div>

        <div className="lg:w-80 bg-warm-bg rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Товары</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b border-border pb-2">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.price * item.quantity} ₽</span>
              </div>
            ))}
          </div>
          <div className="text-lg font-bold border-t border-border pt-3 mt-2 flex justify-between">
            <span>Итого:</span>
            <span>{totalPrice} ₽</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage