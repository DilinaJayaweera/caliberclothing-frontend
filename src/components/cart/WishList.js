import React from 'react';
import { useCart } from '../../context/CartContext';

const Wishlist = ({ isOpen, onClose }) => {
  const { wishlistItems, removeFromWishlist, addToCart, isInCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(item.id);
  };

  if (!isOpen) return null;

  return (
    <div className="wishlist-overlay">
      <div className="wishlist-sidebar">
        <div className="wishlist-header">
          <h3>Wishlist</h3>
          <button onClick={onClose} className="wishlist-close">×</button>
        </div>

        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-wishlist-icon">♡</div>
              <h4>Your wishlist is empty</h4>
              <p>Add products you love to save them for later!</p>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlistItems.map(item => (
                <div key={item.id} className="wishlist-item">
                  <div className="wishlist-item-image">
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

                  <div className="wishlist-item-details">
                    <h4 className="wishlist-item-name">{item.name}</h4>
                    <p className="wishlist-item-code">Code: {item.productNo}</p>
                    <p className="wishlist-item-price">${item.sellingPrice.toFixed(2)}</p>
                    
                    <div className="wishlist-item-actions">
                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={item.quantityInStock <= 0 || isInCart(item.id)}
                        className={`btn btn-sm ${isInCart(item.id) ? 'btn-success' : 'btn-primary'}`}
                      >
                        {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                      </button>
                      
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="btn btn-outline btn-sm"
                      >
                        Remove
                      </button>
                    </div>

                    {item.quantityInStock <= 0 && (
                      <p className="out-of-stock-notice">Out of Stock</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;