import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Categories from '../components/Sections/Categories'
import Products from '../components/Sections/Products'

function MainPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-20 text-center fade-in">
          <h1 className="text-5xl font-display font-bold text-[#2D2B26] mb-4">
            Свежая выпечка на заказ
          </h1>
          <p className="text-[#6B635C] text-lg mb-8">
            Булочки, круассаны, пирожные — по настоящим рецептам
          </p>
          <button className="bg-[#D96E2A] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-[#B8531E] transition-all scale-hover">
            Смотреть каталог
          </button>
        </div>

        <Categories />
        <Products />
      </main>
      <Footer />
    </div>
  )
}

export default MainPage