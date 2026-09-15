/**
 * Güneş Sistemi Simülasyonu — Kapsamlı gökcismi veri tabanı
 * Gerçek astronomik veriler + simülasyon parametreleri.
 * /api/planets endpoint'i üzerinden frontend'e sunulur.
 */

export type BodyType =
  | "Yıldız"
  | "Karasal Gezegen"
  | "Gaz Devi"
  | "Buz Devi"
  | "Cüce Gezegen"
  | "Uydu"
  | "Asteroit"
  | "Kuyruklu Yıldız";

export interface BodySim {
  isSun?: boolean;
  /** Uydular için ebeveyn gezegen id'si */
  parentId?: string;
  /** Yörünge yarı-büyük ekseni (dünya birimi) */
  a: number;
  /** Dış merkezlik */
  e: number;
  /** Yörünge eğimi (derece) */
  inclDeg: number;
  /** Periapsis yönü (derece) */
  periDeg: number;
  /** Yörünge dönemi (gün). Negatif = retrograd */
  periodDays: number;
  /** Başlangıç ortalama anomalisi */
  meanAnomaly0: number;
  /** Görsel yarıçap (dünya birimi) */
  radius: number;
  /** Uydular için gezegene yörünge uzaklığı */
  moonOrbit?: number;
  moonInclDeg?: number;
  ring?: { inner: number; outer: number; tiltDeg: number; nodeDeg: number; color: string };
  bands?: boolean;
  /** 0: her zaman göster, 1: kırpılabilir, 2: yalnızca yakın zoom */
  labelTier: 0 | 1 | 2;
}

export interface BodyData {
  id: string;
  name: string;
  type: BodyType;
  color: string;
  /** Uydular için ebeveyn adı */
  parentName?: string;
  stats: {
    diameter: string;
    mass: string;
    gravity: string;
    dayLength: string;
    axialTilt: string;
    temp: string;
  };
  orbitInfo: {
    distance: string;
    period: string;
    velocity: string;
    eccentricity: string;
    inclination: string;
    moons: string;
  };
  /** Yüzey özellikleri — gezegen/uydu/asteroit yüzey betimi */
  surface?: string;
  /** Asteroit spektroskopi sınıfı (C, S, M, B, V…) */
  asteroidType?: string;
  atmosphere: string;
  composition: string;
  discovery: string;
  description: string;
  facts: string[];
  sim: BodySim;
}

export const BODIES: BodyData[] = [
  {
    id: "sun",
    name: "Güneş",
    type: "Yıldız",
    color: "#fbbf24",
    stats: {
      diameter: "1.392.700 km (109× Dünya)",
      mass: "1,989 × 10³⁰ kg",
      gravity: "274 m/s² (28× Dünya)",
      dayLength: "25,4 gün (ekvator)",
      axialTilt: "7,25°",
      temp: "5.505 °C yüzey · 15 mn °C çekirdek",
    },
    orbitInfo: {
      distance: "Samanyolu merkezine ~26.000 ış yılı",
      period: "Galaktik yıl ≈ 230 milyon yıl",
      velocity: "828.000 km/sa (galaktik yörünge)",
      eccentricity: "—",
      inclination: "—",
      moons: "8 gezegen · 5 cüce gezegen · ~1,3 mn asteroit",
    },
    atmosphere: "Fotosfer: %73 hidrojen, %25 helyum. Üst katmanlarda korona 1-3 milyon °C'ye ulaşır.",
    composition: "Plazma hâlinde hidrojen-helyum. Çekirdekte her saniye ~600 milyon ton hidrojen helyuma dönüşür (füzyon).",
    discovery: "Antik çağlardan beri bilinir. Galileo 1610'da lekele­rini gözlemledi; 20. yüzyılda füzyon mekanizması çözüldü. NASA Parker Solar Probe 2021'de koronaya 'dokundu'.",
    surface:
      "Güneş'in 'yüzeyi' görünür fotosferdir: ~500 km kalınlıkta, 5.505 °C'de kaynayan bir plazma denizi. Granüller denilen ~1.000 km'lik hücreler her 8 dakikada yenilenir; kenarları kararmıştır (limb darkening). Yüzeyde dev güneş lekeleri, spiküller ve halka biçimli plazma köprüleri (protuberanslar) sürekli doğar ve ölür.",
    description:
      "Sistemin kalbi: toplam kütlenin %99,86'sını barındıran G-tipi ana kol yıldızı. 4,6 milyar yaşında ve ömrünün yarısında. Çekim gücüyle gezegenleri, Kuiper Kuşağı'nı ve Oort Bulutu'nu tutan şey budur.",
    facts: [
      "Işığı çekirdekte doğup yüzeye ulaşması on binlerce yıl sürer; ama Dünya'ya gelmesi yalnızca 8 dakika 20 saniye.",
      "Güneş, Samanyolu galaksisinin merkezini saatte 828 bin km hızla döner — bir galaktik tur 230 milyon yıl alır.",
      "Dünya'ya ulaşan enerjinin sadece ~yarım milyarda biri yeterlidir: tüm insanlık enerji ihtiyacını karşılamaya.",
      "11 yıllık döngülerle leke ve patlama aktivitesi değişir; büyük patlamalar Dünya'da elektrik şebekelerini etkileyebilir.",
    ],
    sim: { isSun: true, a: 0, e: 0, inclDeg: 0, periDeg: 0, periodDays: 1, meanAnomaly0: 0, radius: 26, labelTier: 0 },
  },
  {
    id: "mercury",
    name: "Merkür",
    type: "Karasal Gezegen",
    color: "#a8a29e",
    stats: {
      diameter: "4.879 km",
      mass: "3,30 × 10²³ kg",
      gravity: "3,7 m/s²",
      dayLength: "58,6 Dünya günü",
      axialTilt: "0,03°",
      temp: "-173 °C gece · +427 °C gündüz",
    },
    orbitInfo: {
      distance: "57,9 mn km · 0,39 AB",
      period: "88 gün",
      velocity: "47,4 km/sn",
      eccentricity: "0,206 (en eliptik gezegen yörüngesi)",
      inclination: "7,0°",
      moons: "0",
    },
    atmosphere: "Neredeyse yok — ince bir ekzosfer (sodyum, potasyum, helyum izleri). Bu yüzden ısıyı tutamaz.",
    composition: "Dev demir çekirdek gezegenin kütlesinin ~%60'ı. İnce kabuk ve manto, yoğun kraterli yüzey.",
    discovery: "Antik çağlardan beri bilinir (MÖ 3000 Sümerler). 1965'te radarla kendi ekseninde 3:2 rezonansla döndüğü anlaşıldı. Mariner 10 (1974) ve MESSENGER (2011-15) haritalandı; BepiColombo 2026'da varacak.",
    surface:
      "Ay benzeri ama daha gri: 1.550 km'lik Caloris Havzası, yüzeyin sekizde birini kaplayan dev bir çarpma izidir. Gezegen soğuyup büzüldüğü için yüzeyde yüzlerce km uzunluğunda 'kaburga' uçurumları (loblu skarp) uzanır. Kutup kraterlerinin tabanı sonsuz gölgededir — milyarlarca yıllık su buzu burada saklıdır.",
    description:
      "Güneş'e en yakın, en küçük ve en hızlı gezegen. Eliptik yörüngesi ve neredeyse hiç atmosferi olmaması, Güneş Sistemi'nin en sert sıcaklık farklarını yaratır.",
    facts: [
      "Bir Merkür günü (gün doğumundan gün batımına) 176 Dünya günü sürer — yani yılından iki kat uzun!",
      "Kutuplardaki derin kraterlerin tabanı milyarlarca yıldır güneş görmemiştir; orada su buzulları saklıdır.",
      "Soğuma nedeniyle gezegen büzüldü; yüzeyinde yüzlerce km uzunluğunda dev 'kaburga' uçurumlar oluştu.",
      "Merkür'ün kabuğu soğuyup büzüldü; gezegen 'elma kabuğu' gibi kırışarak küçüldü.",
    ],
    sim: { a: 72, e: 0.206, inclDeg: 7, periDeg: 29, periodDays: 88, meanAnomaly0: 0.5, radius: 3.4, labelTier: 0 },
  },
  {
    id: "venus",
    name: "Venüs",
    type: "Karasal Gezegen",
    color: "#e8c47a",
    stats: {
      diameter: "12.104 km",
      mass: "4,87 × 10²⁴ kg",
      gravity: "8,87 m/s²",
      dayLength: "243 Dünya günü (retrograd)",
      axialTilt: "177,4°",
      temp: "+464 °C (hep + her yer)",
    },
    orbitInfo: {
      distance: "108,2 mn km · 0,72 AB",
      period: "225 gün",
      velocity: "35,0 km/sn",
      eccentricity: "0,007",
      inclination: "3,4°",
      moons: "0",
    },
    atmosphere: "%96,5 CO₂, %3,5 azot; sülfürik asit bulutları. Yüzey basıncı 92 atm — Dünya okyanuslarında 900 m derinlikteki basınca eşit.",
    composition: "Dünya benzeri kayaç gövde; ama sera etkisi kontrolsüz kaçtı. Volkanik yüzey, ~500.000 kraterden az sayıda — yüzey genç (300-600 mn yıl).",
    discovery: "Antik çağlardan beri bilinir; 'sabah yıldızı'. 1610'da Galileo evrelerini gördü. 1970'te Venera 7 ilk yumuşak inişi yaptı; 61 dakika dayanabildi. Magellan (1990-94) radarla yüzeyi haritaladı.",
    surface:
      "Radar görüntülerinde keskin bazalt kayaları, 1.600'den fazla büyük volkan, dev lav ovaları ve çökme halkaları (koronalar) görünür. Venera 13'ün 1982'de çektiği son fotoğraflar turuncu bir cehennem gösterir: +464 °C, 92 atm basınç — sonda 127 dakikada ezildi. Sülfürik asit bulutlarından yağmur iner ama yere inmeden buharlaşır.",
    description:
      "Dünya'nın 'kız kardeşi' — boyut olarak neredeyse ikizi, ama kaderi tamamen farklı. Kontrolsüz sera etkisi onu sistemin en sıcak gezegeni yaptı; kayaçlar burada parlar, kurşun erir.",
    facts: [
      "Ters yönde döner: Güneş Venüs'te batardan doğar. Üstüne bir de yılından uzun günü var.",
      "Gökyüzünde Ay'dan sonra en parlak gökcismidir; gölge bile düşürebilir.",
      "Bulutları yağmur olarak asla yüzeye ulaşamaz — inmeden buharlaşır (sülfürik asit döngüsü).",
      "Bazı bilim insanları, yaşanabilirlik kaybı öncesi Dünya benzeri okyanuslara sahip olabileceğini düşünüyor.",
    ],
    sim: { a: 98, e: 0.007, inclDeg: 3.4, periDeg: 54, periodDays: 225, meanAnomaly0: 2.2, radius: 5.4, labelTier: 0 },
  },
  {
    id: "earth",
    name: "Dünya",
    type: "Karasal Gezegen",
    color: "#4d9fd6",
    stats: {
      diameter: "12.742 km",
      mass: "5,97 × 10²⁴ kg",
      gravity: "9,81 m/s²",
      dayLength: "23 sa 56 dk",
      axialTilt: "23,4°",
      temp: "15 °C ortalama",
    },
    orbitInfo: {
      distance: "149,6 mn km · 1,00 AB",
      period: "365,25 gün",
      velocity: "29,8 km/sn",
      eccentricity: "0,017",
      inclination: "0° (referans düzlem)",
      moons: "1 (Ay)",
    },
    atmosphere: "%78 azot, %21 oksijen, ~%1 argon + CO₂. Ozon tabakası UV'yi süzer; manyetosfer güneş rüzgârını saptırır.",
    composition: "%71'i sıvı suyla kaplı tek gezegen. Demir çekirdek + yumuşak manto + levha tektoniği yaşayan kabuk. Yaşamın ~3,8 milyar yıllık evi.",
    discovery: "—",
    surface:
      "%71'i okyanusla (ortalama derinlik 3,7 km) kaplı; kıtalarda dağlar, çöller, ormanlar, kutuplarda km kalınlığında buz örtüleri. Levha tektoniği yüzeyi sürekli yeniler: levhalar yılda 2-10 cm sürüklenir, dağları ve okyanus çukurlarını yaratır. En yüksek nokta Everest +8.849 m, en derin nokta Mariana Çukuru -10.935 m — gezegenin iki ucu.",
    description:
      "Bilinen tek yaşam barındıran gezegen. Mükemmel konumdaki ('yaşanabilir bölge') yörüngesi, koruyucu atmosferi ve Ay'ın dengeleyici etkisiyle sıvı suyu milyarlarca yıldır koruyor.",
    facts: [
      "Ay, yılda 3,8 cm uzaklaşıyor — dinozorlar döneminden beri günümüz ~2 saat uzadı.",
      "Dünya aslında 'kusursuz küre' değil: ekvator çapı kutup çapından 43 km daha geniş (basıklık).",
      "Atmosferimiz her gün ~100 ton uzay tozu ve meteorla 'besleniyor'.",
      "Çekirdeğin katı iç kısmı Ay kadar sıcak (≈5.400 °C) ve Dünya kadar hızlı dönüyor.",
    ],
    sim: { a: 126, e: 0.017, inclDeg: 0, periDeg: 102, periodDays: 365.25, meanAnomaly0: 4.1, radius: 5.8, labelTier: 0 },
  },
  {
    id: "mars",
    name: "Mars",
    type: "Karasal Gezegen",
    color: "#d1603d",
    stats: {
      diameter: "6.779 km",
      mass: "6,42 × 10²³ kg",
      gravity: "3,71 m/s²",
      dayLength: "24 sa 37 dk",
      axialTilt: "25,2°",
      temp: "-63 °C ortalama",
    },
    orbitInfo: {
      distance: "227,9 mn km · 1,52 AB",
      period: "687 gün",
      velocity: "24,1 km/sn",
      eccentricity: "0,093",
      inclination: "1,9°",
      moons: "2 (Phobos, Deimos)",
    },
    atmosphere: "Çok ince: %95 CO₂, basınç Dünya'nınkinin <%1'i. Küresel toz fırtınaları aylarca sürebilir.",
    composition: "Demir oksitli (paslı) toprak. Kutuplarda su + kuru buz başlıkları; yüzey altında buzullar ve tuz gölleri kalıntıları.",
    discovery: "Antik çağlardan bilinir. 1877'de 'kanallar' yanılgısı Mars mitolojisi doğurdu. Mariner 4 (1965) ilk yakın çekim; Viking'ler 1976'da indi. Curiosity (2012) ve Perseverance (2021) bugün hâlâ çalışıyor.",
    surface:
      "Demir oksitli (paslı) toprak okyanusları: 21,9 km'lik Olympus Mons volkanı, 4.000 km'lik Valles Marineris kanyonu, kutuplarda su buzu + kuru buz başlıkları. Eski nehir deltaları, göl kalıntıları ve çökmüş lava tüpleri milyonlarca yıl önceki ıslak Mars'ı fısıldar. Küresel toz fırtınaları haftalarca tüm gezegeni örtebilir.",
    description:
      "Kızıl Gezegen — insanlığın bir sonraki durağı. Milyonlarca yıl önce nehirler, göller ve belki okyanuslar buradaydı; bugün kurumuş deltalar geçmişi fısıldıyor.",
    facts: [
      "Olympus Mons (21,9 km) Güneş Sistemi'nin en yüksek volkanı — Everest'in ~2,5 katı.",
      "Valles Marineris kanyonu 4.000 km uzunlukta; ABD'yi baştan başa yutabilirdi.",
      "Güneş Sistemi'nin en yüksek dağı ve en derin kanyonu aynı gezegende: nedeni levha tektoniğinin olmaması.",
      "Phobos yörüngesinden yavaş yavaş düşüyor: ~50 milyon yıl sonra parçalanıp Mars'a halka verecek.",
    ],
    sim: { a: 158, e: 0.093, inclDeg: 1.9, periDeg: 286, periodDays: 687, meanAnomaly0: 5.6, radius: 4.4, labelTier: 0 },
  },
  {
    id: "jupiter",
    name: "Jüpiter",
    type: "Gaz Devi",
    color: "#d9a066",
    stats: {
      diameter: "139.820 km (11× Dünya)",
      mass: "1,898 × 10²⁷ kg (318× Dünya)",
      gravity: "24,79 m/s²",
      dayLength: "9 sa 56 dk (en hızlı gezegen)",
      axialTilt: "3,1°",
      temp: "-110 °C (bulut üstü)",
    },
    orbitInfo: {
      distance: "778,5 mn km · 5,2 AB",
      period: "11,9 yıl",
      velocity: "13,1 km/sn",
      eccentricity: "0,049",
      inclination: "1,3°",
      moons: "95+ (Io, Europa, Ganymede, Callisto…)",
    },
    atmosphere: "%90 hidrojen, %10 helyum; amonyak bulut kuşakları. Derinlerde metalik hidrojen okyanusu ve muhtemelen yoğun çekirdek.",
    composition: "Yıldız olamamış dev: iç basınç metalik hidrojen yaratır, bu da gezegeni manyetik dev yapar. 'Yıldız olamadı' çünkü kütlesi füzyon için yetmedi.",
    discovery: "Antik çağlardan bilinir. 1610'da Galileo 4 büyük uydusunu gördü — Dünya merkezli evrene ilk büyük darbe. 1979 Voyager halkalarını ve Io'nun volkanlarını buldu; Juno 2016'dan beri yörüngede.",
    surface:
      "Katı yüzeyi yoktur — derine indikçe gaz önce sıvıya, sonra metalik akışkana dönüşür. Görünür 'yüzey' amonyak buzu bulut bantlarıdır: açık 'bölgeler' ve koyu 'kuşaklar' 600 km/sa'lik jetlerle sürekli şeritlenir. Büyük Kırmızı Leke (16.000 km) 350+ yıllık bir fırtınadır; Juno, kutuplarda 8 dev siklonun düzenli küme döndüğünü gösterdi.",
    description:
      "Gezegenlerin kralı. Kütlesi diğer tüm gezegenlerin 2,5 katı ve sistemin 'çekim kalkanı': şerit halinde göktaşlarını yakalayıp iç sisteme girmesini engeller.",
    facts: [
      "Büyük Kırmızı Leke, Dünya'dan büyük ve en az 350 yıldır süren bir fırtına.",
      "Manyetik alanı Dünya'nınkinin ~20.000 katı; manyetosferi Ay'ın yörüngesinden daha geniş.",
      "Derinlerde hidrojen damlacıkları helyuma dönüşür: 'helyum yağmuru' çekirdeğe düşer.",
      "Ganymede uydusu Merkür'den büyük; kendi manyetik alanı üreten tek uydudur.",
    ],
    sim: { a: 240, e: 0.049, inclDeg: 1.3, periDeg: 274, periodDays: 4333, meanAnomaly0: 1.3, radius: 15, bands: true, labelTier: 0 },
  },
  {
    id: "saturn",
    name: "Satürn",
    type: "Gaz Devi",
    color: "#e3c78a",
    stats: {
      diameter: "116.460 km",
      mass: "5,68 × 10²⁶ kg",
      gravity: "10,44 m/s²",
      dayLength: "10 sa 33 dk",
      axialTilt: "26,7°",
      temp: "-140 °C",
    },
    orbitInfo: {
      distance: "1,43 mr km · 9,58 AB",
      period: "29,4 yıl",
      velocity: "9,7 km/sn",
      eccentricity: "0,057",
      inclination: "2,5°",
      moons: "146+ (Titan, Enceladus, Mimas…)",
    },
    atmosphere: "Hidrojen-helyum; Jüpiter'den daha soluk amonyak sisi. Kuzey kutbunda Dünya'yı yutacak boyutta altıgen bir jet akımı var.",
    composition: "Ortalama yoğunluk 0,687 g/cm³ — sudan hafif! Halkalar: milyarlarca buz parçası; 282.000 km genişlikte ama yer yer yalnızca ~10 m kalınlıkta.",
    discovery: "Antik çağlardan bilinir. 1610 Galileo 'kulakları' gördü; 1655 Huygens halkanın halka olduğunu ve Titan'ı keşfetti. Cassini-Huygens (2004-2017) devrim yarattı: Titan'a iniş, Enceladus'ta su buldu.",
    surface:
      "Katı yüzeyi yoktur; soluk altın rengi amonyak sisi katmanlarıyla örtülüdür. Rüzgârlar 1.800 km/sa'ye ulaşır. Kuzey kutbundaki altıgen jet akımı ~30.000 km genişliğindedir — hiçbir başka gezegende benzeri olmayan, 40+ yıldır gözlenen bir atmosfer dalgasıdır.",
    description:
      "Sistemin mücevheri. Halkaları gezegen oluşumundan artan ya da parçalanmış bir uydunun kalıntısı olabilir; Cassini, halkaların 'genç' olduğunu ve belki de 100 milyon yıl içinde yok olacağını gösterdi.",
    facts: [
      "Halkalar o kadar ince ki ölçekli bir modelde kağıttan daha ince olurdu.",
      "Kuzey kutupdaki altıgen fırtınanın kenarı Dünya çapından uzundur ve 40 yıl kapılarını aralamadı.",
      "Enceladus'un buz fıskiyelerinde tuz, organik moleküller ve hidrojen bulundu — altında yaşanabilir bir okyanus var.",
      "Titan'da yağmur yağar, nehirler akar, denizler dalgalanır — ama sıvı su değil, sıvı metan.",
    ],
    sim: { a: 305, e: 0.057, inclDeg: 2.5, periDeg: 339, periodDays: 10759, meanAnomaly0: 3.2, radius: 12.5, ring: { inner: 1.35, outer: 1.95, tiltDeg: 26.7, nodeDeg: 12, color: "#d8c690" }, labelTier: 0 },
  },
  {
    id: "uranus",
    name: "Uranüs",
    type: "Buz Devi",
    color: "#9ad6d2",
    stats: {
      diameter: "50.724 km",
      mass: "8,68 × 10²⁵ kg",
      gravity: "8,87 m/s²",
      dayLength: "17 sa 14 dk (retrograd)",
      axialTilt: "97,8°",
      temp: "-195 °C (min -224 °C)",
    },
    orbitInfo: {
      distance: "2,87 mr km · 19,2 AB",
      period: "84 yıl",
      velocity: "6,8 km/sn",
      eccentricity: "0,046",
      inclination: "0,8°",
      moons: "28 (Titania, Oberon, Miranda…)",
    },
    atmosphere: "Hidrojen + helyum + %2 metan. Metan kırmızıyı yuttuğu için turkuaz görünür. Derinlerde elmas yağmuru olması teorisi var.",
    composition: "Su, amonyak ve metan buzları manto hâlinde; 'buz devi' adı buradan. İçi muhtemelen Dünya büyüklüğünde kaya-çekirdek.",
    discovery: "1781'de William Herschel — teleskopla keşfedilen İLK gezegen. Adı Yunan gökyüzü tanrısından. Voyager 2, 1986'da tek ziyaretini yaptı; 2026'da Uranüs Orbiter planları konuşuluyor.",
    surface:
      "Görünürde sakin bir camgöbeği küre: metan, kırmızı ışığı yutarak soğuk, düz bir sis perdesi yaratır. Bulutlar soluk ve fırtınalar nadirdir; birkaç büyük fırtına lekesi yıllar sonra kaybolmuştur. 98° yatık ekseni sayesinde her kutup 42 yıl kesintisiz gündüz, ardından 42 yıl gece yaşar.",
    description:
      "Yan yatan dev. Bir şey (dev çarpışma?) ekseni devirdi; artık 42 yıl gündüz, 42 yıl gece yaşar ve yörüngesinde adeta yuvarlanarak ilerler.",
    facts: [
      "Güneş Sistemi'nin ölçülen en soğuk atmosferi: -224 °C (Neptün'den bile soğuk!).",
      "Eksen eğikliği 98°: mevsimler uçlarda ekstrem — kutbunda 42 yıl süren yaz gündüzü.",
      "Uyduları Shakespeare ve Pope karakterlerini taşır: Titania, Oberon, Miranda, Ariel…",
      "Miranda gezegenin 'Frankenstein uydusu': parçalanıp tekrar toplanmış gibi görünür; 20 km'lik uçurumları var.",
    ],
    sim: { a: 370, e: 0.046, inclDeg: 0.8, periDeg: 97, periodDays: 30687, meanAnomaly0: 5.9, radius: 8.6, ring: { inner: 1.4, outer: 1.7, tiltDeg: 82, nodeDeg: -40, color: "#b8e8e4" }, labelTier: 0 },
  },
  {
    id: "neptune",
    name: "Neptün",
    type: "Buz Devi",
    color: "#5b7fd4",
    stats: {
      diameter: "49.244 km",
      mass: "1,02 × 10²⁶ kg",
      gravity: "11,15 m/s²",
      dayLength: "16 sa 6 dk",
      axialTilt: "28,3°",
      temp: "-200 °C",
    },
    orbitInfo: {
      distance: "4,50 mr km · 30,1 AB",
      period: "165 yıl",
      velocity: "5,4 km/sn",
      eccentricity: "0,011",
      inclination: "1,8°",
      moons: "16 (Triton, Nereid…)",
    },
    atmosphere: "Hidrojen, helyum, metan. Sistemin en hızlı rüzgârları: 2.100 km/sa — ses hızının yaklaşık 2 katı.",
    composition: "Buz devi: su/amonyak/metan mantosu, kaya çekirdek. Güneş'ten 30 AB uzakta ama iç ısısıyla beklenmedik derecede dinamik.",
    discovery: "Matematikle keşfedilen ilk gezegen! Uranüs'ün yörünge bozulmalarından konumu hesaplandı (Le Verrier & Adams); 1846'da Galle tam öngörülen noktada buldu. Voyager 2, 1989'da geçti — hâlâ tek ziyaret.",
    surface:
      "Katı yüzeyi yoktur; derin lacivert metan atmosferinde 2.100 km/sa'lik süpersonik rüzgârlar eser — Güneş Sistemi'nin en hızlısı. Voyager 2'nin 1989'da gördüğü Dünya boyutlu 'Büyük Karanlık Leke' birkaç yıl sonra kayboldu: burada fırtınalar doğar ve ölür. Üst atmosferde ince metan buz kristali bulutları süzülür.",
    description:
      "Dış sınırın mavi devi. Keşfinden beri yalnızca bir yörünge turunu tamamladı (2011'de). Karanlık leke adı verilen Dünya boyutlu fırtınalar oluşup aylar içinde yok olur.",
    facts: [
      "Rüzgârları 2.100 km/sa — Dünya'daki en güçlü kasırgaların 10 katı.",
      "Triton uydusu ters yönde döner: Kuiper Kuşağı'ndan yakalanmış 'esir' bir cüce gezegendir.",
      "Güneş'ten aldığı ışık Dünya'nın aldığının 1/900'ü; öğlen vakti bile alacakaranlık gibidir.",
      "Bir yılı 165 Dünya yılı: 1846'daki keşfinden bu yana 2011'de tek turunu tamamladı.",
    ],
    sim: { a: 430, e: 0.011, inclDeg: 1.8, periDeg: 273, periodDays: 60190, meanAnomaly0: 2.7, radius: 8.2, labelTier: 0 },
  },
  {
    id: "pluto",
    name: "Plüton",
    type: "Cüce Gezegen",
    color: "#c39a6b",
    stats: {
      diameter: "2.377 km",
      mass: "1,31 × 10²² kg",
      gravity: "0,62 m/s²",
      dayLength: "6,4 gün (retrograd)",
      axialTilt: "122,5°",
      temp: "-229 °C",
    },
    orbitInfo: {
      distance: "5,9 mr km (ortalama) · 39,5 AB",
      period: "248 yıl",
      velocity: "4,7 km/sn",
      eccentricity: "0,249 (Neptün'ün içine girer)",
      inclination: "17,2°",
      moons: "5 (Charon, Nix, Hydra, Kerberos, Styx)",
    },
    atmosphere: "İnce azot atmosferi — yörüngenin uzak noktasında donup yüzeye çöker (mevsimsel boşalma).",
    composition: "Kaya + buz. Yüzey: azot, metan, CO buzulları. 'Kalp' şeklindeki Sputnik Planitia, konveksiyonla akan genç bir azot buzul düzlüğü.",
    discovery: "1930'da Clyde Tombaugh. 2006'da IAU 'cüce gezegen' sınıfına aldı — dünya çapında tartışma yarattı. New Horizons 2015'te geçti ve 'kalbi' görünce herkes yeniden âşık oldu.",
    surface:
      "Uçucu buz müzesi: azot, metan ve CO buzulları. Kalp biçimli Sputnik Planitia, konveksiyonla akan ~1.000 km genişliğinde genç bir azot buzul düzlüğüdür (10 mn yıl). 3-5 km yükseklikte su buzundan dağlar, koyu kırmızı tholin lekeleri ve muhtemel bir kriyovolkan (Wright Mons) yüzeyi süsler.",
    description:
      "Kuiper Kuşağı'nın figürü. Charon ile neredeyse çift sistem: Charon Plüton'un yarısı kadar — ikisi ortak bir nokta etrafında dans eder. New Horizons, donmuş ama jeolojik olarak canlı bir dünya gösterdi.",
    facts: [
      "Charon o kadar büyük ki Plüton-Charon ikilisi ortak kütle merkezlerinin etrafında döner; 'çift cüce gezegen' denilebilir.",
      "Yörüngesi o kadar eliptik ki 1979-1999 arasında Neptün'e Güneş'ten daha yakındı.",
      "Sputnik Planitia'daki buzullar akar, dağları su buzundan — orada buz kaya kadar serttir.",
      "Bir günde gün batımı görürsün: eksen 122° eğik, güneş bazen ters yönde doğar.",
    ],
    sim: { a: 470, e: 0.249, inclDeg: 17.2, periDeg: 113, periodDays: 90560, meanAnomaly0: 1.1, radius: 3.6, labelTier: 0 },
  },
  {
    id: "ceres",
    name: "Ceres",
    type: "Cüce Gezegen",
    color: "#b5b0a6",
    stats: {
      diameter: "940 km",
      mass: "9,4 × 10²⁰ kg",
      gravity: "0,28 m/s²",
      dayLength: "9 sa",
      axialTilt: "4°",
      temp: "-105 °C",
    },
    orbitInfo: {
      distance: "414 mn km · 2,77 AB",
      period: "4,6 yıl",
      velocity: "17,9 km/sn",
      eccentricity: "0,079",
      inclination: "10,6°",
      moons: "0",
    },
    atmosphere: "Seyrek su buharı ekzosferi — yüzey buzu güneşle süblimleşir.",
    composition: "Asteroit kuşağındaki toplam kütlenin ~%25'i tek başına Ceres'te. Manto katmanında buz ve muhtemelen tuzlu su kalıntıları.",
    discovery: "1801'de Giuseppe Piazzi — keşfedilen İLK asteroit (aslında tam bir gezegen sanıldı!). Dawn sondası 2015-18 yörüngesinde: Occator kraterindeki parlak noktalar sodyum karbonat (tuz) çıktı.",
    surface:
      "Karanlık, tozlu ve yaşlı bir yüzey. Ocator kraterindeki parlak noktalar sodyum karbonat (tuz) yataklarıdır — alttaki tuzlu suyun kriyovolkanik kalıntıları. Ahuna Mons: 4 km yüksekliğinde, bugüne kadar bulunan tek buz volkanı.",
    asteroidType: "C — Karbonlu (su buzu + karbonat)",
    description:
      "Asteroit kuşağının kraliçesi ve iç Güneş Sistemi'nin tek cüce gezegeni. Suyuyla, Mars-Jupiter arasında gizli bir 'okyanus dünyası' adayı.",
    facts: [
      "Ceres'teki su buzunun miktarı, Dünya'daki tüm tatlı sudan daha fazla olabilir.",
      "Occator kraterindeki parlak noktalar uzaydan bile çıplak gözle ayırt edilebilir kadar parlak tuz yatakları.",
      "Geçmişte 'cryovolkan' — buz volkanları — püskürterek yüzeyini yeniledi.",
      "Adını Roma tarım ve hasat tanrıçasından alır; 'serel' (tahıl) kelimesiyle akraba.",
    ],
    sim: { a: 201, e: 0.079, inclDeg: 10.6, periDeg: 73, periodDays: 1682, meanAnomaly0: 3.9, radius: 2.4, labelTier: 1 },
  },
  {
    id: "vesta",
    name: "Vesta",
    type: "Asteroit",
    color: "#a89f8f",
    stats: {
      diameter: "525 km",
      mass: "2,59 × 10²⁰ kg",
      gravity: "0,25 m/s²",
      dayLength: "5,3 sa",
      axialTilt: "29°",
      temp: "-108 °C (ort.)",
    },
    orbitInfo: {
      distance: "353 mn km · 2,36 AB",
      period: "3,6 yıl",
      velocity: "19,3 km/sn",
      eccentricity: "0,089",
      inclination: "7,1°",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition: "Ayırt edilmiş (diferansiye) gövde: metal çekirdek, manto, kabuk — yani bir 'protogezegen'. Dünya'ya düşen HED meteoritlerinin kaynağıdır.",
    discovery: "1807'de Heinrich Olbers. Kuşağın 2. en büyük gövdesi ve çıplak gözle zor da olsa görülebilen en parlak asteroit. Dawn 2011-12 yörüngesinde araştırdı.",
    surface:
      "Güney kutbundaki Rheasilvia havzası ~505 km çapında ve ~22 km derinliktedir — Merkür'ün Caloris'inden bile derin! Merkez zirvesi sistemin en yüksek dağlarındandır. Yüzey mineralojisi, Dünya'ya düşen HED meteoritleriyle birebir eşleşir: ekinin altında metal çekirdek görünür.",
    asteroidType: "V — Vestoid (diferansiye protoplanet)",
    description:
      "Kuşağın yaşayan fosili: Güneş Sistemi'nin bebekliğinde oluşup sonra büyümeye 'yetim kalmış' bir protogezegen. Güney kutbundaki dev çarpma krateri Rheasilvia'nın merkez zirvesi sistemin en yüksek dağlarından biridir.",
    facts: [
      "Rheasilvia çarpma krateri ~505 km çapında; merkez zirvesi ~22 km — Everest'in 2,5 katı.",
      "Bu çarpma, Dünya'ya düşen meteoritlerin ~%6'sını oluşturan parçacıklar saçtı.",
      "Bir noktada 'gezegen' sayıldı, sonra asteroit oldu; Dawn onu 'son yaşayan protogezegen' ilan etti.",
      "Yüzeyinin güney yarısı bu dev çarpma nedeniyle asimetrik biçimde basık.",
    ],
    sim: { a: 210, e: 0.089, inclDeg: 7.1, periDeg: 151, periodDays: 1325, meanAnomaly0: 0.7, radius: 1.9, labelTier: 1 },
  },
  {
    id: "haumea",
    name: "Haumea",
    type: "Cüce Gezegen",
    color: "#e8e4da",
    stats: {
      diameter: "~2.100 × 1.100 km (elipsoit)",
      mass: "4,01 × 10²¹ kg",
      gravity: "0,44 m/s²",
      dayLength: "3,9 saat (!)",
      axialTilt: "—",
      temp: "-241 °C",
    },
    orbitInfo: {
      distance: "6,45 mr km · 43 AB",
      period: "284 yıl",
      velocity: "4,5 km/sn",
      eccentricity: "0,195",
      inclination: "28,2°",
      moons: "2 (Hi'iaka, Namaka) + halka",
    },
    atmosphere: "Yok denecek kadar az (yüzey: kristal su buzu).",
    composition: "Kaya çekirdek + buz manto. İnanılmaz dönüş hızının çektiği şekil: rugbi topu gibi üç eksenli elipsoit.",
    discovery: "2004-05 (Caltech & Sierra Nevada ekipleri; ad anlaşmazlığı çıktı). 2017'de yıldız örtülmesiyle bir HALKA keşfedildi — halkası bilinen ilk cüce gezegen.",
    surface:
      "Neredeyse saf kristal su buzu yüzeyi (albedo ~0,7) — uzay radyasyonu altında bile düzenli kalması, iç ısının yüzeyi yenilediğini gösterir. Rugbi topu şekli, 3,9 saatlik dönüşün yarattığı dev merkezkaç kuvvetinin izidir.",
    description:
      "Kuiper'in hızlı çırpılmış yumurtası: 4 saatte bir döner ve bu yüzden yumurtayı andırır. Ailesi var: çarpışma sonucu kopan iki uydusu ve yüzeyleri aynı buz imzasını taşıyan bir 'çarpışma ailesi'.",
    facts: [
      "Güneş Sistemi'nin en hızlı dönen büyük gökcismi: bir günü 3,9 saat.",
      "Bilinen ilk halkalı cüce gezegen (2017) — halka keşfi şaşırttı.",
      "Yüzeyindeki kristal buz, radyasyon altında bile düzenli kalıyor — muhtemelen iç ısı yeniler.",
      "Adını Hawai'i doğum tanrıçasından alır; uyduları da tanrıçanın çocuklarıdır.",
    ],
    sim: { a: 505, e: 0.195, inclDeg: 28.2, periDeg: 240, periodDays: 103774, meanAnomaly0: 2.4, radius: 2.8, labelTier: 1 },
  },
  {
    id: "makemake",
    name: "Makemake",
    type: "Cüce Gezegen",
    color: "#d9a98c",
    stats: {
      diameter: "1.430 km",
      mass: "~3,1 × 10²¹ kg",
      gravity: "0,5 m/s²",
      dayLength: "22,8 saat",
      axialTilt: "—",
      temp: "-239 °C",
    },
    orbitInfo: {
      distance: "6,85 mr km · 45,8 AB",
      period: "306 yıl",
      velocity: "4,4 km/sn",
      eccentricity: "0,161",
      inclination: "29°",
      moons: "1 (MK2)",
    },
    atmosphere: "Belki mevsimsel, çok ince metan azot atmosferi (henüz doğrulanmadı).",
    composition: "Kızıl kahverengi yüzey: metan ve etan buzları, tholin organikleri. Güneş Sistemi'nin en beyaz gökcisimlerinden kadar parlak değil ama çok yansıtıcı.",
    discovery: "2005'te Michael Brown ekibi; Paskalya'dan hemen sonra keşfedildiği için Rapa Nui (Paskalya Adası) yaratıcı tanrısı Makemake'nin adını aldı. Hubble 2016'da koyu renk uydusu MK2'yi buldu.",
    surface:
      "Kızıl-kahverengi metan ve etan buzları; tholin organikleriyle boyanmış. Plüton kadar parlak (albedo ~0,8) — güneş buzu 'terlemesiyle' yüzeyini kendini yenileyebilir.",
    description:
      "Kuiper'in klasik 'kırmızı cücesi'. Plüton benzeri buz dünyası; yüzeyindeki metan buzu güneş ışığıyla işlenip kırmızı-kahve tonlar yaratmış.",
    facts: [
      "Keşif tarihi Paskalya'ya denk geldiği için ada tanrısının adı verildi — bilim tarihinde nadir bir durum.",
      "MK2 uydusu, ana gövdeden 1.300 kat sönük olduğu için ancak 2016'da fark edildi.",
      "Yörüngesi 30° eğik: 'dinamik olarak sıcak' Kuiper popülasyonunun üyesi.",
      "Bir günü Dünya günü kadar — 22,8 saat.",
    ],
    sim: { a: 525, e: 0.161, inclDeg: 29, periDeg: 296, periodDays: 112897, meanAnomaly0: 4.4, radius: 2.6, labelTier: 1 },
  },
  {
    id: "eris",
    name: "Eris",
    type: "Cüce Gezegen",
    color: "#d8dde2",
    stats: {
      diameter: "2.326 km",
      mass: "1,66 × 10²² kg (Plüton'dan %27 ağır)",
      gravity: "0,82 m/s²",
      dayLength: "25,9 saat",
      axialTilt: "—",
      temp: "-231 °C",
    },
    orbitInfo: {
      distance: "10,1 mr km · 67,8 AB (ort.)",
      period: "558 yıl",
      velocity: "3,4 km/sn",
      eccentricity: "0,436 (perihel 38 AB, aphel 97 AB)",
      inclination: "44,0° (!)",
      moons: "1 (Dysnomia)",
    },
    atmosphere: "Uzak yörüngede atmosfer donar; perihel yaklaştığında geçici ince azot/metan atmosferi oluşabilir.",
    composition: "Kayalıklı çekirdek + buz manto; yüzey, güneş ışığını yansıtan neredeyse saf azot-metan buzu ('kar' gibi, albedo ~0,96).",
    discovery: "2005'te Mike Brown (Palomar). İlk adı 'Xena'ydı. Plüton'dan büyük sanılınca '10. gezegen' tartışması başladı — sonunda IAU gezegen tanımını yeniden yazdı ve Plüton cüce sınıfına düştü.",
    surface:
      "Neredeyse saf azot-metan buzuyla kaplı 'kar kürkünü' andırır: albedo ~0,96 ile sistemin en yansıtıcı gövdelerinden. Çarpma kraterleri azdır — yüzeyi jeolojik olarak genç görünüyor.",
    description:
      "Plüton'un ağır kardeşi ve gezegen tanımını değiştiren gökcismi. Son derece eğik (44°) ve eliptik yörüngesiyle Kuiper'in 'dağınık disk' bölgesinde dolaşır; güneşe en yakın noktasında bile Plüton'un ortalaması kadar uzaktır.",
    facts: [
      "Plüton'dan küçük ama daha ağır: içi kayalık ve yoğun.",
      "Yörünge eğikliği 44° — güneş sistemi düzleminin çok üstünde süzülür.",
      "Bir yılı 558 Dünya yılı: keşfinden beri yolunun %2'sini bile tamamlamadı.",
      "Uydusu Dysnomia'nın adı 'yasadışılık' tanrıçasıdır — Eris de 'kargaşa' tanrıçasıdır: adlar isabetli.",
    ],
    sim: { a: 600, e: 0.436, inclDeg: 44, periDeg: 187, periodDays: 204199, meanAnomaly0: 0.2, radius: 2.8, labelTier: 1 },
  },
  {
    id: "moon",
    name: "Ay",
    type: "Uydu",
    color: "#cbd5e1",
    parentName: "Dünya",
    stats: {
      diameter: "3.474 km",
      mass: "7,35 × 10²² kg",
      gravity: "1,62 m/s²",
      dayLength: "27,3 gün (kilitli dönüş)",
      axialTilt: "6,7°",
      temp: "-173 °C gece · +127 °C gündüz",
    },
    orbitInfo: {
      distance: "384.400 km (Dünya'dan)",
      period: "27,3 gün",
      velocity: "1,02 km/sn",
      eccentricity: "0,055",
      inclination: "5,1°",
      moons: "—",
    },
    atmosphere: "Pratikte yok (ekzosfer). Ayak izleri milyonlarca yıl kalır.",
    composition: "Büyük çarpma hipotezi: Mars büyüklüğündeki Theia, genç Dünya'ya çarptı; saçılan parçalardan doğdu. İçinde küçük çekirdek, manto, anortozit kabuk.",
    discovery: "İnsanların tek ayak bastığı gökcismi: Apollo 11, 20 Temmuz 1969 — Armstrong & Aldrin. Sovyet Luna 3 (1959) ilk kez uzak yüzü fotoğrafladı. Chang'e-4 (2019) uzak yüzeye ilk inişi yaptı; Artemis programı insanlığı geri getirmeye hazırlanıyor.",
    surface:
      "İki tür arazi: parlak, kraterli 'aytosferi' (anortozit) yükseklikleri ve koyu 'maria' — 3-3,5 milyar yıl önce taşan bazalt lav ovaları. 30.000+ krater sayılmış; Tycho (85 km) ışın sistemiyle görünür. Atmosfersiz yüzeyde astronot ayak izleri milyonlarca yıl bozulmadan kalır.",
    description:
      "Dünya'nın sadık eşi: gelgitleri yaratır, eksen eğikliğini dengeleyip iklimi korur ve geceleri yol gösterir. Daima aynı yüzü bize bakar — 'gelgit kilidi'.",
    facts: [
      "İnsanların Aya ilk ayak basışı: Neil Armstrong, 20 Temmuz 1969, saat 02:56 UTC (TSİ 05:56) — 'İnsan için küçük bir adım, insanlık için dev bir sıçrama.' Buzz Aldrin birkaç dakika sonra katıldı; Michael Collins yörüngede bekledi.",
      "Bugüne dek tam 12 astronot Ay yüzeyinde yürüdü (Apollo 11-17, 1969-1972). Ay'da rüzgâr ve su olmadığı için Armstrong'un ayak izleri milyonlarca yıl duracak.",
      "Yılda 3,8 cm uzaklaşıyor: milyonlarca yıl sonra tam güneş tutulması görülemeyecek.",
      "Uzak yüzü 'karanlık yüz' denir ama güneş görür — sadece Dünya'dan görünmez.",
      "Apollo astronotları bıraktığı yansıtıcılarla lazer ölçümü hâlâ cm hassasiyetinde yapılıyor.",
      "Ay sarsıntıları (moonquake) derinlerde saatlerce sürebilir — Ay 'çın' gibi titreşir.",
    ],
    sim: { parentId: "earth", a: 0, e: 0.055, inclDeg: 0, periDeg: 0, periodDays: 27.3, meanAnomaly0: 1.2, radius: 1.9, moonOrbit: 12, moonInclDeg: 5.1, labelTier: 2 },
  },
  {
    id: "io",
    name: "Io",
    type: "Uydu",
    color: "#e8d06a",
    parentName: "Jüpiter",
    stats: {
      diameter: "3.643 km",
      mass: "8,93 × 10²² kg",
      gravity: "1,80 m/s²",
      dayLength: "1,77 gün (kilitli)",
      axialTilt: "0°",
      temp: "-143 °C (volkanlarda +1.600 °C)",
    },
    orbitInfo: {
      distance: "421.700 km (Jüpiter'den)",
      period: "1,77 gün",
      velocity: "17,3 km/sn",
      eccentricity: "0,004",
      inclination: "0,05°",
      moons: "—",
    },
    atmosphere: "Çok ince SO₂ (volkanlardan).",
    composition: "Kayaç gövde; yüzeyi sülfür ve SO₂ buzlarıyla boyanmış — sarı, turuncu, kırmızı, siyah lekeler.",
    discovery: "1610 Galileo. 1979 Voyager 1 görüntülerinde ilk aktif dünya dışı volkanlar bulundu. Juno 2023'ten beri yakın geçişlerle volkanik ısıyı haritalıyor.",
    surface:
      "Sarı, turuncu, kırmızı ve siyah sülfürle boyanmış bir palet: 400+ volkan, 500 km'ye fışkıran lav gölleri. Lav her şeyi sürekli yeniden boyadığı için yüzeyde krater yoktur — Io, sistemin 'en genç' yüzeylerinden birine sahiptir.",
    description:
      "Güneş Sistemi'nin en volkanik gökcismi: 400+ aktif volkan. Jüpiter'in dev çekimi Io'yu sürekli 'yoğurur' (gelgit ısınması); içi eriyip yüzeyden lav ve sülfür püskürtür.",
    facts: [
      "Lav gölleri magma okyanusları kadar büyüktür; Loki gölü ada büyüklüğünde.",
      "Volkan püskürmeleri 500 km yükseğe fışkırır — uydu çapının yarısı.",
      "Yüzeyinde neredeyse krater yok: lav her şeyi sürekli yeniden boyar.",
      "Jüpiter'in manyetik alanından her saniye 1 ton madde kopar; plazma halkası oluşturur.",
    ],
    sim: { parentId: "jupiter", a: 0, e: 0.004, inclDeg: 0, periDeg: 0, periodDays: 6, meanAnomaly0: 0.3, radius: 2.3, moonOrbit: 20, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "europa",
    name: "Europa",
    type: "Uydu",
    color: "#e3d9c0",
    parentName: "Jüpiter",
    stats: {
      diameter: "3.122 km",
      mass: "4,80 × 10²² kg",
      gravity: "1,31 m/s²",
      dayLength: "3,55 gün (kilitli)",
      axialTilt: "0,1°",
      temp: "-160 °C ekvator · -220 °C kutup",
    },
    orbitInfo: {
      distance: "671.100 km (Jüpiter'den)",
      period: "3,55 gün",
      velocity: "13,7 km/sn",
      eccentricity: "0,009",
      inclination: "0,47°",
      moons: "—",
    },
    atmosphere: "Zayıf oksijen ekzosferi (buz radyolizi).",
    composition: "15-25 km kalınlıkta buz kabuk; altında 60-150 km derinlikli global tuzlu su okyanusu — Dünya'nın tüm yüzey suyunun ~2 katı. Taban kaya: kimya için hazır.",
    discovery: "1610 Galileo. Voyager görüntüleri 'kırmızı çizgili bilardo topu' yüzeyi gösterdi; Galileo (1995-2003) okyanus kanıtını topladı. NASA Europa Clipper 2024'te fırlatıldı — 2030'da 49 yakın geçiş yapacak.",
    surface:
      "Güneş Sistemi'nin en pürüzsüz yüzeyi: krater neredeyse yok, buz kabuğu kızıl-kahverengi çatlak ağları (lineae) ve çift sırtlarla kaplı. Çatlaklar, okyanusun buz kabuğunu yatay hareket ettirdiğini gösterir; Hubble su buharı plümaları görmüştür.",
    description:
      "Yaşam arayışının 1 numaralı hedefi. Pürüzsüz buz kabuğunun altında sonsuz bir karanlık okyanus; gelgit ısınması tabanındaki hidrotermal bacaları besliyor olabilir.",
    facts: [
      "Yüzeyi Güneş Sistemi'nin en pürüzsüz sabit yüzeylerinden — dev buz tektoniğiyle yenilenir.",
      "Kabuktaki çift sırtlar (double ridges), Dünya'nın Grönland buzullarındaki yapıların ikizi.",
      "Okyanusun Dünya okyanuslarının toplamından 2 kat fazla su barındırdığı tahmin ediliyor.",
      "Hubble, buz fıskiyesi plümleri gördü — yüzeyden uzaya su saçılıyor olabilir.",
    ],
    sim: { parentId: "jupiter", a: 0, e: 0.009, inclDeg: 0, periDeg: 0, periodDays: 9, meanAnomaly0: 2.1, radius: 2.0, moonOrbit: 25, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "ganymede",
    name: "Ganymede",
    type: "Uydu",
    color: "#b8ada0",
    parentName: "Jüpiter",
    stats: {
      diameter: "5.268 km (Merkür'den büyük)",
      mass: "1,48 × 10²³ kg",
      gravity: "1,43 m/s²",
      dayLength: "7,15 gün (kilitli)",
      axialTilt: "0,3°",
      temp: "-163 °C",
    },
    orbitInfo: {
      distance: "1,07 mn km (Jüpiter'den)",
      period: "7,15 gün",
      velocity: "10,9 km/sn",
      eccentricity: "0,001",
      inclination: "0,2°",
      moons: "—",
    },
    atmosphere: "Çok ince oksijen; auroralara radyoliz kaynaklı.",
    composition: "Demir çekirdek + kaya manto + buz kabuk + muhtemelen birden fazla katmanlı okyanus. Yüzey: karanlık eski bölgeler + parlak oluklu araziler.",
    discovery: "1610 Galileo. 1972'de atmosfer izi; 1996'da Hubble aurora'sından kendi manyetik alanı kanıtlandı. ESA JUICE sondası 2032'de Ganymede yörüngesine girerek bir uydunun yörüngesine oturan ilk araç olacak.",
    surface:
      "İki tür arazi: koyu, 4 milyar yıllık kraterli bölgeler ve parlak, oluklu 'sulci' arazileri — buz tektoniğinin eski izleri. Yüzeyin altında katmanlı tuzlu su okyanusları saklıdır; manyetik alan buradan 'koklanır'.",
    description:
      "Güneş Sistemi'nin en büyük uydusu — gezegen sayılır boyutta. Kendi manyetik alanı üreten tek uydu ve katmanlı tuzlu okyanuslarıyla gizli bir su dünyası.",
    facts: [
      "Kendi manyetik alanı: metal çekirdeği hâlâ 'canlı' (konveksiyon) demek.",
      "Jüpiter'in aurorasını görünür biçimde büker — manyetik parmak izi uzaydan okunur.",
      "Okyanusu, buz katmanları arasında sıkışmış; 150 km derinliği aşabilir.",
      "Yüzeyindeki çarpma havzası (Rheasilvia rekabeti) 4.000 km'yi bulan eski izler taşır.",
    ],
    sim: { parentId: "jupiter", a: 0, e: 0.001, inclDeg: 0, periDeg: 0, periodDays: 14, meanAnomaly0: 4.0, radius: 3.1, moonOrbit: 31, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "callisto",
    name: "Callisto",
    type: "Uydu",
    color: "#8f857a",
    parentName: "Jüpiter",
    stats: {
      diameter: "4.821 km",
      mass: "1,08 × 10²³ kg",
      gravity: "1,24 m/s²",
      dayLength: "16,7 gün (kilitli)",
      axialTilt: "0°",
      temp: "-139 °C",
    },
    orbitInfo: {
      distance: "1,88 mn km (Jüpiter'den)",
      period: "16,7 gün",
      velocity: "8,2 km/sn",
      eccentricity: "0,007",
      inclination: "0,2°",
      moons: "—",
    },
    atmosphere: "Son derece ince CO₂ + muhtemelen O₂.",
    composition: "Eski buz + kaya karışımı; tam farklılaşmamış olabilir. Yüzey, 4 milyar yıllık çarpma izleriyle dolu — sistemin 'fotoğraf albümü'.",
    discovery: "1610 Galileo. Galileo sondası manyetik verilerle iç okyanus olasılığını işaret etti. NASA, Jüpiter sistemine insanlı görev için Callisto'yu 'radyasyon güvenli adı' olarak değerlendiriyor.",
    surface:
      "4 milyar yıldır değişmeyen krater müzesi. Valhalla havzası, 3.800 km'ye uzanan çok halkalı dev bir çarpma izidir. Koyu yüzey radyasyonla işlenmiş organik toz içerir; altındaki okyanusu gizler.",
    description:
      "Güneş Sistemi'nin en kraterli gökcismi — yüzeyi en eski, en az değişmiş. Jüpiter'in şiddetli radyasyon kuşaklarının dışında kaldığı için gelecekteki üsler için en güvenli adaylardan.",
    facts: [
      "Yüzeyi 4 milyar yıldır neredeyse hiç değişmedi; krater yoğunluğu 'zaman yolcusu' gibidir.",
      "Valhalla havzası: çok halkalı dev çarpma izi, 3.800 km'ye ulaşır.",
      "Radyasyon kuşağı dışı konumu, insanlı üs planlarında ilk sıraya koyuyor.",
      "Yarı çapı Merkür'ün %99'u kadar — ama kütlesi çok daha az (buz payı yüksek).",
    ],
    sim: { parentId: "jupiter", a: 0, e: 0.007, inclDeg: 0, periDeg: 0, periodDays: 24, meanAnomaly0: 5.2, radius: 2.8, moonOrbit: 38, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "enceladus",
    name: "Enceladus",
    type: "Uydu",
    color: "#f1f5f5",
    parentName: "Satürn",
    stats: {
      diameter: "504 km",
      mass: "1,08 × 10²⁰ kg",
      gravity: "0,113 m/s²",
      dayLength: "1,37 gün (kilitli)",
      axialTilt: "0°",
      temp: "-201 °C",
    },
    orbitInfo: {
      distance: "237.948 km (Satürn'den)",
      period: "1,37 gün",
      velocity: "12,6 km/sn",
      eccentricity: "0,0047",
      inclination: "0,02°",
      moons: "—",
    },
    atmosphere: "Fıskiyelerden beslenen su buhari 'sırt ekzosferi'.",
    composition: "Buz kabuk + global tuzlu okyanus + kaya çekirdek. Güney kutbunda 'kaplan çizgileri': fıskiyelerin çıktığı 130 km'lik yarıklar.",
    discovery: "1789 Herschel. Cassini 2005'te fıskiyeleri tesadüfen yakaladı; 2014 global okyanusu; 2017 analiz: tuz, silika, metan ve hidrojen — yani hidrotermal kimya. Satürn'ün E halkası Enceladus'un ürünü!",
    surface:
      "Güneş Sistemi'nin en yansıtıcı yüzeyi (albedo ~0,99) — neredeyse saf kar. Güney kutbundaki 130 km'lik 'kaplan çizgileri' yarıklarından 100+ su buzu fıskiyesi sürekli püskürür; saçılan buz parçacıkları Satürn'ün E halkasını besler.",
    description:
      "Küçük ama devrimci: buz fıskiyeleriyle okyanusunu uzaya 'püskürten' ay. Cassini bulutundan geçti ve yaşamın gerektirdiği kimyasalları tek tek buldu: su, enerji, organikler.",
    facts: [
      "Yüzeyi Güneş Sistemi'nin en yansıtıcısı — albedo ~0,99, yani neredeyse saf kar.",
      "Fıskiyelerinden çıkan malzeme Satürn'ün E halkasını tek başına besler.",
      "Hidrojen tespiti: deniz tabanında hidrotermal bacalar olabilir — Dünya'nın derin yaşam sahalarının ikizi.",
      "Sadece 504 km çapında ama global okyanusu uydunun tamamını sarar.",
    ],
    sim: { parentId: "saturn", a: 0, e: 0.0047, inclDeg: 0, periDeg: 0, periodDays: 5, meanAnomaly0: 1.4, radius: 1.6, moonOrbit: 26, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "titan",
    name: "Titan",
    type: "Uydu",
    color: "#d9a860",
    parentName: "Satürn",
    stats: {
      diameter: "5.150 km",
      mass: "1,35 × 10²³ kg",
      gravity: "1,35 m/s²",
      dayLength: "15,9 gün (kilitli)",
      axialTilt: "0,3°",
      temp: "-179 °C",
    },
    orbitInfo: {
      distance: "1,22 mn km (Satürn'den)",
      period: "15,9 gün",
      velocity: "5,6 km/sn",
      eccentricity: "0,029",
      inclination: "0,35°",
      moons: "—",
    },
    atmosphere: "Güneş Sistemi'nin en yoğun uydu atmosferi: 1,45 atm, %95 azot + %5 metan; turuncu organik sis katmanları.",
    composition: "Buz + kaya. Yüzeyde sıvı metan-etan gölleri (Kraken Mare denizden büyük), metan nehirleri ve yağmur döngüsü — hidrolojinin 'soğutulmuş' kopyası.",
    discovery: "1655 Huygens. 2005'te Huygens sondası tarihin en uzak yumuşak inişini yaptı. NASA Dragonfly 2028'de nükleer helikopterle Titan'a uçacak.",
    surface:
      "Turuncu sisle örtülü bir dünya: yüzeyde sıvı metan-etan gölleri (Kraken Mare, Hazar Denizi'nden büyük), metan nehirleri, deltalar ve kum tepeleri. Huygens 2005'te ıslak kum benzeri çakıllara indi — döngüler Dünya'nınkine şaşırtıcı benzer, ama sıvı metandır.",
    description:
      "Dünya'nın 'alternatif evren ikizi': su yerine metan, kaya yerine buz, ama aynı döngüler. Kalın atmosferi ve düşük yerçekimiyle gökyüzünde insan kanat takıp süzülebilirdi.",
    facts: [
      "Yağmur, nehir, delta, göl, deniz — hepsi var; sıvı olarak metan-etan kullanır.",
      "Yüzey basıncı Dünya'dan %50 fazla; atmosfer o kadar yoğun ki insanlar kanatla uçabilirdi.",
      "Kraken Mare, Hazar Denizi'nden büyük: sıvı metan denizi.",
      "Sis altında 'metan yağmuru' ile turuncu alacakaranlık bir dünya.",
    ],
    sim: { parentId: "saturn", a: 0, e: 0.029, inclDeg: 0, periDeg: 0, periodDays: 16, meanAnomaly0: 3.3, radius: 2.9, moonOrbit: 33, moonInclDeg: 1, labelTier: 2 },
  },
  {
    id: "triton",
    name: "Triton",
    type: "Uydu",
    color: "#cfd8dc",
    parentName: "Neptün",
    stats: {
      diameter: "2.707 km",
      mass: "2,14 × 10²² kg",
      gravity: "0,78 m/s²",
      dayLength: "5,9 gün (kilitli, RETROGRAD)",
      axialTilt: "0°",
      temp: "-235 °C",
    },
    orbitInfo: {
      distance: "354.759 km (Neptün'den)",
      period: "5,9 gün (TERS YÖNDE)",
      velocity: "4,4 km/sn",
      eccentricity: "0,000",
      inclination: "157° (retrograd)",
      moons: "—",
    },
    atmosphere: "İnce azot + metan; yüzey buzlarıyla denge.",
    composition: "Kuiper Kuşağı'ndan yakalanmış eski cüce gezegen: kaya + buz; yüzeyde azot ve CO₂ buzları, pembe 'kavun kabuğu' rengi (tholin).",
    discovery: "1846'da Neptün'ün keşfinden yalnızca 17 gün sonra William Lassell. Voyager 2, 1989'da güney kutbunda aktif azot buz fıskiyeleri görüntüledi — şimdiye kadar tek ziyaret.",
    surface:
      "Pembe-gri azot buzu 'kavun kabuğu' topografyası: derinlikleri dolmuş çarpma havzaları, sıra sıra diklikler. Güney kutbundaki siyah fışkirme sütunları, güneşin ısıttığı azot gazının 8 km'ye püskürmesidir — Voyager 2'nin 1989'da görüntülediği aktif dünyalar.",
    description:
      "Ters yönde yörüngede dönen 'esir dünya': retrograd yörünge, kuşağından koparılıp yakalandığının kanıtı. Yakalanma, onu dairesel yörüngeye oturtana kadar Neptün'ü de şiddetle bozdu.",
    facts: [
      "Büyük bir gezegenin etrafında ters yönde dönen tek büyük uydu.",
      "Yörüngesi yavaşça bozuluyor: uzak gelecekte Neptün'ün halkalarına dönüşecek.",
      "-235 °C ile Güneş Sistemi'nin ölçülen en soğuk yüzeylerinden biri.",
      "Buz fıskiyeleri 8 km yükseğe süblime azot gazıyla püskürür.",
    ],
    sim: { parentId: "neptune", a: 0, e: 0, inclDeg: 0, periDeg: 0, periodDays: -12, meanAnomaly0: 2.6, radius: 2.3, moonOrbit: 15, moonInclDeg: 2, labelTier: 2 },
  },
  {
    id: "halley",
    name: "Halley Kuyruklu Yıldızı",
    type: "Kuyruklu Yıldız",
    color: "#bae6fd",
    stats: {
      diameter: "15 × 8 km (patates biçimli çekirdek)",
      mass: "2,2 × 10¹⁴ kg",
      gravity: "~0,0005 m/s²",
      dayLength: "2,2 gün",
      axialTilt: "—",
      temp: "yaklaşım: -70 °C yüzey",
    },
    orbitInfo: {
      distance: "0,59-35 AB (perihel-aphel)",
      period: "75-76 yıl",
      velocity: "perihel 54,6 km/sn · aphel 0,9 km/sn",
      eccentricity: "0,967 (retrograd)",
      inclination: "162°",
      moons: "—",
    },
    atmosphere: "Güneş yaklaştıkça 'coma': süblimeleşen buz + toz bulutu; iyon (plazma) ve toz olmak üzere iki ayrı kuyruk.",
    composition: "Kar-buz-organik-toz 'kirli kar topu'. Güneş Sistemi'nin en ilkel maddesi — 4,6 milyar yıllık donmuş zaman kapsülü.",
    discovery: "Döngüsellik 1705'te Edmond Halley tarafından anlaşıldı (1531, 1607, 1682 kayıtları aynı gökcismiydi!). 1986'da ESA Giotto çekirdeğe 596 km yaklaştı. Sonraki dönüş: 2061 yazı.",
    surface:
      "Çekirdek kömürden siyahtır (albedo ~0,04): kar-buz-organik-toz karışımı bir 'patates' (15 × 8 km). Güneşe yaklaşınca buzlar süblimeleşir, karanlık kabuk altından gaz ve toz jetleri fışkırır — koma ve iki ayrı kuyruk (mavi iyon + sarı toz) böyle doğar.",
    description:
      "En ünlü kuyruklu yıldız: insan ömrü ölçeğinde geri dönen tek parlak kuyruklu yıldız. Çekirdek karanlık ve kömürden siyah; ama güneşe yaklaşınca kuyruğu gecenin en büyüleyici manzarasına dönüşür.",
    facts: [
      "MÖ 240'tan beri her geçişi kayıtlarda: Bayeux Halısı'nda (1066) bile resmedildi.",
      "Her yıl Mayıs'ta Eta Aquariid, Ekim'de Orionid meteor yağmurları Halley'in toz izinden gelir.",
      "1986'da 5 uzay aracı 'Halley filosu' ile uçtu; Giotto çekirdeğin ilk fotoğrafını çekti.",
      "Mark Twain 1835'te bir Halley geçişinde doğdu, 1910'daki bir sonrakinde öldü — 'beraber gideceğim' demişti.",
    ],
    sim: { a: 300, e: 0.72, inclDeg: 25, periDeg: 100, periodDays: -14000, meanAnomaly0: 2.2, radius: 2.2, labelTier: 0 },
  },
  {
    id: "pallas",
    name: "Pallas",
    type: "Asteroit",
    color: "#8f887c",
    stats: {
      diameter: "512 km (~550 × 516 × 476 km)",
      mass: "2,04 × 10²⁰ kg",
      gravity: "0,2 m/s²",
      dayLength: "7,8 saat",
      axialTilt: "~84° (yan yatmış)",
      temp: "-109 °C (ort.)",
    },
    orbitInfo: {
      distance: "414 mn km · 2,77 AB",
      period: "4,6 yıl",
      velocity: "17,6 km/sn",
      eccentricity: "0,231",
      inclination: "34,8° (kuşağın en eğik devi)",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition:
      "İlkel, ayırt edilmemiş (diferansiyasyona uğramamış) C-tipi malzeme: karbonlu kayaç, kil mineralleri ve organik bileşikler. 4,6 milyar yıldır neredeyse hiç ısınmamış bir zaman kapsülü.",
    discovery:
      "28 Mart 1802'de Heinrich Wilhelm Olbers — keşfedilen 2. asteroit (Ceres'ten yalnızca 15 ay sonra). Adını, Yunan savaş tanrıçası Athena'nın 'Pallas' ünvanından alır.",
    surface:
      "Karanlık, kömürden koyu (albedo ~0,09) ve yoğun çarpma kraterli bir yüzey: rengi kirli beton gibidir. Spektrumda kil ve organik madde izleri görülür. Vesta'nın aksine hiçbir zaman eriyip katmanlanmamış, 'donmuş' bir bebek gövdedir — yüzeyi taşlı, pürüzlü ve derin çukurludur.",
    asteroidType: "C — Karbonlu (ilkel, değişmemiş)",
    description:
      "Kuşağın 3. en büyük ve en eğik gezgini: 34,8°'lik yörünge eğimiyle neredeyse Plüton kadar yatık bir düzlemde döner. İçeriği ise 4,6 milyar yıl öncesinin — Güneş Sistemi'nin doğduğu bulutun — hâlâ bozulmamış reçetesidir.",
    facts: [
      "34,8°'lik eğimi, tüm büyük gövdeler içinde Plüton'a en yakın değerdir: Pallas her turda kuşağın 'üstünden ve altından' uçar.",
      "Kendi yörünge ailesi (Pallas ailesi) vardır: üyeleri, gövdeye çarpmış parçaların döküntüsüdür — eğik yörünge bu aileyi kuşağın geri kalanından ayırır.",
      "Ekseni neredeyse yan yatmıştır (~84°): Pallas'ta mevsimler Dünya'nınkine hiç benzemez — kutuplar dönüşümlü olarak yıllarca gündüz, yıllarca gece yaşar.",
      "Ceres, Vesta, Pallas ve Hygiea birlikte kuşak kütlesinin yarısından fazlasını taşır: geri kalan yüz binlerce asteroit neredeyse 'detaydır'.",
    ],
    sim: { a: 182, e: 0.231, inclDeg: 34.8, periDeg: 310, periodDays: 1686, meanAnomaly0: 1.1, radius: 1.8, labelTier: 1 },
  },
  {
    id: "hygiea",
    name: "Hygiea",
    type: "Asteroit",
    color: "#6b655c",
    stats: {
      diameter: "434 km",
      mass: "8,7 × 10¹⁹ kg",
      gravity: "0,09 m/s²",
      dayLength: "13,8 saat",
      axialTilt: "—",
      temp: "-108 °C (ort.)",
    },
    orbitInfo: {
      distance: "470 mn km · 3,14 AB",
      period: "5,6 yıl",
      velocity: "16,5 km/sn",
      eccentricity: "0,112",
      inclination: "3,8°",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition:
      "Karbonlu kondrit (ilkel malzeme): karbonlu kayaç, hidratlı (su taşıyan) mineraller ve muhtemel buz. Kuşağın 4. büyük gövdesi, ama karanlığı yüzünden en geç anlaşılanlardan biri.",
    discovery:
      "12 Nisan 1849'da Napoli'de Annibale de Gasparis — onun dokuz asteroit keşfinin ilki. Adını sağlık tanrıçası Hygieia'dan (Asclepius'un kızı) alır; 'hijyen' kelimesiyle akrabadır.",
    surface:
      "Güneş Sistemi'nin en karanlık büyük yüzeylerinden biri: albedo ~0,07 — gelen ışığın yalnızca %7'sini yansıtır, kömürden siyaha yakın görünür. 2019-20'de VLT interferometresi onu patates biçimli değil, beklenmedik biçimde küresel gösterdi: pürüzsüz, silik kraterli bir küre.",
    asteroidType: "C — Karbonlu (koyu, ilkel)",
    description:
      "Kuşağın 4. büyük gövdesi ve sessiz bir cüce gezegen adayı: küresel formu (hidrostatik denge) cüce gezegen kriterinin ilkini karşılıyor. Ama o kadar karanlıktır ki 170 yıl boyunca biçimi bile anlaşılamadı.",
    facts: [
      "Albedosu ~0,07: Hygiea, Güneş Sistemi'nin en karanlık büyük gövdelerinden biridir — Dünya'dan en güçlü teleskoplarla bile soluk bir noktadır.",
      "2020'de VLT ölçümleri Hygiea'yı neredeyse mükemmel küre buldu: hidrostatik denge kriteri tamam — cüce gezegen ilanı için tek eksik 'uluslararası karar'.",
      "Kendi çarpışma ailesinin anasıdır: Hygiea ailesi üyeleri, eski bir çarpmada kopan parçalardır — belki bu çarpma gövdeyi yeniden küreselleştirdi.",
      "3,14 AB uzaklığıyla kuşağın dış bölümünde gezinir: Jüpiter'e yakın bölgenin karanlık, ilkel sakini.",
    ],
    sim: { a: 186, e: 0.112, inclDeg: 3.8, periDeg: 283, periodDays: 2030, meanAnomaly0: 2.6, radius: 1.6, labelTier: 1 },
  },
  {
    id: "juno",
    name: "Juno",
    type: "Asteroit",
    color: "#a89a84",
    stats: {
      diameter: "254 km (~320 × 267 × 200 km)",
      mass: "2,7 × 10¹⁹ kg",
      gravity: "0,11 m/s²",
      dayLength: "7,2 saat",
      axialTilt: "—",
      temp: "~ -110 °C (ort.)",
    },
    orbitInfo: {
      distance: "400 mn km · 2,67 AB",
      period: "4,4 yıl",
      velocity: "17,9 km/sn",
      eccentricity: "0,257",
      inclination: "13,0°",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition:
      "Silisli kayaç: olivin ve piroksen bakımından zengin, demir-nikel metali içerir. Ayırt edilmiş (diferansiye) bir gövdenin kabuk-manto parçalarıdır — S-tipleri, Dünya'ya düşen taş meteoritlerin çoğunun kaynağıdır.",
    discovery:
      "1 Eylül 1804'te Karl Ludwig Harding — keşfedilen 3. asteroit. Adını Roma tanrıçası Juno'dan (Jüpiter'in eşi) alır: Ceres, Pallas, Juno sırasıyla mitolojik bir aile kuruldu.",
    surface:
      "Kuşağın en parlak S-tiplerinden biri (albedo ~0,23): taşlı, açık gri-kahve bir yüzey. En dikkat çekici özelliği ~100 km çapında dev bir çarpma havzasıdır — 254 km'lik gövdeye oranla muazzam bir yara; belki eski bir protoplanetin katmanlarını açık eden pencere.",
    asteroidType: "S — Silisli (kayaç)",
    description:
      "Kuşağın keşfedilen üçüncü gövdesi ve S-tipi sınıfının büyük temsilcisi: parlak, taşlı, 254 km'lik bir dünya. Yüzeyindeki ~100 km'lik çarpma havzası kuşağın en büyük yaraları arasındadır.",
    facts: [
      "Keşfedilen ilk üç asteroit üç yıl içinde bulundu: Ceres (1801), Pallas (1802), Juno (1804) — üçü de başta 'gezegen' sayıldı.",
      "Yörüngesi S-tipleri arasında alışılmadık derecede eliptik ve eğiktir (e = 0,257, i = 13°): belki geçmişte güçlü bir yörünge bozulması yaşadı.",
      "Albedosu ~0,23 ile karanlık C-tiplerinin yaklaşık üç katı ışık yansıtır: küçük teleskoplarla bile izlenebilen nadir kuşak sakinlerindendir.",
      "S-tipleri, Dünya'ya düşen taş meteoritlerin büyük bölümünün annesidir: Juno bu kimyaya 'klasik' bir örnektir.",
    ],
    sim: { a: 178, e: 0.257, inclDeg: 13, periDeg: 248, periodDays: 1594, meanAnomaly0: 0.9, radius: 1.3, labelTier: 1 },
  },
  {
    id: "psyche",
    name: "Psyche",
    type: "Asteroit",
    color: "#b8b4ac",
    stats: {
      diameter: "226 km (~279 × 232 × 189 km)",
      mass: "2,3 × 10¹⁹ kg",
      gravity: "0,14 m/s²",
      dayLength: "4,2 saat",
      axialTilt: "—",
      temp: "~ -110 °C (ort.)",
    },
    orbitInfo: {
      distance: "437 mn km · 2,92 AB",
      period: "5 yıl",
      velocity: "17,0 km/sn",
      eccentricity: "0,134",
      inclination: "3,1°",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition:
      "Demir-nikel metali ağırlıklı: radar ve spektrum, yüzeyin büyük bölümünün metal olduğunu, kalanının silikat kalıntıları olduğunu gösterir. Patlamış bir protoplanetin açığa çıkmış çekirdeği olduğu düşünülüyor.",
    discovery:
      "17 Mart 1852'de Annibale de Gasparis. Adını Yunan mitolojisinin ruh tanrıçası Psukhe'sinden alır. NASA'nın Psyche sondası Ekim 2023'te fırladı ve Ağustos 2029'da yörüngeye girecek: bir metal dünyayı ziyaret edecek ilk görev.",
    surface:
      "Karanlık ama metalik: albedo ~0,12, S ve C tipleri arasında. Radar yansıması 'parlak metal' imzası taşır; yüzeyde dev çarpma havzaları, alttaki metali çıplaklaştıran yorgun alanlar çizer. Milyarlarca yıllık demir dünyanın fiziği, buzdağı görünümlü metal kayaçlarla okunur.",
    asteroidType: "M — Metalik (demir-nikel çekirdek)",
    description:
      "Güneş Sistemi'nin en garip dünyası: büyük olasılıkla dev bir çarpma, dış kabuğu ve mantosunu soydu; geriye protoplanetin ÇIPLAK METAL ÇEKİRDEĞİ kaldı. Yüzeyindeki demirin değeri ~10¹⁹ dolar tahmin edilir — dünya ekonomisinin kat kat üzerinde ama taşınamaz.",
    facts: [
      "Bilinen en büyük metalik asteroittir: kütlesinin %30-60'ı demir-nikel; kalanı, soyulmayan silikat kalıntılarıdır.",
      "Değer tahmini ~10¹⁹ (10 katrilyon) dolar: tüm dünya ekonomisinin ~100 katı — ama getirme imkânsızlığı, onu güvenli kılar.",
      "NASA Psyche sondası, bir metal gövdeyi ilk kez ziyaret edecek: 2029'da varınca çekirdek oluşumunu, manyetizmayı ve çarpma tarihini inceleyecek.",
      "Psyche'de eski bir manyetik alanın izleri aranıyor: bulursa, bir zamanlar aktif jeodinamosu olan 'minik Dünya' demektir.",
      "4,2 saatlik hızlı dönüşü, metal gövdenin dayanım limitini test eder: iç yapısı hakkında dolaylı ama değerli ölçüm sağlar.",
    ],
    sim: { a: 180, e: 0.134, inclDeg: 3.1, periDeg: 202, periodDays: 1825, meanAnomaly0: 4.4, radius: 1.4, labelTier: 1 },
  },
  {
    id: "bennu",
    name: "Bennu",
    type: "Asteroit",
    color: "#4a443e",
    stats: {
      diameter: "490 m (dev değil — top küre!)",
      mass: "7,3 × 10¹⁰ kg",
      gravity: "~0,00008 m/s²",
      dayLength: "4,3 saat",
      axialTilt: "—",
      temp: "gece ~-40 °C · gündüz ~+100 °C",
    },
    orbitInfo: {
      distance: "168,5 mn km · 1,13 AB (Dünya'ya yakın)",
      period: "437 gün",
      velocity: "28,0 km/sn",
      eccentricity: "0,204",
      inclination: "6,0°",
      moons: "0",
    },
    atmosphere:
      "Yok — yerçekimi o kadar zayıf ki atmosfer tutamaz; kaçış hızı yalnızca ~0,2 m/sn'dir: hızlı yürüyerek bile 'uçabilirsin'.",
    composition:
      "Karbonlu ilkel malzeme: kil mineralleri (su taşıyan), ~%4,7 karbon, organik bileşikler, azot ve demir. OSIRIS-REx numunesi, su ve organik molekülleri doğrudan kanıtladı.",
    discovery:
      "11 Eylül 1999'da LINEAR araştırması. 2013'te adını Mısır mitolojisinin Bennu kuşundan aldı. OSIRIS-REx 2016'da fırladı, 20 Ekim 2020'de yüzeye 'dokunup gitti', kapsül 24 Eylül 2023'te Utah çölüne indi.",
    surface:
      "Karanlık, çakıl dolu bir 'top küre': yüzey neredeyse tamamen gevşek kayalarla kaplıdır — bilim ekibi düz 'kumsal' beklerken kaya yığını buldu. Numune, kaya serileri arasındaki küçük boşluk olan Nightingale kraterinden alındı; dokunuş anında sonda yüzeye ~50 cm 'batdı' ve çakıllar havalandı: Bennu'nun bir çakıl yığını (rubble pile) olduğu kanıtlandı.",
    asteroidType: "B — Karbonlu alt sınıf (ilkel, su izli)",
    description:
      "Hem tehlike hem hazine: Dünya'ya yakın (Apollo sınıfı NEO) bir gövde ve aynı zamanda 4,6 milyar yıllık ilkel bir zaman kapsülü. 2182'de çarpma olasılığı ~%0,037 (yaklaşık 1/2.700) — ama insanlık onu en iyi tanıdığı küçük gövdedir: numunesi, su ve organik moleküllerle geldi.",
    facts: [
      "OSIRIS-REx ~121,6 gr numune getirdi (beklenenin 50 katı): analizde su taşıyan kil mineralleri ve organik moleküller doğrulandı.",
      "2182'de çarpma olasılığı ~%0,037 (1/2.700): bilinen en yüksek riskli büyük gövdelerden biridir — yörüngesi yüzyıllar ötesine kadar hassas hesaplandı.",
      "2135'te Dünya'nın yanından Ay mesafesinin 3 katı kadar yakın geçecek: bu 'gravite yardısı', sonraki yörünge hesaplarını kesinleştirecek.",
      "Güneş ısınması kayaları her gün genleştirip büzülüyor: termal yorgunluk, Bennu'yu yavaşça parçalayan gerçek bir jeolojik güç.",
      "Dönüşü yavaş yavaş hızlanıyor (YORP etkisi): milyonlarca yıl içinde parçalanıp yeniden toplanabilir — rubble pile gövdelerin kaderi.",
    ],
    sim: { a: 100, e: 0.204, inclDeg: 6, periDeg: 66, periodDays: 437, meanAnomaly0: 3.1, radius: 0.5, labelTier: 1 },
  },
  {
    id: "ryugu",
    name: "Ryugu",
    type: "Asteroit",
    color: "#5c564e",
    stats: {
      diameter: "900 m",
      mass: "4,5 × 10¹¹ kg",
      gravity: "~0,0001 m/s²",
      dayLength: "7,6 saat",
      axialTilt: "—",
      temp: "gece ~-70 °C · gündüz ~+100 °C",
    },
    orbitInfo: {
      distance: "178 mn km · 1,19 AB",
      period: "474 gün",
      velocity: "27,4 km/sn",
      eccentricity: "0,19",
      inclination: "5,9°",
      moons: "0",
    },
    atmosphere: "Yok.",
    composition:
      "Karbonlu (Cb-tipi) ilkel malzeme: su taşıyan kil mineralleri, karbonatlar, manyetit ve organik bileşikler. JAXA analizi 20'den fazla amino asit ve RNA bazlarından urasili tespit etti.",
    discovery:
      "10 Mayıs 1999'da LINEAR tarafından bulundu; 2015'te adını Japon halk masalındaki Ejder Sarayı Ryūgū'dan aldı: masal kahramanı Urashima Tarō, saraydan bir hazine kutusuyla döner — Hayabusa2 de bir hazine getirdi. Sonda 2018-19'da iki kez yüzeye dokundu, kapsül 5 Aralık 2020'de Avustralya'ya indi.",
    surface:
      "Çıkrık gibi dönen elmas biçimli bir gövde: hızlı dönüş (7,6 saat), malzemeyi ekvatora doğru kaydırıp şişkin bir sırt yaratmış. Yüzeyi kaya ve çakılla kaplı; en çarpıcı özellik 7-17 m çaplı 300'den fazla geylik (çarpma kaynaklı oyuk): bunlar, altında boşluklar barındıran gevşek bir çakıl yığınının üstüne yüzen örtünün kanıtıdır. Hayabusa2'nin bıraktığı patlayıcı yapay bir krater açtı; ikinci dokunuş, güneş hiç görmemiş taze malzemeyi aldı.",
    asteroidType: "Cb — Karbonlu (rubble pile)",
    description:
      "Bir 'deniz sarayı' kadar gizemli bir dünya: parçalanıp yeniden toplanmış bir çakıl yığını. Hayabusa2 numunesi, Güneş Sistemi'nin en eski kimyasal arşivini Dünya'ya getirdi: amino asitler ve su içeren mineraller — yaşamın hammaddesi uzayda yaygın.",
    facts: [
      "Hayabusa2 iki kez numune aldı: ikinci dokunuş, yapay kraterden fırlayan ve milyarlarca yıldır güneş görmemiş 'ilkel' topraktandı.",
      "2023 analizinde 20'den fazla amino asit ve RNA'nın yapı taşı urasil bulundu: yaşamın yapı blokları, küçük karbonlu asteroitlerde bolca mevcut.",
      "Ortalama yoğunluğu ~1,2 g/cm³: çakıllar arasında dev boşluklar var — içi 'sünger' gibi bir rubble pile.",
      "Yüzeydeki 7-17 m çaplı 300+ geylik, çarpma kaynaklı oyuklardır: katı bir kayanın değil, gevşek yığının davranışının kanıtı.",
      "Adı Ejder Sarayı'ndan gelir: 'hazine kutusu' metaforu, numune kapsülü için resmi simge olarak seçildi.",
    ],
    sim: { a: 104, e: 0.19, inclDeg: 5.9, periDeg: 331, periodDays: 474, meanAnomaly0: 5.2, radius: 0.55, labelTier: 1 },
  },
];

export const TYPE_COLORS: Record<BodyType, string> = {
  "Yıldız": "#fbbf24",
  "Karasal Gezegen": "#34d399",
  "Gaz Devi": "#f59e0b",
  "Buz Devi": "#2dd4bf",
  "Cüce Gezegen": "#c084fc",
  "Uydu": "#cbd5e1",
  "Asteroit": "#a8a29e",
  "Kuyruklu Yıldız": "#7dd3fc",
};

/** Simülasyon ölçek sabitleri */
export const SIM = {
  belt: { inner: 186, outer: 216, count: 240, minPeriod: 1200, maxPeriod: 3000 },
  kuiper: { inner: 468, outer: 565, count: 420 },
  /** Varsayılan kamera sığdırma yarıçapı */
  defaultFit: 490,
} as const;
