import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function RulesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 md:px-12 py-8" data-testid="rules-page">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6" data-testid="rules-back-btn">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.cancel')}
      </Button>

      <article className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ПРАВИЛА ЭЛЕКТРОННОЙ ПЛАТФОРМЫ ПО ОБМЕНУ ПАЯМИ ПОТРЕБИТЕЛЬСКОГО КООПЕРАТИВА «КАЙФ ОЗЕРО»
        </h1>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">1. Общие положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">1.1. Настоящие Правила (далее – Правила) разработаны в соответствии с Уставом Потребительского кооператива «КАЙФ ОЗЕРО» (далее – Кооператив), Гражданским кодексом РФ, Федеральным законом «О потребительской кооперации (потребительских обществах, их союзах) в Российской Федерации» и регулируют порядок совершения сделок по обмену паями между пайщиками Кооператива с использованием электронной платформы (далее – Платформа).</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.2. Платформа представляет собой программно-аппаратный комплекс, доступный через личный кабинет пайщика на сайте Кооператива, предназначенный для размещения предложений об обмене паев, поиска контрагентов и заключения сделок.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.3. Пайщик, использующий Платформу, подтверждает своё ознакомление и согласие с настоящими Правилами, а также с Уставом Кооператива и иными внутренними документами.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.4. Кооператив обеспечивает техническую возможность функционирования Платформы и регистрацию перехода прав на паи, но не является стороной сделок по обмену.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">2. Термины и определения</h2>
          <ul className="text-sm leading-relaxed text-muted-foreground space-y-2 list-disc pl-5">
            <li><strong>Пай</strong> – часть паевого фонда Кооператива, принадлежащая пайщику, подтверждённая записью в реестре пайщиков и (или) свидетельством о пае. Пай выражается в денежной сумме, внесённой пайщиком в паевой фонд.</li>
            <li><strong>Обмен паями</strong> – сделка, при которой один пайщик передаёт другому пайщику принадлежащий ему пай (или его часть) в обмен на пай (часть пая) другого пайщика либо на иное имущество/денежные средства.</li>
            <li><strong>Инициатор</strong> – пайщик, разместивший на Платформе предложение об обмене пая.</li>
            <li><strong>Акцептант</strong> – пайщик, принявший предложение инициатора.</li>
            <li><strong>Реестр пайщиков</strong> – документ (электронная база данных), содержащий сведения о каждом пайщике, размере его пая и операциях с паями.</li>
            <li><strong>Комиссия</strong> – плата, взимаемая Кооперативом за регистрацию сделки и внесение изменений в реестр.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">3. Условия допуска паев к обращению на Платформе</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">3.1. К обращению на Платформе допускаются паи, полностью оплаченные пайщиком и отражённые в реестре пайщиков.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.2. Не допускаются к обмену: паи, находящиеся в залоге или под арестом; части паевого фонда, составляющие неделимый фонд Кооператива; паи пайщиков, в отношении которых введены ограничения решением суда или органов управления Кооператива.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.3. Пайщик вправе выставить на обмен как весь свой пай, так и его часть. При выставлении части пая её размер должен быть выражен в рублях и быть не менее минимальной суммы, установленной решением Совета Кооператива (на момент утверждения Правил – 1 000 рублей).</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">4. Порядок размещения предложений</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">4.1. Пайщик-инициатор через личный кабинет создаёт заявку на обмен, указывая: размер предлагаемого пая (сумму); желаемый эквивалент обмена; срок действия предложения (не более 30 календарных дней); иную информацию по усмотрению инициатора.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.2. Размещение предложения является публичной офертой для пайщиков Кооператива, если в предложении не указано иное.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.3. Инициатор вправе отозвать предложение до момента его акцепта.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.4. Кооператив имеет право отклонять или удалять предложения, не соответствующие настоящим Правилам или законодательству.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">5. Порядок заключения сделки</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">5.1. Акцепт предложения осуществляется путём направления инициатору через Платформу уведомления о согласии.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.2. После получения акцепта инициатор в течение 3 рабочих дней подтверждает сделку либо отказывает.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.3. При совпадении условий сделка считается заключённой с момента подтверждения инициатором. Платформа автоматически формирует электронный документ (протокол сделки).</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.4. Заключённая сделка является основанием для перерегистрации паев в реестре пайщиков.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">6. Роль Кооператива и регистрация перехода прав</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">6.1. Кооператив не участвует в расчётах между сторонами и не несёт ответственности за исполнение денежных или иных обязательств по сделке.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">6.2. Для переоформления прав на пай стороны обязаны в течение 5 рабочих дней после заключения сделки направить в Кооператив заявление о внесении изменений в реестр пайщиков.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">6.3. Кооператив в течение 10 рабочих дней проверяет законность сделки и при отсутствии препятствий вносит изменения в реестр.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">7. Комиссия Кооператива</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">7.1. За регистрацию сделки по обмену паями и внесение изменений в реестр пайщиков взимается комиссия.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">7.2. Размер комиссии устанавливается решением Совета Кооператива. На момент утверждения Правил комиссия составляет 0,5% от суммы обмениваемого пая, но не менее 100 рублей и не более 10 000 рублей с каждой стороны сделки.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">7.3. Комиссия уплачивается каждой стороной сделки в равных долях. Оплата производится в безналичном порядке на расчётный счёт Кооператива до подачи заявления о перерегистрации.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">8. Права и обязанности сторон сделки</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">8.1. Пайщики обязаны: предоставлять достоверную информацию; своевременно уплачивать комиссию; урегулировать споры самостоятельно; уведомлять Кооператив об изменении реквизитов.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">8.2. Пайщики вправе: отозвать предложение до акцепта; требовать регистрации перехода прав; обжаловать отказ в перерегистрации.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">9. Ответственность и разрешение споров</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">9.1. Кооператив не несёт ответственности за неисполнение обязательств по сделке между пайщиками.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">9.2. Споры разрешаются сторонами самостоятельно, при необходимости – в судебном порядке.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">9.3. Все споры подлежат разрешению в соответствии с законодательством РФ по месту нахождения Кооператива.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">10. Заключительные положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">10.1. Настоящие Правила вступают в силу с момента их утверждения Советом Кооператива и размещения на сайте Платформы.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">10.2. Кооператив имеет право вносить изменения в Правила, уведомляя пайщиков не менее чем за 10 дней до вступления изменений в силу.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">10.3. Во всём, что не предусмотрено настоящими Правилами, стороны руководствуются Уставом Кооператива и законодательством РФ.</p>
        </section>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground italic">
          <p>Утверждено решением Совета Потребительского кооператива «КАЙФ ОЗЕРО»</p>
        </div>
      </article>
    </div>
  );
}
