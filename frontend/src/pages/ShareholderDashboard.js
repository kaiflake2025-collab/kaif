import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Package, TrendingUp, Eye, Handshake, Pencil, Trash2, Calendar, ClipboardList } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShareholderDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [registryEntries, setRegistryEntries] = useState([]);

  const [productForm, setProductForm] = useState({
    title: '', description: '', category: 'other', price: '',
    currency: 'RUB', region: '', contacts: '', images: [],
    tags: [], exchange_available: false
  });

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, dealRes, meetRes, statRes, regRes] = await Promise.all([
        fetch(`${API}/my-products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/deals`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/meetings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/shareholder/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/registry`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setProducts(await prodRes.json());
      setDeals(await dealRes.json());
      setMeetings(await meetRes.json());
      setStats(await statRes.json());
      const regData = await regRes.json();
      setRegistryEntries(Array.isArray(regData) ? regData : []);
    } catch { toast.error(t('common.error')); }
    setLoading(false);
  }, [token, t]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const handleSaveProduct = async () => {
    const data = { ...productForm, price: productForm.price ? parseFloat(productForm.price) : null };
    try {
      const url = editProduct ? `${API}/products/${editProduct.product_id}` : `${API}/products`;
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowAddProduct(false);
      setEditProduct(null);
      setProductForm({ title: '', description: '', category: 'other', price: '', currency: 'RUB', region: '', contacts: '', images: [], tags: [], exchange_available: false });
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await fetch(`${API}/products/${productId}`, { method: 'DELETE', headers });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDealAction = async (dealId, action) => {
    try {
      await fetch(`${API}/deals/${dealId}/${action}`, { method: 'PUT', headers });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setProductForm({
      title: prod.title, description: prod.description, category: prod.category,
      price: prod.price?.toString() || '', currency: prod.currency || 'RUB',
      region: prod.region || '', contacts: prod.contacts || '',
      images: prod.images || [], tags: prod.tags || [],
      exchange_available: prod.exchange_available || false
    });
    setShowAddProduct(true);
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-yellow-500/20 text-yellow-500', confirmed: 'bg-blue-500/20 text-blue-500', completed: 'bg-green-500/20 text-green-500', cancelled: 'bg-red-500/20 text-red-500' };
    return map[s] || '';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="shareholder-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}, {user.name}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.shareholder')}</p>
        </div>
        <Button data-testid="add-product-btn" onClick={() => { setEditProduct(null); setProductForm({ title: '', description: '', category: 'other', price: '', currency: 'RUB', region: '', contacts: '', images: [], tags: [], exchange_available: false }); setShowAddProduct(true); }} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> {t('dashboard.addProduct')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="shareholder-stats">
          <div className="bg-card border border-border rounded-lg p-6 space-y-1">
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="font-special text-2xl font-bold">{stats.products?.total || 0}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.products')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-1">
            <Eye className="h-5 w-5 text-accent mb-2" />
            <p className="font-special text-2xl font-bold">{stats.total_views || 0}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.totalViews')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-1">
            <Handshake className="h-5 w-5 text-secondary mb-2" />
            <p className="font-special text-2xl font-bold">{stats.deals?.length || 0}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.totalDeals')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-1">
            <Calendar className="h-5 w-5 text-primary mb-2" />
            <p className="font-special text-2xl font-bold">{stats.meetings || 0}</p>
            <p className="text-xs text-muted-foreground">{t('nav.meetings')}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-testid="tab-products">{t('dashboard.products')}</TabsTrigger>
          <TabsTrigger value="deals" data-testid="tab-deals">{t('nav.deals')}</TabsTrigger>
          <TabsTrigger value="meetings" data-testid="tab-meetings">{t('nav.meetings')}</TabsTrigger>
          <TabsTrigger value="registry" data-testid="tab-registry">
            <ClipboardList className="h-3.5 w-3.5 mr-1" />Реестр
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {loading ? <p className="text-muted-foreground">{t('common.loading')}</p> : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground" data-testid="no-products">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('common.noData')}</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="products-list">
              {products.map(p => (
                <div key={p.product_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.views || 0} {t('product.views')}</p>
                  </div>
                  <p className="font-special font-bold text-primary whitespace-nowrap">
                    {p.price ? `${p.price.toLocaleString()} ${p.currency || '₽'}` : t('product.negotiable')}
                  </p>
                  <Badge className={p.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>{p.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditProduct(p)} data-testid={`edit-${p.product_id}`}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(p.product_id)} data-testid={`delete-${p.product_id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deals">
          {deals.length === 0 ? <p className="text-center py-16 text-muted-foreground">{t('common.noData')}</p> : (
            <div className="space-y-3" data-testid="deals-list">
              {deals.map(d => (
                <div key={d.deal_id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{d.product_title}</h3>
                      <p className="text-xs text-muted-foreground">{d.deal_type === 'buy' ? t('deal.type.buy') : t('deal.type.exchange')} · {d.buyer_name}</p>
                    </div>
                    <Badge className={statusColor(d.status)}>{t(`deal.status.${d.status}`)}</Badge>
                  </div>
                  {d.amount > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <span>{t('deal.amount')}: <strong className="font-special">{d.amount.toLocaleString()} {d.currency}</strong></span>
                      <span className="text-muted-foreground">{t('deal.commission')}: <strong className="text-secondary font-special">{d.commission_total} {d.currency}</strong></span>
                    </div>
                  )}
                  {d.status === 'pending' && d.seller_id === user.user_id && (
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-full" onClick={() => handleDealAction(d.deal_id, 'confirm')} data-testid={`confirm-deal-${d.deal_id}`}>{t('deal.confirm')}</Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleDealAction(d.deal_id, 'cancel')} data-testid={`cancel-deal-${d.deal_id}`}>{t('deal.cancel')}</Button>
                    </div>
                  )}
                  {d.status === 'confirmed' && (
                    <Button size="sm" className="rounded-full" onClick={() => handleDealAction(d.deal_id, 'complete')} data-testid={`complete-deal-${d.deal_id}`}>{t('deal.complete')}</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetings">
          {meetings.length === 0 ? <p className="text-center py-16 text-muted-foreground">{t('common.noData')}</p> : (
            <div className="space-y-3" data-testid="meetings-list">
              {meetings.map(m => (
                <div key={m.meeting_id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{m.product_title}</h3>
                    <p className="text-xs text-muted-foreground">{m.client_name} · {m.preferred_date || 'TBD'}</p>
                  </div>
                  <Badge className={statusColor(m.status)}>{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="registry">
          {registryEntries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground" data-testid="no-registry">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет записей в реестре пайщиков</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="registry-list">
              {registryEntries.map(entry => (
                <div key={entry.entry_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{entry.shareholder_number} {entry.inn ? `· ИНН: ${entry.inn}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-special font-bold text-primary text-sm">{(entry.pai_amount || 0).toLocaleString()} ₽</p>
                    <p className="text-xs text-muted-foreground">Вступление: {entry.join_date || '-'}</p>
                  </div>
                  <Badge className={entry.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                    {entry.status === 'active' ? 'Активен' : entry.status === 'suspended' ? 'Приостановлен' : 'Неактивен'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle>{editProduct ? t('dashboard.editProduct') : t('dashboard.addProduct')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('catalog.title') || 'Title'}</Label>
              <Input data-testid="product-title-input" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea data-testid="product-desc-input" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('catalog.category')}</Label>
                <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                  <SelectTrigger data-testid="product-category" className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['food','services','construction','transport','electronics','clothing','health','education','realestate','other'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('product.price')}</Label>
                <Input data-testid="product-price-input" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('catalog.region')}</Label>
              <Input data-testid="product-region" value={productForm.region} onChange={e => setProductForm({...productForm, region: e.target.value})} className="h-12" />
            </div>
            <div className="flex items-center gap-3">
              <Switch data-testid="product-exchange" checked={productForm.exchange_available} onCheckedChange={v => setProductForm({...productForm, exchange_available: v})} />
              <Label>{t('product.exchangeAvailable')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)} className="rounded-full">{t('common.cancel')}</Button>
            <Button onClick={handleSaveProduct} className="rounded-full" data-testid="save-product-btn">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
