import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsersWithStats()
  }, [])

  const fetchUsersWithStats = async () => {
    // Получаем всех пользователей из auth.users через таблицу profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!profiles) {
      setUsers([])
      setLoading(false)
      return
    }

    // Для каждого пользователя считаем заказы
    const usersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('total, status')
          .eq('user_id', profile.id)

        const totalOrders = orders?.length || 0
        const totalSum = orders?.reduce((sum, order) => sum + order.total, 0) || 0
        const completedOrders = orders?.filter(o => o.status === 'delivered' || o.status === 'paid').length || 0

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || '-',
          role: profile.role || 'customer',
          created_at: profile.created_at,
          total_orders: totalOrders,
          total_sum: totalSum,
          completed_orders: completedOrders
        }
      })
    )

    setUsers(usersWithStats)
    setLoading(false)
  }

  if (loading) return <div className="p-6 text-center">Загрузка пользователей...</div>

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-text-dark">
          Пользователи
        </div>
      </div>

      <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="bg-warm-bg sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Имя</th>
                <th className="text-left py-3 px-3">Роль</th>
                <th className="text-left py-3 px-3">Заказов</th>
                <th className="text-left py-3 px-3">На сумму</th>
                <th className="text-left py-3 px-3">Выполнено</th>
                <th className="text-left py-3 px-3">Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-text-mid">
                    Пользователей нет
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-warm-bg">
                    <td className="py-3 px-3 text-sm">{user.id.slice(0, 8)}...{user.id.slice(-4)}</td>
                    <td className="py-3 px-3">{user.email}</td>
                    <td className="py-3 px-3">{user.full_name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'master' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Админ' : user.role === 'master' ? 'Мастер' : 'Клиент'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{user.total_orders}</td>
                    <td className="py-3 px-3">{user.total_sum.toLocaleString()} ₽</td>
                    <td className="py-3 px-3 text-center">{user.completed_orders}</td>
                    <td className="py-3 px-3 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers