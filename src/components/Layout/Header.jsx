import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#FDF8F0]/95 backdrop-blur-sm border-b border-[#EDE6DD]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-bold text-[#2D2B26] scale-hover inline-block">
          Хлебков
        </Link>
        <Link to="/cart" className="relative scale-hover">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6L6 21L18 21L18 6M6 6L4 6M6 6L9 3M18 6L20 6M18 6L15 3" stroke="currentColor" strokeLinecap="round"/>
            <circle cx="9" cy="15" r="1" fill="currentColor"/>
            <circle cx="15" cy="15" r="1" fill="currentColor"/>
          </svg>
        </Link>
      </div>
    </header>
  )
}

export default Header