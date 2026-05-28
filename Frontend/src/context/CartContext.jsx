import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty, size, color) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.product === product._id && item.size === size && item.color === color
      );

      if (existingItem) {
        return prev.map((item) =>
          item.product === product._id && item.size === size && item.color === color
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            qty,
            size,
            color,
          },
        ];
      }
    });
    // Auto-open cart drawer on adding
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQty = (productId, size, color, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product === productId && item.size === size && item.color === color
          ? { ...item, qty: Number(qty) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};
