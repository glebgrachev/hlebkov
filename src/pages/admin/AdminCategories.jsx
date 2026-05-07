import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { uploadImage } from '../../utils/uploadImage'

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    sort_order: 0
  })

  useEffect(() => {
    fetchCategoriesWithCount()
  }, [])

  const fetchCategoriesWithCount = async () => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    
    if (!categoriesData) {
      setCategories([])
      setLoading(false)
      return
    }

    const categoriesWithCount = await Promise.all(
      categoriesData.map(async (cat) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('is_active', true)
        
        return { ...cat, products_count: count || 0 }
      })
    )
    
    setCategories(categoriesWithCount)
    setLoading(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingImage(true)
    const imageUrl = await uploadImage(file, 'categories')
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl })
    }
    setUploadingImage(false)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image_url: category.image_url || '',
      sort_order: category.sort_order || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Удалить категорию? Товары в ней останутся без категории.')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchCategoriesWithCount()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      image_url: formData.image_url || null,
      sort_order: parseInt(formData.sort_order) || 0
    }

    if (editingCategory) {
      await supabase.from('categories').update(payload).eq('id', editingCategory.id)
    } else {
      await supabase.from('categories').insert([payload])
    }
    setShowModal(false)
    setEditingCategory(null)
    fetchCategoriesWithCount()
  }

  if (loading) return <div className="p-6 text-center">Загрузка категорий...</div>

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-text-dark">
          Категории
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', image_url: '', sort_order: 0 })
            setShowModal(true)
          }}
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition"
        >
          + Добавить категорию
        </button>
      </div>

      <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="bg-warm-bg sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3">ID</th>
                <th className="text-left py-3 px-3">Фото</th>
                <th className="text-left py-3 px-3">Название</th>
                <th className="text-left py-3 px-3">Товаров</th>
                <th className="text-left py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-text-mid">
                    Категорий нет
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border hover:bg-warm-bg">
                    <td className="py-3 px-3">{cat.id}</td>
                    <td className="py-3 px-3">
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={cat.name} 
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xl">📁</div>
                      )}
                    </td>
                    <td className="py-3 px-3">{cat.name}</td>
                    <td className="py-3 px-3">{cat.products_count}</td>
                    <td className="py-3 px-3">
                      <button onClick={() => handleEdit(cat)} className="text-primary mr-3 hover:opacity-70 transition">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:opacity-70 transition">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Название *"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="URL фото или загрузите файл"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition">
                    📁 Загрузить
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingImage && <p className="text-sm text-text-mid text-center">Загрузка фото...</p>}
                {formData.image_url && !uploadingImage && (
                  <div className="mt-2 flex justify-center">
                    <img src={formData.image_url} alt="preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
                <input
                  type="number"
                  placeholder="Порядок сортировки"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
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

export default AdminCategories