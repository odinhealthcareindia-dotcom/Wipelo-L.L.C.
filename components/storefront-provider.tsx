"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ShopifyCart, ShopifyVariant } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";

export { moneyLabel };

type CartContextValue = {
  cart: ShopifyCart | null;
  cartOpen: boolean;
  busy: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variant: ShopifyVariant, sellingPlanId?: string) => Promise<void>;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "wipelo-shopify-cart-v1";

export function useStorefrontCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useStorefrontCart must be used inside StorefrontProvider.");
  return value;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cartId = window.localStorage.getItem(STORAGE_KEY);
    if (!cartId) return;
    fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Your cart is no longer available.");
        setCart(payload.cart);
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, []);

  const cartMutation = useCallback(async (payload: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Shopify could not update your cart.");
      const nextCart = result.cart as ShopifyCart | null;
      setCart(nextCart);
      if (nextCart?.id) window.localStorage.setItem(STORAGE_KEY, nextCart.id);
      else window.localStorage.removeItem(STORAGE_KEY);
      return nextCart;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Shopify could not update your cart.");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const addToCart = useCallback(async (variant: ShopifyVariant, sellingPlanId?: string) => {
    const action = cart?.id ? "add" : "create";
    const result = await cartMutation({
      action,
      ...(cart?.id ? { cartId: cart.id } : {}),
      lines: [{ merchandiseId: variant.id, quantity: 1, ...(sellingPlanId ? { sellingPlanId } : {}) }],
    });
    if (result) setCartOpen(true);
  }, [cart?.id, cartMutation]);

  const setLineQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!cart?.id) return;
    if (quantity <= 0) {
      await cartMutation({ action: "remove", cartId: cart.id, lineIds: [lineId] });
      return;
    }
    await cartMutation({ action: "update", cartId: cart.id, lines: [{ id: lineId, quantity }] });
  }, [cart?.id, cartMutation]);

  const removeLine = useCallback(async (lineId: string) => {
    if (cart?.id) await cartMutation({ action: "remove", cartId: cart.id, lineIds: [lineId] });
  }, [cart?.id, cartMutation]);

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    cartOpen,
    busy,
    error,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    addToCart,
    setLineQuantity,
    removeLine,
  }), [cart, cartOpen, busy, error, addToCart, setLineQuantity, removeLine]);

  return <CartContext.Provider value={value}>{children}<CartDrawer /></CartContext.Provider>;
}

function CartDrawer() {
  const { cart, cartOpen, busy, error, closeCart, setLineQuantity, removeLine } = useStorefrontCart();
  const lines = cart?.lines.nodes ?? [];
  const count = cart?.totalQuantity ?? 0;

  return <>
    <button className={`scrim${cartOpen ? " on" : ""}`} aria-label="Close cart" onClick={closeCart} />
    <aside className={`drawer${cartOpen ? " on" : ""}`} aria-label="Cart" aria-modal="true" role="dialog" aria-hidden={!cartOpen}>
      <div className="dr-head"><span className="mono">// Your cart · {count}</span><button className="dr-close" aria-label="Close cart" onClick={closeCart}>×</button></div>
      <div className="dr-ship"><div className="ship-msg">{count ? "Your order is ready for checkout." : "Your cart is empty."}</div><div className="ship-bar"><i style={{ width: count ? "100%" : "0%" }} /></div></div>
      <div className="dr-items">
        {!lines.length ? <div className="dr-empty">Your cart is empty.<br />Your body has moments — we engineered for them.</div> : lines.map((line) => <div className="dr-item" key={line.id}>
          <div className="di-pack">{line.merchandise.image ? <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.product.title} /> : "W"}</div>
          <div className="di-copy"><a className="di-name" href={`/products/${line.merchandise.product.handle}`}>{line.merchandise.product.title}</a><div className="di-meta">{line.merchandise.title}{line.sellingPlanAllocation ? ` · ${line.sellingPlanAllocation.sellingPlan.name}` : ""}</div>
            <div className="dr-qty"><button disabled={busy} onClick={() => void setLineQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button disabled={busy} onClick={() => void setLineQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button><button className="cart-remove" disabled={busy} onClick={() => void removeLine(line.id)}>Remove</button></div>
          </div><div className="di-price">{moneyLabel(line.cost.totalAmount)}</div>
        </div>)}
      </div>
      <div className="dr-foot">
        {error && <p className="cart-error" role="alert">{error}</p>}
        <div className="dr-total"><span>Subtotal</span><b>{moneyLabel(cart?.cost.subtotalAmount) || moneyLabel({ amount: "0", currencyCode: "USD" })}</b></div>
        {cart?.checkoutUrl ? <a className="btn btn-ink btn-wide cart-checkout" href={cart.checkoutUrl}>Checkout securely <span>→</span></a> : <button className="btn btn-ink btn-wide" disabled={!count || busy} onClick={closeCart}>Continue shopping</button>}
        <div className="dr-guar">Checkout and payment are handled securely by Shopify.</div>
      </div>
    </aside>
  </>;
}
