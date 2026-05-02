import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Корзина пуста</h1>
        <p className="text-text-mid mb-8">Добавьте товары из каталога</p>
        <Link to="/catalog" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Корзина</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Список товаров */}
        <div className="flex-1">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b border-border py-4">
              {/* Изображение товара */}
              <div className="w-16 h-16 flex-shrink-0">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-4xl">🥖</div>
                )}
              </div>
              
              {/* Информация о товаре */}
              <div className="flex-1">
                <Link to={`/product/${item.id}`} className="font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <div className="text-text-mid text-sm">{item.price} ₽</div>
              </div>
              
              {/* Количество */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-border hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-border hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              {/* Сумма за позицию */}
              <div className="w-24 text-right font-semibold">
                {item.price * item.quantity} ₽
              </div>
              
              {/* Удалить */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Итого и оформление */}
        <div className="lg:w-80 bg-warm-bg rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Итого</h2>
          <div className="text-2xl font-bold text-primary mb-6">{totalPrice} ₽</div>
          <Link to="/checkout">
            <button className="w-full bg-primary text-white py-3 rounded-full hover:bg-primary-dark transition">
              Оформить заказ
            </button>
          </Link>
          <button
            onClick={clearCart}
            className="w-full text-text-mid text-sm mt-4 hover:text-primary transition"
          >
            Очистить корзину
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage