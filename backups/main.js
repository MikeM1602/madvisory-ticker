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
    page_sub_epayments:'نغطي الطيف الكامل لطرق الدفع الإلكتروني — بطاقات، محافظ رقمية، مدفوعات فورية، تحويلات مباشرة.',
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
