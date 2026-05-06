import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.redirect || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      console.log('1. Вход успешен')
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('2. User:', user)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      console.log('3. Profile:', profile)
      console.log('4. Role:', profile?.role)
      console.log('5. Is admin?', profile?.role === 'admin')

      if (profile?.role === 'admin') {
        console.log('6. Редирект на /admin/products')
        navigate('/admin/products')
      } else {
        console.log('6. Редирект на', redirectTo)
        navigate(redirectTo)
      }
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto card-bg rounded-2xl p-8">
        <h1 className="text-2xl font-display font-bold text-center mb-6">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-dark font-semibold mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-text-dark font-semibold mb-1">Пароль *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:border-primary outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition"
          >
            {loading ? 'Подождите...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-text-mid hover:text-primary transition"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage