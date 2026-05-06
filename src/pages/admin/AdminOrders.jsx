import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateOrderStatus = async (id, newStatus) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
    fetchOrders()
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (searchTerm && !order.order_number?.toString().includes(searchTerm) && !order.id.toString().includes(searchTerm)) return false
    return true
  })

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      delivered: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      new: 'Новый',
      paid: 'Оплачен',
      cancelled: 'Отменён',
      delivered: 'Доставлен'
    }
    return { className: styles[status] || 'bg-gray-100', label: labels[status] || status }
  }

  if (loading) return <div className="p-6 text-center">Загрузка заказов...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Заказы</h1>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['all', 'new', 'paid', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1 rounded-full text-sm transition ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Все' : getStatusBadge(status).label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Поиск по № заказа"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-1 border border-border rounded-full text-sm w-48 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Таблица заказов */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3">№</th>
              <th className="text-left py-3 px-3">Дата</th>
              <th className="text-left py-3 px-3">Имя</th>
              <th className="text-left py-3 px-3">Телефон</th>
              <th className="text-left py-3 px-3">Сумма</th>
              <th className="text-left py-3 px-3">Статус</th>
              <th className="text-left py-3 px-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-text-mid">
                  Заказов не найдено
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const { className, label } = getStatusBadge(order.status)
                return (
                  <tr key={order.id} className="border-b border-border hover:bg-warm-bg">
                    <td className="py-3 px-3">{order.id}</td>
                    <td className="py-3 px-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3">{order.customer_name}</td>
                    <td className="py-3 px-3">{order.customer_phone}</td>
                    <td className="py-3 px-3">{order.total} ₽</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${className}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
                      >
                        <option value="new">Новый</option>
                        <option value="paid">Оплачен</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOrders