import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border hover-lift transition-all group">
      <div className="p-6 text-center">
        <div className="text-6xl mb-4 scale-hover inline-block">
          {product.image_url || '🥖'}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-text-dark mb-1 hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        {product.weight && <p className="text-xs text-text-mid mb-2">{product.weight}</p>}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-bold text-text-dark">{product.price} ₽</span>
          {product.old_price && (
            <span className="text-sm text-text-mid line-through">{product.old_price} ₽</span>
          )}
        </div>
        <button
          // onClick={() => addToCart(product)} // Пока закомментировано
          className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition-all scale-hover"
        >
          В корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;