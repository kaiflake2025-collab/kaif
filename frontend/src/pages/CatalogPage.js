import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, Heart, Eye, ArrowUpDown, Grid3X3, List, Apple, Wrench, Building, Truck, Cpu, Shirt, HeartPulse, GraduationCap, Home, Package } from 'lucide-react';

const CATEGORY_ICONS = {
  food: Apple, services: Wrench, construction: Building, transport: Truck,
  electronics: Cpu, clothing: Shirt, health: HeartPulse, education: GraduationCap,
  realestate: Home, other: Package
};
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CatalogPage() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('page', page.toString());
    params.set('limit', '20');

    try {
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(t('common.error'));
    }
    setLoading(false);
  }, [search, category, page, t]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/products/categories`);
      setCategories(await res.json());
    } catch {}
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFavorites(new Set(data.map(p => p.product_id)));
    } catch {}
  }, [token]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (productId) => {
    if (!token) { navigate('/auth'); return; }
    const isFav = favorites.has(productId);
    try {
      await fetch(`${API}/favorites/${productId}`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.delete(productId) : next.add(productId);
        return next;
      });
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? (cat[`name_${useLanguage.lang}`] || cat.name_ru) : id;
  };

  const formatPrice = (price, currency) => {
    if (!price) return t('product.negotiable');
    return `${price.toLocaleString()} ${currency || '₽'}`;
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="catalog-page">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight">{t('catalog.title')}</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="catalog-search"
              placeholder={t('catalog.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button data-testid="catalog-search-btn" type="submit" className="h-12 rounded-full px-6">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Select value={category} onValueChange={v => { setCategory(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger data-testid="catalog-category-filter" className="w-48 h-12">
            <SelectValue placeholder={t('catalog.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.allCategories')}</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground" data-testid="catalog-loading">{t('catalog.loading')}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground" data-testid="catalog-empty">{t('catalog.noProducts')}</div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">{total} {t('dashboard.products').toLowerCase()}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" data-testid="catalog-grid">
            {products.map(product => (
              <div
                key={product.product_id}
                data-testid={`product-card-${product.product_id}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/products/${product.product_id}`)}
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                      {categories.find(c => c.id === product.category)?.icon || '📦'}
                    </div>
                  )}
                  <button
                    data-testid={`fav-btn-${product.product_id}`}
                    onClick={e => { e.stopPropagation(); toggleFavorite(product.product_id); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 glass hover:bg-background transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(product.product_id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </button>
                  {product.exchange_available && (
                    <Badge className="absolute bottom-3 left-3 bg-secondary text-secondary-foreground">{t('product.exchangeAvailable')}</Badge>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
                  <p className="font-special text-lg font-bold text-primary">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.region || ''}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-full"
              >
                &larr;
              </Button>
              <span className="flex items-center px-4 text-sm">{page}</span>
              <Button
                variant="outline"
                disabled={products.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="rounded-full"
              >
                &rarr;
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
