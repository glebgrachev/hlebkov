import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'

// Функция для форматирования телефона
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return '+7'
  
  let phone = digits
  if (phone.startsWith('8')) {
    phone = '7' + phone.slice(1)
  }
  
  if (phone.length > 11) {
    phone = phone.slice(0, 11)
  }
  
  let formatted = '+7'
  if (phone.length > 1) {
    formatted += ' (' + phone.slice(1, 4)
  }
  if (phone.length >= 4) {
    formatted += ') ' + phone.slice(4, 7)
  }
  if (phone.length >= 7) {
    formatted += '-' + phone.slice(7, 9)
  }
  if (phone.length >= 9) {
    formatted += '-' + phone.slice(9, 11)
  }
  return formatted
}

// Функция для капитализации имени
const capitalizeName = (name) => {
  if (!name) return ''
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase()
}

function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [errors, setErrors] = useState({ name: '', phone: '' })
  const [formData, setFormData] = useState({
    name: '',
    phone: '+7',
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
    const { name, value } = e.target
    
    if (name === 'phone') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) })
      setErrors({ ...errors, phone: '' })
    } else if (name === 'name') {
      setFormData({ ...formData, [name]: value })
      setErrors({ ...errors, name: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { name: '', phone: '' }
    
    // Проверка имени (минимум 2 символа)
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
      isValid = false
    }
    
    // Проверка телефона (должно быть 10 цифр после +7)
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
      newErrors.phone = 'Введите полный номер телефона (10 цифр)'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Корзина пуста')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    // Капитализируем имя перед отправкой
    const capitalizedName = capitalizeName(formData.name)

    setLoading(true)

    const orderData = {
      customer_name: capitalizedName,
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
        <h1 className="text-4xl font-display font-bold mb-4">Корзина пуста</h1>
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
      <h1 className="text-4xl font-display font-bold mb-8">Оформление заказа</h1>

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
                className={`w-full px-4 py-2 rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} bg-white focus:border-primary outline-none transition`}
                placeholder="Иван"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-text-dark font-semibold mb-1">Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-border'} bg-white focus:border-primary outline-none transition`}
                placeholder="+7 (___) ___-__-__"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
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