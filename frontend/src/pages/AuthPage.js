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
import { Chrome } from 'lucide-react';

export default function AuthPage() {
  const { user, login, register, loginWithGoogle } = useAuth();
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
                  <Input
                    data-testid="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.password')}</Label>
                  <Input
                    data-testid="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    required
                    className="h-12"
                  />
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
                    <SelectTrigger data-testid="register-role" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('auth.client')}</SelectItem>
                      <SelectItem value="shareholder">{t('auth.shareholder')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.name')}</Label>
                  <Input
                    data-testid="register-name"
                    value={regData.name}
                    onChange={e => setRegData({...regData, name: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.email')}</Label>
                  <Input
                    data-testid="register-email"
                    type="email"
                    value={regData.email}
                    onChange={e => setRegData({...regData, email: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.password')}</Label>
                  <Input
                    data-testid="register-password"
                    type="password"
                    value={regData.password}
                    onChange={e => setRegData({...regData, password: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.phone')}</Label>
                  <Input
                    data-testid="register-phone"
                    value={regData.phone}
                    onChange={e => setRegData({...regData, phone: e.target.value})}
                    className="h-12"
                  />
                </div>
                {regData.role === 'shareholder' && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('auth.shareholderNumber')}</Label>
                      <Input
                        data-testid="register-shareholder-number"
                        value={regData.shareholder_number}
                        onChange={e => setRegData({...regData, shareholder_number: e.target.value})}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('auth.inn')}</Label>
                      <Input
                        data-testid="register-inn"
                        value={regData.inn}
                        onChange={e => setRegData({...regData, inn: e.target.value})}
                        className="h-12"
                      />
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

          <Button
            data-testid="google-login-btn"
            variant="outline"
            className="w-full h-12 rounded-full"
            onClick={loginWithGoogle}
          >
            <Chrome className="mr-2 h-5 w-5" />
            {t('auth.googleLogin')}
          </Button>
        </div>
      </div>
    </div>
  );
}
