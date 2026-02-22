import React, { useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { oauthCallback } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const code = searchParams.get('code');

    if (!code || !provider) {
      toast.error('Ошибка авторизации');
      navigate('/auth', { replace: true });
      return;
    }

    const exchangeCode = async () => {
      try {
        await oauthCallback(provider, code);
        toast.success('Авторизация успешна');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        toast.error(err.message || 'Ошибка авторизации');
        navigate('/auth', { replace: true });
      }
    };

    exchangeCode();
  }, [provider, searchParams, navigate, oauthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Авторизация...</p>
      </div>
    </div>
  );
}
