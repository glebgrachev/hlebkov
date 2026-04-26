import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-white border-t border-[#EDE6DD] py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-[#6B635C] text-sm">
        <p>© 2026 Хлебков. Пекарня с душой.</p>
        <div className="mt-2 space-x-4">
          <Link to="/privacy" className="hover:text-[#D96E2A]">Конфиденциальность</Link>
          <Link to="/offer" className="hover:text-[#D96E2A]">Оферта</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer