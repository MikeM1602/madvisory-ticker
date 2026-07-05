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

    function buildTicker(items) {
      const doubled = [...items, ...items];
      track.innerHTML = doubled.map(item =>
        `<span class="ticker-item"><span class="tag">${item.tag}</span><span class="text">${item.text}</span></span><span class="ticker-sep">·</span>`
      ).join('');
    }

    function startScroll() {
      let pos = 0;
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

    fetch('/ticker.json?v=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.length) buildTicker(data);
      })
      .catch(() => {})
      .finally(() => startScroll());
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
    nav_sol_licensing:'الترخيص ودخول السوق', nav_regulatory:'المحور التنظيمي',nav_industry_news:'أخبار الصناعة',
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
    news_eyebrow:'مقالات', news_heading:'تفكير على حافة التكنولوجيا المالية',news_page_sub:'ملخص أسبوعي للإعلانات من شبكات البطاقات، والمحصّلين، ومقدمي خدمات الدفع، ومزودي الحساب إلى الحساب والبنوك المفتوحة، وموردي الأنظمة المصرفية الأساسية، والبنوك الرقمية، ومنصات الإصدار، ومتخصصي صرف العملات، في دول الخليج والمملكة المتحدة وأوروبا وخارجها.',news_page_eyebrow:'أخبار الصناعة',news_page_heading:'آخر التحركات في قطاع المدفوعات',
    reg_eyebrow:'المحور التنظيمي', reg_heading:'مواكبة البيئة التنظيمية المتحركة بسرعة',
    exp_eyebrow:'خبرتنا', exp_heading:'ثمانية مجالات للتخصص العميق',
    clients_eyebrow:'عملاؤنا', clients_heading:'موثوق به عبر الصناعات والحدود',
    hww_eyebrow:'نموذج التعاون', hww_heading:'كيف نعمل',
    team_eyebrow:'الفريق', team_heading:'المديرون وشبكة المستشارين',
    contact_eyebrow:'تواصل معنا', contact_heading:'كيف يمكننا مساعدتك على تحقيق أهدافك؟',
    contact_page_sub: 'تواصل مع فريقنا بشأن تحديات المدفوعات أو التكنولوجيا المالية لديك. مقرّنا في الدوحة، مع مستشارين في لندن وإسطنبول.',
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
    filter_gcc:'دول مجلس التعاون الخليجي', filter_global:'عالمي',filter_cat_all:'جميع الفئات',filter_cat_card_networks:'شبكات البطاقات',filter_cat_acquiring_psp:'التحصيل ومقدمو خدمات الدفع',filter_cat_a2a:'الحساب إلى الحساب والبنوك المفتوحة',filter_cat_core_banking:'الأنظمة المصرفية الأساسية',filter_cat_digital_banks:'البنوك الرقمية',filter_cat_issuing:'منصات الإصدار',filter_cat_fx:'صرف العملات والتحويلات عبر الحدود',
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
    // Careers page
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
    // About CTA
    about_cta:'اعمل معنا →',
    // Shared page elements
    discuss_requirements:'ناقش متطلباتك',
    discuss_sub:'تحدث مباشرة مع متخصص في أي من هذه المجالات.',
    get_in_touch:'تواصل معنا →',
    back_to_insights:'← العودة إلى المقالات',
    back_to_solutions:'← جميع الحلول',
    read_consultation:'احجز استشارة →',
    // Services pages
    svc_label_services:'الخدمات',
    page_sub_due_diligence:'تقييم مستقل لأعمال المدفوعات والتكنولوجيا المالية للمستثمرين والمستحوذين والشركاء الاستراتيجيين.',
    page_sub_strategic:'نساعد شركات المدفوعات على تحديد أين تتنافس وكيف تفوز في الأسواق المستهدفة.',
    page_sub_digital_trans:'نرشد المؤسسات المالية وشركات المدفوعات خلال مشاريع التحديث الرقمي المعقدة.',
    dt_h2_platform:'اختيار المنصات وتقييم الموردين',
    dt_p_platform:'تقييم منهجي لمنصات معالجة المدفوعات وأنظمة إدارة البطاقات ومحركات الاحتيال والتقنيات المكمّلة للمؤسسات المالية وشركات المدفوعات. نضع أطراً لمتطلبات مبنية على النموذج التشغيلي الخاص بالمؤسسة وبيئتها التنظيمية وحجم معاملاتها، ثم نقود عملية تقييم موردين منضبطة تُفضي إلى توصية اختيار قابلة للدفاع. استقلاليتنا عن موردي التقنيات تامة: لا تربطنا أي علاقة تجارية بأي مزوّد منصة.',
    dt_h2_iso:'استشارات الهجرة إلى معيار ISO 20022',
    dt_p_iso:'يتحوّل ISO 20022 إلى المعيار الافتراضي لرسائل المدفوعات عالية القيمة والعابرة للحدود على مستوى العالم. مع تشديد سويفت لمتطلبات ترجمة رسائل MT القديمة، تتصاعد الضغوط نحو الترقية. نساعد مؤسسات الدفع في تحديد نطاق برامج الهجرة وتقييم تعقيد التكامل وإدارة اختيار موردي أدوات الهجرة، والتعامل مع التحديات التقنية والتشغيلية للانتقال، بما في ذلك مخاطر اقتطاع البيانات والتنسيق مع البنوك المراسلة.',
    dt_h2_programme:'إدارة البرامج وتسليم التكامل',
    dt_p_programme:'مشاركة فعّالة في برامج تطبيق تقنيات الدفع: مراجعة مخرجات الموردين وإدارة مسارات التكامل وحل النزاعات التقنية والتجارية مع شركاء التنفيذ، وضمان الاستمرارية في الخبرة التقنية والتنظيمية طوال دورة التسليم. دعمنا مؤسسات تبيّن فيها عدم ملاءمة اختيار المورد الأولي، فاستلزم البرنامج إعادة تحديد النطاق وإعادة الانطلاق مع شريك تنفيذ جديد.',
    page_sub_epayments:'نغطي الطيف الكامل لطرق الدفع الإلكتروني — بطاقات، محافظ رقمية، مدفوعات فورية، تحويلات مباشرة.',
    ep_h2_card:'استراتيجية مخططات البطاقات واقتصادياتها',
    ep_p_card:'استشارات في تصميم برامج البطاقات واختيار معالجي المدفوعات واعتبارات العضوية في المخططات بما فيها العضوية الرئيسية، وتحسين الرسوم البينية وإدارة المحافظ للبطاقات الاستهلاكية والتجارية. نمتلك معرفة معمّقة بآليات عمل Visa وMastercard ومدى وBENEFIT والمخططات المحلية من الناحية التجارية، وكيفية التعامل مع قواعد المخططات وعمليات الاعتماد. تتراوح مشاركاتنا بين تصميم برامج بطاقات جديدة لمصدري التقنية المالية ومراجعات المحافظ للبنوك الراسخة.',
    ep_h2_instant:'المدفوعات الفورية والشبكات اللحظية',
    ep_p_instant:'أطلقت دول مجلس التعاون الخليجي عدة شبكات دفع فوري في السنوات الأخيرة؛ سريع في المملكة العربية السعودية وآني في الإمارات وQPay في قطر، ولكلٍّ منها مواصفات تقنية ومتطلبات سيولة وخصائص احتيال مميّزة. وفي أوروبا، جعلت لائحة المدفوعات الفورية الأوروبية تحويل SEPA الائتماني الفوري إلزامياً للبنوك في منطقة اليورو. نقدم المشورة لمؤسسات الدفع بشأن متطلبات الاتصال والالتزامات التنظيمية وإدارة السيولة اليومية وضوابط الاحتيال الخاصة بالمدفوعات اللحظية غير القابلة للرجوع.',
    ep_h2_wallet:'المحافظ الرقمية والمدفوعات عبر الجوال',
    ep_p_wallet:'استشارات استراتيجية وتطبيقية لبرامج المحافظ الرقمية وقبول المدفوعات عبر الجوال ونشر بنية الدفع برمز QR. نغطي تكامل المُصدِر مع Apple Pay وGoogle Pay واتفاقيات مخطط Samsung Pay وبرامج المحافظ الإقليمية وبنية قبول QR المنتشرة في أسواق دول مجلس التعاون. وللمُحصِّلين والتجار، نُقيّم اقتصاديات قبول المحافظ قياساً بمعاملات البطاقات والمتطلبات التقنية لقبول المدفوعات متعدد القنوات.',
    // Solutions pages
    page_sub_payments_infra:'المدفوعات المدفوعة بالذكاء الاصطناعي، القضبان الفورية، ترحيل ISO 20022، تنسيق المدفوعات وتقنيات كشف الاحتيال.',
    page_sub_acquiring:'استراتيجية الاستحواذ، إطار إدراج التجار، SoftPOS، القبول متعدد القنوات وإدارة النزاعات.',
    page_sub_compliance:'مراقبة معاملات مكافحة غسيل الأموال، تصميم برنامج اعرف عميلك، منع الاحتيال والأطر التنظيمية.',
    page_sub_digital_em:'توجيه متخصص في العملات الرقمية للبنوك المركزية والتسوية المُرمَّزة والخدمات المصرفية المفتوحة والتجارة الوكيلة.',
    page_sub_licensing:'ترخيص مؤسسات الدفع لدول مجلس التعاون الخليجي وأوروبا. QCB وSAMA وCBUAE وCBB وFCA والبنك المركزي الأيرلندي.',
    // CTA strip
    cta_discuss:'ناقش متطلباتك',
    cta_specialist:'تحدث مباشرة مع متخصص في أي من هذه المجالات.',
    // Regulatory hub
    reg_page_sub:'تتغير لوائح المدفوعات بوتيرة أسرع مما كانت عليه في أي وقت مضى. نتتبع التغييرات الجوهرية ونقدم المشورة للعملاء.',
    // Services/solutions landing
    svc_page_sub:'أربعة تخصصات تعكس النظام البيئي الكامل لصناعة المدفوعات الحديثة.',
    sol_page_sub:'من التجارة المدفوعة بالذكاء الاصطناعي إلى الأصول المُرمَّزة — توجيه خبير في التقنيات التي تعيد تشكيل صناعة المدفوعات.',
    // Insights
    insights_page_sub:'تحليلات وتعليقات حول تنظيم المدفوعات والتكنولوجيا الناشئة في دول الخليج والشرق الأوسط وأوروبا.',
    // 404
    page_not_found:'الصفحة غير موجودة',
    page_not_found_sub:'الصفحة التي تبحث عنها غير موجودة أو ربما انتقلت. جرّب أحد الروابط أدناه أو عد إلى الصفحة الرئيسية.',
    go_home:'← الرئيسية',

  // ── Career listing keys ────────────────────────────────────────────────────
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

  // ── Added 2026-06-15: missing translations ─────────────────────────────

  // Services page cards
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

  // Solutions page sub-text
  sol_infra_sub:'الذكاء الاصطناعي، القضبان الفورية، ISO 20022، التنسيق',
  sol_acquiring_sub:'إدراج التجار، SoftPOS، النزاعات',
  sol_compliance_sub:'مكافحة غسيل الأموال، اعرف عميلك، الاحتيال، الأطر التنظيمية',
  sol_digital_sub:'العملات الرقمية للبنوك المركزية، الترميز، الخدمات المصرفية المفتوحة، الوكلاء',
  sol_licensing_sub:'QCB، SAMA، CBUAE، CBB، FCA',

  // Contact form placeholders
  ph_name:'اسمك الكامل',
  ph_position:'منصبك',
  ph_company:'مؤسستك',
  ph_email:'you@company.com',
  ph_tel:'+1 234 567 8900',
  ph_enquiry:'صِف تحديك أو سؤالك...',

  // 404 page buttons
  not_found_contact:'تواصل معنا',
  not_found_insights:'المقالات',
  not_found_services:'الخدمات',

  // Homepage about body paragraphs
  about_p1:'تأسست MENA Advisory في الدوحة في يناير 2020. وفي غضون أسابيع، أغلق وباء عالمي الحدود وأربك النموذج الذي كانت تعتمد عليه شركات مدفوعات دول مجلس التعاون الخليجي — استقطاب الخبرات الرفيعة من دبي ولندن ونيويورك وسنغافورة عند الطلب.',
  about_p2:'نحن مؤسسة استشارية دولية مستقلة تعمل حصرياً في قطاع المدفوعات والتكنولوجيا المالية. ننطلق من الدوحة ولندن وإسطنبول لنقدّم المشورة للمؤسسات المالية وكبار تجار التجزئة وشركات إدارة السفر والمستحوذين وشركات التكنولوجيا المالية والجهات الحكومية في منطقة دول مجلس التعاون الخليجي والشرق الأوسط وشمال أفريقيا وأوروبا.',
  about_p3:'استقلاليتنا خيار مقصود. لا تربطنا أي علاقات مع موردين أو شركاء تقنيين من شأنها أن تُخلّ بموضوعية مشورتنا. كل توصية تُبنى على ما هو الأنسب لنموذج عمل العميل وبيئته التنظيمية وأهدافه التجارية.',

  // Homepage services card descriptions
  home_svc_due_sub:'تقييم تقني وتنظيمي مستقل',
  home_svc_due_body:'تقييم مستقل لأعمال المدفوعات والتكنولوجيا المالية للمستثمرين والمستحوذين والشركاء الاستراتيجيين.',
  home_svc_strategy_sub:'استراتيجية دخول السوق والنمو',
  home_svc_strategy_body:'تحليل دخول السوق وملاءمة المنتج للسوق والتموضع التنافسي واستراتيجية الوصول لشركات المدفوعات.',
  home_svc_digital_sub:'تحديث المدفوعات',
  home_svc_digital_body:'اختيار المنصة وإدارة التكامل وترحيل ISO 20022 وإدارة التغيير التشغيلي.',
  home_svc_epay_sub:'تغطية كاملة لوسائل الدفع',
  home_svc_epay_body:'البطاقات والمحافظ الرقمية والمدفوعات الفورية وتحويلات A2A وحلول الدفع بدون تلامس في دول الخليج والشرق الأوسط وأوروبا.',
  home_svc_explore:'استكشف ←',
  nav_sol_card_issuing: 'إصدار البطاقات وإدارة البرامج',
  nav_sol_fx: 'مدفوعات العملات الأجنبية والخزينة',

  fx_h1: 'مدفوعات العملات الأجنبية والخزينة',
  fx_cta_discuss: 'ناقشنا هذا الحلّ ←',
  fx_cta_all_sol: 'جميع الحلول',
  fx_h2_gcc: 'سياق المدفوعات العابرة للحدود في دول مجلس التعاون',
  fx_p_gcc1: 'تُعدّ تدفقات المدفوعات العابرة للحدود في منطقة مجلس التعاون الخليجي من أعلى المعدلات عالمياً قياساً بالناتج المحلي الإجمالي، إذ تُشكّل التحويلات الخارجية والتجارة الدولية وتدفقات الاستثمار ثلاث قنوات رئيسية للمدفوعات تعمل في ظل بيئة تنظيمية تزداد تطوراً.',
  fx_stat_remit: 'التحويلات الخارجية السنوية لدول مجلس التعاون',
  fx_stat_trade: 'تدفقات تمويل التجارة السنوية لدول مجلس التعاون',
  fx_stat_curr: 'عملات مجلس التعاون: جميعها مرتبطة بالدولار الأمريكي',
  fx_p_gcc2: 'يواجه أمناء الخزينة في الشركات تحديات عملية في المدفوعات العابرة للحدود من دول مجلس التعاون، أبرزها: تجزئة علاقات البنوك المراسلة، والتفاوت في قواعد التحقق من هوية المستفيد، ومتطلبات الامتثال لمبادئ اعرف عميلك في الأسواق المستقبِلة.',
  fx_p_gcc3: 'تواجه مؤسسات الدفع وشركات التقنية المالية التي تقدّم خدمات المدفوعات العابرة للحدود متطلبات ترخيص متباينة عبر ولايات قضائية متعددة، إلى جانب التزامات قاعدة السفر المتعلقة بـ FATF وصعوبات التكامل مع منصات مزودي السيولة.',
  fx_discuss_gcc: 'ناقشنا متطلباتك ←',
  fx_h2_swift: 'SWIFT GPI والهجرة إلى معيار ISO 20022',
  fx_p_swift1: 'أصبحت خدمة SWIFT للابتكار في المدفوعات العالمية (GPI) المعيارَ القياسي للمدفوعات المؤسسية العابرة للحدود، إذ توفّر تتبّع المدفوعات في الوقت الفعلي وشفافية الرسوم وتحسين سرعة التسوية. ومع ذلك، يتباين توافر GPI ودرجة التكامل معه تبايناً كبيراً بين البنوك المراسلة في منطقة مجلس التعاون.',
  fx_h3_iso: 'ISO 20022: الوضع الراهن والالتزامات',
  fx_p_iso1: 'انتهت مرحلة التعايش مع معيار ISO 20022 في SWIFT في نوفمبر 2025. وباتت رسائل MX معيار ISO 20022 مطلوبة لجميع رسائل SWIFT عالية القيمة. المؤسسات التي لم تُكمل هجرتها تواجه خطر تدهور جودة البيانات واحتمال رفض المعاملات.',
  fx_p_iso2: 'الفجوة العملية التي تُحدثها هجرة ISO 20022 للمؤسسات غير الممتثلة: عدم القدرة على إرسال أو استقبال حقول البيانات المنظّمة التي بات الشركاء الامتثاليون يتوقعون تلقّيها.',
  fx_li_iso_1: 'تقييم جاهزية الهجرة إلى ISO 20022: تحليل الفجوات مقابل متطلبات رسائل MX واحتياجات حقول البيانات المنظّمة',
  fx_li_iso_2: 'إكمال حقول البيانات المنظّمة: امتثال رمز LEI وكود الغرض وهيكل العنوان لمتطلبات ISO 20022',
  fx_li_iso_3: 'معايرة فحص العقوبات لبيانات ISO 20022 المنظّمة: تقليل النتائج الإيجابية الكاذبة مع الحفاظ على دقة الفحص',
  fx_li_iso_4: 'تقييم وتحسين اتصال GPI: تكامل التتبع وشفافية الرسوم وأداء بنك المراسل',
  fx_discuss_swift: 'ناقشنا SWIFT GPI / ISO 20022 ←',
  fx_h2_multicurr: 'استراتيجية التسوية متعددة العملات',
  fx_p_multicurr1: 'لمؤسسات الدفع وشركات التقنية المالية التي تقدّم خدمات الدفع متعددة العملات: تحديد العملات التي تُسوَّى مباشرةً، وتلك التي تُحتاز أو تُحوَّل، والعملات التي تُوفَّر عبر علاقات سيولة من أطراف ثالثة — هذه القرارات تؤثر مباشرةً على هوامش FX وأوقات التسوية وتكاليف التمويل الأساسية.',
  fx_h3_fxrisk: 'إدارة مخاطر العملات الأجنبية لشركات الدفع',
  fx_p_fxrisk1: 'شركة الدفع التي تُحدّد سعر تحويل للعميل عند البدء وتُسوّي مع البنوك المراسلة في وقت لاحق تتحمّل مخاطر العملات الأجنبية — في كثير من الأحيان دون أطر رسمية لقياس هذا التعرّض أو التحوّط منه.',
  fx_li_fx_1: 'قياس مخاطر تعرّض العملات الأجنبية: تحليل القيمة في المخاطر على مستوى المحفظة حسب أزواج العملات ومناطق التسوية',
  fx_li_fx_2: 'تصميم استراتيجية التحوّط: العقود الآجلة والخيارات والتحوّط الطبيعي عبر مطابقة عملات الأصول والخصوم',
  fx_li_fx_3: 'اختيار الطرف المقابل في الخزينة: مقارنة بين مكاتب FX في البنوك ومزودي FX المتخصصين واستراتيجيات التفاوض',
  fx_li_fx_4: 'البنية التحتية للحسابات متعددة العملات: هياكل التجميع والحسابات الافتراضية وتحسين التسوية',
  fx_h3_gcc_fx: 'اعتبارات العملات الأجنبية الخاصة بمجلس التعاون الخليجي',
  fx_p_gcc_fx1: 'تحافظ جميع عملات دول مجلس التعاون الست على ربطها بالدولار الأمريكي، مما يُلغي مخاطر العملات الأجنبية داخل المنطقة للمعاملات الإقليمية، غير أنه يُوجِد ديناميكيات محددة في تدفقات الدولار والتحوّط في المعاملات خارج المنطقة.',
  fx_p_gcc_fx2: 'منصة mBridge والبنية التحتية للتسوية المستقبلية: تستهدف منصة mBridge متعددة الأطراف للعملة الرقمية للبنوك المركزية — بمشاركة الإمارات والمملكة العربية السعودية وهونغ كونغ والصين — تحسين كفاءة التسوية العابرة للحدود، مما قد يُعيد تشكيل ديناميكيات السيولة لمؤسسات الدفع في منطقة مجلس التعاون.',
  fx_discuss_fx: 'ناقشنا استراتيجية العملات الأجنبية ←',
  fx_h2_treasury: 'مدفوعات الخزينة للشركات',
  fx_p_treasury1: 'الشركات الكبرى في دول مجلس التعاون — ولا سيما تلك العاملة في قطاعات الطاقة والإنشاء والخدمات الحكومية — تُدير تدفقات مدفوعات عابرة للحدود بمليارات الدولارات عبر علاقات بنكية متعددة وأنظمة ERP وعمليات خزينة مُجزَّأة.',
  fx_p_treasury2: 'تعالج إدارة مدفوعات الخزينة للشركات هذا التشتّت من خلال توحيد تدفقات الدفع وإدارة علاقات البنوك والامتثال لمتطلبات الشفافية في تحويل الأموال العابرة للحدود.',
  fx_h3_factory: 'مصنع الدفع والخزينة الداخلية',
  fx_p_factory1: 'يوجّه هيكل مصنع الدفع جميع تعليمات الدفع العابرة للحدود للمجموعة إلى كيان مركزي واحد، مما يُتيح التفاوض على الأسعار الجماعية وتوحيد الامتثال وتحسين إدارة السيولة عبر كيانات المجموعة.',
  fx_li_treas_1: 'تقييم جدوى مصنع الدفع: تحليل الحجم وهيكل الكيانات القانونية وتحليل التكلفة والعائد',
  fx_li_treas_2: 'تصميم هيكل الخزينة الداخلية: إطار الإقراض بين الشركات والتجميع الاسمي وبنية الحساب الرئيسي',
  fx_li_treas_3: 'ترشيد المجموعة البنكية: تصميم RFP واختيار البنك الشريك وتحسين بنية الحساب',
  fx_li_treas_4: 'تكامل ERP: تهيئة وحدات الدفع في SAP وOracle وMicrosoft Dynamics واتصال Swift وتحسين STP',
  fx_li_treas_5: 'تكامل فحص العقوبات: قوائم عقوبات OFAC والأمم المتحدة والاتحاد الأوروبي وQCB/SAMA/CBUAE والامتثال لمتطلبات البيانات المنظّمة في ISO 20022',
  fx_discuss_treas: 'ناقشنا مدفوعات الخزينة ←',
  fx_h3_cta: 'ناقشنا متطلبات مدفوعات العملات الأجنبية والخزينة',
  fx_p_cta: 'تقدّم MENA Advisory المشورة للبنوك ومؤسسات الدفع وأمناء خزينة الشركات في مجال تحسين عمليات الدفع العابرة للحدود وهجرة ISO 20022 وإدارة مخاطر العملات الأجنبية وتحوّلات بنية خزينة الشركات.',

  ci_h1: 'إصدار البطاقات وإدارة البرامج',
  ci_cta_discuss: 'ناقشنا هذا الحلّ ←',
  ci_cta_all_sol: 'جميع الحلول',
  ci_h2_design: 'تصميم برنامج البطاقة',
  ci_p_design1: 'برنامج البطاقة ليس فئة منتج بسيطة: إنه مجموعة مترابطة من القرارات التجارية والتقنية والتنظيمية التي تُحدّد أداء البرنامج على مدار سنوات.',
  ci_p_design2: 'كل قرار من هذه القرارات يتفاعل مع غيره بطرق لا تكون واضحة دائماً في مرحلة التصميم المبدئي.',
  ci_p_design3: 'نعمل مع البنوك وشركات التقنية المالية والجهات المُصدِرة غير المصرفية في مرحلة تصميم البرنامج لتحديد هيكل البرنامج الأمثل قبل اتخاذ الالتزامات مع المعالجين والمخططات والشركاء.',
  ci_li_design_1: 'هيكل البرنامج: نوع البطاقة والمخطط وشريحة العملاء والنموذج التجاري',
  ci_li_design_2: 'نمذجة الاقتصاديات الوحدوية: دخل الرسوم البينية وتكاليف المعالج وخسائر الاحتيال وتكاليف المكافآت وهوامش صافي الربح',
  ci_li_design_3: 'التصنيف التنظيمي: ترخيص مصرفي مقابل ترخيص نقود إلكترونية مقابل رعاية BIN',
  ci_li_design_4: 'استراتيجية الذهاب إلى السوق: نموذج التوزيع وقنوات الشراكة واستراتيجية اكتساب العملاء',
  ci_discuss: 'ناقشنا هذا ←',
  ci_h2_processor: 'اختيار معالج البطاقات',
  ci_p_processor1: 'تغيّر سوق معالجة البطاقات تغيّراً جوهرياً منذ العصر الذي كان فيه البنك مقيّداً من الناحية التقنية بمعالج واحد.',
  ci_p_processor2: 'اختيار المعالج لبرنامج البطاقة هو أحد أكثر قرارات التكنولوجيا تأثيراً في مسيرة البرنامج، إذ يُحدّد القدرات المتاحة وسرعة الوصول إلى السوق والهيكل التجاري طوال فترة العقد.',
  ci_h4_apifirst: 'منصات API-First للتقنية المالية',
  ci_p_apifirst: 'Marqeta وi2c وThredd وPomelo: مصمّمة لتحقيق قدر عالٍ من التخصيص والتمويل المدمج وشركات التقنية المالية التي تحتاج إلى تحكّم دقيق في المعاملات.',
  ci_h4_tier1: 'معالجو الصف الأول الراسخون',
  ci_p_tier1: 'TSYS (Global Payments) وFIS وFiserv: وظائف متعمّقة لمنتجات البنوك المعقدة وبرامج البطاقات الضخمة المنتشرة في أسواق متعددة.',
  ci_h4_regional: 'معالجو منطقة الخليج الإقليميون',
  ci_p_regional: 'Network International وMagnati (الإمارات) والمعالجون المتصلون بمدى (المملكة العربية السعودية): مُحسَّنون للمتطلبات التنظيمية المحلية وقواعد المخططات الإقليمية والتشغيل البيني مع الشبكات المحلية.',
  ci_h4_embedded: 'البنية التحتية لإصدار البطاقات المدمجة',
  ci_p_embedded: 'Stripe Issuing وAdyen Issuing وRailsr: مصمّمة لمنصات SaaS والأسواق الرقمية والمؤسسات التي تُضمّن وظائف بطاقات في منتجاتها الأساسية.',
  ci_p_processor3: 'تشمل مشاركاتنا في اختيار المعالج: تحديد المتطلبات ووضع معايير التقييم وإدارة عملية RFP والتفاوض على الشروط التجارية.',
  ci_li_proc_1: 'تحديد المتطلبات عبر وظائف المعالجة ودعم المخطط والتوافر الإقليمي والتكامل مع الأنظمة الأساسية',
  ci_li_proc_2: 'تصميم RFP وإطار تقييم النقاط المُعيَّر وفق أولويات البرنامج',
  ci_li_proc_3: 'التحقق المستقل من المراجع مع تطبيقات مماثلة لمشروع العميل',
  ci_li_proc_4: 'التفاوض على الشروط التجارية: رسوم المعالجة وتكاليف كل تفويض والحجم الأدنى وشروط العقد',
  ci_li_proc_5: 'تخطيط الانتقال للبرامج المهاجرة من معالج حالي',
  ci_h2_bin: 'رعاية BIN وعضوية المخطط',
  ci_p_bin1: 'إصدار بطاقة Visa أو Mastercard يستلزم الحصول على رقم تعريف البنك (BIN) الذي يُتيح معالجة المعاملات. المنظمات التي لا تحمل عضوية مباشرة في المخطط تصل إليه عبر بنك راعٍ.',
  ci_p_bin2: 'الاختيار بين هذه المسارات ليس مجرد تساؤل عن التكلفة — وإن كانت التكلفة عاملاً محورياً — بل ينطوي على تبعات تشغيلية وتنظيمية وتجارية تمتد آثارها على مدار سنوات.',
  ci_li_bin_1: 'هيكل رعاية BIN: اختيار البنك الراعي والشروط التعاقدية وهياكل توزيع المسؤولية وأُطر الامتثال',
  ci_li_bin_2: 'تقييم عضوية المخطط: عضوية رئيسية مقابل تابعة ومتطلبات رأس المال والمعايير التقنية وجداول الاعتماد',
  ci_li_bin_3: 'المشاركة في المخططات المحلية: مدى (المملكة العربية السعودية) وBENEFIT (البحرين/الإقليمية) وشبكة NAPS (قطر) وضوابط محتوى رمز الدولة',
  ci_li_bin_4: 'اختيار منتجات برامج المخطط: Visa Commercial Solutions وMastercard Business وبرامج السفر والمكافآت والمتطلبات التقنية المرتبطة بها',
  ci_h2_commercial: 'برامج البطاقات التجارية',
  ci_p_commercial1: 'برامج البطاقات التجارية — بطاقات الشركات وبطاقات الشراء والبطاقات الافتراضية لمدفوعات B2B — تختلف اختلافاً جوهرياً عن برامج بطاقات المستهلكين في هيكلها الائتماني وأُطر إدارة الإنفاق ومتطلبات تكامل ERP.',
  ci_p_commercial2: 'تتمحور قيمة البطاقات التجارية للشركات حول رؤية الإنفاق والتحكّم فيه وتحسين رأس المال العامل والكفاءة الإدارية في عمليات دفع B2B.',
  ci_h3_virtual: 'برامج البطاقات الافتراضية',
  ci_p_virtual1: 'إصدار البطاقات الافتراضية: أرقام بطاقات أحادية الاستخدام أو متعددة الاستخدام تُولَّد برمجياً لأغراض شراء محددة — تُلغي احتيال بطاقات الشركات المادية وتُمكّن من ضوابط إنفاق دقيقة على مستوى المعاملة.',
  ci_p_virtual2: 'لشركات التقنية المالية والشركات الخليجية التي تبني برامج بطاقات افتراضية، يُحدّد اختيار المعالج نطاقَ التخصيص المتاح: قيود حجم المعاملة والفئة والتاجر وإمكانات التكامل مع ERP.',
  ci_li_comm_1: 'تصميم برنامج البطاقة التجارية: الهيكل الائتماني وضوابط الإنفاق والتكامل مع ERP وإطار إعداد تقارير المصاريف',
  ci_li_comm_2: 'تقديم بيانات Level 2 وLevel 3: متطلبات الأهلية والتطبيق التقني ومراجعات مؤهّلات الرسوم البينية',
  ci_li_comm_3: 'هيكل برنامج البطاقة الافتراضية: أحادية الاستخدام مقابل متعددة الاستخدام وضوابط كل معاملة وبروتوكولات تسليم أرقام البطاقات',
  ci_li_comm_4: 'تصميم برنامج المكافآت: هياكل حدود الإنفاق ومعدلات الاسترداد المُعجَّلة حسب الفئة وأطر تحسين الرسوم البينية',
  ci_li_comm_5: 'استراتيجية السفر والمصاريف: تكامل البطاقة المُجمَّعة وشراكات شركات إدارة السفر والإطار التقني',
  ci_h2_portfolio: 'إدارة المحافظ وتحسين الرسوم البينية',
  ci_p_portfolio1: 'محفظة البطاقات التي صُمِّمت وأُطلقت بشكل صحيح ستُواجه تحديات في الأداء مع مرور الوقت دون إدارة مستمرة لمؤشرات تشغيل البطاقة.',
  ci_p_portfolio2: 'إدارة معدل الاحتيال وتكوين احتياطيات خسائر الائتمان وتحسين معدل الموافقة — كلها تحمل تبعات مباشرة على المراكز التنافسية والنتائج المالية.',
  ci_li_port_1: 'مراجعة أهلية الرسوم البينية: تحديد الثغرات في تقديم البيانات التي تُفضي إلى تصنيفات رسوم بينية دون المستوى الأمثل',
  ci_li_port_2: 'تحسين استراتيجية التفويض: تحسين معدل الموافقة دون زيادة التعرّض للاحتيال أو الخسائر الائتمانية',
  ci_li_port_3: 'مراجعة نموذج الاحتيال: معايرة رصد المعاملات وتقسيم مخاطر حاملي البطاقات وتكاليف المراجعة اليدوية',
  ci_li_port_4: 'تحليل ربحية المحفظة: تفصيل الإيرادات والتكاليف حسب نوع البطاقة والقطاع والمنطقة الجغرافية',
  ci_li_port_5: 'إدارة دورة حياة حامل البطاقة: تحسين معدل التفعيل وتحفيز الإنفاق المبكر واستراتيجيات الاحتفاظ',
  ci_h3_cta: 'ناقشنا متطلبات برنامج بطاقتك',
  ci_p_cta: 'تعمل MENA Advisory مع البنوك وشركات التقنية المالية والجهات المُصدِرة غير المصرفية في تصميم برامج البطاقات وإطلاقها وتحسين محافظ البطاقات القائمة في منطقة دول مجلس التعاون والأسواق الأوروبية.',
  lme_h1: 'الترخيص ودخول السوق',
  lme_h2_gcc: 'جهات الترخيص في دول مجلس التعاون الخليجي',
  lme_p_gcc_intro: 'يمتلك كل بنك مركزي في دول مجلس التعاون الخليجي إطاره التنظيمي الخاص لترخيص مزودي خدمات الدفع، بمتطلبات رأس مال مستقلة ومعايير حوكمة وتوقعات برامج مكافحة غسل الأموال وتمويل الإرهاب وأساليب رقابية متباينة. يستلزم الترخيص في ولاية قضائية واحدة لا يُعطي صلاحية تلقائية للعمل في بلد آخر؛ وكل سوق يتطلب تقييماً مستقلاً وغالباً تقديم طلب منفصل.',
  lme_h4_qcb: 'مصرف قطر المركزي (QCB)',
  lme_p_qcb: 'قانون أنظمة الدفع رقم 15 لسنة 2021. فئتا مزود خدمات الدفع A وB؛ ورخصة بيت الصرافة. إلزامية توطين البيانات. اشتراطات مخطط Himyan QR للتجار. المدة المعتادة للحصول على الترخيص: 6–12 شهراً عبر المرحلة التمهيدية ومرحلة المراجعة التفصيلية.',
  lme_h4_sama: 'مؤسسة النقد العربي السعودي (SAMA)',
  lme_p_sama: 'لوائح مزودي خدمات الدفع. هيكل ترخيص متدرج (المستويات 1–4) حسب نطاق الخدمة. اشتراطات المشاركة في مخطط مدى. متطلبات الإقامة البيانية داخل المملكة. اشتراطات الحوكمة بموجب التعميم 472047719. المدة المعتادة: 9–18 شهراً من تاريخ تقديم الطلب الكامل.',
  lme_h4_cbuae: 'مصرف الإمارات العربية المتحدة المركزي (CBUAE)',
  lme_p_cbuae: 'فئتا رخصة منشأة القيمة المخزنة ومزود خدمات الدفع. الاتصال بنظام آني للمدفوعات الفورية. متطلبات مكافحة غسل الأموال الصادرة في أبريل 2026. الإطار التنظيمي للعملات المستقرة ساري المفعول منذ يونيو 2024. الإمارات فئتان: أبوظبي وإمارات أخرى ضمن نطاق CBUAE، إلى جانب متطلبات ADGM وDIFC المنفصلة.',
  lme_h4_cbb: 'مصرف البحرين المركزي (CBB)',
  lme_p_cbb: 'رخصة مشغل نظام الدفع ومزود خدمات الدفع. متطلبات مخطط BENEFIT وBENEFITPAY. منهجية المركز المالي للإشراف. الشركات المُدرجة في قائمة المختبر التنظيمي للتقنية المالية تخضع لمتطلبات ترخيص مبسطة للفترة الأولى. المدة المعتادة: 6–9 أشهر.',
  lme_h4_cbk: 'بنك الكويت المركزي (CBK)',
  lme_p_cbk: 'لوائح أنظمة الدفع والتحويلات المالية. تعامل انتقائي مع التراخيص التجارية الجديدة في قطاع مزودي خدمات الدفع مقارنةً بالأسواق الأخرى في مجلس التعاون. يُشكّل وجود حصة مصرفية محلية وأفضلية تقديمًا أفضل. المدة المعتادة: 12–18 شهراً.',
  lme_h4_cbo: 'البنك المركزي العُماني (CBO)',
  lme_p_cbo: 'لوائح مزودي خدمات الدفع الصادرة في 2021. فئات الترخيص قيد التطور المستمر في الإطار التنظيمي. دراسات جدوى اقتصادية أكثر صرامة من المعتاد مطلوبة. مناسب للمؤسسات التي تمتلك شراكات محلية ذات معنى بالفعل.',
  lme_p_gcc_closing: 'ننصح موكلينا عادةً بالبدء في تقديم طلب واحد إلى جهتين أو ثلاث جهات بناءً على تحليل المخاطر التنظيمية وجاهزية السوق وتسلسل رأس المال، بدلاً من السعي للحصول على ترخيص في جميع دول مجلس التعاون في آنٍ واحد.',
  lme_h2_eu: 'دخول الأسواق الأوروبية والبريطانية',
  lme_p_eu_intro: 'يلجأ عدد من موكلينا من مجلس التعاون الخليجي إلى إضافة قدرات أوروبية أو بريطانية، إما لخدمة عملائهم القادمين من المملكة المتحدة وأوروبا الباحثين عن خدمات في منطقة الخليج، أو لإنشاء حضور في سوق ثانوي يتيح لهم التوسع في أسواق أوروبية أخرى.',
  lme_h3_fca: 'هيئة السلوك المالي البريطانية (FCA)',
  lme_p_fca: 'المؤسسة المرخصة للدفع أو مؤسسة النقد الإلكتروني مطلوبة لمعظم أنشطة الدفع والصرف. خروج المملكة المتحدة من الاتحاد الأوروبي يعني انتهاء التعامل بالجواز الأوروبي؛ وتتطلب الخدمات التي تستهدف عملاء في الاتحاد الأوروبي وجوداً مستقلاً في إحدى دول الاتحاد.',
  lme_li_fca1: 'فئات الترخيص: مؤسسة الدفع المُعتمدة أو الصغيرة، أو مؤسسة النقد الإلكتروني المُعتمدة أو الصغيرة، تبعاً للحجم والخدمة',
  lme_li_fca2: 'جدول رأس المال: 125,000 جنيه إسترليني (EMI المعتمدة) أو 350,000 جنيه (API المعتمدة) أو 20,000 جنيه إسترليني (المؤسسات الصغيرة)',
  lme_li_fca3: 'متطلبات البنية التحتية في المملكة المتحدة: مدير من ذوي النفوذ الكافي مقيم في المملكة المتحدة، ومتطلبات الإقامة للوظائف القيادية',
  lme_li_fca4: 'الجدول الزمني: 12 شهراً للطلبات الكاملة، وكثيراً ما يتجاوز ذلك نظراً لطول قوائم انتظار مراجعة FCA',
  lme_h3_cbi: 'بنك أيرلندا المركزي (CBI)',
  lme_p_cbi: 'الوجهة الأوروبية الشائعة لشركات مجلس التعاون الخليجي نظراً لمتطلباتها الجوهرية الجاهزية والبيئة الإنجليزية اللغة.',
  lme_li_eu1: 'الجواز الأوروبي: يُتيح الجواز الأوروبي لمؤسسات الدفع الأيرلندية تقديم الخدمات في الدول الأعضاء الستة والعشرين الأخرى في الاتحاد الأوروبي',
  lme_li_eu2: 'متطلبات الاستيطان: مكتب جوهري، ومديرون مقيمون في أيرلندا وخبرة إدارية كافية',
  lme_li_eu3: 'المدة الزمنية: 9–12 شهراً من تقديم الطلب الكامل إلى صدور الترخيص',
  lme_li_eu4: 'بديل ذو وزن أخف: يمكن لمؤسسة الدفع الصغيرة بدء العمل بحد أدنى لرأس المال قدره 20,000 يورو خلال انتظار ترخيص PI الكامل',
  lme_h2_process: 'منهجية الترخيص',
  lme_p_process_intro: 'نتبع منهجية منظمة خماسية المراحل لطلبات الترخيص، اختُبرت مع مجموعة من المنظمات التي نجحت في الحصول على الترخيص في أسواق متعددة لمجلس التعاون الخليجي والمملكة المتحدة وأوروبا.',
  lme_h4_step1: 'المرحلة الأولى: تقييم الملاءمة التنظيمية',
  lme_p_step1: 'تقييم نموذج العمل مقابل فئات الترخيص المتاحة. تحديد السلطة التنظيمية الملائمة ومتطلباتها. تقييم جاهزية المالك المستفيد الفعلي وهيكل الملكية. مراجعة مسبقة للسجل التنظيمي.',
  lme_h4_step2: 'المرحلة الثانية: جاهزية رأس المال والحوكمة',
  lme_p_step2: 'التحقق من استيفاء الحد الأدنى لمتطلبات رأس المال وتوثيق المصدر. إعداد هيكل مجلس الإدارة وإطار الحوكمة. توثيق هياكل ملكية صندوق الاستثمار أو الشركة إن وُجدت.',
  lme_h4_step3: 'المرحلة الثالثة: إعداد وثيقة البرنامج',
  lme_p_step3: 'صياغة وثيقة برنامج الترخيص: خطة العمل وتقييمات المخاطر وإطار مكافحة غسل الأموال وتمويل الإرهاب وسياسات مكافحة الاحتيال وخطط الاستمرارية وسياسات حماية الأموال.',
  lme_h4_step4: 'المرحلة الرابعة: تقديم الطلب والحوار التنظيمي',
  lme_p_step4: 'إدارة عملية تقديم الطلب. التعامل مع المراجعات التنظيمية ومتطلبات المعلومات الإضافية. حضور الاجتماعات مع ممثلين تنظيميين.',
  lme_h4_step5: 'المرحلة الخامسة: الاستعداد التشغيلي وإجازة البدء',
  lme_p_step5: 'إعداد أنظمة الامتثال وضوابط رأس المال وإجراءات التشغيل قبيل الإطلاق. دعم إعداد تقارير البدء في التشغيل وشرط الإشعار المسبق للمشرف.',
  lme_p_callout: 'تجدر الإشارة إلى أن تسلسل الخطوات يتفاوت حسب الولاية القضائية. تُلزم بعض الجهات التنظيمية بتقديم نموذج اتصال مسبق قبل الطلب الرسمي، في حين تمنح أخرى تراخيص مشروطة تستلزم الوفاء بشروط محددة قبيل البدء في التشغيل.',
  lme_h2_sandbox: 'البيئات التنظيمية التجريبية',
  lme_p_sandbox1: 'وفّرت برامج البيئة التجريبية التنظيمية في دول مجلس التعاون الخليجي والمملكة المتحدة مساراً للشركات التي تمتلك خدمة مبتكرة للاختبار في السوق الحقيقي دون الحاجة إلى الترخيص الكامل.',
  lme_li_sandbox1: 'SAMA: برنامج بيئة الرقابة التنظيمية الريادية — يُتيح اختبار خدمات الدفع المبتكرة في إطار بيئة محدودة النطاق بموافقة SAMA',
  lme_li_sandbox2: 'CBUAE: برنامج Regulatory Sandbox — نطاق أوسع من برامج المجلس، مع التركيز على خدمات التقنية المالية ذات الأولوية',
  lme_li_sandbox3: 'QCB: إطار مختبر التقنية المالية — يستهدف مزودي خدمات الدفع المبتكرة لاختبار الخدمات التي لا تندرج ضمن الفئات المرخصة الحالية',
  lme_li_sandbox4: 'FCA: Regulatory Sandbox — البيئة التجريبية الأكثر نضجاً تشغيلياً، مفتوحة للشركات التي تمتلك عملاء فعليين وقابلية مُثبَتة للتوسع',
  lme_li_sandbox5: 'مسارات البيئة التجريبية لا تُضمن الترخيص؛ والشركات التي تُكمل برامجها بنجاح لا تزال بحاجة إلى تقديم طلب ترخيص كامل',
  lme_p_sandbox2: 'يُمكن أن تُوفّر البيئة التجريبية بيانات قيّمة لطلب الترخيص اللاحق، غير أنها تُمثّل مساراً موازياً لا بديلاً عن الترخيص، ومسؤولية قانونية إضافية يجب أخذها في الحسبان.',
  lme_h2_correspondent: 'الوصول إلى المصرفية المراسلة',
  lme_p_corr1: 'الحصول على الترخيص يمثّل شرطاً لازماً وليس كافياً. ويواجه عدد من الشركات المرخصة حديثاً صعوبات جوهرية في الحصول على حسابات مصرفية تجارية وعلاقات مصرفية مراسلة، نظراً لتعامل البنوك مع مزودي خدمات الدفع باعتبارهم شريحة عالية المخاطر.',
  lme_p_corr2: 'نساعد الشركات على التعامل مع تحديات وصول المصرفية المراسلة قبل تقديم طلب الترخيص، وذلك من خلال:',
  lme_li_corr1: 'تقديم تقييمات لعلاقات المصرفية التجارية — تقييم البنوك المتاحة التي ترغب في خدمة فئة نموذج عمل معين وفي الولايات القضائية ذات الصلة',
  lme_li_corr2: 'دعم العناية الواجبة للبنك — إعداد الحزم المصرفية وتوثيق الامتثال لدعم عمليات مراجعة قبول العملاء لدى البنوك',
  lme_li_corr3: 'هيكلة علاقات السيولة — ترتيبات السيولة التي تُوازن بين تكلفة التمويل والقدرة على التشغيل الفعلي من اليوم الأول',
  lme_li_corr4: 'التواصل مع بنوك مزودي خدمات الدفع الإقليمية — القنوات المنهجية التي استخدمها مزودو خدمات الدفع الناجحون الآخرون في الأسواق ذات الصلة',
  lme_h3_cta: 'ناقشنا متطلبات الترخيص ودخول السوق',
  lme_p_cta: 'تقدّم MENA Advisory المشورة للمؤسسات المالية وشركات التقنية المالية والمجموعات الاستثمارية التي تسعى للحصول على ترخيص في أسواق دول مجلس التعاون الخليجي والمملكة المتحدة وأوروبا. يعمل فريقنا مع موكلين في مراحل مختلفة من رحلة الترخيص — من تقييم الملاءمة التنظيمية الأولي إلى إدارة عملية التقديم الكاملة.'

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

  /* ── Industry News page: dual filter (region + category) ────────── */
  (function () {
    const feed = document.getElementById('newsFeed');
    if (!feed) return;
    const regionBtns = document.querySelectorAll('#newsRegionFilter .filter-btn');
    const catBtns = document.querySelectorAll('#newsCategoryFilter .filter-btn');
    const rows = document.querySelectorAll('.news-row');
    let activeRegion = 'all';
    let activeCat = 'all';

    function applyFilters() {
      rows.forEach(row => {
        const regionMatch = activeRegion === 'all' || row.dataset.region === activeRegion;
        const catMatch = activeCat === 'all' || row.dataset.category === activeCat;
        row.style.display = (regionMatch && catMatch) ? '' : 'none';
      });
    }

    regionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        regionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeRegion = btn.dataset.filter;
        applyFilters();
      });
    });

    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.catFilter;
        applyFilters();
      });
    });
  })();
