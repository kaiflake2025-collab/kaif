import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Users, TrendingUp, Handshake, Apple, Wrench, Building, Truck, Cpu, Shirt, HeartPulse, GraduationCap, Home, Package, Newspaper, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const HERO_BG = "https://customer-assets.emergentagent.com/job_coop-catalog/artifacts/t03m8pqx_%D1%84%D0%BE%D1%82%D0%BE%20%D0%BA%D0%B0%D0%B9%D1%84.jpg";
const TRUST_IMG = "https://images.pexels.com/photos/7413989/pexels-photo-7413989.jpeg";

const CATEGORY_ICONS = {
  food: Apple, services: Wrench, construction: Building, transport: Truck,
  electronics: Cpu, health: HeartPulse, education: GraduationCap,
  realestate: Home, clothing: Shirt, other: Package
};

const CATEGORY_NAMES = {
  food: { ru: 'Продукты', en: 'Food', zh: '食品' },
  services: { ru: 'Услуги', en: 'Services', zh: '服务' },
  construction: { ru: 'Строительство', en: 'Construction', zh: '建筑' },
  transport: { ru: 'Транспорт', en: 'Transport', zh: '交通' },
  electronics: { ru: 'Электроника', en: 'Electronics', zh: '电子' },
  health: { ru: 'Здоровье', en: 'Health', zh: '健康' },
  education: { ru: 'Образование', en: 'Education', zh: '教育' },
  realestate: { ru: 'Недвижимость', en: 'Real Estate', zh: '房产' },
  clothing: { ru: 'Одежда', en: 'Clothing', zh: '服装' },
  other: { ru: 'Другое', en: 'Other', zh: '其他' }
};

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Lake" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="max-w-2xl space-y-8">
            <div className="animate-fade-up">
              <span className="text-primary font-special text-sm tracking-widest uppercase">{t('landing.hero.subtitle')}</span>
            </div>
            <h1 className="animate-fade-up animate-delay-100 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="animate-fade-up animate-delay-200 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t('landing.hero.desc')}
            </p>
            <div className="animate-fade-up animate-delay-300 flex flex-wrap gap-4">
              <Button
                data-testid="hero-catalog-btn"
                onClick={() => navigate('/catalog')}
                className="rounded-full px-8 py-6 text-base shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all duration-300"
                size="lg"
              >
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                data-testid="hero-join-btn"
                variant="outline"
                onClick={() => navigate('/auth?tab=register&role=shareholder')}
                className="rounded-full px-8 py-6 text-base border-foreground/30 text-foreground hover:border-primary hover:text-primary transition-all duration-300"
                size="lg"
              >
                {t('landing.hero.join')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Banner */}
      <section className="py-8 border-y border-border/50" data-testid="commission-banner">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="font-special text-2xl font-bold text-primary">1.5%</p>
              <p className="text-sm text-muted-foreground">{t('landing.commissionDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-secondary" />
            <div>
              <p className="font-special text-2xl font-bold text-secondary">0.9%</p>
              <p className="text-sm text-muted-foreground">{t('deal.commissionCoop')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div>
              <p className="font-special text-2xl font-bold text-accent">0.6%</p>
              <p className="text-sm text-muted-foreground">{t('deal.commissionManager')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-12" data-testid="categories-section">
        <h2 className="text-base md:text-lg font-bold mb-10 tracking-tight">{t('landing.categories')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[
            { id: 'food' },
            { id: 'services' },
            { id: 'construction' },
            { id: 'transport' },
            { id: 'electronics' },
            { id: 'health' },
            { id: 'education' },
            { id: 'realestate' },
            { id: 'clothing' },
            { id: 'other' },
          ].map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Package;
            return (
            <button
              key={cat.id}
              data-testid={`category-${cat.id}`}
              onClick={() => navigate(`/catalog?category=${cat.id}`)}
              className="group rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 p-6 text-left"
            >
              <Icon className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium">{CATEGORY_NAMES[cat.id]?.[lang] || cat.id}</span>
            </button>
          )})}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/50" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-base md:text-lg font-bold mb-16 tracking-tight">{t('landing.howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: t('landing.step1'), desc: t('landing.step1Desc'), icon: Search },
              { step: '02', title: t('landing.step2'), desc: t('landing.step2Desc'), icon: Handshake },
              { step: '03', title: t('landing.step3'), desc: t('landing.step3Desc'), icon: ShieldCheck },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <span className="font-special text-4xl font-bold text-primary/30">{item.step}</span>
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-base font-bold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection lang={lang} />

      {/* Trust Section */}
      <section className="py-20 border-t border-border/50" data-testid="trust-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-base md:text-lg font-bold tracking-tight">
              {t('landing.hero.subtitle')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.hero.desc')}
            </p>
            <Button
              data-testid="trust-catalog-btn"
              onClick={() => navigate('/catalog')}
              className="rounded-full px-8"
            >
              {t('landing.hero.cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={TRUST_IMG} alt="Trust" className="w-full h-72 object-cover" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-special text-lg font-bold text-primary">KAIF</span>
              <span className="text-muted-foreground text-sm">OZERO</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                data-testid="footer-rules-btn"
                onClick={() => navigate('/rules')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                {lang === 'en' ? 'Platform Rules' : lang === 'zh' ? '平台规则' : 'Правила сервиса'}
              </button>
              <button
                data-testid="footer-offer-btn"
                onClick={() => navigate('/offer')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                {lang === 'en' ? 'Public Offer' : lang === 'zh' ? '公开要约' : 'Публичная оферта'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">&copy; 2024 {t('landing.hero.subtitle')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
