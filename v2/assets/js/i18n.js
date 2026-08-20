/**
 * Multilingual i18n Dictionary & Switcher for Sohel Ahammad Portfolio v2
 * Languages: English (en), Bengali (bn), Arabic (ar)
 */

window.I18N_DATA = {
  en: {
    nav_home: "Home",
    nav_exp: "Experience",
    nav_gallery: "Gallery",
    nav_blog: "Blog",
    nav_contact: "Contact",
    hero_name: "Sohel Ahammad",
    hero_tagline: "Saudi Arabia Professional | Electrical Terminator & Multi-Skilled Worker",
    view_exp: "VIEW EXPERIENCE",
    contact_me: "CONTACT ME",
    available_work: "AVAILABLE FOR WORK",
    about_title: "About Me",
    about_intro: "Hello! I am <span class=\"highlight-name\">Sohel Ahammad</span>, a Saudi Arabia-based professional with hands-on experience in electrical termination, testing and commissioning, store keeping, computer operations, and hospitality support.",
    exp_title: "Experience Highlights",
    stats_title: "Statistics",
    stat_exp: "Years Experience",
    stat_roles: "Job Roles",
    stat_companies: "Companies",
    stat_languages: "Languages",
    photos_title: "Photos Preview",
    view_full_gallery: "VIEW FULL GALLERY",
    skills_title: "Skills & Proficiency",
    timeline_title: "Experience Timeline",
    featured_project: "Featured Project & App",
    open_live_app: "OPEN LIVE APP"
  },
  bn: {
    nav_home: "হোম",
    nav_exp: "অভিজ্ঞতা",
    nav_gallery: "গ্যালারি",
    nav_blog: "ব্লগ",
    nav_contact: "যোগাযোগ",
    hero_name: "সোহেল আহাম্মদ",
    hero_tagline: "সৌদি আরব প্রফেশনাল | ইলেকট্রিক্যাল টার্মিনেটর ও মাল্টি-স্কিল্ড কর্মী",
    view_exp: "অভিজ্ঞতা দেখুন",
    contact_me: "যোগাযোগ করুন",
    available_work: "কাজের জন্য প্রস্তুত",
    about_title: "আমার সম্পর্কে",
    about_intro: "আসসালামু আলাইকুম! আমি <span class=\"highlight-name\">সোহেল আহাম্মদ</span>, সৌদি আরবে কর্মরত একজন দক্ষ পেশাদার যার ইলেকট্রিক্যাল টার্মিনেশন, টেস্টিং ও কমিশনিং, স্টোর কিপিং, কম্পিউটার অপারেশন এবং হসপিটালিটিতে বাস্তব অভিজ্ঞতা রয়েছে।",
    exp_title: "কাজের অভিজ্ঞতা",
    stats_title: "পরিসংখ্যান",
    stat_exp: "বছরের অভিজ্ঞতা",
    stat_roles: "কাজের ভূমিকা",
    stat_companies: "প্রতিষ্ঠান",
    stat_languages: "জানা ভাষা",
    photos_title: "ফটো প্রিভিউ",
    view_full_gallery: "সম্পূর্ণ গ্যালারি দেখুন",
    skills_title: "দক্ষতা ও পারদর্শিতা",
    timeline_title: "ক্যারিয়ার টাইমলাইন",
    featured_project: "বিশেষ প্রজেক্ট ও অ্যাপ",
    open_live_app: "লাইভ অ্যাপ ওপেন করুন"
  },
  ar: {
    nav_home: "الرئيسية",
    nav_exp: "الخبرات والمهارات",
    nav_gallery: "معرض الصور",
    nav_blog: "المدونة",
    nav_contact: "اتصل بي",
    hero_name: "سهيل أحمد",
    hero_tagline: "مهني في المملكة العربية السعودية | فني إنهاء كابلات كهربائية ومتعدد المهارات",
    view_exp: "عرض الخبرات",
    contact_me: "تواصل معي",
    available_work: "متاح للعمل فوراً",
    about_title: "نبذة عني",
    about_intro: "مرحباً! أنا <span class=\"highlight-name\">سهيل أحمد</span>، مهني مقيم في المملكة العربية السعودية ولدي خبرة عملية واسعة في إنهاء الكابلات الكهربائية، الفحص والتشغيل التجريبي (T&C)، إدارة المستودعات، وتشغيل الحاسب الآلي والخدمات الفندقية.",
    exp_title: "أبرز الخبرات المهنية",
    stats_title: "الإحصائيات",
    stat_exp: "سنوات خبرة",
    stat_roles: "أدوار وظيفية",
    stat_companies: "شركات ومشاريع",
    stat_languages: "لغات معتمدة",
    photos_title: "معاينة الصور",
    view_full_gallery: "عرض المعرض بالكامل",
    skills_title: "المهارات والكفاءات",
    timeline_title: "المسار المهني",
    featured_project: "المشاريع والتطبيقات المميزة",
    open_live_app: "فتح التطبيق المباشر"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('site_lang') || 'en';
    this.init();
  }

  init() {
    this.applyLanguage(this.currentLang);
    this.setupDropdown();
  }

  applyLanguage(lang) {
    if (!window.I18N_DATA[lang]) lang = 'en';
    this.currentLang = lang;
    localStorage.setItem('site_lang', lang);

    // Apply RTL for Arabic, LTR for others
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }

    // Translate DOM elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.I18N_DATA[lang] && window.I18N_DATA[lang][key]) {
        el.innerHTML = window.I18N_DATA[lang][key];
      }
    });

    // Update active state in language selector
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    const currentLangLabel = document.getElementById('current-lang-text');
    if (currentLangLabel) {
      currentLangLabel.textContent = lang === 'en' ? 'EN' : (lang === 'bn' ? 'বাং' : 'عربي');
    }
  }

  setupDropdown() {
    const langBtn = document.getElementById('lang-toggle-btn');
    const langMenu = document.getElementById('lang-dropdown-menu');
    if (!langBtn || !langMenu) return;

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) {
        langMenu.classList.remove('show');
      }
    });

    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = opt.dataset.lang;
        this.applyLanguage(selectedLang);
        langMenu.classList.remove('show');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.i18n = new I18nManager();
});
