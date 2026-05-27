// // "use client";
// // import React, { createContext, useContext, useState } from 'react';

// // const CartContext = createContext({
// //   isCartOpen: false,
// //   setCartOpen: (open: boolean) => {},
// //   cartCount: 0,
// //   addToCart: () => {},
// // });

// // export const CartProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [isCartOpen, setCartOpen] = useState(false);
// //   const [cartCount, setCartCount] = useState(0);

// //   const addToCart = () => {
// //     setCartCount(prev => prev + 1);
// //     setCartOpen(true); // Automatically open drawer when item is added
// //   };

// //   return (
// //     <CartContext.Provider value={{ isCartOpen, setCartOpen, cartCount, addToCart }}>
// //       {children}
// //     </CartContext.Provider>
// //   );
// // };

// // export const useCart = () => useContext(CartContext);

// "use client";
// import React, { createContext, useContext, useState } from 'react';

// // Define what a Cart Item looks like
// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
// }

// const CartContext = createContext({
//   isCartOpen: false,
//   setCartOpen: (open: boolean) => {},
//   cartItems: [] as CartItem[],
//   addToCart: (item: CartItem) => {},
// });

// export const CartProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isCartOpen, setCartOpen] = useState(false);
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   const addToCart = (item: CartItem) => {
//     setCartItems((prev) => [...prev, item]); // Add the new item to the list
//     setCartOpen(true); // Open the drawer
//   };

//   return (
//     <CartContext.Provider value={{ isCartOpen, setCartOpen, cartItems, addToCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);


"use client";
import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number; // Added quantity
}

const CartContext = createContext({
  isCartOpen: false,
  setCartOpen: (open: boolean) => {},
  cartItems: [] as CartItem[],
  addToCart: (item: Omit<CartItem, 'quantity'>) => {},
  updateQuantity: (id: string, delta: number) => {},
  removeItem: (id: string) => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    // setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ isCartOpen, setCartOpen, cartItems, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);