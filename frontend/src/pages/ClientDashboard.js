import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Heart, Handshake, Calendar, Eye, ShoppingCart, Package } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [deals, setDeals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [favRes, dealRes, meetRes] = await Promise.all([
        fetch(`${API}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/deals`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/meetings`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setFavorites(await favRes.json());
      setDeals(await dealRes.json());
      setMeetings(await meetRes.json());
    } catch { toast.error(t('common.error')); }
    setLoading(false);
  }, [token, t]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const removeFavorite = async (productId) => {
    try {
      await fetch(`${API}/favorites/${productId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(p => p.product_id !== productId));
      toast.success(t('common.success'));
    } catch {}
  };

  const statusColor = (s) => {
    const map = { pending: 'bg-yellow-500/20 text-yellow-500', confirmed: 'bg-blue-500/20 text-blue-500', completed: 'bg-green-500/20 text-green-500', cancelled: 'bg-red-500/20 text-red-500' };
    return map[s] || '';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="client-dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}, {user.name}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.client')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8" data-testid="client-stats">
        <div className="bg-card border border-border rounded-lg p-6 space-y-1">
          <Heart className="h-5 w-5 text-red-500 mb-2" />
          <p className="font-special text-2xl font-bold">{favorites.length}</p>
          <p className="text-xs text-muted-foreground">{t('nav.favorites')}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-1">
          <Handshake className="h-5 w-5 text-primary mb-2" />
          <p className="font-special text-2xl font-bold">{deals.length}</p>
          <p className="text-xs text-muted-foreground">{t('nav.deals')}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-1">
          <Calendar className="h-5 w-5 text-secondary mb-2" />
          <p className="font-special text-2xl font-bold">{meetings.length}</p>
          <p className="text-xs text-muted-foreground">{t('nav.meetings')}</p>
        </div>
      </div>

      <Tabs defaultValue="favorites">
        <TabsList className="mb-6">
          <TabsTrigger value="favorites" data-testid="tab-favorites">{t('nav.favorites')}</TabsTrigger>
          <TabsTrigger value="deals" data-testid="tab-deals">{t('nav.deals')}</TabsTrigger>
          <TabsTrigger value="meetings" data-testid="tab-meetings">{t('nav.meetings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('common.noData')}</p>
              <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/catalog')}>{t('landing.hero.cta')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="favorites-grid">
              {favorites.map(p => (
                <div key={p.product_id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/products/${p.product_id}`)}>
                  <div className="aspect-[4/3] bg-muted">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                    <p className="font-special font-bold text-primary">{p.price ? `${p.price.toLocaleString()} ${p.currency || '₽'}` : t('product.negotiable')}</p>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={e => { e.stopPropagation(); removeFavorite(p.product_id); }}>
                      <Heart className="h-4 w-4 fill-red-500 mr-1" /> {t('product.removeFromFavorites')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deals">
          {deals.length === 0 ? <p className="text-center py-16 text-muted-foreground">{t('common.noData')}</p> : (
            <div className="space-y-3" data-testid="client-deals-list">
              {deals.map(d => (
                <div key={d.deal_id} className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{d.product_title}</h3>
                      <p className="text-xs text-muted-foreground">{d.deal_type === 'buy' ? t('deal.type.buy') : t('deal.type.exchange')}</p>
                    </div>
                    <Badge className={statusColor(d.status)}>{t(`deal.status.${d.status}`)}</Badge>
                  </div>
                  {d.amount > 0 && (
                    <p className="text-sm">{t('deal.amount')}: <strong className="font-special text-primary">{d.amount.toLocaleString()} {d.currency}</strong></p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetings">
          {meetings.length === 0 ? <p className="text-center py-16 text-muted-foreground">{t('common.noData')}</p> : (
            <div className="space-y-3" data-testid="client-meetings-list">
              {meetings.map(m => (
                <div key={m.meeting_id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{m.product_title}</h3>
                    <p className="text-xs text-muted-foreground">{m.preferred_date || 'TBD'}</p>
                  </div>
                  <Badge className={statusColor(m.status)}>{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
