import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, LENS_UPGRADES } from '../data/products';

const CartContext = createContext(null);
const KEY = 'vesper.bag.v1';
export const FREE_SHIPPING = 250;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.filter((i) => getProduct(i.slug)) : [];
  } catch {
    return [];
  }
}

export function lineDetails(item) {
  const product = getProduct(item.slug);
  const colorway = product.colorways.find((c) => c.id === item.colorway) ?? product.colorways[0];
  const lens = LENS_UPGRADES.find((l) => l.id === item.lens) ?? LENS_UPGRADES[0];
  const unit = product.price + lens.price;
  return { product, colorway, lens, unit, total: unit * item.qty };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — the bag still works for this visit */
    }
  }, [items]);

  const add = useCallback((slug, colorway, lens = 'standard', qty = 1) => {
    const key = `${slug}|${colorway}|${lens}`;
    setItems((prev) => {
      const hit = prev.find((i) => i.key === key);
      if (hit) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { key, slug, colorway, lens, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + lineDetails(i).total, 0);
    return { items, count, subtotal, open, setOpen, add, setQty, clear };
  }, [items, open, add, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
