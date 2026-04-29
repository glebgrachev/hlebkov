import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

function OrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Загрузка...</div>
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-text-mid mb-4">Заказ не найден</p>
        <Link to="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto card-bg rounded-2xl p-8">
        <h1 className="text-2xl font-display font-bold mb-2">Заказ №{order.id}</h1>
        <p className="text-text-mid text-sm mb-6">
          от {new Date(order.created_at).toLocaleDateString()} в {new Date(order.created_at).toLocaleTimeString()}
        </p>

        <div className="space-y-2 mb-6">
          <p><span className="font-semibold">Имя:</span> {order.customer_name}</p>
          <p><span className="font-semibold">Телефон:</span> {order.customer_phone}</p>
          <p><span className="font-semibold">Адрес:</span> {order.customer_address || 'Самовывоз'}</p>
          <p><span className="font-semibold">Статус:</span> {order.status === 'new' ? 'Новый' : order.status}</p>
          <p><span className="font-semibold">Оплата:</span> {order.payment_method === 'cash' ? 'Наличными' : 'Картой онлайн'}</p>
        </div>

        <h2 className="text-xl font-semibold mb-3">Состав заказа</h2>
        <div className="space-y-2 mb-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between border-b border-border pb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>{item.price * item.quantity} ₽</span>
            </div>
          ))}
        </div>

        <div className="text-right font-bold text-lg border-t border-border pt-3">
          Итого: {order.total} ₽
        </div>

        <div className="mt-8 text-center">
          <Link to="/catalog" className="text-primary hover:underline">
            ← Вернуться в каталог
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderPage