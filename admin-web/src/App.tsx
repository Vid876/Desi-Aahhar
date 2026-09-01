import {
  BadgeIndianRupee, Bell, Boxes, ChevronRight, CircleGauge, ClipboardList, Gift,
  LayoutDashboard, LogOut, Menu, PackageCheck, RefreshCw, Search, Settings2,
  ShieldCheck, ShoppingBasket, Truck, UserRoundPlus, Users, Wheat, X,
} from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { api, money, shortDate } from './api';
import type { AuthResponse, Category, Coupon, Dashboard, Integration, Order, Product, Staff } from './types';

type View = 'overview' | 'orders' | 'products' | 'rules' | 'staff' | 'coupons' | 'integrations';
const TOKEN_KEY = 'desi-aahhar-admin-token';
const USER_KEY = 'desi-aahhar-admin-user';
const transitions: Record<string, string> = {
  PAYMENT_PENDING: 'CONFIRMED', CONFIRMED: 'PICKING', PICKING: 'PACKED', PACKED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'products', label: 'Products', icon: ShoppingBasket },
  { id: 'rules', label: 'Category limits', icon: Settings2 },
  { id: 'staff', label: 'Delivery staff', icon: Truck },
  { id: 'coupons', label: 'Offers & coupons', icon: Gift },
  { id: 'integrations', label: 'Integrations', icon: ShieldCheck },
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [user, setUser] = useState(() => localStorage.getItem(USER_KEY) ?? 'Admin');
  const [view, setView] = useState<View>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<Dashboard>();
  const [integrations, setIntegrations] = useState<Integration>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const [d, i, o, s, c, p, cp] = await Promise.all([
        api<Dashboard>('/admin/dashboard', {}, token), api<Integration>('/admin/integrations', {}, token),
        api<Order[]>('/admin/orders', {}, token), api<Staff[]>('/admin/staff', {}, token),
        api<Category[]>('/admin/categories', {}, token), api<Product[]>('/products', {}, token),
        api<Coupon[]>('/admin/coupons', {}, token),
      ]);
      setDashboard(d); setIntegrations(i); setOrders(o); setStaff(s); setCategories(c); setProducts(p); setCoupons(cp);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to load dashboard';
      setError(message);
      if ((caught as { status?: number }).status === 401) logout();
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function logout() {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(''); setUser('Admin');
  }

  const filteredOrders = useMemo(() => orders.filter((order) =>
    `${order.orderNumber} ${order.customerName} ${order.status}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.hindiName} ${product.slug}`.toLowerCase().includes(search.toLowerCase())), [products, search]);

  if (!token) return <Login onLogin={(auth) => {
    localStorage.setItem(TOKEN_KEY, auth.token); localStorage.setItem(USER_KEY, auth.user.name);
    setUser(auth.user.name); setToken(auth.token);
  }} />;

  const title = nav.find((item) => item.id === view)?.label ?? 'Overview';
  return (
    <div className="shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <button className="mobile-close" onClick={() => setMobileNav(false)}><X /></button>
        <div className="brand"><div className="brand-mark"><Wheat /></div><div><strong>देसी Aahhar</strong><span>OPERATIONS</span></div></div>
        <nav>{nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''}
          onClick={() => { setView(item.id); setMobileNav(false); }}><item.icon /><span>{item.label}</span>
          {item.id === 'orders' && dashboard?.activeOrders ? <b>{dashboard.activeOrders}</b> : null}</button>)}</nav>
        <div className="sidebar-card"><div className="pulse" /><div><strong>System online</strong><span>PostgreSQL connected</span></div></div>
        <button className="logout" onClick={logout}><LogOut /> Sign out</button>
      </aside>
      {mobileNav ? <button className="scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} /> : null}
      <main>
        <header className="topbar">
          <div className="top-title"><button className="menu" onClick={() => setMobileNav(true)}><Menu /></button><div><span>Workspace / {title}</span><h1>{title}</h1></div></div>
          <div className="top-actions">
            <button className="icon-button" onClick={load} title="Refresh"><RefreshCw className={loading ? 'spin' : ''} /></button>
            <button className="icon-button"><Bell /><i /></button>
            <div className="avatar">{user.slice(0, 1).toUpperCase()}</div><div className="user-copy"><strong>{user}</strong><span>Administrator</span></div>
          </div>
        </header>
        {error ? <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}><X /></button></div> : null}
        <section className="page">
          {loading && !dashboard ? <Loading /> : null}
          {view === 'overview' && dashboard ? <Overview dashboard={dashboard} orders={orders} integrations={integrations} /> : null}
          {view === 'orders' ? <Orders orders={filteredOrders} staff={staff} token={token} search={search} setSearch={setSearch}
            onChanged={load} onError={setError} /> : null}
          {view === 'products' ? <Products products={filteredProducts} categories={categories} token={token}
            search={search} setSearch={setSearch} onChanged={load} onError={setError} /> : null}
          {view === 'rules' ? <Rules categories={categories} token={token} onChanged={load} onError={setError} /> : null}
          {view === 'staff' ? <StaffPanel staff={staff} token={token} onChanged={load} onError={setError} /> : null}
          {view === 'coupons' ? <Coupons coupons={coupons} token={token} onChanged={load} onError={setError} /> : null}
          {view === 'integrations' ? <Integrations integrations={integrations} /> : null}
        </section>
      </main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (auth: AuthResponse) => void }) {
  const [email, setEmail] = useState('admin@desiaahhar.in');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { onLogin(await api<AuthResponse>('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Sign in failed'); }
    finally { setBusy(false); }
  }
  return <div className="login-page"><div className="login-art">
    <div className="login-brand"><div className="brand-mark"><Wheat /></div><span>देसी Aahhar</span></div>
    <div className="art-copy"><span className="eyebrow">GROCERY OPERATIONS, SIMPLIFIED</span><h1>हर order पर<br/><em>पूरा control.</em></h1>
      <p>Products, category rules, payments and delivery—all connected in one calm workspace.</p></div>
    <div className="grain grain-a">🌾</div><div className="grain grain-b">🥬</div><div className="grain grain-c">🫘</div>
  </div><div className="login-panel"><form onSubmit={submit}><div className="mobile-brand"><Wheat /> देसी Aahhar</div>
    <span className="eyebrow">ADMIN PORTAL</span><h2>Welcome back</h2><p>Sign in to manage today’s operations.</p>
    <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error ? <div className="form-error">{error}</div> : null}<button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Open dashboard'}<ChevronRight /></button>
    <div className="demo-note"><ShieldCheck /><span><strong>Local setup credentials</strong>Admin@123 is seeded only for development. Change it before deployment.</span></div>
  </form></div></div>;
}

function Overview({ dashboard, orders, integrations }: { dashboard: Dashboard; orders: Order[]; integrations?: Integration }) {
  const cards = [
    { label: 'Total revenue', value: money(dashboard.revenue), hint: 'Paid & delivered orders', icon: BadgeIndianRupee, color: 'green' },
    { label: 'Customers', value: dashboard.customers, hint: 'Verified accounts', icon: Users, color: 'orange' },
    { label: 'Active orders', value: dashboard.activeOrders, hint: `${dashboard.orders} total orders`, icon: PackageCheck, color: 'blue' },
    { label: 'Low stock', value: dashboard.lowStockVariants, hint: 'Variants below 10 units', icon: Boxes, color: 'rose' },
  ];
  return <><div className="hero"><div><span className="eyebrow light">TODAY’S CONTROL CENTRE</span><h2>Namaste! Business is moving.</h2><p>Track orders, inventory and service health from one connected view.</p></div><div className="hero-orbit"><span>🌾</span><span>🛒</span><span>🥬</span></div></div>
    <div className="stat-grid">{cards.map((card) => <article className="stat" key={card.label}><div className={`stat-icon ${card.color}`}><card.icon /></div><div><span>{card.label}</span><strong>{card.value}</strong><small>{card.hint}</small></div></article>)}</div>
    <div className="overview-grid"><Panel title="Recent orders" subtitle="Live order pipeline" action={<span className="live"><i /> LIVE</span>}>
      <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.slice(0, 6).map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{shortDate(order.createdAt)}</small></td><td>{order.customerName}</td><td><Status value={order.status} /></td><td><strong>{money(order.total)}</strong></td></tr>)}</tbody></table></div>
    </Panel><div className="stack"><Panel title="Order stages" subtitle="Current distribution"><div className="stage-list">{dashboard.orderStatus.map((stage) => <div key={stage.status}><span><i className={`dot ${stage.status.toLowerCase()}`} />{pretty(stage.status)}</span><strong>{stage.total}</strong></div>)}</div></Panel>
    <Panel title="Connected services" subtitle="Production readiness"><div className="mini-services">{integrations && Object.entries(integrations).map(([key, connected]) => <div key={key}><span>{serviceLabel(key)}</span><b className={connected ? 'ok' : 'setup'}>{connected ? 'Connected' : 'Setup needed'}</b></div>)}</div></Panel></div></div></>;
}

function Orders({ orders, staff, token, search, setSearch, onChanged, onError }: { orders: Order[]; staff: Staff[]; token: string; search: string; setSearch: (v: string) => void; onChanged: () => void; onError: (v: string) => void }) {
  const [selected, setSelected] = useState<Order>();
  async function assign(orderId: string, staffId: string) { try { await api(`/admin/orders/${orderId}/assign`, { method: 'PUT', body: JSON.stringify({ staffId }) }, token); onChanged(); } catch (e) { onError(asMessage(e)); } }
  async function advance(order: Order) { const status = transitions[order.status]; if (!status) return; try { await api(`/admin/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token); onChanged(); setSelected(undefined); } catch (e) { onError(asMessage(e)); } }
  return <><PageHeading title="Order command" description="Assign riders and move every order through a controlled status flow." right={<SearchBox value={search} onChange={setSearch} placeholder="Search order or customer" />} />
  <Panel title="All orders" subtitle={`${orders.length} orders shown`}><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th>Delivery staff</th><th>Total</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{shortDate(order.createdAt)}</small></td><td><strong>{order.customerName}</strong><small>{order.address.city} • {order.deliverySlot}</small></td><td><span className="payment-pill">{order.paymentMethod}</span><small>{order.paymentStatus}</small></td><td><Status value={order.status} /></td><td><select value={order.assignedTo ?? ''} onChange={(e) => assign(order.id, e.target.value)}><option value="" disabled>Assign staff</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></td><td><strong>{money(order.total)}</strong></td><td><button className="table-action" onClick={() => setSelected(order)}><ChevronRight /></button></td></tr>)}</tbody></table></div></Panel>
  {selected ? <div className="modal-wrap"><button className="scrim" onClick={() => setSelected(undefined)} /><div className="drawer"><button className="drawer-close" onClick={() => setSelected(undefined)}><X /></button><span className="eyebrow">ORDER DETAIL</span><h2>{selected.orderNumber}</h2><Status value={selected.status} /><div className="detail-block"><span>Deliver to</span><strong>{selected.address.recipient} • {selected.address.phone}</strong><p>{selected.address.line1}, {selected.address.city} - {selected.address.pincode}</p></div><div className="detail-items">{selected.items.map((item) => <div key={`${item.productName}${item.variantLabel}`}><span><strong>{item.productName}</strong><small>{item.variantLabel} × {item.quantity}</small></span><b>{money(item.lineTotal)}</b></div>)}</div><div className="detail-total"><span>Order total</span><strong>{money(selected.total)}</strong></div>{transitions[selected.status] ? <button className="primary" onClick={() => advance(selected)}>Move to {pretty(transitions[selected.status])}<ChevronRight /></button> : null}</div></div> : null}</>;
}

function Products({ products, categories, token, search, setSearch, onChanged, onError }: { products: Product[]; categories: Category[]; token: string; search: string; setSearch: (v: string) => void; onChanged: () => void; onError: (v: string) => void }) {
  const [newOpen, setNewOpen] = useState(false);
  async function saveVariant(id: string, form: HTMLFormElement) { const data = new FormData(form); try { await api(`/admin/variants/${id}`, { method: 'PUT', body: JSON.stringify({ price: Number(data.get('price')), mrp: Number(data.get('mrp')), stock: Number(data.get('stock')) }) }, token); onChanged(); } catch (e) { onError(asMessage(e)); } }
  return <><PageHeading title="Catalog & inventory" description="Edit live pricing and stock. Changes appear in the customer app immediately." right={<div className="heading-actions"><SearchBox value={search} onChange={setSearch} placeholder="Search products" /><button className="primary compact" onClick={() => setNewOpen(true)}>+ Add product</button></div>} />
  <div className="product-grid">{products.map((product) => <article className="product-admin" key={product.id}><div className="product-top"><div className="product-emoji">{product.emoji}</div><div><span>{categories.find((c) => c.id === product.categoryId)?.name}</span><h3>{product.name}</h3><small>{product.hindiName}</small></div>{product.featured ? <b>Featured</b> : null}</div><p>{product.description}</p>{product.variants.map((variant) => <form key={variant.id} onSubmit={(event) => { event.preventDefault(); saveVariant(variant.id, event.currentTarget); }} className="variant-row"><strong>{variant.label}<small>{variant.sku}</small></strong><label>Price<input name="price" type="number" defaultValue={variant.price} /></label><label>MRP<input name="mrp" type="number" defaultValue={variant.mrp} /></label><label>Stock<input name="stock" type="number" defaultValue={variant.stock} /></label><button>Save</button></form>)}</article>)}</div>
  {newOpen ? <ProductModal categories={categories} token={token} onClose={() => setNewOpen(false)} onDone={() => { setNewOpen(false); onChanged(); }} onError={onError} /> : null}</>;
}

function ProductModal({ categories, token, onClose, onDone, onError }: { categories: Category[]; token: string; onClose: () => void; onDone: () => void; onError: (v: string) => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { await api('/admin/products', { method: 'POST', body: JSON.stringify({ categoryId: data.get('categoryId'), slug: data.get('slug'), name: data.get('name'), hindiName: data.get('hindiName'), emoji: data.get('emoji'), description: data.get('description'), badge: data.get('badge'), featured: data.get('featured') === 'on', variant: { sku: data.get('sku'), label: data.get('label'), price: Number(data.get('price')), mrp: Number(data.get('mrp')), stock: Number(data.get('stock')) } }) }, token); onDone(); } catch (e) { onError(asMessage(e)); } }
  return <div className="modal-wrap"><button className="scrim" onClick={onClose}/><form className="drawer form-drawer" onSubmit={submit}><button type="button" className="drawer-close" onClick={onClose}><X /></button><span className="eyebrow">NEW CATALOG ITEM</span><h2>Add product</h2><div className="form-grid"><label>Category<select name="categoryId" required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Emoji<input name="emoji" defaultValue="🛒" required /></label><label>English name<input name="name" required /></label><label>Hindi name<input name="hindiName" required /></label><label>Slug<input name="slug" placeholder="product-slug" required /></label><label>Badge<input name="badge" placeholder="BESTSELLER" /></label><label className="wide">Description<textarea name="description" required /></label><label>SKU<input name="sku" required /></label><label>Pack size<input name="label" placeholder="1 kg" required /></label><label>Price<input name="price" type="number" min="0" required /></label><label>MRP<input name="mrp" type="number" min="0" required /></label><label>Opening stock<input name="stock" type="number" min="0" required /></label><label className="check"><input name="featured" type="checkbox" /> Feature on home</label></div><button className="primary">Create product<ChevronRight /></button></form></div>;
}

function Rules({ categories, token, onChanged, onError }: { categories: Category[]; token: string; onChanged: () => void; onError: (v: string) => void }) {
  async function save(category: Category, form: HTMLFormElement) { const data = new FormData(form); try { await api(`/admin/categories/${category.id}/rule`, { method: 'PUT', body: JSON.stringify({ appliesMinimum: data.get('applies') === 'on', minimumOrderValue: Number(data.get('minimum')) }) }, token); onChanged(); } catch (e) { onError(asMessage(e)); } }
  return <><PageHeading title="Category limit control" description="The backend validates these rules at cart and checkout—clients cannot bypass them." /><div className="rule-intro"><CircleGauge /><div><strong>How limits work</strong><p>Each enabled category must meet its own minimum. Fresh/unlimited categories remain unaffected.</p></div></div><Panel title="Minimum order rules" subtitle="Admin configurable, effective immediately"><div className="rules-list">{categories.map((category) => <form key={category.id} onSubmit={(event) => { event.preventDefault(); save(category, event.currentTarget); }}><div className="category-icon" style={{ background: category.color }}>{category.emoji}</div><div className="rule-name"><strong>{category.name}</strong><small>{category.hindiName}</small></div><label className="switch"><input name="applies" type="checkbox" defaultChecked={category.appliesMinimum}/><span /></label><label className="money-input"><span>₹</span><input name="minimum" type="number" min="0" defaultValue={category.minimumOrderValue}/></label><button>Save rule</button></form>)}</div></Panel></>;
}

function StaffPanel({ staff, token, onChanged, onError }: { staff: Staff[]; token: string; onChanged: () => void; onError: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { await api('/admin/staff', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) }, token); setOpen(false); onChanged(); } catch (e) { onError(asMessage(e)); } }
  return <><PageHeading title="Delivery team" description="Create staff accounts and monitor their active delivery load." right={<button className="primary compact" onClick={() => setOpen(!open)}><UserRoundPlus />Add staff</button>} />{open ? <form className="inline-form" onSubmit={create}><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" /></label><label>Temporary password<input name="password" type="password" minLength={8} required /></label><button className="primary compact">Create account</button></form> : null}<div className="staff-grid">{staff.map((person) => <article key={person.id}><div className="staff-avatar">{person.name.slice(0, 1)}</div><div><h3>{person.name}</h3><span>{person.email}</span></div><b className={person.active ? 'ok' : 'setup'}>{person.active ? 'Active' : 'Disabled'}</b><div className="staff-load"><Truck /><span><strong>{person.activeOrders}</strong> active deliveries</span></div></article>)}</div></>;
}

function Coupons({ coupons, token, onChanged, onError }: { coupons: Coupon[]; token: string; onChanged: () => void; onError: (v: string) => void }) {
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { await api('/admin/coupons', { method: 'POST', body: JSON.stringify({ code: data.get('code'), title: data.get('title'), description: data.get('description'), minimumAmount: Number(data.get('minimumAmount')), discountAmount: Number(data.get('discountAmount')), active: true }) }, token); event.currentTarget.reset(); onChanged(); } catch (e) { onError(asMessage(e)); } }
  return <><PageHeading title="Offers & coupons" description="Create cart discounts with server-side minimum validation." /><div className="coupon-layout"><form className="coupon-form" onSubmit={create}><span className="eyebrow">CREATE OFFER</span><h2>New coupon</h2><label>Coupon code<input name="code" placeholder="DESI50" required /></label><label>Offer title<input name="title" placeholder="₹50 की बचत" required /></label><label>Description<textarea name="description" required /></label><div className="two"><label>Minimum cart<input name="minimumAmount" type="number" min="0" required /></label><label>Discount<input name="discountAmount" type="number" min="0" required /></label></div><button className="primary">Publish coupon<ChevronRight /></button></form><div className="coupon-list">{coupons.map((coupon) => <article key={coupon.id}><div className="ticket-edge"/><span className="eyebrow">{coupon.active ? 'ACTIVE OFFER' : 'PAUSED'}</span><h3>{coupon.code}</h3><strong>{coupon.title}</strong><p>{coupon.description}</p><div><span>Min. {money(coupon.minimumAmount)}</span><b>{money(coupon.discountAmount)} OFF</b></div></article>)}</div></div></>;
}

function Integrations({ integrations }: { integrations?: Integration }) {
  const content = [
    ['postgresql', 'PostgreSQL', 'Primary transactional database', 'DATABASE_URL'], ['smsOtp', 'Twilio Verify', 'Real mobile SMS OTP', 'TWILIO_ACCOUNT_SID + Verify SID'],
    ['emailOtp', 'SMTP email', 'Fallback email verification OTP', 'SMTP_HOST + SMTP credentials'], ['razorpay', 'Razorpay', 'Orders, signatures and webhook', 'RAZORPAY_KEY_ID + secret'],
    ['firebasePush', 'Firebase Cloud Messaging', 'Customer and staff push alerts', 'Firebase project + service account'],
  ] as const;
  return <><PageHeading title="Service integrations" description="Secrets stay on the backend; this screen only reports whether each connection is ready." /><div className="integration-grid">{content.map(([key, name, description, env]) => { const connected = integrations?.[key]; return <article key={key}><div className={`integration-logo ${key}`}>{key === 'postgresql' ? 'PG' : key === 'smsOtp' ? 'SMS' : key === 'emailOtp' ? '@' : key === 'razorpay' ? '₹' : '🔥'}</div><div><h3>{name}</h3><p>{description}</p><code>{env}</code></div><b className={connected ? 'ok' : 'setup'}>{connected ? 'Connected' : 'Configuration needed'}</b></article>})}</div><div className="security-note"><ShieldCheck /><div><strong>Secrets are never sent to this browser.</strong><p>Add them to the root <code>.env</code> or your deployment secret manager, then restart the API.</p></div></div></>;
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) { return <article className="panel"><header><div><h3>{title}</h3><span>{subtitle}</span></div>{action}</header>{children}</article>; }
function PageHeading({ title, description, right }: { title: string; description: string; right?: ReactNode }) { return <div className="page-heading"><div><h2>{title}</h2><p>{description}</p></div>{right}</div>; }
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="search"><Search /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>; }
function Status({ value }: { value: string }) { return <span className={`status ${value.toLowerCase()}`}><i />{pretty(value)}</span>; }
function Loading() { return <div className="loading"><RefreshCw className="spin"/><strong>Connecting to operations…</strong></div>; }
function pretty(value: string) { return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()); }
function serviceLabel(value: string) { return ({ postgresql: 'PostgreSQL', smsOtp: 'SMS OTP', emailOtp: 'Email OTP', razorpay: 'Razorpay', firebasePush: 'Firebase Push' } as Record<string,string>)[value] ?? value; }
function asMessage(value: unknown) { return value instanceof Error ? value.message : 'Request failed'; }
