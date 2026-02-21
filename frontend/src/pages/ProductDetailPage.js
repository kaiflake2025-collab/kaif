import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import { Heart, ShoppingCart, ArrowLeftRight, Users, ArrowLeft, MapPin, Eye, CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [dealType, setDealType] = useState('buy');
  const [dealMessage, setDealMessage] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/products/${productId}`);
        if (!res.ok) throw new Error();
        setProduct(await res.json());
      } catch {
        toast.error(t('common.error'));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId, t]);

  useEffect(() => {
    if (!token) return;
    const checkFav = async () => {
      try {
        const res = await fetch(`${API}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setIsFav(data.some(p => p.product_id === productId));
      } catch {}
    };
    checkFav();
  }, [token, productId]);

  const toggleFavorite = async () => {
    if (!token) { navigate('/auth'); return; }
    try {
      await fetch(`${API}/favorites/${productId}`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsFav(!isFav);
      toast.success(t('common.success'));
    } catch {}
  };

  const handleCreateDeal = async () => {
    if (!token) { navigate('/auth'); return; }
    try {
      const res = await fetch(`${API}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, deal_type: dealType, message: dealMessage })
      });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowDealDialog(false);
      navigate('/dashboard?tab=deals');
    } catch { toast.error(t('common.error')); }
  };

  const handleRequestMeeting = async () => {
    if (!token) { navigate('/auth'); return; }
    try {
      const res = await fetch(`${API}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          product_id: productId,
          preferred_date: meetingDate ? format(meetingDate, 'yyyy-MM-dd') : null,
          message: meetingMessage
        })
      });
      if (!res.ok) throw new Error();
      toast.success(t('common.success'));
      setShowMeetingDialog(false);
    } catch { toast.error(t('common.error')); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('catalog.noProducts')}</div>;

  const price = product.price;
  const commission = price ? (price * 0.015).toFixed(2) : 0;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="product-detail-page">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6" data-testid="back-btn">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.cancel')}
      </Button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground">📦</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{product.category}</Badge>
              {product.exchange_available && <Badge className="bg-secondary text-secondary-foreground">{t('product.exchangeAvailable')}</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="product-title">{product.title}</h1>
            <p className="font-special text-3xl font-bold text-primary" data-testid="product-price">
              {price ? `${price.toLocaleString()} ${product.currency || '₽'}` : t('product.negotiable')}
            </p>
            {price > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('deal.commission')}: <span className="font-special text-secondary">{commission} {product.currency || '₽'}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {product.region && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{product.region}</span>}
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{product.views || 0} {t('product.views')}</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground" data-testid="product-description">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
            </div>
          )}

          {/* Seller */}
          {product.seller && (
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4" data-testid="seller-info">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {product.seller.avatar ? (
                  <img src={product.seller.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{product.seller.name}</p>
                <p className="text-xs text-muted-foreground">{t('product.seller')}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                data-testid="buy-btn"
                className="flex-1 h-12 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                onClick={() => { setDealType('buy'); setShowDealDialog(true); }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> {t('product.buy')}
              </Button>
              {product.exchange_available && (
                <Button
                  data-testid="exchange-btn"
                  variant="secondary"
                  className="flex-1 h-12 rounded-full"
                  onClick={() => { setDealType('exchange'); setShowDealDialog(true); }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" /> {t('product.exchange')}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                data-testid="meeting-btn"
                variant="outline"
                className="flex-1 h-12 rounded-full"
                onClick={() => setShowMeetingDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" /> {t('product.requestMeeting')}
              </Button>
              <Button
                data-testid="favorite-btn"
                variant="outline"
                className="h-12 rounded-full px-4"
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Dialog */}
      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent data-testid="deal-dialog">
          <DialogHeader>
            <DialogTitle>{dealType === 'buy' ? t('deal.type.buy') : t('deal.type.exchange')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {price > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('deal.amount')}</span>
                  <span className="font-special font-bold">{price.toLocaleString()} {product.currency || '₽'}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('deal.commission')}</span>
                  <span className="font-special text-secondary">{commission} {product.currency || '₽'}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('deal.commissionCoop')}</span>
                  <span>{(price * 0.009).toFixed(2)} {product.currency || '₽'}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('deal.commissionManager')}</span>
                  <span>{(price * 0.006).toFixed(2)} {product.currency || '₽'}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>{t('deal.total')}</span>
                  <span className="font-special text-primary">{(price + parseFloat(commission)).toLocaleString()} {product.currency || '₽'}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('nav.messages')}</Label>
              <Textarea
                data-testid="deal-message"
                value={dealMessage}
                onChange={e => setDealMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDealDialog(false)} className="rounded-full">{t('common.cancel')}</Button>
            <Button onClick={handleCreateDeal} className="rounded-full" data-testid="deal-confirm-btn">{t('deal.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent data-testid="meeting-dialog">
          <DialogHeader>
            <DialogTitle>{t('product.requestMeeting')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('nav.messages')}</Label>
              <Textarea
                data-testid="meeting-message"
                value={meetingMessage}
                onChange={e => setMeetingMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-12" data-testid="meeting-date-btn">
                    {meetingDate ? format(meetingDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={meetingDate} onSelect={setMeetingDate} data-testid="meeting-calendar" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingDialog(false)} className="rounded-full">{t('common.cancel')}</Button>
            <Button onClick={handleRequestMeeting} className="rounded-full" data-testid="meeting-confirm-btn">{t('common.send')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
