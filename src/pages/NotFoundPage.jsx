import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-9xl mb-2 rotate-90 inline-block">🥐</div>
        <h1 className="text-4xl font-display font-bold text-text-dark mt-4 mb-4">
          404
        </h1>
        <p className="text-text-mid mb-8">
          Упс! Кажется, такой страницы не существует.<br />
          Её съели наши свежие круассаны.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage