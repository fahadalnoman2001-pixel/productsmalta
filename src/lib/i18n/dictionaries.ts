import { Locale } from "./config";

export interface Dictionary {
  common: {
    siteName: string;
    siteTagline: string;
    curatedDealsEurope: string;
    updatedPricesDaily: string;
    verifiedEuropeanPrices: string;
    home: string;
    allProducts: string;
    allCategories: string;
    categories: string;
    deals: string;
    allOffers: string;
    guides: string;
    buyingTips: string;
    weekendSales: string;
    hot: string;
    blog: string;
    aboutUs: string;
    contact: string;
    privacyPolicy: string;
    termsOfService: string;
    sitemap: string;
    searchPlaceholder: string;
    search: string;
    viewAllProducts: string;
    browseAll: string;
    totalCategories: string;
    subcategories: string;
    company: string;
    rightsReserved: string;
    affiliateDisclaimer: string;
    menuNavigation: string;
    quickLinks: string;
    browseCategoriesSubs: string;
    offersFound: string;
    offerFound: string;
    productsCount: string;
    noProductsFound: string;
    clearFilters: string;
    applyFilters: string;
    reset: string;
    filters: string;
    brand: string;
    retailer: string;
    price: string;
    minPrice: string;
    maxPrice: string;
    minRating: string;
    anyRating: string;
    fourStarUp: string;
    fourHalfStarUp: string;
    allBrands: string;
    allRetailers: string;
    sort: {
      newest: string;
      priceLowHigh: string;
      priceHighLow: string;
      highestRated: string;
      mostPopular: string;
    };
    viewDeal: string;
    viewDealOn: string;
    inStock: string;
    customerRating: string;
    reviews: string;
    featuredProducts: string;
    bestSellers: string;
    seeAll: string;
    latestIn: string;
    featuredCollection: string;
    curatedCategoryDeals: string;
    minRead: string;
    relatedArticles: string;
    relatedDeals: string;
    shareDeal: string;
    productDetailsFeatures: string;
    specifications: string;
    buyingGuideVerdict: string;
  };
  about: {
    title: string;
    metaTitle: string;
    metaDesc: string;
    tag: string;
    heading: string;
    subtitle: string;
    whoWeAreTitle: string;
    whoWeAreText: string;
    standardsTitle: string;
    standardsIntro: string;
    standard1Title: string;
    standard1Desc: string;
    standard2Title: string;
    standard2Desc: string;
    standard3Title: string;
    standard3Desc: string;
    standard4Title: string;
    standard4Desc: string;
    howWeMakeMoneyTitle: string;
    howWeMakeMoneyP1: string;
    howWeMakeMoneyP2: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
  contact: {
    title: string;
    metaTitle: string;
    metaDesc: string;
    heading: string;
    subtitle: string;
  };
  privacy: {
    title: string;
    metaTitle: string;
    metaDesc: string;
    intro: string;
    infoCollectTitle: string;
    infoCollectText: string;
    cookiesTitle: string;
    cookiesText: string;
    affiliateTitle: string;
    affiliateText: string;
    contactTitle: string;
    contactText: string;
  };
  terms: {
    title: string;
    metaTitle: string;
    metaDesc: string;
    intro: string;
    useOfSiteTitle: string;
    useOfSiteText: string;
    affiliateLinksTitle: string;
    affiliateLinksText: string;
    liabilityTitle: string;
    liabilityText: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    common: {
      siteName: "YourOffers.eu",
      siteTagline: "Curated Deals & Buying Guides Across Europe.",
      curatedDealsEurope: "Curated deals delivered across Europe",
      updatedPricesDaily: "Updated affiliate prices daily",
      verifiedEuropeanPrices: "Verified European prices & daily deals",
      home: "Home",
      allProducts: "All Products",
      allCategories: "All Categories",
      categories: "Categories",
      deals: "Deals",
      allOffers: "All Offers",
      guides: "Guides",
      buyingTips: "Buying Tips",
      weekendSales: "Weekend Sales",
      hot: "HOT",
      blog: "Blog & Guides",
      aboutUs: "About Us",
      contact: "Contact",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      sitemap: "Sitemap",
      searchPlaceholder: "Search products, top brands, categories and deals...",
      search: "Search",
      viewAllProducts: "View All Products",
      browseAll: "Browse All",
      totalCategories: "total",
      subcategories: "subcategories",
      company: "Company",
      rightsReserved: "All rights reserved.",
      affiliateDisclaimer: "Some links are affiliate links; we may earn a commission at no extra cost to you.",
      menuNavigation: "Menu Navigation",
      quickLinks: "Quick Links",
      browseCategoriesSubs: "Browse Categories & Subcategories",
      offersFound: "offers found",
      offerFound: "offer found",
      productsCount: "products",
      noProductsFound: "No products match your filters.",
      clearFilters: "Clear filters",
      applyFilters: "Apply Filters",
      reset: "Reset",
      filters: "Filters",
      brand: "Brand",
      retailer: "Retailer",
      price: "Price",
      minPrice: "Min €",
      maxPrice: "Max €",
      minRating: "Min Rating",
      anyRating: "Any",
      fourStarUp: "4★ & up",
      fourHalfStarUp: "4.5★ & up",
      allBrands: "All Brands",
      allRetailers: "All Retailers",
      sort: {
        newest: "Newest",
        priceLowHigh: "Price: Low to High",
        priceHighLow: "Price: High to Low",
        highestRated: "Highest Rated",
        mostPopular: "Most Popular"
      },
      viewDeal: "View Deal",
      viewDealOn: "View Deal on",
      inStock: "In Stock & Verified",
      customerRating: "Customer Rating",
      reviews: "reviews",
      featuredProducts: "Featured Products",
      bestSellers: "Best Sellers",
      seeAll: "See all →",
      latestIn: "Latest in",
      featuredCollection: "Featured Collection",
      curatedCategoryDeals: "Curated European Category Deals",
      minRead: "min read",
      relatedArticles: "Related Articles",
      relatedDeals: "Related Deals",
      shareDeal: "Share Deal",
      productDetailsFeatures: "Product Details & Features",
      specifications: "Specifications",
      buyingGuideVerdict: "Buying Guide & Verdict"
    },
    about: {
      title: "About YourOffers.eu — Our Editorial Standards & Team",
      metaTitle: "About YourOffers.eu — Our Editorial Standards & Team",
      metaDesc: "Learn how YourOffers.eu curates affiliate deals across Europe, our editorial policy, how we make money, and how you can trust our buying guides.",
      tag: "Editorial Integrity & Transparency",
      heading: "About YourOffers.eu",
      subtitle: "Your trusted guide to the finest curated deals, genuine discounts, and unbiased product comparisons across the European Union.",
      whoWeAreTitle: "Who We Are",
      whoWeAreText: "YourOffers.eu is an independent shopping guide and curated affiliate deals platform designed to serve European shoppers. We handpick top-rated products across 12 primary categories — including Electronics, Computers & Office, Home & Kitchen, Fashion, Beauty, and Sports — from verified, reputable retailers, updating deals and prices daily.",
      standardsTitle: "Our Editorial Standards",
      standardsIntro: "Every product featured on YourOffers.eu undergoes rigorous editorial evaluation based on:",
      standard1Title: "Verified Retailer Trust",
      standard1Desc: "We only link to authorized, reputable merchants with reliable shipping across Europe.",
      standard2Title: "Authentic Customer Feedback",
      standard2Desc: "Real reviews and user satisfaction benchmarks.",
      standard3Title: "True Price Competitiveness",
      standard3Desc: "Verified discounts, preventing artificial price inflations.",
      standard4Title: "Independent Selection",
      standard4Desc: "Retailers cannot pay for positive editorial rankings or product placements.",
      howWeMakeMoneyTitle: "Affiliate Disclosure & Transparency",
      howWeMakeMoneyP1: "YourOffers.eu is reader-supported. When you click our outbound affiliate links and make a purchase, we may receive a small referral commission from the merchant — at zero additional cost to you.",
      howWeMakeMoneyP2: "This commission allows us to keep the site 100% free, research market trends, maintain automated price trackers, and publish in-depth buying guides.",
      ctaTitle: "Have Questions or Suggestions?",
      ctaSubtitle: "Our editorial team welcomes reader feedback, corrections, and merchant inquiries.",
      ctaButton: "Contact Editorial Team"
    },
    contact: {
      title: "Contact Us — YourOffers.eu",
      metaTitle: "Contact Us — YourOffers.eu",
      metaDesc: "Get in touch with the YourOffers.eu editorial and partnerships team.",
      heading: "Contact Us",
      subtitle: "Have a question or partnership request? Reach out below."
    },
    privacy: {
      title: "Privacy Policy — YourOffers.eu",
      metaTitle: "Privacy Policy — YourOffers.eu",
      metaDesc: "Privacy Policy for YourOffers.eu. Learn how we handle your data and our cookie policy.",
      intro: "This Privacy Policy describes how YourOffers.eu collects, uses and protects your information.",
      infoCollectTitle: "Information We Collect",
      infoCollectText: "We collect anonymous analytics data (via Google Analytics and Meta Pixel) and click data on affiliate links to improve our recommendations across Europe.",
      cookiesTitle: "Cookies",
      cookiesText: "We use cookies for analytics, remarketing and to remember your preferences.",
      affiliateTitle: "Affiliate Disclosure",
      affiliateText: "Some links on this site are affiliate links. We may earn a commission at no extra cost to you when you buy through these links.",
      contactTitle: "Contact",
      contactText: "Questions about privacy? Contact us via the Contact page."
    },
    terms: {
      title: "Terms of Service — YourOffers.eu",
      metaTitle: "Terms of Service — YourOffers.eu",
      metaDesc: "Terms of Service for YourOffers.eu. Read our site usage terms and affiliate disclosure.",
      intro: "By using YourOffers.eu you agree to these terms.",
      useOfSiteTitle: "Use of Site",
      useOfSiteText: "Content is provided for informational purposes. Product availability and prices are subject to change on the retailer's site.",
      affiliateLinksTitle: "Affiliate Links",
      affiliateLinksText: "We participate in affiliate programs and may receive commissions from qualifying purchases.",
      liabilityTitle: "Limitation of Liability",
      liabilityText: "We are not responsible for products purchased through affiliate links; those are handled by the respective retailers."
    }
  },
  de: {
    common: {
      siteName: "YourOffers.eu",
      siteTagline: "Kuratierte Angebote & Kaufratgeber in ganz Europa.",
      curatedDealsEurope: "Kuratierte Angebote für ganz Europa",
      updatedPricesDaily: "Täglich aktualisierte Affiliate-Preise",
      verifiedEuropeanPrices: "Geprüfte europäische Preise & tägliche Deals",
      home: "Startseite",
      allProducts: "Alle Produkte",
      allCategories: "Alle Kategorien",
      categories: "Kategorien",
      deals: "Angebote",
      allOffers: "Alle Angebote",
      guides: "Ratgeber",
      buyingTips: "Kauftipps",
      weekendSales: "Wochenend-Sales",
      hot: "HEISS",
      blog: "Blog & Ratgeber",
      aboutUs: "Über uns",
      contact: "Kontakt",
      privacyPolicy: "Datenschutz",
      termsOfService: "Nutzungsbedingungen",
      sitemap: "Sitemap",
      searchPlaceholder: "Produkte, Top-Marken, Kategorien und Deals suchen...",
      search: "Suchen",
      viewAllProducts: "Alle Produkte ansehen",
      browseAll: "Alle durchsuchen",
      totalCategories: "gesamt",
      subcategories: "Unterkategorien",
      company: "Unternehmen",
      rightsReserved: "Alle Rechte vorbehalten.",
      affiliateDisclaimer: "Einige Links sind Affiliate-Links; wir erhalten möglicherweise eine Provision ohne Zusatzkosten für Sie.",
      menuNavigation: "Menü-Navigation",
      quickLinks: "Schnellzugriff",
      browseCategoriesSubs: "Kategorien & Unterkategorien durchsuchen",
      offersFound: "Angebote gefunden",
      offerFound: "Angebot gefunden",
      productsCount: "Produkte",
      noProductsFound: "Keine Produkte entsprechen Ihren Filtern.",
      clearFilters: "Filter zurücksetzen",
      applyFilters: "Filter anwenden",
      reset: "Zurücksetzen",
      filters: "Filter",
      brand: "Marke",
      retailer: "Händler",
      price: "Preis",
      minPrice: "Min €",
      maxPrice: "Max €",
      minRating: "Mindestbewertung",
      anyRating: "Alle",
      fourStarUp: "4★ & mehr",
      fourHalfStarUp: "4.5★ & mehr",
      allBrands: "Alle Marken",
      allRetailers: "Alle Händler",
      sort: {
        newest: "Neueste",
        priceLowHigh: "Preis: Aufsteigend",
        priceHighLow: "Preis: Absteigend",
        highestRated: "Bestbewertet",
        mostPopular: "Beliebteste"
      },
      viewDeal: "Zum Angebot",
      viewDealOn: "Angebot ansehen bei",
      inStock: "Auf Lager & Verifiziert",
      customerRating: "Kundenbewertung",
      reviews: "Bewertungen",
      featuredProducts: "Empfohlene Produkte",
      bestSellers: "Bestseller",
      seeAll: "Alle ansehen →",
      latestIn: "Neuheiten in",
      featuredCollection: "Empfohlene Kollektion",
      curatedCategoryDeals: "Kuratierte europäische Kategorie-Angebote",
      minRead: "Min. Lesezeit",
      relatedArticles: "Ähnliche Artikel",
      relatedDeals: "Passende Angebote",
      shareDeal: "Angebot teilen",
      productDetailsFeatures: "Produktdetails & Eigenschaften",
      specifications: "Spezifikationen",
      buyingGuideVerdict: "Kaufratgeber & Fazit"
    },
    about: {
      title: "Über YourOffers.eu — Unsere redaktionellen Standards & Team",
      metaTitle: "Über YourOffers.eu — Unsere redaktionellen Standards & Team",
      metaDesc: "Erfahren Sie, wie YourOffers.eu Angebote in Europa kuratiert, unsere redaktionellen Richtlinien und wie Sie unseren Ratgebern vertrauen können.",
      tag: "Redaktionelle Integrität & Transparenz",
      heading: "Über YourOffers.eu",
      subtitle: "Ihr zuverlässiger Einkaufsratgeber für die besten kuratierten Angebote, echte Rabatte und unabhängige Produktvergleiche in der Europäischen Union.",
      whoWeAreTitle: "Wer wir sind",
      whoWeAreText: "YourOffers.eu ist ein unabhängiger Einkaufsratgeber und eine Plattform für kuratierte Angebote für europäische Konsumenten. Wir wählen erstklassige Produkte aus 12 Hauptkategorien – darunter Elektronik, Computer & Büro, Haushalt & Küche, Mode, Beauty und Sport – von geprüften Händlern aus und aktualisieren Preise täglich.",
      standardsTitle: "Unsere redaktionellen Standards",
      standardsIntro: "Jedes auf YourOffers.eu vorgestellte Produkt durchläuft eine sorgfältige redaktionelle Prüfung:",
      standard1Title: "Verifizierte Händler",
      standard1Desc: "Wir verlinken nur autorisierte Händler mit zuverlässiger Lieferung in Europa.",
      standard2Title: "Echtes Kundenfeedback",
      standard2Desc: "Reale Kundenbewertungen und Zufriedenheitswerte.",
      standard3Title: "Echte Preisvorteile",
      standard3Desc: "Verifizierte Rabatte zum Schutz vor künstlichen Preiserhöhungen.",
      standard4Title: "Unabhängige Auswahl",
      standard4Desc: "Händler können keine positiven Platzierungen oder Tests erkaufen.",
      howWeMakeMoneyTitle: "Affiliate-Offenlegung & Transparenz",
      howWeMakeMoneyP1: "YourOffers.eu finanziert sich durch Leser. Wenn Sie auf einen Affiliate-Link klicken und einkaufen, erhalten wir möglicherweise eine kleine Vermittlungsprovision – ohne jegliche Zusatzkosten für Sie.",
      howWeMakeMoneyP2: "Diese Provisionen ermöglichen es uns, die Plattform 100% kostenlos zu halten, Marktanalysen durchzuführen und ausführliche Einkaufsratgeber zu veröffentlichen.",
      ctaTitle: "Haben Sie Fragen oder Anregungen?",
      ctaSubtitle: "Unsere Redaktion freut sich über Feedback, Korrekturen und Händleranfragen.",
      ctaButton: "Redaktion kontaktieren"
    },
    contact: {
      title: "Kontaktieren Sie uns — YourOffers.eu",
      metaTitle: "Kontaktieren Sie uns — YourOffers.eu",
      metaDesc: "Treten Sie mit dem Redaktions- und Partnerschaftsteam von YourOffers.eu in Kontakt.",
      heading: "Kontakt",
      subtitle: "Haben Sie Fragen oder eine Partnerschaftsanfrage? Schreiben Sie uns."
    },
    privacy: {
      title: "Datenschutzerklärung — YourOffers.eu",
      metaTitle: "Datenschutzerklärung — YourOffers.eu",
      metaDesc: "Datenschutzerklärung für YourOffers.eu. Erfahren Sie, wie wir Ihre Daten schützen und Cookies verwenden.",
      intro: "Diese Datenschutzerklärung beschreibt, wie YourOffers.eu Ihre Informationen erhebt, nutzt und schützt.",
      infoCollectTitle: "Informationen, die wir erfassen",
      infoCollectText: "Wir erfassen anonyme Analysedaten (über Google Analytics und Meta Pixel) sowie Klickdaten auf Partnerlinks, um unsere Empfehlungen zu verbessern.",
      cookiesTitle: "Cookies",
      cookiesText: "Wir verwenden Cookies für Analysen, Marketing und zur Speicherung Ihrer Spracheinstellungen.",
      affiliateTitle: "Affiliate-Hinweis",
      affiliateText: "Einige Links auf dieser Website sind Affiliate-Links. Wir erhalten möglicherweise eine Provision, wenn Sie über diese Links einkaufen.",
      contactTitle: "Kontakt",
      contactText: "Fragen zum Datenschutz? Kontaktieren Sie uns über die Kontaktseite."
    },
    terms: {
      title: "Nutzungsbedingungen — YourOffers.eu",
      metaTitle: "Nutzungsbedingungen — YourOffers.eu",
      metaDesc: "Nutzungsbedingungen für YourOffers.eu. Lesen Sie unsere Nutzungsbedingungen und Hinweise.",
      intro: "Mit der Nutzung von YourOffers.eu stimmen Sie diesen Bedingungen zu.",
      useOfSiteTitle: "Nutzung der Website",
      useOfSiteText: "Inhalte dienen reinen Informationszwecken. Produktverfügbarkeit und Preise können sich beim jeweiligen Händler ändern.",
      affiliateLinksTitle: "Affiliate-Links",
      affiliateLinksText: "Wir nehmen an Partnerprogrammen teil und erhalten Provisionen für qualifizierte Käufe.",
      liabilityTitle: "Haftungsbeschränkung",
      liabilityText: "Wir haften nicht für Produkte, die über externe Partnerlinks erworben wurden; diese unterliegen den Bedingungen der jeweiligen Händler."
    }
  },
  fr: {
    common: {
      siteName: "YourOffers.eu",
      siteTagline: "Offres sélectionnées & guides d'achat à travers l'Europe.",
      curatedDealsEurope: "Bons plans sélectionnés livrés partout en Europe",
      updatedPricesDaily: "Prix d'affiliation mis à jour quotidiennement",
      verifiedEuropeanPrices: "Prix européens vérifiés & bons plans quotidiens",
      home: "Accueil",
      allProducts: "Tous les produits",
      allCategories: "Toutes les catégories",
      categories: "Catégories",
      deals: "Bons Plans",
      allOffers: "Toutes les offres",
      guides: "Guides",
      buyingTips: "Conseils d'achat",
      weekendSales: "Ventes du Week-end",
      hot: "TOP",
      blog: "Blog & Guides",
      aboutUs: "À propos",
      contact: "Contact",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      sitemap: "Plan du site",
      searchPlaceholder: "Rechercher des produits, marques, catégories et offres...",
      search: "Rechercher",
      viewAllProducts: "Voir tous les produits",
      browseAll: "Tout parcourir",
      totalCategories: "au total",
      subcategories: "sous-catégories",
      company: "Entreprise",
      rightsReserved: "Tous droits réservés.",
      affiliateDisclaimer: "Certains liens sont affiliés ; nous pouvons percevoir une commission sans frais supplémentaires pour vous.",
      menuNavigation: "Navigation du Menu",
      quickLinks: "Liens Rapides",
      browseCategoriesSubs: "Parcourir les catégories et sous-catégories",
      offersFound: "offres trouvées",
      offerFound: "offre trouvée",
      productsCount: "produits",
      noProductsFound: "Aucun produit ne correspond à vos filtres.",
      clearFilters: "Effacer les filtres",
      applyFilters: "Appliquer les filtres",
      reset: "Réinitialiser",
      filters: "Filtres",
      brand: "Marque",
      retailer: "Marchand",
      price: "Prix",
      minPrice: "Min €",
      maxPrice: "Max €",
      minRating: "Note minimale",
      anyRating: "Toutes",
      fourStarUp: "4★ & plus",
      fourHalfStarUp: "4.5★ & plus",
      allBrands: "Toutes les marques",
      allRetailers: "Tous les marchands",
      sort: {
        newest: "Plus récents",
        priceLowHigh: "Prix : Croissant",
        priceHighLow: "Prix : Décroissant",
        highestRated: "Mieux notés",
        mostPopular: "Plus populaires"
      },
      viewDeal: "Voir l'offre",
      viewDealOn: "Voir l'offre sur",
      inStock: "En stock & Vérifié",
      customerRating: "Avis clients",
      reviews: "avis",
      featuredProducts: "Produits Vedettes",
      bestSellers: "Meilleures Ventes",
      seeAll: "Tout voir →",
      latestIn: "Nouveautés en",
      featuredCollection: "Collection Spéciale",
      curatedCategoryDeals: "Offres européennes par catégorie",
      minRead: "min de lecture",
      relatedArticles: "Articles similaires",
      relatedDeals: "Offres similaires",
      shareDeal: "Partager l'offre",
      productDetailsFeatures: "Détails & Caractéristiques",
      specifications: "Spécifications",
      buyingGuideVerdict: "Guide d'achat & Avis"
    },
    about: {
      title: "À propos de YourOffers.eu — Standards éditoriaux & Équipe",
      metaTitle: "À propos de YourOffers.eu — Standards éditoriaux & Équipe",
      metaDesc: "Découvrez comment YourOffers.eu sélectionne les meilleures offres en Europe, notre charte éditoriale et la transparence de nos guides d'achat.",
      tag: "Intégrité éditoriale & Transparence",
      heading: "À propos de YourOffers.eu",
      subtitle: "Votre guide d'achat de référence pour les meilleures offres sélectionnées, vraies remises et comparatifs impartiaux dans l'Union Européenne.",
      whoWeAreTitle: "Qui sommes-nous",
      whoWeAreText: "YourOffers.eu est un guide d'achat indépendant et une plateforme de bons plans vérifiés pour les consommateurs européens. Nous sélectionnons des produits réputés dans 12 catégories clés (Électronique, Informatique, Maison & Cuisine, Mode, Beauté, Sport) auprès de marchands fiables.",
      standardsTitle: "Nos critères éditoriaux",
      standardsIntro: "Chaque produit recommandé fait l'objet d'une sélection rigoureuse :",
      standard1Title: "Marchands vérifiés",
      standard1Desc: "Partenariats uniquement avec des vendeurs fiables et reconnus en Europe.",
      standard2Title: "Avis clients authentiques",
      standard2Desc: "Analyse des retours d'expérience et notes réelles d'utilisateurs.",
      standard3Title: "Vraies réductions",
      standard3Desc: "Contrôle des prix historiques pour éviter les fausses remises.",
      standard4Title: "Indépendance totale",
      standard4Desc: "Les marchands ne peuvent pas payer pour obtenir un avis positif.",
      howWeMakeMoneyTitle: "Transparence & Affiliation",
      howWeMakeMoneyP1: "YourOffers.eu est soutenu par ses lecteurs. Lorsque vous achetez via nos liens affiliés, nous pouvons toucher une commission sans surcoût pour vous.",
      howWeMakeMoneyP2: "Cela nous permet de garder le site 100% gratuit, de développer des outils de suivi des prix et de rédiger des comparatifs détaillés.",
      ctaTitle: "Une question ou suggestion ?",
      ctaSubtitle: "Notre rédaction reste à votre disposition pour tout commentaire ou proposition de partenariat.",
      ctaButton: "Contacter l'équipe"
    },
    contact: {
      title: "Contactez-nous — YourOffers.eu",
      metaTitle: "Contactez-nous — YourOffers.eu",
      metaDesc: "Contactez l'équipe éditoriale et les partenariats de YourOffers.eu.",
      heading: "Contactez-nous",
      subtitle: "Une question ou une demande de partenariat ? Envoyez-nous un message."
    },
    privacy: {
      title: "Politique de confidentialité — YourOffers.eu",
      metaTitle: "Politique de confidentialité — YourOffers.eu",
      metaDesc: "Politique de confidentialité de YourOffers.eu. Gestion de vos données et politique de cookies.",
      intro: "Cette politique détaille comment YourOffers.eu collecte, utilise et protège vos données personnelles.",
      infoCollectTitle: "Informations collectées",
      infoCollectText: "Nous collectons des données d'analyse anonymes (via Google Analytics et Meta Pixel) et des statistiques de clics affiliés pour améliorer nos recommandations.",
      cookiesTitle: "Cookies",
      cookiesText: "Nous utilisons des cookies à des fins de mesure d'audience, de personnalisation et de mémorisation de la langue.",
      affiliateTitle: "Divulgation d'affiliation",
      affiliateText: "Certains liens sont affiliés. Nous pouvons recevoir une commission sur les achats effectués.",
      contactTitle: "Contact",
      contactText: "Pour toute question sur vos données, contactez-nous via la page Contact."
    },
    terms: {
      title: "Conditions Générales d'Utilisation — YourOffers.eu",
      metaTitle: "Conditions Générales d'Utilisation — YourOffers.eu",
      metaDesc: "Conditions d'utilisation de YourOffers.eu et mentions légales relatives à l'affiliation.",
      intro: "En utilisant YourOffers.eu, vous acceptez les présentes conditions.",
      useOfSiteTitle: "Utilisation du site",
      useOfSiteText: "Le contenu est fourni à titre informatif. Les prix et stocks sont susceptibles d'évoluer sur le site du marchand.",
      affiliateLinksTitle: "Liens d'affiliation",
      affiliateLinksText: "Nous participons à des programmes d'affiliation rémunérés sur les achats éligibles.",
      liabilityTitle: "Limitation de responsabilité",
      liabilityText: "Les commandes et garanties sont gérées directement par les marchands partenaires respectifs."
    }
  },
  es: {
    common: {
      siteName: "YourOffers.eu",
      siteTagline: "Ofertas seleccionadas y guías de compra en toda Europa.",
      curatedDealsEurope: "Ofertas seleccionadas entregadas en toda Europa",
      updatedPricesDaily: "Precios de afiliados actualizados diariamente",
      verifiedEuropeanPrices: "Precios europeos verificados y ofertas diarias",
      home: "Inicio",
      allProducts: "Todos los productos",
      allCategories: "Todas las categorías",
      categories: "Categorías",
      deals: "Ofertas",
      allOffers: "Todas las ofertas",
      guides: "Guías",
      buyingTips: "Consejos de compra",
      weekendSales: "Rebajas de Fin de Semana",
      hot: "TOP",
      blog: "Blog y Guías",
      aboutUs: "Sobre nosotros",
      contact: "Contacto",
      privacyPolicy: "Política de privacidad",
      termsOfService: "Términos de servicio",
      sitemap: "Mapa del sitio",
      searchPlaceholder: "Buscar productos, mejores marcas, categorías y ofertas...",
      search: "Buscar",
      viewAllProducts: "Ver todos los productos",
      browseAll: "Explorar todo",
      totalCategories: "total",
      subcategories: "subcategorías",
      company: "Empresa",
      rightsReserved: "Todos los derechos reservados.",
      affiliateDisclaimer: "Algunos enlaces son de afiliados; podemos recibir una comisión sin coste adicional para usted.",
      menuNavigation: "Navegación del Menú",
      quickLinks: "Enlaces Rápidos",
      browseCategoriesSubs: "Explorar Categorías y Subcategorías",
      offersFound: "ofertas encontradas",
      offerFound: "oferta encontrada",
      productsCount: "productos",
      noProductsFound: "Ningún producto coincide con sus filtros.",
      clearFilters: "Borrar filtros",
      applyFilters: "Aplicar filtros",
      reset: "Restablecer",
      filters: "Filtros",
      brand: "Marca",
      retailer: "Tienda",
      price: "Precio",
      minPrice: "Mín €",
      maxPrice: "Máx €",
      minRating: "Calificación mínima",
      anyRating: "Cualquiera",
      fourStarUp: "4★ o más",
      fourHalfStarUp: "4.5★ o más",
      allBrands: "Todas las marcas",
      allRetailers: "Todas las tiendas",
      sort: {
        newest: "Más recientes",
        priceLowHigh: "Precio: Menor a Mayor",
        priceHighLow: "Precio: Mayor a Menor",
        highestRated: "Mejor valorados",
        mostPopular: "Más populares"
      },
      viewDeal: "Ver Oferta",
      viewDealOn: "Ver oferta en",
      inStock: "En stock y verificado",
      customerRating: "Opiniones de clientes",
      reviews: "opiniones",
      featuredProducts: "Productos Destacados",
      bestSellers: "Más Vendidos",
      seeAll: "Ver todo →",
      latestIn: "Novedades en",
      featuredCollection: "Colección Destacada",
      curatedCategoryDeals: "Ofertas europeas por categoría",
      minRead: "min de lectura",
      relatedArticles: "Artículos relacionados",
      relatedDeals: "Ofertas relacionadas",
      shareDeal: "Compartir oferta",
      productDetailsFeatures: "Detalles y Características",
      specifications: "Especificaciones",
      buyingGuideVerdict: "Guía de compra y Veredicto"
    },
    about: {
      title: "Sobre YourOffers.eu — Nuestros Estándares Editoriales y Equipo",
      metaTitle: "Sobre YourOffers.eu — Nuestros Estándares Editoriales y Equipo",
      metaDesc: "Descubra cómo YourOffers.eu selecciona ofertas en Europa, nuestras directrices editoriales y cómo puede confiar en nuestras guías de compra.",
      tag: "Integridad Editorial y Transparencia",
      heading: "Sobre YourOffers.eu",
      subtitle: "Su guía de compras de confianza para las mejores ofertas seleccionadas, descuentos reales y comparativas imparciales en la Unión Europea.",
      whoWeAreTitle: "Quiénes somos",
      whoWeAreText: "YourOffers.eu es una guía de compras independiente y una plataforma de ofertas seleccionadas para compradores europeos. Escogemos productos destacados en 12 categorías clave (Electrónica, Informática, Hogar y Cocina, Moda, Belleza y Deportes) de tiendas de confianza y verificamos precios diariamente.",
      standardsTitle: "Nuestros estándares editoriales",
      standardsIntro: "Cada producto recomendado en YourOffers.eu se evalúa cuidadosamente:",
      standard1Title: "Tiendas verificadas",
      standard1Desc: "Solo enlazamos a comerciantes de confianza con envío fiable en Europa.",
      standard2Title: "Opiniones reales",
      standard2Desc: "Evaluaciones basadas en experiencias de compradores reales.",
      standard3Title: "Descuentos genuinos",
      standard3Desc: "Verificación de precios para garantizar rebajas reales.",
      standard4Title: "Selección independiente",
      standard4Desc: "Ninguna tienda puede pagar por valoraciones positivas o mejores puestos.",
      howWeMakeMoneyTitle: "Transparencia y Afiliación",
      howWeMakeMoneyP1: "YourOffers.eu se financia mediante sus lectores. Al comprar a través de nuestros enlaces de afiliados, podemos recibir una pequeña comisión sin coste extra para usted.",
      howWeMakeMoneyP2: "Esto nos permite mantener el sitio 100% gratuito, rastrear precios y elaborar guías de compra detalladas.",
      ctaTitle: "¿Preguntas o sugerencias?",
      ctaSubtitle: "Nuestro equipo editorial agradece sus comentarios y propuestas.",
      ctaButton: "Contactar con el equipo"
    },
    contact: {
      title: "Contacto — YourOffers.eu",
      metaTitle: "Contacto — YourOffers.eu",
      metaDesc: "Póngase en contacto con el equipo editorial y de colaboraciones de YourOffers.eu.",
      heading: "Contacto",
      subtitle: "¿Tiene alguna duda o propuesta de colaboración? Escríbanos a continuación."
    },
    privacy: {
      title: "Política de Privacidad — YourOffers.eu",
      metaTitle: "Política de Privacidad — YourOffers.eu",
      metaDesc: "Política de Privacidad de YourOffers.eu. Conozca cómo gestionamos sus datos y nuestra política de cookies.",
      intro: "Esta Política de Privacidad describe cómo YourOffers.eu recopila, utiliza y protege sus datos.",
      infoCollectTitle: "Información que recopilamos",
      infoCollectText: "Recopilamos datos analíticos anónimos (mediante Google Analytics y Meta Pixel) y estadísticas de clics para mejorar nuestras sugerencias.",
      cookiesTitle: "Cookies",
      cookiesText: "Utilizamos cookies para análisis estadístico, personalización y recordar su idioma preferido.",
      affiliateTitle: "Aviso de Afiliados",
      affiliateText: "Algunos enlaces son de afiliados. Podemos recibir una comisión por las compras realizadas a través de ellos.",
      contactTitle: "Contacto",
      contactText: "¿Preguntas sobre privacidad? Contáctenos a través de la página de contacto."
    },
    terms: {
      title: "Términos de Servicio — YourOffers.eu",
      metaTitle: "Términos de Servicio — YourOffers.eu",
      metaDesc: "Términos de Servicio de YourOffers.eu e información legal sobre afiliación.",
      intro: "Al utilizar YourOffers.eu, usted acepta estos términos y condiciones.",
      useOfSiteTitle: "Uso del sitio",
      useOfSiteText: "El contenido se ofrece con fines informativos. Los precios y la disponibilidad dependen de la tienda vendedora.",
      affiliateLinksTitle: "Enlaces de afiliados",
      affiliateLinksText: "Participamos en programas de afiliados y podemos recibir comisiones por compras válidas.",
      liabilityTitle: "Limitación de responsabilidad",
      liabilityText: "No nos hacemos responsables de las compras realizadas en sitios externos; la garantía y entrega corresponden al comerciante final."
    }
  }
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
