import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function OfferPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 md:px-12 py-8" data-testid="offer-page">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6" data-testid="offer-back-btn">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.cancel')}
      </Button>

      <article className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ПУБЛИЧНАЯ ОФЕРТА
        </h1>
        <p className="text-base text-muted-foreground italic">
          о порядке использования электронной платформы товарообмена потребительского кооператива «КАЙФ ОЗЕРО»
        </p>
        <p className="text-sm text-muted-foreground">г. Ростов-на-Дону (по месту нахождения кооператива)</p>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">1. Общие положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">1.1. Настоящий документ (далее – Оферта) является официальным предложением Потребительского кооператива «КАЙФ ОЗЕРО» (ОГРН 1239100014955, ИНН 9110032876), именуемого в дальнейшем «Оператор», в адрес любого лица, являющегося пайщиком Оператора и желающего использовать электронную платформу товарообмена (далее – Платформа), заключить договор на условиях, изложенных в Оферте.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.2. В соответствии с пунктом 2 статьи 437 Гражданского кодекса РФ настоящая Оферта является публичной: выражает намерение Оператора заключить договор с любым обратившимся пайщиком на указанных условиях.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.3. Совершение действий, предусмотренных разделом 2 Оферты, признаётся акцептом (принятием) Оферты. С момента акцепта договор считается заключённым в письменной форме.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">1.4. Оператор вправе вносить изменения в условия Оферты. Изменения вступают в силу с момента их опубликования на сайте Платформы. Продолжение использования Платформы после изменения условий означает согласие пользователя с ними.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">2. Термины и определения</h2>
          <ul className="text-sm leading-relaxed text-muted-foreground space-y-2 list-disc pl-5">
            <li><strong>Оператор</strong> – Потребительский кооператив «КАЙФ ОЗЕРО», являющийся владельцем и администратором Платформы.</li>
            <li><strong>Пайщик (пользователь)</strong> – физическое или юридическое лицо, являющееся членом кооператива в соответствии с Уставом и прошедшее регистрацию на Платформе.</li>
            <li><strong>Платформа</strong> – программно-аппаратный комплекс, обеспечивающий возможность размещения информации о товарах, работах, услугах и совершения сделок между пайщиками.</li>
            <li><strong>Личный кабинет</strong> – персонализированный раздел Платформы для управления объявлениями, сделками и получения уведомлений.</li>
            <li><strong>Сделка</strong> – договор купли-продажи, мены или иной договор, заключаемый между пайщиками с использованием функционала Платформы.</li>
            <li><strong>Комиссия</strong> – денежная сумма, взимаемая Оператором за использование Платформы при совершении сделки.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">3. Регистрация на Платформе</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">3.1. Для получения доступа к функционалу Платформы пайщик обязан пройти процедуру регистрации, заполнив электронную форму и подтвердив согласие с настоящей Офертой.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.2. При регистрации пользователь обязуется предоставить достоверную информацию: для физических лиц – ФИО, номер пайщика, контактный телефон, email; для юридических лиц – наименование, ИНН, ОГРН, ФИО руководителя.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.3. Оператор проверяет соответствие предоставленных сведений данным реестра пайщиков и вправе отказать в регистрации без объяснения причин.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.4. Пользователь несёт ответственность за сохранность идентификационных данных и за все действия, совершённые с их использованием.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">3.5. Один пайщик может иметь только один личный кабинет.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">4. Порядок размещения информации и совершения сделок</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">4.1. Пользователь получает возможность размещать объявления о предлагаемых к реализации или обмену товарах, работах, услугах с достоверной информацией.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.2. Запрещается размещать информацию, противоречащую законодательству РФ. Оператор вправе удалить любое объявление без предупреждения.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.3. Для совершения сделки пользователь инициирует её через личный кабинет. После согласования условий стороны подтверждают сделку.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">4.4. Оператор не является стороной сделки и не несёт ответственности за исполнение обязательств.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">5. Комиссия и порядок расчётов</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">5.1. За использование Платформы при совершении каждой сделки Оператор взимает комиссию. Актуальный размер публикуется на сайте Платформы.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.2. На момент вступления Оферты в силу размер комиссии составляет <strong className="text-primary font-special">1,5%</strong> (полтора процента) от суммы сделки.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.3. Комиссия начисляется автоматически. Оплата производится в срок не позднее 5 рабочих дней с даты совершения сделки.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">5.4. При неоплате комиссии Оператор вправе приостановить доступ к Платформе до полного погашения задолженности.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">6. Права и обязанности сторон</h2>
          <p className="text-sm leading-relaxed text-muted-foreground"><strong>6.1. Оператор обязуется:</strong> обеспечить бесперебойное функционирование Платформы; обеспечить конфиденциальность персональных данных; оказывать информационную поддержку; предоставлять отчёты о комиссии.</p>
          <p className="text-sm leading-relaxed text-muted-foreground"><strong>6.2. Оператор вправе:</strong> приостанавливать доступ при нарушении условий; изменять условия с уведомлением; собирать обезличенную статистику.</p>
          <p className="text-sm leading-relaxed text-muted-foreground"><strong>6.3. Пользователь обязуется:</strong> соблюдать условия Оферты и Устав; предоставлять достоверную информацию; не использовать Платформу для мошеннических действий; своевременно оплачивать комиссию.</p>
          <p className="text-sm leading-relaxed text-muted-foreground"><strong>6.4. Пользователь вправе:</strong> бесплатно пользоваться основным функционалом; отказаться от использования в любое время.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">7. Ответственность</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">7.1. Стороны несут ответственность в соответствии с законодательством РФ.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">7.2. Оператор не несёт ответственности за содержание информации пользователей; убытки от действий других пользователей; временные сбои в работе Платформы.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">7.3. Пользователь самостоятельно несёт ответственность за соблюдение налогового законодательства.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">7.4. Все споры подлежат разрешению путём переговоров, а при недостижении согласия – в суде по месту нахождения Оператора.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold mt-8">8. Прочие условия</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">8.1. Оферта действует с момента публикования на сайте Платформы до момента её отзыва Оператором.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">8.2. Признание недействительным какого-либо положения не влечёт недействительности остальных положений.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">8.3. Во всём, что не урегулировано Офертой, стороны руководствуются Уставом кооператива и законодательством РФ.</p>
        </section>

        <section className="space-y-4 mt-8 pt-6 border-t border-border">
          <h2 className="text-base md:text-lg font-bold">9. Реквизиты Оператора</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Потребительский кооператив «КАЙФ ОЗЕРО»</strong></p>
            <p>Юридический адрес: 296555, Республика Крым, Сакский район, с. Уютное, ул. Терешковой, д. 5</p>
            <p>ИНН 9110032876, КПП 911001001, ОГРН 1239100014955</p>
            <p>Расчётный счёт: 40703810152000000245 в ЮГО-ЗАПАДНОМ БАНКЕ ПАО СБЕРБАНК</p>
            <p>БИК 046015602, корр. счёт 30101810600000000602</p>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground italic">
          <p>Настоящая Оферта является официальным приглашением заключить договор на указанных условиях. Акцептуя Оферту, пользователь подтверждает, что ознакомлен с Уставом кооператива и правилами Платформы.</p>
        </div>
      </article>
    </div>
  );
}
