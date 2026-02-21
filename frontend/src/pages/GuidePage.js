import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, ChevronRight, ShoppingBag, UserPlus, Search, Heart, MessageCircle, Handshake, ClipboardList, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const GUIDE_DATA = {
  ru: {
    title: 'Руководство пользователя',
    subtitle: 'Как пользоваться платформой КАЙФ ОЗЕРО',
    back: 'На главную',
    sections: [
      {
        id: 'client',
        icon: ShoppingBag,
        title: 'Для клиентов',
        description: 'Поиск товаров, оформление заявок и общение с продавцами',
        items: [
          {
            q: 'Как зарегистрироваться?',
            a: 'Нажмите кнопку «Войти» в правом верхнем углу сайта. Выберите вкладку «Регистрация», заполните имя, email и пароль. Выберите роль «Клиент» и нажмите «Зарегистрироваться». После этого вы автоматически войдёте в систему.'
          },
          {
            q: 'Как найти нужный товар или услугу?',
            a: 'Перейдите в раздел «Каталог» через верхнее меню. Используйте строку поиска для ввода ключевых слов. Вы можете фильтровать товары по категориям (продукты, услуги, строительство и др.), а также по ценовому диапазону и региону.'
          },
          {
            q: 'Как отправить заявку на покупку?',
            a: 'Откройте карточку интересующего товара, нажав на него в каталоге. На странице товара нажмите кнопку «Купить» или «Обмен» (если доступен обмен). Заполните сообщение для продавца и отправьте заявку. Продавец получит уведомление и сможет подтвердить или отклонить сделку.'
          },
          {
            q: 'Как запросить встречу с представителем?',
            a: 'На странице товара нажмите кнопку «Запросить встречу». Укажите предпочтительную дату и оставьте комментарий. Представитель кооператива свяжется с вами для согласования деталей.'
          },
          {
            q: 'Как добавить товар в избранное?',
            a: 'На странице товара нажмите иконку сердца. Товар сохранится в вашем личном кабинете в разделе «Избранное». Так вы сможете быстро вернуться к понравившимся предложениям.'
          },
          {
            q: 'Как написать администратору?',
            a: 'В правом нижнем углу сайта есть плавающая кнопка чата. Нажмите на неё, чтобы открыть окно переписки с администратором. Введите сообщение и отправьте. Администратор ответит в ближайшее время.'
          },
          {
            q: 'Где посмотреть историю моих заявок?',
            a: 'Войдите в личный кабинет (кнопка «Кабинет» в верхнем меню). Здесь вы увидите все ваши заявки, их статусы (ожидание, подтверждено, завершено, отменено) и историю переписки с продавцами.'
          }
        ]
      },
      {
        id: 'shareholder',
        icon: ClipboardList,
        title: 'Для пайщиков',
        description: 'Управление товарами, сделки и реестр пайщиков',
        items: [
          {
            q: 'Как зарегистрироваться как пайщик?',
            a: 'Нажмите «Войти», выберите «Регистрация» и укажите роль «Пайщик». Заполните все поля, включая номер пайщика и ИНН (если есть). После регистрации администратор должен подтвердить вашу учётную запись.'
          },
          {
            q: 'Как добавить товар или услугу?',
            a: 'Перейдите в личный кабинет и нажмите кнопку «Добавить товар». Заполните форму: название, описание, категорию, цену, регион. Отметьте, доступен ли обмен. После сохранения товар появится в каталоге после модерации администратором.'
          },
          {
            q: 'Как редактировать или удалить товар?',
            a: 'В личном кабинете на вкладке «Товары» найдите нужный товар. Нажмите иконку карандаша для редактирования или корзины для удаления. Изменения вступят в силу сразу.'
          },
          {
            q: 'Как обработать входящую заявку?',
            a: 'В личном кабинете перейдите на вкладку «Сделки». Входящие заявки отмечены статусом «Ожидание». Нажмите «Подтвердить», чтобы принять сделку, или «Отменить», чтобы отклонить. После подтверждения обеими сторонами сделка будет завершена.'
          },
          {
            q: 'Как посмотреть свои данные в реестре пайщиков?',
            a: 'В личном кабинете перейдите на вкладку «Реестр». Здесь отображается ваша запись в реестре кооператива: ФИО, номер пайщика, сумма пая, дата вступления и статус. Данные доступны только для просмотра, редактирование выполняет администратор.'
          },
          {
            q: 'Как отслеживать статистику?',
            a: 'В верхней части личного кабинета отображаются ключевые показатели: количество товаров, просмотры, количество сделок и встреч. Используйте эту информацию для анализа эффективности ваших предложений.'
          },
          {
            q: 'Что такое комиссия 1.5%?',
            a: 'При завершении каждой сделки кооператив удерживает комиссию в размере 1.5% от суммы. Из них 0.9% идёт в фонд кооператива, а 0.6% — вознаграждение менеджеру. Комиссия рассчитывается автоматически и отображается в деталях сделки.'
          }
        ]
      },
      {
        id: 'general',
        icon: BookOpen,
        title: 'Общие вопросы',
        description: 'Навигация, языки, тема оформления и другое',
        items: [
          {
            q: 'Как сменить язык интерфейса?',
            a: 'В правом верхнем углу сайта нажмите на кнопку с текущим языком (RU, EN или ZH). В выпадающем меню выберите нужный язык. Интерфейс переключится мгновенно.'
          },
          {
            q: 'Как переключить тему (светлая/тёмная)?',
            a: 'Рядом с переключателем языка находится иконка солнца/луны. Нажмите на неё, чтобы переключиться между тёмной и светлой темой оформления.'
          },
          {
            q: 'Где находится база знаний?',
            a: 'В верхнем меню нажмите «База знаний». Здесь собраны документы кооператива: каталоги пайщиков, документы, решения совета, протоколы собраний и договора.'
          },
          {
            q: 'Как ознакомиться с правилами платформы?',
            a: 'Внизу каждой страницы, в футере, есть ссылки «Правила сервиса» и «Публичная оферта». Нажмите на них, чтобы прочитать полные документы.'
          },
          {
            q: 'Как выйти из аккаунта?',
            a: 'Нажмите на своё имя в правом верхнем углу и выберите «Выйти». Вы будете перенаправлены на главную страницу.'
          }
        ]
      }
    ]
  },
  en: {
    title: 'User Guide',
    subtitle: 'How to use the KAIF OZERO platform',
    back: 'Home',
    sections: [
      {
        id: 'client',
        icon: ShoppingBag,
        title: 'For Clients',
        description: 'Searching products, placing requests and communicating with sellers',
        items: [
          { q: 'How to register?', a: 'Click "Sign In" in the top right corner. Select "Register", fill in your name, email and password. Choose "Client" role and click "Register".' },
          { q: 'How to find products?', a: 'Go to "Catalog" from the top menu. Use the search bar and filters by category, price range and region.' },
          { q: 'How to send a purchase request?', a: 'Open a product page and click "Buy" or "Exchange". Fill in a message for the seller and submit.' },
          { q: 'How to contact admin?', a: 'Click the floating chat button in the bottom-right corner of the page to open a chat with the administrator.' }
        ]
      },
      {
        id: 'shareholder',
        icon: ClipboardList,
        title: 'For Shareholders',
        description: 'Managing products, deals and shareholder registry',
        items: [
          { q: 'How to register as a shareholder?', a: 'Click "Sign In", choose "Register" and select "Shareholder" role. Fill in your shareholder number and INN.' },
          { q: 'How to add a product?', a: 'Go to your Dashboard and click "Add Product". Fill in the form with title, description, category, price and region.' },
          { q: 'How to handle incoming requests?', a: 'In your Dashboard, go to "Deals" tab. Confirm or cancel pending requests.' },
          { q: 'How to view shareholder registry?', a: 'In your Dashboard, go to "Registry" tab to see your cooperative membership details.' }
        ]
      },
      {
        id: 'general',
        icon: BookOpen,
        title: 'General Questions',
        description: 'Navigation, languages, theme and more',
        items: [
          { q: 'How to change language?', a: 'Click the language button (RU/EN/ZH) in the top right corner.' },
          { q: 'How to switch theme?', a: 'Click the sun/moon icon next to the language switcher.' },
          { q: 'Where is the Knowledge Base?', a: 'Click "Knowledge Base" in the top navigation menu.' }
        ]
      }
    ]
  },
  zh: {
    title: '用户指南',
    subtitle: '如何使用 KAIF OZERO 平台',
    back: '首页',
    sections: [
      {
        id: 'client',
        icon: ShoppingBag,
        title: '客户指南',
        description: '搜索商品、提交请求和与卖家沟通',
        items: [
          { q: '如何注册？', a: '点击右上角的"登录"按钮，选择"注册"，填写姓名、邮箱和密码，选择"客户"角色。' },
          { q: '如何查找商品？', a: '从顶部菜单进入"目录"，使用搜索栏和筛选器。' },
          { q: '如何联系管理员？', a: '点击页面右下角的聊天按钮。' }
        ]
      },
      {
        id: 'shareholder',
        icon: ClipboardList,
        title: '股东指南',
        description: '管理商品、交易和股东登记',
        items: [
          { q: '如何注册为股东？', a: '点击"登录"，选择"注册"，选择"股东"角色。' },
          { q: '如何添加商品？', a: '进入仪表板，点击"添加商品"按钮。' }
        ]
      },
      {
        id: 'general',
        icon: BookOpen,
        title: '常见问题',
        description: '导航、语言、主题等',
        items: [
          { q: '如何切换语言？', a: '点击右上角的语言按钮（RU/EN/ZH）。' },
          { q: '如何切换主题？', a: '点击语言切换器旁边的太阳/月亮图标。' }
        ]
      }
    ]
  }
};

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-muted/30 transition-colors"
        data-testid={`guide-q-${item.q.slice(0, 20).replace(/\s/g, '-')}`}
      >
        <span className="font-medium text-sm pr-4">{item.q}</span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-muted/10 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const data = GUIDE_DATA[lang] || GUIDE_DATA.ru;
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (sectionId, idx) => {
    const key = `${sectionId}-${idx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen" data-testid="guide-page">
      {/* Hero */}
      <div className="border-b border-border/50 bg-muted/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground" data-testid="guide-back-btn">
            <ArrowLeft className="h-4 w-4 mr-1" /> {data.back}
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{data.title}</h1>
          <p className="text-base text-muted-foreground">{data.subtitle}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 space-y-12">
        {data.sections.map(section => {
          const Icon = section.icon;
          return (
            <section key={section.id} data-testid={`guide-section-${section.id}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {section.items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    item={item}
                    isOpen={!!openItems[`${section.id}-${idx}`]}
                    onToggle={() => toggleItem(section.id, idx)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
