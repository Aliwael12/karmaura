"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type CartMap,
  countOf,
  linesOf,
  shippingOf,
  subtotalOf,
} from "@/lib/commerce";
import { getProduct } from "@/lib/products";

/* ── shapes ──────────────────────────────────────────────────────── */

export type User = { name: string; email: string; since: string };

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};

export type OrderLine = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type OrderStatus = "In the atelier" | "On its way" | "Delivered";

export type Order = {
  id: string;
  placedAt: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  ship: { name: string; line1: string; city: string; postcode: string };
  status: OrderStatus;
};

export type Repair = {
  id: string;
  piece: string;
  note: string;
  openedAt: string;
  status: "Received" | "Being mended" | "Sent back";
};

type Toast = { key: number; message: string };

type Persisted = {
  cart: CartMap;
  saved: string[];
  user: User | null;
  orders: Order[];
  addresses: Address[];
  repairs: Repair[];
};

const STORAGE_KEY = "karmaura:v1";

/* a signed-in demo account arrives with a little history behind it */
const SEED_ORDERS: Order[] = [
  {
    id: "KM-4791",
    placedAt: "2026-05-14T10:20:00.000Z",
    lines: [
      { id: "sahel", name: "Sahel Bowl", qty: 2, price: 4800 },
      { id: "halim", name: "Halim Cup Set", qty: 1, price: 3700 },
    ],
    subtotal: 13300,
    shipping: 0,
    total: 13300,
    ship: {
      name: "Nadia Farouk",
      line1: "8 Sharia Ismail Mohamed",
      city: "Cairo",
      postcode: "11211",
    },
    status: "Delivered",
  },
  {
    id: "KM-4803",
    placedAt: "2026-07-02T16:05:00.000Z",
    lines: [{ id: "layla", name: "Layla Throw", qty: 1, price: 12000 }],
    subtotal: 12000,
    shipping: 900,
    total: 12900,
    ship: {
      name: "Nadia Farouk",
      line1: "8 Sharia Ismail Mohamed",
      city: "Cairo",
      postcode: "11211",
    },
    status: "On its way",
  },
];

const SEED_ADDRESSES: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    name: "Nadia Farouk",
    line1: "8 Sharia Ismail Mohamed",
    city: "Cairo",
    postcode: "11211",
    country: "Egypt",
    isDefault: true,
  },
  {
    id: "addr-studio",
    label: "Studio",
    name: "Nadia Farouk",
    line1: "3 Sharia Bahgat Ali, Zamalek",
    city: "Cairo",
    postcode: "11561",
    country: "Egypt",
    isDefault: false,
  },
];

const SEED_REPAIRS: Repair[] = [
  {
    id: "RP-118",
    piece: "Sahel Bowl",
    note: "A chip on the rim — dropped a spoon in it.",
    openedAt: "2026-08-04T09:00:00.000Z",
    status: "Being mended",
  },
];

/* ── context ─────────────────────────────────────────────────────── */

type StoreValue = {
  hydrated: boolean;

  cart: CartMap;
  lines: ReturnType<typeof linesOf>;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;

  user: User | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;

  orders: Order[];
  placeOrder: (details: { ship: Order["ship"] }) => Order | null;

  addresses: Address[];
  addAddress: (a: Omit<Address, "id" | "isDefault">) => void;
  removeAddress: (id: string) => void;
  makeDefaultAddress: (id: string) => void;

  repairs: Repair[];
  openRepair: (piece: string, note: string) => void;

  toasts: Toast[];
  flash: (message: string) => void;

  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  /** bumps every time something lands in the bag, so the header can pulse */
  bagPulse: number;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartMap>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagPulse, setBagPulse] = useState(0);
  const toastKey = useRef(0);

  /* Read the browser's copy once, after mount, then mirror every change back.
     This has to be an effect: localStorage does not exist during the server
     render, and reading it in a lazy initialiser would make the first client
     render disagree with the HTML that came off the server. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<Persisted>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
        if (stored.cart) setCart(stored.cart);
        if (stored.saved) setSaved(stored.saved);
        if (stored.user) setUser(stored.user);
        if (stored.orders) setOrders(stored.orders);
        if (stored.addresses) setAddresses(stored.addresses);
        if (stored.repairs) setRepairs(stored.repairs);
      }
    } catch {
      /* a corrupt or blocked store just means we start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = {
      cart,
      saved,
      user,
      orders,
      addresses,
      repairs,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* private mode — the session still works, it just will not survive */
    }
  }, [hydrated, cart, saved, user, orders, addresses, repairs]);

  /* the menu and the drawer both lock the page behind them */
  useEffect(() => {
    const locked = cartOpen || menuOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, menuOpen]);

  const flash = useCallback((message: string) => {
    const key = ++toastKey.current;
    setToasts((current) => [...current, { key, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.key !== key));
    }, 2600);
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + qty }));
      setBagPulse((n) => n + 1);
      const product = getProduct(id);
      flash((product ? product.name : "Added") + " — added to your bag");
    },
    [flash],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setCart((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => setQty(id, 0), [setQty]);
  const clearCart = useCallback(() => setCart({}), []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggleSaved = useCallback(
    (id: string) => {
      const product = getProduct(id);
      setSaved((current) => {
        if (current.includes(id)) {
          flash((product ? product.name : "Piece") + " — removed from saved");
          return current.filter((s) => s !== id);
        }
        flash((product ? product.name : "Piece") + " — saved");
        return [...current, id];
      });
    },
    [flash],
  );

  const signIn = useCallback(
    (email: string, name?: string) => {
      const nice =
        name?.trim() ||
        email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "Friend";
      setUser({
        name: nice,
        email,
        since: new Date().toISOString(),
      });
      /* a demo account is handed a little history to browse — but only where
         it has none of its own, so a real session is never overwritten */
      setOrders((current) => (current.length ? current : SEED_ORDERS));
      setAddresses((current) => (current.length ? current : SEED_ADDRESSES));
      setRepairs((current) => (current.length ? current : SEED_REPAIRS));
      flash(name ? "Profile created" : "Welcome back");
    },
    [flash],
  );

  const signOut = useCallback(() => {
    setUser(null);
    flash("Signed out");
  }, [flash]);

  const placeOrder = useCallback(
    ({ ship }: { ship: Order["ship"] }) => {
      const lines = linesOf(cart);
      if (lines.length === 0) return null;
      const subtotal = subtotalOf(cart);
      const shipping = shippingOf(subtotal);
      const order: Order = {
        id: "KM-" + (4820 + orders.length),
        placedAt: new Date().toISOString(),
        lines: lines.map((l) => ({
          id: l.id,
          name: l.name,
          qty: l.qty,
          price: l.price,
        })),
        subtotal,
        shipping,
        total: subtotal + shipping,
        ship,
        status: "In the atelier",
      };
      setOrders((current) => [order, ...current]);
      setCart({});
      return order;
    },
    [cart, orders.length],
  );

  const addAddress = useCallback(
    (a: Omit<Address, "id" | "isDefault">) => {
      setAddresses((current) => [
        ...current,
        { ...a, id: "addr-" + Date.now(), isDefault: current.length === 0 },
      ]);
      flash("Address saved");
    },
    [flash],
  );

  const removeAddress = useCallback((id: string) => {
    setAddresses((current) => current.filter((a) => a.id !== id));
  }, []);

  const makeDefaultAddress = useCallback((id: string) => {
    setAddresses((current) =>
      current.map((a) => ({ ...a, isDefault: a.id === id })),
    );
  }, []);

  const openRepair = useCallback(
    (piece: string, note: string) => {
      setRepairs((current) => [
        {
          id: "RP-" + (119 + current.length),
          piece,
          note,
          openedAt: new Date().toISOString(),
          status: "Received",
        },
        ...current,
      ]);
      flash("Repair noted — we will write back");
    },
    [flash],
  );

  const lines = useMemo(() => linesOf(cart), [cart]);
  const count = useMemo(() => countOf(cart), [cart]);
  const subtotal = useMemo(() => subtotalOf(cart), [cart]);
  const shipping = useMemo(() => shippingOf(subtotal), [subtotal]);

  const value: StoreValue = {
    hydrated,
    cart,
    lines,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    saved,
    isSaved,
    toggleSaved,
    user,
    signIn,
    signOut,
    orders,
    placeOrder,
    addresses,
    addAddress,
    removeAddress,
    makeDefaultAddress,
    repairs,
    openRepair,
    toasts,
    flash,
    cartOpen,
    setCartOpen,
    menuOpen,
    setMenuOpen,
    bagPulse,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
