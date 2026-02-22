import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

export default function AuthPage() {
  const { user, login, register, loginWithYandex, loginWithMailru } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'login');
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({
    email: '', password: '', name: '', phone: '',
    role: searchParams.get('role') || 'client',
    shareholder_number: '', inn: ''
  });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(regData);
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" data-testid="auth-page">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-special text-2xl font-bold text-primary">KAIF OZERO</h1>
          <p className="text-sm text-muted-foreground">{t('landing.hero.subtitle')}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="login-tab">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('auth.email')}</Label>
                  <Input data-testid="login-email" type="email" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.password')}</Label>
                  <Input data-testid="login-password" type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required className="h-12" />
                </div>
                <Button data-testid="login-submit" type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.login')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('auth.role')}</Label>
                  <Select value={regData.role} onValueChange={v => setRegData({...regData, role: v})}>
                    <SelectTrigger data-testid="register-role" className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('auth.client')}</SelectItem>
                      <SelectItem value="shareholder">{t('auth.shareholder')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.name')}</Label>
                  <Input data-testid="register-name" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.email')}</Label>
                  <Input data-testid="register-email" type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.password')}</Label>
                  <Input data-testid="register-password" type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.phone')}</Label>
                  <Input data-testid="register-phone" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="h-12" />
                </div>
                {regData.role === 'shareholder' && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('auth.shareholderNumber')}</Label>
                      <Input data-testid="register-shareholder-number" value={regData.shareholder_number} onChange={e => setRegData({...regData, shareholder_number: e.target.value})} className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('auth.inn')}</Label>
                      <Input data-testid="register-inn" value={regData.inn} onChange={e => setRegData({...regData, inn: e.target.value})} className="h-12" />
                    </div>
                  </>
                )}
                <Button data-testid="register-submit" type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">{t('auth.orDivider')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              data-testid="yandex-login-btn"
              variant="outline"
              className="w-full h-12 rounded-full border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50"
              onClick={loginWithYandex}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.59 14.47V18h-1.6v-1.53c-1.88-.12-3.3-.88-3.3-.88l.58-1.65s1.34.72 2.72.72c1.05 0 1.68-.41 1.68-1.13 0-.72-.6-1.15-1.92-1.62-1.87-.66-3.07-1.47-3.07-3.12 0-1.52 1.08-2.69 2.98-2.97V4.29h1.6v1.45c1.25.1 2.31.56 2.31.56l-.53 1.62s-.97-.45-2.17-.45c-1.18 0-1.55.53-1.55 1.05 0 .72.65 1.05 2.08 1.6 2.1.78 2.91 1.72 2.91 3.17-.01 1.56-1.12 2.72-3.12 3.03z"/>
              </svg>
              Войти через Яндекс
            </Button>

            <Button
              data-testid="mailru-login-btn"
              variant="outline"
              className="w-full h-12 rounded-full border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
              onClick={loginWithMailru}
            >
              <Mail className="mr-2 h-5 w-5 text-blue-500" />
              Войти через Mail.ru
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
