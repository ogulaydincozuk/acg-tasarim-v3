import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ImageKey } from '../data/images';
import { makeOrderNo, orderTotals } from '../lib/checkout';
import { readStorage, writeStorage } from '../lib/storage';

/*
 * DEMO ÜYELİK & SİPARİŞ
 * --------------------------------------------------------------------------
 * Yalnızca tarayıcıda (localStorage) çalışan geçici bir önizleme katmanıdır.
 * - Şifre HİÇBİR ŞEKİLDE saklanmaz ve doğrulanmaz.
 * - Kart bilgisi saklanmaz; yalnızca son 4 hane sipariş özetinde gösterilir.
 * Gerçek giriş (şifre karması, oturum, e-posta doğrulama) ve ödeme sağlayıcısı sonraki aşamada eklenecek.
 */

export interface DemoUser {
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface OrderLine {
  id: string;
  slug: string;
  name: string;
  image: ImageKey;
  price: number;
  qty: number;
}

export interface Order {
  no: string;
  createdAt: string;
  email: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  contact: { name: string; email: string; phone: string };
  address: { city: string; district: string; line: string; note?: string };
  payment: 'kart' | 'havale';
  cardLast4?: string;
  status: 'Hazırlanıyor';
  demo: true;
}

export type PlaceOrderInput = Pick<Order, 'lines' | 'contact' | 'address' | 'payment' | 'cardLast4'>;

type Result = { ok: true } | { ok: false; error: string };

interface AccountState {
  user: DemoUser | null;
  orders: Order[];
  /** Giriş yapmış üyenin siparişleri */
  myOrders: Order[];
  register: (input: { name: string; email: string; phone?: string; password: string }) => Result;
  login: (email: string, password: string) => Result;
  logout: () => void;
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrder: (no: string) => Order | undefined;
}

const KEYS = { users: 'acg.demo.users', session: 'acg.demo.session', orders: 'acg.demo.orders' };

const AccountContext = createContext<AccountState | null>(null);

const normEmail = (e: string) => e.trim().toLocaleLowerCase('tr-TR');

export function AccountProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<DemoUser[]>(() => readStorage<DemoUser[]>(KEYS.users, []));
  const [session, setSession] = useState<string | null>(() => readStorage<string | null>(KEYS.session, null));
  const [orders, setOrders] = useState<Order[]>(() => readStorage<Order[]>(KEYS.orders, []));

  useEffect(() => writeStorage(KEYS.users, users), [users]);
  useEffect(() => writeStorage(KEYS.session, session), [session]);
  useEffect(() => writeStorage(KEYS.orders, orders), [orders]);

  const user = useMemo(() => users.find((u) => u.email === session) ?? null, [users, session]);
  const myOrders = useMemo(() => (user ? orders.filter((o) => o.email === user.email) : []), [orders, user]);

  const register = useCallback<AccountState['register']>(
    ({ name, email, phone, password }) => {
      const e = normEmail(email);
      if (password.length < 6) return { ok: false, error: 'Şifre en az 6 karakter olmalı.' };
      if (users.some((u) => u.email === e)) {
        return { ok: false, error: 'Bu e-posta ile bir demo hesap zaten var. Giriş yapmayı deneyebilirsin.' };
      }
      const next: DemoUser = { name: name.trim(), email: e, phone: phone?.trim() || undefined, createdAt: new Date().toISOString() };
      setUsers((list) => [...list, next]);
      setSession(e);
      return { ok: true };
    },
    [users],
  );

  const login = useCallback<AccountState['login']>(
    (email, password) => {
      const e = normEmail(email);
      if (password.length < 6) return { ok: false, error: 'Şifre en az 6 karakter olmalı.' };
      if (!users.some((u) => u.email === e)) {
        return { ok: false, error: 'Bu e-posta ile kayıtlı bir demo hesap bulunamadı. Üye olarak başlayabilirsin.' };
      }
      setSession(e);
      return { ok: true };
    },
    [users],
  );

  const logout = useCallback(() => setSession(null), []);

  const placeOrder = useCallback<AccountState['placeOrder']>(
    (input) => {
      const subtotal = input.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      const totals = orderTotals(subtotal);
      const order: Order = {
        ...input,
        no: makeOrderNo(orders.map((o) => o.no)),
        createdAt: new Date().toISOString(),
        email: normEmail(input.contact.email),
        ...totals,
        status: 'Hazırlanıyor',
        demo: true,
      };
      setOrders((list) => [order, ...list]);
      return order;
    },
    [orders],
  );

  const getOrder = useCallback((no: string) => orders.find((o) => o.no === no), [orders]);

  const value = useMemo<AccountState>(
    () => ({ user, orders, myOrders, register, login, logout, placeOrder, getOrder }),
    [user, orders, myOrders, register, login, logout, placeOrder, getOrder],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}
