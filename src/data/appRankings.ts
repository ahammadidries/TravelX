export type AppRanking = {
  group: string;
  rank: number;
  reason: string;
  order: number;
};

// Editorial comparison by city presence and traveler-facing service fit.
// It deliberately does not claim live speed, reliability, or user-rating scores.
export const appRankings: Record<string, AppRanking> = {
  navitime: {
    group: 'Transit planning',
    rank: 1,
    reason: 'Visitor route planning across rail and subway options.',
    order: 1,
  },
  'tokyo-metro': {
    group: 'Transit planning',
    rank: 2,
    reason: 'Official visitor-focused Tokyo Metro maps, tickets and transfer information.',
    order: 2,
  },
  'jorudan-tokyo': {
    group: 'Transit planning',
    rank: 3,
    reason: 'A second route-and-fare planner recommended by Japan’s national tourism organization.',
    order: 3,
  },
  'google-maps-tokyo': {
    group: 'City navigation',
    rank: 1,
    reason: 'Strong general-purpose map and walking directions.',
    order: 1,
  },
  'google-maps-clt': {
    group: 'City navigation',
    rank: 1,
    reason: 'Useful street and landmark navigation across the city.',
    order: 1,
  },
  go: {
    group: 'Tokyo taxi apps',
    rank: 1,
    reason: 'Japan taxi service with visitor information in English.',
    order: 1,
  },
  'uber-clt': {
    group: 'Kozhikode ride apps',
    rank: 1,
    reason: 'City listing and trip availability can be checked in-app.',
    order: 1,
  },
  'rapido-kozhikode': {
    group: 'Kozhikode ride apps',
    rank: 2,
    reason: 'Multiple ride types may appear; exact pickup availability varies.',
    order: 2,
  },
  'kerala-savaari': {
    group: 'Kozhikode ride apps',
    rank: 3,
    reason: 'Regional auto and taxi option; confirm current local service.',
    order: 3,
  },
  'uber-eats': {
    group: 'Tokyo restaurant delivery',
    rank: 1,
    reason: 'Restaurant delivery listings can be checked by Tokyo address.',
    order: 1,
  },
  swiggy: {
    group: 'Kozhikode restaurant delivery',
    rank: 1,
    reason: 'Local restaurant listings are available for Kozhikode.',
    order: 1,
  },
  'zomato-kozhikode': {
    group: 'Kozhikode restaurant delivery',
    rank: 2,
    reason: 'Local restaurant discovery and ordering; check address coverage.',
    order: 2,
  },
  'bigbasket-kozhikode': {
    group: 'Kozhikode grocery delivery',
    rank: 1,
    reason: 'Dedicated grocery catalog; delivery depends on your pincode.',
    order: 1,
  },
  'jiomart-kozhikode': {
    group: 'Kozhikode grocery delivery',
    rank: 2,
    reason: 'Groceries and essentials; confirm the pincode and slots.',
    order: 2,
  },
  'booking-tokyo': {
    group: 'Tokyo hotels and stays',
    rank: 1,
    reason: 'Broad hotel and guesthouse search with property reviews.',
    order: 1,
  },
  'agoda-tokyo': {
    group: 'Tokyo hotels and stays',
    rank: 2,
    reason: 'Hotel and apartment comparison with multilingual booking.',
    order: 2,
  },
  'airbnb-tokyo': {
    group: 'Tokyo hotels and stays',
    rank: 3,
    reason: 'Best fit for home-style stays and longer visits.',
    order: 3,
  },
  'booking-kozhikode': {
    group: 'Kozhikode hotels and stays',
    rank: 1,
    reason: 'Wide city hotel and guesthouse search with reviews.',
    order: 1,
  },
  'makemytrip-kozhikode': {
    group: 'Kozhikode hotels and stays',
    rank: 2,
    reason: 'India-focused hotel filters and booking options.',
    order: 2,
  },
  'agoda-kozhikode': {
    group: 'Kozhikode hotels and stays',
    rank: 3,
    reason: 'Another broad hotel comparison option for the city.',
    order: 3,
  },
  'airbnb-kozhikode': {
    group: 'Kozhikode hotels and stays',
    rank: 4,
    reason: 'Home and apartment stays, including family-size options.',
    order: 4,
  },
  'oyo-kozhikode': {
    group: 'Kozhikode hotels and stays',
    rank: 5,
    reason: 'Budget-chain listings; confirm each property’s rules and details.',
    order: 5,
  },
  'ubigi-jp': {
    group: 'Tokyo travel eSIMs',
    rank: 1,
    reason: 'Japan-specific prepaid eSIM information and data plans.',
    order: 1,
  },
  'airalo-tokyo': {
    group: 'Tokyo travel eSIMs',
    rank: 2,
    reason: 'Flexible Japan data packs with multiple validity choices.',
    order: 2,
  },
  'holafly-tokyo': {
    group: 'Tokyo travel eSIMs',
    rank: 3,
    reason: 'Unlimited-data plan options; review hotspot and fair-use terms.',
    order: 3,
  },
  'sakura-mobile-tokyo': {
    group: 'Tokyo visitor SIM services',
    rank: 1,
    reason: 'Japan-focused visitor SIM, eSIM and pocket Wi-Fi choices.',
    order: 4,
  },
  'airalo-kozhikode': {
    group: 'Kozhikode travel eSIMs',
    rank: 1,
    reason: 'India data plans that can be arranged before arrival.',
    order: 1,
  },
  'holafly-kozhikode': {
    group: 'Kozhikode travel eSIMs',
    rank: 2,
    reason: 'Unlimited-data options; check hotspot and fair-use terms.',
    order: 2,
  },
  airtel: {
    group: 'Kozhikode local SIMs',
    rank: 1,
    reason: 'Local operator option; visitor identity checks apply.',
    order: 3,
  },
  'myjio-kozhikode': {
    group: 'Kozhikode local SIMs',
    rank: 2,
    reason: 'Store locator and account tools for Jio; new SIM needs KYC.',
    order: 4,
  },
  irctc: {
    group: 'Kozhikode rail booking',
    rank: 1,
    reason: 'Official reserved-ticket booking; account registration is required.',
    order: 1,
  },
  'where-is-my-train': {
    group: 'Kozhikode rail information',
    rank: 1,
    reason: 'Independent offline timetable and train-status information.',
    order: 2,
  },
  ksrtc: {
    group: 'Kerala bus booking',
    rank: 1,
    reason: 'Official booking portal for supported Kerala RTC services.',
    order: 3,
  },
  'google-translate-tokyo': {
    group: 'Tokyo translation',
    rank: 1,
    reason: 'Text and camera translation with offline language downloads.',
    order: 1,
  },
  'google-translate-kozhikode': {
    group: 'Kozhikode translation',
    rank: 1,
    reason: 'Text and camera translation with offline language downloads.',
    order: 1,
  },
};
