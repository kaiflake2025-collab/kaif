import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'kaif_cookie_consent';

const TEXTS = {
  ru: {
    message: 'Мы используем файлы cookie для улучшения работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с',
    policy: 'правилами платформы',
    accept: 'Принять',
    decline: 'Отклонить',
  },
  en: {
    message: 'We use cookies to improve your experience. By continuing to use the site, you agree to our',
    policy: 'platform rules',
    accept: 'Accept',
    decline: 'Decline',
  },
  zh: {
    message: '我们使用Cookie来改善您的体验。继续使用本网站即表示您同意',
    policy: '平台规则',
    accept: '接受',
    decline: '拒绝',
  },
};

export default function CookieConsent() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  const text = TEXTS[lang] || TEXTS.ru;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-fade-up"
      data-testid="cookie-consent"
    >
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg p-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] glass flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground flex-1">
          {text.message}{' '}
          <Link to="/rules" className="text-primary hover:underline" data-testid="cookie-rules-link">
            {text.policy}
          </Link>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            className="rounded-full text-xs"
            data-testid="cookie-decline-btn"
          >
            {text.decline}
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="rounded-full text-xs"
            data-testid="cookie-accept-btn"
          >
            {text.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
