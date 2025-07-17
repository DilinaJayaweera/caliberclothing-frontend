import React from 'react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateCartQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      updateCartQuantity(item.id, newQuantity);
    }
  };

  const itemTotal = (item.sellingPrice * item.quantity).toFixed(2);

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.productImage ? (
          <img 
            src={item.productImage} 
            alt={item.name}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-code">Code: {item.productNo}</p>
        <p className="cart-item-price">${item.sellingPrice.toFixed(2)} each</p>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="quantity-btn"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="quantity-btn"
            disabled={item.quantity >= item.quantityInStock}
          >
            +
          </button>
        </div>

        <div className="cart-item-total">
          <strong>${itemTotal}</strong>
        </div>

        <button 
          onClick={() => removeFromCart(item.id)}
          className="remove-btn"
          title="Remove from cart"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default CartItem;