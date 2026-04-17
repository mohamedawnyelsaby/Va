// PATH: src/lib/i18n/translations.ts
// Complete translations for all supported locales

export type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh' | 'ja' | 'ru';

export interface Translations {
  // Nav
  nav: {
    hotels: string;
    attractions: string;
    restaurants: string;
    aiAssistant: string;
    signIn: string;
    signUp: string;
    dashboard: string;
    signOut: string;
  };
  // Hero
  hero: {
    tag: string;
    heading1: string;
    heading2: string;
    heading3: string;
    subheading: string;
    searchPlaceholder: {
      hotels: string;
      attractions: string;
      restaurants: string;
      ai: string;
    };
    search: string;
    stats: {
      countries: string;
      properties: string;
      travelers: string;
      payments: string;
    };
  };
  // Features
  features: {
    sectionTag: string;
    sectionTitle1: string;
    sectionTitle2: string;
    items: Array<{ title: string; desc: string }>;
  };
  // Popular Destinations
  destinations: {
    sectionTag: string;
    sectionTitle1: string;
    sectionTitle2: string;
    viewAll: string;
  };
  // How It Works
  howItWorks: {
    sectionTag: string;
    sectionTitle1: string;
    sectionTitle2: string;
    steps: Array<{ num: string; title: string; desc: string }>;
    stats: {
      bookingTime: string;
      bookingTimeLabel: string;
      hiddenFees: string;
      hiddenFeesLabel: string;
      support: string;
      supportLabel: string;
    };
  };
  // Pi Integration
  piIntegration: {
    sectionTag: string;
    sectionTitle: string;
    subheading: string;
    pillars: Array<{ title: string; desc: string }>;
    steps: string[];
    connectBtn: string;
    stats: Array<{ suffix: string; label: string }>;
  };
  // Footer
  footer: {
    description: string;
    sections: {
      explore: string;
      account: string;
      company: string;
      legal: string;
    };
    newsletter: {
      tag: string;
      desc: string;
      placeholder: string;
      btn: string;
    };
    copyright: string;
    poweredBy: string;
    aiPowered: string;
  };
  // Common
  common: {
    bookNow: string;
    viewAll: string;
    perNight: string;
    perPerson: string;
    freeEntry: string;
    loading: string;
    notFound: string;
    search: string;
    filters: string;
    apply: string;
    reset: string;
    back: string;
    share: string;
    save: string;
    close: string;
    next: string;
    prev: string;
    reviews: string;
    writeReview: string;
    featured: string;
    popular: string;
    comingSoon: string;
  };
  // Pages
  pages: {
    about: { title: string; subtitle: string };
    hotels: { title: string; subtitle: string; searchPlaceholder: string };
    attractions: { title: string; subtitle: string; searchPlaceholder: string };
    restaurants: { title: string; subtitle: string; searchPlaceholder: string };
    bookings: { title: string; empty: string; emptyDesc: string };
    dashboard: { title: string; greeting: string };
    wallet: { title: string; connect: string; connectDesc: string; noBrowser: string };
  };
}

const en: Translations = {
  nav: {
    hotels: 'Hotels',
    attractions: 'Attractions',
    restaurants: 'Restaurants',
    aiAssistant: 'AI Assistant',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
  },
  hero: {
    tag: 'Pi-Powered · AI-First · Global',
    heading1: 'The World',
    heading2: 'Awaits',
    heading3: 'You',
    subheading: 'Discover extraordinary destinations. Book with Pi. AI-curated experiences for the discerning traveller.',
    searchPlaceholder: {
      hotels: 'Search hotels…',
      attractions: 'Search attractions…',
      restaurants: 'Search restaurants…',
      ai: 'Ask AI anything…',
    },
    search: 'Search',
    stats: {
      countries: 'Countries',
      properties: 'Properties',
      travelers: 'Travelers',
      payments: 'Pi Payments',
    },
  },
  features: {
    sectionTag: 'Why Va Travel',
    sectionTitle1: 'Travel',
    sectionTitle2: 'Reimagined',
    items: [
      { title: 'AI-Curated Travel', desc: 'Personalised recommendations powered by Claude AI, learning your preferences for every journey.' },
      { title: 'Global Reach', desc: '180+ countries, 50,000+ properties, and millions of experiences available at your fingertips.' },
      { title: 'Pi Payments', desc: 'Seamlessly book hotels, tours, and dining using Pi Network — the future of travel payments.' },
      { title: 'Verified Listings', desc: 'Every property and attraction is manually reviewed to ensure the highest quality standards.' },
      { title: 'Instant Booking', desc: 'Real-time availability and confirmed reservations in seconds, no waiting required.' },
      { title: 'Concierge Support', desc: '24/7 multilingual support from human experts and AI to handle every travel request.' },
    ],
  },
  destinations: {
    sectionTag: 'Popular Destinations',
    sectionTitle1: 'Where Will You',
    sectionTitle2: 'Go?',
    viewAll: 'View All',
  },
  howItWorks: {
    sectionTag: 'How It Works',
    sectionTitle1: 'Four Steps to',
    sectionTitle2: 'Adventure',
    steps: [
      { num: '01', title: 'Create Account', desc: 'Sign up with your Pi Wallet in seconds. No credit card required.' },
      { num: '02', title: 'Discover', desc: 'Browse AI-curated hotels, restaurants, and attractions worldwide.' },
      { num: '03', title: 'Book with Pi', desc: "Pay seamlessly using Pi Network — the world's most accessible crypto." },
      { num: '04', title: 'Travel & Earn', desc: 'Enjoy your trip and earn Pi rewards for every booking and review.' },
    ],
    stats: {
      bookingTime: '< 60s',
      bookingTimeLabel: 'Average booking time',
      hiddenFees: '0%',
      hiddenFeesLabel: 'Hidden fees',
      support: '24/7',
      supportLabel: 'Support available',
    },
  },
  piIntegration: {
    sectionTag: 'Pi Network Integration',
    sectionTitle: 'Pay with Pi',
    subheading: 'Va Travel is one of the first luxury travel platforms natively integrated with Pi Network payments.',
    pillars: [
      { title: 'Earn Pi Rewards', desc: 'Receive Pi for every booking, review, and referral you make on the platform.' },
      { title: 'Secure Payments', desc: 'Pi Network blockchain ensures every transaction is transparent and tamper-proof.' },
      { title: 'Global Acceptance', desc: 'Use Pi at thousands of verified properties and experiences worldwide.' },
      { title: 'Growing Ecosystem', desc: "Be part of the world's largest crypto community with 47M+ active users." },
    ],
    steps: [
      'Connect your Pi Wallet to your Va Travel account.',
      'Browse and select from thousands of verified listings.',
      'Confirm your booking — pay instantly with Pi.',
      'Travel, earn rewards, and leave verified reviews.',
    ],
    connectBtn: 'Connect Pi Wallet',
    stats: [
      { suffix: 'M+', label: 'Pi Users' },
      { suffix: '+', label: 'Countries' },
      { suffix: '%', label: 'Transaction Fees' },
      { suffix: '%', label: 'Blockchain Secured' },
    ],
  },
  footer: {
    description: 'AI-powered global travel platform built on the Pi Network. Book, explore, and earn Pi rewards.',
    sections: { explore: 'Explore', account: 'Account', company: 'Company', legal: 'Legal' },
    newsletter: {
      tag: 'Travel Updates',
      desc: 'Get exclusive Pi rewards and destination news.',
      placeholder: 'your@email.com',
      btn: 'Subscribe',
    },
    copyright: 'Va Travel. All rights reserved.',
    poweredBy: 'Powered by π Pi Network',
    aiPowered: 'AI-Powered',
  },
  common: {
    bookNow: 'Book Now',
    viewAll: 'View All',
    perNight: '/night',
    perPerson: 'Per Person',
    freeEntry: 'Free Entry',
    loading: 'Loading',
    notFound: 'Not Found',
    search: 'Search',
    filters: 'Filters',
    apply: 'Apply',
    reset: 'Reset',
    back: 'Back',
    share: 'Share',
    save: 'Save',
    close: 'Close',
    next: 'Next',
    prev: 'Prev',
    reviews: 'Reviews',
    writeReview: 'Write Review',
    featured: 'Featured',
    popular: 'Popular',
    comingSoon: 'Coming Soon',
  },
  pages: {
    about: { title: 'About Va Travel', subtitle: 'Our Story' },
    hotels: { title: 'Find Your Perfect Hotel', subtitle: 'Explore', searchPlaceholder: 'Search hotels, cities...' },
    attractions: { title: 'Amazing Attractions', subtitle: 'Discover', searchPlaceholder: 'Search attractions...' },
    restaurants: { title: 'Discover Great Restaurants', subtitle: 'Dining', searchPlaceholder: 'Search restaurants, cuisines...' },
    bookings: { title: 'My Bookings', empty: 'No Bookings Yet', emptyDesc: 'Your upcoming trips will appear here.' },
    dashboard: { title: 'Dashboard', greeting: 'Welcome' },
    wallet: { title: 'My Wallet', connect: 'Connect Pi Wallet', connectDesc: 'Connect your Pi Network wallet to view your balance and earn cashback on every booking.', noBrowser: 'Pi Browser Required' },
  },
};

const ar: Translations = {
  nav: {
    hotels: 'الفنادق',
    attractions: 'المعالم',
    restaurants: 'المطاعم',
    aiAssistant: 'مساعد الذكاء الاصطناعي',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    signOut: 'تسجيل الخروج',
  },
  hero: {
    tag: 'مدعوم بـ Pi · الذكاء الاصطناعي أولاً · عالمي',
    heading1: 'العالم',
    heading2: 'ينتظرك',
    heading3: '',
    subheading: 'اكتشف وجهات استثنائية. احجز بـ Pi. تجارب مُختارة بالذكاء الاصطناعي للمسافر الراقي.',
    searchPlaceholder: {
      hotels: 'ابحث عن فنادق…',
      attractions: 'ابحث عن معالم…',
      restaurants: 'ابحث عن مطاعم…',
      ai: 'اسأل الذكاء الاصطناعي…',
    },
    search: 'بحث',
    stats: {
      countries: 'دولة',
      properties: 'عقار',
      travelers: 'مسافر',
      payments: 'مدفوعات Pi',
    },
  },
  features: {
    sectionTag: 'لماذا Va Travel',
    sectionTitle1: 'السفر',
    sectionTitle2: 'يُعاد تشكيله',
    items: [
      { title: 'سفر بالذكاء الاصطناعي', desc: 'توصيات مخصصة مدعومة بـ Claude AI، تتعلم تفضيلاتك في كل رحلة.' },
      { title: 'وصول عالمي', desc: 'أكثر من 180 دولة، 50,000+ عقار، وملايين التجارب في متناول يدك.' },
      { title: 'الدفع بـ Pi', desc: 'احجز الفنادق والجولات والمطاعم بسلاسة باستخدام شبكة Pi — مستقبل مدفوعات السفر.' },
      { title: 'قوائم موثّقة', desc: 'كل عقار ومعلم يُراجع يدوياً لضمان أعلى معايير الجودة.' },
      { title: 'حجز فوري', desc: 'توفر في الوقت الفعلي وحجوزات مؤكدة في ثوانٍ، دون انتظار.' },
      { title: 'دعم الكونسيرج', desc: 'دعم متعدد اللغات على مدار الساعة من خبراء بشريين وذكاء اصطناعي.' },
    ],
  },
  destinations: {
    sectionTag: 'الوجهات الشائعة',
    sectionTitle1: 'إلى أين ستذهب',
    sectionTitle2: 'اليوم؟',
    viewAll: 'عرض الكل',
  },
  howItWorks: {
    sectionTag: 'كيف يعمل',
    sectionTitle1: 'أربع خطوات نحو',
    sectionTitle2: 'المغامرة',
    steps: [
      { num: '٠١', title: 'أنشئ حسابك', desc: 'سجّل بمحفظة Pi في ثوانٍ. لا بطاقة ائتمانية مطلوبة.' },
      { num: '٠٢', title: 'اكتشف', desc: 'تصفّح فنادق ومطاعم ومعالم مُختارة بالذكاء الاصطناعي حول العالم.' },
      { num: '٠٣', title: 'احجز بـ Pi', desc: 'ادفع بسلاسة باستخدام شبكة Pi — العملة المشفرة الأكثر سهولة في العالم.' },
      { num: '٠٤', title: 'سافر واكسب', desc: 'استمتع برحلتك واكسب مكافآت Pi مقابل كل حجز وتقييم.' },
    ],
    stats: {
      bookingTime: '< 60ث',
      bookingTimeLabel: 'متوسط وقت الحجز',
      hiddenFees: '٠٪',
      hiddenFeesLabel: 'رسوم مخفية',
      support: '٢٤/٧',
      supportLabel: 'دعم متاح',
    },
  },
  piIntegration: {
    sectionTag: 'تكامل شبكة Pi',
    sectionTitle: 'ادفع بـ Pi',
    subheading: 'Va Travel واحدة من أولى منصات السفر الراقية المتكاملة أصلاً مع مدفوعات شبكة Pi.',
    pillars: [
      { title: 'اكسب مكافآت Pi', desc: 'احصل على Pi مقابل كل حجز وتقييم وإحالة على المنصة.' },
      { title: 'مدفوعات آمنة', desc: 'تضمن بلوكتشين Pi أن كل معاملة شفافة ومحمية من التلاعب.' },
      { title: 'قبول عالمي', desc: 'استخدم Pi في آلاف العقارات والتجارب الموثقة حول العالم.' },
      { title: 'نظام بيئي متنامٍ', desc: 'كن جزءاً من أكبر مجتمع عملات مشفرة في العالم بأكثر من 47 مليون مستخدم.' },
    ],
    steps: [
      'اربط محفظة Pi بحساب Va Travel الخاص بك.',
      'تصفّح واختر من بين آلاف القوائم الموثقة.',
      'أكّد حجزك — ادفع فوراً بـ Pi.',
      'سافر، اكسب المكافآت، واترك تقييمات موثقة.',
    ],
    connectBtn: 'ربط محفظة Pi',
    stats: [
      { suffix: 'م+', label: 'مستخدمي Pi' },
      { suffix: '+', label: 'دولة' },
      { suffix: '٪', label: 'رسوم المعاملات' },
      { suffix: '٪', label: 'مؤمَّن بالبلوكتشين' },
    ],
  },
  footer: {
    description: 'منصة سفر عالمية مدعومة بالذكاء الاصطناعي مبنية على شبكة Pi. احجز واستكشف واكسب مكافآت Pi.',
    sections: { explore: 'استكشف', account: 'الحساب', company: 'الشركة', legal: 'قانوني' },
    newsletter: {
      tag: 'تحديثات السفر',
      desc: 'احصل على مكافآت Pi حصرية وأخبار الوجهات.',
      placeholder: 'بريدك@example.com',
      btn: 'اشترك',
    },
    copyright: 'Va Travel. جميع الحقوق محفوظة.',
    poweredBy: 'مدعوم من π شبكة Pi',
    aiPowered: 'مدعوم بالذكاء الاصطناعي',
  },
  common: {
    bookNow: 'احجز الآن',
    viewAll: 'عرض الكل',
    perNight: '/ليلة',
    perPerson: 'للشخص',
    freeEntry: 'دخول مجاني',
    loading: 'جاري التحميل',
    notFound: 'غير موجود',
    search: 'بحث',
    filters: 'تصفية',
    apply: 'تطبيق',
    reset: 'إعادة تعيين',
    back: 'رجوع',
    share: 'مشاركة',
    save: 'حفظ',
    close: 'إغلاق',
    next: 'التالي',
    prev: 'السابق',
    reviews: 'التقييمات',
    writeReview: 'كتابة تقييم',
    featured: 'مميز',
    popular: 'شائع',
    comingSoon: 'قريباً',
  },
  pages: {
    about: { title: 'عن Va Travel', subtitle: 'قصتنا' },
    hotels: { title: 'ابحث عن فندقك المثالي', subtitle: 'استكشف', searchPlaceholder: 'ابحث عن فنادق، مدن...' },
    attractions: { title: 'معالم رائعة', subtitle: 'اكتشف', searchPlaceholder: 'ابحث عن معالم...' },
    restaurants: { title: 'اكتشف مطاعم رائعة', subtitle: 'المطاعم', searchPlaceholder: 'ابحث عن مطاعم، مطابخ...' },
    bookings: { title: 'حجوزاتي', empty: 'لا توجد حجوزات بعد', emptyDesc: 'ستظهر رحلاتك القادمة هنا.' },
    dashboard: { title: 'لوحة التحكم', greeting: 'مرحباً' },
    wallet: { title: 'محفظتي', connect: 'ربط محفظة Pi', connectDesc: 'اربط محفظة Pi للاطلاع على رصيدك وكسب مكافآت على كل حجز.', noBrowser: 'متصفح Pi مطلوب' },
  },
};

const fr: Translations = {
  nav: {
    hotels: 'Hôtels',
    attractions: 'Attractions',
    restaurants: 'Restaurants',
    aiAssistant: 'Assistant IA',
    signIn: 'Connexion',
    signUp: 'S\'inscrire',
    dashboard: 'Tableau de bord',
    signOut: 'Déconnexion',
  },
  hero: {
    tag: 'Propulsé par Pi · IA en premier · Mondial',
    heading1: 'Le Monde',
    heading2: 'Vous Attend',
    heading3: '',
    subheading: 'Découvrez des destinations extraordinaires. Réservez avec Pi. Des expériences sélectionnées par IA.',
    searchPlaceholder: {
      hotels: 'Rechercher des hôtels…',
      attractions: 'Rechercher des attractions…',
      restaurants: 'Rechercher des restaurants…',
      ai: 'Demandez à l\'IA…',
    },
    search: 'Rechercher',
    stats: {
      countries: 'Pays',
      properties: 'Propriétés',
      travelers: 'Voyageurs',
      payments: 'Paiements Pi',
    },
  },
  features: {
    sectionTag: 'Pourquoi Va Travel',
    sectionTitle1: 'Voyage',
    sectionTitle2: 'Réinventé',
    items: [
      { title: 'Voyage par IA', desc: 'Recommandations personnalisées par Claude AI, apprenant vos préférences.' },
      { title: 'Portée Mondiale', desc: '180+ pays, 50 000+ propriétés et des millions d\'expériences à portée de main.' },
      { title: 'Paiements Pi', desc: 'Réservez hôtels, circuits et restaurants avec Pi Network — l\'avenir des paiements.' },
      { title: 'Annonces Vérifiées', desc: 'Chaque propriété est examinée manuellement pour garantir les meilleurs standards.' },
      { title: 'Réservation Instantanée', desc: 'Disponibilité en temps réel et réservations confirmées en quelques secondes.' },
      { title: 'Support Concierge', desc: 'Assistance multilingue 24h/24 par des experts humains et l\'IA.' },
    ],
  },
  destinations: {
    sectionTag: 'Destinations Populaires',
    sectionTitle1: 'Où Allez-Vous',
    sectionTitle2: 'Partir ?',
    viewAll: 'Tout Voir',
  },
  howItWorks: {
    sectionTag: 'Comment ça Marche',
    sectionTitle1: 'Quatre Étapes vers',
    sectionTitle2: 'l\'Aventure',
    steps: [
      { num: '01', title: 'Créer un Compte', desc: 'Inscrivez-vous avec votre Pi Wallet en quelques secondes.' },
      { num: '02', title: 'Découvrir', desc: 'Parcourez les hôtels, restaurants et attractions sélectionnés par IA.' },
      { num: '03', title: 'Réserver avec Pi', desc: 'Payez facilement avec Pi Network — la crypto la plus accessible.' },
      { num: '04', title: 'Voyager & Gagner', desc: 'Profitez de votre voyage et gagnez des récompenses Pi.' },
    ],
    stats: {
      bookingTime: '< 60s',
      bookingTimeLabel: 'Temps de réservation moyen',
      hiddenFees: '0%',
      hiddenFeesLabel: 'Frais cachés',
      support: '24/7',
      supportLabel: 'Support disponible',
    },
  },
  piIntegration: {
    sectionTag: 'Intégration Pi Network',
    sectionTitle: 'Payez avec Pi',
    subheading: 'Va Travel est l\'une des premières plateformes de voyage de luxe intégrée nativement avec Pi Network.',
    pillars: [
      { title: 'Gagnez des Récompenses Pi', desc: 'Recevez des Pi pour chaque réservation, avis et parrainage.' },
      { title: 'Paiements Sécurisés', desc: 'La blockchain Pi garantit que chaque transaction est transparente.' },
      { title: 'Acceptation Mondiale', desc: 'Utilisez Pi dans des milliers de propriétés vérifiées dans le monde.' },
      { title: 'Écosystème Croissant', desc: 'Faites partie de la plus grande communauté crypto avec 47M+ utilisateurs.' },
    ],
    steps: [
      'Connectez votre Pi Wallet à votre compte Va Travel.',
      'Parcourez et sélectionnez parmi des milliers d\'annonces vérifiées.',
      'Confirmez votre réservation — payez instantanément avec Pi.',
      'Voyagez, gagnez des récompenses, et laissez des avis vérifiés.',
    ],
    connectBtn: 'Connecter Pi Wallet',
    stats: [
      { suffix: 'M+', label: 'Utilisateurs Pi' },
      { suffix: '+', label: 'Pays' },
      { suffix: '%', label: 'Frais de Transaction' },
      { suffix: '%', label: 'Sécurisé Blockchain' },
    ],
  },
  footer: {
    description: 'Plateforme de voyage mondiale propulsée par l\'IA sur Pi Network. Réservez, explorez et gagnez.',
    sections: { explore: 'Explorer', account: 'Compte', company: 'Entreprise', legal: 'Légal' },
    newsletter: {
      tag: 'Actualités Voyages',
      desc: 'Obtenez des récompenses Pi exclusives et des actualités de destinations.',
      placeholder: 'votre@email.com',
      btn: 'S\'abonner',
    },
    copyright: 'Va Travel. Tous droits réservés.',
    poweredBy: 'Propulsé par π Pi Network',
    aiPowered: 'Propulsé par IA',
  },
  common: {
    bookNow: 'Réserver',
    viewAll: 'Tout Voir',
    perNight: '/nuit',
    perPerson: 'Par Personne',
    freeEntry: 'Entrée Gratuite',
    loading: 'Chargement',
    notFound: 'Non Trouvé',
    search: 'Rechercher',
    filters: 'Filtres',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    back: 'Retour',
    share: 'Partager',
    save: 'Sauvegarder',
    close: 'Fermer',
    next: 'Suivant',
    prev: 'Précédent',
    reviews: 'Avis',
    writeReview: 'Écrire un Avis',
    featured: 'En Vedette',
    popular: 'Populaire',
    comingSoon: 'Bientôt Disponible',
  },
  pages: {
    about: { title: 'À Propos de Va Travel', subtitle: 'Notre Histoire' },
    hotels: { title: 'Trouvez Votre Hôtel Idéal', subtitle: 'Explorer', searchPlaceholder: 'Rechercher hôtels, villes...' },
    attractions: { title: 'Attractions Incroyables', subtitle: 'Découvrir', searchPlaceholder: 'Rechercher attractions...' },
    restaurants: { title: 'Découvrez de Super Restaurants', subtitle: 'Gastronomie', searchPlaceholder: 'Rechercher restaurants, cuisines...' },
    bookings: { title: 'Mes Réservations', empty: 'Pas Encore de Réservations', emptyDesc: 'Vos prochains voyages apparaîtront ici.' },
    dashboard: { title: 'Tableau de Bord', greeting: 'Bienvenue' },
    wallet: { title: 'Mon Portefeuille', connect: 'Connecter Pi Wallet', connectDesc: 'Connectez votre portefeuille Pi pour voir votre solde et gagner des récompenses.', noBrowser: 'Pi Browser Requis' },
  },
};

const es: Translations = {
  nav: {
    hotels: 'Hoteles',
    attractions: 'Atracciones',
    restaurants: 'Restaurantes',
    aiAssistant: 'Asistente IA',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    dashboard: 'Panel',
    signOut: 'Cerrar Sesión',
  },
  hero: {
    tag: 'Impulsado por Pi · IA Primero · Global',
    heading1: 'El Mundo',
    heading2: 'Te Espera',
    heading3: '',
    subheading: 'Descubre destinos extraordinarios. Reserva con Pi. Experiencias curadas por IA para el viajero exigente.',
    searchPlaceholder: {
      hotels: 'Buscar hoteles…',
      attractions: 'Buscar atracciones…',
      restaurants: 'Buscar restaurantes…',
      ai: 'Pregunta a la IA…',
    },
    search: 'Buscar',
    stats: {
      countries: 'Países',
      properties: 'Propiedades',
      travelers: 'Viajeros',
      payments: 'Pagos Pi',
    },
  },
  features: {
    sectionTag: 'Por Qué Va Travel',
    sectionTitle1: 'Viaje',
    sectionTitle2: 'Reinventado',
    items: [
      { title: 'Viaje con IA', desc: 'Recomendaciones personalizadas por Claude AI, aprendiendo tus preferencias.' },
      { title: 'Alcance Global', desc: 'Más de 180 países, 50.000+ propiedades y millones de experiencias disponibles.' },
      { title: 'Pagos Pi', desc: 'Reserva hoteles, tours y restaurantes con Pi Network — el futuro de los pagos de viaje.' },
      { title: 'Listados Verificados', desc: 'Cada propiedad es revisada manualmente para garantizar los más altos estándares.' },
      { title: 'Reserva Instantánea', desc: 'Disponibilidad en tiempo real y reservas confirmadas en segundos.' },
      { title: 'Soporte Concierge', desc: 'Soporte multilingüe 24/7 de expertos humanos e IA.' },
    ],
  },
  destinations: {
    sectionTag: 'Destinos Populares',
    sectionTitle1: '¿A Dónde Vas',
    sectionTitle2: 'a Ir?',
    viewAll: 'Ver Todo',
  },
  howItWorks: {
    sectionTag: 'Cómo Funciona',
    sectionTitle1: 'Cuatro Pasos hacia',
    sectionTitle2: 'la Aventura',
    steps: [
      { num: '01', title: 'Crear Cuenta', desc: 'Regístrate con tu Pi Wallet en segundos. Sin tarjeta de crédito.' },
      { num: '02', title: 'Descubrir', desc: 'Explora hoteles, restaurantes y atracciones curados por IA en todo el mundo.' },
      { num: '03', title: 'Reservar con Pi', desc: 'Paga fácilmente con Pi Network — la cripto más accesible del mundo.' },
      { num: '04', title: 'Viajar y Ganar', desc: 'Disfruta tu viaje y gana recompensas Pi por cada reserva y reseña.' },
    ],
    stats: {
      bookingTime: '< 60s',
      bookingTimeLabel: 'Tiempo promedio de reserva',
      hiddenFees: '0%',
      hiddenFeesLabel: 'Tarifas ocultas',
      support: '24/7',
      supportLabel: 'Soporte disponible',
    },
  },
  piIntegration: {
    sectionTag: 'Integración Pi Network',
    sectionTitle: 'Paga con Pi',
    subheading: 'Va Travel es una de las primeras plataformas de viajes de lujo integrada nativamente con Pi Network.',
    pillars: [
      { title: 'Gana Recompensas Pi', desc: 'Recibe Pi por cada reserva, reseña y referido en la plataforma.' },
      { title: 'Pagos Seguros', desc: 'La blockchain de Pi garantiza que cada transacción sea transparente.' },
      { title: 'Aceptación Global', desc: 'Usa Pi en miles de propiedades y experiencias verificadas en todo el mundo.' },
      { title: 'Ecosistema en Crecimiento', desc: 'Sé parte de la comunidad cripto más grande con 47M+ usuarios activos.' },
    ],
    steps: [
      'Conecta tu Pi Wallet a tu cuenta de Va Travel.',
      'Explora y selecciona entre miles de listados verificados.',
      'Confirma tu reserva — paga instantáneamente con Pi.',
      'Viaja, gana recompensas y deja reseñas verificadas.',
    ],
    connectBtn: 'Conectar Pi Wallet',
    stats: [
      { suffix: 'M+', label: 'Usuarios Pi' },
      { suffix: '+', label: 'Países' },
      { suffix: '%', label: 'Tarifas de Transacción' },
      { suffix: '%', label: 'Seguridad Blockchain' },
    ],
  },
  footer: {
    description: 'Plataforma de viajes global con IA construida sobre Pi Network. Reserva, explora y gana.',
    sections: { explore: 'Explorar', account: 'Cuenta', company: 'Empresa', legal: 'Legal' },
    newsletter: {
      tag: 'Actualizaciones de Viaje',
      desc: 'Obtén recompensas Pi exclusivas y noticias de destinos.',
      placeholder: 'tu@email.com',
      btn: 'Suscribirse',
    },
    copyright: 'Va Travel. Todos los derechos reservados.',
    poweredBy: 'Impulsado por π Pi Network',
    aiPowered: 'Con IA',
  },
  common: {
    bookNow: 'Reservar',
    viewAll: 'Ver Todo',
    perNight: '/noche',
    perPerson: 'Por Persona',
    freeEntry: 'Entrada Gratis',
    loading: 'Cargando',
    notFound: 'No Encontrado',
    search: 'Buscar',
    filters: 'Filtros',
    apply: 'Aplicar',
    reset: 'Restablecer',
    back: 'Atrás',
    share: 'Compartir',
    save: 'Guardar',
    close: 'Cerrar',
    next: 'Siguiente',
    prev: 'Anterior',
    reviews: 'Reseñas',
    writeReview: 'Escribir Reseña',
    featured: 'Destacado',
    popular: 'Popular',
    comingSoon: 'Próximamente',
  },
  pages: {
    about: { title: 'Sobre Va Travel', subtitle: 'Nuestra Historia' },
    hotels: { title: 'Encuentra Tu Hotel Perfecto', subtitle: 'Explorar', searchPlaceholder: 'Buscar hoteles, ciudades...' },
    attractions: { title: 'Atracciones Increíbles', subtitle: 'Descubrir', searchPlaceholder: 'Buscar atracciones...' },
    restaurants: { title: 'Descubre Grandes Restaurantes', subtitle: 'Gastronomía', searchPlaceholder: 'Buscar restaurantes, cocinas...' },
    bookings: { title: 'Mis Reservas', empty: 'Aún No Hay Reservas', emptyDesc: 'Tus próximos viajes aparecerán aquí.' },
    dashboard: { title: 'Panel', greeting: 'Bienvenido' },
    wallet: { title: 'Mi Billetera', connect: 'Conectar Pi Wallet', connectDesc: 'Conecta tu billetera Pi para ver tu saldo y ganar recompensas.', noBrowser: 'Se Requiere Pi Browser' },
  },
};

const de: Translations = {
  nav: {
    hotels: 'Hotels',
    attractions: 'Attraktionen',
    restaurants: 'Restaurants',
    aiAssistant: 'KI-Assistent',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    dashboard: 'Dashboard',
    signOut: 'Abmelden',
  },
  hero: {
    tag: 'Pi-Powered · KI-First · Global',
    heading1: 'Die Welt',
    heading2: 'Wartet',
    heading3: 'auf Sie',
    subheading: 'Entdecken Sie außergewöhnliche Reiseziele. Buchen mit Pi. KI-ausgewählte Erlebnisse.',
    searchPlaceholder: {
      hotels: 'Hotels suchen…',
      attractions: 'Attraktionen suchen…',
      restaurants: 'Restaurants suchen…',
      ai: 'KI fragen…',
    },
    search: 'Suchen',
    stats: {
      countries: 'Länder',
      properties: 'Unterkünfte',
      travelers: 'Reisende',
      payments: 'Pi-Zahlungen',
    },
  },
  features: {
    sectionTag: 'Warum Va Travel',
    sectionTitle1: 'Reisen',
    sectionTitle2: 'Neu Gedacht',
    items: [
      { title: 'KI-kuratierte Reisen', desc: 'Personalisierte Empfehlungen von Claude AI, die Ihre Präferenzen lernt.' },
      { title: 'Globale Reichweite', desc: 'Über 180 Länder, 50.000+ Unterkünfte und Millionen von Erlebnissen.' },
      { title: 'Pi-Zahlungen', desc: 'Hotels, Touren und Restaurants nahtlos mit Pi Network buchen.' },
      { title: 'Verifizierte Angebote', desc: 'Jede Unterkunft wird manuell überprüft für höchste Qualitätsstandards.' },
      { title: 'Sofortbuchung', desc: 'Echtzeit-Verfügbarkeit und bestätigte Reservierungen in Sekunden.' },
      { title: 'Concierge-Support', desc: '24/7 mehrsprachiger Support von menschlichen Experten und KI.' },
    ],
  },
  destinations: {
    sectionTag: 'Beliebte Reiseziele',
    sectionTitle1: 'Wohin Geht',
    sectionTitle2: 'Die Reise?',
    viewAll: 'Alle Anzeigen',
  },
  howItWorks: {
    sectionTag: 'Wie Es Funktioniert',
    sectionTitle1: 'Vier Schritte zum',
    sectionTitle2: 'Abenteuer',
    steps: [
      { num: '01', title: 'Konto Erstellen', desc: 'Registrieren Sie sich mit Ihrem Pi Wallet in Sekunden. Keine Kreditkarte.' },
      { num: '02', title: 'Entdecken', desc: 'Durchsuchen Sie KI-ausgewählte Hotels, Restaurants und Attraktionen.' },
      { num: '03', title: 'Mit Pi Buchen', desc: 'Zahlen Sie nahtlos mit Pi Network — die zugänglichste Krypto der Welt.' },
      { num: '04', title: 'Reisen & Verdienen', desc: 'Genießen Sie Ihre Reise und verdienen Sie Pi-Prämien für jede Buchung.' },
    ],
    stats: {
      bookingTime: '< 60s',
      bookingTimeLabel: 'Durchschnittliche Buchungszeit',
      hiddenFees: '0%',
      hiddenFeesLabel: 'Versteckte Gebühren',
      support: '24/7',
      supportLabel: 'Support verfügbar',
    },
  },
  piIntegration: {
    sectionTag: 'Pi Network Integration',
    sectionTitle: 'Mit Pi Bezahlen',
    subheading: 'Va Travel ist eine der ersten Luxusreiseplattformen, die nativ mit Pi Network integriert ist.',
    pillars: [
      { title: 'Pi-Prämien Verdienen', desc: 'Erhalten Sie Pi für jede Buchung, Bewertung und Empfehlung.' },
      { title: 'Sichere Zahlungen', desc: 'Die Pi-Blockchain stellt sicher, dass jede Transaktion transparent ist.' },
      { title: 'Globale Akzeptanz', desc: 'Nutzen Sie Pi bei Tausenden von verifizierten Unterkünften weltweit.' },
      { title: 'Wachsendes Ökosystem', desc: 'Teil der größten Krypto-Community der Welt mit 47M+ aktiven Nutzern.' },
    ],
    steps: [
      'Verbinden Sie Ihr Pi Wallet mit Ihrem Va Travel-Konto.',
      'Durchsuchen und wählen Sie aus Tausenden verifizierten Angeboten.',
      'Bestätigen Sie Ihre Buchung — zahlen Sie sofort mit Pi.',
      'Reisen, Prämien verdienen und verifizierte Bewertungen hinterlassen.',
    ],
    connectBtn: 'Pi Wallet Verbinden',
    stats: [
      { suffix: 'M+', label: 'Pi-Nutzer' },
      { suffix: '+', label: 'Länder' },
      { suffix: '%', label: 'Transaktionsgebühren' },
      { suffix: '%', label: 'Blockchain-Gesichert' },
    ],
  },
  footer: {
    description: 'KI-gestützte globale Reiseplattform auf Pi Network. Buchen, entdecken und verdienen.',
    sections: { explore: 'Entdecken', account: 'Konto', company: 'Unternehmen', legal: 'Rechtliches' },
    newsletter: {
      tag: 'Reise-Updates',
      desc: 'Erhalten Sie exklusive Pi-Prämien und Reiseziel-News.',
      placeholder: 'ihre@email.com',
      btn: 'Abonnieren',
    },
    copyright: 'Va Travel. Alle Rechte vorbehalten.',
    poweredBy: 'Powered by π Pi Network',
    aiPowered: 'KI-Gestützt',
  },
  common: {
    bookNow: 'Jetzt Buchen',
    viewAll: 'Alle Anzeigen',
    perNight: '/Nacht',
    perPerson: 'Pro Person',
    freeEntry: 'Kostenloser Eintritt',
    loading: 'Laden',
    notFound: 'Nicht Gefunden',
    search: 'Suchen',
    filters: 'Filter',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',
    back: 'Zurück',
    share: 'Teilen',
    save: 'Speichern',
    close: 'Schließen',
    next: 'Weiter',
    prev: 'Zurück',
    reviews: 'Bewertungen',
    writeReview: 'Bewertung Schreiben',
    featured: 'Empfohlen',
    popular: 'Beliebt',
    comingSoon: 'Demnächst',
  },
  pages: {
    about: { title: 'Über Va Travel', subtitle: 'Unsere Geschichte' },
    hotels: { title: 'Finden Sie Ihr Perfektes Hotel', subtitle: 'Entdecken', searchPlaceholder: 'Hotels, Städte suchen...' },
    attractions: { title: 'Tolle Attraktionen', subtitle: 'Entdecken', searchPlaceholder: 'Attraktionen suchen...' },
    restaurants: { title: 'Entdecken Sie Tolle Restaurants', subtitle: 'Kulinarik', searchPlaceholder: 'Restaurants, Küchen suchen...' },
    bookings: { title: 'Meine Buchungen', empty: 'Noch Keine Buchungen', emptyDesc: 'Ihre bevorstehenden Reisen erscheinen hier.' },
    dashboard: { title: 'Dashboard', greeting: 'Willkommen' },
    wallet: { title: 'Mein Wallet', connect: 'Pi Wallet Verbinden', connectDesc: 'Verbinden Sie Ihr Pi-Wallet, um Ihr Guthaben zu sehen und Prämien zu verdienen.', noBrowser: 'Pi Browser Erforderlich' },
  },
};

const zh: Translations = {
  nav: {
    hotels: '酒店',
    attractions: '景点',
    restaurants: '餐厅',
    aiAssistant: 'AI助手',
    signIn: '登录',
    signUp: '注册',
    dashboard: '控制台',
    signOut: '退出',
  },
  hero: {
    tag: 'Pi驱动 · AI优先 · 全球',
    heading1: '世界',
    heading2: '等待着您',
    heading3: '',
    subheading: '探索非凡目的地。用Pi预订。AI精选的旅行体验。',
    searchPlaceholder: {
      hotels: '搜索酒店…',
      attractions: '搜索景点…',
      restaurants: '搜索餐厅…',
      ai: '询问AI…',
    },
    search: '搜索',
    stats: {
      countries: '个国家',
      properties: '个房源',
      travelers: '位旅行者',
      payments: 'Pi支付',
    },
  },
  features: {
    sectionTag: '为什么选择Va Travel',
    sectionTitle1: '旅行',
    sectionTitle2: '重新想象',
    items: [
      { title: 'AI精选旅行', desc: 'Claude AI提供的个性化推荐，学习您的偏好。' },
      { title: '全球覆盖', desc: '180+个国家，50,000+房源，数百万体验触手可及。' },
      { title: 'Pi支付', desc: '使用Pi Network无缝预订酒店、游览和餐饮。' },
      { title: '认证房源', desc: '每个房源都经过人工审核，确保最高质量标准。' },
      { title: '即时预订', desc: '实时可用性和几秒内确认的预订。' },
      { title: '礼宾支持', desc: '人类专家和AI提供24/7多语言支持。' },
    ],
  },
  destinations: {
    sectionTag: '热门目的地',
    sectionTitle1: '您要去',
    sectionTitle2: '哪里？',
    viewAll: '查看全部',
  },
  howItWorks: {
    sectionTag: '如何运作',
    sectionTitle1: '四步走向',
    sectionTitle2: '冒险',
    steps: [
      { num: '01', title: '创建账户', desc: '用Pi钱包几秒注册。无需信用卡。' },
      { num: '02', title: '探索', desc: '浏览AI精选的全球酒店、餐厅和景点。' },
      { num: '03', title: '用Pi预订', desc: '使用Pi Network无缝支付——世界上最易用的加密货币。' },
      { num: '04', title: '旅行并赚取', desc: '享受旅程，为每次预订和评价赚取Pi奖励。' },
    ],
    stats: {
      bookingTime: '< 60秒',
      bookingTimeLabel: '平均预订时间',
      hiddenFees: '0%',
      hiddenFeesLabel: '隐藏费用',
      support: '24/7',
      supportLabel: '支持可用',
    },
  },
  piIntegration: {
    sectionTag: 'Pi Network集成',
    sectionTitle: '用Pi支付',
    subheading: 'Va Travel是首批原生集成Pi Network支付的豪华旅行平台之一。',
    pillars: [
      { title: '赚取Pi奖励', desc: '每次预订、评价和推荐都能获得Pi。' },
      { title: '安全支付', desc: 'Pi区块链确保每笔交易透明防篡改。' },
      { title: '全球通用', desc: '在全球数千个认证房源和体验中使用Pi。' },
      { title: '不断增长的生态系统', desc: '加入拥有47M+活跃用户的全球最大加密社区。' },
    ],
    steps: [
      '将Pi钱包连接到Va Travel账户。',
      '从数千个认证房源中浏览选择。',
      '确认预订——用Pi即时支付。',
      '旅行、赚取奖励、留下认证评价。',
    ],
    connectBtn: '连接Pi钱包',
    stats: [
      { suffix: 'M+', label: 'Pi用户' },
      { suffix: '+', label: '国家' },
      { suffix: '%', label: '交易手续费' },
      { suffix: '%', label: '区块链保障' },
    ],
  },
  footer: {
    description: '基于Pi Network的AI驱动全球旅行平台。预订、探索并赚取Pi奖励。',
    sections: { explore: '探索', account: '账户', company: '公司', legal: '法律' },
    newsletter: {
      tag: '旅行资讯',
      desc: '获取专属Pi奖励和目的地新闻。',
      placeholder: '您的@邮箱.com',
      btn: '订阅',
    },
    copyright: 'Va Travel. 保留所有权利。',
    poweredBy: '由 π Pi Network 驱动',
    aiPowered: 'AI驱动',
  },
  common: {
    bookNow: '立即预订',
    viewAll: '查看全部',
    perNight: '/晚',
    perPerson: '每人',
    freeEntry: '免费入场',
    loading: '加载中',
    notFound: '未找到',
    search: '搜索',
    filters: '筛选',
    apply: '应用',
    reset: '重置',
    back: '返回',
    share: '分享',
    save: '保存',
    close: '关闭',
    next: '下一页',
    prev: '上一页',
    reviews: '评价',
    writeReview: '写评价',
    featured: '精选',
    popular: '热门',
    comingSoon: '即将推出',
  },
  pages: {
    about: { title: '关于Va Travel', subtitle: '我们的故事' },
    hotels: { title: '寻找您的完美酒店', subtitle: '探索', searchPlaceholder: '搜索酒店、城市...' },
    attractions: { title: '精彩景点', subtitle: '发现', searchPlaceholder: '搜索景点...' },
    restaurants: { title: '探索精彩餐厅', subtitle: '美食', searchPlaceholder: '搜索餐厅、菜系...' },
    bookings: { title: '我的预订', empty: '暂无预订', emptyDesc: '您即将到来的旅程将显示在这里。' },
    dashboard: { title: '控制台', greeting: '欢迎' },
    wallet: { title: '我的钱包', connect: '连接Pi钱包', connectDesc: '连接Pi钱包以查看余额并在每次预订中赚取返现。', noBrowser: '需要Pi浏览器' },
  },
};

const ja: Translations = {
  nav: {
    hotels: 'ホテル',
    attractions: '観光地',
    restaurants: 'レストラン',
    aiAssistant: 'AIアシスタント',
    signIn: 'ログイン',
    signUp: '新規登録',
    dashboard: 'ダッシュボード',
    signOut: 'ログアウト',
  },
  hero: {
    tag: 'Pi搭載 · AI優先 · グローバル',
    heading1: '世界が',
    heading2: '待っています',
    heading3: '',
    subheading: '非凡な目的地を発見。Piで予約。AIが厳選した旅行体験。',
    searchPlaceholder: {
      hotels: 'ホテルを検索…',
      attractions: '観光地を検索…',
      restaurants: 'レストランを検索…',
      ai: 'AIに質問…',
    },
    search: '検索',
    stats: {
      countries: 'か国',
      properties: '件の宿泊施設',
      travelers: '人の旅行者',
      payments: 'Pi決済',
    },
  },
  features: {
    sectionTag: 'なぜVa Travelか',
    sectionTitle1: '旅行を',
    sectionTitle2: '再発明',
    items: [
      { title: 'AI厳選旅行', desc: 'Claude AIがあなたの好みを学び、パーソナライズされた提案を提供。' },
      { title: 'グローバルな展開', desc: '180か国以上、5万件以上の宿泊施設、数百万の体験が手の届く場所に。' },
      { title: 'Pi決済', desc: 'Pi Networkを使ってホテル、ツアー、レストランをシームレスに予約。' },
      { title: '認証済みリスト', desc: 'すべての物件と観光地は最高品質基準を確保するため手動でレビュー。' },
      { title: '即時予約', desc: 'リアルタイムの空き状況と数秒での予約確認。' },
      { title: 'コンシェルジュサポート', desc: '人間の専門家とAIによる24/7多言語サポート。' },
    ],
  },
  destinations: {
    sectionTag: '人気の目的地',
    sectionTitle1: 'どこへ',
    sectionTitle2: '行きますか？',
    viewAll: 'すべて見る',
  },
  howItWorks: {
    sectionTag: '使い方',
    sectionTitle1: '冒険への',
    sectionTitle2: '4つのステップ',
    steps: [
      { num: '01', title: 'アカウント作成', desc: 'Pi Walletで数秒で登録。クレジットカード不要。' },
      { num: '02', title: '発見', desc: 'AI厳選のホテル、レストラン、観光地を世界中で探索。' },
      { num: '03', title: 'Piで予約', desc: 'Pi Networkでシームレスに支払い — 世界で最もアクセスしやすい暗号通貨。' },
      { num: '04', title: '旅行して稼ぐ', desc: '旅行を楽しみ、予約やレビューでPiリワードを獲得。' },
    ],
    stats: {
      bookingTime: '60秒以内',
      bookingTimeLabel: '平均予約時間',
      hiddenFees: '0%',
      hiddenFeesLabel: '隠れた手数料',
      support: '24/7',
      supportLabel: 'サポート利用可能',
    },
  },
  piIntegration: {
    sectionTag: 'Pi Networkとの連携',
    sectionTitle: 'Piで支払う',
    subheading: 'Va TravelはPi Network決済とネイティブに統合された最初の高級旅行プラットフォームの一つです。',
    pillars: [
      { title: 'Piリワードを獲得', desc: 'プラットフォームでの予約、レビュー、紹介ごとにPiを獲得。' },
      { title: '安全な決済', desc: 'PiのブロックチェーンがすべてのトランザクションをTransparencyを確保。' },
      { title: 'グローバルな受け入れ', desc: '世界中の何千もの認証済み宿泊施設や体験でPiを使用。' },
      { title: '成長するエコシステム', desc: '4700万人以上のアクティブユーザーを持つ世界最大の暗号コミュニティに参加。' },
    ],
    steps: [
      'Pi WalletをVa Travelアカウントに接続。',
      '何千もの認証済みリストから閲覧・選択。',
      '予約を確認 — Piで即座に支払い。',
      '旅行し、リワードを獲得し、認証済みレビューを残す。',
    ],
    connectBtn: 'Pi Walletを接続',
    stats: [
      { suffix: 'M+', label: 'Piユーザー' },
      { suffix: '+', label: 'か国' },
      { suffix: '%', label: 'トランザクション手数料' },
      { suffix: '%', label: 'ブロックチェーン保護' },
    ],
  },
  footer: {
    description: 'Pi Networkに構築されたAI搭載グローバル旅行プラットフォーム。予約、探索、Piリワード獲得。',
    sections: { explore: '探索', account: 'アカウント', company: '会社', legal: '法律' },
    newsletter: {
      tag: '旅行アップデート',
      desc: '限定Piリワードと目的地ニュースを取得。',
      placeholder: 'あなたの@email.com',
      btn: '購読',
    },
    copyright: 'Va Travel. All rights reserved.',
    poweredBy: 'π Pi Network搭載',
    aiPowered: 'AI搭載',
  },
  common: {
    bookNow: '今すぐ予約',
    viewAll: 'すべて見る',
    perNight: '/泊',
    perPerson: '1人あたり',
    freeEntry: '無料入場',
    loading: '読み込み中',
    notFound: '見つかりません',
    search: '検索',
    filters: 'フィルター',
    apply: '適用',
    reset: 'リセット',
    back: '戻る',
    share: '共有',
    save: '保存',
    close: '閉じる',
    next: '次へ',
    prev: '前へ',
    reviews: 'レビュー',
    writeReview: 'レビューを書く',
    featured: 'おすすめ',
    popular: '人気',
    comingSoon: '近日公開',
  },
  pages: {
    about: { title: 'Va Travelについて', subtitle: '私たちのストーリー' },
    hotels: { title: '完璧なホテルを見つける', subtitle: '探索', searchPlaceholder: 'ホテル、都市を検索...' },
    attractions: { title: '素晴らしい観光地', subtitle: '発見', searchPlaceholder: '観光地を検索...' },
    restaurants: { title: '素晴らしいレストランを発見', subtitle: 'グルメ', searchPlaceholder: 'レストラン、料理を検索...' },
    bookings: { title: '予約一覧', empty: 'まだ予約がありません', emptyDesc: '今後の旅行がここに表示されます。' },
    dashboard: { title: 'ダッシュボード', greeting: 'ようこそ' },
    wallet: { title: 'マイウォレット', connect: 'Pi Walletを接続', connectDesc: 'Pi Walletを接続して残高を確認し、予約ごとにキャッシュバックを獲得。', noBrowser: 'Pi Browserが必要' },
  },
};

const ru: Translations = {
  nav: {
    hotels: 'Отели',
    attractions: 'Достопримечательности',
    restaurants: 'Рестораны',
    aiAssistant: 'ИИ-Ассистент',
    signIn: 'Войти',
    signUp: 'Регистрация',
    dashboard: 'Панель',
    signOut: 'Выйти',
  },
  hero: {
    tag: 'На Pi · ИИ Прежде всего · Глобально',
    heading1: 'Мир',
    heading2: 'Ждёт',
    heading3: 'Вас',
    subheading: 'Откройте для себя необыкновенные направления. Бронируйте с Pi. Путешествия, отобранные ИИ.',
    searchPlaceholder: {
      hotels: 'Поиск отелей…',
      attractions: 'Поиск достопримечательностей…',
      restaurants: 'Поиск ресторанов…',
      ai: 'Спросить ИИ…',
    },
    search: 'Поиск',
    stats: {
      countries: 'Стран',
      properties: 'Объектов',
      travelers: 'Путешественников',
      payments: 'Pi-Платежи',
    },
  },
  features: {
    sectionTag: 'Почему Va Travel',
    sectionTitle1: 'Путешествие',
    sectionTitle2: 'Переосмыслено',
    items: [
      { title: 'Путешествие с ИИ', desc: 'Персонализированные рекомендации Claude AI, изучающего ваши предпочтения.' },
      { title: 'Глобальный охват', desc: '180+ стран, 50 000+ объектов и миллионы впечатлений у вас под рукой.' },
      { title: 'Платежи Pi', desc: 'Бесперебойное бронирование отелей, туров и ресторанов с Pi Network.' },
      { title: 'Проверенные объявления', desc: 'Каждый объект проверяется вручную для обеспечения высочайших стандартов качества.' },
      { title: 'Мгновенное бронирование', desc: 'Доступность в реальном времени и подтверждённые бронирования за секунды.' },
      { title: 'Поддержка консьержа', desc: 'Круглосуточная многоязычная поддержка от экспертов и ИИ.' },
    ],
  },
  destinations: {
    sectionTag: 'Популярные направления',
    sectionTitle1: 'Куда Вы',
    sectionTitle2: 'Отправитесь?',
    viewAll: 'Посмотреть все',
  },
  howItWorks: {
    sectionTag: 'Как это работает',
    sectionTitle1: 'Четыре шага к',
    sectionTitle2: 'Приключению',
    steps: [
      { num: '01', title: 'Создайте аккаунт', desc: 'Зарегистрируйтесь с Pi Wallet за секунды. Кредитная карта не нужна.' },
      { num: '02', title: 'Откройте для себя', desc: 'Просматривайте отобранные ИИ отели, рестораны и достопримечательности.' },
      { num: '03', title: 'Бронируйте с Pi', desc: 'Платите с Pi Network — самой доступной криптовалютой в мире.' },
      { num: '04', title: 'Путешествуйте и зарабатывайте', desc: 'Наслаждайтесь поездкой и зарабатывайте Pi за каждое бронирование и отзыв.' },
    ],
    stats: {
      bookingTime: '< 60сек',
      bookingTimeLabel: 'Среднее время бронирования',
      hiddenFees: '0%',
      hiddenFeesLabel: 'Скрытых платежей',
      support: '24/7',
      supportLabel: 'Поддержка доступна',
    },
  },
  piIntegration: {
    sectionTag: 'Интеграция Pi Network',
    sectionTitle: 'Платите с Pi',
    subheading: 'Va Travel — одна из первых люксовых туристических платформ, нативно интегрированных с Pi Network.',
    pillars: [
      { title: 'Зарабатывайте Pi', desc: 'Получайте Pi за каждое бронирование, отзыв и реферала.' },
      { title: 'Безопасные платежи', desc: 'Блокчейн Pi обеспечивает прозрачность каждой транзакции.' },
      { title: 'Глобальное принятие', desc: 'Используйте Pi в тысячах проверенных объектов и впечатлений по всему миру.' },
      { title: 'Растущая экосистема', desc: 'Станьте частью крупнейшего крипто-сообщества с 47M+ активных пользователей.' },
    ],
    steps: [
      'Подключите Pi Wallet к вашему аккаунту Va Travel.',
      'Просматривайте и выбирайте из тысяч проверенных объявлений.',
      'Подтвердите бронирование — платите мгновенно с Pi.',
      'Путешествуйте, зарабатывайте награды и оставляйте проверенные отзывы.',
    ],
    connectBtn: 'Подключить Pi Wallet',
    stats: [
      { suffix: 'M+', label: 'Пользователей Pi' },
      { suffix: '+', label: 'Стран' },
      { suffix: '%', label: 'Комиссия транзакций' },
      { suffix: '%', label: 'Защита блокчейном' },
    ],
  },
  footer: {
    description: 'Глобальная туристическая платформа на базе ИИ, построенная на Pi Network.',
    sections: { explore: 'Исследовать', account: 'Аккаунт', company: 'Компания', legal: 'Правовая информация' },
    newsletter: {
      tag: 'Обновления о путешествиях',
      desc: 'Получайте эксклюзивные Pi-награды и новости о направлениях.',
      placeholder: 'ваш@email.com',
      btn: 'Подписаться',
    },
    copyright: 'Va Travel. Все права защищены.',
    poweredBy: 'Работает на π Pi Network',
    aiPowered: 'На базе ИИ',
  },
  common: {
    bookNow: 'Забронировать',
    viewAll: 'Посмотреть все',
    perNight: '/ночь',
    perPerson: 'На человека',
    freeEntry: 'Бесплатный вход',
    loading: 'Загрузка',
    notFound: 'Не найдено',
    search: 'Поиск',
    filters: 'Фильтры',
    apply: 'Применить',
    reset: 'Сбросить',
    back: 'Назад',
    share: 'Поделиться',
    save: 'Сохранить',
    close: 'Закрыть',
    next: 'Далее',
    prev: 'Назад',
    reviews: 'Отзывы',
    writeReview: 'Написать отзыв',
    featured: 'Рекомендуем',
    popular: 'Популярное',
    comingSoon: 'Скоро',
  },
  pages: {
    about: { title: 'О Va Travel', subtitle: 'Наша история' },
    hotels: { title: 'Найдите идеальный отель', subtitle: 'Исследовать', searchPlaceholder: 'Поиск отелей, городов...' },
    attractions: { title: 'Удивительные достопримечательности', subtitle: 'Открыть', searchPlaceholder: 'Поиск достопримечательностей...' },
    restaurants: { title: 'Откройте для себя рестораны', subtitle: 'Гастрономия', searchPlaceholder: 'Поиск ресторанов, кухни...' },
    bookings: { title: 'Мои бронирования', empty: 'Бронирований пока нет', emptyDesc: 'Ваши предстоящие поездки появятся здесь.' },
    dashboard: { title: 'Панель управления', greeting: 'Добро пожаловать' },
    wallet: { title: 'Мой кошелёк', connect: 'Подключить Pi Wallet', connectDesc: 'Подключите кошелёк Pi для просмотра баланса и получения кэшбэка.', noBrowser: 'Требуется Pi Browser' },
  },
};

export const translations: Record<Locale, Translations> = { en, ar, fr, es, de, zh, ja, ru };

export function useTranslations(locale: string): Translations {
  return translations[(locale as Locale)] || translations.en;
}

export function t(locale: string): Translations {
  return translations[(locale as Locale)] || translations.en;
}
