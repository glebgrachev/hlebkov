import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

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

  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true)
    
    // Получаем детали заказа (товары)
    const { data: items } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (
          name,
          price,
          images
        )
      `)
      .eq('order_id', orderId)
    
    // Получаем полную информацию о заказе
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    setOrderDetails({
      ...order,
      items: items || []
    })
    setDetailsLoading(false)
  }

  const handleOrderClick = async (order) => {
    setSelectedOrder(order)
    await fetchOrderDetails(order.id)
  }

  const closeModal = () => {
    setSelectedOrder(null)
    setOrderDetails(null)
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
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-text-dark">
          Заказы
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6 flex-shrink-0">
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
          className="px-4 py-1 border border-border rounded-full text-sm w-48 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
        />
      </div>

      {/* Таблица заказов */}
      <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="bg-warm-bg sticky top-0 z-10">
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
                    <tr 
                      key={order.id} 
                      className="border-b border-border hover:bg-warm-bg cursor-pointer"
                      onClick={() => handleOrderClick(order)}
                    >
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
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
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

      {/* Модальное окно с деталями заказа */}
      {selectedOrder && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Заказ №{selectedOrder.id}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {detailsLoading ? (
              <div className="p-8 text-center">Загрузка деталей...</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Информация о заказе */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-2">Информация о заказе</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Дата:</span> {new Date(orderDetails.created_at).toLocaleString()}</p>
                      <p><span className="text-gray-500">Статус:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(orderDetails.status).className}`}>{getStatusBadge(orderDetails.status).label}</span></p>
                      <p><span className="text-gray-500">Сумма:</span> <span className="font-bold">{orderDetails.total} ₽</span></p>
                      {orderDetails.comment && <p><span className="text-gray-500">Комментарий:</span> {orderDetails.comment}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-2">Данные доставки</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Получатель:</span> {orderDetails.customer_name}</p>
                      <p><span className="text-gray-500">Телефон:</span> {orderDetails.customer_phone}</p>
                      <p><span className="text-gray-500">Адрес доставки:</span> {orderDetails.delivery_address || 'Не указан'}</p>
                    </div>
                  </div>
                </div>

                {/* Товары в заказе */}
                <div>
                  <h3 className="font-semibold text-gray-600 mb-3">Товары в заказе</h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3">Товар</th>
                          <th className="text-center py-2 px-3">Кол-во</th>
                          <th className="text-right py-2 px-3">Цена</th>
                          <th className="text-right py-2 px-3">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-border">
                            <td className="py-2 px-3">
                              <div>
                                <div className="font-medium">{item.products?.name || 'Товар'}</div>
                                {item.size && <div className="text-xs text-gray-500">Размер: {item.size}</div>}
                              </div>
                            </td>
                            <td className="text-center py-2 px-3">{item.quantity}</td>
                            <td className="text-right py-2 px-3">{item.price} ₽</td>
                            <td className="text-right py-2 px-3 font-medium">{item.price * item.quantity} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="text-right py-2 px-3 font-semibold">Итого:</td>
                          <td className="text-right py-2 px-3 font-bold">{orderDetails.total} ₽</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders