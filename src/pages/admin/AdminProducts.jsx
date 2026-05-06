import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    weight: '',
    category_id: '',
    image_url: '',
    is_popular: false,
    is_active: true,
    old_price: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') {
        navigate('/')
        return
      }
      setIsAdmin(true)
      setChecking(false)
    }
    checkAdmin()
  }, [navigate])

  useEffect(() => {
    if (isAdmin) {
      fetchProducts()
    }
  }, [isAdmin])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('id')
    setProducts(data || [])
    setLoading(false)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      weight: product.weight || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      is_popular: product.is_popular,
      is_active: product.is_active,
      old_price: product.old_price || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Удалить товар?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: formData.name,
      price: parseInt(formData.price),
      description: formData.description || null,
      weight: formData.weight || null,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      image_url: formData.image_url || null,
      is_popular: formData.is_popular,
      is_active: formData.is_active,
      old_price: formData.old_price ? parseInt(formData.old_price) : null
    }

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert([payload])
    }
    setShowModal(false)
    setEditingProduct(null)
    fetchProducts()
  }

  if (checking) {
    return <div className="p-6 text-center">Проверка прав доступа...</div>
  }

  if (!isAdmin) {
    return null
  }

  if (loading) {
    return <div className="p-6 text-center">Загрузка товаров...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-text-dark">
          Товары
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '', price: '', description: '', weight: '',
              category_id: '', image_url: '', is_popular: false, is_active: true, old_price: ''
            })
            setShowModal(true)
          }}
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition"
        >
          + Добавить товар
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="bg-warm-bg sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3">Фото</th>
                <th className="text-left py-3 px-3">Название</th>
                <th className="text-left py-3 px-3">Цена</th>
                <th className="text-left py-3 px-3">Категория</th>
                <th className="text-left py-3 px-3">Популярный</th>
                <th className="text-left py-3 px-3">Активен</th>
                <th className="text-left py-3 px-3"></th>
              <tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-warm-bg">
                  <td className="py-3 px-3">{product.id}</td>
                  <td className="py-3 px-3">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xl">🥖</div>
                    )}
                  </td>
                  <td className="py-3 px-3">{product.name}</td>
                  <td className="py-3 px-3">{product.price} ₽</td>
                  <td className="py-3 px-3">{product.categories?.name || '-'}</td>
                  <td className="py-3 px-3 text-center">{product.is_popular ? '✅' : ''}</td>
                  <td className="py-3 px-3 text-center">{product.is_active ? '✅' : '❌'}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => handleEdit(product)} className="text-primary mr-3 hover:opacity-70 transition">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:opacity-70 transition">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Название *"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="number"
                  placeholder="Цена *"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Вес (например, 350 г)"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="URL фото (Supabase Storage)"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Описание"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  rows="3"
                />
                <select
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">Без категории</option>
                  <option value="1">Хлеб</option>
                  <option value="2">Выпечка</option>
                  <option value="3">Пирожные</option>
                  <option value="4">Печенье</option>
                  <option value="5">Наборы</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={e => setFormData({...formData, is_popular: e.target.checked})}
                    className="accent-primary"
                  />
                  <span>Популярный товар</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="accent-primary"
                  />
                  <span>Активен</span>
                </label>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-400 transition"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts