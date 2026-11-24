import type { SpriteId } from './emberleafAssets';

export type PerfumeCategory = 'أو دو بارفان' | 'إكستريت دو بارفان' | 'المجموعات والصلب';
export type OlfactoryFamily =
  | 'الشاي والتوابل'
  | 'العنبر والراتنج'
  | 'الزهور والورد'
  | 'الحمضيات والقشور';

export interface PerfumeSizeOption {
  label: string;
  volume: string;
  priceUsd: number;
}

export interface PerfumeReview {
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
}

export interface PerfumeProduct {
  id: string;
  editionNumber: string;
  name: string;
  subtitle: string;
  category: PerfumeCategory;
  family: OlfactoryFamily;
  storySlot?: 'left' | 'middle' | 'right';
  vesselSprite: 'tin_l' | 'tin_m' | 'tin_r';
  lidSprite: 'lid_l' | 'lid_m' | 'lid_r';
  plinthSprite: 'p_l' | 'p_m' | 'p_r';
  accentSprites: SpriteId[];
  backdropHex: string;
  concentration: string;
  longevity: string;
  sillage: string;
  rating: number;
  reviewCount: number;
  tag?: string;
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  sizes: PerfumeSizeOption[];
  reviews: PerfumeReview[];
}

export const PERFUMES: PerfumeProduct[] = [
  {
    id: 'terracotta-ember',
    editionNumber: 'إصدار ٠١',
    name: 'جمر الطين',
    subtitle: 'الشاي الأسود المدخّن، القرفة المحمّصة والعنبر العُماني',
    category: 'أو دو بارفان',
    family: 'الشاي والتوابل',
    storySlot: 'middle',
    vesselSprite: 'tin_m',
    lidSprite: 'lid_m',
    plinthSprite: 'p_m',
    accentSprites: ['i_tea', 'i_amber', 'drop'],
    backdropHex: '#f4d2bb',
    concentration: '22% أو دو بارفان',
    longevity: '10 – 12 ساعة',
    sillage: 'فوحان دافئ وغني',
    rating: 4.9,
    reviewCount: 142,
    tag: 'توقيع الدار',
    description:
      'وُلد هذا العطر من قلب موسم الحصاد الخريفي. تُنقع أوراق الشاي الأسود المدخّن ولحاء القرفة الفيتنامية ببطء مع دموع العنبر العُماني الذهبية، لتمنحك دفئاً جافاً ومشرقاً يشبه شمس أكتوبر فوق جدران الطين الدافئ.',
    notes: {
      top: ['قشر البرتقال المرّ', 'حبات الهيل الأخضر المطحون'],
      heart: ['الشاي الأسود المدخّن', 'لحاء القرفة المحمّص'],
      base: ['راتنج العنبر العُماني', 'خشب الأرز الدافئ', 'اللابدانوم الجاف'],
    },
    sizes: [
      { label: 'قارورة السفر', volume: '30 مل', priceUsd: 120 },
      { label: 'القارورة الكلاسيكية', volume: '50 مل', priceUsd: 185 },
      { label: 'قارورة الأتيليه', volume: '100 مل', priceUsd: 265 },
    ],
    reviews: [
      {
        author: 'نادية المنصور',
        city: 'دبي',
        rating: 5,
        date: 'أكتوبر 2026',
        comment:
          'افتتاحية الشاي المدخّن تذوب في قاعدة عنبرية ساحرة. أصبح عطري المفضل للأمسيات الباردة وثباته مذهل.',
      },
      {
        author: 'كريم الشاذلي',
        city: 'القاهرة',
        rating: 5,
        date: 'سبتمبر 2026',
        comment:
          'عطر متوازن للغاية، ليس حالياً بشكل مزعج بل توابل جافة راقية مع لمسة بخار شاي وخشب دافئ.',
      },
    ],
  },
  {
    id: 'ivory-cardamom',
    editionNumber: 'إصدار ٠٢',
    name: 'هيل العاج',
    subtitle: 'الهيل الأخضر الطازج، الشاي الأبيض ومسك الحجر الدافئ',
    category: 'أو دو بارفان',
    family: 'الشاي والتوابل',
    storySlot: 'left',
    vesselSprite: 'tin_l',
    lidSprite: 'lid_l',
    plinthSprite: 'p_l',
    accentSprites: ['i_card', 'i_tea'],
    backdropHex: '#f7e5d7',
    concentration: '20% أو دو بارفان',
    longevity: '8 – 10 ساعات',
    sillage: 'هالة نقية ومشرقة',
    rating: 4.8,
    reviewCount: 98,
    tag: 'الأكثر مبيعاً',
    description:
      'نسمة صباح خريفي نقي فوق فناجين الخزف العاجي. تلتقي بذور الهيل الأخضر المقطوفة حديثاً من تلال كيرالا مع براعم الشاي الأبيض ونعومة جذور السوسن ومسك الحجر الطبيعي.',
    notes: {
      top: ['حبات الهيل الأخضر', 'برغموت إيطالي'],
      heart: ['شاي الإبر الفضية الأبيض', 'زبدة السوسن', 'فلفل أبيض ناعم'],
      base: ['مسك الحجر المعدني', 'خشب الصندل الكريمي', 'بذور الأمبريت'],
    },
    sizes: [
      { label: 'قارورة السفر', volume: '30 مل', priceUsd: 115 },
      { label: 'القارورة الكلاسيكية', volume: '50 مل', priceUsd: 175 },
      { label: 'قارورة الأتيليه', volume: '100 مل', priceUsd: 250 },
    ],
    reviews: [
      {
        author: 'سلطان القحطاني',
        city: 'الرياض',
        rating: 5,
        date: 'أكتوبر 2026',
        comment:
          'عطر نظيف ومُبهر بأناقة. الهيل يبقى منتعشاً وغير ثقيل مما يجعله مثالياً للاستخدام اليومي والمكاتب.',
      },
    ],
  },
  {
    id: 'apricot-damask',
    editionNumber: 'إصدار ٠٣',
    name: 'ورد المشمش الدمشقي',
    subtitle: 'براعم الورد المجفف، قشر إشبيلية والمشمش المخملي',
    category: 'أو دو بارفان',
    family: 'الزهور والورد',
    storySlot: 'right',
    vesselSprite: 'tin_r',
    lidSprite: 'lid_r',
    plinthSprite: 'p_r',
    accentSprites: ['i_rose', 'i_peel'],
    backdropHex: '#f5d8c4',
    concentration: '21% أو دو بارفان',
    longevity: '9 – 11 ساعة',
    sillage: 'أثر زهري مخملي',
    rating: 4.9,
    reviewCount: 116,
    tag: 'إصدار الخريف',
    description:
      'ليس ورداً ربيعياً ندياً، بل براعم ورد دمشقي مجفّفة في الظل. تُنقع مع شرائح قشر البرتقال المرّ ومخمل فاكهة المشمش الذهبية، لتستقر على قاعدة من أخشاب الأرز المحمّصة.',
    notes: {
      top: ['قشر برتقال إشبيلية المرّ', 'مخمل قشرة المشمش'],
      heart: ['براعم الورد الدمشقي المجفف', 'أزهار القطيفة الخريفية', 'نقيع الشاي الأسود'],
      base: ['خشب الأرز الأطلسي', 'عنبر ذهبي ناعم', 'خشب الكشمير'],
    },
    sizes: [
      { label: 'قارورة السفر', volume: '30 مل', priceUsd: 125 },
      { label: 'القارورة الكلاسيكية', volume: '50 مل', priceUsd: 190 },
      { label: 'قارورة الأتيليه', volume: '100 مل', priceUsd: 275 },
    ],
    reviews: [
      {
        author: 'ليلى الحداد',
        city: 'عمّان',
        rating: 5,
        date: 'نوفمبر 2026',
        comment:
          'عطر ورد مجفّف له روح حقيقية. قشر البرتقال يمنحه إشراقة ذهبية دافئة تذكّرك بأوراق الخريف.',
      },
    ],
  },
  {
    id: 'solstice-resin-extrait',
    editionNumber: 'إصدار ٠٤',
    name: 'راتنج الاعتدال',
    subtitle: '32% إكستريت دو بارفان · قطرة العنبر النقية والقرفة المحروقة',
    category: 'إكستريت دو بارفان',
    family: 'العنبر والراتنج',
    vesselSprite: 'tin_m',
    lidSprite: 'lid_m',
    plinthSprite: 'p_m',
    accentSprites: ['drop', 'i_amber', 'i_cassia'],
    backdropHex: '#efc5a9',
    concentration: '32% إكستريت دو بارفان',
    longevity: '14+ ساعة',
    sillage: 'ثبات وفوحان فائق العمق',
    rating: 5.0,
    reviewCount: 64,
    tag: 'دفعة محدودة',
    description:
      'مقطّر قطرةً بعد قطرة في أوانٍ خزفية معتّقة. يجمع أعلى تركيز لدينا من راتنج العنبر العُماني ودموع اللابدانوم ولحاء القرفة المحمّصة المعتّقة لستة أشهر كاملة.',
    notes: {
      top: ['لحاء القرفة المحروق', 'زيت الهيل المركّز'],
      heart: ['قطرة العنبر المذاب', 'خلاصة شاي الأولونغ المدخّن'],
      base: ['جاوي سيام العطري', 'راتنج اللابدانوم المعتّق', 'دموع المرّ'],
    },
    sizes: [
      { label: 'إكستريت للسفر', volume: '30 مل', priceUsd: 195 },
      { label: 'قارورة الإكستريت', volume: '50 مل', priceUsd: 295 },
      { label: 'قارورة المقتنين', volume: '100 مل', priceUsd: 410 },
    ],
    reviews: [
      {
        author: 'طارق السيد',
        city: 'الرياض',
        rating: 5,
        date: 'نوفمبر 2026',
        comment:
          'عمق ونعومة لا تُصدق. رشة واحدة تكفي لتملأ الأمسية بدفء راتنجي فاخر دون أن تكون حادة أبداً.',
      },
    ],
  },
  {
    id: 'autumn-hills-reserve',
    editionNumber: 'إصدار ٠٥',
    name: 'تلال الخريف المعتّقة',
    subtitle: 'شاي الأولونغ المجفف بالشمس، قشر اليوسفي ونجيل الهند الجاف',
    category: 'أو دو بارفان',
    family: 'الحمضيات والقشور',
    vesselSprite: 'tin_l',
    lidSprite: 'lid_l',
    plinthSprite: 'p_l',
    accentSprites: ['i_peel', 'i_tea'],
    backdropHex: '#f6e1d0',
    concentration: '18% أو دو بارفان',
    longevity: '8 – 9 ساعات',
    sillage: 'نسيم خريفي منعش',
    rating: 4.8,
    reviewCount: 73,
    description:
      'مستوحى من تلال الشاي المتموجة بألوان الصدأ والعنبر والزيتون عند الغسق. لفائف منعشة من قشر البرتقال واليوسفي المرّ تخترق أوراق الشاي المحمّص ونجيل الهند الجاف.',
    notes: {
      top: ['لفائف قشر البرتقال المرّ', 'بشر اليوسفي', 'أوراق البيتيغرين'],
      heart: ['أوراق الأولونغ المجففة بالشمس', 'بتلات القطيفة'],
      base: ['نجيل الهند الجاوي', 'طحلب البلوط', 'خشب طافٍ جاف'],
    },
    sizes: [
      { label: 'قارورة السفر', volume: '30 مل', priceUsd: 138 },
      { label: 'القارورة الكلاسيكية', volume: '50 مل', priceUsd: 210 },
      { label: 'قارورة الأتيليه', volume: '100 مل', priceUsd: 295 },
    ],
    reviews: [
      {
        author: 'أحمد العتيبي',
        city: 'الكويت',
        rating: 5,
        date: 'أكتوبر 2026',
        comment:
          'يعكس نسمة الجبال الباردة بعد موسم الحصاد. حمضيات راقية جداً مع خلفية شاي هادئة ومريحة.',
      },
    ],
  },
  {
    id: 'rose-cassia-elixir',
    editionNumber: 'إصدار ٠٦',
    name: 'إكسير الورد والقرفة',
    subtitle: '28% إكستريت دو بارفان · الورد المتبّل وعسل العنبر',
    category: 'إكستريت دو بارفان',
    family: 'الزهور والورد',
    vesselSprite: 'tin_r',
    lidSprite: 'lid_r',
    plinthSprite: 'p_r',
    accentSprites: ['i_rose', 'i_cassia', 'i_amber'],
    backdropHex: '#f2ccb4',
    concentration: '28% إكستريت دو بارفان',
    longevity: '12+ ساعة',
    sillage: 'أثر مسائي فخم ومُتبّل',
    rating: 4.9,
    reviewCount: 51,
    tag: 'حصري للأتيليه',
    description:
      'حوار ليلي آسر بين براعم الورد الياقوتية المجففة وأعواد القرفة الدافئة. يُنقع بتأنٍ لمدة تسعين يوماً حتى ينصهر الزهر والتوابل في حرير عطري لا يُنسى.',
    notes: {
      top: ['قرفة كوانغ نام', 'حبات الفلفل الوردي'],
      heart: ['خلاصة الورد الدمشقي', 'نقيع براعم الورد المجفف'],
      base: ['راتنج العنبر', 'قرون الفانيليا المدخّنة', 'خشب الغاياك'],
    },
    sizes: [
      { label: 'إكستريت للسفر', volume: '30 مل', priceUsd: 180 },
      { label: 'قارورة الإكستريت', volume: '50 مل', priceUsd: 270 },
      { label: 'قارورة المقتنين', volume: '100 مل', priceUsd: 380 },
    ],
    reviews: [
      {
        author: 'ريم الزهراني',
        city: 'جدة',
        rating: 5,
        date: 'نوفمبر 2026',
        comment:
          'دافئ ومخملي وساحر للغاية. القرفة تلتف حول الورد المجفف بنعومة الكشمير في ليالي الشتاء.',
      },
    ],
  },
  {
    id: 'autumn-trio-coffret',
    editionNumber: 'إصدار ٠٧',
    name: 'صندوق ثلاثية الخريف',
    subtitle: 'جمر الطين · هيل العاج · ورد المشمش الدمشقي',
    category: 'المجموعات والصلب',
    family: 'العنبر والراتنج',
    vesselSprite: 'tin_m',
    lidSprite: 'lid_m',
    plinthSprite: 'p_m',
    accentSprites: ['i_rose', 'i_tea', 'i_card'],
    backdropHex: '#f8e6d8',
    concentration: 'مجموعة أو دو بارفان متكاملة',
    longevity: '8 – 12 ساعة',
    sillage: 'خزانة عطور موسمية متكاملة',
    rating: 5.0,
    reviewCount: 89,
    tag: 'مجموعة هدايا',
    description:
      'اقتنِ التشكيلة الثلاثية الأيقونية الكاملة مقدّمة داخل صندوق كتان فاخر. تتضمن عطور جمر الطين، هيل العاج، وورد المشمش الدمشقي — مثالية للتطبق العطري أو الإهداء الفاخر.',
    notes: {
      top: ['الهيل الأخضر', 'قشر البرتقال المرّ', 'قشرة المشمش'],
      heart: ['الشاي الأسود', 'الورد الدمشقي', 'لحاء القرفة'],
      base: ['العنبر العُماني', 'مسك الحجر', 'خشب الأرز'],
    },
    sizes: [
      { label: 'مجموعة الاستكشاف', volume: '3 × 15 مل', priceUsd: 145 },
      { label: 'المجموعة الكاملة', volume: '3 × 50 مل', priceUsd: 490 },
    ],
    reviews: [
      {
        author: 'سامي خوري',
        city: 'بيروت',
        rating: 5,
        date: 'أكتوبر 2026',
        comment:
          'مزج هيل العاج فوق جمر الطين يعطي نتيجة خيالية. التغليف والصندوق يليقان بالهدايا الفخمة.',
      },
    ],
  },
  {
    id: 'botanical-solid-vessel',
    editionNumber: 'إصدار ٠٨',
    name: 'عطر إمبرليف الخزفي الصلب',
    subtitle: 'علبة خزف مصقولة قابلة لإعادة التعبئة · شمع العسل والعنبر',
    category: 'المجموعات والصلب',
    family: 'العنبر والراتنج',
    vesselSprite: 'tin_l',
    lidSprite: 'lid_l',
    plinthSprite: 'p_m',
    accentSprites: ['i_amber', 'i_peel'],
    backdropHex: '#f3d7c3',
    concentration: 'بلسم عطري خالٍ من الكحول',
    longevity: '6 – 8 ساعات',
    sillage: 'دفء حميمي قريب من البشرة',
    rating: 4.8,
    reviewCount: 47,
    description:
      'مصبوب يدوياً داخل علبة خزفية مصقولة بحجم الجيب ومكلّلة بغطاء كروي متناغم. يجمع شمع العسل العضوي وزيت الجوجوبا وخلاصة الشاي والعنبر ليذوب بنعومة على نقاط النبض.',
    notes: {
      top: ['قشر البرتقال الحلو', 'هيل أخضر'],
      heart: ['خلاصة الشاي الأسود الصلبة', 'أوراق القرفة'],
      base: ['شمع العسل الذهبي', 'راتنج العنبر', 'حبوب التونكا'],
    },
    sizes: [
      { label: 'العلبة الخزفية', volume: '15 غرام', priceUsd: 135 },
      { label: 'العلبة + عبوتان للتعبئة', volume: '3 × 15 غرام', priceUsd: 210 },
    ],
    reviews: [
      {
        author: 'هند العلي',
        city: 'الدوحة',
        rating: 5,
        date: 'نوفمبر 2026',
        comment:
          'يرافقني دائماً في السفر والحقيبة. ملمس العلبة الخزفية ووزنها الفاخر يعكسان جودة الدار.',
      },
    ],
  },
];

export interface HarvestEntry {
  id: string;
  sprite: SpriteId;
  name: string;
  origin: string;
  season: string;
  extraction: string;
  aromaNote: string;
  story: string;
  featuredPerfumeId: string;
}

export const HARVESTS: HarvestEntry[] = [
  {
    id: 'rose',
    sprite: 'i_rose',
    name: 'براعم الورد المجفّفة',
    origin: 'مرتفعات إسبرطة، تركيا',
    season: 'حصاد متأخر · تجفيف هوائي في أكتوبر',
    extraction: 'نقع بطيء في الكحول النباتي',
    aromaNote: 'بتلات ورقية · تين مجفف · دفء عسلي',
    story:
      'بدلاً من تقطير الندى الربيعي، نجفف براعم الورد الدمشقي كاملةً في الظل على صواني القصب حتى يتركّز عبيرها في قلب زهري دافئ بمسحة عنبرية.',
    featuredPerfumeId: 'apricot-damask',
  },
  {
    id: 'tea',
    sprite: 'i_tea',
    name: 'شاي وويي الأسود',
    origin: 'مدرجات فوجيان، الصين',
    season: 'قطفة الخريف · تحميص نوفمبر',
    extraction: 'استخلاص فوق حرج بثاني أكسيد الكربون',
    aromaNote: 'ورق محمّص · دخان ناعم · حجر معدني',
    story:
      'تُقطف الأوراق من المدرجات الجبلية التي تتوهج بألوان الصدأ والعنبر، وتُحمّص ببطء على الجمر قبل استخلاص أناقتها الجافة النقية.',
    featuredPerfumeId: 'terracotta-ember',
  },
  {
    id: 'peel',
    sprite: 'i_peel',
    name: 'قشر البرتقال المرّ',
    origin: 'بساتين إشبيلية، إسبانيا',
    season: 'الصقيع الأول · تقشير يدوي',
    extraction: 'عصر بارد وتجفيف شمسي',
    aromaNote: 'حمضيات ذهبية · مرارة ناعمة · إشراقة شمسية',
    story:
      'تُجفف شرائط القشر اللولبية برفق داخل أفران طينية دافئة لتليين الحموضة الحادة وتحويلها إلى نوتة مشرقة ترفع قواعدنا الراتنجية.',
    featuredPerfumeId: 'autumn-hills-reserve',
  },
  {
    id: 'cassia',
    sprite: 'i_cassia',
    name: 'قرفة كوانغ نام',
    origin: 'المرتفعات الوسطى، فيتنام',
    season: 'حصاد اللحاء الخريفي',
    extraction: 'تقطير بالبخار في مقطّرات نحاسية',
    aromaNote: 'لحاء جاف · توابل محمّصة · دفء رزين',
    story:
      'أعواد لحاء داخلية غنية بالزيوت العطرية تمنح عطورنا عموداً فقرياً من التوابل الراقية دون أي حلاوة مبالغ فيها.',
    featuredPerfumeId: 'rose-cassia-elixir',
  },
  {
    id: 'amber',
    sprite: 'i_amber',
    name: 'راتنجات العنبر الذهبي',
    origin: 'ساحل ظفار، سلطنة عُمان',
    season: 'جمع الراتنج في موسم الجفاف',
    extraction: 'تعتيق في جرار فخارية',
    aromaNote: 'ذهب مذاب · بلسم دافئ · وهج بخوري',
    story:
      'تُعتّق دموع العنبر الشفافة داخل جرار الطين حتى تذوب في صبغة عسلية متوهجة — وهي القطرة الذهبية الأخيرة التي تختم كل خلطة من إمبرليف.',
    featuredPerfumeId: 'solstice-resin-extrait',
  },
  {
    id: 'cardamom',
    sprite: 'i_card',
    name: 'حبات الهيل الأخضر',
    origin: 'تلال إيدوكي، كيرالا',
    season: 'بداية حصاد الخريف',
    extraction: 'عصر بارد لبذور الهيل',
    aromaNote: 'انتعاش كافوري · بهار أخضر · ضباب شاي',
    story:
      'تُقطف القرون وهي ما تزال خضراء زمردية وتُفتح قبل ساعات فقط من التقطير للحفاظ على افتتاحيتها المشرقة والباردة.',
    featuredPerfumeId: 'ivory-cardamom',
  },
];

export interface BoutiqueStore {
  id: string;
  city: string;
  district: string;
  address: string;
  hours: string;
  phone: string;
  services: string[];
  architecturalNote: string;
}

export const BOUTIQUES: BoutiqueStore[] = [
  {
    id: 'dubai',
    city: 'دبي',
    district: 'صالون مركز دبي المالي (DIFC)',
    address: 'قرية البوابة 04، الطابق الأرضي، مركز دبي المالي العالمي، الإمارات',
    hours: 'يومياً · 10:00 صباحاً – 10:00 مساءً',
    phone: '+971 4 555 0183',
    services: ['تطبيق العنبر والراتنج', 'نقش القوارير الخزفية', 'إعادة التعبئة'],
    architecturalNote: 'أقواس جصية بلون المشمش المضاء بالشمس تحتضن مكتبة العنبر الخاصة بنا.',
  },
  {
    id: 'riyadh',
    city: 'الرياض',
    district: 'أتيليه حي السفارات',
    address: 'طريق الكندي، ساحة الفنون، حي السفارات، الرياض، السعودية',
    hours: 'السبت – الخميس · 11:00 صباحاً – 10:00 مساءً',
    phone: '+966 11 555 0149',
    services: ['استشارة عطرية خاصة', 'تذوق الشاي الخريفي', 'تغليف الشمع الفاخر'],
    architecturalNote: 'منصات حجر الترافرتين المنحوت وسط ضوء طبيعي هادئ وجدران طينية دافئة.',
  },
  {
    id: 'paris',
    city: 'باريس',
    district: 'دار لو ماريه الرئيسية',
    address: '28 شارع فرانك بورجوا، الدائرة الثالثة، 75003 باريس، فرنسا',
    hours: 'الإثنين – الأحد · 10:30 – 19:30',
    phone: '+33 1 42 78 04 19',
    services: ['جلسات التطبق العطري', 'معرض أقماع التقطير', 'خدمة الإهداء'],
    architecturalNote: 'جدران طينية مصقولة بالجير تعرض أقماع التقطير الزجاجية على طول الصالة.',
  },
  {
    id: 'kyoto',
    city: 'كيوتو',
    district: 'أتيليه هيغاشياما',
    address: '412 شيموكاوارا، هيغاشياما، كيوتو 605-0825، اليابان',
    hours: 'الثلاثاء – الأحد · 11:00 – 19:00',
    phone: '+81 75-555-0192',
    services: ['اقتران الشاي والعطور', 'نقش يدوي', 'ركن التعبئة المستدامة'],
    architecturalNote: 'منضدة حجرية دافئة داخل منزل تقليدي مرمّم من خشب الأرز الياباني.',
  },
];

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
