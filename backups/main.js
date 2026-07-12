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
  const ctaWord = document.getElementById('ctaWord');
  if (ctaWord) {
    const words = ['Achieve?', 'Accelerate?', 'Accomplish?', 'Acquire?'];
    let idx = 0;
    setInterval(() => {
      ctaWord.style.opacity = '0';
      ctaWord.style.transform = 'translateY(8px)';
      ctaWord.style.transition = 'opacity 0.28s, transform 0.28s';
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        ctaWord.textContent = words[idx];
        ctaWord.style.opacity = '1';
        ctaWord.style.transform = 'translateY(0)';
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

    let tickerData = [];
    let pos = 0;

    function buildTicker(items, lang) {
      const isAr = lang === 'ar';
      // Force LTR layout so scroll loop works correctly even when page is RTL.
      // Arabic characters still render right-to-left naturally within their spans.
      track.style.direction = 'ltr';
      if (track.parentElement) track.parentElement.style.direction = 'ltr';
      const doubled = [...items, ...items];
      track.innerHTML = doubled.map(item => {
        const tag = isAr ? (item.ar_tag || item.tag) : item.tag;
        const text = isAr ? (item.ar_text || item.text) : item.text;
        return `<span class="ticker-item"><span class="tag">${tag}</span><span class="text">${text}</span></span><span class="ticker-sep">·</span>`;
      }).join('');
    }

    window.__rebuildTicker = function (lang) {
      if (tickerData.length) {
        buildTicker(tickerData, lang);
        pos = 0;
      }
    };

    function startScroll() {
      const speed = 0.5;
      let paused = false;
      track.addEventListener('mouseenter', () => { paused = true; });
      track.addEventListener('mouseleave', () => { paused = false; });
      function animate() {
        if (!paused) {
          pos -= speed;
          const half = track.scrollWidth / 2;
          if (Math.abs(pos) >= half) pos = 0;
          track.style.transform = `translateX(${pos}px)`;
        }
        requestAnimationFrame(animate);
      }
      animate();
    }

    const TICKER_DATA = [
      {"tag":"New","text":"EU AI Act high-risk system obligations for payment and credit firms — August 2026 deadline","ar_tag":"جديد","ar_text":"التزامات الأنظمة عالية المخاطر لشركات المدفوعات والائتمان بموجب قانون الذكاء الاصطناعي الأوروبي — أغسطس 2026"},
      {"tag":"Updated","text":"Visa Agentic Ready global expansion to APAC and LatAm confirmed — Q3 2026 rollout","ar_tag":"محدّث","ar_text":"توسع Visa Agentic Ready العالمي إلى آسيا والمحيط الهادئ وأمريكا اللاتينية — الطرح في الربع الثالث 2026"},
      {"tag":"Alert","text":"PSD3 and PSR provisional political agreement reached — national transposition begins 2026","ar_tag":"تنبيه","ar_text":"التوصل إلى اتفاق سياسي مبدئي بشأن PSD3 وPSR — بدء النقل الوطني في 2026"},
      {"tag":"Insight","text":"ECB digital euro preparatory phase complete — enabling regulation expected late 2026","ar_tag":"تحليل","ar_text":"اكتمال المرحلة التحضيرية لليورو الرقمي للبنك المركزي الأوروبي — التشريع التمكيني متوقع أواخر 2026"},
      {"tag":"Regulatory","text":"SAMA Open Banking transitions from sandbox to full licensing — first fintechs licensed April 2026","ar_tag":"تنظيمي","ar_text":"انتقال الخدمات المصرفية المفتوحة لدى ساما من البيئة التجريبية إلى الترخيص الكامل — أبريل 2026"},
      {"tag":"Alert","text":"CBUAE updated AML/CFT/CPF guidance for licensed financial institutions — effective April 2026","ar_tag":"تنبيه","ar_text":"تحديث المصرف المركزي الإماراتي توجيهات مكافحة غسل الأموال وتمويل الإرهاب — ساري من أبريل 2026"},
      {"tag":"New","text":"Visa VAMP acquirer monitoring programme — new CNP fraud and dispute thresholds from January 2026","ar_tag":"جديد","ar_text":"برنامج Visa VAMP لمراقبة المقبِلين — حدود جديدة لاحتيال CNP والنزاعات من يناير 2026"},
      {"tag":"Regulatory","text":"FCA CASS 15 safeguarding rules for payment institutions — in effect May 2026","ar_tag":"تنظيمي","ar_text":"قواعد CASS 15 لحماية أموال العملاء لمؤسسات الدفع — سارية من مايو 2026"}
    ];
    tickerData = TICKER_DATA;
    buildTicker(TICKER_DATA, localStorage.getItem('ma-lang') || 'en');
    startScroll();
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
    nav_news:'المقالات', nav_insights:'المقالات', nav_careers:'الوظائف',
    nav_book:'احجز مكالمة', nav_contact:'تواصل معنا',
    hero_eyebrow:'استشارات المدفوعات والتكنولوجيا المالية — الدوحة · لندن · إسطنبول',
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
    careers_sub:'نحن شركة استشارية متخصصة في المدفوعات والتكنولوجيا المالية. عندما ننمو، ننمو بشكل متعمد — نضم أشخاصاً ذوي خبرة عميقة في المجال.',
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
    page_sub_epayments:'نغطي الطيف الكامل لطرق الدفع الإلكتروني — بطاقات، محافظ رقمية، مدفوعات فورية، تحويلات مباشرة.',
    page_sub_payments_infra:'المدفوعات المدفوعة بالذكاء الاصطناعي، القضبان الفورية، ترحيل ISO 20022، تنسيق المدفوعات وتقنيات كشف الاحتيال.',
    page_sub_acquiring:'استراتيجية الاستحواذ، إطار إدراج التجار، SoftPOS، القبول متعدد القنوات وإدارة النزاعات.',
    page_sub_compliance:'مراقبة معاملات مكافحة غسيل الأموال، تصميم برنامج اعرف عميلك، منع الاحتيال والأطر التنظيمية.',
    page_sub_digital_em:'توجيه متخصص في العملات الرقمية للبنوك المركزية والتسوية المُرمَّزة والخدمات المصرفية المفتوحة والتجارة الوكيلة.',
    page_sub_licensing:'ترخيص مؤسسات الدفع لدول مجلس التعاون الخليجي وأوروبا. QCB وSAMA وCBUAE وCBB وFCA والبنك المركزي الأيرلندي.',
    cta_discuss:'ناقش متطلباتك',
    cta_specialist:'تحدث مباشرة مع متخصص في أي من هذه المجالات.',
    reg_page_sub:'تتغير لوائح المدفوعات بوتيرة أسرع مما كانت عليه في أي وقت مضى. نتتبع التغييرات الجوهرية ونقدم المشورة للعملاء.',
    svc_page_sub:'أربعة تخصصات تعكس النظام البيئي الكامل لصناعة المدفوعات الحديثة.',
    sol_page_sub:'من التجارة المدفوعة بالذكاء الاصطناعي إلى الأصول المُرمَّزة — توجيه خبير في التقنيات التي تعيد تشكيل صناعة المدفوعات.',
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
    about_p1:'تأسست MENA Advisory في الدوحة في يناير 2020. وفي غضون أسابيع، أغلق وباء عالمي الحدود وأربك النموذج الذي كانت تعتمد عليه شركات مدفوعات دول مجلس التعاون الخليجي — استقطاب الخبرات الرفيعة من دبي ولندن ونيويورك وسنغافورة عند الطلب.',
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
    ci_p_processor1:'تغيّر سوق معالجة البطاقات جذرياً. منصات إصدار البطاقات عبر API — Marqeta وi2c وGPS وThredd والبدائل الإقليمية — أدخلت بنية تحتية أسرع نشراً وأكثر قابلية للتخصيص من الأنظمة القديمة، لكن مع مقايضات حقيقية في العمق والتغطية.',
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
    ci_p_commercial1:'برامج البطاقات التجارية — بطاقات الشركات وبطاقات الشراء والبطاقات الافتراضية لإنفاق B2B وبرامج السفر والترفيه — تعمل بمنطق تجاري مختلف عن برامج المستهلكين.',
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
    ci_p_portfolio1:'تحسين التبادل — ضمان تقديم كل معاملة بالبيانات اللازمة للتأهل لأفضل فئة — هو الرافعة الأكثر إهمالاً في إصدار البطاقات، ولا سيما للبرامج التجارية.',
    ci_p_portfolio2:'إدارة معدل الاحتيال وتخصيص خسائر الائتمان وتحسين معدل الترخيص هي الروافع الرئيسية الثلاثة الأخرى. نموذج الترخيص الذي يرفض بمحافظة مفرطة يُقلّص رضا حامل البطاقة ودخل التبادل.',
    ci_li_port_1:'تدقيق تأهيل التبادل: تحديد ثغرات تقديم البيانات التي تُفضي إلى التخفيض',
    ci_li_port_2:'تحسين استراتيجية الترخيص: رفع معدل الموافقة دون زيادة التعرض للاحتيال',
    ci_li_port_3:'مراجعة نموذج الاحتيال: معايرة رصد المعاملات وتجزئة مخاطر حامل البطاقة وتحليل معدل النزاع',
    ci_li_port_4:'تحليل ربحية المحفظة: تحليل الإيرادات والتكاليف حسب نوع البطاقة والقناة والشريحة',
    ci_li_port_5:'إدارة دورة حياة حامل البطاقة: تحسين معدل التفعيل وتحفيز الإنفاق المبكر وخفض الاستنزاف',
    ci_h3_cta:'ناقش متطلبات برنامج بطاقاتك',
    ci_p_cta:'تعمل MENA Advisory مع البنوك وشركات التكنولوجيا المالية والجهات المُصدِرة غير المصرفية في تصميم برامج البطاقات وإطلاقها وتحسينها في دول مجلس التعاون الخليجي وأوروبا. تحدث مباشرة مع متخصص.',

    // ── FX & Treasury page (fx_ prefix)
    fx_h1:'استشارات صرف العملات ومدفوعات الخزانة — دول مجلس التعاون الخليجي والشرق الأوسط',
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
    fx_p_iso1:'يمتد الإطار الزمني لانتقال SWIFT إلى ISO 20022 حتى نهاية 2025. لا تُمثّل أعمال الترحيل مجرد تحديث لتنسيق الرسالة — بل تُغيّر نطاق البيانات المنقولة مع كل دفعة، مما يُتيح إمكانات جديدة لفحص الامتثال ومعالجة الاحتيال.',
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
    fx_p_treasury2:'يختلف النهج الأمثل لبنية خزانة شركات المدفوعات عن خزانة الشركات الاعتيادية. تُشكّل متطلبات الامتثال التنظيمي — ولا سيما متطلبات الفصل في تراخيص QCB وSAMA وCBUAE وFCA — الإطار الذي يجب في ضوئه تحسين الخزانة.',
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
    dt_p_programme:'مشاركة فعّالة في مشاريع تنفيذ تقنية المدفوعات المعقدة — اختيار الموردين وتنسيق التكامل وإدارة مسار التنفيذ والانتقال إلى الإنتاج. نعمل بجانب الفرق الداخلية لضمان حوكمة البرنامج وضبط الجدول الزمني وحل المعوقات.',

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
  const enCache = {};

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
      if (!enCache[k]) {
        enCache[k] = el.getAttribute('data-en-original') || el.textContent.trim();
        el.setAttribute('data-en-original', enCache[k]);
      }
      const val = isAr ? (AR[k] || enCache[k]) : enCache[k];
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        const svg = el.querySelector('svg');
        el.textContent = val + ' ';
        if (svg) el.appendChild(svg);
      } else if (el.tagName === 'META') {
        el.setAttribute('content', val);
      } else {
        el.innerHTML = val;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (!enCache['ph_' + k]) enCache['ph_' + k] = el.placeholder;
      el.placeholder = isAr ? (AR[k] || enCache['ph_' + k]) : enCache['ph_' + k];
    });
    localStorage.setItem('ma-lang', lang);
    if (window.__rebuildTicker) window.__rebuildTicker(lang);
  }

  if (langBtn) {
    langBtn.dataset.lang = localStorage.getItem('ma-lang') || 'en';
    langBtn.addEventListener('click', () => {
      const cur = langBtn.dataset.lang || 'en';
      applyLang(cur === 'en' ? 'ar' : 'en');
    });
  }
  const savedLang = localStorage.getItem('ma-lang');
  if (savedLang && savedLang !== 'en') applyLang(savedLang);

  } // end init
})();
