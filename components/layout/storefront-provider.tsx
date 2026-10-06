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
    <button className={`scrim fixed inset-0 [background:rgba(11,11,11,.45)] [opacity:0] pointer-events-none [transition:opacity_.35s] [z-index:70] [&.on]:[opacity:1] [&.on]:[pointer-events:auto]${cartOpen ? " on" : ""}`} aria-label="Close cart" onClick={closeCart} />
    <aside className={`drawer fixed [top:0] [right:0] [bottom:0] [width:min(430px,94vw)] bg-wipelo-cream [z-index:71] [transform:translateX(103%)] [transition:transform_.45s_var(--ease)] flex flex-col [box-shadow:-30px_0_80px_-30px_rgba(11,11,11,.4)] [&.on]:[transform:none] max-[820px]:[&:not(.on)]:[box-shadow:none]${cartOpen ? " on" : ""}`} aria-label="Cart" aria-modal="true" role="dialog" aria-hidden={!cartOpen}>
      <div className="dr-head flex items-center justify-between [padding:22px_26px] [border-bottom:1px_solid_var(--hairline)] [&_.mono]:[opacity:.6]"><span className="mono font-wipelo-mono [font-size:11px] [letter-spacing:.14em] uppercase">// Your cart · {count}</span><button className="dr-close [font-size:22px] [line-height:1] [padding:4px_8px]" aria-label="Close cart" onClick={closeCart}>×</button></div>
      <div className="dr-ship [padding:18px_26px] [border-bottom:1px_solid_var(--hairline)] [&_.ship-msg]:[font-size:12.5px] [&_.ship-msg]:[margin-bottom:10px] [&_.ship-msg_b]:[color:var(--teal-deep)]"><div className="ship-msg">{count ? "Your order is ready for checkout." : "Your cart is empty."}</div><div className="ship-bar [height:5px] bg-wipelo-stone [border-radius:99px] overflow-hidden [&_i]:[display:block] [&_i]:[height:100%] [&_i]:[background:var(--teal)] [&_i]:[border-radius:99px] [&_i]:[transition:width_.5s_var(--ease)]"><i style={{ width: count ? "100%" : "0%" }} /></div></div>
      <div className="dr-items [flex:1] [overflow-y:auto] [padding:10px_26px]">
        {!lines.length ? <div className="dr-empty [padding:48px_0] text-center [color:var(--ink-40)] [font-size:14px]">Your cart is empty.<br />Your body has moments — we engineered for them.</div> : lines.map((line) => <div className="dr-item grid [grid-template-columns:64px_1fr_auto] [gap:14px] [padding:18px_0] [border-bottom:1px_solid_var(--hairline)] items-center [&_.di-pack]:[width:64px] [&_.di-pack]:[height:84px] [&_.di-pack]:[border-radius:7px] [&_.di-pack]:[display:flex] [&_.di-pack]:[align-items:flex-end] [&_.di-pack]:[padding:8px] [&_.di-pack]:[font-family:var(--fr)] [&_.di-pack]:[font-weight:600] [&_.di-pack]:[font-size:11px] [&_.di-pack]:[color:#fff] [&_.di-pack]:[background:var(--teal)] [&_.di-name]:[font:600_14px/1.3_var(--in)] [&_.di-meta]:[font-family:var(--mo)] [&_.di-meta]:[font-size:9px] [&_.di-meta]:[letter-spacing:.08em] [&_.di-meta]:[text-transform:uppercase] [&_.di-meta]:[color:var(--ink-40)] [&_.di-meta]:[margin-top:4px] [&_.di-price]:[font:600_14px/1_var(--in)]" key={line.id}>
          <div className="di-pack [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[object-fit:cover] [&_img]:[border-radius:7px]">{line.merchandise.image ? <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.product.title} /> : "W"}</div>
          <div className="di-copy [min-width:0]"><a className="di-name block" href={`/products/${line.merchandise.product.handle}`}>{line.merchandise.product.title}</a><div className="di-meta">{line.merchandise.title}{line.sellingPlanAllocation ? ` · ${line.sellingPlanAllocation.sellingPlan.name}` : ""}</div>
            <div className="dr-qty flex items-center [gap:10px] [margin-top:8px] [&_button]:[width:24px] [&_button]:[height:24px] [&_button]:[border:1px_solid_var(--hairline)] [&_button]:[border-radius:6px] [&_button]:[font-size:13px] [&_span]:[font:600_13px/1_var(--in)] [&_span]:[min-width:16px] [&_span]:[text-align:center]"><button disabled={busy} onClick={() => void setLineQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button disabled={busy} onClick={() => void setLineQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button><button className="cart-remove [font:400_10px/1_var(--in)] [text-decoration:underline] [padding-left:7px]" disabled={busy} onClick={() => void removeLine(line.id)}>Remove</button></div>
          </div><div className="di-price">{moneyLabel(line.cost.totalAmount)}</div>
        </div>)}
      </div>
      <div className="dr-foot [padding:20px_26px_26px] [border-top:1px_solid_var(--hairline)] bg-white">
        {error && <p className="cart-error [color:#a13030] [font-size:12px] [margin-bottom:12px]" role="alert">{error}</p>}
        <div className="dr-total flex justify-between [font:600_16px/1_var(--in)] [margin-bottom:6px]"><span>Subtotal</span><b>{moneyLabel(cart?.cost.subtotalAmount) || moneyLabel({ amount: "0", currencyCode: "USD" })}</b></div>
        {cart?.checkoutUrl ? <a className="btn btn-ink btn-wide cart-checkout inline-flex items-center justify-center [gap:10px] [font:600_15px/1_var(--in)] [letter-spacing:.01em] [padding:18px_34px] [border-radius:999px] [transition:transform_.35s_var(--ease),box-shadow_.35s_var(--ease),background_.2s] [will-change:transform] bg-wipelo-abyss text-wipelo-cream w-full text-center [&:hover]:[transform:translateY(-2px)] [&:active]:[transform:translateY(0)] [&:hover]:[background:#1d1d1d] [&_.sub]:[font:400_12px/1_var(--mo)] [&_.sub]:[opacity:.75] [&_.sub]:[letter-spacing:.04em] [&_.ar]:[display:inline-block] [&_.ar]:[transition:transform_.3s_var(--ease)] [&:hover_.ar]:[transform:translateX(4px)] [&:focus-visible]:[outline:3px_solid_var(--teal)] [&:focus-visible]:[outline-offset:4px]" href={cart.checkoutUrl}>Checkout securely <span>→</span></a> : <button className="btn btn-ink btn-wide inline-flex items-center justify-center [gap:10px] [font:600_15px/1_var(--in)] [letter-spacing:.01em] [padding:18px_34px] [border-radius:999px] [transition:transform_.35s_var(--ease),box-shadow_.35s_var(--ease),background_.2s] [will-change:transform] bg-wipelo-abyss text-wipelo-cream w-full [&:hover]:[transform:translateY(-2px)] [&:active]:[transform:translateY(0)] [&:hover]:[background:#1d1d1d] [&_.sub]:[font:400_12px/1_var(--mo)] [&_.sub]:[opacity:.75] [&_.sub]:[letter-spacing:.04em] [&_.ar]:[display:inline-block] [&_.ar]:[transition:transform_.3s_var(--ease)] [&:hover_.ar]:[transform:translateX(4px)] [&:focus-visible]:[outline:3px_solid_var(--teal)] [&:focus-visible]:[outline-offset:4px]" disabled={!count || busy} onClick={closeCart}>Continue shopping</button>}
        <div className="dr-guar [font-size:11.5px] [color:var(--ink-40)] [margin:10px_0_14px] text-center">Checkout and payment are handled securely by Shopify.</div>
      </div>
    </aside>
  </>;
}
