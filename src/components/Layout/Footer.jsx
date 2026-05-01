import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-warm-card border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-text-mid text-sm">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Link to="/privacy" className="hover:text-primary transition">
            Политика конфиденциальности
          </Link>
          <Link to="/offer" className="hover:text-primary transition">
            Договор оферты
          </Link>
        </div>
        <p>© 2026 Хлебков. Пекарня с душой.</p>
      </div>
    </footer>
  )
}

export default Footer