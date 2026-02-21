import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Users, Package, Handshake, TrendingUp, ShieldCheck, Ban, CheckCircle, BookOpen, Newspaper, Type, Plus, Trash2, Pencil, ClipboardList } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPanel() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Knowledge Base state
  const [kbDocs, setKbDocs] = useState([]);
  const [showKbDialog, setShowKbDialog] = useState(false);
  const [editKb, setEditKb] = useState(null);
  const [kbForm, setKbForm] = useState({ title: '', category: 'catalogs', description: '', file_url: '', content: '' });

  // News state
  const [newsItems, setNewsItems] = useState([]);
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [editNews, setEditNews] = useState(null);
  const [newsForm, setNewsForm] = useState({ title: '', description: '', image_url: '', audio_url: '', content: '' });

  // Ticker state
  const [tickerItems, setTickerItems] = useState([]);
  const [tickerText, setTickerText] = useState('');

  // Registry state
  const [registryEntries, setRegistryEntries] = useState([]);
  const [showRegDialog, setShowRegDialog] = useState(false);
  const [editReg, setEditReg] = useState(null);
  const [regForm, setRegForm] = useState({ name: '', shareholder_number: '', inn: '', phone: '', email: '', pai_amount: '', status: 'active', join_date: '', notes: '' });

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, pRes, dRes, sRes, kbRes, nRes, tRes, rRes] = await Promise.all([
        fetch(`${API}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/admin/deals`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/knowledge-base`),
        fetch(`${API}/news`),
        fetch(`${API}/ticker`),
        fetch(`${API}/registry`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setUsers(await uRes.json());
      setProducts(await pRes.json());
      setDeals(await dRes.json());
      setStats(await sRes.json());
      setKbDocs(await kbRes.json());
      setNewsItems(await nRes.json());
      setTickerItems(await tRes.json());
      const regData = await rRes.json();
      setRegistryEntries(Array.isArray(regData) ? regData : []);
    } catch { toast.error(t('common.error')); }
    setLoading(false);
  }, [token, t]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const handleBlockUser = async (userId) => {
    try {
      await fetch(`${API}/admin/users/${userId}/block`, { method: 'PUT', headers });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await fetch(`${API}/admin/users/${userId}/verify`, { method: 'PUT', headers });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await fetch(`${API}/admin/users/${userId}/role`, { method: 'PUT', headers, body: JSON.stringify({ role }) });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleProductStatus = async (productId, status) => {
    try {
      await fetch(`${API}/admin/products/${productId}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
      toast.success(t('common.success'));
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  // KB CRUD
  const handleSaveKb = async () => {
    try {
      const url = editKb ? `${API}/knowledge-base/${editKb.doc_id}` : `${API}/knowledge-base`;
      const method = editKb ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(kbForm) });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowKbDialog(false); setEditKb(null);
      setKbForm({ title: '', category: 'catalogs', description: '', file_url: '', content: '' });
      fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const handleDeleteKb = async (docId) => {
    try {
      await fetch(`${API}/knowledge-base/${docId}`, { method: 'DELETE', headers });
      toast.success(t('common.success')); fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const openEditKb = (doc) => {
    setEditKb(doc);
    setKbForm({ title: doc.title, category: doc.category, description: doc.description || '', file_url: doc.file_url || '', content: doc.content || '' });
    setShowKbDialog(true);
  };

  // News CRUD
  const handleSaveNews = async () => {
    try {
      const url = editNews ? `${API}/news/${editNews.news_id}` : `${API}/news`;
      const method = editNews ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(newsForm) });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowNewsDialog(false); setEditNews(null);
      setNewsForm({ title: '', description: '', image_url: '', audio_url: '', content: '' });
      fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const handleDeleteNews = async (newsId) => {
    try {
      await fetch(`${API}/news/${newsId}`, { method: 'DELETE', headers });
      toast.success(t('common.success')); fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const openEditNews = (item) => {
    setEditNews(item);
    setNewsForm({ title: item.title, description: item.description, image_url: item.image_url || '', audio_url: item.audio_url || '', content: item.content || '' });
    setShowNewsDialog(true);
  };

  // Ticker CRUD
  const handleAddTicker = async () => {
    if (!tickerText.trim()) return;
    try {
      await fetch(`${API}/ticker`, { method: 'POST', headers, body: JSON.stringify({ text: tickerText }) });
      toast.success(t('common.success'));
      setTickerText(''); fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const handleDeleteTicker = async (tickerId) => {
    try {
      await fetch(`${API}/ticker/${tickerId}`, { method: 'DELETE', headers });
      toast.success(t('common.success')); fetchData();
    } catch { toast.error(t('common.error')); }
  };

  // Registry CRUD
  const handleSaveReg = async () => {
    try {
      const data = { ...regForm, pai_amount: regForm.pai_amount ? parseFloat(regForm.pai_amount) : 0 };
      const url = editReg ? `${API}/registry/${editReg.entry_id}` : `${API}/registry`;
      const method = editReg ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowRegDialog(false); setEditReg(null);
      setRegForm({ name: '', shareholder_number: '', inn: '', phone: '', email: '', pai_amount: '', status: 'active', join_date: '', notes: '' });
      fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const handleDeleteReg = async (entryId) => {
    try {
      await fetch(`${API}/registry/${entryId}`, { method: 'DELETE', headers });
      toast.success(t('common.success')); fetchData();
    } catch { toast.error(t('common.error')); }
  };
  const openEditReg = (entry) => {
    setEditReg(entry);
    setRegForm({ name: entry.name, shareholder_number: entry.shareholder_number, inn: entry.inn || '', phone: entry.phone || '', email: entry.email || '', pai_amount: entry.pai_amount?.toString() || '', status: entry.status || 'active', join_date: entry.join_date || '', notes: entry.notes || '' });
    setShowRegDialog(true);
  };

  const KB_CATS = {
    catalogs: 'Каталоги пайщиков', documents: 'Документы кооператива',
    council_decisions: 'Решения совета', meetings: 'Собрания', contracts: 'Договора'
  };

  if (!user || user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Access Denied</div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="admin-panel">
      <h1 className="text-2xl font-bold tracking-tight mb-8">{t('admin.title')}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8" data-testid="admin-stats">
          <div className="bg-card border border-border rounded-lg p-6">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="font-special text-2xl font-bold">{stats.users?.total || 0}</p>
            <p className="text-xs text-muted-foreground">{t('admin.users')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Package className="h-5 w-5 text-accent mb-2" />
            <p className="font-special text-2xl font-bold">{stats.products?.total || 0}</p>
            <p className="text-xs text-muted-foreground">{t('admin.products')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Handshake className="h-5 w-5 text-secondary mb-2" />
            <p className="font-special text-2xl font-bold">{stats.deals?.total || 0}</p>
            <p className="text-xs text-muted-foreground">{t('admin.deals')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
            <p className="font-special text-2xl font-bold">{(stats.revenue?.total_amount || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue ₽</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <p className="font-special text-2xl font-bold">{(stats.revenue?.total_commission || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('landing.commission')} ₽</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="users" data-testid="admin-tab-users">{t('admin.users')}</TabsTrigger>
          <TabsTrigger value="products" data-testid="admin-tab-products">{t('admin.products')}</TabsTrigger>
          <TabsTrigger value="deals" data-testid="admin-tab-deals">{t('admin.deals')}</TabsTrigger>
          <TabsTrigger value="kb" data-testid="admin-tab-kb">
            <BookOpen className="h-3.5 w-3.5 mr-1" />База знаний
          </TabsTrigger>
          <TabsTrigger value="news" data-testid="admin-tab-news">
            <Newspaper className="h-3.5 w-3.5 mr-1" />Новости
          </TabsTrigger>
          <TabsTrigger value="ticker" data-testid="admin-tab-ticker">
            <Type className="h-3.5 w-3.5 mr-1" />Бегущая строка
          </TabsTrigger>
          <TabsTrigger value="registry" data-testid="admin-tab-registry">
            <ClipboardList className="h-3.5 w-3.5 mr-1" />Реестр пайщиков
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-2" data-testid="admin-users-list">
            {users.map(u => (
              <div key={u.user_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="outline">{u.role}</Badge>
                {u.is_blocked && <Badge className="bg-red-500/20 text-red-500">Blocked</Badge>}
                {!u.is_verified && <Badge className="bg-yellow-500/20 text-yellow-500">Unverified</Badge>}
                <Select value={u.role} onValueChange={v => handleChangeRole(u.user_id, v)}>
                  <SelectTrigger className="w-32 h-8" data-testid={`role-select-${u.user_id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">{t('auth.client')}</SelectItem>
                    <SelectItem value="shareholder">{t('auth.shareholder')}</SelectItem>
                    <SelectItem value="representative">Representative</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  {!u.is_verified && (
                    <Button size="sm" variant="outline" onClick={() => handleVerifyUser(u.user_id)} data-testid={`verify-${u.user_id}`}>
                      <CheckCircle className="h-4 w-4 mr-1" /> {t('admin.verify')}
                    </Button>
                  )}
                  <Button size="sm" variant={u.is_blocked ? "outline" : "destructive"} onClick={() => handleBlockUser(u.user_id)} data-testid={`block-${u.user_id}`}>
                    <Ban className="h-4 w-4 mr-1" /> {u.is_blocked ? t('admin.unblock') : t('admin.block')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-2" data-testid="admin-products-list">
            {products.map(p => (
              <div key={p.product_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.seller_id}</p>
                </div>
                <p className="font-special font-bold text-primary">{p.price ? `${p.price.toLocaleString()} ₽` : '-'}</p>
                <Badge className={p.status === 'active' ? 'bg-green-500/20 text-green-500' : p.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}>{p.status}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleProductStatus(p.product_id, 'active')} data-testid={`approve-${p.product_id}`}>
                    <CheckCircle className="h-4 w-4 mr-1" /> {t('admin.approve')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleProductStatus(p.product_id, 'rejected')} data-testid={`reject-${p.product_id}`}>
                    <Ban className="h-4 w-4 mr-1" /> {t('admin.reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deals">
          <div className="space-y-2" data-testid="admin-deals-list">
            {deals.map(d => (
              <div key={d.deal_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{d.product_title}</p>
                  <p className="text-xs text-muted-foreground">{d.buyer_name} &rarr; {d.seller_id}</p>
                </div>
                <p className="font-special font-bold">{d.amount ? `${d.amount.toLocaleString()} ${d.currency}` : '-'}</p>
                <span className="text-xs text-secondary font-special">{d.commission_total} ₽</span>
                <Badge className={d.status === 'completed' ? 'bg-green-500/20 text-green-500' : d.status === 'cancelled' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="kb">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Документы базы знаний ({kbDocs.length})</h3>
            <Button size="sm" className="rounded-full" onClick={() => { setEditKb(null); setKbForm({ title: '', category: 'catalogs', description: '', file_url: '', content: '' }); setShowKbDialog(true); }} data-testid="add-kb-btn">
              <Plus className="h-4 w-4 mr-1" /> Добавить
            </Button>
          </div>
          <div className="space-y-2" data-testid="admin-kb-list">
            {kbDocs.map(doc => (
              <div key={doc.doc_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{KB_CATS[doc.category] || doc.category} · {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                {doc.file_url && <Badge variant="outline" className="text-xs">Файл</Badge>}
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditKb(doc)} data-testid={`edit-kb-${doc.doc_id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteKb(doc.doc_id)} data-testid={`delete-kb-${doc.doc_id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {kbDocs.length === 0 && <p className="text-center py-8 text-muted-foreground">Нет документов</p>}
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Новости ({newsItems.length})</h3>
            <Button size="sm" className="rounded-full" onClick={() => { setEditNews(null); setNewsForm({ title: '', description: '', image_url: '', audio_url: '', content: '' }); setShowNewsDialog(true); }} data-testid="add-news-btn">
              <Plus className="h-4 w-4 mr-1" /> Добавить
            </Button>
          </div>
          <div className="space-y-2" data-testid="admin-news-list">
            {newsItems.map(item => (
              <div key={item.news_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                {item.image_url && <div className="h-12 w-16 rounded bg-muted overflow-hidden flex-shrink-0"><img src={item.image_url} alt="" className="w-full h-full object-cover" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                {item.audio_url && <Badge variant="outline" className="text-xs">Аудио</Badge>}
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditNews(item)} data-testid={`edit-news-${item.news_id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNews(item.news_id)} data-testid={`delete-news-${item.news_id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {newsItems.length === 0 && <p className="text-center py-8 text-muted-foreground">Нет новостей</p>}
          </div>
        </TabsContent>

        {/* Ticker Tab */}
        <TabsContent value="ticker">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input data-testid="ticker-input" placeholder="Текст бегущей строки..." value={tickerText} onChange={e => setTickerText(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleAddTicker()} />
              <Button onClick={handleAddTicker} className="h-12 rounded-full px-6" data-testid="add-ticker-btn">
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </div>
            <div className="space-y-2" data-testid="admin-ticker-list">
              {tickerItems.map(t => (
                <div key={t.ticker_id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  <p className="flex-1 text-sm">{t.text}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTicker(t.ticker_id)} data-testid={`delete-ticker-${t.ticker_id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {tickerItems.length === 0 && <p className="text-center py-8 text-muted-foreground">Нет элементов</p>}
            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* KB Dialog */}
      <Dialog open={showKbDialog} onOpenChange={setShowKbDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="kb-dialog">
          <DialogHeader>
            <DialogTitle>{editKb ? 'Редактировать' : 'Добавить'} документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input data-testid="kb-title" value={kbForm.title} onChange={e => setKbForm({...kbForm, title: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={kbForm.category} onValueChange={v => setKbForm({...kbForm, category: v})}>
                <SelectTrigger data-testid="kb-category" className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(KB_CATS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea data-testid="kb-description" value={kbForm.description} onChange={e => setKbForm({...kbForm, description: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Ссылка на файл (URL)</Label>
              <Input data-testid="kb-file-url" value={kbForm.file_url} onChange={e => setKbForm({...kbForm, file_url: e.target.value})} className="h-12" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Содержание (текст)</Label>
              <Textarea data-testid="kb-content" value={kbForm.content} onChange={e => setKbForm({...kbForm, content: e.target.value})} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKbDialog(false)} className="rounded-full">{t('common.cancel')}</Button>
            <Button onClick={handleSaveKb} className="rounded-full" data-testid="save-kb-btn">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="news-dialog">
          <DialogHeader>
            <DialogTitle>{editNews ? 'Редактировать' : 'Добавить'} новость</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Заголовок</Label>
              <Input data-testid="news-title" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea data-testid="news-description" value={newsForm.description} onChange={e => setNewsForm({...newsForm, description: e.target.value})} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Изображение (URL)</Label>
              <Input data-testid="news-image" value={newsForm.image_url} onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} className="h-12" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Аудио запись (URL)</Label>
              <Input data-testid="news-audio" value={newsForm.audio_url} onChange={e => setNewsForm({...newsForm, audio_url: e.target.value})} className="h-12" placeholder="https://...mp3" />
            </div>
            <div className="space-y-2">
              <Label>Полный текст</Label>
              <Textarea data-testid="news-content" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewsDialog(false)} className="rounded-full">{t('common.cancel')}</Button>
            <Button onClick={handleSaveNews} className="rounded-full" data-testid="save-news-btn">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
