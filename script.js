/* =========================================================
   CONSTANTS / LOOKUP TABLES
   ========================================================= */
const DEAL_IN_RATES = {
  "Double musuji 4/5/6":    { 0: 0.06, 1: 0.06, 2: 0.07, 3: 0.08, 4: 0.09, 5: 0.10, 6: 0.12, 7: 0.13, 8: 0.14, 9: 0.16, 10: 0.18, 11: 0.20, 12: 0.22, 13: 0.26 },
  "Musuji 3/7":             { 0: 0.06, 1: 0.06, 2: 0.06, 3: 0.07, 4: 0.08, 5: 0.08, 6: 0.09, 7: 0.09, 8: 0.10, 9: 0.11, 10: 0.13, 11: 0.14, 12: 0.16, 13: 0.19, 14: 0.23 },
  "Musuji 2/8":             { 0: 0.05, 1: 0.05, 2: 0.05, 3: 0.06, 4: 0.07, 5: 0.07, 6: 0.08, 7: 0.09, 8: 0.09, 9: 0.10, 10: 0.12, 11: 0.13, 12: 0.15, 13: 0.18, 14: 0.22 },
  "Katamusuji 4/5/6":       { 0: 0.03, 1: 0.03, 2: 0.04, 3: 0.05, 4: 0.05, 5: 0.06, 6: 0.07, 7: 0.07, 8: 0.08, 9: 0.09, 10: 0.10, 11: 0.12, 12: 0.14, 13: 0.15 },
  "Musuji 1/9":             { 0: 0.03, 1: 0.03, 2: 0.04, 3: 0.05, 4: 0.06, 5: 0.06, 6: 0.07, 7: 0.07, 8: 0.08, 9: 0.09, 10: 0.10, 11: 0.12, 12: 0.14, 13: 0.15 }
};

const RATE_BUCKETS = [
  { label: '< 5%',      min: 0.00, max: 0.05, test: r => r < 0.05 },
  { label: '5% – 10%',  min: 0.05, max: 0.10, test: r => r >= 0.05 && r < 0.10 },
  { label: '10% – 15%', min: 0.10, max: 0.15, test: r => r >= 0.10 && r < 0.15 },
  { label: '15% – 20%', min: 0.15, max: 0.20, test: r => r >= 0.15 && r < 0.20 },
  { label: '20% – 25%', min: 0.20, max: 0.25, test: r => r >= 0.20 && r < 0.25 },
  { label: '> 25%',     min: 0.25, max: 1.00, test: r => r >= 0.25 }
];

function rateToBucket(rate) {
  for (const b of RATE_BUCKETS) {
    if (b.test(rate)) return b.label;
  }
  return RATE_BUCKETS[RATE_BUCKETS.length - 1].label;
}

function formatRate(rate) {
  const pct = rate * 100;
  if (pct < 1 && pct > 0) return pct.toFixed(1) + '%';
  return Math.round(pct) + '%';
}

function getVerdictLevel(rate, threshold) {
  if (threshold >= 1.0) return 'ironPush';
  if (threshold <= 0.001) return 'ironPull';
  if (rate > threshold) {
    const gap = rate - threshold;
    return gap >= 0.10 ? 'ironPull' : 'pull';
  }
  if (rate === threshold) return 'borderlineFavorsPull';
  const gap = threshold - rate;
  if (gap < 0.005) return 'borderlineFavorsPull';
  if (gap < 0.015) return 'borderlineEither';
  if (gap < 0.04)  return 'borderlineFavorsPush';
  if (gap < 0.10)  return 'push';
  return 'ironPush';
}

function isBorderlineVerdict(level) { return level.startsWith('borderline'); }

const CLOSED_THRESHOLDS = {
  "VS Non-Dealer": {
    "Turn 5":  { 1: 1.0, 2: 1.0, 3: 0.15, 4: 0.10, 5: 0.07, 6: 0.06, 7: 0.03, 8: 0.01 },
    "Turn 9":  { 1: 0.23, 2: 0.18, 3: 0.13, 4: 0.08, 5: 0.06, 6: 0.06, 7: 0.03, 8: 0.01 },
    "Turn 14": { 1: 0.12, 2: 0.10, 3: 0.08, 4: 0.06, 5: 0.04, 6: 0.02, 7: 0.02, 8: 0.01 }
  },
  "VS Dealer": {
    "Turn 5":  { 1: 1.0, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05, 6: 0.04, 7: 0.02, 8: 0.01 },
    "Turn 9":  { 1: 0.15, 2: 0.13, 3: 0.08, 4: 0.05, 5: 0.04, 6: 0.04, 7: 0.02, 8: 0.01 },
    "Turn 14": { 1: 0.05, 2: 0.05, 3: 0.04, 4: 0.03, 5: 0.02, 6: 0.02, 7: 0.01, 8: 0.00 }
  },
  "As Dealer": {
    "Turn 5":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 0.22, 6: 0.13, 7: 0.09, 8: 0.05 },
    "Turn 9":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 0.25, 5: 0.20, 6: 0.12, 7: 0.08, 8: 0.05 },
    "Turn 14": { 1: 0.24, 2: 0.20, 3: 0.17, 4: 0.13, 5: 0.10, 6: 0.09, 7: 0.07, 8: 0.04 }
  }
};

const OPEN_THRESHOLDS = {
  "VS Non-Dealer": {
    "Turn 5":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 0.24, 5: 0.17, 6: 0.13, 7: 0.09, 8: 0.06, 9: 0.04, 10: 0.03, 11: 0.00 },
    "Turn 9":  { 1: 1.0, 2: 1.0, 3: 0.24, 4: 0.21, 5: 0.14, 6: 0.12, 7: 0.08, 8: 0.06, 9: 0.04, 10: 0.03, 11: 0.00 },
    "Turn 14": { 1: 0.24, 2: 0.18, 3: 0.16, 4: 0.14, 5: 0.11, 6: 0.09, 7: 0.07, 8: 0.06, 9: 0.04, 10: 0.03, 11: 0.00 }
  },
  "VS Dealer": {
    "Turn 5":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 0.18, 5: 0.11, 6: 0.09, 7: 0.07, 8: 0.04, 9: 0.03, 10: 0.02, 11: 0.00 },
    "Turn 9":  { 1: 0.24, 2: 0.21, 3: 0.18, 4: 0.12, 5: 0.10, 6: 0.06, 7: 0.05, 8: 0.04, 9: 0.02, 10: 0.01, 11: 0.00 },
    "Turn 14": { 1: 0.16, 2: 0.10, 3: 0.09, 4: 0.07, 5: 0.06, 6: 0.05, 7: 0.04, 8: 0.03, 9: 0.02, 10: 0.01, 11: 0.00 }
  },
  "As Dealer": {
    "Turn 5":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 0.14, 10: 0.10, 11: 0.07 },
    "Turn 9":  { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 0.24, 7: 0.24, 8: 0.18, 9: 0.12, 10: 0.10, 11: 0.07 },
    "Turn 14": { 1: 1.0, 2: 1.0, 3: 0.30, 4: 0.26, 5: 0.20, 6: 0.18, 7: 0.14, 8: 0.13, 9: 0.10, 10: 0.10, 11: 0.07 }
  }
};

const CLOSED_TIER_MAP = {
  'Perfect|4': 1,
  'Perfect|3': 2, 'Good*2|4': 2,
  'Perfect|2': 3, 'Good*2|3': 3, 'Good+Ryankan|4': 3,
  'Perfect|1': 4, 'Good*2|2': 4, 'Good+Ryankan|3': 4, 'Good+Kanchan|4': 4,
  'Good*2|1': 5, 'Good+Ryankan|2': 5, 'Bad+Ryankan|4': 5, 'Good+Kanchan|3': 5, 'Chiitoi|5': 5,
  'Bad+Ryankan|3': 6, 'Chiitoi|4': 6,
  'Good+Ryankan|1': 7, 'Good+Kanchan|2': 7, 'Bad+Ryankan|2': 7, 'Chiitoi|3': 7,
  'Good+Kanchan|1': 8, 'Bad+Ryankan|1': 8
};

const CHIITOI_POINTS = {
  nonDealer: { 3: 3200, 4: 6400, 5: 8000 },
  dealer:    { 3: 4800, 4: 9600, 5: 12000 }
};

const OPEN_TIER_MAP_ND_C = {
  'Perfect|4': 1, 'Good*2|4': 2,
  'Perfect|3': 3, 'Good+Ryankan|4': 3, 'Good+Kanchan|4': 4, 'Good*2|3': 4,
  'Perfect|2': 5, 'Good+Ryankan|3': 5, 'Good+Kanchan|3': 6, 'Bad+Ryankan|4': 5,
  'Perfect|1': 6, 'Good*2|2': 6,
  'Good*2|1': 7, 'Good+Ryankan|2': 7, 'Good+Kanchan|2': 8, 'Bad+Ryankan|3': 7,
  'Good+Ryankan|1': 8, 'Good+Kanchan|1': 9, 'Bad+Ryankan|2': 9, 'Bad+Ryankan|1': 10
};

const OPEN_TIER_MAP_ND_NC = {
  'Perfect|4': 2, 'Good*2|4': 3,
  'Perfect|3': 4, 'Good+Ryankan|4': 4, 'Good*2|3': 5, 'Good+Kanchan|4': 5,
  'Perfect|2': 6, 'Good+Ryankan|3': 6, 'Bad+Ryankan|4': 6,
  'Perfect|1': 7, 'Good*2|2': 7, 'Good+Kanchan|3': 7,
  'Good*2|1': 8, 'Good+Ryankan|2': 8, 'Bad+Ryankan|3': 8,
  'Good+Ryankan|1': 9, 'Good+Kanchan|2': 9, 'Good+Kanchan|1': 10, 'Bad+Ryankan|2': 10, 'Bad+Ryankan|1': 10
};

const OPEN_TIER_MAP_D_C = {
  'Perfect|4': 1, 'Good*2|4': 2,
  'Perfect|3': 3, 'Good+Ryankan|4': 3, 'Good*2|3': 4, 'Good+Kanchan|4': 4,
  'Perfect|2': 5, 'Good+Ryankan|3': 5, 'Bad+Ryankan|4': 5,
  'Perfect|1': 6, 'Good*2|2': 6, 'Good+Kanchan|3': 6,
  'Good*2|1': 8, 'Good+Ryankan|2': 8, 'Good+Kanchan|2': 9, 'Bad+Ryankan|3': 8,
  'Good+Ryankan|1': 9, 'Good+Kanchan|1': 10, 'Bad+Ryankan|2': 10, 'Bad+Ryankan|1': 11
};

const OPEN_TIER_MAP_D_NC = {
  'Perfect|4': 2, 'Good*2|4': 3,
  'Perfect|3': 4, 'Good+Ryankan|4': 4, 'Good*2|3': 5, 'Good+Kanchan|4': 5,
  'Perfect|2': 6,
  'Good+Ryankan|3': 7, 'Bad+Ryankan|4': 7,
  'Perfect|1': 8, 'Good*2|2': 8, 'Good+Kanchan|3': 8,
  'Good*2|1': 9, 'Good+Ryankan|2': 9, 'Bad+Ryankan|3': 9,
  'Good+Ryankan|1': 10, 'Good+Kanchan|2': 10, 'Good+Kanchan|1': 11, 'Bad+Ryankan|2': 11
};

const SHAPE_LABELS = {
  'Perfect': 'Perfect',
  'Good*2': 'Ryanmen ×2',
  'Good+Ryankan': 'Ryanmen + Ryankan',
  'Good+Kanchan': 'Ryanmen + Kanchan',
  'Bad+Ryankan': 'Kanchan + Ryankan',
  'Chiitoi': 'Chiitoi',
  'BadHeadless': 'Bad Headless',
  'MediocreHeadless': 'Mediocre Headless',
  'BadKuttsuki': 'Bad Kuttsuki',
  'StandardHeadless': 'Standard Headless',
  'StandardKuttsuki': 'Standard Kuttsuki',
  'GoodHeadless1': 'Good Conjoined Headless',
  'GoodHeadless2': 'Ankou Headless',
  'GoodKuttsuki': 'Good Kuttsuki'
};

const SHAPE_LABEL_KEYS = {
  'Perfect': 'settings.shape.perfect',
  'Good*2': 'settings.shape.good2',
  'Good+Ryankan': 'settings.shape.goodRyankan',
  'Good+Kanchan': 'settings.shape.goodKanchan',
  'Bad+Ryankan': 'settings.shape.badRyankan',
  'Chiitoi': 'settings.shape.pairs',
  'BadHeadless': 'settings.shape.badHeadless',
  'MediocreHeadless': 'settings.shape.mediocreHeadless',
  'BadKuttsuki': 'settings.shape.badKuttsuki',
  'StandardHeadless': 'settings.shape.standardHeadless',
  'StandardKuttsuki': 'settings.shape.standardKuttsuki',
  'GoodHeadless1': 'settings.shape.goodHeadless1',
  'GoodHeadless2': 'settings.shape.goodHeadless2',
  'GoodKuttsuki': 'settings.shape.goodKuttsuki'
};

/* The 6 standard shapes (A–F) */
const SHAPE_REFERENCE = [
  { nameKey: 'settings.shape.perfect', acceptance: 20, goodRate: '100%',
    hand: ['1m','2m','3m','6m','7m','8m','2p','2p','3p','2s','2s','7s','8s'] },
  { nameKey: 'settings.shape.good2', acceptance: 16, goodRate: '100%',
    hand: ['2m','2m','2m','4m','5m','6m','3p','4p','4z','4s','5s','8s','8s'] },
  { nameKey: 'settings.shape.goodRyankan', acceptance: 16, goodRate: '50%',
    hand: ['2m','3m','0m','6m','7m','1p','3p','5p','9p','9p','3z','3z','3z'] },
  { nameKey: 'settings.shape.goodKanchan', acceptance: 12, goodRate: '33%',
    hand: ['2m','3m','5m','6m','7m','4p','6p','9p','9p','3z','3z','3z','9s'] },
  { nameKey: 'settings.shape.badRyankan', acceptance: 12, goodRate: '0%',
    hand: ['6m','7m','8m','2p','4p','6p','6p','4s','6s','8s','7z','7z','7z'] },
  { nameKey: 'settings.shape.pairs', acceptance: 9, goodRate: '0%',
    hand: ['2m','2m','5m','0m','3p','3p','8p','8p','2s','2s','1z','5z','6z'] }
];

const OTHER_SHAPES = {
  'BadHeadless':      { id: 'C-', baseShape: 'Good+Ryankan', tierOffset:  0, en: 'Bad Headless',             ja: '悪いヘッドレス',        accept: 16, good: '0%'   },
  'MediocreHeadless': { id: 'C+', baseShape: 'Good+Ryankan', tierOffset:  0, en: 'Mediocre Headless',        ja: 'やや悪いヘッドレス',   accept: 24, good: '25%'  },
  'BadKuttsuki':      { id: 'C',  baseShape: 'Good+Ryankan', tierOffset:  0, en: 'Bad Kuttsuki',             ja: '悪いくっつき',           accept: 32, good: '25%'  },
  'StandardHeadless': { id: 'A-', baseShape: 'Perfect',      tierOffset:  0, en: 'Standard Headless',        ja: '標準ヘッドレス',           accept: 28, good: '43%'  },
  'StandardKuttsuki': { id: 'A',  baseShape: 'Perfect',      tierOffset:  0, en: 'Standard Kuttsuki',        ja: '標準くっつき',             accept: 40, good: '40%'  },
  'GoodHeadless1':    { id: 'S',  baseShape: 'Perfect',      tierOffset: -1, en: 'Good Conjoined Headless',  ja: '連続形ヘッドレス',         accept: 33, good: '79%'  },
  'GoodHeadless2':    { id: 'S',  baseShape: 'Perfect',      tierOffset: -1, en: 'Ankou Headless',           ja: '暗刻ヘッドレス',           accept: 28, good: '100%' },
  'GoodKuttsuki':     { id: 'S+', baseShape: 'Perfect',      tierOffset: -1, en: 'Good Kuttsuki',            ja: '良いくっつき',           accept: 45, good: '53%'  }
};


/* Example 13-tile hands for the non-standard shapes */
const EXTRA_SHAPE_HANDS = {
  'BadHeadless':       ['1m','2m','3m','6m','8m','3p','4p','7p','8p','9p','3s','6s','7s'],
  'MediocreHeadless':  ['1m','2m','3m','6m','7m','3p','4p','7p','8p','9p','6s','7s','8s'],
  'BadKuttsuki':       ['1m','2m','3m','9m','9m','2p','7p','8p','9p','2s','6s','7s','8s'],
  'StandardHeadless':  ['1m','2m','3m','6m','7m','3p','4p','7p','8p','9p','6s','7s','8s'],
  'StandardKuttsuki':  ['1m','2m','3m','9m','9m','3p','7p','8p','9p','3s','6s','7s','8s'],
  'GoodHeadless1':     ['1m','2m','3m','4m','5m','3p','4p','7p','8p','9p','6s','7s','8s'],
  'GoodHeadless2':     ['1m','2m','3m','6m','7m','3p','4p','9p','9p','9p','6s','7s','8s'],
  'GoodKuttsuki':      ['1m','2m','3m','9m','9m','3p','7p','8p','9p','5s','6s','7s','8s']
};


function isOtherShape(s) { return !!OTHER_SHAPES[s]; }
function getBaseShape(shape) { return isOtherShape(shape) ? OTHER_SHAPES[shape].baseShape : shape; }
function getShapeOffset(shape) { return isOtherShape(shape) ? OTHER_SHAPES[shape].tierOffset : 0; }

const CATEGORY_INFO = {
  'Double musuji 4/5/6': { label: 'Double Musuji 4/5/6', desc: '4, 5 or 6 — Double non-suji tile' },
  'Musuji 3/7':          { label: 'Musuji 3/7',          desc: 'A 3 or 7 — A non-suji tile' },
  'Musuji 2/8':          { label: 'Musuji 2/8',          desc: 'A 2 or 8 — A non-suji tile' },
  'Katamusuji 4/5/6':    { label: 'Katamusuji 4/5/6',    desc: 'Middle tile — Half suji.' },
  'Musuji 1/9':          { label: 'Musuji 1/9',          desc: 'A terminal — A non-suji tile' }
};

const ALL_CATEGORIES = Object.keys(CATEGORY_INFO);
const ALL_TURNS = [5, 9, 14];
const ALL_SHAPES = ['Perfect', 'Good*2', 'Good+Ryankan', 'Good+Kanchan', 'Bad+Ryankan', 'Chiitoi'];
const ALL_OTHER_SHAPES = ['BadHeadless', 'MediocreHeadless', 'BadKuttsuki', 'StandardHeadless', 'StandardKuttsuki', 'GoodHeadless1', 'GoodHeadless2', 'GoodKuttsuki'];
const ALL_QUESTION_SHAPES = ALL_SHAPES.concat(ALL_OTHER_SHAPES);
const ALL_HANDS = ['menzen', 'fuuro'];
const ALL_DECLARERS = ['kamicha', 'toimen', 'shimocha'];
const ALL_PLAYER_ROLES = ['Dealer', 'Non-Dealer'];
const ALL_OPP_ROLES = ['Dealer', 'Non-Dealer'];
const ALL_QUESTION_COUNTS = [5, 10, 15, 20];

const MODE_CONFIG = {
  regular: { total: 10, label: 'Regular' },
  zen: { total: 0, label: 'Zen Mode' },
  timeattack: { total: 0, label: 'Time Attack' },
  custom: { total: 10, label: 'Custom Practice' }
};

const SEAT_LABEL_KEYS = { kamicha: 'seat.kamicha', toimen: 'seat.toimen', shimocha: 'seat.shimocha' };
const SEAT_ORDER = ['shimocha', 'toimen', 'kamicha', 'player'];
const WIND_NAMES = ['East', 'South', 'West', 'North'];
const WIND_CHARS = { East: '東', South: '南', West: '西', North: '北' };

const ROLE_KEY_MAP = {
  'VS Non-Dealer': 'role.vsND',
  'VS Dealer': 'role.vsD',
  'As Dealer': 'role.asD'
};

const ROUND_LABELS = [
  'East 1-0', 'East 1-1', 'East 1-2',
  'East 2-0', 'East 2-1', 'East 2-2',
  'East 3-0', 'East 3-1', 'East 3-2',
  'East 4-0', 'East 4-1', 'East 4-2'
];

const ALL_TILES = [];
for (const s of ['m', 'p', 's']) for (let i = 1; i <= 9; i++) ALL_TILES.push(`${i}${s}`);
for (let i = 1; i <= 7; i++) ALL_TILES.push(`${i}z`);

const HONOR_CHARS = { 1: '東', 2: '南', 3: '西', 4: '北', 5: '白', 6: '發', 7: '中' };
const SUIT_CHARS = { m: '萬', p: '筒', s: '索' };

const SUJI_MAP = {
  1: ['4'], 2: ['5'], 3: ['6'],
  4: ['4', '7'], 5: ['5', '8'], 6: ['6', '9'],
  7: ['7'], 8: ['8'], 9: ['9']
};

const BOARD_W = 1120, BOARD_H = 920;
const ANCHORS = {
  toimen:   { x: 560, y: 160 },
  kamicha:  { x: 170, y: 500 },
  shimocha: { x: 950, y: 500 },
  player:   { x: 560, y: 685 }
};
const POND_ROT = { toimen: 180, kamicha: 90, shimocha: -90, player: 0 };

const PLAYER_POND_TOP = 628;
const PLAYER_LABEL_Y = 590;

const HS_KEY = 'shanten_highscores';
const CUSTOM_KEY = 'shanten_custom_config';
const LANG_KEY = 'shanten_lang';

/* =========================================================
   I18N
   ========================================================= */
const I18N = {
  en: {
    'page.title': '1-shanten Oracle — Push-Pull Trainer',
    'home.link': 'The Oracle <i class="fa-solid fa-hamsa"></i>',
    'home.heading': '1-shanten Oracle',
    'home.sub': 'Push-pull trainer',
    'home.start': 'Start',
    'home.hint': '↑ ↓ to choose · Enter to start',
    'home.about': 'About <i class="fa-solid fa-circle-info"></i> ',
    'home.mode.regular.title': 'Regular',
    'home.mode.regular.desc': '10-question scored run. Score & grade revealed at the end.',
    'home.mode.zen.title': 'Zen Mode',
    'home.mode.zen.desc': 'Endless practice. No timer, no score — just reps.',
    'home.mode.timeattack.title': 'Time Attack',
    'home.mode.timeattack.desc': '45s countdown. Correct push/pull buys time. Runs until the clock hits zero.',
    'home.mode.custom.title': 'Custom Practice',
    'home.mode.custom.desc': 'Endless practice with hand-picked categories, turns, shapes, seatings, roles and length.',
    'home.hs.regular': 'Regular Best',
    'home.hs.timeattack': 'Time Attack Best',
    'home.hs.points': 'points',
    'home.hs.ptsSuffix': 'pts',

    'mode.regular': 'Regular',
    'mode.zen': 'Zen Mode',
    'mode.timeattack': 'Time Attack',
    'mode.custom': 'Custom Practice',

    'settings.title': 'Custom Practice Setup',
    'settings.desc': 'Choose exactly what appears in Custom Practice. At least one option per section must remain enabled.',
    'settings.cat.title': 'Tile Categories',
    'settings.turn.title': 'Turns',
    'settings.shape.title': 'Shapes',
    'settings.hand.title': 'Hand State',
    'settings.declarer.title': 'Riichi Caller Seat',
    'settings.playerrole.title': 'Your Role',
    'settings.opprole.title': 'Riichi Caller Role',
    'settings.qcount.title': 'Question Count',
    'settings.cat.doubleMusuji': 'Double Musuji 4/5/6',
    'settings.cat.musuji37': 'Musuji 3/7',
    'settings.cat.musuji28': 'Musuji 2/8',
    'settings.cat.katamusuji': 'Katamusuji 4/5/6',
    'settings.cat.musuji19': 'Musuji 1/9',
    'settings.turn.5': 'Turn 5',
    'settings.turn.9': 'Turn 9',
    'settings.turn.14': 'Turn 14',
    'settings.shape.perfect': '[A] Perfect',
    'settings.shape.good2': '[B] Ryanmen ×2',
    'settings.shape.goodRyankan': '[C] Ryanmen + Ryankan',
    'settings.shape.goodKanchan': '[D] Ryanmen + Kanchan',
    'settings.shape.badRyankan': '[E] Kanchan + Ryankan',
    'settings.shape.pairs': '[F] Chiitoi',
    'settings.shape.badHeadless': '[C−] Bad Headless',
    'settings.shape.mediocreHeadless': '[C+] Mediocre Headless',
    'settings.shape.badKuttsuki': '[C] Bad Kuttsuki',
    'settings.shape.standardHeadless': '[A−] Std Headless',
    'settings.shape.standardKuttsuki': '[A] Std Kuttsuki',
    'settings.shape.goodHeadless1': '[S] Good Conjoined Headless',
    'settings.shape.goodHeadless2': '[S] Ankou Headless',
    'settings.shape.goodKuttsuki': '[S+] Good Kuttsuki',
    'settings.hand.menzen': 'Closed',
    'settings.hand.fuuro': 'Open',
    'settings.declarer.kamicha': 'Kamicha',
    'settings.declarer.toimen': 'Toimen',
    'settings.declarer.shimocha': 'Shimocha',
    'settings.role.dealer': 'Dealer',
    'settings.role.nondealer': 'Non-Dealer',
    'settings.note.cat': 'Select categories to include.',
    'settings.note.turn': 'Select turns to include.',
    'settings.note.shape': 'Select shapes to include.',
    'settings.note.hand': 'Select hand states to include.',
    'settings.note.declarer': 'Select declarer seats to include.',
    'settings.note.playerrole': 'Select your role to include.',
    'settings.note.opprole': "Select the declarer's role to include.",
    'settings.note.qcount': 'Choose the length of the practice run.',
    'settings.note.required': 'At least one option must remain enabled.',
    'settings.note.all': 'All options enabled.',
    'settings.note.some': '{n} of {m} options enabled.',
    'settings.back': 'Back',
    'settings.start': 'Start Practice',

    'game.logo': '1-shanten Oracle',
    'game.score': 'Score',
    'game.combo': 'Combo',
    'game.dealin': 'Deal-in Rate Reference',
    'game.shapes': 'Shapes',
    'game.exit': 'Exit',
    'game.panel.shapeTiers': 'Shape Tiers',
    'game.panel.thresholds': 'Deal-in Thresholds',
    'game.panel.hidden': 'Hidden',
    'game.panel.auto': 'Auto',
    'game.panel.hide': 'Hide',
    'game.panel.autoTip': 'Click to auto-select the matching table',
    'game.panel.hideTip': 'Hide (turn off auto mode)',
    'game.panel.autoOnTip': 'Auto mode is on but no table selected yet',
    'game.panel.emptyHint': 'Click <b>Auto</b> to auto-select the matching table, or jump with the buttons below.',
    'game.panel.tier': 'Tier',
    'game.quiz.title': 'Quiz',
    'game.sc.shape': 'Shape & Status',
    'game.sc.yaku': 'Yaku & Dora',
    'game.sc.role': 'Role',
    'game.sc.declarer': 'Riichi Declarer',
    'game.discard.title': 'Your Discard — Tile Category',

    'board.toimen': 'Toimen',
    'board.kamicha': 'Kamicha',
    'board.shimocha': 'Shimocha',
    'board.you': 'You',
    'board.turn': 'Turn',

    'quiz.step1': 'Passed Suji',
    'quiz.step1.text': "Analyze the Riichi player's discard pond.<br>How many <b>Unique Passed Sujis</b> are there?",
    'quiz.step2': 'Deal-in Rate',
    'quiz.step2.text': 'What is the approximate <b>Deal-in Rate</b> for a <b>{cat}</b> based on the passed sujis?',
    'quiz.step3': 'Decision',
    'quiz.step3.text': "Based on your hand's Tier and the tile risk, should you <b>PUSH</b> or <b>FOLD</b>?",
    'quiz.push': 'PUSH',
    'quiz.fold': 'FOLD',
    'quiz.next': 'Next Question →',

    'cat.Double musuji 4/5/6': 'Double Musuji 4/5/6',
    'cat.Musuji 3/7': 'Musuji 3/7',
    'cat.Musuji 2/8': 'Musuji 2/8',
    'cat.Katamusuji 4/5/6': 'Katamusuji 4/5/6',
    'cat.Musuji 1/9': 'Musuji 1/9',
    'catdesc.Double musuji 4/5/6': '4, 5 or 6 — Double non-suji tile',
    'catdesc.Musuji 3/7': 'A 3 or 7 — A non-suji tile',
    'catdesc.Musuji 2/8': 'A 2 or 8 — A non-suji tile',
    'catdesc.Katamusuji 4/5/6': 'Middle tile — Half suji.',
    'catdesc.Musuji 1/9': 'A terminal — A non-suji tile',

    'seat.kamicha': 'Kamicha (Left)',
    'seat.toimen': 'Toimen (Across)',
    'seat.shimocha': 'Shimocha (Right)',

    'role.vsND': 'VS Non-Dealer',
    'role.vsD': 'VS Dealer',
    'role.asD': 'As Dealer',

    'yaku.hanUnit': 'han',
    'yaku.Yakuhai': 'Yakuhai Ankou',
    'yaku.Tanyao': 'Tanyao',
    'yaku.Chiitoi': 'Chiitoi',
    'yaku.Dora': 'Dora',

    'sc.callable': 'Callable',

    'dealin.title': 'Deal-in Rate Reference',
    'dealin.desc': 'Minimum passed sujis needed to reach each estimated deal-in rate range, by tile category.',
    'dealin.rateHeader': 'Deal-in Rate',
    'dealin.modTitle': 'Common modifiers (not in table):',
    'dealin.modBody': 'Dora: +2% · Sotogawa: −5% · 1-chance: −3% · Anko/Anko-suji: +2%',
    'dealin.modWarn': 'These modifiers are not accounted for when determining the estimated deal-in rates.',

    'shapes.title': 'Shape Reference',
    'shapes.desc': 'Overview of the hand shape categories with example 13-tile hands.',
    'shapes.acceptance': 'Tile acceptance:',
    'shapes.goodRate': 'Good wait rate:',
    'shapes.tilesUnit': '{n} tiles',

    'panel.shapeTier.hidden': 'Hidden',
    'panel.shapeTier.menzenND': 'Closed · Non-Dealer',
    'panel.shapeTier.menzenD': 'Closed · Dealer',
    'panel.shapeTier.fuuroNDC': 'Open · Non-Dealer · Kamicha Riichi',
    'panel.shapeTier.fuuroNDNC': 'Open · Non-Dealer · Not Kamicha Riichi',
    'panel.shapeTier.fuuroDC': 'Open · Dealer · Kamicha Riichi',
    'panel.shapeTier.fuuroDNC': 'Open · Dealer · Not Kamicha Riichi',

    'panel.thresh.menzenVsND': 'Closed · VS Non-Dealer',
    'panel.thresh.menzenVsD': 'Closed · VS Dealer',
    'panel.thresh.menzenAsD': 'Closed · As Dealer',
    'panel.thresh.fuuroVsND': 'Open · VS Non-Dealer',
    'panel.thresh.fuuroVsD': 'Open · VS Dealer',
    'panel.thresh.fuuroAsD': 'Open · As Dealer',

    'btn.shape.menzenND': 'Closed as ND',
    'btn.shape.fuuroNDC': 'Open as ND + Kami Rii',
    'btn.shape.menzenD': 'Closed as D',
    'btn.shape.fuuroND': 'Open as ND',
    'btn.shape.fuuroDC': 'Open as D + Kami Rii',
    'btn.shape.fuuroD': 'Open as D',

    'btn.thresh.menzenVsND': 'Closed vs ND',
    'btn.thresh.menzenVsD': 'Closed vs D',
    'btn.thresh.menzenAsD': 'Closed as D',
    'btn.thresh.fuuroVsND': 'Open vs ND',
    'btn.thresh.fuuroVsD': 'Open vs D',
    'btn.thresh.fuuroAsD': 'Open as D',

    'help.title': 'How to Play',
    'help.overview.title': 'Overview',
    'help.overview.body': "Each question gives you a 1-shanten hand facing an opponent's riichi. Answer three questions in sequence to build up to a push/pull decision.",
    'help.step1.title': 'Step 1 — Count Passed Sujis',
    'help.step1.body': "Unique sujis blocked by the riichi player's pond. Post-riichi discards count. No-chance applies when all four copies of a tile are visible.",
    'help.step2.title': 'Step 2 — Estimate Deal-in Rate',
    'help.step2.body': 'One of six buckets: <code>&lt;5%</code>, <code>5–10%</code>, <code>10–15%</code>, <code>15–20%</code>, <code>20–25%</code>, <code>&gt;25%</code>.',
    'help.step3.title': 'Step 3 — Push or Fold',
    'help.step3.body': "Look up your hand's <b>threshold value</b> (T) from the tables, based on your role (dealer / non-dealer), hand state (closed / open), turn, and hand <b>tier</b>. Tier comes from your hand's shape, yaku, and dora count.",
    'help.step3.list': '<li>If the tile\'s deal-in rate (R) is <b>≤ T</b>: <b>PUSH</b>.</li><li>If R is <b>&gt; T</b>: <b>FOLD</b>.</li><li>If T falls <b>inside the bucket range</b>: <b>BORDERLINE</b> — both answers score 200, and the buttons glow green (slightly favored) or yellow (ambiguous).</li>',
    'help.grades.title': 'Grades',
    'help.grades.body': `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; font-size: 13px;padding-left:20px;">
        <div><b>S+</b> &gt; 95%</div>
        <div><b>B+</b> 65–70%</div>
        <div><b>S</b> 90–95%</div>
        <div><b>B</b> 60–65%</div>
        <div><b>S-</b> 85–90%</div>
        <div><b>B-</b> 55–60%</div>
        <div><b>A+</b> 80–85%</div>
        <div><b>C</b> 45–55%</div>
        <div><b>A</b> 75–80%</div>
        <div><b>D</b> 30–45%</div>
        <div><b>A-</b> 70–75%</div>
        <div><b>E</b> &lt; 30%</div>
    </div>
    `,
    'help.combo.title': 'Combo',
    'help.combo.body': 'Consecutive correct push/pulls build a multiplier: ×1.0 at 0–1, +0.1 per combo past 2, capped at ×10 at combo 91. A wrong push/pull resets the streak.',
    'help.ta.title': 'Time Attack Timing',
    'help.ta.list': '<li>Correct push/pull: <b>+10s</b> (borderline ×2 on matching push, ×1.5 on matching fold).</li><li>Wrong push: <b>−15s</b> · Wrong fold: <b>−10s</b>.</li>',
    'help.controls.title': 'Controls',
    'help.controls.body': 'Arrow keys navigate, Enter confirms, Escape closes modals / exits to menu.',

    'help.scoring.title': 'Scoring',
    'help.scoring.list': '<li>Step 1: <b>300</b> exact, <b>100</b> off by 1, else 0</li><li>Step 2: <b>300</b> correct, else 0</li><li>Step 3: <b>400</b> correct, <b>200</b> borderline, else 0</li><li>Time bonus: <b>max(0, 200 − seconds × 10)</b></li>',

    'help.tables.title': 'Reference Tables',
    'help.tables.list': '<li><b>Deal-in Rates</b> — the full rate chart per category / bucket.</li><li><b>Shapes</b> — examples of the hand shapes.</li><li><b>Shape Tiers panel</b> — toggle <b>Auto</b> to auto-select the matching table each question.</li><li><b>Threshold panel</b> — threshold values. Same auto behavior.</li>',

    'fb.correct': 'Correct!',
    'fb.close': 'Close!',
    'fb.bad': 'Not quite.',
    'fb.step1.ok': '{n} unique passed sujis{breakdown}.',
    'fb.step1.wrong': 'You said {v}. The pond holds <b>{n}</b> unique passed sujis{breakdown}.',
    'fb.suji.declarer': '{n} declarer',
    'fb.suji.postRiichi': '{n} post-riichi',
    'fb.suji.noChance': '{n} no-chance',
    'fb.step2.ok': '<b>Correct!</b> Deal-in rate: <b>{b}</b> (exact: <b>{exact}</b>).',
    'fb.step2.bad': '<b>Incorrect.</b> The correct bucket is <b>{b}</b> (exact: <b>{exact}</b>).',
    'fb.step3.ok': '<b>Correct!</b>',
    'fb.step3.bad': '<b>Incorrect.</b>',
    'fb.step3.answerIs': 'The answer is <b>{d}</b>.',
    'fb.step3.borderline': '<b>Borderline!</b> You chose {d}. {lean}',
    'fb.step3.borderlineDetail': 'Passed Sujis: <b>{n}</b> · Deal-in Rate: <b>{b}</b> (exact: <b>{exact}</b>) · Hand Threshold (Tier {tier}, {role}): <b>{t}</b>',
    'fb.step3.detail': 'Passed Sujis: <b>{n}</b> · Deal-in Rate: <b>{b}</b> (exact: <b>{exact}</b>) · Hand Threshold (Tier {tier}, {role}): <b>{t}</b>',
    'fb.step3.comparePush': 'Deal-in ≤ Threshold Value → PUSH',
    'fb.step3.compareFold': 'Deal-in > Threshold Value → FOLD',
    'fb.step3.all': 'ALL (always push)',
    'fb.lean.fold': 'The threshold sits near the low end of the range — <b>FOLD</b> is slightly favored.',
    'fb.lean.push': 'The threshold sits near the high end of the range — <b>PUSH</b> is slightly favored.',
    'fb.lean.both': 'The threshold sits near the middle of the range — neither answer is clearly better.',
    'fb.ta.pts': '+{pts} pts',
    'fb.ta.mult': ' (×{mult})',
    'fb.ta.plusSec': ' · +{s}s',
    'fb.ta.minusSec': ' · -{s}s',
    'fb.borderlineLabel': 'Borderline!',
    'fb.verdict.ironPush': 'Iron push',
    'fb.verdict.ironPull': 'Iron pull',

    'results.runComplete': 'Run Complete',
    'results.practiceComplete': 'Practice Complete',
    'results.timesUp': "Time's Up!",
    'results.totalScore': 'Total Score',
    'results.timeBonus': 'Time Bonus',
    'results.suji': 'Suji Accuracy',
    'results.dealin': 'Deal-in Accuracy',
    'results.pushfold': 'Push/Pull Accuracy',
    'results.maxCombo': 'Max Combo',
    'results.playAgain': 'Play Again',
    'results.menu': 'Back to Menu',

    'about.title': 'About',
    'about.overview': 'Overview',
    'about.p1': 'A training tool for push/pull decisions in 1-shanten situations facing an opponent\'s riichi. Each question walks you through the same three steps: count the passed sujis, estimate the deal-in rate, then compare it against your hand\'s <b>threshold deal-in rate</b> to reach a PUSH/FOLD decision. The trainer is intended for flat point standing practice.',
    'about.howToUse': 'How to Use',
    'about.p2': 'Each question shows a 1-shanten hand, the opponent\'s riichi pond, the tile category you might discard, and the shape/threshold reference tables. Answer the three quiz steps in order. Both side panels can be auto-selected via the <i>Auto</i> button, or you can jump to a specific table with the direct-nav buttons.<h4>How the Tables Work</h4>The app first uses the <b>Shape Tier Table</b> to determine the tier corresponding to your hand shape and ron value. The assigned tier depends on whether you are the dealer or non-dealer, whether your hand is closed or open, and, for open hands, whether Kamicha has declared riichi. Each shape is assigned tiers according to its relative value: [A] Perfect generally receives the most favorable tiers, followed by shapes [B] through [F]. The tier also depends on the hand\'s ron value; for example, a 4-han [A] closed hand is assigned Tier 1, while a 4-han closed [B] Ryanmen×2 hand is assigned Tier 2, equivalent to a 3-han [A] Perfect hand.<h4>Additional Details</h4><ul><li><b>Open hands against a Kamicha riichi:</b> A separate table is used when Kamicha has declared riichi, accounting for the increased opportunity to call chii from their discards.</li><li><b>Closed hands with a callable yaku (Tanyao / Yakuhai Ankou):</b> These hands are assessed on the open chart at (han − 1) with a one-tier bonus, reflecting the option to open for tenpai.</li><li><b>Non-standard 1-shanten shapes:</b> The Kuttsuki and Headless shapes classified as [S] tier use [A] Perfect as their base tier, adjusted upward by one tier.</li></ul>',
    'about.sources': 'Sources and Methodology',
    'about.p4': 'The shape-tier and threshold tables are adapted primarily from Unimaru\'s book <i>Unimaru-shiki Winning Mahjong with Theory</i> (『うに丸式 セオリーで勝つ麻雀』), which draws on material from <i>Statistical Mahjong Strategy</i> (『統計学のマージャン戦術』) and <i>New: Scientific Mahjong</i> (『新・科学する麻雀』).<br><br>The [D] Ryanmen + Kanchan shape was not included in the original data and has been interpolated. The original [D] and [E] shape classifications have been renamed [E] and [F]. Other shapes map to base tiers per prefix. Deal-in rate estimates are adapted from <i>Statistical Mahjong Strategy</i> by Miinin. <b>Please treat the results as a reference rather than definitive advice.</b>',
    'about.credits': 'Credits',
    'about.p3': 'Designed and developed by kakino_tea.<br>X: <a style="color:#738ad0" href="https://x.com/mican8saku" target="_blank" rel="noopener noreferrer">@mican8saku</a>',
  },

  ja: {
    'page.title': 'イーシャンテン オラクル 押し引きトレーナー',
    'home.link': 'オラクル <i class="fa-solid fa-hamsa"></i>',
    'home.heading': 'イーシャンテン オラクル',
    'home.sub': '押し引きトレーナー',
    'home.start': 'スタート',
    'home.hint': '↑ ↓ で選択 ・ Enter でスタート',
    'home.about': 'このアプリについて <i class="fa-solid fa-circle-info"></i>',
    'home.mode.regular.title': 'レギュラー',
    'home.mode.regular.desc': '10問のスコア制。スコアとランクは最後に発表されます。',
    'home.mode.zen.title': '禅モード',
    'home.mode.zen.desc': '無限練習。タイマーもスコアもなし。反復あるのみ。',
    'home.mode.timeattack.title': 'タイムアタック',
    'home.mode.timeattack.desc': '45秒からのカウントダウン。押し引きを当てると時間が増えます。0秒で終了。',
    'home.mode.custom.title': 'カスタム練習',
    'home.mode.custom.desc': 'カテゴリ・巡目・形・座席・役割・問題数を自由に選んで練習できます。',
    'home.hs.regular': 'レギュラー ベスト',
    'home.hs.timeattack': 'タイムアタック ベスト',
    'home.hs.points': '点',
    'home.hs.ptsSuffix': '点',

    'mode.regular': 'レギュラー',
    'mode.zen': '禅モード',
    'mode.timeattack': 'タイムアタック',
    'mode.custom': 'カスタム練習',

    'settings.title': 'カスタム練習の設定',
    'settings.desc': 'カスタム練習に登場する条件を選べます。各セクションで最低1つは選択してください。',
    'settings.cat.title': '牌カテゴリ',
    'settings.turn.title': '巡目',
    'settings.shape.title': '形',
    'settings.hand.title': '手牌の状態',
    'settings.declarer.title': 'リーチ者の座席',
    'settings.playerrole.title': '自分の立場',
    'settings.opprole.title': 'リーチ者の立場',
    'settings.qcount.title': '問題数',
    'settings.cat.doubleMusuji': 'ダブル無スジ 4/5/6',
    'settings.cat.musuji37': '無スジ 3/7',
    'settings.cat.musuji28': '無スジ 2/8',
    'settings.cat.katamusuji': '片無スジ 4/5/6',
    'settings.cat.musuji19': '無スジ 1/9',
    'settings.turn.5': '5巡目',
    'settings.turn.9': '9巡目',
    'settings.turn.14': '14巡目',
    'settings.shape.perfect': '[A] 完全形',
    'settings.shape.good2': '[B] 両面×2',
    'settings.shape.goodRyankan': '[C] 両面＋リャンカン',
    'settings.shape.goodKanchan': '[D] 両面＋カンチャン',
    'settings.shape.badRyankan': '[E] カンチャン＋リャンカン',
    'settings.shape.pairs': '[F] 七対子',
    'settings.shape.badHeadless': '[C−] 悪いヘッドレス',
    'settings.shape.mediocreHeadless': '[C+] やや悪いヘッドレス',
    'settings.shape.badKuttsuki': '[C] 悪いくっつき',
    'settings.shape.standardHeadless': '[A−] 標準ヘッドレス',
    'settings.shape.standardKuttsuki': '[A] 標準くっつき',
    'settings.shape.goodHeadless1': '[S] 連続形ヘッドレス',
    'settings.shape.goodHeadless2': '[S] 暗刻ヘッドレス',
    'settings.shape.goodKuttsuki': '[S+] 良いくっつき',
    'settings.hand.menzen': '門前',
    'settings.hand.fuuro': '副露',
    'settings.declarer.kamicha': '上家',
    'settings.declarer.toimen': '対面',
    'settings.declarer.shimocha': '下家',
    'settings.role.dealer': '親',
    'settings.role.nondealer': '子',
    'settings.note.cat': '含めるカテゴリを選択してください。',
    'settings.note.turn': '含める巡目を選択してください。',
    'settings.note.shape': '含める形を選択してください。',
    'settings.note.hand': '含める手牌の状態を選択してください。',
    'settings.note.declarer': '含めるリーチ者の座席を選択してください。',
    'settings.note.playerrole': '自分の立場を選択してください。',
    'settings.note.opprole': 'リーチ者の立場を選択してください。',
    'settings.note.qcount': '練習の問題数を選んでください。',
    'settings.note.required': '最低1つは選択してください。',
    'settings.note.all': 'すべて選択されています。',
    'settings.note.some': '{m}個中{n}個を選択中。',
    'settings.back': '戻る',
    'settings.start': '練習開始',

    'game.logo': 'イーシャンテン オラクル',
    'game.score': 'スコア',
    'game.combo': 'コンボ',
    'game.dealin': '放銃率の目安',
    'game.shapes': '形',
    'game.exit': '終了',
    'game.panel.shapeTiers': '形ティア',
    'game.panel.thresholds': '押し引きボーダー放銃率',
    'game.panel.hidden': '非表示',
    'game.panel.auto': '自動',
    'game.panel.hide': '隠す',
    'game.panel.autoTip': 'クリックで該当する表を自動選択',
    'game.panel.hideTip': '隠す（自動モード解除）',
    'game.panel.autoOnTip': '自動モードが有効ですが、まだ表が選択されていません',
    'game.panel.emptyHint': '<b>自動</b>をクリックすると該当する表を自動選択します。下のボタンで直接移動もできます。',
    'game.panel.tier': 'ティア',
    'game.quiz.title': 'クイズ',
    'game.sc.shape': '形と状態',
    'game.sc.yaku': '役とドラ',
    'game.sc.role': '立場',
    'game.sc.declarer': 'リーチ者',
    'game.discard.title': '打牌 — 牌カテゴリ',

    'board.toimen': '対面',
    'board.kamicha': '上家',
    'board.shimocha': '下家',
    'board.you': '自分',
    'board.turn': '巡目',

    'quiz.step1': '通ったスジの本数',
    'quiz.step1.text': 'リーチ者の捨て牌を確認します。<br><b>通ったスジ</b>は何種類あるでしょう？',
    'quiz.step2': '放銃率',
    'quiz.step2.text': '通ったスジから見て、<b>{cat}</b> の<b>放銃率</b>はおよそいくらでしょう？',
    'quiz.step3': '判断',
    'quiz.step3.text': '手牌のティアと牌の危険度から、<b>押す</b>か<b>降りる</b>か選んでください。',
    'quiz.push': '押す',
    'quiz.fold': '降りる',
    'quiz.next': '次の問題 →',

    'cat.Double musuji 4/5/6': 'ダブル無スジ 4/5/6',
    'cat.Musuji 3/7': '無スジ 3/7',
    'cat.Musuji 2/8': '無スジ 2/8',
    'cat.Katamusuji 4/5/6': '片無スジ 4/5/6',
    'cat.Musuji 1/9': '無スジ 1/9',
    'catdesc.Double musuji 4/5/6': '4・5・6 — ダブルの無スジ牌',
    'catdesc.Musuji 3/7': '3 または 7 — 無スジ牌',
    'catdesc.Musuji 2/8': '2 または 8 — 無スジ牌',
    'catdesc.Katamusuji 4/5/6': '中張牌 — 片スジ',
    'catdesc.Musuji 1/9': '老頭牌 — 無スジ牌',

    'seat.kamicha': '上家',
    'seat.toimen': '対面',
    'seat.shimocha': '下家',

    'role.vsND': '子から',
    'role.vsD': '親から',
    'role.asD': '親として',

    'yaku.hanUnit': '翻',
    'yaku.Yakuhai': '役牌暗刻',
    'yaku.Tanyao': 'タンヤオ',
    'yaku.Chiitoi': '七対子',
    'yaku.Dora': 'ドラ',

    'sc.callable': '鳴ける',

    'dealin.title': '放銃率の目安',
    'dealin.desc': '牌カテゴリ別、各放銃率レンジに到達するのに必要な通しスジ数の最小値。',
    'dealin.rateHeader': '放銃率',
    'dealin.modTitle': 'よくある補正（表外）:',
    'dealin.modBody': 'ドラ: +2% ・ 外側: −5% ・ 1チャンス: −3% ・ 暗刻/暗刻スジ: +2%',
    'dealin.modWarn': 'これらの補正は放銃率の推定には反映されていません。',

    'shapes.title': '形のリファレンス',
    'shapes.desc': '手牌形状カテゴリと、13枚の手牌例。',
    'shapes.acceptance': '受け入れ:',
    'shapes.goodRate': '良形率:',
    'shapes.tilesUnit': '{n}枚',

    'panel.shapeTier.hidden': '非表示',
    'panel.shapeTier.menzenND': '門前・子',
    'panel.shapeTier.menzenD': '門前・親',
    'panel.shapeTier.fuuroNDC': '副露・子・上家リーチ',
    'panel.shapeTier.fuuroNDNC': '副露・子・非上家リーチ',
    'panel.shapeTier.fuuroDC': '副露・親・上家リーチ',
    'panel.shapeTier.fuuroDNC': '副露・親・非上家リーチ',

    'panel.thresh.menzenVsND': '門前・子相手',
    'panel.thresh.menzenVsD': '門前・親相手',
    'panel.thresh.menzenAsD': '門前・親として',
    'panel.thresh.fuuroVsND': '副露・子相手',
    'panel.thresh.fuuroVsD': '副露・親相手',
    'panel.thresh.fuuroAsD': '副露・親として',

    'btn.shape.menzenND': '門前・子',
    'btn.shape.fuuroNDC': '副露・子・上',
    'btn.shape.menzenD': '門前・親',
    'btn.shape.fuuroND': '副露・子',
    'btn.shape.fuuroDC': '副露・親・上',
    'btn.shape.fuuroD': '副露・親',

    'btn.thresh.menzenVsND': '門前vs子',
    'btn.thresh.menzenVsD': '門前vs親',
    'btn.thresh.menzenAsD': '門前・親',
    'btn.thresh.fuuroVsND': '副露vs子',
    'btn.thresh.fuuroVsD': '副露vs親',
    'btn.thresh.fuuroAsD': '副露・親',

    'help.title': '遊び方',
    'help.overview.title': '概要',
    'help.overview.body': '1シャンテンの手牌と相手のリーチが提示されます。3つのステップに順番に答えて押し引きを判断します。',
    'help.step1.title': 'ステップ1 — 通ったスジを数える',
    'help.step1.body': 'リーチ者の捨て牌で止まっているスジの種類数。リーチ後の捨て牌も含みます。4枚全て見えている牌はノーチャンスとして扱います。',
    'help.step2.title': 'ステップ2 — 放銃率の見積り',
    'help.step2.body': '6つの区分: <code>&lt;5%</code>、<code>5–10%</code>、<code>10–15%</code>、<code>15–20%</code>、<code>20–25%</code>、<code>&gt;25%</code>。',
    'help.step3.title': 'ステップ3 — 押すか降りるか',
    'help.step3.body': "役職（親・子）、手牌の状態（門前・鳴き）、巡目、および手牌の<b>ティア（段階）</b>に基づいて、表から手牌の<b>閾値（T）</b>を確認します。ティアは手牌の形、役、ドラの数によって決まります。",
    'help.step3.list': '<li>牌の放銃率（R）が <b>≤ T</b> の場合：<b>押し</b>。</li><li>R が <b>&gt; T</b> の場合：<b>降り</b>。</li><li>T が<b>バケツ（範囲）内</b>に収まる場合：<b>微差</b> — どちらの回答も200点となり、ボタンが緑（わずかに有利）または黄色（曖昧）に光ります。</li>',
    'help.grades.title': 'ランク',
    'help.grades.body': `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; font-size: 13px;padding-left:20px;">
        <div><b>S+</b> &gt; 95%</div>
        <div><b>B+</b> 65–70%</div>
        <div><b>S</b> 90–95%</div>
        <div><b>B</b> 60–65%</div>
        <div><b>S-</b> 85–90%</div>
        <div><b>B-</b> 55–60%</div>
        <div><b>A+</b> 80–85%</div>
        <div><b>C</b> 45–55%</div>
        <div><b>A</b> 75–80%</div>
        <div><b>D</b> 30–45%</div>
        <div><b>A-</b> 70–75%</div>
        <div><b>E</b> &lt; 30%</div>
    </div>
    `,
    'help.combo.title': 'コンボ',
    'help.combo.body': '押し引きを連続で正解すると倍率が上がります：0〜1で×1.0、2以降は1コンボごとに+0.1、91コンボで×10が上限。間違えるとリセット。',
    'help.ta.title': 'タイムアタックの時間',
    'help.ta.list': '<li>押し引き正解: <b>+10秒</b>（境界線は正解側で×2、×1.5）</li><li>押し間違い: <b>−15秒</b> ・ 降り間違い: <b>−10秒</b></li>',
    'help.controls.title': '操作',
    'help.controls.body': '矢印キーで移動、Enterで決定、Escでモーダルを閉じる／メニューへ戻る。',

    'help.scoring.title': '得点システム',
    'help.scoring.list': '<li>ステップ1：正解で <b>300</b>、±1のズレで <b>100</b>、その他 0</li><li>ステップ2：正解で <b>300</b>、その他 0</li><li>ステップ3：正解で <b>400</b>、微差で <b>200</b>、その他 0</li><li>タイムボーナス：<b>max(0, 200 − 秒数 × 10)</b></li>',

    'help.tables.title': '参考テーブル',
    'help.tables.list': '<li><b>放銃率</b> — カテゴ/バケツごとの全体レート表。</li><li><b>形</b> — 手牌の形の例。</li><li><b>形ティアパネル</b> — <b>Auto</b>をオンにすると、問題ごとに一致する表が自動選択されます。</li><li><b>ボーダーパネル</b> — 閾値。同様に自動選択されます。</li>',

    'fb.correct': '正解！',
    'fb.close': 'おしい！',
    'fb.bad': '残念。',
    'fb.step1.ok': '通ったスジは {n} 本{breakdown}。',
    'fb.step1.wrong': '{v} と答えました。実際は <b>{n}</b> 本の通ったスジ{breakdown}。',
    'fb.suji.declarer': 'リーチ者{n}本',
    'fb.suji.postRiichi': 'リーチ後{n}本',
    'fb.suji.noChance': 'ノーチャンス{n}本',
    'fb.step2.ok': '<b>正解！</b> 放銃率は <b>{b}</b>（実測: <b>{exact}</b>）。',
    'fb.step2.bad': '<b>不正解。</b> 正しい区分は <b>{b}</b>（実測: <b>{exact}</b>）。',
    'fb.step3.ok': '<b>正解！</b>',
    'fb.step3.bad': '<b>不正解。</b>',
    'fb.step3.answerIs': '正解は <b>{d}</b> です。',
    'fb.step3.borderline': '<b>境界線！</b> {d} を選択。{lean}',
    'fb.step3.borderlineDetail': '通ったスジ: <b>{n}本</b> ・ 放銃率: <b>{b}</b>（実測: <b>{exact}</b>） ・ 手牌ボーダー放銃率（ティア {tier}, {role}）: <b>{t}</b>',
    'fb.step3.detail': '通ったスジ: <b>{n}本</b> ・ 放銃率: <b>{b}</b>（実測: <b>{exact}</b>） ・ 手牌ボーダー放銃率（ティア {tier}, {role}）: <b>{t}</b>',
    'fb.step3.comparePush': '放銃率 ≤ ボーダー放銃率 → 押し',
    'fb.step3.compareFold': '放銃率 > ボーダー放銃率 → 降り',
    'fb.step3.all': '全て（常に押し）',
    'fb.lean.fold': 'ボーダー放銃率は範囲の下端寄り — <b>降り</b>がやや有利。',
    'fb.lean.push': 'ボーダー放銃率は範囲の上端寄り — <b>押し</b>がやや有利。',
    'fb.lean.both': 'ボーダー放銃率は範囲の中ほど — どちらとも言えない。微差な選択。',
    'fb.ta.pts': '+{pts}点',
    'fb.ta.mult': ' (×{mult})',
    'fb.ta.plusSec': ' ・+{s}秒',
    'fb.ta.minusSec': ' ・-{s}秒',
    'fb.borderlineLabel': '微差！',
    'fb.verdict.ironPush': '鉄押し',
    'fb.verdict.ironPull': '鉄引き',

    'results.runComplete': '完了',
    'results.practiceComplete': '練習完了',
    'results.timesUp': 'タイムアップ！',
    'results.totalScore': '合計スコア',
    'results.timeBonus': 'タイムボーナス',
    'results.suji': 'スジ精度',
    'results.dealin': '放銃率精度',
    'results.pushfold': '押し引き精度',
    'results.maxCombo': '最大コンボ',
    'results.playAgain': 'もう一度',
    'results.menu': 'メニューへ',

    'about.title': 'このアプリについて',
    'about.overview': '概要',
    'about.p1': '1シャンテンの押し引き判断力を鍛えるトレーニングツールです。相手のリーチに対して、通ったスジの数を数え、放銃率を推定し、手牌の<b>ボーダー放銃率</b>と比較して押し引きを判断するという3ステップを繰り返し練習できます。主に平場での判断を想定しています。',
    'about.howToUse': '使い方',
    'about.p2': '各問題では、1シャンテンの手牌・相手のリーチ河・打牌候補の牌カテゴリ・形とボーダーの参照テーブルが表示されます。クイズの3ステップに順番に答えてください。左右のパネルは<i>Auto</i>で自動選択できます。下の直接移動ボタンで特定の表にジャンプすることも可能です。<h4>表の見方</h4>まず、<b>形のティア表</b>から、手牌の形とロン打点に対応するティアを決定します。使用する表は、親・子の別、門前・副露の別によって異なり、副露手については上家がリーチしているかどうかでも表が分かれます。各形には、形の相対的な価値に応じてティアが設定されています。基本的には[A] Perfectが最も有利なティアに割り当てられ、[B]から[F]にかけて形に応じたティアが設定されています。<h4>補足事項</h4><ul><li><b>上家がリーチしている場合の副露手：</b>上家がリーチしている場合は専用の表を使用します。</li><li><b>鳴ける役がある門前手（タンヤオ・役牌暗刻）：</b>副露表の翻数−1、ティア+1で評価します。鳴いてテンパイを取る選択肢を考慮した結果です。</li><li><b>特殊な1シャンテン形：</b>[S]ティアのくっつき形・ヘッドレス形は、[A] Perfectを基準に1ティア上乗せして評価します。</li></ul>',
    'about.sources': '参考文献・算出方法',
    'about.p4': '形のティア表およびボーダー放銃率表は、主にうに丸氏の著書『うに丸式 セオリーで勝つ麻雀』を参考にしています。同書で参考にされている『統計学のマージャン戦術』および『新・科学する麻雀』のデータも基になっています。<br><br>[D] 両面＋カンチャンの形は元データに含まれていなかったため、独自に補間しています。元データの[D]・[E]は、それぞれ[E]・[F]に名称を変更しています。その他の形は、形の名称の接頭辞に応じて基本ティアに割り当てています。放銃率の推定値は、みーにん氏の『統計学のマージャン戦術』を参考にしています。<b>あくまで判断の参考としてご利用ください。</b>',
    'about.credits': 'クレジット',
    'about.p3': '制作：kakino_tea<br>X：<a style="color:#738ad0" href="https://x.com/mican8saku" target="_blank" rel="noopener noreferrer">@mican8saku</a>',
  }
};

function t(key, fallback) {
  const lang = (State && State.lang) || 'en';
  const dict = I18N[lang] || {};
  if (dict[key] !== undefined) return dict[key];
  if (I18N.en[key] !== undefined) return I18N.en[key];
  return fallback !== undefined ? fallback : key;
}

function tf(key, vars) {
  let s = t(key);
  if (vars) for (const k in vars) {
    s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  }
  return s;
}

function catLabel(cat) { return t('cat.' + cat, CATEGORY_INFO[cat] ? CATEGORY_INFO[cat].label : cat); }
function catDesc(cat)  { return t('catdesc.' + cat, CATEGORY_INFO[cat] ? CATEGORY_INFO[cat].desc : ''); }
function shapeLabel(shape) { return t(SHAPE_LABEL_KEYS[shape] || '', SHAPE_LABELS[shape] || shape); }
function roleLabel(roleKey) { return t(ROLE_KEY_MAP[roleKey] || '', roleKey); }

function roundLabel(en) {
  if (State.lang !== 'ja') return en;
  const m = /East (\d+)-(\d+)/.exec(en);
  if (!m) return en;
  return `東${m[1]}局`;
}

function taSuffix(pts, mult, secs) {
  let s = tf('fb.ta.pts', { pts });
  if (mult > 1) s += tf('fb.ta.mult', { mult: mult.toFixed(1) });
  if (secs !== undefined && secs !== 0) {
    s += secs > 0 ? tf('fb.ta.plusSec', { s: secs }) : tf('fb.ta.minusSec', { s: Math.abs(secs) });
  }
  return ` <span style="opacity:.85">${s}</span>`;
}

function applyLanguage(lang) {
  if (!I18N[lang]) lang = 'en';
  State.lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

  document.documentElement.lang = lang;
  document.title = t('page.title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });

  const lb = $('langBtn');
  if (lb) lb.textContent = lang === 'ja' ? 'English' : '日本語';

  renderHomeHighScores();
  renderThresholdPanel();
  renderShapeTierPanel();
  renderHelpBody();

  document.querySelectorAll('#shapeTierDirectNav .btn').forEach((btn, i) => {
    if (SHAPE_TIER_BTN_CONFIG[i]) btn.textContent = t(SHAPE_TIER_BTN_CONFIG[i].labelKey);
  });
  document.querySelectorAll('#thresholdDirectNav .btn').forEach((btn, i) => {
    if (THRESHOLD_BTN_CONFIG[i]) btn.textContent = t(THRESHOLD_BTN_CONFIG[i].labelKey);
  });

  if ($('shapesModal').classList.contains('active')) buildShapesContent();
  if ($('dealInModal').classList.contains('active')) $('dealInChartWrap').innerHTML = buildDealInChartHTML();

  if (State.q && $('game').classList.contains('active')) {
    renderScenario(State.q);
    $('modePill').textContent = t('mode.' + State.mode);
    updateScorePill();
    updateComboDisplay();
    updateBoardLabels(State.q);
  }
}

function updateBoardLabels(q) {
  const windChar = w => WIND_CHARS[w] || '';
  const tLbl = $('seatLabelToimen');
  const kLbl = $('seatLabelKamicha');
  const sLbl = $('seatLabelShimocha');
  const yLbl = $('seatLabelYou');
  const turnLbl = $('centerPanelTurn');
  const roundLbl = $('centerPanelRound');

  if (tLbl) tLbl.innerHTML = `<span class="wind">${windChar(q.seatWinds.toimen)}</span>${t('board.toimen')}`;
  if (kLbl) kLbl.innerHTML = `<span class="wind">${windChar(q.seatWinds.kamicha)}</span>${t('board.kamicha')}`;
  if (sLbl) sLbl.innerHTML = `<span class="wind">${windChar(q.seatWinds.shimocha)}</span>${t('board.shimocha')}`;
  if (yLbl) yLbl.innerHTML = `<span class="wind">${windChar(q.seatWinds.player)}</span>${t('board.you')}`;
  if (turnLbl) turnLbl.textContent = t('board.turn');
  if (roundLbl) roundLbl.textContent = roundLabel(q.roundLabel);
}

/* =========================================================
   UTILITIES
   ========================================================= */
const $ = id => document.getElementById(id);
const pickOne = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pct = v => Math.round(v * 100) + '%';
const isHonor = t => t.endsWith('z');
const baseTile = t => (t && t[0] === '0') ? '5' + t[1] : t;
function tileNumber(t) { if (!t) return 0; if (t[0] === '0') return 5; return parseInt(t[0], 10); }

function formatTime(s) {
  if (s < 60) return Math.floor(s) + 's';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getComboMultiplier(combo) {
  if (combo < 2) return 1;
  return Math.min(10, 1 + (combo - 1) * 0.1);
}

function isRegular() { return State.mode === 'regular'; }
function isZen() { return State.mode === 'zen'; }
function isTimeAttack() { return State.mode === 'timeattack'; }
function isCustom() { return State.mode === 'custom'; }
function scoringEnabled() { return isRegular() || isTimeAttack(); }

function getCorrectShapeTierIndex(q) {
  if (!q) return 0;
  const isEffOpen = q.effectiveOpen;
  if (!isEffOpen) return q.playerIsDealer ? 2 : 1;
  const isC = q.declarer === 'kamicha';
  if (q.playerIsDealer) return isC ? 5 : 6;
  return isC ? 3 : 4;
}

function getCorrectThresholdIndex(q) {
  if (!q) return 0;
  const roleMap = { 'VS Non-Dealer': 1, 'VS Dealer': 2, 'As Dealer': 3 };
  const base = roleMap[q.roleKey] || 1;
  return q.effectiveOpen ? base + 3 : base;
}

function computeGrade(ratio) {
  if (ratio > 0.95) return 'S+';
  if (ratio >= 0.90) return 'S';
  if (ratio >= 0.85) return 'S-';
  if (ratio >= 0.80) return 'A+';
  if (ratio >= 0.75) return 'A';
  if (ratio >= 0.70) return 'A-';
  if (ratio >= 0.65) return 'B+';
  if (ratio >= 0.60) return 'B';
  if (ratio >= 0.55) return 'B-';
  if (ratio >= 0.45) return 'C';
  if (ratio >= 0.30) return 'D';
  return 'E';
}

function resetSecDelta() {
  const sd = $('secDelta');
  if (!sd) return;
  sd.classList.remove('anim', 'negative');
  sd.textContent = '';
}

function showSecDelta(seconds) {
  if (!isTimeAttack()) return;
  if (!seconds) return;
  const el = $('secDelta');
  if (!el) return;
  const positive = seconds > 0;
  el.textContent = (positive ? '+' : '') + seconds + 's';
  el.classList.toggle('negative', !positive);
  el.classList.remove('anim');
  void el.offsetWidth;
  el.classList.add('anim');
}

/* =========================================================
   HIGH SCORES
   ========================================================= */
function loadHighScores() {
  let data = {};
  try { data = JSON.parse(localStorage.getItem(HS_KEY) || '{}'); } catch (e) { data = {}; }
  const result = {
    regular: data.regular || 0,
    regularGrade: data.regularGrade || '',
    timeattack: data.timeattack || 0
  };
  if (result.regular > 0 && !result.regularGrade) {
    result.regularGrade = computeGrade(result.regular / (MODE_CONFIG.regular.total * 1200));
  }
  return result;
}

function saveHighScore(mode, score, grade) {
  const hs = loadHighScores();
  const key = mode === 'regular' ? 'regular'
    : mode === 'timeattack' ? 'timeattack'
    : null;
  if (!key) return hs;

  const isNewHigh = score > hs[key];
  const isTie = score === hs[key];
  const gradeMissing = (key !== 'timeattack') && !hs[key + 'Grade'];

  if (isNewHigh || (isTie && gradeMissing)) {
    hs[key] = score;
    if (key === 'regular') hs[key + 'Grade'] = grade || '';
    try {
      localStorage.setItem(HS_KEY, JSON.stringify({
        regular: hs.regular,
        regularGrade: hs.regularGrade,
        timeattack: hs.timeattack
      }));
    } catch (e) {}
  }
  return hs;
}

function renderHomeHighScores() {
  const hs = loadHighScores();
  const rank = $('hsRegularGrade');
  const regScore = $('hsRegular');
  const ta = $('hsTimeAttack');
  if (rank) rank.textContent = hs.regularGrade || '—';
  if (regScore) regScore.textContent = hs.regular.toLocaleString() + ' ' + t('home.hs.ptsSuffix');
  if (ta) ta.textContent = hs.timeattack.toLocaleString();
}

/* =========================================================
   CUSTOM CONFIG
   ========================================================= */
function defaultCustomConfig() {
  return {
    categories: ALL_CATEGORIES.slice(),
    turns: ALL_TURNS.slice(),
    shapes: ALL_QUESTION_SHAPES.slice(),
    hands: ALL_HANDS.slice(),
    declarers: ALL_DECLARERS.slice(),
    playerRoles: ALL_PLAYER_ROLES.slice(),
    oppRoles: ALL_OPP_ROLES.slice(),
    questionCount: 10
  };
}

function loadCustomConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
    if (!saved) return defaultCustomConfig();
    const def = defaultCustomConfig();
    return {
      categories: (Array.isArray(saved.categories) ? saved.categories : def.categories).filter(c => ALL_CATEGORIES.includes(c)),
      turns: (Array.isArray(saved.turns) ? saved.turns : def.turns).filter(t => ALL_TURNS.includes(t)),
      shapes: (Array.isArray(saved.shapes) ? saved.shapes : def.shapes).filter(s => ALL_QUESTION_SHAPES.includes(s)),
      hands: (Array.isArray(saved.hands) ? saved.hands : def.hands).filter(h => ALL_HANDS.includes(h)),
      declarers: (Array.isArray(saved.declarers) ? saved.declarers : def.declarers).filter(d => ALL_DECLARERS.includes(d)),
      playerRoles: (Array.isArray(saved.playerRoles) ? saved.playerRoles : def.playerRoles).filter(r => ALL_PLAYER_ROLES.includes(r)),
      oppRoles: (Array.isArray(saved.oppRoles) ? saved.oppRoles : def.oppRoles).filter(r => ALL_OPP_ROLES.includes(r)),
      questionCount: ALL_QUESTION_COUNTS.includes(saved.questionCount) ? saved.questionCount : 10
    };
  } catch (e) {
    return defaultCustomConfig();
  }
}

function readCustomConfigFromUI() {
  const get = (sel, attr, parse) => [...document.querySelectorAll(sel + ' input[type=checkbox]:checked')]
    .map(c => parse ? parseInt(c.dataset[attr], 10) : c.dataset[attr]);
  const qcountBox = document.querySelector('#questionCountSettings input[type=checkbox]:checked');
  return {
    categories: get('#catSettings', 'cat'),
    turns: get('#turnSettings', 'turn', true),
    shapes: get('#shapeSettings', 'shape'),
    hands: get('#handSettings', 'hand'),
    declarers: get('#declarerSettings', 'declarer'),
    playerRoles: get('#playerRoleSettings', 'playerrole'),
    oppRoles: get('#oppRoleSettings', 'opprole'),
    questionCount: qcountBox ? parseInt(qcountBox.dataset.qcount, 10) : 10
  };
}

function syncConfigToUI(cfg) {
  document.querySelectorAll('#catSettings input[type=checkbox]').forEach(c => { c.checked = cfg.categories.includes(c.dataset.cat); });
  document.querySelectorAll('#turnSettings input[type=checkbox]').forEach(c => { c.checked = cfg.turns.includes(parseInt(c.dataset.turn, 10)); });
  document.querySelectorAll('#shapeSettings input[type=checkbox]').forEach(c => { c.checked = cfg.shapes.includes(c.dataset.shape); });
  document.querySelectorAll('#handSettings input[type=checkbox]').forEach(c => { c.checked = cfg.hands.includes(c.dataset.hand); });
  document.querySelectorAll('#declarerSettings input[type=checkbox]').forEach(c => { c.checked = cfg.declarers.includes(c.dataset.declarer); });
  document.querySelectorAll('#playerRoleSettings input[type=checkbox]').forEach(c => { c.checked = cfg.playerRoles.includes(c.dataset.playerrole); });
  document.querySelectorAll('#oppRoleSettings input[type=checkbox]').forEach(c => { c.checked = cfg.oppRoles.includes(c.dataset.opprole); });
  document.querySelectorAll('#questionCountSettings input[type=checkbox]').forEach(c => { c.checked = cfg.questionCount === parseInt(c.dataset.qcount, 10); });
}

function saveCustomConfig() {
  const cfg = readCustomConfigFromUI();
  State.customConfig = cfg;
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(cfg)); } catch (e) {}
}

/* =========================================================
   SEAT ASSIGNMENT
   ========================================================= */
function buildSeatAssignment(eastSeat, declarer) {
  const eastIdx = SEAT_ORDER.indexOf(eastSeat);
  const seatWinds = {};
  SEAT_ORDER.forEach((seat, i) => { seatWinds[seat] = WIND_NAMES[(i - eastIdx + 4) % 4]; });
  return {
    seatWinds,
    playerIsDealer: seatWinds.player === 'East',
    declarerIsDealer: seatWinds[declarer] === 'East'
  };
}

function pickSeatAssignment(declarer, playerRoles, oppRoles) {
  const candidates = [];
  if (playerRoles.includes('Dealer') && oppRoles.includes('Non-Dealer')) {
    candidates.push(buildSeatAssignment('player', declarer));
  }
  if (oppRoles.includes('Dealer') && playerRoles.includes('Non-Dealer')) {
    candidates.push(buildSeatAssignment(declarer, declarer));
  }
  if (playerRoles.includes('Non-Dealer') && oppRoles.includes('Non-Dealer')) {
    const others = ['kamicha', 'toimen', 'shimocha'].filter(p => p !== declarer);
    others.forEach(seat => candidates.push(buildSeatAssignment(seat, declarer)));
  }
  if (!candidates.length) return buildSeatAssignment(declarer, declarer);
  return pickOne(candidates);
}

/* =========================================================
   YAKUHAI / TEYAKU
   ========================================================= */
function isYakuhaiFeasible(playerSeatWind, rank, ponds) {
  const tileCounts = {};
  for (const p in ponds) {
    for (const t of ponds[p]) {
      const base = baseTile(t);
      tileCounts[base] = (tileCounts[base] || 0) + 1;
    }
  }
  const seatWindTile = { 'East': '1z', 'South': '2z', 'West': '3z', 'North': '4z' }[playerSeatWind];
  const isDealer = playerSeatWind === 'East';
  const count = t => tileCounts[t] || 0;
  const dragons = ['5z', '6z', '7z'];
  if (rank === 1) {
    if (isDealer) return dragons.some(t => count(t) < 2);
    const yakuhai = [...new Set(['1z', seatWindTile, ...dragons])];
    return yakuhai.some(t => count(t) < 2);
  }
  if (isDealer) {
    if (count('1z') < 2) return true;
    return dragons.filter(t => count(t) < 2).length >= 2;
  }
  const yakuhai = [...new Set(['1z', seatWindTile, ...dragons])];
  return yakuhai.filter(t => count(t) < 2).length >= 2;
}

function pickYakuhaiWithFeasibility(playerSeatWind, ponds) {
  const isPlayerDealer = playerSeatWind === 'East';
  const wantRank2 = Math.random() < (isPlayerDealer ? 0.33 : 0.10);
  const rank2Feasible = isYakuhaiFeasible(playerSeatWind, 2, ponds);
  const rank1Feasible = isYakuhaiFeasible(playerSeatWind, 1, ponds);
  let yakuhaiRank = 0;
  if (wantRank2 && rank2Feasible) yakuhaiRank = 2;
  else if (rank1Feasible) yakuhaiRank = 1;
  else if (rank2Feasible) yakuhaiRank = 2;
  if (yakuhaiRank > 0) return { name: 'Yakuhai', han: yakuhaiRank };
  return { name: 'Tanyao', han: 1 };
}

function pickTeyakuAndHan(shape, isOpen, playerSeatWind, ponds) {
  if (!isOpen && shape === 'Chiitoi') return { name: 'Chiitoi', han: 2 };
  if (isOpen) {
    return Math.random() < 0.5
      ? pickYakuhaiWithFeasibility(playerSeatWind, ponds)
      : { name: 'Tanyao', han: 1 };
  }
  if (Math.random() >= 0.25) return { name: null, han: 0 };
  return Math.random() < 0.4
    ? pickYakuhaiWithFeasibility(playerSeatWind, ponds)
    : { name: 'Tanyao', han: 1 };
}

/* =========================================================
   PASSED SUJI
   ========================================================= */
function countPassedSuji(riichiPond, allPonds, postRiichiTiles = []) {
  const fromDeclarer = new Set();
  for (const t of riichiPond) {
    if (isHonor(t)) continue;
    const num = tileNumber(t);
    const suit = t[1];
    for (const s of SUJI_MAP[num]) fromDeclarer.add(s + suit);
  }
  const fromOthers = new Set();
  for (const t of postRiichiTiles) {
    if (isHonor(t)) continue;
    const num = tileNumber(t);
    const suit = t[1];
    for (const s of SUJI_MAP[num]) fromOthers.add(s + suit);
  }
  const fromDiscards = new Set([...fromDeclarer, ...fromOthers]);
  const tileCounts = {};
  for (const p in allPonds) {
    for (const t of allPonds[p]) {
      const base = baseTile(t);
      tileCounts[base] = (tileCounts[base] || 0) + 1;
    }
  }
  const fromNoChance = new Set();
  for (const tk in tileCounts) {
    if (tileCounts[tk] < 4) continue;
    if (isHonor(tk)) continue;
    const num = tileNumber(tk);
    const suit = tk[1];
    for (const offset of [1, 2]) {
      const sujiNum = num + offset;
      if (sujiNum >= 4 && sujiNum <= 9) {
        const key = sujiNum + suit;
        if (!fromDiscards.has(key)) fromNoChance.add(key);
      }
    }
  }
  const total = new Set([...fromDiscards, ...fromNoChance]);
  const fromOthersAdded = [...fromOthers].filter(s => !fromDeclarer.has(s)).length;
  return {
    total: total.size,
    fromDiscards: fromDiscards.size,
    fromDeclarer: fromDeclarer.size,
    fromOthersAdded,
    fromNoChance: fromNoChance.size
  };
}

function lookupRate(category, sujiCount) {
  const table = DEAL_IN_RATES[category];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let chosen = keys[0];
  for (const k of keys) if (sujiCount >= k) chosen = k;
  return table[chosen];
}

/* =========================================================
   DISCARD WEIGHTING
   ========================================================= */
function tileWeightsForPosition(i) {
  if (i < 2)  return { honor: 10,  term: 6.5, e28: 1.0, mid: 0.25 };
  if (i < 3)  return { honor: 8.0, term: 10.0,   e28: 2.0,   mid: 0.5 };
  if (i < 5)  return { honor: 6.5,   term: 6.5, e28: 5.0, mid: 2.0   };
  if (i < 9)  return { honor: 5.0, term: 5.5, e28: 10,   mid: 3.0   };
  if (i < 13) return { honor: 3.5, term: 4.0,   e28: 6.5,   mid: 4.5   };
  return       { honor: 4.0,   term: 4.0, e28: 6.5, mid: 5.5 };
}

function pickWeightedTile(counts, position) {
  const w = tileWeightsForPosition(position);
  const candidates = [];
  const weights = [];
  for (const tl of ALL_TILES) {
    if (counts[tl] >= 4) continue;
    let weight;
    if (isHonor(tl)) weight = w.honor;
    else {
      const num = tileNumber(tl);
      if (num === 1 || num === 9) weight = w.term;
      else if (num === 2 || num === 8) weight = w.e28;
      else weight = w.mid;
    }
    candidates.push(tl);
    weights.push(weight);
  }
  if (!candidates.length) return null;
  const totalW = weights.reduce((a, b) => a + b, 0);
  if (totalW <= 0) {
    const tl = candidates[Math.floor(Math.random() * candidates.length)];
    counts[tl]++;
    return tl;
  }
  let r = Math.random() * totalW;
  for (let k = 0; k < candidates.length; k++) {
    r -= weights[k];
    if (r <= 0) { counts[candidates[k]]++; return candidates[k]; }
  }
  const last = candidates[candidates.length - 1];
  counts[last]++;
  return last;
}

/* =========================================================
   BOARD GENERATION
   ========================================================= */
function generatePonds(declarer, T) {
  const counts = {};
  ALL_TILES.forEach(tl => counts[tl] = 0);
  const ponds = { kamicha: [], toimen: [], shimocha: [], player: [] };
  const redPlaced = { "5m": false, "5p": false, "5s": false };

  function pushPick(player, canonicalTile, allowRed = true) {
    if (!canonicalTile) return;
    let display = canonicalTile;
    if (allowRed && !redPlaced[canonicalTile]
        && (canonicalTile === "5m" || canonicalTile === "5p" || canonicalTile === "5s")) {
      const k = counts[canonicalTile];
      if (Math.random() < 1 / (5 - k)) {
        redPlaced[canonicalTile] = true;
        display = "0" + canonicalTile[1];
      }
    }
    ponds[player].push(display);
  }

  for (let i = 0; i < T; i++) {
    const tl = pickWeightedTile(counts, i);
    pushPick(declarer, tl);
  }
  const lastIdx = ponds[declarer].length - 1;
  if (lastIdx >= 0 && isHonor(ponds[declarer][lastIdx])) {
    const numIdx = ponds[declarer].findIndex((tl, i) => i !== lastIdx && !isHonor(tl));
    if (numIdx !== -1) {
      const tmp = ponds[declarer][lastIdx];
      ponds[declarer][lastIdx] = ponds[declarer][numIdx];
      ponds[declarer][numIdx] = tmp;
    }
  }
  let post = [];
  if (declarer === 'shimocha') post = ['toimen', 'kamicha'];
  else if (declarer === 'toimen') post = ['kamicha'];
  const others = ['kamicha', 'toimen', 'shimocha'].filter(p => p !== declarer);
  for (const p of others) {
    const n = T - (post.includes(p) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const tl = pickWeightedTile(counts, i);
      pushPick(p, tl);
    }
  }
  for (let i = 0; i < T - 1; i++) {
    const tl = pickWeightedTile(counts, i);
    pushPick('player', tl);
  }
  for (const p of post) {
    const useGenbutsu = Math.random() < 0.65;
    if (useGenbutsu) {
      const pool = ponds[declarer].filter(x => counts[baseTile(x)] < 4);
      if (pool.length) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        const canonical = baseTile(chosen);
        counts[canonical]++;
        ponds[p].push(canonical);
        continue;
      }
    }
    const declarerSet = new Set(ponds[declarer].map(baseTile));
    const passed = new Set();
    for (const x of ponds[declarer]) {
      if (isHonor(x)) continue;
      const n = tileNumber(x);
      for (const sj of SUJI_MAP[n]) passed.add(sj + x[1]);
    }
    let candidates = ALL_TILES.filter(x => {
      if (counts[x] >= 4) return false;
      if (declarerSet.has(x)) return false;
      if (isHonor(x)) return false;
      const n = tileNumber(x);
      for (const sj of SUJI_MAP[n]) if (!passed.has(sj + x[1])) return true;
      return false;
    });
    if (!candidates.length) candidates = ALL_TILES.filter(x => counts[x] < 4 && !declarerSet.has(x));
    if (!candidates.length) candidates = ALL_TILES.filter(x => counts[x] < 4);
    if (candidates.length) {
      const canonical = candidates[Math.floor(Math.random() * candidates.length)];
      counts[canonical]++;
      pushPick(p, canonical);
    } else {
      const tl = pickWeightedTile(counts, T);
      pushPick(p, tl);
    }
  }
  const all = [];
  for (const p in ponds) ponds[p].forEach((tl, i) => all.push({ p, i, t: tl }));
  const total = all.length;
  const honors = all.filter(x => isHonor(x.t)).length;
  let need = Math.ceil(total * 0.30) - honors;
  if (need > 0) {
    const conv = shuffle(all.filter(x =>
      x.p !== declarer &&
      !(post.includes(x.p) && x.i === ponds[x.p].length - 1) &&
      !isHonor(x.t) &&
      (counts[baseTile(x.t)] || 0) < 4
    ));
    for (const c of conv) {
      if (need <= 0) break;
      const hc = ALL_TILES.filter(tl => isHonor(tl) && counts[tl] < 4);
      if (!hc.length) break;
      const nt = hc[Math.floor(Math.random() * hc.length)];
      counts[baseTile(c.t)]--;
      counts[nt]++;
      ponds[c.p][c.i] = nt;
      need--;
    }
  }
  return { ponds, post };
}

/* =========================================================
   SHAPE TIER DATA
   ========================================================= */
function computeShapeTierData(config) {
  if (config.empty) return null;
  const points = config.isOpen
    ? (config.isDealer ? {1:1500, 2:2900, 3:5800, 4:11600} : {1:1000, 2:2000, 3:3900, 4:7700})
    : (config.isDealer ? {1:2000, 2:3900, 3:7700, 4:12000} : {1:1300, 2:2600, 3:5200, 4:8000});
  const chiitoiPts = config.isDealer ? CHIITOI_POINTS.dealer : CHIITOI_POINTS.nonDealer;
  const maxTier = config.isOpen ? 11 : 8;
  const shapes = ['Perfect', 'Good*2', 'Good+Ryankan', 'Good+Kanchan', 'Bad+Ryankan', 'Chiitoi'];
  const cells = {};
  for (let tier = 1; tier <= maxTier; tier++) {
    cells[tier] = {};
    shapes.forEach(s => cells[tier][s] = new Set());
  }
  for (const key in config.map) {
    const parts = key.split('|');
    const shape = parts[0];
    const han = parseInt(parts[1], 10);
    const tier = config.map[key];
    if (tier < 1 || tier > maxTier) continue;
    if (!cells[tier][shape]) cells[tier][shape] = new Set();
    let ptVal;
    if (!config.isOpen && shape === 'Chiitoi') ptVal = chiitoiPts[Math.min(han, 5)];
    else ptVal = points[Math.min(han, 4)];
    if (ptVal !== undefined) cells[tier][shape].add(ptVal);
  }
  const rows = [];
  for (let tier = 1; tier <= maxTier; tier++) {
    const row = { tier, cells: {} };
    shapes.forEach(s => { row.cells[s] = [...cells[tier][s]].sort((a, b) => a - b); });
    rows.push(row);
  }
  return { rows, shapes, maxTier };
}

const SHAPE_TIER_TABLES = [
  { labelKey: 'panel.shapeTier.hidden', empty: true },
  { labelKey: 'panel.shapeTier.menzenND', map: CLOSED_TIER_MAP, isOpen: false, isDealer: false },
  { labelKey: 'panel.shapeTier.menzenD', map: CLOSED_TIER_MAP, isOpen: false, isDealer: true },
  { labelKey: 'panel.shapeTier.fuuroNDC', map: OPEN_TIER_MAP_ND_C, isOpen: true, isDealer: false },
  { labelKey: 'panel.shapeTier.fuuroNDNC', map: OPEN_TIER_MAP_ND_NC, isOpen: true, isDealer: false },
  { labelKey: 'panel.shapeTier.fuuroDC', map: OPEN_TIER_MAP_D_C, isOpen: true, isDealer: true },
  { labelKey: 'panel.shapeTier.fuuroDNC', map: OPEN_TIER_MAP_D_NC, isOpen: true, isDealer: true }
];
const SHAPE_TIER_DATA = SHAPE_TIER_TABLES.map(computeShapeTierData);

const THRESHOLD_TABLES = [
  { labelKey: 'panel.thresh.menzenVsND', table: CLOSED_THRESHOLDS['VS Non-Dealer'], maxTier: 8 },
  { labelKey: 'panel.thresh.menzenVsD',  table: CLOSED_THRESHOLDS['VS Dealer'],     maxTier: 8 },
  { labelKey: 'panel.thresh.menzenAsD',  table: CLOSED_THRESHOLDS['As Dealer'],     maxTier: 8 },
  { labelKey: 'panel.thresh.fuuroVsND',  table: OPEN_THRESHOLDS['VS Non-Dealer'],   maxTier: 11 },
  { labelKey: 'panel.thresh.fuuroVsD',   table: OPEN_THRESHOLDS['VS Dealer'],       maxTier: 11 },
  { labelKey: 'panel.thresh.fuuroAsD',   table: OPEN_THRESHOLDS['As Dealer'],       maxTier: 11 }
];

const SHAPE_TIER_BTN_CONFIG = [
  { labelKey: 'btn.shape.menzenND', state: 1 },
  { labelKey: 'btn.shape.fuuroNDC', state: 3 },
  { labelKey: 'btn.shape.menzenD', state: 2 },
  { labelKey: 'btn.shape.fuuroND', state: 4 },
  { labelKey: 'btn.shape.fuuroDC', state: 5 },
  { labelKey: 'btn.shape.fuuroD', state: 6 }
];
const THRESHOLD_BTN_CONFIG = [
  { labelKey: 'btn.thresh.menzenVsND', state: 1 },
  { labelKey: 'btn.thresh.menzenVsD',  state: 2 },
  { labelKey: 'btn.thresh.menzenAsD',  state: 3 },
  { labelKey: 'btn.thresh.fuuroVsND',  state: 4 },
  { labelKey: 'btn.thresh.fuuroVsD',   state: 5 },
  { labelKey: 'btn.thresh.fuuroAsD',   state: 6 }
];

/* =========================================================
   STATE
   ========================================================= */
let State = {
  mode: 'regular',
  lang: 'en',
  index: 0,
  total: 10,
  score: 0,
  combo: 0,
  maxCombo: 0,
  log: [],
  q: null,
  step: 0,
  timerStart: 0,
  timerStopped: true,
  raf: null,
  kbdIdx: 0,
  boardToken: 0,
  session: 0,
  transitioning: false,
  stats: { s1Total: 0, s1Correct: 0, s2Total: 0, s2Correct: 0, s3Total: 0, s3Correct: 0 },
  customConfig: defaultCustomConfig(),
  thresholdIndex: 0,
  shapeTierIndex: 0,
  thresholdAuto: false,
  shapeTierAuto: false
};

let TimeAttackState = {
  active: false,
  timeLeft: 45,
  lastTick: 0,
  rafId: null,
  questionsAnswered: 0,
  paused: true
};

State.customConfig = loadCustomConfig();

function updateComboDisplay() {
  const pill = $('comboPill');
  if (!pill) return;
  const displayCombo = Math.min(100, State.combo);
  const mult = getComboMultiplier(State.combo);
  pill.textContent = t('game.combo') + ' ' + displayCombo + (mult > 1 ? ' · ×' + mult.toFixed(1) : '');
  pill.classList.toggle('active', mult > 1);
}

function updateScorePill() {
  const pill = $('scorePill');
  if (pill) pill.textContent = t('game.score') + ' ' + State.score;
}

/* =========================================================
   TIME ATTACK
   ========================================================= */
function startTimeAttack() {
  TimeAttackState = {
    active: true,
    timeLeft: 45,
    lastTick: performance.now(),
    rafId: null,
    questionsAnswered: 0,
    paused: true
  };
  TimeAttackState.rafId = requestAnimationFrame(timeAttackTick);
  updateTimeAttackDisplay();
}

function timeAttackTick(now) {
  if (!TimeAttackState.active) return;
  const dt = (now - TimeAttackState.lastTick) / 1000;
  TimeAttackState.lastTick = now;
  if (!TimeAttackState.paused) {
    TimeAttackState.timeLeft -= dt;
    if (TimeAttackState.timeLeft <= 0) {
      TimeAttackState.timeLeft = 0;
      updateTimeAttackDisplay();
      endTimeAttack();
      return;
    }
  }
  updateTimeAttackDisplay();
  TimeAttackState.rafId = requestAnimationFrame(timeAttackTick);
}

function pauseTimeAttack() { if (TimeAttackState.active) TimeAttackState.paused = true; }
function resumeTimeAttack() {
  if (!TimeAttackState.active) return;
  TimeAttackState.paused = false;
  TimeAttackState.lastTick = performance.now();
}
function addTimeAttackTime(seconds) {
  if (!TimeAttackState.active) return;
  TimeAttackState.timeLeft = Math.max(0, TimeAttackState.timeLeft + seconds);
}

function updateTimeAttackDisplay() {
  const pill = $('timerPill');
  if (pill) {
    const secs = Math.max(0, TimeAttackState.timeLeft);
    pill.textContent = secs.toFixed(1) + 's';
    if (secs < 10) {
      pill.style.color = '#fca5a5';
      pill.style.borderColor = '#dc2626';
    } else {
      pill.style.color = '';
      pill.style.borderColor = '';
    }
  }
}

function endTimeAttack() {
  if (!TimeAttackState.active) return;
  TimeAttackState.active = false;
  if (TimeAttackState.rafId) {
    cancelAnimationFrame(TimeAttackState.rafId);
    TimeAttackState.rafId = null;
  }
  State.q = null;
  showTimeAttackResults();
}

function showTimeAttackResults() {
  saveHighScore('timeattack', State.score);
  renderHomeHighScores();

  const s1Pct = Math.round((State.stats.s1Correct / Math.max(1, State.stats.s1Total)) * 100);
  const s2Pct = Math.round((State.stats.s2Correct / Math.max(1, State.stats.s2Total)) * 100);
  const s3Pct = Math.round((State.stats.s3Correct / Math.max(1, State.stats.s3Total)) * 100);

  $('resultsTitle').textContent = t('results.timesUp');
  $('gradeLetter').style.display = '';
  $('gradeLetter').className = 'grade g-score';
  $('gradeLetter').textContent = State.score.toLocaleString();

  $('resultsGrid').innerHTML = `
    <div><span>${t('results.suji')}</span><b>${s1Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s1Correct}/${State.stats.s1Total})</span></b></div>
    <div><span>${t('results.dealin')}</span><b>${s2Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s2Correct}/${State.stats.s2Total})</span></b></div>
    <div><span>${t('results.pushfold')}</span><b>${s3Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s3Correct}/${State.stats.s3Total})</span></b></div>
    <div><span>${t('results.maxCombo')}</span><b>${State.maxCombo}</b></div>
  `;

  $('game').classList.remove('active');
  $('results').classList.add('active');
}

function showRegularResults() {
  const totals = State.log.reduce((a, l) => {
    a.pts += l.pts; a.correct += l.correct; a.steps += l.steps; a.timeBonus += l.timeBonus;
    return a;
  }, { pts: 0, correct: 0, steps: 0, timeBonus: 0 });

  const total = totals.pts + totals.timeBonus;
  const ratio = total / (State.total * 1200);
  const grade = computeGrade(ratio);

  saveHighScore('regular', total, grade);
  renderHomeHighScores();

  const s1Pct = Math.round((State.stats.s1Correct / Math.max(1, State.stats.s1Total)) * 100);
  const s2Pct = Math.round((State.stats.s2Correct / Math.max(1, State.stats.s2Total)) * 100);
  const s3Pct = Math.round((State.stats.s3Correct / Math.max(1, State.stats.s3Total)) * 100);

  $('resultsTitle').textContent = t('results.runComplete');
  $('gradeLetter').style.display = '';
  $('gradeLetter').textContent = grade;
  $('gradeLetter').className = 'grade g-' + grade;

  $('resultsGrid').innerHTML = `
    <div><span>${t('results.totalScore')}</span><b>${total.toLocaleString()}</b></div>
    <div><span>${t('results.timeBonus')}</span><b>+${totals.timeBonus.toLocaleString()}</b></div>
    <div><span>${t('results.suji')}</span><b>${s1Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s1Correct}/${State.stats.s1Total})</span></b></div>
    <div><span>${t('results.dealin')}</span><b>${s2Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s2Correct}/${State.stats.s2Total})</span></b></div>
    <div><span>${t('results.pushfold')}</span><b>${s3Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s3Correct}/${State.stats.s3Total})</span></b></div>
    <div><span>${t('results.maxCombo')}</span><b>${State.maxCombo}</b></div>
  `;

  $('game').classList.remove('active');
  $('results').classList.add('active');
}

function showCustomResults() {
  const s1Pct = Math.round((State.stats.s1Correct / Math.max(1, State.stats.s1Total)) * 100);
  const s2Pct = Math.round((State.stats.s2Correct / Math.max(1, State.stats.s2Total)) * 100);
  const s3Pct = Math.round((State.stats.s3Correct / Math.max(1, State.stats.s3Total)) * 100);

  $('resultsTitle').textContent = t('results.practiceComplete');
  $('gradeLetter').style.display = 'none';

  $('resultsGrid').innerHTML = `
    <div><span>${t('results.suji')}</span><b>${s1Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s1Correct}/${State.stats.s1Total})</span></b></div>
    <div><span>${t('results.dealin')}</span><b>${s2Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s2Correct}/${State.stats.s2Total})</span></b></div>
    <div><span>${t('results.pushfold')}</span><b>${s3Pct}% <span style="font-size:12px;color:#94a3b8;font-weight:700;">(${State.stats.s3Correct}/${State.stats.s3Total})</span></b></div>
    <div><span>${t('results.maxCombo')}</span><b>${State.maxCombo}</b></div>
  `;

  $('game').classList.remove('active');
  $('results').classList.add('active');
}

/* =========================================================
   PANEL RENDERING
   ========================================================= */
function thresholdCellStyle(val) {
  if (val >= 0.25) return { bg: '#6fa8dc', color: '#fff' };
  if (val >= 0.20) return { bg: '#a4c2f4', color: '#000' };
  if (val >= 0.15) return { bg: '#93c47d', color: '#000' };
  if (val >= 0.10) return { bg: '#ffd966', color: '#000' };
  if (val >= 0.05) return { bg: '#ea9999', color: '#000' };
  return { bg: '#b7b7b7', color: '#fff' };
}

function updateIndicatorButton(btn, index, autoEnabled) {
  if (!btn) return;
  if (index === 0) {
    btn.textContent = t('game.panel.auto');
    btn.title = autoEnabled ? t('game.panel.autoOnTip') : t('game.panel.autoTip');
    btn.classList.toggle('auto-active', autoEnabled);
  } else {
    btn.textContent = t('game.panel.hide');
    btn.title = t('game.panel.hideTip');
    btn.classList.remove('auto-active');
  }
}

function renderThresholdPanel() {
  const wrap = $('thresholdTableWrap');
  const title = $('thresholdTitle');
  const indicator = $('threshIndicator');
  const idx = State.thresholdIndex;

  updateIndicatorButton(indicator, idx, State.thresholdAuto);

  const directNav = $('thresholdDirectNav');
  if (directNav) {
    directNav.querySelectorAll('.btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.state, 10) === idx);
    });
  }

  if (idx === 0) {
    title.textContent = t('game.panel.hidden');
    wrap.innerHTML = `<div style="font-size:11px;color:var(--muted);padding:14px 0;text-align:center;">${t('game.panel.emptyHint')}</div>`;
    return;
  }

  const entry = THRESHOLD_TABLES[idx - 1];
  title.textContent = t(entry.labelKey);

  const turns = ['Turn 5', 'Turn 9', 'Turn 14'];
  const turnKeys = ['settings.turn.5', 'settings.turn.9', 'settings.turn.14'];
  let html = `<table class="thresh-table"><thead><tr><th>${t('game.panel.tier')}</th>`;
  turns.forEach((_, i) => html += `<th>${t(turnKeys[i])}</th>`);
  html += '</tr></thead><tbody>';

  for (let tier = 1; tier <= entry.maxTier; tier++) {
    html += `<tr><td>${tier}</td>`;
    for (const turn of turns) {
      const val = entry.table[turn][tier];
      if (val === undefined) html += '<td>-</td>';
      else {
        const style = thresholdCellStyle(val);
        html += `<td style="background:${style.bg};color:${style.color};">${Math.round(val*100)}%</td>`;
      }
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function renderShapeTierPanel() {
  const wrap = $('shapeTierTableWrap');
  const title = $('shapeTierTitle');
  const indicator = $('shapeTierIndicator');
  const idx = State.shapeTierIndex;

  updateIndicatorButton(indicator, idx, State.shapeTierAuto);

  const directNav = $('shapeTierDirectNav');
  if (directNav) {
    directNav.querySelectorAll('.btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.state, 10) === idx);
    });
  }

  if (idx === 0) {
    title.textContent = t('game.panel.hidden');
    wrap.innerHTML = `<div style="font-size:11px;color:var(--muted);padding:14px 0;text-align:center;">${t('game.panel.emptyHint')}</div>`;
    return;
  }

  const entry = SHAPE_TIER_TABLES[idx];
  const data = SHAPE_TIER_DATA[idx];
  title.textContent = t(entry.labelKey);

  if (!data) {
    wrap.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:14px 0;text-align:center;">-</div>';
    return;
  }

  let html = `<table class="thresh-table"><thead><tr><th>${t('game.panel.tier')}</th>`;
  data.shapes.forEach(s => {
    let label = s;
    if (s === 'Perfect') label = 'A';
    else if (s === 'Good*2') label = 'B';
    else if (s === 'Good+Ryankan') label = 'C';
    else if (s === 'Good+Kanchan') label = 'D';
    else if (s === 'Bad+Ryankan') label = 'E';
    else if (s === 'Chiitoi') label = 'F';
    html += `<th>${label}</th>`;
  });
  html += '</tr></thead><tbody>';

  for (const row of data.rows) {
    html += `<tr><td>${row.tier}</td>`;
    for (const shape of data.shapes) {
      const scores = row.cells[shape] || [];
      if (!scores.length) html += '<td>-</td>';
      else html += `<td>${scores.join('/')}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function buildDirectNav(navId, config, onPick) {
  const nav = $(navId);
  nav.innerHTML = '';
  config.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.dataset.state = item.state;
    btn.textContent = t(item.labelKey);
    btn.addEventListener('click', () => onPick(item.state));
    nav.appendChild(btn);
  });
}

/* =========================================================
   DEAL-IN CHART
   ========================================================= */
function buildDealInChartHTML() {
  const categories = ['Double musuji 4/5/6', 'Musuji 3/7', 'Musuji 2/8', 'Katamusuji 4/5/6', 'Musuji 1/9'];
  const minSujiForBucket = (cat, bucketLabel) => {
    const table = DEAL_IN_RATES[cat];
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    for (const k of keys) if (rateToBucket(table[k]) === bucketLabel) return k;
    return null;
  };
  let html = `<table class="deal-in-chart"><thead><tr><th>${t('dealin.rateHeader')}</th>`;
  for (const cat of categories) html += `<th>${catLabel(cat)}</th>`;
  html += '</tr></thead><tbody>';
  for (const bucket of RATE_BUCKETS) {
    html += `<tr><td>${bucket.label}</td>`;
    for (const cat of categories) {
      const minSuji = minSujiForBucket(cat, bucket.label);
      html += `<td>${minSuji !== null ? minSuji : '—'}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function openDealInModal() {
  $('dealInChartWrap').innerHTML = buildDealInChartHTML();
  $('dealInModal').classList.add('active');
}
function closeDealInModal() { $('dealInModal').classList.remove('active'); }

/* =========================================================
   SHAPES MODAL
   ========================================================= */
function shapeTileEl(name) {
  const wrap = document.createElement('div');
  wrap.className = 'shape-tile';
  const img = document.createElement('img');
  img.src = `./tiles/${name}.webp`;
  img.alt = name;
  img.draggable = false;
  img.onerror = () => {
    img.remove();
    const fb = document.createElement('div');
    fb.className = 'shape-tile-fb';
    if (name.endsWith('z')) {
      fb.classList.add('honor');
      fb.innerHTML = `<span class="stf-honor">${HONOR_CHARS[name[0]]}</span>`;
    } else {
      const isRed = name[0] === '0';
      const numDisplay = isRed ? '5' : name[0];
      fb.innerHTML = `<span class="stf-num${isRed ? ' stf-red' : ''}">${numDisplay}</span><span class="stf-suit s-${name[1]}">${SUIT_CHARS[name[1]]}</span>`;
    }
    wrap.appendChild(fb);
  };
  wrap.appendChild(img);
  return wrap;
}

function getAllShapeReference() {
  return SHAPE_REFERENCE.concat(ALL_OTHER_SHAPES.map(k => ({
    nameKey: SHAPE_LABEL_KEYS[k],
    acceptance: OTHER_SHAPES[k].accept,
    goodRate: OTHER_SHAPES[k].good,
    hand: EXTRA_SHAPE_HANDS[k]
  })));
}

function buildShapesContent() {
  const wrap = $('shapesContentWrap');
  wrap.innerHTML = '';
  getAllShapeReference().forEach(shape => {
    const item = document.createElement('div');
    item.className = 'shape-item';
    const h3 = document.createElement('h3');
    h3.textContent = t(shape.nameKey);
    item.appendChild(h3);
    const meta = document.createElement('div');
    meta.className = 'shape-meta';
    meta.innerHTML =
      `<span>${t('shapes.acceptance')} <strong>${tf('shapes.tilesUnit', { n: shape.acceptance })}</strong></span>` +
      `<span>${t('shapes.goodRate')} <strong>${shape.goodRate}</strong></span>`;
    item.appendChild(meta);
    const row = document.createElement('div');
    row.className = 'shape-tiles';
    shape.hand.forEach(name => row.appendChild(shapeTileEl(name)));
    item.appendChild(row);
    wrap.appendChild(item);
  });
}

function openShapesModal() { buildShapesContent(); $('shapesModal').classList.add('active'); }
function closeShapesModal() { $('shapesModal').classList.remove('active'); }

/* =========================================================
   HELP / ABOUT MODALS
   ========================================================= */
function renderHelpBody() {
  $('helpBody').innerHTML = `
    <h3>${t('help.overview.title')}</h3>
    <p>${t('help.overview.body')}</p>
    <h3>${t('help.step1.title')}</h3>
    <p>${t('help.step1.body')}</p>
    <h3>${t('help.step2.title')}</h3>
    <p>${t('help.step2.body')}</p>
    <h3>${t('help.step3.title')}</h3>
    <p>${t('help.step3.body')}</p>
    <ul>${t('help.step3.list')}</ul>
    <h3>${t('help.scoring.title')}</h3>
    <ul>${t('help.scoring.list')}</ul>
    <h3>${t('help.tables.title')}</h3>
    <ul>${t('help.tables.list')}</ul>
    <h3>${t('help.grades.title')}</h3>
    <p>${t('help.grades.body')}</p>
    <h3>${t('help.combo.title')}</h3>
    <p>${t('help.combo.body')}</p>
    <h3>${t('help.ta.title')}</h3>
    <ul>${t('help.ta.list')}</ul>
    <h3>${t('help.controls.title')}</h3>
    <p>${t('help.controls.body')}</p>
  `;
}

function openHelpModal() { renderHelpBody(); $('helpModal').classList.add('active'); }
function closeHelpModal() { $('helpModal').classList.remove('active'); }
function openAboutModal() { $('aboutModal').classList.add('active'); }
function closeAboutModal() { $('aboutModal').classList.remove('active'); }

/* =========================================================
   QUESTION BUILDER
   ========================================================= */
function getQuestionOptions() {
  if (isCustom()) return State.customConfig;
  // Regular / Zen / Time Attack use ONLY the six standard shapes (A–F).
  return {
    categories: ALL_CATEGORIES, turns: ALL_TURNS, shapes: ALL_SHAPES, hands: ALL_HANDS,
    declarers: ALL_DECLARERS, playerRoles: ALL_PLAYER_ROLES, oppRoles: ALL_OPP_ROLES
  };
}

function makeQuestion() {
  const opts = getQuestionOptions();
  const declarer = pickOne(opts.declarers);
  const turn = pickOne(opts.turns);
  const category = pickOne(opts.categories);

  const seatAssign = pickSeatAssignment(declarer, opts.playerRoles, opts.oppRoles);
  const seatWinds = seatAssign.seatWinds;
  const playerIsDealer = seatAssign.playerIsDealer;
  const declarerIsDealer = seatAssign.declarerIsDealer;
  const roundLabel = pickOne(ROUND_LABELS);

  const { ponds, post } = generatePonds(declarer, turn);
  const postRiichiTiles = post.map(p => {
    const pond = ponds[p];
    return pond.length ? pond[pond.length - 1] : null;
  }).filter(Boolean);

  const sujiResult = countPassedSuji(ponds[declarer], ponds, postRiichiTiles);
  const passedSuji = sujiResult.total;
  const rate = lookupRate(category, passedSuji);

  // ---------- Hand construction ----------
  let allowedHands = opts.hands.filter(h => h === 'menzen' || h === 'fuuro');
  if (!allowedHands.length) allowedHands = ['menzen'];

  const shapesForClosed = opts.shapes.filter(s => {
    if (s === 'Chiitoi') return allowedHands.includes('menzen');
    return true;
  });
  const shapesForOpen = opts.shapes.filter(s => s !== 'Chiitoi');

  allowedHands = allowedHands.filter(h => {
    if (h === 'menzen') return shapesForClosed.length > 0;
    if (h === 'fuuro') return shapesForOpen.length > 0;
    return false;
  });
  if (!allowedHands.length) allowedHands = ['menzen'];

  const isOpen = allowedHands.length === 1 ? (allowedHands[0] === 'fuuro') : (Math.random() < 0.45);
  const compatibleShapes = isOpen ? shapesForOpen : shapesForClosed;
  const shape = pickOne(compatibleShapes.length ? compatibleShapes : ['Perfect']);

  const doraCount = pickOne([0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3]);
  const teyakuResult = pickTeyakuAndHan(shape, isOpen, seatWinds.player, ponds);
  const teyakuName = teyakuResult.name;
  const teyakuHan = teyakuResult.han;

  // ---------- Callable detection (internal rule, no longer displayed) ----------
  const canCall = !isOpen && (teyakuName === 'Tanyao' || teyakuName === 'Yakuhai');
  const effectiveOpen = isOpen || canCall;

  // ---------- Han calculation ----------
  const hanRaw = teyakuHan + doraCount + (isOpen ? 0 : 1);
  const maxHan = (!isOpen && shape === 'Chiitoi') ? 5 : 4;
  const han = Math.min(hanRaw, maxHan);
  const lookupHan = canCall ? Math.max(1, han - 1) : han;

  // ---------- Tier map selection ----------
  const cFlag = declarer === 'kamicha' ? 'C' : 'NC';
  let tierMap;
  if (effectiveOpen) {
    if (playerIsDealer) tierMap = cFlag === 'C' ? OPEN_TIER_MAP_D_C : OPEN_TIER_MAP_D_NC;
    else tierMap = cFlag === 'C' ? OPEN_TIER_MAP_ND_C : OPEN_TIER_MAP_ND_NC;
  } else {
    tierMap = CLOSED_TIER_MAP;
  }

  // ---------- Tier lookup ----------
  const baseShape = getBaseShape(shape);
  const shapeOffset = getShapeOffset(shape);
  const callableOffset = canCall ? -1 : 0;
  const totalOffset = shapeOffset + callableOffset;

  function lookupTier(h) {
    const t = tierMap[`${baseShape}|${h}`];
    if (t === undefined) return null;
    return Math.max(1, t + totalOffset);
  }

  const baseTierRaw = lookupTier(lookupHan);
  const tier = baseTierRaw !== null ? baseTierRaw : (effectiveOpen ? 11 : 8);

  const roleKey = playerIsDealer ? 'As Dealer' : (declarerIsDealer ? 'VS Dealer' : 'VS Non-Dealer');
  const turnKey = `Turn ${turn}`;
  const threshTable = effectiveOpen ? OPEN_THRESHOLDS : CLOSED_THRESHOLDS;
  const threshold = threshTable[roleKey][turnKey][tier] ?? 0;

  const verdictLevel = getVerdictLevel(rate, threshold);
  const borderline = isBorderlineVerdict(verdictLevel);
  const decision = (verdictLevel === 'push' || verdictLevel === 'ironPush') ? 'PUSH'
                 : (verdictLevel === 'pull' || verdictLevel === 'ironPull') ? 'FOLD'
                 : 'PUSH';

  return {
    declarer, turn, ponds, passedSuji, sujiResult,
    category, rate, rateBucket: rateToBucket(rate),
    isOpen, effectiveOpen, canCall,
    shape, baseShape, shapeOffset,
    han, lookupHan,
    teyakuName, teyakuHan, doraCount,
    playerIsDealer, declarerIsDealer, roleKey, tier,
    threshold, decision, verdictLevel, borderline,
    seatWinds, roundLabel,
    answered: { s1: false, s2: false, s3: false },
    elapsed: 0
  };
}

/* =========================================================
   BOARD RENDERING
   ========================================================= */
function tileEl(name, rotated) {
  const div = document.createElement('div');
  div.className = 'tile' + (rotated ? ' rotated' : '');
  const img = document.createElement('img');
  img.src = `./tiles/${name}.webp`;
  img.alt = name;
  img.draggable = false;
  img.onerror = () => {
    img.remove();
    const fb = document.createElement('div');
    fb.className = 'tile-fallback';
    if (name.endsWith('z')) {
      fb.classList.add('honor');
      fb.innerHTML = `<span class="tf-honor">${HONOR_CHARS[name[0]]}</span>`;
    } else {
      const isRed = name[0] === '0';
      const numDisplay = isRed ? '5' : name[0];
      const redStyle = isRed ? 'color:#dc2626;' : '';
      fb.innerHTML = `<span class="tf-num" style="${redStyle}">${numDisplay}</span><span class="tf-suit s-${name[1]}">${SUIT_CHARS[name[1]]}</span>`;
    }
    div.appendChild(fb);
  };
  div.appendChild(img);
  return div;
}

function fitBoard() {
  const wrap = $('tableWrap');
  const board = $('board');
  if (!wrap || !board) return;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  const s = Math.min(w / BOARD_W, h / BOARD_H) * 0.97;
  const tx = (w - BOARD_W * s) / 2;
  const ty = (h - BOARD_H * s) / 2;
  board.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
}
window.addEventListener('resize', () => { clearTimeout(fitBoard._t); fitBoard._t = setTimeout(fitBoard, 80); });
window.addEventListener('orientationchange', () => { setTimeout(fitBoard, 180); });

function renderBoard(q) {
  return new Promise(resolve => {
    const token = ++State.boardToken;
    const board = $('board');
    board.innerHTML = '';
    const windChar = w => WIND_CHARS[w] || '';

    const lblT = document.createElement('div');
    lblT.className = 'seat-label';
    lblT.id = 'seatLabelToimen';
    lblT.style.left = '560px';
    lblT.style.top = '335px';
    lblT.style.transform = 'translate(-50%, -50%) rotate(180deg)';
    lblT.innerHTML = `<span class="wind">${windChar(q.seatWinds.toimen)}</span>${t('board.toimen')}`;
    board.appendChild(lblT);

    const lblK = document.createElement('div');
    lblK.className = 'seat-label';
    lblK.id = 'seatLabelKamicha';
    lblK.style.left = '395px';
    lblK.style.top = '460px';
    lblK.style.transform = 'translate(-50%, -50%) rotate(90deg)';
    lblK.innerHTML = `<span class="wind">${windChar(q.seatWinds.kamicha)}</span>${t('board.kamicha')}`;
    board.appendChild(lblK);

    const lblS = document.createElement('div');
    lblS.className = 'seat-label';
    lblS.id = 'seatLabelShimocha';
    lblS.style.left = '725px';
    lblS.style.top = '460px';
    lblS.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
    lblS.innerHTML = `<span class="wind">${windChar(q.seatWinds.shimocha)}</span>${t('board.shimocha')}`;
    board.appendChild(lblS);

    const keys = ['toimen', 'kamicha', 'shimocha', 'player'];
    const pondEls = {};

    for (const key of keys) {
      const el = document.createElement('div');
      el.className = 'pond';
      const tiles = q.ponds[key];
      const perRow = Math.min(6, tiles.length);
      el.style.width = (perRow * 70 + Math.max(0, perRow - 1) * 2 + 1) + 'px';
      tiles.forEach((tl, i) => {
        const isRiichi = (key === q.declarer && i === tiles.length - 1);
        const te = tileEl(tl, isRiichi);
        if (isRiichi) te.classList.add('riichi-tile');
        el.appendChild(te);
      });
      board.appendChild(el);
      pondEls[key] = el;
    }

    const cp = document.createElement('div');
    cp.className = 'center-panel';
    cp.id = 'centerPanel';
    cp.innerHTML = `<div class="cp-round" id="centerPanelRound">${roundLabel(q.roundLabel)}</div>
                    <div class="cp-turn" id="centerPanelTurn">${t('board.turn')}</div>
                    <div class="cp-num">${q.turn}</div>`;
    board.appendChild(cp);

    const ps = document.createElement('div');
    ps.className = 'seat-label';
    ps.id = 'seatLabelYou';
    ps.style.left = '560px';
    ps.style.top = PLAYER_LABEL_Y + 'px';
    ps.style.transform = 'translate(-50%, -50%)';
    ps.style.fontSize = '23px';
    ps.innerHTML = `<span class="wind">${windChar(q.seatWinds.player)}</span>${t('board.you')}`;
    board.appendChild(ps);

    requestAnimationFrame(() => {
      if (token !== State.boardToken) return;
      for (const key of keys) {
        const el = pondEls[key];
        const a = ANCHORS[key];
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const posX = a.x - w / 2;
        const posY = key === 'player' ? PLAYER_POND_TOP : (a.y - h / 2);
        el.style.left = posX + 'px';
        el.style.top = posY + 'px';
        el.style.transform = `rotate(${POND_ROT[key]}deg)`;
        el.style.transformOrigin = 'center center';
      }

      const maxLen = Math.max(...keys.map(k => q.ponds[k].length));
      let step = 0;
      const tick = () => {
        if (token !== State.boardToken) return;
        if (step >= maxLen) {
          addRiichiStick(q, pondEls, board);
          setTimeout(() => {
            if (token !== State.boardToken) return;
            setTimeout(() => {
              if (token !== State.boardToken) return;
              resolve();
            }, 260);
          }, 340);
          return;
        }
        for (const key of keys) {
          const el = pondEls[key];
          const tile = el.children[step];
          if (!tile) continue;
          if (tile.classList.contains('riichi-tile')) {
            setTimeout(() => tile.classList.add('riichi-drop'), 240);
          } else {
            tile.classList.add('shown');
          }
        }
        step++;
        setTimeout(tick, 70);
      };
      setTimeout(tick, 130);
    });
  });
}

function addRiichiStick(q, pondEls, board) {
  const el = pondEls[q.declarer];
  const a = ANCHORS[q.declarer];
  const h = el.offsetHeight;
  const stick = document.createElement('div');
  stick.className = 'riichi-stick';
  if (q.declarer === 'toimen') {
    stick.style.left = (a.x - 65) + 'px';
    stick.style.top = (a.y + h / 2 + 18) + 'px';
    stick.style.width = '130px';
    stick.style.height = '18px';
  } else if (q.declarer === 'kamicha') {
    stick.style.left = (a.x + h / 2 + 18) + 'px';
    stick.style.top = (a.y - 65) + 'px';
    stick.style.width = '18px';
    stick.style.height = '130px';
  } else {
    stick.style.left = (a.x - h / 2 - 32) + 'px';
    stick.style.top = (a.y - 65) + 'px';
    stick.style.width = '18px';
    stick.style.height = '130px';
  }
  board.appendChild(stick);
}

/* =========================================================
   SCENARIO PANEL
   ========================================================= */
function renderScenario(q) {
  $('scRole').textContent = q.playerIsDealer ? t('settings.role.dealer') : t('settings.role.nondealer');

  const hanUnit = t('yaku.hanUnit');
  let yaku;
  if (!q.teyakuName) yaku = '—';
  else yaku = `${t('yaku.' + q.teyakuName, q.teyakuName)} (${q.teyakuHan} ${hanUnit})`;

  if (q.doraCount > 0) {
    const doraLabel = yaku === '—'
      ? `${t('yaku.Dora')} (${q.doraCount})`
      : `${t('yaku.Dora')} (${q.doraCount} ${hanUnit})`;
    if (yaku === '—') yaku = doraLabel;
    else yaku += ` + ${doraLabel}`;
  }
  $('scYaku').textContent = yaku;

  const handLabel = q.isOpen
    ? t('settings.hand.fuuro')
    : t('settings.hand.menzen');

  $('scShape').textContent = `${shapeLabel(q.shape)} · ${handLabel}`;
  $('scShape').className = 'svalue ' + (q.isOpen ? 'open-hand' : 'closed-hand');

  $('scDecl').textContent = t(SEAT_LABEL_KEYS[q.declarer] || 'seat.toimen');

  $('discardCat').textContent = catLabel(q.category);
  $('discardDesc').textContent = catDesc(q.category);
}

/* =========================================================
   QUIZ UI
   ========================================================= */
function buildQuiz(q) {
  const card = $('quizCard');
  card.innerHTML = '';
  State.step = 1;
  State.kbdIdx = 0;

  const s1 = document.createElement('div');
  s1.className = 'qstep';
  s1.id = 'step1';
  s1.innerHTML = `
    <div class="qhead"><span class="stepnum">1</span> ${t('quiz.step1')}</div>
    <div class="qtext">${t('quiz.step1.text')}</div>
    <div class="sujigrid" id="sujiGrid"></div>
    <div class="fb" id="fb1"></div>
  `;
  card.appendChild(s1);

  const grid = s1.querySelector('#sujiGrid');
  for (let v = 0; v <= 18; v++) {
    const b = document.createElement('button');
    b.className = 'sujibtn';
    b.type = 'button';
    b.dataset.val = v;
    b.textContent = v;
    b.onclick = () => answerStep1(q, v);
    grid.appendChild(b);
  }

  const s2 = document.createElement('div');
  s2.className = 'qstep locked';
  s2.id = 'step2';
  s2.innerHTML = `
    <div class="qhead"><span class="stepnum">2</span> ${t('quiz.step2')}</div>
    <div class="qtext">${t('quiz.step2.text').replace('{cat}', catLabel(q.category))}</div>
    <div class="optrow rate-grid" id="rateOpts"></div>
    <div class="fb" id="fb2"></div>
  `;
  card.appendChild(s2);

  const s3 = document.createElement('div');
  s3.className = 'qstep locked';
  s3.id = 'step3';
  s3.innerHTML = `
    <div class="qhead"><span class="stepnum">3</span> ${t('quiz.step3')}</div>
    <div class="qtext">${t('quiz.step3.text')}</div>
    <div class="optrow" id="decisionOpts">
      <button class="opt" data-dec="PUSH" type="button">${t('quiz.push')}</button>
      <button class="opt" data-dec="FOLD" type="button">${t('quiz.fold')}</button>
    </div>
    <div class="fb" id="fb3"></div>
  `;
  card.appendChild(s3);

  const nxt = document.createElement('div');
  nxt.className = 'qstep locked';
  nxt.id = 'nextWrap';
  nxt.innerHTML = `<button class="btn primary" id="nextBtn" style="width:100%">${t('quiz.next')}</button>`;
  card.appendChild(nxt);

  const rateOpts = $('rateOpts');
  RATE_BUCKETS.forEach(bucket => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.type = 'button';
    b.dataset.bucket = bucket.label;
    b.textContent = bucket.label;
    b.onclick = () => answerStep2(q, bucket.label, b);
    rateOpts.appendChild(b);
  });

  document.querySelectorAll('#decisionOpts .opt').forEach(b => {
    b.onclick = () => answerStep3(q, b.dataset.dec, b);
  });
  $('nextBtn').onclick = nextQuestion;
}

/* =========================================================
   ANSWER HANDLING
   ========================================================= */
function answerStep1(q, val) {
  if (q.answered.s1) return;
  q.answered.s1 = true;
  val = Math.max(0, Math.min(18, val | 0));

  const isTA = isTimeAttack();
  const doScoring = scoringEnabled();
  const diff = Math.abs(val - q.passedSuji);
  const isCorrect = diff === 0;

  State.stats.s1Total++;
  if (isCorrect) State.stats.s1Correct++;

  let basePts = 0, baseSecs = 0, fbClass = '', resultLabel = '';
  if (diff === 0)      { basePts = 300; baseSecs = 5; fbClass = 'ok';   resultLabel = t('fb.correct'); }
  else if (diff === 1) { basePts = 100; baseSecs = 2; fbClass = 'part'; resultLabel = t('fb.close');   }
  else                 { basePts = 0;   baseSecs = 0; fbClass = 'bad';  resultLabel = t('fb.bad');     }

  const mult = getComboMultiplier(State.combo);
  const actualPts = Math.round(basePts * mult);

  if (doScoring) { State.score += actualPts; updateScorePill(); }
  if (isTA && baseSecs > 0) { addTimeAttackTime(baseSecs); showSecDelta(baseSecs); }
  if (isTA) updateTimeAttackDisplay();

  const fb = $('fb1');
  fb.classList.add('show', fbClass);

  const parts = [];
  if (q.sujiResult.fromDeclarer > 0) parts.push(tf('fb.suji.declarer', { n: q.sujiResult.fromDeclarer }));
  if (q.sujiResult.fromOthersAdded > 0) parts.push(tf('fb.suji.postRiichi', { n: q.sujiResult.fromOthersAdded }));
  if (q.sujiResult.fromNoChance > 0) parts.push(tf('fb.suji.noChance', { n: q.sujiResult.fromNoChance }));
  const sujiBreakdown = parts.length > 1 ? ` <span style="opacity:.8">(${parts.join(' + ')})</span>` : '';

  let msg = `<b>${resultLabel}</b> `;
  if (diff === 0) msg += tf('fb.step1.ok', { n: q.passedSuji, breakdown: sujiBreakdown });
  else msg += tf('fb.step1.wrong', { v: val, n: q.passedSuji, breakdown: sujiBreakdown });

  if (isTA) msg += taSuffix(actualPts, mult, baseSecs);

  fb.innerHTML = msg;

  document.querySelectorAll('#sujiGrid .sujibtn').forEach(b => {
    b.disabled = true;
    b.classList.remove('kbd-focus');
    const v = parseInt(b.dataset.val, 10);
    if (v === q.passedSuji) b.classList.add('correct');
    else if (v === val) b.classList.add('wrong');
  });

  $('step2').classList.remove('locked');
  State.step = 2;
  State.kbdIdx = 0;
  paintKbd('#rateOpts');
  updateLogStep(q, 's1', actualPts, isCorrect);
}

function answerStep2(q, bucketLabel, btn) {
  if (q.answered.s2) return;
  q.answered.s2 = true;

  const isTA = isTimeAttack();
  const doScoring = scoringEnabled();
  const correctBucket = q.rateBucket;
  const ok = bucketLabel === correctBucket;

  State.stats.s2Total++;
  if (ok) State.stats.s2Correct++;

  const basePts = ok ? 300 : 0;
  const baseSecs = ok ? 5 : 0;
  const mult = getComboMultiplier(State.combo);
  const actualPts = Math.round(basePts * mult);

  if (doScoring) { State.score += actualPts; updateScorePill(); }
  if (isTA && baseSecs > 0) { addTimeAttackTime(baseSecs); showSecDelta(baseSecs); }
  if (isTA) updateTimeAttackDisplay();

  document.querySelectorAll('#rateOpts .opt').forEach(b => {
    b.disabled = true;
    if (b.dataset.bucket === correctBucket) b.classList.add('correct');
    else if (b === btn && !ok) b.classList.add('wrong');
  });

  const fb = $('fb2');
  fb.classList.add('show', ok ? 'ok' : 'bad');

  const exactRate = formatRate(q.rate);
  let msg = ok
    ? tf('fb.step2.ok', { b: correctBucket, exact: exactRate })
    : tf('fb.step2.bad', { b: correctBucket, exact: exactRate });
  if (isTA) msg += taSuffix(actualPts, mult, baseSecs);
  fb.innerHTML = msg;

  $('step3').classList.remove('locked');
  State.step = 3;
  State.kbdIdx = 0;
  paintKbd('#decisionOpts');
  updateLogStep(q, 's2', actualPts, ok);
}

function answerStep3(q, dec, btn) {
  if (q.answered.s3) return;
  q.answered.s3 = true;

  const isTA = isTimeAttack();
  const doScoring = scoringEnabled();
  const inRegular = isRegular();

  if (!isTA) {
    q.elapsed = (performance.now() - State.timerStart) / 1000;
    State.timerStopped = true;
    if (State.raf) cancelAnimationFrame(State.raf);
  }

  const threshStr = q.threshold >= 1 ? t('fb.step3.all') : pct(q.threshold);
  const qVerdict = getVerdictLevel(q.rate, q.threshold);
  const qBorderline = isBorderlineVerdict(qVerdict);
  const correctDec = q.decision;
  const ok = dec === correctDec;

  let basePts = 0, baseSecs = 0, comboAction = 'none', fbClass = '';

  if (qBorderline) {
    basePts = 200;
    comboAction = 'inc';
    fbClass = 'borderline';
    if ((qVerdict === 'borderlineFavorsPush' && dec === 'PUSH') ||
        (qVerdict === 'borderlineFavorsPull' && dec === 'FOLD')) baseSecs = 20;
    else baseSecs = 10;
  } else if (ok) {
    basePts = 400;
    baseSecs = 10;
    comboAction = 'inc';
    fbClass = 'ok';
  } else {
    basePts = 0;
    baseSecs = dec === 'PUSH' ? -15 : -10;
    comboAction = 'reset';
    fbClass = 'bad';
  }

  State.stats.s3Total++;
  if (comboAction === 'inc') State.stats.s3Correct++;

  if (comboAction === 'inc') {
    State.combo++;
    State.maxCombo = Math.max(State.maxCombo, State.combo);
  } else if (comboAction === 'reset') {
    State.combo = 0;
  }
  updateComboDisplay();

  const mult = getComboMultiplier(State.combo);
  const actualPts = Math.round(basePts * mult);

  if (doScoring) { State.score += actualPts; updateScorePill(); }
  if (isTA && baseSecs !== 0) {
    addTimeAttackTime(baseSecs);
    showSecDelta(baseSecs);
    updateTimeAttackDisplay();
  }

  if (qBorderline) {
    let pushClass = 'borderline-yellow', foldClass = 'borderline-yellow';
    if (qVerdict === 'borderlineFavorsPush') pushClass = 'borderline-green';
    else if (qVerdict === 'borderlineFavorsPull') foldClass = 'borderline-green';
    document.querySelectorAll('#decisionOpts .opt').forEach(b => {
      b.disabled = true;
      b.classList.add(b.dataset.dec === 'PUSH' ? pushClass : foldClass);
    });
  } else {
    document.querySelectorAll('#decisionOpts .opt').forEach(b => {
      b.disabled = true;
      if (b.dataset.dec === correctDec) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });
  }

  const exactRate = formatRate(q.rate);
  const fb = $('fb3');
  let msg = '';

  if (qBorderline) {
    const leanText = qVerdict === 'borderlineFavorsPush' ? t('fb.lean.push')
                   : qVerdict === 'borderlineFavorsPull' ? t('fb.lean.fold')
                   : t('fb.lean.both');
    msg = `<b>${t('fb.borderlineLabel')}</b> ${leanText}`;
    if (isTA) msg += taSuffix(actualPts, mult, baseSecs);
    msg += '<br><span style="opacity:.85">' +
      tf('fb.step3.borderlineDetail', {
        n: q.passedSuji, b: q.rateBucket, exact: exactRate,
        tier: q.tier, role: roleLabel(q.roleKey), t: threshStr
      }) + '</span>';
  } else {
    const answerLabel = correctDec === 'PUSH' ? t('quiz.push') : t('quiz.fold');
    msg = (ok ? t('fb.step3.ok') : t('fb.step3.bad')) + ' ' +
          tf('fb.step3.answerIs', { d: answerLabel });
    if (isTA) msg += taSuffix(actualPts, mult, baseSecs);
    msg += '<br><span style="opacity:.85">' +
      tf('fb.step3.detail', {
        n: q.passedSuji, b: q.rateBucket, exact: exactRate,
        tier: q.tier, role: roleLabel(q.roleKey), t: threshStr
      }) +
      '<br>' + (q.rate <= q.threshold ? t('fb.step3.comparePush') : t('fb.step3.compareFold')) +
      '</span>';
  }

  if (inRegular) {
    const bonus = Math.max(0, Math.round(200 - q.elapsed * 10));
    q.timeBonus = bonus;
    State.score += bonus;
    $('timerPill').textContent = formatTime(q.elapsed);
    updateScorePill();
  }

  fb.classList.add('show', fbClass);
  fb.innerHTML = msg;

  updateLogStep(q, 's3', actualPts, comboAction === 'inc', inRegular ? (q.timeBonus || 0) : 0);

  $('nextWrap').classList.remove('locked');
  State.step = 4;
  $('nextBtn').focus();
}

function updateLogStep(q, key, pts, correct, bonus) {
  if (!q._log) q._log = { steps: 0, correct: 0, pts: 0, timeBonus: 0 };
  q._log.steps++;
  if (correct) q._log.correct++;
  q._log.pts += pts;
  if (bonus) q._log.timeBonus += bonus;
}

function startTimer() {
  State.timerStart = performance.now();
  State.timerStopped = false;
  const pill = $('timerPill');
  const loop = () => {
    if (State.timerStopped) return;
    const s = (performance.now() - State.timerStart) / 1000;
    pill.textContent = formatTime(s);
    State.raf = requestAnimationFrame(loop);
  };
  loop();
}

/* =========================================================
   QUESTION FLOW
   ========================================================= */
async function loadQuestion() {
  try {
    const mySession = ++State.session;
    State.q = makeQuestion();
    const q = State.q;

    if (isTimeAttack()) {
      if (!TimeAttackState.active) return;
      pauseTimeAttack();
      TimeAttackState.questionsAnswered++;
    }

    if (State.thresholdAuto) State.thresholdIndex = getCorrectThresholdIndex(q);
    if (State.shapeTierAuto) State.shapeTierIndex = getCorrectShapeTierIndex(q);
    renderThresholdPanel();
    renderShapeTierPanel();

    $('modePill').textContent = t('mode.' + State.mode);

    if (isRegular() || isCustom()) {
      $('qCounter').textContent = `Q ${State.index + 1} / ${State.total}`;
    } else if (isTimeAttack()) {
      $('qCounter').textContent = `Q ${TimeAttackState.questionsAnswered}`;
    } else {
      $('qCounter').textContent = `Q ${State.index + 1}`;
    }

    const show = isRegular() || isTimeAttack();
    $('scorePill').style.display = show ? '' : 'none';
    $('comboPill').style.display = show ? '' : 'none';
    $('timerPill').style.display = show ? '' : 'none';

    if (isRegular()) $('timerPill').textContent = '0s';
    else if (isTimeAttack()) updateTimeAttackDisplay();

    renderScenario(q);
    await renderBoard(q);

    if (State.session !== mySession) return;
    if (isTimeAttack() && !TimeAttackState.active) return;

    buildQuiz(q);
    fitBoard();

    if (isRegular()) startTimer();
    if (isTimeAttack()) resumeTimeAttack();
  } finally {
    State.transitioning = false;
  }
}

function nextQuestion() {
  if (State.transitioning) return;
  State.transitioning = true;
  $('quizCard').innerHTML = '';

  if (isTimeAttack()) {
    if (!TimeAttackState.active) { State.transitioning = false; return; }
    State.index++; loadQuestion(); return;
  }
  if (isZen()) { State.index++; loadQuestion(); return; }

  if (isCustom()) {
    if (State.q && State.q._log) State.log.push(State.q._log);
    State.index++;
    if (State.index >= State.total) { State.transitioning = false; showCustomResults(); return; }
    loadQuestion(); return;
  }

  if (State.q && State.q._log) State.log.push(State.q._log);
  State.index++;
  if (State.index >= State.total) { State.transitioning = false; showRegularResults(); return; }
  loadQuestion();
}

function exitToMenu() {
  State.session++;
  State.boardToken++;
  State.timerStopped = true;
  State.transitioning = false;
  if (State.raf) cancelAnimationFrame(State.raf);
  if (TimeAttackState.active) {
    TimeAttackState.active = false;
    if (TimeAttackState.rafId) {
      cancelAnimationFrame(TimeAttackState.rafId);
      TimeAttackState.rafId = null;
    }
  }
  State.q = null;
  resetSecDelta();
  closeDealInModal();
  closeShapesModal();
  closeHelpModal();
  closeAboutModal();
  $('game').classList.remove('active');
  $('results').classList.remove('active');
  $('settings').classList.remove('active');
  $('home').classList.add('active');
  renderHomeHighScores();
}

function openCustomConfig() {
  syncConfigToUI(State.customConfig);
  $('home').classList.remove('active');
  $('game').classList.remove('active');
  $('results').classList.remove('active');
  $('settings').classList.add('active');
  window.scrollTo(0, 0);
}
function closeCustomConfig() {
  $('settings').classList.remove('active');
  $('home').classList.add('active');
}
function startCustomPractice() {
  saveCustomConfig();
  $('settings').classList.remove('active');
  beginGame();
}

/* =========================================================
   KEYBOARD NAV
   ========================================================= */
function paintKbd(sel, cls = 'opt') {
  document.querySelectorAll(sel + ' .' + cls).forEach((b, i) => {
    b.classList.toggle('kbd-focus', i === State.kbdIdx);
  });
}

document.addEventListener('keydown', e => {
  if ($('helpModal').classList.contains('active')) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeHelpModal(); }
    return;
  }
  if ($('aboutModal').classList.contains('active')) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeAboutModal(); }
    return;
  }
  if ($('dealInModal').classList.contains('active')) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeDealInModal(); }
    return;
  }
  if ($('shapesModal').classList.contains('active')) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeShapesModal(); }
    return;
  }
  if ($('settings').classList.contains('active')) {
    if (e.key === 'Escape') { e.preventDefault(); closeCustomConfig(); }
    else if (e.key === 'Enter') { e.preventDefault(); startCustomPractice(); }
    return;
  }
  if (e.key === 'Escape' &&
      ($('game').classList.contains('active') || $('results').classList.contains('active'))) {
    e.preventDefault(); exitToMenu(); return;
  }
  if ($('home').classList.contains('active')) {
    const cards = [...document.querySelectorAll('.mode-card')];
    let idx = cards.findIndex(c => c.classList.contains('selected'));
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      idx = (idx + 1) % cards.length;
      cards.forEach((c, i) => c.classList.toggle('selected', i === idx));
      State.mode = cards[idx].dataset.mode;
    } else if (e.key === 'Enter') { e.preventDefault(); startGame(); }
    return;
  }
  if ($('results').classList.contains('active')) {
    if (e.key === 'Enter') { e.preventDefault(); startGame(); }
    return;
  }
  if (!$('game').classList.contains('active')) return;
  const q = State.q;
  if (!q) return;

  if (State.step === 1) {
    const btns = [...document.querySelectorAll('#sujiGrid .sujibtn')];
    const cols = 7;
    if (e.key === 'ArrowRight') { e.preventDefault(); State.kbdIdx = Math.min(btns.length - 1, State.kbdIdx + 1); paintKbd('#sujiGrid', 'sujibtn'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); State.kbdIdx = Math.max(0, State.kbdIdx - 1); paintKbd('#sujiGrid', 'sujibtn'); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); State.kbdIdx = Math.min(btns.length - 1, State.kbdIdx + cols); paintKbd('#sujiGrid', 'sujibtn'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); State.kbdIdx = Math.max(0, State.kbdIdx - cols); paintKbd('#sujiGrid', 'sujibtn'); }
    else if (e.key === 'Enter') { e.preventDefault(); if (btns[State.kbdIdx]) btns[State.kbdIdx].click(); }
  } else if (State.step === 2) {
    const opts = [...document.querySelectorAll('#rateOpts .opt')];
    const cols = 2;
    if (e.key === 'ArrowRight') { e.preventDefault(); State.kbdIdx = Math.min(opts.length - 1, State.kbdIdx + 1); paintKbd('#rateOpts'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); State.kbdIdx = Math.max(0, State.kbdIdx - 1); paintKbd('#rateOpts'); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); State.kbdIdx = Math.min(opts.length - 1, State.kbdIdx + cols); paintKbd('#rateOpts'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); State.kbdIdx = Math.max(0, State.kbdIdx - cols); paintKbd('#rateOpts'); }
    else if (e.key === 'Enter') { e.preventDefault(); if (opts[State.kbdIdx]) opts[State.kbdIdx].click(); }
  } else if (State.step === 3) {
    const opts = [...document.querySelectorAll('#decisionOpts .opt')];
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); State.kbdIdx = (State.kbdIdx + 1) % opts.length; paintKbd('#decisionOpts'); }
    else if (e.key === 'Enter') { e.preventDefault(); if (opts[State.kbdIdx]) opts[State.kbdIdx].click(); }
  } else if (State.step === 4) {
    if (e.key === 'Enter') { e.preventDefault(); nextQuestion(); }
  }
});

/* =========================================================
   START / RESET
   ========================================================= */
function startGame() {
  if (isCustom()) { openCustomConfig(); return; }
  beginGame();
}

function beginGame() {
  State.session++;
  State.boardToken++;
  State.timerStopped = true;
  State.transitioning = false;
  State.stats = { s1Total: 0, s1Correct: 0, s2Total: 0, s2Correct: 0, s3Total: 0, s3Correct: 0 };
  if (State.raf) cancelAnimationFrame(State.raf);
  if (TimeAttackState.active) {
    TimeAttackState.active = false;
    if (TimeAttackState.rafId) {
      cancelAnimationFrame(TimeAttackState.rafId);
      TimeAttackState.rafId = null;
    }
  }
  resetSecDelta();

  State.thresholdAuto = false;
  State.shapeTierAuto = false;
  State.thresholdIndex = 0;
  State.shapeTierIndex = 0;

  State.index = 0;
  State.score = 0;
  State.combo = 0;
  State.maxCombo = 0;
  State.log = [];
  State.q = null;
  State.step = 0;

  updateScorePill();
  updateComboDisplay();
  $('timerPill').textContent = isTimeAttack() ? '45.0s' : '0s';

  if (isCustom()) State.total = State.customConfig.questionCount || 10;
  else State.total = MODE_CONFIG[State.mode].total;

  if (isTimeAttack()) startTimeAttack();

  $('home').classList.remove('active');
  $('settings').classList.remove('active');
  $('results').classList.remove('active');
  $('game').classList.add('active');
  window.scrollTo(0, 0);

  requestAnimationFrame(() => { fitBoard(); loadQuestion(); });
}

/* =========================================================
   CUSTOM CONFIG VALIDATION
   ========================================================= */
function validateCustomSection(checkboxSelector, noteId, defaultMsgKey) {
  const boxes = [...document.querySelectorAll(checkboxSelector)];
  const checked = boxes.filter(c => c.checked);
  const note = $(noteId);
  if (!note) return;
  if (!checked.length) {
    boxes[0].checked = true;
    note.classList.add('bad');
    note.textContent = t('settings.note.required');
    clearTimeout(validateCustomSection._t);
    validateCustomSection._t = setTimeout(() => {
      note.classList.remove('bad');
      note.textContent = t(defaultMsgKey);
    }, 1600);
    return;
  }
  note.classList.remove('bad');
  note.textContent = checked.length === boxes.length
    ? t('settings.note.all')
    : tf('settings.note.some', { n: checked.length, m: boxes.length });
}

/* =========================================================
   EVENT WIRING
   ========================================================= */
const NOTE_KEY_MAP = {
  '#catSettings': ['settingsNote', 'settings.note.cat'],
  '#turnSettings': ['turnsNote', 'settings.note.turn'],
  '#shapeSettings': ['shapesNote', 'settings.note.shape'],
  '#handSettings': ['handsNote', 'settings.note.hand'],
  '#declarerSettings': ['declarersNote', 'settings.note.declarer'],
  '#playerRoleSettings': ['playerRolesNote', 'settings.note.playerrole'],
  '#oppRoleSettings': ['oppRolesNote', 'settings.note.opprole']
};

Object.keys(NOTE_KEY_MAP).forEach(sel => {
  document.querySelectorAll(sel + ' input[type=checkbox]').forEach(chk => {
    chk.addEventListener('change', () => {
      const [noteId, msgKey] = NOTE_KEY_MAP[sel];
      validateCustomSection(sel + ' input[type=checkbox]', noteId, msgKey);
    });
  });
});

const qcountBoxes = [...document.querySelectorAll('#questionCountSettings input[type=checkbox]')];
qcountBoxes.forEach(chk => {
  chk.addEventListener('change', () => {
    if (!chk.checked) { chk.checked = true; return; }
    qcountBoxes.forEach(c => { if (c !== chk) c.checked = false; });
  });
});

$('customBack').addEventListener('click', closeCustomConfig);
$('customStart').addEventListener('click', startCustomPractice);

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    State.mode = card.dataset.mode;
  });
});

$('threshPrev').addEventListener('click', () => {
  State.thresholdAuto = false;
  State.thresholdIndex = (State.thresholdIndex - 1 + 7) % 7;
  renderThresholdPanel();
});
$('threshNext').addEventListener('click', () => {
  State.thresholdAuto = false;
  State.thresholdIndex = (State.thresholdIndex + 1) % 7;
  renderThresholdPanel();
});
$('shapeTierPrev').addEventListener('click', () => {
  State.shapeTierAuto = false;
  State.shapeTierIndex = (State.shapeTierIndex - 1 + 7) % 7;
  renderShapeTierPanel();
});
$('shapeTierNext').addEventListener('click', () => {
  State.shapeTierAuto = false;
  State.shapeTierIndex = (State.shapeTierIndex + 1) % 7;
  renderShapeTierPanel();
});

$('threshIndicator').addEventListener('click', () => {
  if (State.thresholdIndex === 0) {
    State.thresholdAuto = true;
    const q = State.q;
    State.thresholdIndex = q ? getCorrectThresholdIndex(q) : 1;
    renderThresholdPanel();
  } else {
    State.thresholdAuto = false;
    State.thresholdIndex = 0;
    renderThresholdPanel();
  }
});
$('shapeTierIndicator').addEventListener('click', () => {
  if (State.shapeTierIndex === 0) {
    State.shapeTierAuto = true;
    const q = State.q;
    State.shapeTierIndex = q ? getCorrectShapeTierIndex(q) : 1;
    renderShapeTierPanel();
  } else {
    State.shapeTierAuto = false;
    State.shapeTierIndex = 0;
    renderShapeTierPanel();
  }
});

$('helpBtn').addEventListener('click', openHelpModal);
$('closeHelp').addEventListener('click', closeHelpModal);
$('helpModal').addEventListener('click', e => { if (e.target.id === 'helpModal') closeHelpModal(); });

$('aboutBtn').addEventListener('click', openAboutModal);
$('closeAbout').addEventListener('click', closeAboutModal);
$('aboutModal').addEventListener('click', e => { if (e.target.id === 'aboutModal') closeAboutModal(); });

$('dealInBtn').addEventListener('click', openDealInModal);
$('closeDealIn').addEventListener('click', closeDealInModal);
$('dealInModal').addEventListener('click', e => { if (e.target.id === 'dealInModal') closeDealInModal(); });

$('shapesBtn').addEventListener('click', openShapesModal);
$('closeShapes').addEventListener('click', closeShapesModal);
$('shapesModal').addEventListener('click', e => { if (e.target.id === 'shapesModal') closeShapesModal(); });

$('startBtn').onclick = startGame;
$('playAgain').onclick = startGame;
$('backToMenu').onclick = exitToMenu;
$('exitBtn').onclick = exitToMenu;

$('langBtn').addEventListener('click', () => {
  applyLanguage(State.lang === 'ja' ? 'en' : 'ja');
});

buildDirectNav('shapeTierDirectNav', SHAPE_TIER_BTN_CONFIG, s => {
  State.shapeTierAuto = false;
  State.shapeTierIndex = s;
  renderShapeTierPanel();
});
buildDirectNav('thresholdDirectNav', THRESHOLD_BTN_CONFIG, s => {
  State.thresholdAuto = false;
  State.thresholdIndex = s;
  renderThresholdPanel();
});

/* =========================================================
   INIT
   ========================================================= */
(function initLang() {
  let saved = 'en';
  try { saved = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  if (!I18N[saved]) saved = 'en';
  State.lang = saved;
})();

syncConfigToUI(State.customConfig);
applyLanguage(State.lang);

window.addEventListener('load', fitBoard);
