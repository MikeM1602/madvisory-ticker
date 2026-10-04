/* ================================================================
   MENA Advisory — main.js
   Particle hero · Ticker feed · Theme · Lang · Nav · Forms
   ================================================================ */
(function () {
  'use strict';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  function init() {

  /* ── Theme ─────────────────────────────────────────────────── */
  const html = document.documentElement;
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const sunIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  let theme = localStorage.getItem('ma-theme') || 'dark';
  html.setAttribute('data-theme', theme);
  if (themeBtn) { themeBtn.innerHTML = theme === 'dark' ? moonIcon : sunIcon; }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', theme);
      localStorage.setItem('ma-theme', theme);
      themeBtn.innerHTML = theme === 'dark' ? moonIcon : sunIcon;
    });
  }

  /* ── Scroll-aware header ───────────────────────────────────── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('header--scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── Mobile menu ───────────────────────────────────────────── */
  const burger = document.querySelector('[data-burger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Dropdown nav ──────────────────────────────────────────── */
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const trigger = dd.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.nav-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
      trigger.setAttribute('aria-expanded', String(!expanded));
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
  });

  /* ── Scroll animations ─────────────────────────────────────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay ? parseFloat(e.target.dataset.delay) * 60 : 0;
        setTimeout(() => {
          e.target.classList.add('visible');
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  function observeAll() {
    document.querySelectorAll('.fade-up, .expertise-item, .service-card, .news-card, .testimonial-card, .client-type-item').forEach((el, i) => {
      if (!el.classList.contains('visible')) {
        if (el.classList.contains('service-card') || el.classList.contains('news-card') || el.classList.contains('testimonial-card') || el.classList.contains('client-type-item')) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(16px)';
          el.style.transition = `opacity 0.5s ${i * 0.07}s ease, transform 0.5s ${i * 0.07}s ease`;
        }
        observer.observe(el);
      }
    });
  }
  observeAll();

  setTimeout(() => {
    document.querySelectorAll('.fade-up, .expertise-item').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 100) {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 120);

  /* ── Smooth anchor scroll ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.querySelectorAll('.fade-up, .expertise-item').forEach(el => {
          el.classList.add('visible');
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
      }
    });
  });

  /* ── CTA word rotator ──────────────────────────────────────── */
  if (document.getElementById('ctaWord')) {
    const words = ['Achieve?', 'Accelerate?', 'Accomplish?', 'Acquire?'];
    let idx = 0;
    setInterval(() => {
      const w = document.getElementById('ctaWord');
      if (!w || document.documentElement.getAttribute('lang') === 'ar') return;
      w.style.transition = 'opacity 0.28s, transform 0.28s';
      w.style.opacity = '0';
      w.style.transform = 'translateY(8px)';
      setTimeout(() => {
        const x = document.getElementById('ctaWord');
        if (!x) return;
        idx = (idx + 1) % words.length;
        x.textContent = words[idx];
        x.style.opacity = '1';
        x.style.transform = 'translateY(0)';
      }, 280);
    }, 2400);
  }

  /* ── Particle canvas hero ──────────────────────────────────── */
  (function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
    const N = 55;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.5,
      a: Math.random() * 0.45 + 0.1
    }));

    let raf;
    function draw() {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dark = isDark();
      const c = dark ? '0,212,255' : '0,98,204';

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${c},${0.09 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c},${particles[i].a})`;
        ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); } else { draw(); }
    });
  })();

  /* ── Ticker ────────────────────────────────────────────────── */
  (function () {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    // Built-in items: checked facts, used whenever the remote feed is missing, stale or invalid.
    const FALLBACK = [
      {"tag":"Alert","text":"EU AI Act: high-risk obligations deferred to 2 December 2027 under the AI Omnibus, in force since 27 July 2026","ar_tag":"تنبيه","ar_text":"قانون الذكاء الاصطناعي الأوروبي: تأجيل التزامات الأنظمة عالية المخاطر إلى 2 ديسمبر 2027 بموجب حزمة Omnibus السارية منذ 27 يوليو 2026"},
      {"tag":"Regulatory","text":"UAE: the one-year transition period under the new Central Bank Law (Federal Decree-Law No. 6 of 2025) ended in mid-September 2026","ar_tag":"تنظيمي","ar_text":"الإمارات: انتهت في منتصف سبتمبر 2026 الفترة الانتقالية البالغة عاماً واحداً بموجب قانون المصرف المركزي الجديد (المرسوم بقانون اتحادي رقم 6 لسنة 2025)"},
      {"tag":"Updated","text":"PSD3 and PSR: final texts agreed in EU negotiations; the new rules are expected to apply from 2028","ar_tag":"محدّث","ar_text":"PSD3 وPSR: الاتفاق على النصوص النهائية في مفاوضات الاتحاد الأوروبي، ويُتوقع تطبيق القواعد الجديدة اعتباراً من 2028"},
      {"tag":"New","text":"Digital euro: the European Parliament's economic committee backs the regulation; negotiations with EU member states follow","ar_tag":"جديد","ar_text":"اليورو الرقمي: لجنة الشؤون الاقتصادية في البرلمان الأوروبي تؤيد اللائحة، وتليها مفاوضات مع الدول الأعضاء"},
      {"tag":"Regulatory","text":"UK: the Financial Services and Markets Bill 2026 would fold the Payment Systems Regulator into the FCA","ar_tag":"تنظيمي","ar_text":"المملكة المتحدة: مشروع قانون الخدمات والأسواق المالية لعام 2026 يدمج هيئة تنظيم أنظمة الدفع في هيئة السلوك المالي"},
      {"tag":"Regulatory","text":"Saudi Arabia: SAMA now licenses open banking providers; Lean Technologies was the first, in March 2026","ar_tag":"تنظيمي","ar_text":"السعودية: البنك المركزي السعودي يرخّص مزودي المصرفية المفتوحة، وكانت Lean Technologies أول المرخَّصين في مارس 2026"},
      {"tag":"Updated","text":"Saudi Central Bank confirms it is no longer a participating member of Project mBridge","ar_tag":"محدّث","ar_text":"البنك المركزي السعودي يؤكد أنه لم يعد عضواً مشاركاً في مشروع mBridge"},
      {"tag":"New","text":"Mastercard completes its acquisition of stablecoin infrastructure firm BVNK","ar_tag":"جديد","ar_text":"ماستركارد تُتمّ استحواذها على BVNK المتخصصة في البنية التحتية للعملات المستقرة"},
      {"tag":"New","text":"Visa agrees to acquire behavioural biometrics specialist BioCatch","ar_tag":"جديد","ar_text":"فيزا توافق على الاستحواذ على BioCatch المتخصصة في القياسات الحيوية السلوكية"}
    ];
    const AR_TAGS = { 'New':'جديد', 'Updated':'محدّث', 'Alert':'تنبيه', 'Regulatory':'تنظيمي', 'Insight':'تحليل', 'Report':'تقرير' };
    const REMOTE = 'https://raw.githubusercontent.com/MikeM1602/madvisory-ticker/main/ticker.json';
    const MAX_AGE_DAYS = 21;

    let remote = null;
    let pos = 0;

    const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
    const cap = (t) => { t = String(t || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : ''; };
    const curLang = () => { try { return localStorage.getItem('ma-lang') || 'en'; } catch (e) { return 'en'; } };

    function pick(lang) {
      if (!remote) return FALLBACK;
      if (lang === 'ar' && !remote.every(i => i.ar_text)) return FALLBACK;
      return remote;
    }

    function buildTicker(lang) {
      const isAr = lang === 'ar';
      const items = pick(lang);
      // Force LTR so the scroll loop works when the page is RTL; Arabic text still renders RTL inside each span.
      track.style.direction = 'ltr';
      if (track.parentElement) track.parentElement.style.direction = 'ltr';
      const doubled = [...items, ...items];
      track.innerHTML = doubled.map(item => {
        const enTag = cap(item.tag) || 'New';
        const tag = isAr ? (item.ar_tag || AR_TAGS[enTag] || enTag) : enTag;
        const text = isAr ? (item.ar_text || item.text) : item.text;
        return '<span class="ticker-item"><span class="tag">' + esc(tag) + '</span><span class="text"' + (isAr ? ' dir="rtl"' : '') + '>' + esc(text) + '</span></span><span class="ticker-sep">·</span>';
      }).join('');
    }

    window.__rebuildTicker = function (lang) { buildTicker(lang); pos = 0; };

    function startScroll() {
      const speed = 0.5;
      let paused = false;
      track.addEventListener('mouseenter', () => { paused = true; });
      track.addEventListener('mouseleave', () => { paused = false; });
      function animate() {
        if (!paused) {
          pos -= speed;
          const half = track.scrollWidth / 2;
          if (half > 0 && Math.abs(pos) >= half) pos = 0;
          track.style.transform = 'translateX(' + pos + 'px)';
        }
        requestAnimationFrame(animate);
      }
      animate();
    }

    function validItems(list) {
      return Array.isArray(list) && list.length >= 4 && list.length <= 20 &&
        list.every(i => i && typeof i.text === 'string' && i.text.length >= 10 && i.text.length <= 220 &&
          (i.ar_text == null || (typeof i.ar_text === 'string' && i.ar_text.length <= 260)));
    }

    buildTicker(curLang());
    startScroll();

    // Remote feed from the GitHub workflow. Used only if it is in the {updated, items} format,
    // passes validation and is less than MAX_AGE_DAYS old. Otherwise the built-in items stay.
    fetch(REMOTE + '?h=' + Math.floor(Date.now() / 3600000), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || Array.isArray(d)) return;
        const updated = Date.parse(d.updated);
        if (!(updated > 0) || Date.now() - updated > MAX_AGE_DAYS * 864e5) return;
        if (!validItems(d.items)) return;
        remote = d.items;
        buildTicker(curLang());
        pos = 0;
      })
      .catch(() => {});
  })();

  /* ── Reg Hub filter ────────────────────────────────────────── */
  (function () {
    const btns = document.querySelectorAll('.filter-btn');
    const groups = document.querySelectorAll('.reg-country-group');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        groups.forEach(g => {
          g.style.display = (f === 'all' || g.dataset.country === f) ? '' : 'none';
        });
      });
    });
  })();

  /* ── Contact form ──────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      const status = document.getElementById('formStatus');
      const lang = localStorage.getItem('ma-lang') || 'en';
      const name = contactForm.querySelector('#name')?.value.trim();
      const company = contactForm.querySelector('#company')?.value.trim();
      const email = contactForm.querySelector('#email')?.value.trim();
      if (!name || !company || !email) {
        status.textContent = lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please complete all required fields.';
        status.className = 'form-status form-status--error';
        return;
      }
      btn.disabled = true;
      btn.textContent = lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending…';
      status.textContent = '';
      try {
        const res = await fetch('https://formspree.io/f/mdaygpzr', {
          method: 'POST', body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          status.textContent = lang === 'ar'
            ? 'شكراً لتواصلك. سنردّ عليك قريباً.'
            : 'Thank you, your enquiry has been received. We will be in touch shortly.';
          status.className = 'form-status form-status--success';
          contactForm.reset();
        } else { throw new Error(); }
      } catch {
        status.textContent = lang === 'ar'
          ? 'حدث خطأ. يرجى المحاولة مجدداً أو مراسلتنا على info@madvisory.qa'
          : 'Something went wrong. Please try again or email info@madvisory.qa';
        status.className = 'form-status form-status--error';
      }
      btn.disabled = false;
      btn.textContent = lang === 'ar' ? 'إرسال الاستفسار' : 'Submit Enquiry';
    });
  }

  /* ── Newsletter form ───────────────────────────────────────── */
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const status = document.getElementById('newsletterStatus');
      fetch(nlForm.action, { method: 'POST', body: new FormData(nlForm), headers: { 'Accept': 'application/json' } })
        .then(r => {
          if (r.ok) { status.textContent = 'Thank you, you are subscribed.'; status.style.color = 'var(--accent)'; nlForm.reset(); }
          else { status.textContent = 'Something went wrong. Please try again.'; status.style.color = '#f06363'; }
        }).catch(() => { status.textContent = 'Connection error. Please try again.'; status.style.color = '#f06363'; });
    });
  }

  /* ── Language / i18n ───────────────────────────────────────── */
  const langBtn = document.querySelector('[data-lang-toggle]');
  const AR = {
    nav_about:'من نحن', nav_services:'خدماتنا', nav_due_diligence:'التحقق المستقل',
    nav_strategic_planning:'التخطيط الاستراتيجي', nav_digital_transformation:'التحوّل الرقمي',
    nav_electronic_payments:'المدفوعات الإلكترونية', nav_solutions:'الحلول',
    nav_sol_payments_infra:'البنية التحتية للمدفوعات', nav_sol_acquiring:'الاقتناء والقبول',
    nav_sol_compliance:'الامتثال والمخاطر', nav_sol_digital:'الرقمي والناشئ',
    nav_sol_licensing:'الترخيص ودخول السوق', nav_regulatory:'المحور التنظيمي',
    nav_industry_news:'أخبار القطاع', nav_news:'المقالات', nav_insights:'المقالات', nav_careers:'الوظائف',
    nav_book:'احجز مكالمة', nav_contact:'تواصل معنا',
    footer_privacy:'سياسة الخصوصية', footer_terms:'شروط الاستخدام',
    hero_eyebrow:'استشارات المدفوعات والتكنولوجيا المالية · الدوحة · لندن · إسطنبول',
    hero_line1:'نصنع', hero_line2:'مستقبل المدفوعات',
    hero_sub:'استشارات مستقلة للمؤسسات المالية وشركات التكنولوجيا المالية والحكومات في رسم مستقبل المدفوعات.',
    hero_cta1:'استكشف خدماتنا', hero_cta2:'طلب استشارة',
    stat_market:'سوق المدفوعات في الشرق الأوسط 2031', stat_disciplines:'حل استشاري',
    stat_frameworks:'إطار تنظيمي', stat_continents:'قارات',
    about_eyebrow:'من نحن', about_heading:'شركة استشارية مستقلة في قلب قطاع المدفوعات',
    services_eyebrow:'الخدمات', services_heading:'أربعة محاور للتميز الاستشاري',
    solutions_eyebrow:'الحلول', solutions_heading:'استشارات متخصصة للجيل القادم من المدفوعات',
    news_eyebrow:'مقالات', news_heading:'تفكير على حافة التكنولوجيا المالية',
    reg_eyebrow:'المحور التنظيمي', reg_heading:'مواكبة البيئة التنظيمية المتحركة بسرعة',
    exp_eyebrow:'خبرتنا', exp_heading:'ثمانية مجالات للتخصص العميق',
    clients_eyebrow:'عملاؤنا', clients_heading:'موثوق به عبر الصناعات والحدود',
    hww_eyebrow:'نموذج التعاون', hww_heading:'كيف نعمل',
    team_eyebrow:'الفريق', team_heading:'المديرون وشبكة المستشارين',
    contact_eyebrow:'تواصل معنا', contact_heading:'كيف يمكننا مساعدتك على تحقيق أهدافك؟',
    contact_sub:'سواء كنت تُقيّم استثماراً في التكنولوجيا المالية أو تسعى لتحسين بنيتك التحتية للمدفوعات، فريقنا مستعد.',
    form_name:'الاسم *', form_position:'المنصب', form_company:'الشركة *',
    form_email:'البريد الإلكتروني *', form_tel:'الهاتف',
    form_enquiry:'استفسارك', form_submit:'إرسال الاستفسار',
    footer_services:'الخدمات', footer_solutions:'الحلول',
    footer_regulatory:'المحور التنظيمي', footer_company:'الشركة',
    footer_tagline:'استشارات المدفوعات والتكنولوجيا المالية.<br>الدوحة · لندن · إسطنبول',
    footer_address:'برج تورنادو، شارع مجلس التعاون، الدوحة، قطر',
    footer_copy:'© 2026 MENA Advisory. جميع الحقوق محفوظة.',
    insights_label:'المقالات', insights_heading:'تفكير على حافة التكنولوجيا المالية',
    careers_label:'الوظائف', careers_heading:'انضم إلى MENA Advisory',
    filter_all:'الكل', filter_uk:'المملكة المتحدة', filter_eu:'أوروبا',
    filter_gcc:'دول مجلس التعاون الخليجي', filter_global:'عالمي',
    svc_label:'الخدمات', svc_heading:'ماذا نفعل',
    nl_eyebrow:'ابقَ على اطلاع', nl_heading:'تحديثات تنظيمية وسوقية',
    view_all_solutions:'عرض جميع الحلول',
    badge_active:'ساري', badge_inprogress:'قيد التنفيذ', badge_imminent:'وشيك',
    mobile_services:'الخدمات',
    mobile_solutions:'الحلول',
    ticker_label:'المستجدات',
    reg_europe:'أوروبا',
    reg_uk:'المملكة المتحدة',
    reg_gcc:'دول مجلس التعاون الخليجي',
    reg_global:'عالمي',
    filter_all_ar:'الكل',
    reg_badge_active:'ساري',
    reg_badge_inprogress:'قيد التنفيذ',
    reg_badge_imminent:'وشيك',
    careers_sub:'نحن شركة استشارية متخصصة في المدفوعات والتكنولوجيا المالية. عندما ننمو، ننمو بشكل متعمد، نضم أشخاصاً ذوي خبرة عميقة في المجال.',
    careers_who_label:'من نوظّف',
    careers_who_heading:'الخبرة المتخصصة أولاً',
    careers_who_body1:'كل عضو في فريقنا عمل على مستوى رفيع داخل شركات المدفوعات أو البنوك أو المؤسسات المالية أو شركات التكنولوجيا المالية.',
    careers_where_label:'أين نعمل',
    careers_where_heading:'الدوحة، لندن، إسطنبول',
    careers_where_body:'مكتبنا الرئيسي في برج تورنادو بالدوحة. لدينا مستشارون في لندن وإسطنبول، ونعمل مع عملاء في دول مجلس التعاون الخليجي والشرق الأوسط وأوروبا.',
    careers_register_label:'سجّل اهتمامك',
    careers_register_heading:'أرسل لنا ملفك التعريفي',
    careers_register_body:'استخدم نموذج التواصل وصف فيه خبرتك. اذكر المجالات التي عملت فيها وما تبحث عنه. نراجع كل طلب.',
    careers_cta2:'تواصل معنا →',
    careers_no_openings:'لا وظائف شاغرة حالياً',
    careers_no_openings_sub:'ليس لدينا أدوار مفتوحة في الوقت الحالي. إذا كانت لديك خلفية قوية في الاستشارات، يسعدنا الاستماع إليك.',
    about_cta:'اعمل معنا →',
    discuss_requirements:'ناقش متطلباتك',
    discuss_sub:'تحدث مباشرة مع متخصص في أي من هذه المجالات.',
    get_in_touch:'تواصل معنا →',
    back_to_insights:'← العودة إلى المقالات',
    back_to_solutions:'← جميع الحلول',
    read_consultation:'احجز استشارة →',
    svc_label_services:'الخدمات',
    page_sub_due_diligence:'تقييم مستقل لأعمال المدفوعات والتكنولوجيا المالية للمستثمرين والمستحوذين والشركاء الاستراتيجيين.',
    page_sub_strategic:'نساعد شركات المدفوعات على تحديد أين تتنافس وكيف تفوز في الأسواق المستهدفة.',
    page_sub_digital_trans:'نرشد المؤسسات المالية وشركات المدفوعات خلال مشاريع التحديث الرقمي المعقدة.',
    page_sub_epayments:'نغطي الطيف الكامل لطرق الدفع الإلكتروني، بطاقات، محافظ رقمية، مدفوعات فورية، تحويلات مباشرة.',
    page_sub_payments_infra:'المدفوعات المدفوعة بالذكاء الاصطناعي، القضبان الفورية، ترحيل ISO 20022، تنسيق المدفوعات وتقنيات كشف الاحتيال.',
    page_sub_acquiring:'استراتيجية الاستحواذ، إطار إدراج التجار، SoftPOS، القبول متعدد القنوات وإدارة النزاعات.',
    page_sub_compliance:'مراقبة معاملات مكافحة غسيل الأموال، تصميم برنامج اعرف عميلك، منع الاحتيال والأطر التنظيمية.',
    page_sub_digital_em:'توجيه متخصص في العملات الرقمية للبنوك المركزية والتسوية المُرمَّزة والخدمات المصرفية المفتوحة والتجارة الوكيلة.',
    page_sub_licensing:'ترخيص مؤسسات الدفع لدول مجلس التعاون الخليجي وأوروبا. QCB وSAMA وCBUAE وCBB وFCA والبنك المركزي الأيرلندي.',
    cta_discuss:'ناقش متطلباتك',
    cta_specialist:'تحدث مباشرة مع متخصص في أي من هذه المجالات.',
    reg_page_sub:'تتغير لوائح المدفوعات بوتيرة أسرع مما كانت عليه في أي وقت مضى. نتتبع التغييرات الجوهرية ونقدم المشورة للعملاء.',
    svc_page_sub:'أربعة تخصصات تعكس النظام البيئي الكامل لصناعة المدفوعات الحديثة.',
    sol_page_sub:'من التجارة المدفوعة بالذكاء الاصطناعي إلى الأصول المُرمَّزة، توجيه خبير في التقنيات التي تعيد تشكيل صناعة المدفوعات.',
    insights_page_sub:'تحليلات وتعليقات حول تنظيم المدفوعات والتكنولوجيا الناشئة في دول الخليج والشرق الأوسط وأوروبا.',
    page_not_found:'الصفحة غير موجودة',
    page_not_found_sub:'الصفحة التي تبحث عنها غير موجودة أو ربما انتقلت. جرّب أحد الروابط أدناه أو عد إلى الصفحة الرئيسية.',
    go_home:'← الرئيسية',
    career_open_role:'وظيفة شاغرة',
    career_role_title:'مطوّر أول لتحويل الأنظمة المصرفية الأساسية',
    career_apply_btn:'تقدّم الآن ←',
    career_badge_perm:'دائم',
    career_badge_location:'الدوحة، قطر',
    career_badge_travel:'يُشترط السفر الدولي',
    career_h3_resp:'المسؤوليات الرئيسية',
    career_h3_skills:'المهارات والخبرات المطلوبة',
    career_h3_quals:'المؤهلات المفضّلة',
    career_h3_why:'لماذا تنضم إلى MENA Advisory',
    career_h3_apply:'طريقة التقديم',
    career_14days:'إذا لم تتلقَّ ردًّا خلال 14 يومًا من تاريخ تقديم طلبك، فيُرجى اعتبار طلبك غير ناجح في هذه المرة. نشكرك على اهتمامك بـ MENA Advisory.',
    svc_advisory_label:'استشارات',
    svc_advisory_title:'التحقق المستقل',
    svc_advisory_body:'تقييم مستقل للجوانب التقنية والتنظيمية لأعمال المدفوعات والتكنولوجيا المالية للمستثمرين والمستحوذين والشركاء الاستراتيجيين.',
    svc_strategy_label:'استراتيجية',
    svc_strategy_title:'التخطيط الاستراتيجي',
    svc_strategy_body:'تحليل دخول السوق، وملاءمة المنتج للسوق، والتموضع التنافسي، واستراتيجية الوصول إلى السوق لشركات المدفوعات.',
    svc_transform_label:'تحوّل',
    svc_transform_title:'التحوّل الرقمي',
    svc_transform_body:'اختيار المنصات، وترحيل ISO 20022، وإدارة التكامل، وإدارة التغيير التشغيلي لتحديث المدفوعات.',
    svc_payments_label:'مدفوعات',
    svc_payments_title:'المدفوعات الإلكترونية',
    svc_payments_body:'البطاقات والمحافظ الرقمية والمدفوعات الفورية وتحويلات الحساب إلى حساب وحلول الدفع بدون تلامس. معرفة عميقة بهياكل المخططات ونماذج الرسوم وتقنيات المعالجة.',
    svc_view_service:'عرض الخدمة ←',
    sol_infra_sub:'الذكاء الاصطناعي، القضبان الفورية، ISO 20022، التنسيق',
    sol_acquiring_sub:'إدراج التجار، SoftPOS، النزاعات',
    sol_compliance_sub:'مكافحة غسيل الأموال، اعرف عميلك، الاحتيال، الأطر التنظيمية',
    sol_digital_sub:'العملات الرقمية للبنوك المركزية، الترميز، الخدمات المصرفية المفتوحة، الوكلاء',
    sol_licensing_sub:'QCB، SAMA، CBUAE، CBB، FCA',
    ph_name:'اسمك الكامل',
    ph_position:'منصبك',
    ph_company:'مؤسستك',
    ph_email:'you@company.com',
    ph_tel:'+1 234 567 8900',
    ph_enquiry:'صِف تحديك أو سؤالك...',
    not_found_contact:'تواصل معنا',
    not_found_insights:'المقالات',
    not_found_services:'الخدمات',
    about_p1:'تأسست MENA Advisory في الدوحة في يناير 2020. وفي غضون أسابيع، أغلق وباء عالمي الحدود وأربك النموذج الذي كانت تعتمد عليه شركات مدفوعات دول مجلس التعاون الخليجي، استقطاب الخبرات الرفيعة من دبي ولندن ونيويورك وسنغافورة عند الطلب.',
    about_p2:'نحن مؤسسة استشارية دولية مستقلة تعمل حصرياً في قطاع المدفوعات والتكنولوجيا المالية. ننطلق من الدوحة ولندن وإسطنبول لنقدّم المشورة للمؤسسات المالية وكبار تجار التجزئة وشركات إدارة السفر والمستحوذين وشركات التكنولوجيا المالية والجهات الحكومية في منطقة دول مجلس التعاون الخليجي والشرق الأوسط وشمال أفريقيا وأوروبا.',
    about_p3:'استقلاليتنا خيار مقصود. لا تربطنا أي علاقات مع موردين أو شركاء تقنيين من شأنها أن تُخلّ بموضوعية مشورتنا. كل توصية تُبنى على ما هو الأنسب لنموذج عمل العميل وبيئته التنظيمية وأهدافه التجارية.',
    home_svc_due_sub:'تقييم تقني وتنظيمي مستقل',
    home_svc_due_body:'تقييم مستقل لأعمال المدفوعات والتكنولوجيا المالية للمستثمرين والمستحوذين والشركاء الاستراتيجيين.',
    home_svc_strategy_sub:'استراتيجية دخول السوق والنمو',
    home_svc_strategy_body:'تحليل دخول السوق وملاءمة المنتج للسوق والتموضع التنافسي واستراتيجية الوصول لشركات المدفوعات.',
    home_svc_digital_sub:'تحديث المدفوعات',
    home_svc_digital_body:'اختيار المنصة وإدارة التكامل وترحيل ISO 20022 وإدارة التغيير التشغيلي.',
    home_svc_epay_sub:'تغطية كاملة لوسائل الدفع',
    home_svc_epay_body:'البطاقات والمحافظ الرقمية والمدفوعات الفورية وتحويلات A2A وحلول الدفع بدون تلامس في دول الخليج والشرق الأوسط وأوروبا.',
    home_svc_explore:'استكشف ←',

    // ── Nav additions (card issuing & FX treasury)
    nav_sol_card_issuing:'إصدار البطاقات وإدارة البرامج',
    nav_sol_fx:'صرف العملات ومدفوعات الخزانة',

    // ── Card Issuing page (ci_ prefix)
    ci_h1:'إصدار البطاقات وإدارة البرامج',
    ci_cta_discuss:'ناقش هذا الحل →',
    ci_cta_all_sol:'جميع الحلول',
    ci_h2_design:'تصميم برنامج البطاقات',
    ci_p_design1:'برنامج البطاقات ليس مجرد فئة منتج؛ بل مجموعة متشابكة من القرارات التجارية والتقنية والتنظيمية تحدد الاقتصاديات وملف المخاطر وعرض القيمة لحامل البطاقة. القرارات الجوهرية تشمل: الشريحة المستهدفة وشبكة البطاقة ونموذج البرنامج والهيكل التجاري.',
    ci_p_design2:'يتفاعل كل قرار مع الآخرين بطرق لا تتضح في الغالب إلا بعد بدء التنفيذ. الحصول على البنية الصحيحة في مرحلة التصميم يُجنّب إعادة الهيكلة المكلفة بعد الإطلاق.',
    ci_p_design3:'نعمل مع البنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية في مرحلة التصميم لتحديد بنية المنتج ونمذجة اقتصاديات الوحدة وإنتاج مواصفات المتطلبات التي تُحرّك اختيار المعالج والتفاوض مع المخطط.',
    ci_li_design_1:'بنية البرنامج: نوع البطاقة والشبكة وقطاع العملاء والنموذج التجاري',
    ci_li_design_2:'نمذجة اقتصاديات الوحدة: دخل التبادل وتكاليف المعالج والخسائر الاحتيالية ومسؤولية المكافآت',
    ci_li_design_3:'التصنيف التنظيمي: ترخيص مصرفي مقابل ترخيص نقود إلكترونية مقابل رعاية BIN',
    ci_li_design_4:'استراتيجية الطرح: نموذج التوزيع وقنوات الشراكة ونمذجة تكلفة اكتساب العملاء',
    ci_discuss:'ناقش →',
    ci_h2_processor:'اختيار معالج البطاقات',
    ci_p_processor1:'تغيّر سوق معالجة البطاقات جذرياً. منصات إصدار البطاقات عبر API، Marqeta وi2c وGPS وThredd والبدائل الإقليمية، أدخلت بنية تحتية أسرع نشراً وأكثر قابلية للتخصيص من الأنظمة القديمة، لكن مع مقايضات حقيقية في العمق والتغطية.',
    ci_p_processor2:'اختيار المعالج هو من أبرز قرارات التقنية التي يتخذها المُصدِر. ترحيل برنامج بطاقات قائم بين المعالجين مكلف ومحفوف بمخاطر تشغيلية ومُخلٌّ للحاملين. الاختيار الصحيح يستحق الجهد التحليلي.',
    ci_h4_apifirst:'منصات API الأولى / التكنولوجيا المالية',
    ci_p_apifirst:'Marqeta وi2c وThredd وPomelo: مصممة لقابلية التخصيص العالية والتمويل المدمج وإطلاق البرامج بسرعة. توثيق مطور ممتاز وضوابط آنية وإدارة بطاقات مستندة إلى الويب هوك.',
    ci_h4_tier1:'معالجو الفئة الأولى',
    ci_p_tier1:'TSYS وFIS وFiserv: وظائف متعمقة للمنتجات المصرفية المعقدة، اتصال ناضج بالمخططات، وسجل تشغيلي على نطاق واسع. جداول تنفيذ أطول.',
    ci_h4_regional:'معالجو دول مجلس التعاون الخليجي الإقليميون',
    ci_p_regional:'Network International وMagnati والمعالجون المرتبطون بـ mada: ضروريون للمشاركة في المخططات المحلية والامتثال التنظيمي وخدمة حامل البطاقة باللغة العربية.',
    ci_h4_embedded:'البنية التحتية للإصدار المدمج',
    ci_p_embedded:'Stripe Issuing وAdyen Issuing وRailsr: مصممة لمنصات SaaS والأسواق التي تدمج إصدار البطاقات في سير عمل المنتج. تعقيد إعداد أقل؛ نموذج تجاري مرتبط باقتصاديات المنصة.',
    ci_p_processor3:'تشمل مشاركاتنا في اختيار المعالج: مواصفات المتطلبات وتصميم طلب العروض وإطار التقييم والتحقق المستقل من المراجع والتفاوض التجاري ومراجعة جاهزية التنفيذ.',
    ci_li_proc_1:'مواصفات المتطلبات: الوظائف والشبكات المدعومة والتغطية الإقليمية وجودة API',
    ci_li_proc_2:'تصميم طلب العروض وإطار تقييم مُعيَّر وفق أولويات البرنامج',
    ci_li_proc_3:'التحقق المستقل من المراجع مع تنفيذات مماثلة لبرنامج العميل',
    ci_li_proc_4:'التفاوض على الشروط التجارية: رسوم المعالجة وتكاليف الترخيص والحدود الدنيا والغرامات',
    ci_li_proc_5:'تخطيط الانتقال للبرامج المهاجرة من معالج قائم',
    ci_h2_bin:'رعاية BIN وعضوية المخطط',
    ci_p_bin1:'يستلزم إصدار بطاقة Visa أو Mastercard الوصول إلى BIN. للجهات المُصدِرة غير المصرفية ومدخلي السوق الجدد، هناك مساران: رعاية BIN حيث تعمل تحت BIN بنك عضو قائم، أو العضوية المباشرة في المخطط.',
    ci_p_bin2:'الاختيار بين المسارين ليس مجرد سؤال تكلفة. رعاية BIN أسرع إطلاقاً لكنها تُفضي إلى اعتماد تجاري على البنك الراعي. العضوية المباشرة توفر قدراً أكبر من السيطرة لكنها تستغرق ستة إلى اثني عشر شهراً في أسواق دول مجلس التعاون الخليجي.',
    ci_li_bin_1:'هيكل رعاية BIN: اختيار البنك الراعي والشروط التعاقدية وتخصيص المسؤولية والاقتصاديات',
    ci_li_bin_2:'تقييم عضوية المخطط: رئيسي مقابل تابع، متطلبات رأس المال، الشهادة التقنية ودعم الطلب',
    ci_li_bin_3:'المشاركة في المخططات المحلية: mada والBENEFIT وMeeza وJaywan',
    ci_li_bin_4:'اختيار برامج منتجات المخطط: Visa Commercial Solutions وMastercard Business Card',
    ci_h2_commercial:'برامج البطاقات التجارية',
    ci_p_commercial1:'برامج البطاقات التجارية، بطاقات الشركات وبطاقات الشراء والبطاقات الافتراضية لإنفاق B2B وبرامج السفر والترفيه، تعمل بمنطق تجاري مختلف عن برامج المستهلكين.',
    ci_p_commercial2:'العرض القيمي لبطاقات الشركات يتمحور حول رؤية الإنفاق وضبط السياسات واقتصاديات البرنامج. للمُصدِر: دخل تبادل أعلى لكل معاملة، وخسائر احتيال أقل، وأطول بقاء لحامل البطاقة.',
    ci_h3_virtual:'برامج البطاقات الافتراضية',
    ci_p_virtual1:'أصبح إصدار البطاقات الافتراضية قدرة تأسيسية لبرامج مدفوعات B2B وشركات إدارة السفر ومنصات التمويل المدمج. النموذج التجاري يتباين: برامج تُدرّ دخل تبادل لكل معاملة، وأخرى تُقدّم رسوم منصة أو عائد على الرصيد.',
    ci_p_virtual2:'للشركات وشركات التكنولوجيا المالية في دول مجلس التعاون الخليجي التي تبني برامج البطاقات الافتراضية، اختيار المعالج محوري: ليس كل المعالجين يدعمون ضوابط المعاملة الفردية اللازمة لأتمتة الحسابات الدائنة.',
    ci_li_comm_1:'تصميم برنامج بطاقات الشركات: هيكل الائتمان وضوابط الإنفاق والتكامل مع ERP وأنظمة إدارة النفقات',
    ci_li_comm_2:'تقديم بيانات المستوى الثاني والثالث: متطلبات التأهيل والتنفيذ التقني ونمذجة وفورات التبادل',
    ci_li_comm_3:'بنية برنامج البطاقات الافتراضية: أحادية مقابل متعددة الاستخدام وضوابط لكل معاملة ومتطلبات بيانات التسوية',
    ci_li_comm_4:'تصميم برنامج الخصومات: هياكل عتبة الإنفاق والمُسرِّعات حسب الفئة وآليات الدفع',
    ci_li_comm_5:'استراتيجية السفر والترفيه: تكامل بطاقة الإيداع وشراكات شركات إدارة السفر وقبول شركات الطيران والفنادق',
    ci_h2_portfolio:'إدارة المحفظة وتحسين التبادل',
    ci_p_portfolio1:'تحسين التبادل، ضمان تقديم كل معاملة بالبيانات اللازمة للتأهل لأفضل فئة، هو الرافعة الأكثر إهمالاً في إصدار البطاقات، ولا سيما للبرامج التجارية.',
    ci_p_portfolio2:'إدارة معدل الاحتيال وتخصيص خسائر الائتمان وتحسين معدل الترخيص هي الروافع الرئيسية الثلاثة الأخرى. نموذج الترخيص الذي يرفض بمحافظة مفرطة يُقلّص رضا حامل البطاقة ودخل التبادل.',
    ci_li_port_1:'تدقيق تأهيل التبادل: تحديد ثغرات تقديم البيانات التي تُفضي إلى التخفيض',
    ci_li_port_2:'تحسين استراتيجية الترخيص: رفع معدل الموافقة دون زيادة التعرض للاحتيال',
    ci_li_port_3:'مراجعة نموذج الاحتيال: معايرة رصد المعاملات وتجزئة مخاطر حامل البطاقة وتحليل معدل النزاع',
    ci_li_port_4:'تحليل ربحية المحفظة: تحليل الإيرادات والتكاليف حسب نوع البطاقة والقناة والشريحة',
    ci_li_port_5:'إدارة دورة حياة حامل البطاقة: تحسين معدل التفعيل وتحفيز الإنفاق المبكر وخفض الاستنزاف',
    ci_h3_cta:'ناقش متطلبات برنامج بطاقاتك',
    ci_p_cta:'تعمل MENA Advisory مع البنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية في تصميم برامج البطاقات وإطلاقها وتحسينها في دول مجلس التعاون الخليجي وأوروبا. تحدث مباشرة مع متخصص.',

    // ── FX & Treasury page (fx_ prefix)
    fx_h1:'استشارات صرف العملات ومدفوعات الخزانة، دول مجلس التعاون الخليجي والشرق الأوسط',
    fx_cta_discuss:'ناقش هذا الحل →',
    fx_cta_all_sol:'جميع الحلول',
    fx_h2_gcc:'ممرات صرف العملات في دول مجلس التعاون الخليجي',
    fx_p_gcc1:'تُعدّ دول مجلس التعاون الخليجي من أهم مناطق إرسال التحويلات في العالم. هيمنة الدولار في ربط عملات المنطقة وحجم التجارة البينية يُحددان الاقتصاديات الأساسية لصرف العملات.',
    fx_stat_remit:'دولار تحويلات سنوياً من دول مجلس التعاون الخليجي',
    fx_stat_trade:'من التجارة الإقليمية مقومة بالدولار',
    fx_stat_curr:'عملة مرتبطة بالدولار في المنطقة',
    fx_p_gcc2:'تُمثّل مخاطر صرف العملات تحدياً محورياً لشركات المدفوعات في ممرات دول مجلس التعاون الخليجي. الربط الثابت يُتيح يقيناً في معدلات الأزواج الرئيسية، لكنه لا يُلغي تعقيد إدارة التمركزات والسيولة والتعرض في الممرات غير المقيّدة.',
    fx_p_gcc3:'التوسع في ممرات التحويل وإدارة تسوية المدفوعات الدولية وتشغيل حسابات متعددة العملات يستلزم فهم متطلبات البنك المراسل والامتثال التنظيمي الخاصة بكل سوق.',
    fx_discuss_gcc:'ناقش صرف العملات →',
    fx_h2_swift:'الدفع بالجملة والبنك المراسل',
    fx_p_swift1:'ما تزال مدفوعات الجملة الدولية تعتمد إلى حد بعيد على شبكة بنوك المراسلة وشبكة SWIFT. يُعيد ISO 20022 وشبكات الدفع الفوري البديلة رسم الاقتصاديات التشغيلية لهذه الممرات بوتيرة متسارعة.',
    fx_h3_iso:'ترحيل ISO 20022',
    fx_p_iso1:'يمتد الإطار الزمني لانتقال SWIFT إلى ISO 20022 حتى نهاية 2025. لا تُمثّل أعمال الترحيل مجرد تحديث لتنسيق الرسالة، بل تُغيّر نطاق البيانات المنقولة مع كل دفعة، مما يُتيح إمكانات جديدة لفحص الامتثال ومعالجة الاحتيال.',
    fx_p_iso2:'يتعامل المُصدِرون والمستحوذون وشركات المدفوعات في دول مجلس التعاون الخليجي مع طبقات متعددة من التعقيد: توافق الأنظمة مع ترجمة هيكل رسائل ISO 20022، وإدارة التبعيات مع شبكات البنوك المراسلة.',
    fx_li_iso_1:'تقييم نطاق أعمال الترحيل والتأثيرات على المنظومة التقنية الداخلية',
    fx_li_iso_2:'مراجعة توافق محرك تعيين الرسائل للأنواع المدعومة',
    fx_li_iso_3:'تحديد الفجوات في عمليات البنوك المراسلة والجداول الزمنية للتوافق',
    fx_li_iso_4:'تقييم جاهزية التكامل مع منصات المدفوعات الإقليمية المعتمدة على ISO 20022',
    fx_discuss_swift:'ناقش SWIFT وISO 20022 →',
    fx_h2_multicurr:'إدارة متعددة العملات وصرف العملات',
    fx_p_multicurr1:'تعمل شركات المدفوعات في دول مجلس التعاون الخليجي عبر ممرات بعملات متعددة تجمع الربط والأسعار العائمة والضوابط التنظيمية. الاقتصاديات الأساسية لتشغيل هذه العمليات وتحوطها وتسوية مواقف العملات تُحدد الهامش مباشرة.',
    fx_h3_fxrisk:'إدارة مخاطر صرف العملات',
    fx_p_fxrisk1:'تواجه شركات المدفوعات التعرض لمخاطر صرف العملات عبر ممرات التحويل والتسويات المؤجلة والأرصدة متعددة العملات. تتراوح مناهج التحوط بين التحوط الطبيعي والتحوط المالي عبر العقود الآجلة وعقود الخيارات.',
    fx_li_fx_1:'تحليل التعرض: تقييم مواقف العملات والمخاطر عبر الممرات وتواريخ التسوية',
    fx_li_fx_2:'التصميم الهيكلي لاستراتيجية التحوط: التحوط الطبيعي مقابل الأدوات المالية',
    fx_li_fx_3:'اختيار مزوّد صرف العملات: البنوك ومنصات FX وممرات المدفوعات الإقليمية',
    fx_li_fx_4:'تقييم أُطر الامتثال التنظيمي لعمليات صرف العملات في دول المجلس وأوروبا',
    fx_h3_gcc_fx:'بنية صرف العملات في دول مجلس التعاون الخليجي',
    fx_p_gcc_fx1:'يُحدّد الربط الثابت لعملات دول مجلس التعاون الخليجي بالدولار ديناميكيات صرف العملات بطريقة تختلف جوهرياً عن ممرات العملات العائمة. للتحولات في علاوة الصرف وتوافر السيولة وديناميكيات الممرات تداعيات تشغيلية.',
    fx_p_gcc_fx2:'ممرات التحويل إلى جنوب آسيا وأفريقيا جنوب الصحراء والشرق الأوسط تتوافر فيها سيولة FX تنافسية عبر مزودين متخصصين، وليس حصراً عبر قنوات البنوك المراسلة.',
    fx_discuss_fx:'ناقش إدارة صرف العملات →',
    fx_h2_treasury:'إدارة الخزانة لشركات المدفوعات',
    fx_p_treasury1:'تواجه شركات المدفوعات تعقيداً فريداً في إدارة الخزانة: أرصدة عملاء موزعة عبر حسابات خدمة متعددة، ومتطلبات تسوية إجبارية مرتبطة بدورات مدفوعات المخطط، وسيولة يمكن أن تتذبذب حدياً مع ذروات المعاملات.',
    fx_p_treasury2:'يختلف النهج الأمثل لبنية خزانة شركات المدفوعات عن خزانة الشركات الاعتيادية. تُشكّل متطلبات الامتثال التنظيمي، ولا سيما متطلبات الفصل في تراخيص QCB وSAMA وCBUAE وFCA، الإطار الذي يجب في ضوئه تحسين الخزانة.',
    fx_h3_factory:'بنية مصنع المدفوعات',
    fx_p_factory1:'يعتمد المُشغّلون الأكثر تطوراً بنية مصنع المدفوعات: طبقة توجيه مركزية تُحسِّن اختيار الممر استناداً إلى التكلفة والسرعة والمتطلبات التنظيمية لإدارة تدفقات الأموال متعددة العملات.',
    fx_li_treas_1:'مراجعة بنية الخزانة: هيكل الحساب ومنطق التجميع وعملية التسوية',
    fx_li_treas_2:'سياسة إدارة السيولة: تقدير الاحتياجات وبناء الاحتياطيات وتحديد عتبات الإنذار المبكر',
    fx_li_treas_3:'تقييم الامتثال لمتطلبات فصل أموال العملاء: QCB وSAMA وCBUAE وFCA',
    fx_li_treas_4:'تقييم مزودي الخزانة: حسابات متعددة العملات ومنصات إدارة الخزانة',
    fx_li_treas_5:'تكامل الخزانة مع نظام مراقبة مكافحة غسيل الأموال والمحاسبة المالية',
    fx_discuss_treas:'ناقش الخزانة →',
    fx_h3_cta:'ناقش متطلبات صرف العملات والخزانة لديك',
    fx_p_cta:'تعمل MENA Advisory مع شركات المدفوعات والتكنولوجيا المالية والمؤسسات المالية في دول مجلس التعاون الخليجي وأوروبا في مجالات صرف العملات والبنك المراسل وهيكلة الخزانة.',

    // ── Digital Transformation page (dt_ prefix)
    dt_h2_platform:'اختيار المنصة وتقييم الموردين',
    dt_p_platform:'تقييم منهجي لمنصات معالجة المدفوعات وأنظمة إدارة البطاقات ومحركات مكافحة الاحتيال والتقنيات المجاورة. نطوّر أطر متطلبات مبنية على النموذج التجاري والبيئة التنظيمية وحجم المعاملات، ثم نقود عملية تقييم منضبطة للموردين تُنتج توصية اختيار موثوقة. استقلاليتنا عن موردي التقنية تامة: لا تربطنا أي علاقة تجارية بأي مزوّد منصة.',
    dt_h2_iso:'استشارات ترحيل ISO 20022',
    dt_p_iso:'يتحوّل ISO 20022 إلى المعيار الافتراضي لرسائل المدفوعات عالية القيمة والعابرة للحدود. مع تضييق SWIFT لتحمّله لترجمة رسائل MT القديمة، يتصاعد الضغط نحو الترقية. نساعد مؤسسات الدفع في تحديد نطاق الترحيل وتقييم التعقيد وإدارة اختيار الموردين وتسليم التحول.',
    dt_h2_programme:'إدارة البرامج وتسليم التكامل',
    dt_p_programme:'مشاركة فعّالة في مشاريع تنفيذ تقنية المدفوعات المعقدة، اختيار الموردين وتنسيق التكامل وإدارة مسار التنفيذ والانتقال إلى الإنتاج. نعمل بجانب الفرق الداخلية لضمان حوكمة البرنامج وضبط الجدول الزمني وحل المعوقات.',

    // ── Electronic Payments page (ep_ prefix)
    ep_h2_card:'استراتيجية مخطط البطاقات واقتصادياتها',
    ep_p_card:'استشارات في تصميم برامج البطاقات واختيار المعالج وعضوية المخططات وتحسين التبادل وإدارة المحافظ للبطاقات الاستهلاكية والتجارية. نمتلك معرفة عميقة بكيفية عمل Visa وMastercard ومخططات mada وBENEFIT تجارياً وكيفية التعامل مع قواعدها وعمليات الشهادات.',
    ep_h2_instant:'المدفوعات الفورية والقضبان الآنية',
    ep_p_instant:'نشرت دول مجلس التعاون الخليجي عدة قضبان للمدفوعات الفورية: SARIE في المملكة العربية السعودية، وAani في الإمارات، وQPay في قطر، لكل منها مواصفات تقنية ومتطلبات سيولة وخصائص احتيال متمايزة. أوجب نظام المدفوعات الأوروبي SEPA Instant على بنوك اليورو. نُقدّم المشورة للمؤسسات بشأن الاتصال والامتثال والتكامل.',
    ep_h2_wallet:'المحافظ الرقمية والمدفوعات عبر الهاتف',
    ep_p_wallet:'استشارات استراتيجية وتنفيذية لبرامج المحافظ الرقمية، تشمل التكامل مع شبكات البطاقات والمدفوعات الفورية وخدمات الشراء الآن والدفع لاحقاً والمصادقة البيومترية وتجربة المستخدم في عملية التأهيل.',

    // ── Contact page
    contact_page_sub:'تواصل مع فريقنا بشأن تحديات المدفوعات أو التكنولوجيا المالية لديك. مقرّنا في الدوحة، مع مستشارين في لندن وإسطنبول.',
  };
  /*AR_UPDATES*/
  Object.assign(AR, {
    news_page_eyebrow:'أخبار القطاع',
    news_page_heading:'آخر التحركات في قطاع المدفوعات',
    news_page_sub:'ملخص أسبوعي لإعلانات شبكات البطاقات وجهات التحصيل ومقدمي خدمات الدفع ومزودي الدفع من حساب إلى حساب والمصرفية المفتوحة وموردي الأنظمة المصرفية الأساسية والبنوك الرقمية ومنصات الإصدار ومتخصصي صرف العملات، في دول الخليج والمملكة المتحدة وأوروبا وغيرها.',
    filter_cat_all:'جميع الفئات', filter_cat_card_networks:'شبكات البطاقات', filter_cat_acquiring_psp:'التحصيل ومقدمو خدمات الدفع',
    filter_cat_a2a:'الدفع من حساب إلى حساب والمصرفية المفتوحة', filter_cat_core_banking:'الأنظمة المصرفية الأساسية',
    filter_cat_digital_banks:'البنوك الرقمية', filter_cat_issuing:'منصات الإصدار', filter_cat_fx:'صرف العملات والمدفوعات عبر الحدود',
    bc_home:'الرئيسية', back_to_solutions:'→ جميع الحلول', all_articles:'جميع المقالات ←',
    nav_sol_acquiring:'التحصيل وقبول المدفوعات',
    page_sub_due_diligence:"تقييم مستقل لشركات المدفوعات والتكنولوجيا المالية لصالح المستثمرين وشركات الملكية الخاصة والمستحوذين الاستراتيجيين، يشمل الأداء التجاري والبنية التقنية والوضع التنظيمي وضوابط مكافحة الاحتيال والمرونة التشغيلية.",
    dd_h2_invest:"العناية الواجبة للاستثمار والاستحواذ",
    dd_p_invest:"نقيّم شركات المدفوعات والتكنولوجيا المالية لصالح المستثمرين والمستحوذين والشركاء الاستراتيجيين. يشمل العمل الأداء التجاري والبنية التقنية والوضع التنظيمي وضوابط مكافحة الاحتيال والمرونة التشغيلية، وينتهي بنتائج واضحة وتوصيات مرتّبة حسب المخاطر تدعم قرار الاستثمار. نحدد نطاق كل مهمة وفق الصفقة والمخاطر الأكثر تأثيراً فيها.",
    dd_h2_tech:"مراجعة البنية التقنية",
    dd_p_tech:"نراجع منظومة معالجة المدفوعات: أنظمة التحصيل والإصدار، والترميز، وكشف الاحتيال، والربط بشبكات البطاقات، والتسوية. نختبر ملاءمة التقنية لنموذج العمل المعلن وقدرتها على استيعاب الأحجام المتوقعة، ونحدد الديون التقنية ومخاطر التكامل والاعتماد على المنصات التي قد تؤثر في التقييم أو في استمرارية العمل بعد إتمام الصفقة.",
    dd_h2_reg:"تقييم الوضع التنظيمي والامتثال",
    dd_p_reg:"نراجع وضع الترخيص ومستوى الامتثال والعلاقة مع الجهات التنظيمية المعنية، مثل مصرف قطر المركزي والبنك المركزي السعودي ومصرف الإمارات العربية المتحدة المركزي وهيئة السلوك المالي البريطانية. ونفحص برنامج مكافحة غسل الأموال وتمويل الإرهاب، والامتثال لمعيار PCI DSS، والالتزام بقواعد شبكات البطاقات، وأي مسائل تنظيمية قائمة، بما في ذلك نتائج التفتيش السابقة والإجراءات التنفيذية وأعمال المعالجة.",
    dd_h2_commercial:"التقييم التجاري والاستراتيجي",
    dd_p_commercial:"نحلل مزيج الإيرادات والهوامش وتركّز العملاء وشروط العقود والموقع التنافسي وفرص السوق. ونقيّم قدرة نموذج العمل على الصمود أمام الأطر التنظيمية والمنافسة الحالية والمتوقعة، ونبرز المخاطر التجارية الرئيسية، ونقدّم رأياً مستقلاً في توقعات النمو التي تضعها الإدارة.",
    page_sub_strategic:"نساعد شركات المدفوعات والمؤسسات المالية على تحديد أين تنافس وكيف. تشمل المهام عادةً دخول الأسواق وملاءمة المنتج للسوق والتموضع التنافسي والتسعير وخطط الدخول إلى السوق.",
    sp_h2_market:"استراتيجية دخول الأسواق والتوسع",
    sp_p_market:"نقيّم أسواق دول مجلس التعاون الخليجي والشرق الأوسط وشمال أفريقيا وأوروبا لشركات المدفوعات التي تخطط للدخول أو التوسع. يشمل العمل البيئة التنظيمية والمنافسة وحجم السوق المتاح ومتطلبات الترخيص والجدوى التجارية لنماذج الدخول المختلفة. نكتب المخرجات لتدعم قرارات مجالس الإدارة، ويمكن لفرق الترخيص وتطوير الأعمال استخدامها مباشرة.",
    sp_h2_product:"ملاءمة المنتج للسوق والتموضع التنافسي",
    sp_p_product:"نختبر عروض المنتجات مقابل حاجة السوق والمتطلبات التنظيمية والعروض المنافسة. ونحدد عوامل التميّز المهمة في كل سوق وشريحة عملاء، ومواضع الفجوات التي تخلق مخاطر أو فرصاً. ويستند رأينا إلى معرفة مباشرة بطريقة تقييم البنوك والتجار لمنتجات الدفع وشرائها.",
    sp_h2_pricing:"استراتيجية التسعير ونمذجة الإيرادات",
    sp_p_pricing:"نبني نماذج التسعير لمنتجات المعالجة والتحصيل والإصدار والتكنولوجيا المالية ونراجعها. نقارن بأسعار السوق، ونحتسب الإيرادات وفق افتراضات مختلفة للأحجام والهوامش، ونقارن التسعير بالمنافسين. وللشركات التي تعمل عبر شبكات البطاقات، نحتسب الاقتصاديات الكاملة بما فيها رسوم التبادل ورسوم الشبكات وتكاليف المعالجة.",
    page_sub_digital_trans:"ندعم المؤسسات المالية وشركات المدفوعات في مشاريع التحديث المعقدة، من اختيار المنصات وإدارة التكامل إلى إعادة تصميم العمليات وإدارة التغيير.",
    dt_h2_platform:"اختيار المنصات وتقييم الموردين",
    dt_p_platform:"نجري تقييمات منهجية لمنصات معالجة المدفوعات وأنظمة إدارة البطاقات ومحركات مكافحة الاحتيال والتقنيات المرتبطة بها. نبني المتطلبات انطلاقاً من نموذج عمل المؤسسة وبيئتها التنظيمية وأحجام معاملاتها، ثم ندير عملية تقييم للموردين تنتهي بتوصية يمكن لمجلس الإدارة الاعتماد عليها. نحن مستقلون تماماً عن موردي التقنية ولا تربطنا علاقة تجارية بأي مزوّد منصة.",
    dt_h2_iso:"استشارات الانتقال إلى ISO 20022",
    dt_p_iso:"أصبح ISO 20022 المعيار المعتمد لرسائل المدفوعات عالية القيمة والعابرة للحدود، وانتهت فترة التعايش في SWIFT لتعليمات الدفع العابرة للحدود في نوفمبر 2025. والمؤسسات التي ما زالت تعتمد على التحويل بين صيغ MT القديمة وصيغ MX الجديدة معرّضة لفقدان البيانات المنظّمة وارتفاع تكلفة معالجة المدفوعات. نساعد مؤسسات الدفع على تحديد نطاق برامج الانتقال وتقييم تعقيد التكامل واختيار أدوات الانتقال ومعالجة مشكلات مثل اقتطاع البيانات والتنسيق مع البنوك المراسلة.",
    dt_h2_programme:"إدارة البرامج وتنفيذ التكامل",
    dt_p_programme:"نعمل داخل برامج تنفيذ تقنيات المدفوعات: نراجع مخرجات الموردين، وندير مسارات التكامل، ونحل الخلافات التقنية والتجارية مع شركاء التنفيذ، ونحافظ على اتساق المعرفة التقنية والتنظيمية من البداية حتى التشغيل. وقد دعمنا مؤسسات تبيّن أن اختيارها الأول للمورد غير مناسب، فأعيد تحديد نطاق البرنامج وبدء العمل من جديد مع شريك آخر.",
    page_sub_epayments:"نغطي وسائل الدفع الإلكتروني الرئيسية: بطاقات الائتمان والخصم، والمحافظ الرقمية، والمدفوعات الفورية، والتحويلات من حساب إلى حساب، والدفع دون تلامس. ونعرف كيف تعمل شبكات البطاقات ونماذج الرسوم وتقنيات المعالجة على أرض الواقع.",
    ep_h2_card:"استراتيجية شبكات البطاقات واقتصادياتها",
    ep_p_card:"نقدّم المشورة في تصميم برامج البطاقات واختيار المعالج وعضوية الشبكات والعضوية الرئيسية وتحسين رسوم التبادل وإدارة محافظ البطاقات الاستهلاكية والتجارية. ونعرف كيف تعمل Visa وMastercard والشبكات المحلية مثل مدى وBENEFIT والشبكة القطرية NAPS وJaywan من الناحية التجارية، وكيف يُتعامل مع قواعدها وعمليات اعتمادها. ويمتد عملنا من تصميم برامج جديدة لمُصدري التكنولوجيا المالية إلى مراجعة محافظ البنوك القائمة.",
    ep_h2_instant:"المدفوعات الفورية والأنظمة الآنية",
    ep_p_instant:"أطلقت البنوك المركزية الخليجية في السنوات الأخيرة أنظمة للمدفوعات الفورية، منها سريع في السعودية وآني في الإمارات وفوران في قطر، ولكل منها مواصفاتها التقنية ومتطلبات السيولة الخاصة بها وأنماط الاحتيال المرتبطة بها. وفي أوروبا جعلت لائحة المدفوعات الفورية التحويل الفوري SEPA Instant إلزامياً على بنوك منطقة اليورو. ونقدّم المشورة لمؤسسات الدفع في الربط والامتثال وإدارة السيولة خلال اليوم وضوابط الاحتيال للمدفوعات الفورية غير القابلة للإلغاء.",
    ep_h2_wallet:"المحافظ الرقمية والمدفوعات عبر الهاتف",
    ep_p_wallet:"نقدّم المشورة الاستراتيجية والتنفيذية لبرامج المحافظ الرقمية وقبول المدفوعات عبر الهاتف ومدفوعات رموز QR. ونغطي تكامل المُصدرين مع Apple Pay وGoogle Pay، واتفاقيات Samsung Pay، والمحافظ الإقليمية، وبنية قبول رموز QR التي تُطرح في أسواق الخليج. ولجهات التحصيل والتجار، نقارن اقتصاديات قبول المحافظ بقبول البطاقات ونحدد المتطلبات التقنية للقبول متعدد القنوات.",
    cta_specialist:"تحدّث مباشرة مع متخصص في أي من هذه المجالات.",
    page_sub_payments_infra:"الذكاء الاصطناعي في المدفوعات، والأنظمة الفورية، والانتقال إلى ISO 20022، وتنسيق المدفوعات، وبنية كشف الاحتيال: مشورة في الطبقة التقنية والتشغيلية لشركة المدفوعات الحديثة.",
    pi_h2_ai:"الذكاء الاصطناعي في المدفوعات: الاحتيال والائتمان والعمليات",
    pi_p_ai:"تستبدل شركات الدفع أنظمة الاحتيال والائتمان القائمة على القواعد بنماذج توازن بين سياق المعاملة والإشارات السلوكية والبيانات الخارجية معاً. نقدّم المشورة في اختيار أنظمة الذكاء الاصطناعي وتقييم الموردين والتحقق من النماذج، وفي الامتثال لقانون الذكاء الاصطناعي الأوروبي. وتسري الالتزامات الخاصة بالأنظمة عالية المخاطر، مثل تقييم الجدارة الائتمانية، اعتباراً من 2 ديسمبر 2027، بعد أن أجّلت حزمة Omnibus الأوروبية الموعد الأصلي في أغسطس 2026.",
    pi_h2_orch:"تنسيق المدفوعات وتوجيهها",
    pi_p_orch:"تقع منصات التنسيق بين صفحة الدفع لدى التاجر وعلاقاته مع جهات التحصيل، وتوجّه كل معاملة إلى المعالج الأنسب وفق التكلفة ونسبة القبول والموقع الجغرافي وقواعد الشبكات. ويوزّع عدد متزايد من التجار معاملاتهم على مزودَي دفع أو أكثر. نقدّم المشورة في اختيار منصة التنسيق، والتوجيه الأقل تكلفة لبطاقات الخصم ذات الشبكتين، وتصميم التحويل التلقائي عند الأعطال، والترميز الشبكي عبر عدة جهات تحصيل.",
    pi_h2_rt:"المدفوعات الفورية والربط بالأنظمة الآنية",
    pi_p_rt:"تعمل أنظمة المدفوعات الفورية اليوم في معظم الأسواق الرئيسية، ولكل منها قواعدها التقنية ومتطلبات السيولة وأنماط الاحتيال الخاصة بها. وفي الخليج تشمل سريع في السعودية وآني في الإمارات وفوران في قطر. نقدّم المشورة في الربط بالأنظمة الفورية الخليجية والأوروبية، والتزامات الامتثال المرتبطة بها، وإدارة السيولة خلال اليوم، وضوابط الاحتيال للمدفوعات التي لا يمكن إلغاؤها.",
    pi_h2_iso:"ISO 20022 والانتقال في SWIFT",
    pi_p_iso:"يُعدّ ISO 20022 المعيار المعتمد لرسائل المدفوعات عالية القيمة والعابرة للحدود، وقد انتهت فترة التعايش في SWIFT لتعليمات الدفع العابرة للحدود في نوفمبر 2025. ندعم مؤسسات الدفع في تحديد النطاق واختيار الموردين وتقييم التكامل وتنفيذ البرامج، بما في ذلك إدارة شركاء التنفيذ خلال مرحلة الانتقال.",
    page_sub_acquiring:"استراتيجية تحصيل مدفوعات البطاقات، وأطر إلحاق التجار، ونشر SoftPOS، والقبول متعدد القنوات، وإدارة المبالغ المستردة، وتحصيل مدفوعات التجار عاليي المخاطر.",
    aa_h2_onboard:"إلحاق التجار وتقييم مخاطرهم",
    aa_p_onboard:"في مرحلة الإلحاق تتخذ جهات التحصيل وميسّرو الدفع أهم قراراتها المتعلقة بالمخاطر، وفيها يتعارض الضغط للموافقة السريعة مع واجب معرفة الجهة التي يجري إلحاقها. نساعد جهات التحصيل وميسّري الدفع على تصميم مسارات إلحاق توافق تلقائياً على الطلبات السليمة وتركّز المراجعة اليدوية حيث تستدعي مؤشرات المخاطر ذلك. ويشمل ذلك أطر اعرف عميلك التجاري، ونماذج تقييم المخاطر، وتحليل الملكية النفعية، ورصد أنماط الاحتيال.",
    aa_h2_softpos:"SoftPOS والقبول متعدد القنوات",
    aa_p_softpos:"تغيّر قبول البطاقات في السنوات الخمس الماضية أكثر مما تغيّر في العشرين عاماً السابقة. يحوّل SoftPOS هاتف التاجر إلى جهاز دفع دون تلامس، ويغطي معيار PCI MPoC اليوم القبول دون تلامس وإدخال الرقم السري على الجهاز نفسه. نقدّم المشورة في نشر SoftPOS، وإدخال الرقم السري على الشاشة، والقبول الموحّد في المتاجر وعبر الإنترنت وداخل التطبيقات.",
    aa_h2_chargeback:"إدارة المبالغ المستردة والنزاعات",
    aa_p_chargeback:"يمكن منع كثير من طلبات استرداد المبالغ. فالأوصاف غير الواضحة للمعاملات تثير نزاعات لم يقع فيها احتيال أصلاً، والمعاملات غير الموثّقة ببروتوكول 3DS تُبقي المسؤولية على التاجر بدلاً من انتقالها إلى المُصدر. ويدخل التجار ذوو نسب النزاعات المرتفعة في برامج المراقبة لدى الشبكات، مع غرامات شهرية قد تنتهي بفقدان القدرة على قبول البطاقات. نساعد التجار وجهات التحصيل على بناء برامج وقائية وإجراءات اعتراض ترفع نسبة كسب النزاعات القابلة للطعن.",
    aa_h2_payfac:"ميسّرو الدفع ومدفوعات المنصات",
    aa_p_payfac:"يتيح نموذج ميسّر الدفع لمنصات البرمجيات والأسواق الإلكترونية إلحاق التجار الفرعيين وصرف مستحقاتهم بموجب اتفاقية تاجر رئيسية واحدة. وتتحمل المنصة مخاطر التقييم مقابل حصة أكبر من إيرادات الدفع. نساعد المنصات على تحديد جدوى هذا النموذج تجارياً وتنظيمياً، والاستعداد للنقاش مع البنك الراعي، وتصميم تقييم التجار الفرعيين، وإنجاز التسجيل لدى Visa وMastercard والشبكات الإقليمية.",
    page_sub_compliance:"مراقبة المعاملات لمكافحة غسل الأموال، وتصميم برامج اعرف عميلك، ومنع الاحتيال، وأطر الامتثال التنظيمي، ومخاطر إلحاق التجار لمؤسسات الدفع في الخليج وأوروبا.",
    cr_h2_aml:"مكافحة غسل الأموال ومراقبة المعاملات",
    cr_p_aml:"تتوقع الجهات التنظيمية اليوم من شركات الدفع تطبيق ضوابط لمكافحة غسل الأموال بمستوى البنوك نفسه، لأن الأموال تمر عبر أنظمة الدفع قبل وصولها إلى أي حساب مصرفي. والبرنامج الذي يرضي المدقق ليس بالضرورة البرنامج الذي يكشف الجرائم المالية. فالأنظمة القائمة على القواعد سريعة التطبيق وسهلة الشرح، لكنها تولّد أعداداً كبيرة من الإنذارات الخاطئة ويتعلم المجرمون المنظمون الالتفاف عليها. نساعد شركات الدفع على تصميم أطر المراقبة، وبناء مكتبات أنماط معايَرة، وتحسين معالجة الإنذارات، وتوثيق البرنامج بالمستوى الذي يتوقعه التدقيق الداخلي والجهات الرقابية.",
    cr_h2_kyc:"تصميم برامج اعرف عميلك",
    cr_p_kyc:"لا يتوقف التحقق من هوية العميل عند الإلحاق، بل يشمل المراجعة الدورية وإعادة التقييم كلما تغيّرت مخاطر العميل. تحدد العناية الواجبة الهوية والغرض من العلاقة، وتُطبَّق العناية الواجبة المعززة عندما تستدعي مؤشرات مثل صفة الشخص المعرّض سياسياً أو الولاية القضائية عالية المخاطر أو النشاط غير المعتاد تدقيقاً أعمق. نساعد شركات الدفع على تصميم أطر تناسب قاعدة عملائها ودرجة تقبّلها للمخاطر، مع تقنيات ترفع نسبة المعالجة الآلية دون إضعاف الضوابط.",
    cr_h2_fraud:"منع الاحتيال وكشفه",
    cr_p_fraud:"يختلف الاحتيال عن غسل الأموال في آلياته وتكلفته وطريقة ضبطه. ويتسبب الاستيلاء على الحسابات والهويات المصطنعة والهندسة الاجتماعية وسوء الاستخدام من العميل نفسه في معظم الخسائر في المدفوعات الرقمية اليوم. نقدّم المشورة في بنية كشف الاحتيال، وتقييم نماذج التعلم الآلي، وضوابط الاستيلاء على الحسابات، ورصد الهويات المصطنعة عند الإلحاق، وكشف احتيال الدفع المأذون به (APP) وتوزيع المسؤولية عنه وفق قواعد التعويض في المملكة المتحدة.",
    cr_h2_reg:"أطر الامتثال التنظيمي",
    cr_p_reg:"نفسّر ونطبّق التوجيه الأوروبي PSD2 وما يحل محله (PSD3 ولائحة خدمات الدفع)، وقواعد شبكات البطاقات، والمتطلبات الإقليمية. نساعد الشركات على تحديد الثغرات وتصميم الضوابط وتوثيق الامتثال والاستعداد للمراجعات الرقابية. ونغطي مصرف قطر المركزي، والبنك المركزي السعودي، ومصرف الإمارات العربية المتحدة المركزي، ومصرف البحرين المركزي، وهيئة السلوك المالي البريطانية، والجهات التنظيمية الوطنية في الاتحاد الأوروبي، ونقدّم المشورة في الامتثال لقاعدة السفر الصادرة عن مجموعة العمل المالي للتحويلات العابرة للحدود وتحويلات الأصول الافتراضية.",
    page_sub_digital_em:"مشورة في التقنيات ونماذج الأعمال الجديدة في قطاع المدفوعات، من العملات الرقمية للبنوك المركزية والتسوية المرمّزة إلى التجارة الوكيلة والمصرفية المفتوحة.",
    de_h2_cbdc:"استشارات العملات الرقمية للبنوك المركزية",
    de_p_cbdc:"تدرس معظم البنوك المركزية في العالم إصدار عملة رقمية أو تختبرها. ويطرح اليورو الرقمي الذي يعمل عليه البنك المركزي الأوروبي، ومنصة mBridge متعددة العملات الرقمية (التي تديرها بنوكها المركزية الأعضاء منذ انسحاب بنك التسويات الدولية في 2024)، وأعمال بنك إنجلترا على الجنيه الرقمي، أسئلة تجارية على البنوك والمعالجين والتجار. وقد وافقت لجنة الشؤون الاقتصادية في البرلمان الأوروبي على لائحة اليورو الرقمي في يونيو 2026، وتليها مفاوضات مع الدول الأعضاء، وسيحدد النص النهائي نموذج التوزيع وحدود الحيازة وعلاقة اليورو الرقمي بالودائع المصرفية. نقدّم المشورة لمقدمي خدمات الدفع في التموضع والأثر التجاري والاستعداد التقني.",
    de_h2_token:"التسوية المرمّزة",
    de_p_token:"يسجّل الترميز الحقوق في أصول مثل السندات والأسهم والعقارات والسلع على هيئة رموز رقمية في سجل موزّع. وتتنافس الودائع المرمّزة والعملات المستقرة الخاضعة للتنظيم والعملات الرقمية للبنوك المركزية بالجملة على تسوية هذه الأصول بسرعة أكبر وبعدد أقل من الوسطاء، ويعمل البنك المركزي الأوروبي على تسوية المعاملات القائمة على السجلات الموزعة بأموال البنك المركزي. نقدّم المشورة في الآثار التجارية وقابلية التشغيل البيني والمعاملة التنظيمية للأوراق المالية والمدفوعات المرمّزة.",
    de_h2_a2a:"المصرفية المفتوحة والدفع من حساب إلى حساب",
    de_p_a2a:"تنقل المدفوعات من حساب إلى حساب الأموال مباشرة بين الحسابات المصرفية دون المرور بشبكة بطاقات. في الاتحاد الأوروبي ستحدد لائحة خدمات الدفع ولائحة الوصول إلى البيانات المالية (FiDA) المقترحة ملامح المصرفية المفتوحة، وفي المملكة المتحدة تُطرح المدفوعات المتكررة المتغيرة للأغراض التجارية، وباتت عدة جهات تنظيمية خليجية ترخّص مزودي المصرفية المفتوحة. نقدّم المشورة لجهات التحصيل والتجار في الحالات التي يحسّن فيها هذا النوع من الدفع الاقتصاديات والحالات التي تبقى فيها البطاقات الخيار الأفضل، وفي كيفية تقديم جهات التحصيل له إلى جانب قبول البطاقات.",
    de_h2_agentic:"التجارة الوكيلة",
    de_p_agentic:"التجارة الوكيلة تعني وكلاء ذكاء اصطناعي يبحثون ويختارون ويدفعون نيابة عن المستخدم دون أن يوافق شخص على كل خطوة. وتشكّل Visa Intelligent Commerce وبروتوكول Trusted Agent Protocol التابع لها، وMastercard Agent Pay، وبروتوكول Agent Payments Protocol (AP2) من Google، وبروتوكول Machine Payments Protocol من Stripe أولى البنى التحتية لهذا النوع من التجارة. ولم تُصمَّم منطقيات التفويض وتوزيع المسؤولية عن الاحتيال وأساليب التوثيق للمدفوعات التي تبدأها برمجيات وكيلة، لذا تحتاج جهات التحصيل والمُصدرون والمعالجون إلى الاستعداد لهذا التغيير. نقدّم المشورة لمؤسسات الدفع في تقييم الجاهزية والتموضع.",
    svc_page_sub:"أربع خدمات تغطي المجالات الرئيسية في صناعة المدفوعات الحديثة، نقدّمها في أسواق دول مجلس التعاون الخليجي والشرق الأوسط وشمال أفريقيا وأوروبا.",
    svc_payments_body:"البطاقات والمحافظ الرقمية والمدفوعات الفورية والتحويلات من حساب إلى حساب والدفع دون تلامس. معرفة عملية بهياكل شبكات البطاقات ونماذج الرسوم وتقنيات المعالجة.",
    solutions_heading:"استشارات متخصصة حسب مجالات المدفوعات",
    sol_page_sub:"مشورة في التقنيات ونماذج الأعمال التي تغيّر طريقة عمل المدفوعات، من التجارة الوكيلة إلى التسوية المرمّزة.",
    sol_infra_sub:"الذكاء الاصطناعي، الأنظمة الفورية، ISO 20022، تنسيق المدفوعات",
    sol_acquiring_sub:"إلحاق التجار، SoftPOS، المبالغ المستردة",
    sol_compliance_sub:"مكافحة غسل الأموال، اعرف عميلك، الاحتيال، الأطر التنظيمية",
    sol_digital_sub:"العملات الرقمية للبنوك المركزية، الترميز، المصرفية المفتوحة، التجارة الوكيلة",
    sol_card_sub:"تصميم البرامج، اختيار المعالج، رعاية BIN",
    sol_fx_sub:"المدفوعات عبر الحدود، صرف العملات، هياكل الخزينة",
    office_doha:"الدوحة (المقر الرئيسي)",
    office_london:"لندن",
    office_istanbul:"إسطنبول",
    about_cta:"اعمل معنا ←",
    about_p1:"تأسست MENA Advisory في الدوحة في يناير 2020. وبعد أسابيع قليلة أغلقت جائحة عالمية الحدود حول العالم، فتعطّل النموذج الذي اعتمدت عليه شركات المدفوعات الخليجية في استقدام الخبرات الرفيعة من دبي ولندن ونيويورك وسنغافورة.",
    careers_sub:"نحن شركة استشارية متخصصة في المدفوعات والتكنولوجيا المالية. نوظّف بانتقائية، ونبحث عن أشخاص يملكون خبرة عميقة في المجال وتجربة قيادية في القطاع.",
    careers_open_label:"الوظائف الشاغرة",
    careers_none_heading:"لا توجد وظائف شاغرة حالياً",
    careers_none_body:"لا توجد لدينا وظائف شاغرة في الوقت الحالي. إذا كانت لديك خبرة قوية في المدفوعات وترغب في تسجيل اهتمامك، راسلنا على <a href=\"mailto:careers@madvisory.qa\">careers@madvisory.qa</a> أو استخدم <a href=\"/contact.html\">صفحة التواصل</a>.",
    contact_sub:"سواء كنت تقيّم استثماراً في التكنولوجيا المالية، أو تخطط لبرنامج تحوّل، أو تراجع بنيتك التحتية للمدفوعات، أخبرنا بما تعمل عليه.",
    hero_sub:"استشارات مستقلة للمؤسسات المالية وجهات التحصيل ومُصدري البطاقات وشركات التكنولوجيا المالية والجهات الحكومية التي تبني الجيل القادم من المدفوعات في دول مجلس التعاون الخليجي والشرق الأوسط وشمال أفريقيا وأوروبا.",
    hero_cta1:"استكشف خدماتنا ←",
    ci_h1:"إصدار البطاقات وإدارة البرامج",
    ci_sub:"تصميم البرامج، واختيار المعالج، ورعاية BIN وعضوية الشبكات، والبطاقات التجارية والافتراضية، وإدارة المحافظ للبنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية.",
    ci_cta_discuss:"ناقش هذا الحل ←",
    ci_cta_all_sol:"جميع الحلول",
    ci_h2_design:"تصميم برامج البطاقات",
    ci_p_design1:"برنامج البطاقات مجموعة من القرارات التجارية والتقنية والتنظيمية المترابطة التي تحدد الاقتصاديات وملف المخاطر وعرض القيمة لكل بطاقة يصدرها البرنامج. ويجب حسم عدد من هذه القرارات قبل اختيار المعالج أو توقيع اتفاقية الشبكة: الشريحة المستهدفة (استهلاكية أو للشركات أو مسبقة الدفع أو لصرف الرواتب)، والشبكة (Visa أو Mastercard أو Amex أو شبكة محلية مثل مدى أو BENEFIT أو ميزة)، ونموذج البرنامج (إصدار مصرفي أو شراكة مع شركة تكنولوجيا مالية أو بطاقة مسبقة الدفع تحمل علامة تجارية)، ونموذج الإيرادات (مكافآت تموّلها رسوم التبادل، أو رسوم، أو دخل صرف العملات).",
    ci_p_design2:"تؤثر هذه الخيارات بعضها في بعض بطرق لا تظهر غالباً إلا أثناء التنفيذ. فبطاقة المكافآت المصممة لتعظيم رسوم التبادل تحتاج إلى إعداد مختلف لدى المعالج، وتحمل مخاطر احتيال مختلفة، وتخضع لتنظيم مختلف عن بطاقة الرواتب مسبقة الدفع للعمالة الوافدة في الخليج. والتصميم الصحيح منذ البداية يجنّب إعادة هيكلة مكلفة بعد الإطلاق.",
    ci_p_design3:"نعمل مع البنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية في مرحلة التصميم لتحديد المنتج، ونمذجة اقتصاديات الوحدة وفق أحجام واقعية، وكتابة مواصفات متطلبات تمنح المُصدِر أساساً واضحاً لاختيار المعالج والتفاوض مع الشبكات.",
    ci_li_design_1:"بنية البرنامج: نوع البطاقة والشبكة وشريحة العملاء والنموذج التجاري",
    ci_li_design_2:"اقتصاديات الوحدة: دخل التبادل وتكاليف المعالج وخسائر الاحتيال والتزامات المكافآت وهامش المساهمة عند التوسع",
    ci_li_design_3:"التصنيف التنظيمي: ترخيص مصرفي أو ترخيص نقود إلكترونية أو رعاية BIN، وما يترتب على كل منها",
    ci_li_design_4:"الدخول إلى السوق: نموذج التوزيع وقنوات الشركاء وتكلفة اكتساب العملاء",
    ci_h2_processor:"اختيار معالج البطاقات",
    ci_p_processor1:"لم يكن أمام البنوك في السابق خيار يُذكر غير كبار المعالجين التقليديين. أما اليوم فمنصات الإصدار القائمة على واجهات البرمجة، مثل Marqeta وi2c وThredd (المعروفة سابقاً باسم Global Processing Services) وPomelo، إلى جانب المزودين الإقليميين، أسرع نشراً وأكثر مرونة في الإعداد وأنسب للتكنولوجيا المالية والتمويل المدمج. في المقابل ما زال المعالجون التقليديون يوفّرون عمقاً أكبر للمنتجات المصرفية المعقدة.",
    ci_p_processor2:"اختيار المعالج من أهم القرارات التقنية التي يتخذها المُصدِر. فنقل برنامج قائم إلى معالج آخر مكلف ومحفوف بالمخاطر ومزعج لحاملي البطاقات، لذا ينبغي أن يستند الاختيار الأول إلى تقييم موضوعي مقابل المتطلبات، لا إلى العروض التسويقية والعملاء المرجعيين الذين يختارهم المورد.",
    ci_h4_apifirst:"منصات التكنولوجيا المالية القائمة على واجهات البرمجة",
    ci_p_apifirst:"Marqeta وi2c وThredd وPomelo: مرونة عالية في الإعداد، ومصممة للتمويل المدمج والإطلاق السريع، مع توثيق جيد للمطورين وضوابط آنية وإدارة للبطاقات عبر الإشعارات البرمجية.",
    ci_h4_tier1:"المعالجون التقليديون الكبار",
    ci_p_tier1:"FIS (التي استحوذت على أعمال الإصدار في TSYS من Global Payments في يناير 2026) وFiserv: وظائف متعمقة للمنتجات المصرفية المعقدة، وربط ناضج بالشبكات، وسجل تشغيلي طويل على نطاق واسع، مع مدة تنفيذ أطول.",
    ci_h4_regional:"المعالجون الإقليميون في الخليج",
    ci_p_regional:"Network International وMagnati (الإمارات) والمعالجون المرتبطون بشبكة مدى (السعودية): مهمون للمشاركة في الشبكات المحلية والامتثال التنظيمي المحلي وخدمة حاملي البطاقات باللغة العربية.",
    ci_h4_embedded:"بنية الإصدار المدمج",
    ci_p_embedded:"Stripe Issuing وAdyen Issuing وRailsr: مصممة لمنصات البرمجيات والأسواق الإلكترونية التي تضيف إصدار البطاقات إلى منتجاتها. أبسط في الإعداد، وتسعيرها مرتبط باقتصاديات المنصة نفسها.",
    ci_p_processor3:"يشمل عملنا في اختيار المعالج مواصفات المتطلبات (الوظيفية والتقنية والتنظيمية والتجارية)، وتصميم طلب العروض، وإطار التقييم، ومقابلات مرجعية نرتبها باستقلال عن المورد، والتفاوض التجاري، ومراجعة جاهزية التنفيذ.",
    ci_li_proc_1:"متطلبات تغطي وظائف المعالجة ودعم الشبكات والتغطية الإقليمية وجودة واجهات البرمجة",
    ci_li_proc_2:"تصميم طلب العروض وإطار تقييم موزون وفق أولويات البرنامج",
    ci_li_proc_3:"تحقق مستقل من المراجع لدى برامج مماثلة لبرنامج العميل",
    ci_li_proc_4:"التفاوض التجاري: رسوم المعالجة وتكلفة كل عملية تفويض والحد الأدنى للأحجام والغرامات",
    ci_li_proc_5:"تخطيط الانتقال للبرامج التي تنتقل من معالج قائم",
    ci_h2_bin:"رعاية BIN وعضوية الشبكات",
    ci_p_bin1:"يتطلب إصدار بطاقة Visa أو Mastercard رقم تعريف مصرفي (BIN)، وهو نطاق من أرقام البطاقات تخصصه الشبكة لعضو مرخّص. وأمام شركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية والداخلين الجدد مساران: رعاية BIN، أي الإصدار تحت BIN بنك عضو قائم، أو العضوية المباشرة في الشبكة بصفة عضو رئيسي أو تابع.",
    ci_p_bin2:"الاختيار لا يتعلق بالتكلفة وحدها. فالرعاية أسرع، ولا تحتاج إلى علاقة مباشرة مع الشبكة، وتضع معظم المسؤولية التنظيمية على البنك الراعي. أما العضوية المباشرة فتمنح سيطرة أكبر، وتنهي الاعتماد على الراعي، وتلزم للوصول المباشر إلى بعض برامج الشبكات مثل Visa Commercial Solutions أو منتجات بطاقات الأعمال من Mastercard. وتتطلب كذلك استيفاء متطلبات رأس المال لدى الشبكة، واجتياز الاعتماد التقني، وتوقيع اتفاقية مباشرة معها، وهي عملية تستغرق عادة من ستة إلى اثني عشر شهراً في أسواق الخليج.",
    ci_li_bin_1:"رعاية BIN: اختيار البنك الراعي وشروط العقد وتوزيع المسؤوليات والاقتصاديات",
    ci_li_bin_2:"عضوية الشبكات: عضو رئيسي أو تابع، ومتطلبات رأس المال، والاعتماد التقني، ودعم طلبات العضوية لدى Visa وMastercard في أسواق الخليج",
    ci_li_bin_3:"الشبكات المحلية: مدى (السعودية) وBENEFIT (البحرين) وNAPS (قطر) وJaywan (الإمارات) وميزة (مصر): متطلبات العضوية والتكامل التقني",
    ci_li_bin_4:"برامج منتجات الشبكات: Visa Commercial Solutions وبطاقات الأعمال من Mastercard وأهلية برامج المكافآت الاستهلاكية",
    ci_h2_commercial:"برامج البطاقات التجارية",
    ci_p_commercial1:"تعمل برامج البطاقات التجارية (بطاقات الشركات، وبطاقات المشتريات، والبطاقات الافتراضية لإنفاق الأعمال، وبطاقات السفر والضيافة) وفق اقتصاديات تختلف عن البرامج الاستهلاكية. ففي الأسواق التي لا تُسقَّف فيها رسوم التبادل تكون رسوم البطاقات التجارية عادةً أعلى من رسوم البطاقات الاستهلاكية، بسبب ثراء بيانات المعاملات ومخاطر الائتمان التي يتحملها المُصدِر تجاه الشركات. وفي الاتحاد الأوروبي والمملكة المتحدة لا تخضع البطاقات التجارية للسقوف المفروضة على البطاقات الاستهلاكية في لائحة رسوم التبادل.",
    ci_p_commercial2:"تجذب هذه البطاقات الشركات لما توفّره من رؤية للإنفاق وضبط للسياسات وخصومات على الأحجام، مع ضوابط حسب فئات الإنفاق وربط بأنظمة إدارة النفقات. أما للمُصدِر فالبرنامج التجاري الجيد التصميم يحقق دخلاً من رسوم التبادل لكل معاملة أعلى من البرنامج الاستهلاكي (خاصة عند تقديم بيانات المستويين الثاني والثالث بشكل صحيح)، ويسجل خسائر احتيال أقل بفضل ضوابط الإنفاق لدى الشركات، ويحتفظ بحاملي البطاقات لمدة أطول.",
    ci_h3_virtual:"برامج البطاقات الافتراضية",
    ci_p_virtual1:"أصبحت البطاقات الافتراضية، وهي أرقام بطاقات لاستخدام واحد أو متعدد تُنشأ برمجياً لمورد أو نوع معاملة محدد، أداة معتادة في برامج المدفوعات بين الشركات وشركات إدارة السفر ومنصات التمويل المدمج. بعض البرامج يحقق دخلاً من رسوم التبادل على كل معاملة، وبعضها يُسوَّق أداةً لإدارة رأس المال العامل أو المطابقة ويحقق دخله من رسوم المنصة أو العائد على الأرصدة.",
    ci_p_virtual2:"وبالنسبة إلى الشركات وشركات التكنولوجيا المالية في الخليج التي تبني برامج بطاقات افتراضية، فإن اختيار المعالج مهم: فليس كل معالج يدعم الضوابط على مستوى المعاملة (التفويض بالمبلغ المحدد، وانتهاء الصلاحية بعد استخدام واحد، والحدود الخاصة بكل مورد) التي تجعل هذه البطاقات مفيدة لأتمتة الحسابات الدائنة.",
    ci_li_comm_1:"تصميم بطاقات الشركات: هيكل الائتمان وضوابط الإنفاق والتكامل مع أنظمة تخطيط الموارد وإدارة النفقات",
    ci_li_comm_2:"بيانات المستويين الثاني والثالث: قواعد التأهل والتنفيذ التقني ونمذجة رسوم التبادل",
    ci_li_comm_3:"بنية البطاقات الافتراضية: استخدام واحد أو متعدد، والضوابط لكل معاملة، وبيانات المطابقة",
    ci_li_comm_4:"تصميم الخصومات: عتبات الإنفاق ومسرّعات حسب الفئة وآليات الصرف",
    ci_li_comm_5:"السفر والضيافة: بطاقات الحساب المركزي، والشراكات مع شركات إدارة السفر، والقبول لدى شركات الطيران والفنادق",
    ci_h2_portfolio:"إدارة المحفظة وتحسين رسوم التبادل",
    ci_p_portfolio1:"حتى المحفظة التي أُطلقت بشكل جيد يتراجع أداؤها إن لم تتطور إدارتها مع نموها. ويُعدّ تحسين رسوم التبادل، أي التأكد من أن كل معاملة تحمل البيانات اللازمة للتأهل لأفضل سعر، أكثر مصادر الإيراد التي يغفل عنها المُصدِرون، وخاصة في البرامج التجارية.",
    ci_p_portfolio2:"معدلات الاحتيال ومخصصات خسائر الائتمان ونسب الموافقة هي العوامل الرئيسية الأخرى في ربحية المحفظة. فنموذج التفويض الذي يرفض أكثر من اللازم يُغضب حاملي البطاقات ويُفقد دخل رسوم التبادل، والنموذج الذي يوافق بسهولة يرفع خسائر الاحتيال والائتمان. وتحقيق التوازن يتطلب متابعة نسب الموافقة والاحتيال والإنذارات الخاطئة حسب شريحة حاملي البطاقات ونوع المعاملة.",
    ci_li_port_1:"تدقيق التأهل لرسوم التبادل: كشف فجوات البيانات التي تنقل المعاملات إلى فئات أعلى تكلفة",
    ci_li_port_2:"استراتيجية التفويض: نسب موافقة أعلى دون زيادة الاحتيال",
    ci_li_port_3:"مراجعة نماذج الاحتيال: معايرة المراقبة وتقسيم حاملي البطاقات حسب المخاطر وتحليل معدلات النزاع",
    ci_li_port_4:"ربحية المحفظة: الإيرادات والتكاليف حسب نوع البطاقة والقناة وشريحة العملاء",
    ci_li_port_5:"دورة حياة حامل البطاقة: التفعيل والإنفاق المبكر والحد من التسرب",
    ci_h3_cta:"ناقش متطلبات برنامج بطاقاتك",
    ci_p_cta:"تعمل MENA Advisory مع البنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية على تصميم برامج البطاقات وإطلاقها وتحسينها في أسواق الخليج وأوروبا. سواء كنت تصمم برنامجاً أو تختار معالجاً أو تراجع محفظة، تحدّث مباشرة مع متخصص.",
    fx_h1:"صرف العملات ومدفوعات الخزينة",
    fx_sub:"البنية التحتية للمدفوعات العابرة للحدود، وSWIFT وISO 20022، والتسوية متعددة العملات، ومخاطر صرف العملات، ومدفوعات الخزينة للشركات في أسواق الخليج وأوروبا.",
    fx_cta_discuss:"ناقش هذا الحل ←",
    fx_cta_all_sol:"جميع الحلول",
    fx_h2_gcc:"المدفوعات العابرة للحدود في الخليج",
    fx_p_gcc1:"تُعدّ التدفقات المالية العابرة للحدود من دول الخليج من الأكبر في العالم قياساً إلى الناتج المحلي. خمس من عملات دول المجلس الست مرتبطة بالدولار الأمريكي، بينما يرتبط الدينار الكويتي بسلة عملات غير معلنة. ويبسّط هذا الربط إدارة صرف العملات بين معظم عملات الخليج، لكن كثيراً من المدفوعات العابرة للحدود، ومعظم المدفوعات إلى عملات خارج الخليج، ما زالت تمر عبر حسابات مراسلة بالدولار تُسوّى غالباً في نيويورك. ويخلق ذلك اعتماداً تشغيلياً على عدد محدود من البنوك المراسلة، والتزامات امتثال للعقوبات على كل بنك ومؤسسة دفع في المنطقة. وتوجد بدائل إقليمية، منها منصة بُنى، نظام المدفوعات الإقليمي التابع لصندوق النقد العربي، الذي يسوّي بعدة عملات عربية إضافة إلى الدولار واليورو.",
    fx_stat_remit:"التحويلات الخارجة سنوياً من السعودية والإمارات مجتمعتين",
    fx_stat_trade:"عملات خليجية مرتبطة بالدولار الأمريكي (الكويت تعتمد سلة عملات)",
    fx_stat_curr:"ريال سعودي مقابل الدولار الأمريكي، سعر ثابت منذ 1986",
    fx_p_gcc2:"يعرف أمناء الخزينة في شركات الخليج المشكلات العملية جيداً: مدفوعات SWIFT بطيئة ويصعب تتبعها عبر سلسلة البنوك المراسلة، وتكاليف صرف مخفية في رسوم التحويل، وفحص للعقوبات لدى كل بنك مراسل يجعل مواعيد الوصول غير متوقعة، ومتطلبات متزايدة لوثائق مكافحة غسل الأموال وتمويل الإرهاب في التحويلات الكبيرة.",
    fx_p_gcc3:"وتواجه مؤسسات الدفع وشركات التكنولوجيا المالية التي تقدّم خدمات عابرة للحدود المشكلات نفسها وأكثر: فالحصول على حسابات مراسلة أصعب، والمتطلبات التنظيمية في طرفي كل ممر يجب إدارتها في آن واحد، والهوامش تحت ضغط مستمر من المنافسين الرقميين الذين يقدّمون تحويلات شفافة ومنخفضة التكلفة على الممرات الرئيسية.",
    fx_h2_swift:"SWIFT gpi والانتقال إلى ISO 20022",
    fx_p_swift1:"أصبحت خدمة SWIFT gpi الأساس في المدفوعات العابرة للحدود بين البنوك المراسلة. فهي تتتبع كل دفعة من البداية إلى النهاية، وتؤكد موعد إيداعها في حساب المستفيد، وتُظهر الرسوم المقتطعة في كل مرحلة. ويتوقع عملاء الشركات اليوم أن توفّرها البنوك ومؤسسات الدفع التي ترسل مدفوعات عالية القيمة من الخليج بشكل معتاد.",
    fx_h3_iso:"ISO 20022: الوضع الحالي والالتزامات",
    fx_p_iso1:"انتهت فترة التعايش في SWIFT لتعليمات الدفع العابرة للحدود في نوفمبر 2025، وأصبحت رسائل ISO 20022 (MX) الصيغة المطلوبة على الشبكة. والمؤسسات التي لم تُكمل الانتقال تعتمد على تحويل الرسائل، وهو ما يُبقي المدفوعات تعمل لكنه يُسقط البيانات المنظّمة، مثل معرّف الكيان القانوني ورمز الغرض والعنوان المنظّم، التي تجعل مدفوعات ISO 20022 مقروءة آلياً وأسهل في الفحص.",
    fx_p_iso2:"عندما تنتقل دفعة من بنك يعمل بالكامل بصيغ MX إلى بنك ما زال يعمل بصيغ MT، تُفقد بياناتها المنظّمة عند نقطة التحويل. فيضطر البنك المستلم إلى فحص نص غير منظّم، مما يرفع عدد الإنذارات الخاطئة ويبطئ المعالجة ويزيد التكلفة.",
    fx_li_iso_1:"تقييم الجاهزية لمعيار ISO 20022: تحليل الفجوات مقابل متطلبات رسائل MX",
    fx_li_iso_2:"استكمال البيانات المنظّمة: معرّف الكيان القانوني ورمز الغرض والعنوان المنظّم",
    fx_li_iso_3:"معايرة فحص العقوبات للبيانات المنظّمة: إنذارات خاطئة أقل دون فقدان التغطية",
    fx_li_iso_4:"مراجعة gpi: تكامل التتبع وتقارير شفافية الرسوم وإدارة مستويات الخدمة",
    fx_h2_multicurr:"استراتيجية التسوية متعددة العملات",
    fx_p_multicurr1:"بالنسبة إلى شركات الدفع التي تستلم الأموال بعملة وتدفعها بعملة أخرى، يحدد إعداد التسوية الربحية والمخاطر التشغيلية معاً. والقرارات الرئيسية هي: أزواج العملات التي تحتفظ فيها الشركة بأرصدة وتلك التي تحوّلها عبر عملة وسيطة؛ وهل تعمل بصفة أصيل (فتتحمل مخاطر الصرف في ميزانيتها) أم وكيل (فتحيل التحويل إلى شريك وتحصل على هامش)؛ وكيف تدير التعرض بين لحظة تثبيت العميل للسعر ولحظة اكتمال التسوية.",
    fx_h3_fxrisk:"إدارة مخاطر صرف العملات لشركات الدفع",
    fx_p_fxrisk1:"الشركة التي تحدد السعر عند بدء الدفعة وتسوّيها لاحقاً تتحمل مخاطر صرف في الفترة بينهما. وهذه المخاطر ضئيلة في تحويل صغير واحد، لكنها قد تصبح كبيرة عبر آلاف المعاملات المفتوحة عند تقلّب العملات بحدة. أما في مدفوعات الشركات والمدفوعات بين الشركات، حيث قد تبلغ الدفعة الواحدة مئات الآلاف من الدولارات، فقد يكون للتعرض في معاملة واحدة أثر تجاري ملموس.",
    fx_li_fx_1:"قياس التعرض: القيمة المعرّضة للمخاطر على مستوى المحفظة حسب زوج العملات ومدة التسوية",
    fx_li_fx_2:"استراتيجية التحوط: العقود الآجلة والخيارات والتحوط الطبيعي عبر مواءمة العملات",
    fx_li_fx_3:"الأطراف المقابلة للخزينة: مكاتب الصرف في البنوك أو مزودو صرف متخصصون (مثل Corpay وConvera وEquals وMoneycorp)",
    fx_li_fx_4:"البنية التحتية للحسابات متعددة العملات: تجميع السيولة والحسابات الافتراضية وإدارة حسابات النوسترو",
    fx_h3_gcc_fx:"اعتبارات صرف العملات الخاصة بالخليج",
    fx_p_gcc_fx1:"ثُبّت الريال السعودي عند 3.75 للدولار منذ 1986، والدرهم الإماراتي عند 3.6725 منذ 1997 (وفعلياً منذ 1980)، والريال القطري عند 3.64 رسمياً منذ 2001. وهذه الأسعار مدعومة باحتياطيات قوية، لكن شركات الدفع في المنطقة ما زالت بحاجة إلى إدارة السيولة بالدولار في الأنظمة المصرفية المحلية، وتكاليف التحويل في المدفوعات إلى عملات عائمة مثل الروبية الهندية والروبية الباكستانية والبيزو الفلبيني والجنيه المصري، وهي ممرات التحويل الرئيسية.",
    fx_p_gcc_fx2:"<strong>mBridge ومستقبل بنية التسوية:</strong> منصة mBridge منصة متعددة العملات الرقمية للتسوية العابرة للحدود، بنتها البنوك المركزية في الصين وهونغ كونغ وتايلاند والإمارات، بمشاركة مركز الابتكار التابع لبنك التسويات الدولية حتى انسحابه في أكتوبر 2024. وبلغت مرحلة المنتج الأولي القابل للتطبيق في 2024. وانضمت السعودية في 2024، لكنها أكدت لاحقاً أنها لم تعد عضواً مشاركاً. وعلى البنوك وشركات الدفع ذات التدفقات الكبيرة بين الخليج وآسيا متابعة تطورها، وإن كان أثرها على المصرفية المراسلة ما زال بعيداً.",
    fx_h2_treasury:"مدفوعات الخزينة للشركات",
    fx_p_treasury1:"ترسل الشركات الخليجية الكبيرة، خاصة في قطاعات الطاقة والإنشاءات والقطاعات المرتبطة بالحكومة، مدفوعات كبيرة عابرة للحدود للمشتريات وتمويل المشاريع والرواتب. وغالباً ما تكون البنية التي تقف خلف هذه المدفوعات مجزأة: بنوك كثيرة في دول كثيرة، وصيغ دفع غير متسقة، ومطابقة يدوية مع أنظمة تخطيط الموارد، ورؤية محدودة بين بدء الدفعة وإيداعها.",
    fx_p_treasury2:"نساعد إدارات الخزينة على تقليص عدد العلاقات المصرفية، وتوحيد صيغ الدفع على مستوى المجموعة، واعتماد هياكل بيانات ISO 20022 التي تتيح المطابقة الآلية، وإنشاء مصانع دفع تجمع المدفوعات العابرة للحدود في جهة واحدة مع الالتزام بمتطلبات الامتثال والتقارير المحلية.",
    fx_h3_factory:"مصنع الدفع والبنك الداخلي",
    fx_p_factory1:"يوجّه مصنع الدفع جميع المدفوعات العابرة للحدود لمجموعة الشركات عبر جهة مركزية واحدة، هي عادةً مركز الخزينة للمجموعة، التي تتولى العلاقات المصرفية الخارجية وتدفع نيابة عن الشركات التابعة. ومن فوائده موقف تفاوضي أقوى مع البنوك، ورسوم مصرفية أقل، وأسعار صرف أفضل عبر المقاصة، ونقطة تحكم واحدة لفحص العقوبات ومكافحة غسل الأموال.",
    fx_li_treas_1:"دراسة الجدوى: الأحجام وهيكل الكيانات القانونية والمتطلبات في كل سوق خليجي",
    fx_li_treas_2:"تصميم البنك الداخلي: الإقراض بين الشركات والتجميع الافتراضي للسيولة والمقاصة بين العملات",
    fx_li_treas_3:"مراجعة البنوك المتعامل معها: تصميم طلب العروض واختيار البنوك وهيكل الحسابات",
    fx_li_treas_4:"التكامل مع أنظمة تخطيط الموارد: إعداد وحدات الدفع في SAP وOracle وMicrosoft Dynamics لإنتاج رسائل ISO 20022",
    fx_li_treas_5:"فحص العقوبات ضمن مسار الدفع: قوائم الأمم المتحدة ومكتب مراقبة الأصول الأجنبية الأمريكي والاتحاد الأوروبي والقوائم الوطنية في كل سوق خليجي",
    fx_h3_cta:"ناقش متطلبات صرف العملات ومدفوعات الخزينة لديك",
    fx_p_cta:"تقدّم MENA Advisory المشورة للبنوك ومؤسسات الدفع وإدارات الخزينة في الشركات في البنية التحتية للمدفوعات العابرة للحدود ومخاطر صرف العملات والانتقال إلى ISO 20022 ومدفوعات الخزينة في أسواق الخليج وأوروبا. تحدّث مع متخصص عن وضعك.",
    lme_h1:"الترخيص ودخول الأسواق",
    lme_sub:"ترخيص مؤسسات الدفع ودخول الأسواق في دول الخليج والمملكة المتحدة والاتحاد الأوروبي، من اختيار الترخيص المناسب إلى التعامل مع الجهة التنظيمية واستيفاء الشروط والوصول إلى المصرفية المراسلة.",
    lme_cta_discuss:"ناقش هذا الحل ←",
    lme_cta_all:"جميع الحلول",
    lme_h2_gcc:"جهات الترخيص في دول الخليج",
    lme_p_gcc_intro:"يدير كل بنك مركزي في الخليج نظام ترخيص خاصاً به لمقدمي خدمات الدفع، بمتطلبات رأس مال ومعايير حوكمة وتوقعات لمكافحة غسل الأموال وتمويل الإرهاب وإجراءات رقابية خاصة به. ولا يمنح الترخيص في دولة خليجية أي حق في العمل في دولة أخرى، لذا تحتاج الشركة التي تبني أعمالاً على مستوى الخليج عادةً إلى ترخيص منفصل وكيان مرخّص أو فرع في كل سوق.",
    jur_qatar:"قطر",
    lme_h4_qcb:"مصرف قطر المركزي",
    lme_p_qcb:"قانون أنظمة الدفع (القانون رقم 15 لسنة 2021) ولوائح خدمات الدفع الصادرة عن مصرف قطر المركزي. يجب استضافة البيانات داخل قطر. الربط بالشبكة القطرية للمدفوعات (NAPS) ونظام فوران للمدفوعات الفورية. تتوفر بيئة تجريبية تنظيمية لدى المصرف. المدة المعتادة للترخيص: من 6 إلى 12 شهراً.",
    jur_saudi:"السعودية",
    lme_h4_sama:"البنك المركزي السعودي (ساما)",
    lme_p_sama:"نظام المدفوعات وخدماتها ولائحته التنفيذية، مع تراخيص منفصلة لمؤسسات الدفع الكبرى ومؤسسات الدفع الصغرى. متطلبات المشاركة في شبكة مدى ونظام سريع للمدفوعات الفورية. إقامة البيانات داخل المملكة. المدة المعتادة: من 9 إلى 15 شهراً.",
    jur_uae:"الإمارات",
    lme_h4_cbuae:"مصرف الإمارات العربية المتحدة المركزي",
    lme_p_cbuae:"ترخيصا خدمات الدفع للأفراد ومرافق القيمة المخزنة بموجب قانون المصرف المركزي (المرسوم بقانون اتحادي رقم 6 لسنة 2025)، الذي انتهت فترته الانتقالية البالغة عاماً واحداً في سبتمبر 2026. لائحة خدمات رموز الدفع للمدفوعات القائمة على العملات المستقرة. الربط بنظام آني للمدفوعات الفورية. المدة المعتادة: من 9 إلى 14 شهراً.",
    jur_bahrain:"البحرين",
    lme_h4_cbb:"مصرف البحرين المركزي",
    lme_p_cbb:"تراخيص مقدمي الخدمات المساندة لخدمات الدفع، وتراخيص الصرافة. من أوائل أطر المصرفية المفتوحة في المنطقة. الربط بنظام فوري+ للمدفوعات الفورية. بيئة تجريبية تنظيمية لنماذج الأعمال الجديدة. المدة المعتادة: من 6 إلى 10 أشهر.",
    jur_kuwait:"الكويت",
    lme_h4_cbk:"بنك الكويت المركزي",
    lme_p_cbk:"إطار أنظمة الدفع والتسوية. متطلبات المشاركة في شبكة كي نت لأعمال التحصيل. قواعد الصرف والتحويلات لشركات الدفع العابرة للحدود. المدة المعتادة: من 10 إلى 18 شهراً.",
    jur_oman:"عُمان",
    lme_h4_cbo:"البنك المركزي العُماني",
    lme_p_cbo:"قانون أنظمة الدفع وقواعد الترخيص الصادرة عن البنك المركزي العُماني لمقدمي خدمات الدفع. الربط بالمحوّل الوطني OmanNet. إطار المصرفية المفتوحة قيد التطوير. المدة المعتادة: من 9 إلى 14 شهراً.",
    lme_p_gcc_closing:"نتابع إجراءات التقديم لدى كل جهة تنظيمية ومددها الحالية ومتطلبات الوثائق وأولوياتها الرقابية. والمتقدمون الذين يلتقون الجهة التنظيمية قبل التقديم، لتوضيح النطاق والتأكد من قبول هيكل رأس المال وعرض برنامج مكافحة غسل الأموال، يحققون نتائج أفضل ومدداً أقصر من الذين يقدّمون طلباتهم دون هذا التواصل.",
    lme_link_gcc:"ناقش الترخيص في الخليج ←",
    lme_h2_eu:"الترخيص في أوروبا",
    lme_p_eu_intro:"منذ خروج المملكة المتحدة من الاتحاد الأوروبي، يحتاج نشاط الدفع الذي يخدم عملاء في المملكة المتحدة والاتحاد الأوروبي إلى ترخيصين: أحدهما من هيئة السلوك المالي في المملكة المتحدة، والآخر من جهة تنظيمية وطنية داخل الاتحاد (غالباً أيرلندا أو لوكسمبورغ أو ليتوانيا أو هولندا للشركات العاملة بالإنجليزية). ويتباعد النظامان تدريجياً. ففي الاتحاد الأوروبي ما زال التوجيه PSD2 سارياً، وقد اتُّفق على النصوص النهائية لتوجيه PSD3 ولائحة خدمات الدفع، ويُتوقع تطبيقها اعتباراً من 2028. وفي المملكة المتحدة ما زالت لوائح خدمات الدفع لعام 2017 سارية، ودخلت قواعد جديدة لحماية أموال العملاء حيز التنفيذ في مايو 2026، ويناقش البرلمان تشريعاً ينقل مهام هيئة تنظيم أنظمة الدفع إلى هيئة السلوك المالي.",
    lme_h3_fca:"المملكة المتحدة: هيئة السلوك المالي (FCA)",
    lme_p_fca:"تحتاج خدمات الدفع في المملكة المتحدة إلى ترخيص من هيئة السلوك المالي بصفة مؤسسة دفع أو مؤسسة نقود إلكترونية. ويتطلب الطلب خطة عمل مفصّلة، وتوقعات مالية لثلاث سنوات، ووثائق الحوكمة بما فيها تقييم الكفاءة والنزاهة للمديرين والمسؤولين عن إدارة خدمات الدفع، ووثائق مكافحة غسل الأموال وتمويل الإرهاب، وأدلة على أمن تقنية المعلومات والمرونة التشغيلية، وترتيبات حماية أموال العملاء.",
    lme_li_fca1:"مؤسسة دفع مرخّصة: ترخيص كامل لخدمات الدفع",
    lme_li_fca2:"مؤسسة دفع صغيرة: للشركات التي يقل متوسط حجم مدفوعاتها الشهري عن 3 ملايين يورو، وتخضع للتسجيل بدلاً من الترخيص الكامل",
    lme_li_fca3:"مؤسسة نقود إلكترونية: مطلوبة إذا كان النشاط يتضمن إصدار نقود إلكترونية",
    lme_li_fca4:"الكفاءة والنزاهة: تقيّم هيئة السلوك المالي كل مدير ومسؤول عن خدمات الدفع بشكل فردي",
    lme_h3_cbi:"الاتحاد الأوروبي: البنك المركزي الأيرلندي والجهات التنظيمية الوطنية الأخرى",
    lme_p_cbi:"تُعدّ أيرلندا خياراً شائعاً لشركات الدفع العاملة بالإنجليزية بفضل الإجراءات الراسخة لدى البنك المركزي الأيرلندي في طلبات مؤسسات الدفع، وعمق قطاع التكنولوجيا المالية في دبلن، وإمكانية الاستفادة من جواز العمل الأوروبي. وقد رخّصت ليتوانيا عدداً كبيراً من شركات التكنولوجيا المالية وتناسب بعض الشركات الأصغر، وإن أصبحت جهتها الرقابية أكثر تشدداً في السنوات الأخيرة. ويعتمد اختيار الدولة المناسبة على الأسواق المستهدفة ونموذج التشغيل ومدى قدرة الشركة على إدارة العلاقة مع الجهة التنظيمية.",
    lme_li_eu1:"ترخيص مؤسسات الدفع ومؤسسات النقود الإلكترونية بموجب PSD2 ثم PSD3 لاحقاً",
    lme_li_eu2:"إشعارات جواز العمل الأوروبي لفتح فروع أو تقديم خدمات عابرة للحدود في دول المنطقة الاقتصادية الأوروبية الأخرى",
    lme_li_eu3:"تصميم برنامج مكافحة غسل الأموال وتمويل الإرهاب وفق إرشادات الهيئة المصرفية الأوروبية والقانون الوطني والإطار الأوروبي الجديد الذي تشرف عليه هيئة مكافحة غسل الأموال الأوروبية (AMLA)",
    lme_li_eu4:"الحوكمة: تشكيل مجلس الإدارة والمديرون المستقلون ومتطلبات وظيفة الامتثال",
    lme_link_eu:"ناقش الترخيص في أوروبا ←",
    lme_h2_process:"مراحل الترخيص: ما الذي تتوقعه",
    lme_p_process_intro:"يعتمد الحصول على الترخيص على إدارة العلاقة مع الجهة التنظيمية بقدر ما يعتمد على الصياغة القانونية. فجودة خطة العمل ومصداقية فريق الإدارة والتحضير قبل التقديم لا تقل أهمية عن الوثائق الرسمية. وتفضّل الجهات التنظيمية في الخليج وأوروبا المتقدمين الذين درسوا نموذج أعمالهم جيداً ويستطيعون إثبات فهمهم للمخاطر التي ينشئها وكيفية ضبطها.",
    lme_h4_step1:"استراتيجية ما قبل التقديم",
    lme_p_step1:"اختيار فئة الترخيص، وتقييم متطلبات رأس المال، واختبار هيكل الحوكمة مقابل قواعد الكفاءة والنزاهة، وتحديد مسائل توطين البيانات والإسناد الخارجي، وإعداد عرض تمهيدي للاجتماع الأول مع الجهة التنظيمية.",
    lme_h4_step2:"إعداد الوثائق",
    lme_p_step2:"خطة العمل، والتوقعات المالية، وإطار الحوكمة، وبرنامج مكافحة غسل الأموال وتمويل الإرهاب، وأدلة أمن المعلومات والمرونة التشغيلية، وترتيبات حماية أموال العملاء، وملفات العناية الواجبة للمساهمين والمستفيدين الفعليين.",
    lme_h4_step3:"التواصل مع الجهة الرقابية",
    lme_p_step3:"اجتماعات ما قبل التقديم مع فريق الترخيص، والرد على طلبات المعلومات، والتعامل مع استفسارات الجهة التنظيمية. وفي هذه المرحلة تتأخر معظم الطلبات، والتعامل الخبير معها يقصّر المدة.",
    lme_h4_step4:"الشروط والتنفيذ",
    lme_p_step4:"يُمنح الترخيص عادةً بشروط، مثل ضخ الحد الأدنى من رأس المال وتشغيل نظام مكافحة غسل الأموال وتعيين أشخاص محددين. واستيفاء هذه الشروط بسرعة هو الخطوة الأخيرة قبل بدء النشاط.",
    lme_h4_step5:"الامتثال بعد الترخيص",
    lme_p_step5:"تقديم التقارير التنظيمية الدورية، والمراجعة السنوية لبرنامج مكافحة غسل الأموال، والإخطار بالتغييرات الجوهرية، والاستعداد للزيارات الرقابية. والشركات التي تحافظ على علاقة عمل جيدة مع جهتها التنظيمية بعد الترخيص أقل عرضة للإجراءات التنفيذية وأقدر على توسيع نموذج أعمالها لاحقاً.",
    lme_p_callout:"<strong>أسباب شائعة لرفض الطلبات:</strong> ثغرات في الإفصاح عن الملكية النفعية (سلاسل ملكية معقدة يبقى فيها المالكون غير واضحين)، ووثائق لمكافحة غسل الأموال تصف نظاماً مخططاً لا نظاماً قائماً، ورأس مال أقل من الحد الأدنى في الدولة وقت التقييم، وإغفال متطلبات توطين البيانات. نراجع الطلبات مقابل هذه النقاط قبل تقديمها.",
    lme_link_app:"ناقش طلبك ←",
    lme_h2_sandbox:"دعم البيئات التجريبية التنظيمية",
    lme_p_sandbox1:"تدير معظم البنوك المركزية الخليجية وهيئة السلوك المالي البريطانية وعدد من الجهات التنظيمية الأوروبية بيئات تجريبية أو برامج ابتكار تتيح للشركات اختبار خدمات دفع جديدة تحت الإشراف قبل التقدم بطلب ترخيص كامل. وتكون البيئة التجريبية أكثر فائدة للنماذج الجديدة مثل المدفوعات المدمجة وخدمات الشراء الآن والدفع لاحقاً وتجميع بيانات المصرفية المفتوحة ومدفوعات الأصول المشفرة، حين تكون فئة الترخيص المناسبة غير واضحة أو لم تحدد الجهة التنظيمية موقفها بعد.",
    lme_li_sandbox1:"البيئة التجريبية التنظيمية لدى البنك المركزي السعودي: لشركات التكنولوجيا المالية التي تختبر خدمات جديدة في السعودية بتصريح مؤقت",
    lme_li_sandbox2:"البيئة التجريبية التنظيمية لدى مصرف قطر المركزي: لخدمات الدفع الجديدة في قطر. يقع المقر الرئيسي لـ MENA Advisory في الدوحة ولدينا معرفة مباشرة بإجراءات هذه البيئة",
    lme_li_sandbox3:"الإمارات: البيئة التجريبية لدى المصرف المركزي، إلى جانب RegLab في سوق أبوظبي العالمي ورخصة اختبار الابتكار في مركز دبي المالي العالمي ضمن المناطق الحرة المالية",
    lme_li_sandbox4:"البيئة التجريبية التنظيمية للتكنولوجيا المالية لدى مصرف البحرين المركزي: من أوائل البيئات في الخليج، وتوفّر مساراً مبسطاً للاختبار قبل الترخيص الكامل",
    lme_li_sandbox5:"خدمات الابتكار لدى هيئة السلوك المالي: البيئة التجريبية التنظيمية والدعم المباشر وخيارات البيئة التجريبية الرقمية للشركات البريطانية",
    lme_p_sandbox2:"لا تضمن البيئة التجريبية الحصول على ترخيص كامل. لكن الشركات التي تستغل فترة الاختبار لبناء علاقتها مع الجهة التنظيمية وإثبات قدرتها التشغيلية وتحسين برنامج مكافحة غسل الأموال تدخل مرحلة الطلب الكامل في موقف أقوى بكثير.",
    lme_link_sandbox:"ناقش استراتيجية البيئة التجريبية ←",
    lme_h2_correspondent:"الوصول إلى المصرفية المراسلة",
    lme_p_corr1:"بالنسبة إلى شركات المدفوعات العابرة للحدود، الترخيص ضروري لكنه غير كافٍ. فهي تحتاج أيضاً إلى علاقات مصرفية مراسلة، أي الحسابات وعلاقات التسوية التي تُنفَّذ عبرها المدفوعات العابرة للحدود، وأصبح الحصول عليها أصعب. فخلال العقد الماضي قلّصت البنوك العالمية علاقاتها المراسلة مع شركات خدمات الأموال للحد من المخاطر، وباتت خيارات الداخلين الجدد أقل بكثير.",
    lme_p_corr2:"لفتح حساب مراسل، يجب على المتقدم إقناع البنك بأن لديه برنامجاً موثوقاً لمكافحة غسل الأموال، وأنه يفهم المخاطر في قاعدة عملائه، وأن نشاطه مجدٍ ويستطيع تحمّل تكاليف الامتثال الصحيح، وأن من يديرونه أشخاص يثق بهم فريق الامتثال في البنك. فقرار البنك تقدير لمخاطر الائتمان والامتثال، وليس إجراءً إدارياً.",
    lme_li_corr1:"تحديد البنوك المراسلة وترتيب أولوياتها حسب الممر والعملة",
    lme_li_corr2:"الاستعداد للعناية الواجبة لدى البنك: ملخص برنامج مكافحة غسل الأموال، ووثائق الملكية النفعية، وملفات الإدارة، وأدلة البنية التحتية للامتثال",
    lme_li_corr3:"التفاوض التجاري: شروط الحساب والتسعير والربط التشغيلي",
    lme_li_corr4:"بدائل عند تعذّر الوصول إلى المصرفية المراسلة التقليدية: نماذج البنوك الشريكة، ومجمّعو المدفوعات، والعلاقات مع البنوك الإقليمية",
    lme_link_corr:"ناقش الوصول إلى المصرفية المراسلة ←",
    lme_h3_cta:"هل أنت مستعد لبدء إجراءات الترخيص؟",
    lme_p_cta:"دعمت MENA Advisory إجراءات ترخيص مؤسسات الدفع لدى مصرف قطر المركزي والبنك المركزي السعودي ومصرف الإمارات العربية المتحدة المركزي ومصرف البحرين المركزي وهيئة السلوك المالي البريطانية والبنك المركزي الأيرلندي. نغطي الدورة كاملة، من استراتيجية ما قبل التقديم والتواصل مع الجهة التنظيمية إلى استيفاء الشروط، ونعرف أولويات كل جهة تنظيمية حالياً وتوقعاتها بشأن الوثائق. تحدّث معنا قبل أن تبدأ إعداد طلبك.",
    lme_cta_btn:"تواصل معنا",
    news_page_sub:"ملخص أسبوعي لإعلانات شبكات البطاقات وجهات التحصيل ومقدمي خدمات الدفع ومزودي الدفع من حساب إلى حساب والمصرفية المفتوحة وموردي الأنظمة المصرفية الأساسية والبنوك الرقمية ومنصات الإصدار ومتخصصي صرف العملات، في دول الخليج والمملكة المتحدة وأوروبا وغيرها. تُعرض العناوين بلغتها الأصلية كما نشرتها مصادرها.",
    lme_p_qcb:"لائحة خدمات الدفع (تعميم مصرف قطر المركزي رقم 23 لسنة 2021) التي تغطي النقود الإلكترونية وتحصيل مدفوعات التجار والتحويلات المحلية، إضافة إلى تنظيم الأمن السيبراني لمقدمي خدمات الدفع. توقعات صارمة بشأن استضافة البيانات والإسناد الخارجي. الربط بالشبكة الوطنية NAPS وبطاقة هميان ونظام فوران للمدفوعات الفورية، والتسوية المباشرة عبر QA-RTGS لمقدمي خدمات الدفع منذ سبتمبر 2026. تتوفر بيئة تجريبية تنظيمية لدى المصرف. المدة المعتادة للترخيص: من 6 إلى 12 شهراً.",
    stat_market:"سوق المدفوعات الرقمية في الشرق الأوسط وشمال أفريقيا بحلول 2031 (تقديري)",
    stat_disciplines:"تخصصاً استشارياً",
    stat_frameworks:"ولايات قضائية نتابعها في المحور التنظيمي",
    services_heading:"أربع خدمات أساسية",
    home_svc_sub:"من تقييم الاستثمار إلى التغيير التشغيلي، على امتداد دورة حياة المدفوعات والتكنولوجيا المالية.",
    news_heading:"أحدث التحليلات",
    ph_position:"منصبك",
    about_p1:"تأسست MENA Advisory في الدوحة في يناير 2020. وبعد أسابيع قليلة أغلقت جائحة عالمية الحدود حول العالم، فتعطّل النموذج الذي اعتمدت عليه شركات المدفوعات الخليجية في استقدام الخبرات الرفيعة من دبي ولندن ونيويورك وسنغافورة.",
    /*AR_UPDATES_ITEMS*/
  });

  let PAGE_AR = {};
  try {
    const pj = document.getElementById('i18n-ar');
    if (pj) PAGE_AR = JSON.parse(pj.textContent) || {};
  } catch (e) { PAGE_AR = {}; }
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const enStore = new WeakMap();
  const phStore = new WeakMap();
  const TITLE_EN = document.title;

  const NEWS_TAGS_AR = {
    'Global':'عالمي', 'GCC':'الخليج', 'Europe':'أوروبا', 'United Kingdom':'المملكة المتحدة', 'UK':'المملكة المتحدة',
    'Card Networks':'شبكات البطاقات', 'Acquiring & PSP':'التحصيل ومقدمو خدمات الدفع', 'A2A & Open Banking':'الدفع من حساب إلى حساب والمصرفية المفتوحة',
    'Core Banking':'الأنظمة المصرفية الأساسية', 'Digital Banks':'البنوك الرقمية', 'Issuing Platforms':'منصات الإصدار', 'FX & Cross-Border':'صرف العملات والمدفوعات عبر الحدود'
  };
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  function arFor(k) {
    const v = hasOwn(PAGE_AR, k) ? PAGE_AR[k] : AR[k];
    return (typeof v === 'string' && v !== '') ? v : null;
  }

  function applyLang(lang) {
    const isAr = lang === 'ar';
    html.setAttribute('lang', isAr ? 'ar' : 'en-GB');
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    if (langBtn) {
      langBtn.textContent = isAr ? 'EN' : 'AR';
      langBtn.setAttribute('aria-label', isAr ? 'Switch to English' : 'Switch to Arabic');
      langBtn.dataset.lang = lang;
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const isMeta = el.tagName === 'META';
      if (!enStore.has(el)) enStore.set(el, isMeta ? el.getAttribute('content') : el.innerHTML);
      const en = enStore.get(el);
      const ar = isAr ? arFor(k) : null;
      if (isMeta) { el.setAttribute('content', ar || en); return; }
      if (!ar) { if (el.innerHTML !== en) el.innerHTML = en; return; }
      const svg = el.querySelector(':scope > svg');
      el.innerHTML = ar;
      if (svg && !el.querySelector('svg')) { el.append(' '); el.appendChild(svg); }
    });
    // Arabic written inline by the weekly scripts. data-ar replaces the element's own text
    // and keeps child elements such as NEW badges; data-lang-block shows one language's copy.
    document.querySelectorAll('[data-ar]').forEach(el => {
      let tn = null;
      for (const n of el.childNodes) { if (n.nodeType === 3 && n.nodeValue.trim()) { tn = n; break; } }
      if (!tn) return;
      if (!enStore.has(tn)) enStore.set(tn, tn.nodeValue);
      const arText = el.getAttribute('data-ar');
      const enText = enStore.get(tn);
      tn.nodeValue = (isAr && arText) ? enText.match(/^\s*/)[0] + arText + enText.match(/\s*$/)[0] : enText;
    });
    document.querySelectorAll('[data-lang-block]').forEach(el => {
      const arBlock = el.getAttribute('data-lang-block') === 'ar';
      const hasAr = !!(el.parentElement && el.parentElement.querySelector(':scope > [data-lang-block="ar"]'));
      el.hidden = arBlock ? !isAr : (isAr && hasAr);
    });
    // News feed tags and dates (rows are added by the weekly news workflow, so they carry no data-i18n keys).
    document.querySelectorAll('.news-tag:not([data-i18n]), .news-row-date:not([data-i18n])').forEach(el => {
      if (!enStore.has(el)) enStore.set(el, el.textContent);
      const en = enStore.get(el);
      let v = null;
      if (isAr) {
        if (el.classList.contains('news-tag')) {
          v = NEWS_TAGS_AR[en.trim()] || null;
        } else {
          const d = en.trim().match(/^(\d{1,2}) ([A-Za-z]{3})[a-z]* (\d{4})$/);
          const i = d ? MONTHS_EN.indexOf(d[2]) : -1;
          if (i >= 0) v = d[1] + ' ' + MONTHS_AR[i] + ' ' + d[3];
        }
      }
      el.textContent = v || en;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (!phStore.has(el)) phStore.set(el, el.placeholder);
      const ar = isAr ? arFor(k) : null;
      el.placeholder = ar || phStore.get(el);
    });
    const arMeta = document.querySelector('meta[name="ar-title"]');
    const tAr = (typeof PAGE_AR.__title === 'string') ? PAGE_AR.__title : (TITLES_AR[location.pathname.replace(/index\.html$/, '')] || (arMeta && arMeta.getAttribute('content')));
    document.title = (isAr && tAr) ? tAr : TITLE_EN;
    try { localStorage.setItem('ma-lang', lang); } catch (e) {}
    if (window.__rebuildTicker) window.__rebuildTicker(lang);
  }

  const TITLES_AR = {
    '/': 'MENA Advisory | استشارات المدفوعات والتكنولوجيا المالية في الخليج والشرق الأوسط',
    '/news.html': 'أخبار قطاع المدفوعات | الخليج والمملكة المتحدة والعالم | MENA Advisory',
    '/services.html': 'خدمات استشارات المدفوعات | الخليج والشرق الأوسط | MENA Advisory',
    '/solutions.html': 'حلول استشارات المدفوعات | MENA Advisory',
    '/about.html': 'من نحن | MENA Advisory لاستشارات المدفوعات والتكنولوجيا المالية',
    '/contact.html': 'اتصل بنا | MENA Advisory',
    '/careers.html': 'الوظائف | MENA Advisory',
    '/services/digital-transformation.html': 'استشارات التحول الرقمي في المدفوعات | MENA Advisory',
    '/services/due-diligence.html': 'العناية الواجبة لشركات المدفوعات | MENA Advisory',
    '/services/electronic-payments.html': 'استشارات استراتيجية المدفوعات الإلكترونية | MENA Advisory',
    '/services/strategic-planning.html': 'التخطيط الاستراتيجي ودخول الأسواق في المدفوعات | MENA Advisory',
    '/solutions/acquiring-acceptance.html': 'استشارات استحواذ البطاقات وقبول المدفوعات | MENA Advisory',
    '/solutions/card-issuing.html': 'استشارات إصدار البطاقات وإدارة البرامج | MENA Advisory',
    '/solutions/compliance-risk.html': 'استشارات الامتثال وإدارة المخاطر في المدفوعات | MENA Advisory',
    '/solutions/digital-emerging.html': 'المدفوعات الرقمية والناشئة | MENA Advisory',
    '/solutions/fx-treasury-payments.html': 'استشارات صرف العملات ومدفوعات الخزانة | MENA Advisory',
    '/solutions/licensing-market-entry.html': 'تراخيص المدفوعات ودخول الأسواق في الخليج | MENA Advisory',
    '/solutions/payments-infrastructure.html': 'استشارات البنية التحتية للمدفوعات | MENA Advisory',
    '/404.html': 'الصفحة غير موجودة | MENA Advisory'
  };
  AR.skip_main = 'الانتقال إلى المحتوى الرئيسي';
  document.querySelectorAll('.skip-link').forEach(function (a) { if (!a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'skip_main'); });

  let savedLang = 'en';
  try { savedLang = localStorage.getItem('ma-lang') || 'en'; } catch (e) {}
  if (langBtn) {
    langBtn.dataset.lang = savedLang;
    langBtn.addEventListener('click', () => {
      const cur = langBtn.dataset.lang || 'en';
      applyLang(cur === 'en' ? 'ar' : 'en');
    });
  }
  if (savedLang !== 'en') applyLang(savedLang);

  } // end init
})();
