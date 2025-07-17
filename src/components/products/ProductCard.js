import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, showActions = true, onEdit, onDelete }) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const { user } = useAuth();
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useCart();

  const handleAddToCart = () => {
    if (user?.role === 'CUSTOMER') {
      addToCart(product, quantity);
      setShowQuantityInput(false);
      setQuantity(1);
    }
  };

  const handleAddToWishlist = () => {
    if (user?.role === 'CUSTOMER') {
      addToWishlist(product);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const canManageProduct = user?.role === 'CEO' || user?.role === 'PRODUCT_MANAGER';

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        {product.productImage ? (
          <img 
            src={product.productImage} 
            alt={product.name}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
        
        {/* Stock Status */}
        <div className={`stock-status ${product.quantityInStock <= 0 ? 'out-of-stock' : 
                                      product.quantityInStock <= 10 ? 'low-stock' : 'in-stock'}`}>
          {product.quantityInStock <= 0 ? 'Out of Stock' : 
           product.quantityInStock <= 10 ? 'Low Stock' : 'In Stock'}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-category">
          {product.productCategory?.name || 'Uncategorized'}
        </div>
        
        <h3 className="product-name">{product.name}</h3>
        
        <p className="product-description">{product.description}</p>
        
        <div className="product-details">
          <div className="product-code">Code: {product.productNo}</div>
          <div className="product-stock">Stock: {product.quantityInStock}</div>
        </div>

        {/* Pricing */}
        <div className="product-pricing">
          <div className="selling-price">
            {formatPrice(product.sellingPrice)}
          </div>
          {product.costPrice && (
            <div className="cost-price">
              Cost: {formatPrice(product.costPrice)}
            </div>
          )}
          {product.profitPercentage && (
            <div className="profit-margin">
              Profit: {product.profitPercentage}%
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="product-actions">
          {isCustomer && (
            <>
              {/* Add to Cart */}
              <div className="cart-section">
                {!showQuantityInput ? (
                  <button 
                    onClick={() => setShowQuantityInput(true)}
                    disabled={product.quantityInStock <= 0 || isInCart(product.id)}
                    className={`btn ${isInCart(product.id) ? 'btn-success' : 'btn-primary'}`}
                  >
                    {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                ) : (
                  <div className="quantity-input-section">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max={product.quantityInStock}
                        className="quantity-input"
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(product.quantityInStock, quantity + 1))}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="quantity-actions">
                      <button onClick={handleAddToCart} className="btn btn-sm btn-primary">
                        Add
                      </button>
                      <button 
                        onClick={() => {
                          setShowQuantityInput(false);
                          setQuantity(1);
                        }} 
                        className="btn btn-sm btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Wishlist */}
              <button 
                onClick={handleAddToWishlist}
                disabled={isInWishlist(product.id)}
                className={`btn btn-outline ${isInWishlist(product.id) ? 'btn-success' : ''}`}
              >
                {isInWishlist(product.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
              </button>
            </>
          )}

          {/* Management Actions for CEO/Product Manager */}
          {canManageProduct && (
            <div className="management-actions">
              <button 
                onClick={() => onEdit && onEdit(product)}
                className="btn btn-outline btn-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete && onDelete(product.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Supplier Info (for internal users) */}
      {user && user.role !== 'CUSTOMER' && product.supplierDetails && (
        <div className="supplier-info">
          <small>Supplier: {product.supplierDetails.supplierName}</small>
        </div>
      )}
    </div>
  );
};

export default ProductCard;