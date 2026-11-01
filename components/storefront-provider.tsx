"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import type { AccountSession, CartNotice, CartResponse, PublicCart } from "@/lib/cart-types";
import type { ShopifyVariant } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { deliveryLabel } from "@/lib/subscriptions";

export { moneyLabel };

type CartContextValue = {
  cart: PublicCart | null;
  cartOpen: boolean;
  busy: boolean;
  error: string | null;
  notices: CartNotice[];
  signedIn: boolean | null;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variant: ShopifyVariant, sellingPlanId?: string, quantity?: number) => Promise<void>;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: (code: string) => Promise<void>;
  goToCheckout: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "wipelo-shopify-cart-v1";
// Whose cart CART_KEY holds. Absent for a guest's cart. Lets a page load spot a signed-out session or a different customer.
const OWNER_KEY = "wipelo-cart-owner";
const SYNC_DELAY_MS = 1500;
const GENERIC_ERROR = "We couldn't update your cart. Please try again.";

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private browsing can refuse storage. The cart still works until the tab closes.
  }
}

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { response, payload: await response.json() as T };
}

export function useStorefrontCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useStorefrontCart must be used inside StorefrontProvider.");
  return value;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<PublicCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<CartNotice[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Only the newest request may write state, so a slow response can't overwrite a later one.
  const latestRequest = useRef(0);
  // Mutations run one at a time, in the order the shopper made them.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const confirmedCart = useRef<PublicCart | null>(null);
  const owner = useRef<string | null>(null);
  // What the customer record was last told, so a sync isn't sent for a change it just reported.
  const lastSynced = useRef("");

  const commit = useCallback((next: PublicCart | null) => {
    confirmedCart.current = next;
    setCart(next);
    writeStorage(CART_KEY, next?.id ?? null);
  }, []);

  const showNotices = useCallback((next: CartNotice[]) => {
    setNotices(next);
    if (next.some((notice) => notice.kind === "warning")) setCartOpen(true);
  }, []);

  const syncKey = (value: PublicCart | null) => (value ? `${value.id}|${value.totalQuantity}|${value.cost.subtotalAmount.amount}` : "");

  const loadLocalCart = useCallback(async (request: number) => {
    const cartId = readStorage(CART_KEY);
    if (!cartId) {
      if (request === latestRequest.current) commit(null);
      return;
    }
    try {
      const { response, payload } = await postJson<CartResponse>("/api/cart", { action: "load", cartId });
      if (request !== latestRequest.current) return;
      // A rejected or vanished ID is no use to anyone. An outage keeps it for next time.
      if (response.ok || response.status === 400) commit(payload.cart);
      if (payload.notices?.length) showNotices(payload.notices);
    } catch {
      // Keep showing the last known cart, and the next action will surface any lasting problem.
    }
  }, [commit, showNotices]);

  const hydrate = useCallback(async () => {
    const request = ++latestRequest.current;
    let session: AccountSession = { enabled: false, signedIn: false, owner: null };
    try {
      session = await (await fetch("/api/account/session", { cache: "no-store" })).json() as AccountSession;
    } catch {
      // Without an answer, treat the visitor as a guest. Their cart still works.
    }
    if (request !== latestRequest.current) return;
    setSignedIn(session.signedIn);
    owner.current = session.owner;

    // A customer's cart must not outlive their session on this browser, or carry over to the next account.
    const storedOwner = readStorage(OWNER_KEY);
    if (storedOwner && storedOwner !== session.owner) {
      writeStorage(CART_KEY, null);
      writeStorage(OWNER_KEY, null);
    }

    if (!session.signedIn) {
      await loadLocalCart(request);
      return;
    }
    try {
      const { response, payload } = await postJson<CartResponse>("/api/account/cart", { cartId: readStorage(CART_KEY) });
      if (request !== latestRequest.current) return;
      if (response.ok) {
        commit(payload.cart);
        writeStorage(OWNER_KEY, session.owner);
        lastSynced.current = syncKey(payload.cart);
        if (payload.notices.length) showNotices(payload.notices);
        return;
      }
      if (response.status === 401) setSignedIn(false);
      if (payload.notices?.length) showNotices(payload.notices);
    } catch {
      // Fall through to this browser's own cart, and try the account again next time.
    }
    await loadLocalCart(request);
  }, [commit, loadLocalCart, showNotices]);

  useEffect(() => {
    void hydrate();
    // Back from checkout restores this page from memory, with a possibly finished cart.
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void hydrate(); };
    // Coming back to the tab picks up changes made on another device.
    const onVisible = () => { if (document.visibilityState === "visible" && owner.current) void hydrate(); };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hydrate]);

  // Reports changes to the customer record. Debounced, so a burst of quantity clicks is one save.
  useEffect(() => {
    const key = syncKey(cart);
    if (!signedIn || !key || key === lastSynced.current) return;
    const timer = window.setTimeout(() => {
      lastSynced.current = key;
      void fetch("/api/account/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cartId: cart?.id }) }).catch(() => {
        // Checkout still works, and the next change retries the save.
        lastSynced.current = "";
      });
    }, SYNC_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cart, signedIn]);

  const cartMutation = useCallback((payload: Record<string, unknown>, optimistic?: (current: PublicCart) => PublicCart) => {
    const run = async (): Promise<boolean> => {
      const request = ++latestRequest.current;
      setBusy(true);
      setError(null);
      if (optimistic && confirmedCart.current) setCart(optimistic(confirmedCart.current));
      try {
        const { response, payload: result } = await postJson<CartResponse>("/api/cart", { ...payload, cartId: readStorage(CART_KEY) ?? confirmedCart.current?.id ?? null });
        if (!response.ok) throw new Error(result.error || GENERIC_ERROR);
        if (request === latestRequest.current) {
          commit(result.cart);
          // A cart created by a guest's first add belongs to whoever is signed in now.
          if (owner.current) writeStorage(OWNER_KEY, owner.current);
          showNotices(result.notices);
        }
        return true;
      } catch (cause) {
        if (request === latestRequest.current) {
          setCart(confirmedCart.current);
          setError(cause instanceof Error && cause.message !== "Failed to fetch" ? cause.message : GENERIC_ERROR);
          // The request may have landed before failing, so reload what Shopify really has.
          void loadLocalCart(++latestRequest.current);
        }
        return false;
      } finally {
        setBusy(false);
      }
    };
    const next = queue.current.then(run, run);
    queue.current = next;
    return next;
  }, [commit, loadLocalCart, showNotices]);

  const addToCart = useCallback(async (variant: ShopifyVariant, sellingPlanId?: string, quantity = 1) => {
    const added = await cartMutation({ action: "add", lines: [{ merchandiseId: variant.id, quantity, ...(sellingPlanId ? { sellingPlanId } : {}) }] });
    if (added) setCartOpen(true);
  }, [cartMutation]);

  const setLineQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await cartMutation({ action: "remove", lineIds: [lineId] }, (current) => withoutLine(current, lineId));
      return;
    }
    await cartMutation({ action: "update", lines: [{ id: lineId, quantity }] }, (current) => withLineQuantity(current, lineId, quantity));
  }, [cartMutation]);

  const removeLine = useCallback(async (lineId: string) => {
    await cartMutation({ action: "remove", lineIds: [lineId] }, (current) => withoutLine(current, lineId));
  }, [cartMutation]);

  const applyDiscount = useCallback(async (code: string) => {
    const existing = confirmedCart.current?.discountCodes.filter((item) => item.applicable).map((item) => item.code) ?? [];
    await cartMutation({ action: "discount", codes: [...existing, code] });
  }, [cartMutation]);

  const removeDiscount = useCallback(async (code: string) => {
    const remaining = confirmedCart.current?.discountCodes.map((item) => item.code).filter((item) => item !== code) ?? [];
    await cartMutation({ action: "discount", codes: remaining });
  }, [cartMutation]);

  // Fetches the URL at the moment of leaving, as Shopify advises. Signed-in shoppers also get their identity
  // re-attached with a current token. Any failure falls back to the URL already held, because checkout must not get stuck.
  const goToCheckout = useCallback(async () => {
    const current = confirmedCart.current;
    if (!current) return;
    let destination = current.checkoutUrl;
    try {
      const { response, payload } = signedIn
        ? await postJson<CartResponse>("/api/account/cart", { cartId: current.id, checkout: true })
        : await postJson<CartResponse>("/api/cart", { action: "load", cartId: current.id });
      if (response.ok && payload.cart) destination = payload.cart.checkoutUrl;
    } catch {
      // Keep the URL already held.
    }
    window.location.assign(destination);
  }, [signedIn]);

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
    notices,
    signedIn,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    addToCart,
    setLineQuantity,
    removeLine,
    applyDiscount,
    removeDiscount,
    goToCheckout,
  }), [cart, cartOpen, busy, error, notices, signedIn, addToCart, setLineQuantity, removeLine, applyDiscount, removeDiscount, goToCheckout]);

  return <CartContext.Provider value={value}>{children}<CartDrawer /></CartContext.Provider>;
}

// Optimistic previews only change quantity. Prices and totals always come from Shopify's next response.
function withLineQuantity(cart: PublicCart, lineId: string, quantity: number): PublicCart {
  const nodes = cart.lines.nodes.map((line) => (line.id === lineId ? { ...line, quantity } : line));
  return { ...cart, totalQuantity: nodes.reduce((sum, line) => sum + line.quantity, 0), lines: { nodes } };
}

function withoutLine(cart: PublicCart, lineId: string): PublicCart {
  const nodes = cart.lines.nodes.filter((line) => line.id !== lineId);
  return { ...cart, totalQuantity: nodes.reduce((sum, line) => sum + line.quantity, 0), lines: { nodes } };
}

function DiscountForm() {
  const { cart, busy, applyDiscount, removeDiscount } = useStorefrontCart();
  const [code, setCode] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;
    await applyDiscount(value);
    setCode("");
  };
  return <div className="dr-discount">
    <form onSubmit={(event) => void submit(event)}>
      <label className="sr-only" htmlFor="cart-discount">Discount code</label>
      <input id="cart-discount" value={code} maxLength={64} placeholder="Discount code" autoComplete="off" onChange={(event) => setCode(event.target.value)} />
      <button disabled={busy || !code.trim()}>Apply</button>
    </form>
    {cart?.discountCodes.filter((item) => item.applicable).map((item) => <span className="dr-discount-chip" key={item.code}>{item.code}<button type="button" disabled={busy} aria-label={`Remove discount code ${item.code}`} onClick={() => void removeDiscount(item.code)}>×</button></span>)}
  </div>;
}

function CartDrawer() {
  const { cart, cartOpen, busy, error, notices, closeCart, setLineQuantity, removeLine, goToCheckout } = useStorefrontCart();
  const [leaving, setLeaving] = useState(false);
  const lines = cart?.lines.nodes ?? [];
  const count = cart?.totalQuantity ?? 0;
  const hasSubscription = lines.some((line) => line.sellingPlanAllocation?.sellingPlan.recurringDeliveries);
  const checkout = (event: MouseEvent) => {
    event.preventDefault();
    if (leaving) return;
    setLeaving(true);
    void goToCheckout().finally(() => setLeaving(false));
  };

  return <>
    <button className={`scrim${cartOpen ? " on" : ""}`} aria-label="Close cart" onClick={closeCart} />
    <aside className={`drawer${cartOpen ? " on" : ""}`} aria-label="Cart" aria-modal="true" role="dialog" aria-hidden={!cartOpen} inert={!cartOpen}>
      <div className="dr-head"><span className="mono">// Your cart · {count}</span><button className="dr-close" aria-label="Close cart" onClick={closeCart}>×</button></div>
      <div className="dr-ship"><div className="ship-msg">{count ? "Your order is ready for checkout." : "Your cart is empty."}</div><div className="ship-bar"><i style={{ width: count ? "100%" : "0%" }} /></div></div>
      {notices.length > 0 && <ul className="dr-notices" aria-live="polite">{notices.map((notice) => <li key={notice.message} className={`is-${notice.kind}`}>{notice.message}</li>)}</ul>}
      <div className="dr-items" aria-busy={busy}>
        {!lines.length ? <div className="dr-empty">Your cart is empty.<br />Find the wipe for your kind of care.</div> : lines.map((line) => <div className="dr-item" key={line.id}>
          <div className="di-pack">{line.merchandise.image ? <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.product.title} /> : "W"}</div>
          <div className="di-copy"><a className="di-name" href={`/products/${line.merchandise.product.handle}`}>{line.merchandise.product.title}</a><div className="di-meta">{line.merchandise.title}{line.sellingPlanAllocation ? ` · ${deliveryLabel(line.sellingPlanAllocation.sellingPlan)}` : ""}</div>
            <div className="dr-qty"><button disabled={busy} onClick={() => void setLineQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button disabled={busy || line.quantity >= 99} onClick={() => void setLineQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button><button className="cart-remove" disabled={busy} onClick={() => void removeLine(line.id)}>Remove</button></div>
          </div><div className="di-price">{moneyLabel(line.cost.totalAmount)}</div>
        </div>)}
      </div>
      <div className="dr-foot">
        {error && <p className="cart-error" role="alert">{error}</p>}
        {count > 0 && <DiscountForm />}
        <div className="dr-total"><span>Subtotal</span><b>{moneyLabel(cart?.cost.subtotalAmount) || moneyLabel({ amount: "0", currencyCode: "USD" })}</b></div>
        {count > 0 && cart ? <a className="btn btn-ink btn-wide cart-checkout" href={cart.checkoutUrl} aria-busy={leaving} onClick={checkout}>Checkout securely <span>→</span></a> : <button className="btn btn-ink btn-wide" onClick={closeCart}>Continue shopping</button>}
        <div className="dr-guar">{hasSubscription ? "Subscriptions renew automatically until you cancel. You’ll see the full terms at checkout." : "You’ll complete checkout and payment in the next step."}</div>
      </div>
    </aside>
  </>;
}
