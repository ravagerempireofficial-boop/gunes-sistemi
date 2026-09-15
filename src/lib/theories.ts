/**
 * Bilimsel Teoriler v3 — animasyonlu anlatım verileri.
 *
 * 49 teori; her biri uzun (90-160 sn), aşamalı (aşırı yumuşak çok katmanlı
 * geçişli), küçük bilgi balonları (notes) ve sinematik ses efekti ipuçları
 * (cues) ile tanımlıdır. cues: animasyondaki zaman oranı (0-1) itibarıyla
 * tetiklenen sesler. notes: ekranda belirip kaybolan küçük etiketler.
 * Veri dosyaları kategorilere ayrılmıştır (src/lib/theory-data/*).
 */

import { N, C } from "./theory-data/helpers";
import { EXTRA_STAGES } from "./theory-data/extended-stages";
import { DEEP_STAGES } from "./theory-data/deep-stages";

export type SfxName =
  | "boom"
  | "explosion"
  | "supernova"
  | "crash"
  | "starform"
  | "whoosh"
  | "rumble"
  | "crack"
  | "rain"
  | "shimmer"
  | "merge"
  | "wind"
  | "chime"
  | "bell"
  | "warp"
  | "zap"
  | "glitch"
  | "cell"
  | "pop"
  | "hiss"
  | "splash"
  | "lava"
  | "freeze"
  | "grow"
  | "engine";

export interface TheoryStage {
  /** Aşamanın bitiş noktası (0-1) */
  until: number;
  title: string;
  text: string;
  era: string;
}

export interface TheoryNote {
  t0: number;
  t1: number;
  text: string;
  /** Ekran oranı (0-1) */
  x: number;
  y: number;
}

export interface TheoryCue {
  t: number;
  sfx: SfxName;
  power?: number;
}

export interface TheoryDef {
  id: string;
  title: string;
  subtitle: string;
  /** Toplam süre (saniye) — v3: uzun ve çok detaylı */
  duration: number;
  color: string;
  /** Kategori: kosmoloji | fizik | gokyuzu | jeoloji | yasam | gelecek */
  cat: "kosmoloji" | "fizik" | "gokyuzu" | "jeoloji" | "yasam" | "gelecek";
  stages: TheoryStage[];
  notes: TheoryNote[];
  cues: TheoryCue[];
  ticker: string[];
  /**
   * Uzatma sonrası aşama kaynak haritası: yeni indeks → orijinal aşama
   * indeksi (özel sahne çizici için). -1 = ekstra bölüm (evrensel sahne).
   */
  originMap?: number[];
}

/* --------------------------- Bölüm uzatma motoru -------------------------- */

/**
 * extendStages — teoriye ekstra bölümler ekler ve HER ŞEYİ yeniden hizalar:
 * · Ekstra bölümler son özet bölümünden önceye yerleştirilir
 * · Orijinal bölümlerin göreli süreleri KORUNUR (oranlı küçülme)
 * · notes ve cues zamanları yeni zaman çizgisine doğrusal remap edilir
 * · originMap üretilir (özel sahneler kaybolmaz)
 * · duration orantılı olarak uzar → animasyon daha yavaş akar
 */
function extendStages(t: TheoryDef, extras: TheoryStage[]): TheoryDef {
  if (extras.length === 0) return t;
  const orig = t.stages;
  const n = orig.length;
  if (n < 2) return t;

  const spans = orig.map((s, i) => s.until - (i ? orig[i - 1].until : 0));
  const extraSpan = 1 / n; // ortalama orijinal bölüm süresi
  const W = 1 + extras.length * extraSpan;

  // Yeni sıra: head (0..n-2) → extras → tail (n-1)
  const order: Array<{ stage: TheoryStage; origin: number; span: number }> = [];
  for (let i = 0; i < n - 1; i++)
    order.push({ stage: orig[i], origin: i, span: spans[i] });
  for (const ex of extras)
    order.push({ stage: { ...ex, until: 0 }, origin: -1, span: extraSpan });
  order.push({ stage: orig[n - 1], origin: n - 1, span: spans[n - 1] });

  let acc = 0;
  const stages: TheoryStage[] = [];
  const originMap: number[] = [];
  const cumBefore: number[] = []; // her yeni bölümün başlangıç ağırlığı
  for (const it of order) {
    cumBefore.push(acc);
    acc += it.span;
    stages.push({ ...it.stage, until: acc / W });
    originMap.push(it.origin);
  }

  // Orijinal zaman → yeni zaman (bölüm içindeki oran korunur)
  const remap = (tOld: number): number => {
    let idx = orig.findIndex((s) => tOld <= s.until - 1e-9);
    if (idx === -1) idx = n - 1;
    const st0 = idx === 0 ? 0 : orig[idx - 1].until;
    const f = Math.min(1, Math.max(0, (tOld - st0) / spans[idx]));
    // Orijinal bölümün yeni dizideki konumu
    const newPos = order.findIndex((o) => o.origin === idx);
    return (cumBefore[newPos] + f * spans[idx]) / W;
  };

  return {
    ...t,
    stages,
    originMap,
    notes: t.notes.map((nt) => ({
      ...nt,
      t0: remap(nt.t0),
      t1: remap(nt.t1),
    })),
    cues: t.cues.map((cu) => ({ ...cu, t: remap(cu.t) })),
    duration: Math.round(t.duration * W),
  };
}

export const THEORIES_CORE: TheoryDef[] = [
  {
    id: "gunesin-dogusu",
    cat: "gokyuzu",
    title: "Bulutsu Hipotezi · Güneş'in Doğuşu",
    subtitle:
      "Dev moleküler buluttan füzyon reaktörüne — çöküş, disk, jetler ve ateşlenme",
    duration: 80,
    color: "#fbbf24",
    stages: [
      { until: 0.14, title: "Dev Moleküler Bulut", text: "Soğuk (-260 °C) hidrojen ve toz bulutu, kendi ağırlığıyla çökmeye başlıyor. Tetikleyici büyük olasılıkla komşu bir süpernovanın şok dalgasıydı — buluta 'dokunan' dalga, yerçekiminin kazanmasını sağladı.", era: "4,6 milyar yıl önce" },
      { until: 0.32, title: "Çöküş ve Dönüş", text: "Bulut küçüldükçe açısal momentum korunumuyla hızlanıyor: merkezde yoğunlaşan gaz, çevresinde dönen geniş bir kütle halinde spiralle çekiliyor. Sıcaklık yükselmeye başlıyor.", era: "4,6 milyar yıl önce" },
      { until: 0.52, title: "Proto-Güneş ve Birikim Diskevi", text: "Merkezde proto-Güneş parlıyor; çevresinde gaz-toz diski düzleşiyor. Diskte toz taneleri birbirine yapışıyor: önce milimlik topaklar, sonra kilometrelik planetesimaller — gezegenlerin ilk tuğlaları.", era: "4,59 milyar yıl önce" },
      { until: 0.72, title: "Kutup Jetleri ve T Tauri Dönemi", text: "Yeni yıldız, kutuplarından dev gaz jetleri fışkırıyor. Manyetik alan, diskin iç kenarından maddeyi yukarı-aşağı kanalize ediyor: T Tauri patlamaları diski ısıtıp karartıyor.", era: "4,58 milyar yıl önce" },
      { until: 0.86, title: "Füzyon Ateşleniyor", text: "Çekirdek 15,7 milyon °C'ye ulaşınca hidrojen helyuma dönüşmeye başlar: Güneş doğar. Çekirdekte her saniye 600 milyon ton hidrojen yanar — ışık, yüzeye on binlerce yılda çıkar.", era: "4,57 milyar yıl önce" },
      { until: 1, title: "Rüzgâr Süpürüyor, Gezegenler Kuruluyor", text: "Genç Güneş'in şiddetli rüzgârı diskin artık gazını süpürür: gezegen büyümesi durur. Geriye kaya-buz-toz kalır — bir sonraki milyonlar gezegenlerin inşaat yıllarıdır.", era: "4,5 milyar yıl önce" },
    ],
    notes: [
      N(0.02, 0.1, "hidrojen molekülü (H₂)", 0.18, 0.28),
      N(0.05, 0.13, "süpernova şok dalgası", 0.72, 0.2),
      N(0.2, 0.3, "spiralle çöken gaz", 0.5, 0.75),
      N(0.38, 0.5, "proto-Güneş", 0.5, 0.3),
      N(0.44, 0.55, "birikim diski", 0.76, 0.66),
      N(0.56, 0.7, "kutup jeti (manyetik kanal)", 0.5, 0.14),
      N(0.62, 0.72, "planetesimal tuğlalar", 0.24, 0.62),
      N(0.76, 0.85, "FÜZYON: H → He", 0.5, 0.38),
      N(0.88, 0.97, "güneş rüzgârı", 0.78, 0.34),
    ],
    cues: [
      C(0.001, "rumble", 0.5),
      C(0.14, "whoosh", 0.7),
      C(0.32, "rumble", 0.8),
      C(0.52, "wind", 0.6),
      C(0.7, "chime", 0.5),
      C(0.72, "boom", 1),
      C(0.86, "shimmer", 0.9),
      C(0.9, "wind", 0.8),
    ],
    ticker: [
      "Bulutun çöküşü yaklaşık 100.000 yıl sürdü — evrenin göz açıp kapayana kadar olan bir anı.",
      "En eski katı taneler (CAI'lar) 4,567 milyar yaşında: Güneş Sistemi'nin doğum belgesi.",
      "Proto-Güneş, bugünkünden %70 daha sönüktü: 'genç Güneş paradoksu' bu yüzden ünlüdür.",
      "Diskte sıcaklık 0,4 AU'da 1.500 °C'nin üzerindeydi: orada ancak kaya ve metal sağlam kalabildi.",
      "Kutup jetleri saatte yüz binlerce km hızla akar: genç yıldızların imzasıdır, ALMA bugün onları fotoğraflar.",
      "Füzyon başladığında yıldız bir 'ana kol' yıldızı olur: kararlılığı 10 milyar yıl sürecek demektir.",
      "Güneş rüzgârı diski 10-100 milyon yılda temizledi: büyüme penceresi kapanabildi.",
      "Güneş kütlesinin %99,86'sını tek başına taşır: gezegenler, kozmik ölçekte birer artıktır.",
    ],
  },
  {
    id: "dunyanin-olusumu",
    cat: "jeoloji",
    title: "Dünya'nın Oluşumu",
    subtitle:
      "Tozdan planetesimale, planetesimalden katmanlı gezegene — akresyonun tam filmi",
    duration: 85,
    color: "#a3e635",
    stages: [
      { until: 0.12, title: "Toz ve Buz Çökelmesi", text: "Güneş çevresindeki diskte, karasal bölgede mikron boyutlu toz taneleri statik elektrikle birbirine yapışıyor: ev sahibi gezegenin ilk tohumları buğulanıyor.", era: "4,57 milyar yıl önce" },
      { until: 0.3, title: "Planetesimal Çağı", text: "Kilometrelik gövdeler kütleçekimiyle birbirini çekiyor: çarpışmalar bazen yumuşak birleşme, bazen parçalanma ile bitiyor. 'Kaçak büyüme' başlar — kazananlar kazandıkça kazanır.", era: "4,55 milyar yıl önce" },
      { until: 0.5, title: "Eriyen Proto-Dünya", text: "Büyüyen gövde çarpma ısısı ve radyoaktif bozunumla tamamen eriyor: binlerce km derinlikte bir magma okyanusu. Gezegen, dönen kızıl bir eriyik topu.", era: "4,52 milyar yıl önce" },
      { until: 0.68, title: "Demir Batıyor: Katmanlar Doğuyor", text: "Ağır demir-nikel, magma okyanusunda damlacıklar halinde merkeze süzülüyor: çekirdek ayrışıyor. Hafif silikatlar yüzeye yüzer — manto ve kabuk kurulur.", era: "4,5 milyar yıl önce" },
      { until: 0.84, title: "Jeodinamo Ateşleniyor", text: "Dönen sıvı dış çekirdek, elektrik akımlarıyla bir manyetik kalkan üretir: jeodinamo. Bu görünmez kalkan olmadan güneş rüzgârı atmosferi süpürüp götürürdü.", era: "4,5 milyar yıl önce" },
      { until: 1, title: "Soğuyan Yüzey, Kalan Isı", text: "İlk kabuk parçaları yüzer, meteor yağmurları sürer. İçerideki ısı hiç tükenmez: bugün bile manto 500-3.700 °C ile levhaları yılda 2-10 cm sürükler.", era: "4,45 milyar yıl önce" },
    ],
    notes: [
      N(0.02, 0.1, "toz tanesi — mikron", 0.2, 0.3),
      N(0.16, 0.27, "planetesimal — kilometre", 0.72, 0.26),
      N(0.24, 0.32, "yumuşak birleşme", 0.46, 0.68),
      N(0.38, 0.48, "magma okyanusu", 0.5, 0.74),
      N(0.56, 0.66, "demir damlaları batıyor", 0.6, 0.6),
      N(0.72, 0.8, "jeodinamo: manyetik kalkan", 0.3, 0.3),
      N(0.88, 0.97, "ilk kabuk parçaları", 0.7, 0.72),
    ],
    cues: [
      C(0.001, "rumble", 0.4),
      C(0.13, "pop", 0.6),
      C(0.2, "pop", 0.7),
      C(0.26, "boom", 0.5),
      C(0.32, "rumble", 0.9),
      C(0.52, "merge", 0.8),
      C(0.62, "rumble", 0.7),
      C(0.7, "shimmer", 0.8),
      C(0.86, "chime", 0.6),
    ],
    ticker: [
      "Dünya, 10-100 milyon yıllık 'kaçak birleşme' sürecinin sonunda kuruldu.",
      "Ay büyüklüğünde protogezegenler bile katıldı: son büyük katkı Theia çarpmasıydı.",
      "Çekirdek, gezegen yarıçapının %55'ine kadar iner: oradaki basınç 3,6 milyon atmosferdir.",
      "Manyetik alan olmasaydı güneş rüzgârı atmosferi süpürürdü: Mars'ın başına tam olarak bu geldi.",
      "Hafif elementler (silisyum, oksijen, alüminyum) yüzeye yüzdü: kıtaların atası böyle doğdu.",
      "Dünya'nın toplam kütlesinin ~%32'si demirdir: çoğu çekirdekte, manyetik alanın motorunda.",
      "Gezegen 'soğudu' sanılır; manto bugün bile konveksiyon yapıyor: depremler ve volkanlar kanıtı.",
      "Her çarpışma gezegeni büyüttü: en büyük çarpışmaların ısısı bugün hâlâ içeride saklı.",
    ],
  },
  {
    id: "buyuk-carpma",
    cat: "gokyuzu",
    title: "Ay'ın Doğuşu: Büyük Çarpma",
    subtitle:
      "Theia ile Dünya'nın çarpışması, iç içe geçiş, moloz halkası ve milyar yılların hızlandırılmış filmi",
    duration: 95,
    color: "#e879f9",
    stages: [
      { until: 0.1, title: "Theia Yaklaşıyor", text: "Mars büyüklüğünde bir protoplanet (adı Theia), genç Dünya ile aynı yörünge bölgesini paylaşıyor; L4/L5 noktasından sürüklenerek her gün biraz daha yaklaşıyor.", era: "4,51 milyar yıl önce" },
      { until: 0.2, title: "Son Dakikalar", text: "Karşılıklı kütleçekimi iki gövdeyi de deforme ediyor: gelgit tümsekleri yükseliyor, Dünya'nın yüzeyi çatırdıyor. Saatte ~40.000 km'lik kapanma hızı.", era: "4,51 milyar yıl önce" },
      { until: 0.34, title: "ÇARPIŞMA", text: "Çarpma anı: enerji, bugünkü güneş ışığının yıllarca Dünya'ya düşeninin toplamından fazla. Kaya buharlaşarak uzaya fışkırıyor; şok dalgası iki gövdeyi baştan aşağı dolaşıyor.", era: "4,51 milyar yıl önce" },
      { until: 0.5, title: "İç İçe Geçiş", text: "Theia'nın demir çekirdeği Dünya'nın içine gömülüp kaynaşıyor: iki çekirdek tek bir eriyik kütlede iç içe geçiyor. Dış katmanlar ise uzaya savruluyor.", era: "4,51 milyar yıl önce" },
      { until: 0.64, title: "Moloz Halkası", text: "Savrulan kızgın enkaz, Dünya çevresinde geniş bir halkada toplanıyor. Halkanın iç kenarı Roche sınırında parçalanıp besleniyor: halka genişliyor ve soğuyor.", era: "4,51 milyar yıl önce" },
      { until: 0.8, title: "Hızlanma: Milyarlar Geçiyor", text: "Zaman 1.000 kez hızlanıyor: halkadaki parçacıklar birleşip Ay'ı kuruyor. Genç Ay, bugünkünden 15 kat yakın görünüyordu — gökyüzünde dev bir ateş kütlesi.", era: "4,5 → 4,4 milyar yıl önce" },
      { until: 1, title: "Sakinleşen Sistem", text: "Ay yılda ~3,8 cm uzaklaşıyor, Dünya soğuyor, gelgit sürtünmesi 6 saatlik günü uzatıyor. Çarpmanın izi bugün Ay'ın küçük çekirdeğinde ve bizim 24 saatimizde.", era: "4,4 milyar yıl önce → bugün" },
    ],
    notes: [
      N(0.02, 0.09, "Theia — Mars boyutunda", 0.78, 0.3),
      N(0.12, 0.18, "saatte 40.000 km", 0.5, 0.16),
      N(0.24, 0.32, "ÇARPIŞMA ANI", 0.5, 0.2),
      N(0.38, 0.46, "şok dalgası", 0.72, 0.6),
      N(0.52, 0.6, "iç içe geçen çekirdekler", 0.44, 0.6),
      N(0.66, 0.75, "moloz halkası (Roche sınırı)", 0.5, 0.16),
      N(0.82, 0.9, "zaman ×1000 — Ay birleşiyor", 0.74, 0.24),
      N(0.93, 0.99, "bugün: 384.400 km", 0.76, 0.72),
    ],
    cues: [
      C(0.001, "rumble", 0.4),
      C(0.1, "whoosh", 0.9),
      C(0.17, "rumble", 0.9),
      C(0.2, "explosion", 1),
      C(0.215, "boom", 1),
      C(0.34, "merge", 0.9),
      C(0.5, "rumble", 0.6),
      C(0.64, "shimmer", 0.8),
      C(0.8, "chime", 0.7),
      C(0.92, "whoosh", 0.4),
    ],
    ticker: [
      "Theia çarpması Dünya yüzeyini saniyeler içinde magma okyanusuna çevirdi.",
      "Ay'ın demir çekirdeği orantısız küçüktür: Ay, iki gezegenin demirce fakir DIŞ katmanlarından kuruldu.",
      "Apollo 11'in getirdiği 21,5 kg taş, üç klasik Ay teorisini çökertip büyük çarpmayı tahta çıkardı.",
      "Oksijen izotopları (¹⁶O/¹⁷O/¹⁸O) Dünya ile Ay'da ikiz gibi: iki gövdenin malzemesi karışmıştı.",
      "Çarpma öncesi Dünya günü ~6 saatti: Ay'ın gelgit sürtünmesi onu 24 saate uzattı.",
      "Ay her yıl 3,8 cm uzaklaşıyor: ölçüm, Apollo ayak izlerine dikilen lazer reflektörlerle yapılır.",
      "2019 Durham simülasyonları: çarpma ~1 saat sürdü, Ay tek parça halinde bile doğabilir.",
      "Ay, Dünya'nın eksen eğikliğini dengeler: onsuz iklim kutuplardan ekvatora savrulurdu.",
      "Theia adı, Ay tanrıçası Selene'in annesinden gelir: bilim, mitolojiyle el sıkıştı.",
    ],
  },
  {
    id: "okyanuslarin-dogusu",
    cat: "jeoloji",
    title: "Okyanusların ve Atmosferin Doğuşu",
    subtitle:
      "Volkanik gazlar, uçsuz bucaksız sağanaklar ve ilk su havzaları",
    duration: 75,
    color: "#67e8f9",
    stages: [
      { until: 0.16, title: "Kızgın Volkanik Dünya", text: "Kabuk yeni katılaşmışken binlerce volkan su buharı, CO₂, azot ve kükürt püskürtüyor: ikincil atmosfer, iç gücümüzle katman katman kuruluyor.", era: "4,4 milyar yıl önce" },
      { until: 0.34, title: "Buhar Tavanı", text: "Atmosfer su buharıyla doyuyor: yüzeyin üzerinde kilometrelerce kalın, ışığı kesen bir bulut örtüsü. Yüzey 100 °C'nin altına ininceye kadar yağmur yere ulaşamaz.", era: "4,4 milyar yıl önce" },
      { until: 0.56, title: "Milyon Yıllık Sağanak", text: "Kritik eşik aşıldı: yağmur binlerce yıl kesintisiz yağıyor. Kabuktaki çukurlar doluyor — dünyanın ilk okyanusları. Zircon mineralleri bu anı 4,4 milyar yıldır saklıyor.", era: "4,4 → 4,2 milyar yıl önce" },
      { until: 0.76, title: "Buzlu Gövdeler Geliyor", text: "Dış diskten gelen buzlu asteroit ve kuyruklu yıldızlar ikinci su tedarikini getiriyor. Çarpmalar acıtır ama suyu taşır: D/H izotop oranı kometsel suyla uyuşur.", era: "4,1 milyar yıl önce" },
      { until: 1, title: "Mavi Gezegen", text: "Okyanuslar yerleşti, atmosfer karardı-ısındı-dengeye girdi. Ortalama 3,7 km derinlikli bir su örtüsü: yaşamın sahnesi, ilk perdesini açıyor.", era: "4,0 milyar yıl önce" },
    ],
    notes: [
      N(0.03, 0.13, "su buharı (H₂O) püskürüyor", 0.7, 0.28),
      N(0.2, 0.3, "CO₂ + azot atmosferi", 0.24, 0.24),
      N(0.38, 0.5, "yüzey < 100 °C: yağmur başlıyor", 0.5, 0.14),
      N(0.6, 0.7, "ilk okyanus havzaları", 0.3, 0.72),
      N(0.8, 0.9, "buzlu gövde çarpması", 0.76, 0.2),
      N(0.93, 0.99, "ortalama derinlik 3,7 km", 0.5, 0.78),
    ],
    cues: [
      C(0.001, "rumble", 0.6),
      C(0.16, "hiss", 0.8),
      C(0.34, "hiss", 0.6),
      C(0.38, "rain", 1),
      C(0.56, "rain", 0.5),
      C(0.76, "boom", 0.6),
      C(0.8, "splash" as SfxName, 0.7),
      C(0.9, "chime", 0.7),
    ],
    ticker: [
      "Dünya'nın suyu büyük olasılıkla iki kaynaklıdır: volkanik gazdan yoğunlaşan + buzlu gövdelerle taşınan.",
      "Jack Hills'teki 4,4 milyar yıllık zircon kristalleri, suyun sandığımızdan çok erken var olduğunu kanıtlar.",
      "Okyanuslar yüzeyin %71'ini kaplar ama toplam kütlesi gezegenin yalnızca %0,02'sidir.",
      "İlkin atmosferde serbest oksijen yoktu: oksijen 2,4 milyar yıl önce siyanobakterilerle geldi.",
      "Kuiper buzullarının D/H oranı okyanusumuzunkine benzer: kometsel su izi taşıyoruz.",
      "Atmosferin %78'i azottur: volkanik mirasımızın en kalıcı parçası.",
      "Everest okyanusa atılsaydı zirvesi 2 km su altında kalırdı.",
    ],
  },
  {
    id: "yasin-dogusu",
    cat: "yasam",
    title: "Yaşamın Doğuşu",
    subtitle:
      "Kimyasal evrimden ilk hücreye, oksijen devriminden Kambriyen patlamasına",
    duration: 85,
    color: "#34d399",
    stages: [
      { until: 0.14, title: "İlkin Çorba ve Şimşekler", text: "Okyanusta organik moleküller birikiyor: Miller-Urey deneyi (1952), şimşek enerjisinin bir haftada 11 amino asit üretebildiğini gösterdi. Hayatın hammaddesi pişiyor.", era: "4,0 → 3,8 milyar yıl önce" },
      { until: 0.32, title: "Hidrotermal Bacalar", text: "Okyanus tabanındaki bacalar mineral gözenekli kafesler kurar: moleküller hapsolur, ısıl ve kimyasal enerji akışı RNA benzeri zincirleri besler. Laboratuvar bu günü taklit etmeye çalışıyor.", era: "3,8 milyar yıl önce" },
      { until: 0.5, title: "İlk Hücre: LUCA", text: "Yağ zarları baloncuklar kurar; içeride kalıtım + metabolizma birleşir. Tüm yaşamın son ortak atası (LUCA) doğar: DNA, ATP ve 20 amino asit alfbesi hepimizin mirasıdır.", era: "3,7 milyar yıl önce" },
      { until: 0.68, title: "Oksijen Devrimi", text: "Siyanobakteriler fotosentezle oksijen üretir: önce pas olarak okyanusa kaydedilir, sonra gökyüzü değişir. Anaerobik dünyanın en büyük yok oluşu — ve bizim kapımız.", era: "2,4 milyar yıl önce" },
      { until: 0.86, title: "Çok Hücrelilik", text: "Hücreler işbirliğine geçer: mitokondri (eski bakteri) içeri taşınır (endosimbiyoz, ~1,8 milyar yıl önce). Yumuşak gövdeli denizanasılar okyanuslarda süzülmeye başlar.", era: "1,2 milyar → 600 milyon yıl önce" },
      { until: 1, title: "Kambriyen Patlaması", text: "541 milyon yıl önce ~25 milyon yıllık bir sürede hayvan formları patlar: trilobitler, yumuşakçalar, deniz zambakları. Evrimin hız rekoru — modern hayvan şemaları kurulur.", era: "541 milyon yıl önce" },
    ],
    notes: [
      N(0.02, 0.12, "şimşek: enerji kaynağı", 0.3, 0.16),
      N(0.08, 0.16, "amino asitler oluşuyor", 0.66, 0.62),
      N(0.2, 0.3, "hidrotermal baca", 0.7, 0.8),
      N(0.38, 0.48, "LUCA: ilk hücre", 0.5, 0.34),
      N(0.56, 0.66, "O₂: önce zehir, sonra nefes", 0.3, 0.2),
      N(0.74, 0.84, "endosimbiyoz: mitokondri", 0.68, 0.66),
      N(0.9, 0.99, "Kambriyen patlaması", 0.5, 0.14),
    ],
    cues: [
      C(0.001, "rumble", 0.3),
      C(0.04, "crack", 0.8),
      C(0.09, "crack", 0.7),
      C(0.14, "hiss", 0.5),
      C(0.32, "pop", 0.6),
      C(0.42, "pop", 0.5),
      C(0.5, "chime", 0.8),
      C(0.68, "shimmer", 0.8),
      C(0.86, "chime", 0.6),
      C(0.94, "shimmer", 0.7),
    ],
    ticker: [
      "LUCA'nın izleri tüm canlılarda ortaktır: aynı DNA, aynı ATP, aynı 20 amino asit alfbesi.",
      "Miller-Urey şişesinde 1 haftada 11 amino asit oluştu: yaşamın hammaddesi kolayca pişer.",
      "Stromatolitler: 3,5 milyar yıllık siyanobakteri yatakları — dünyanın en eski fosil kaydı.",
      "Oksijen önce 'zehir' sayıldı: en büyük yok oluş, aynı zamanda oksijenli nefesin kapısıydı.",
      "Mitokondriniz bir zamanlar serbest bakteriydi: hücre içi işbirliği 1,8 milyar yıl önce başladı.",
      "Kambriyen patlaması ~25 milyon yılda çoğu hayvan filumunu çıkardı: evrimin hız rekoru.",
      "Yaşam, Dünya'nın doğuşundan ~600-800 milyon yıl sonra başladı: evrende belki de kolay adım.",
      "Bugün 8,7 milyon tür yaşar: hepsi tek bir 4,2 milyar yıllık aile ağacının dalları.",
    ],
  },
  {
    id: "saturnun-halkalari",
    cat: "gokyuzu",
    title: "Satürn'ün Halkaları",
    subtitle:
      "Roche limitinde parçalanan buzlu bir uydu — gezegenin üzerindeki buz perdesi",
    duration: 75,
    color: "#ffe6b3",
    stages: [
      { until: 0.16, title: "Genç Satürn", text: "Satürn, dev gazını toplayalı çok olmuş; ama çevresi bugünkü gibi çıplak değildir — henüz büyük halkalar yoktur, yalnızca kalabalık buzlu uydular döner.", era: "~4,4 milyar yıl önce" },
      { until: 0.34, title: "Yörünge Bozuluyor", text: "Göç eden dev gezegenlerin çekimi, buzlu bir uydunun yörüngesini bozar: Satürn'e giderek yaklaşır. Gelgit kuvvetleri gövdeyi esnetip ısıtmaya başlar.", era: "milyonlarca yıl önce" },
      { until: 0.5, title: "Roche Limitinde Parçalanma", text: "Kritik çizgi (Roche limiti): gelgit kuvveti artık buzun kendi çekimini yener. Uydu, saatler süren bir süpürmeyle milyarlarca buz parçasına ayrılır — şok dalgası buz fısıltısı yayar.", era: "anlık" },
      { until: 0.7, title: "Halka Yayılıyor", text: "Parçalar Satürn'ün ekvator düzleminde ince bir pervaz halinde yayılır: çarpışmalar yörüngeleri daireselleştirir. Genişlik 280.000 km — ama kalınlık çoğu yerde ~10 metre!", era: "hızlandırılmış süreç" },
      { until: 0.86, title: "Çoban Uydular ve Zarlar", text: "Kalan enkazdan küçük 'çoban' uydular doğar: Pan ve Daphnis halkalarda boşluk açar (Cassini boşluğu). Halka, gevezelik eden bir buz orkestrasına dönüşür.", era: "sonraki milyonlar" },
      { until: 1, title: "Bugün: Yaşlı Bir Eser", text: "Cassini verisi halkaların genç olduğunu söyler: belki 10-100 milyon yaşında ve yavaş yavaş 'halka yağmuru'yla kayboluyor. Onları görmek, doğru zamanda doğmuş olmaktır.", era: "bugün" },
    ],
    notes: [
      N(0.03, 0.13, "buzlu uydu — gövdesi kaya + buz", 0.74, 0.28),
      N(0.22, 0.32, "gelgit kuvvetleri esnetiyor", 0.3, 0.24),
      N(0.42, 0.52, "ROCHE LİMİTİ", 0.5, 0.16),
      N(0.56, 0.68, "280.000 km genişlik · ~10 m kalınlık", 0.5, 0.72),
      N(0.74, 0.84, "çoban uydular boşluk açıyor", 0.7, 0.3),
      N(0.92, 0.99, "halkalar: 10-100 milyon yaşında", 0.28, 0.24),
    ],
    cues: [
      C(0.001, "shimmer", 0.4),
      C(0.16, "whoosh", 0.8),
      C(0.34, "rumble", 0.8),
      C(0.46, "crack", 0.8),
      C(0.5, "explosion", 0.9),
      C(0.52, "boom", 0.8),
      C(0.7, "shimmer", 0.9),
      C(0.86, "chime", 0.6),
    ],
    ticker: [
      "Halkaların %95'inden fazlası su buzdur: kaya oranı yok denecek kadar azdır.",
      "Genişlik 280.000 km, kalınlık çoğu yerde ~10 metre: bir futbol sahasının kenarına futbol sahası boyu ince bir kağıt.",
      "Roche limiti: gelgitin kütleçekimi yendiği çizgi — ötesinde uydu, berisinde enkaz.",
      "Cassini boşluğunu 1675'te Giovanni Cassini gördü: 4.800 km genişliğinde bir pencere.",
      "Daphnis'in kenar dalgaları 1,5 km yükselir: 8 km'lik bir ay, 500 m'lik bir boşlukta 'kar küremesi' yapar.",
      "Halka yağmuru: halkalar saniyede yüzlerce kg buzla Satürn'e düşüyor — sonsuza dek sürmeyecek.",
      "Satürn'ün 'yüzücüler' adlı bantları halkaları andırır: ama asıl gösteri ekvator pervazındadır.",
    ],
  },
  {
    id: "marsin-kaderi",
    cat: "gokyuzu",
    title: "Mars'ın Kaderi",
    subtitle:
      "Nehirlerin ölümü: manyetik kalkan nasıl sustu, atmosfer nasıl süpürüldü?",
    duration: 80,
    color: "#fb923c",
    stages: [
      { until: 0.18, title: "Genç Mars: Yaşayan Dünya", text: "4 milyar yıl önce Mars yağmurlu, nehirli, göllü bir gezegendi: kalın bir CO₂ atmosferi ısı tutuyor, Jezero ve Gale kraterlerinde deltalar birikiyordu.", era: "4 milyar yıl önce" },
      { until: 0.36, title: "Jeodinamo Sönüyor", text: "Mars küçüktür: çekirdeği hızlı soğur, sıvı demir akışları durur. Manyetik kalkan söner — güneş rüzgârı artık engelsizdir. Sismik kanıt: InSight'ın dinlediği mars depremleri.", era: "4,1 → 3,8 milyar yıl önce" },
      { until: 0.56, title: "Rüzgâr Süpürüyor", text: "Yüzyıllar boyunca güneş rüzgârı, korumasız atmosferi iyonize edip uzaya taşır: MAVEN ölçtü — saniyede 2-3 kg gaz kaybı. Hava seyrekleşir, ısı kaçar, su donar-buhar olur-gider.", era: "3,8 → 3,5 milyar yıl önce" },
      { until: 0.74, title: "Soğuk Çöl", text: "Ortalama -63 °C, basınç Dünya'nınkinin %0,6'sı: sıvı su kararlı değil. Ama buzda saklı su vardır — kutuplarda ve ekvator altı toprakta kilometrelerce derinde.", era: "bugün" },
      { until: 1, title: "Ders: Bir Kalkanın Değeri", text: "Mars, Dünya'nın büyüklüğü yüzünden kaybetti: küçük gövde hızlı soğur. Manyetik kalkan, görünmez bir atmosfer sigortasıdır — Dünya'nın jeodinamosu hâlâ öder.", era: "bugün ve sonrası" },
    ],
    notes: [
      N(0.03, 0.14, "nehir deltaları: Jezero", 0.68, 0.66),
      N(0.22, 0.34, "çekirdek soğuyor: jeodinamo ölümü", 0.3, 0.26),
      N(0.44, 0.54, "güneş rüzgârı: sn'de 2-3 kg gaz", 0.5, 0.14),
      N(0.62, 0.72, "-63 °C · %0,6 basınç", 0.7, 0.3),
      N(0.8, 0.92, "su buzda saklı — kutuplarda", 0.3, 0.72),
    ],
    cues: [
      C(0.001, "chime", 0.4),
      C(0.18, "wind", 0.6),
      C(0.36, "rumble", 0.5),
      C(0.38, "wind", 0.9),
      C(0.56, "wind", 1),
      C(0.74, "whoosh", 0.5),
      C(0.84, "chime", 0.5),
    ],
    ticker: [
      "Mars, Dünya yarıçapının yarısı kadardır: küçük gövde hızlı soğur, kalkan erken söner.",
      "MAVEN sondası, atmosferin bugün bile saniyede 2-3 kg kaybolduğunu ölçtü.",
      "Valles Marineris 4.000 km uzanır: nehirlerin değil, tektonik gerilmenin yarasıdır.",
      "Olympus Mons 21,9 km: gezegen küçülünce volkanlar devleşir (yüzey alanı az, yük az).",
      "Curiosity, Gale kraterinde göl tortulları buldu: Mars bir zamanlar balık tutulabilecek kadar suyunu barındırdı.",
      "Kutup buzulları CO₂ ve H₂O buzudur: mevsimlerle nefes alır gibi büyür-küçülür.",
      "Perseverance'ın topladığı boru örnekleri bir gün Dünya'ya dönebilir: Mars'ın yaşanıp yaşamadığının mahkemesi.",
    ],
  },
  {
    id: "jupiterin-dogusu",
    cat: "gokyuzu",
    title: "Jüpiter'in Doğuşu ve Büyük Göç",
    subtitle:
      "Buz çekirdekten gaz devine — Grand Tack manevrası ve güneş sistemini şekillendiren yolculuk",
    duration: 80,
    color: "#ffd9a8",
    stages: [
      { until: 0.18, title: "Buz-Kaya Çekirdeği", text: "Kar hattının ötesinde buz sağlamdır: 10 Dünya kütlesinde bir kaya-buz çekirdeği, diskin en dışında hızla büyür. Kütleçekimi çevresindeki gazı tutmaya başlar.", era: "4,55 milyar yıl önce" },
      { until: 0.38, title: "Gaz Akresyonu: Dev Doğuyor", text: "Çekirdek, hidrojen-helyumu saniyede tonlarca çeker: örtü gazı devasa bir atmosfere dönüşür. Kütle çekirdeği geçer — Jüpiter artık bir gaz devidir: kütlesi 318 Dünya.", era: "4,54 milyar yıl önce" },
      { until: 0.56, title: "Göç: Güneş'e Doğru", text: "Disk gazı, gezegeni yavaşça içeri sürükler: Jüpiter, bugünkü Mars'ın yörüngesine kadar ilerler (1,5 AU). 'Grand Tack' — bir yelkenlinin manevrası gibi dönüp geri döner.", era: "hızlandırılmış" },
      { until: 0.74, title: "Satürn'le Rezonans ve Geri Dönüş", text: "Satürn'le 2:1 rezonansa girer: iki dev, disk gazını iterek birlikte dışarı kayar. Yolda Kuiper'in içini tarar, karasal bölgeye enkaz yağdırır: Büyük Bombardıman'ın belki de nedeni.", era: "hızlandırılmış" },
      { until: 1, title: "Bugün: Sistemin Kalkanı", text: "Jüpiter bugün 95 uydulu bir mini sistemdir: Io'nun volkanları, Europa'nın okyanusu... Ve kozmik bir süpürge: kuyruklu yıldız Shoemaker-Levy 9'un 1994'te onun yüzüne çarpması, kalkan rolünün canlı kanıtıydı.", era: "bugün" },
    ],
    notes: [
      N(0.03, 0.14, "kaya + buz çekirdek (~10 Dünya)", 0.28, 0.3),
      N(0.24, 0.36, "hidrojen örtüsü birikiyor", 0.7, 0.24),
      N(0.44, 0.54, "Grand Tack: içeri yelken", 0.5, 0.14),
      N(0.62, 0.72, "Satürn ile 2:1 rezonans", 0.3, 0.68),
      N(0.8, 0.92, "95 uydu · mini güneş sistemi", 0.7, 0.3),
    ],
    cues: [
      C(0.001, "rumble", 0.4),
      C(0.18, "rumble", 0.7),
      C(0.38, "whoosh", 0.9),
      C(0.56, "whoosh", 0.7),
      C(0.74, "boom", 0.6),
      C(0.88, "chime", 0.6),
    ],
    ticker: [
      "Jüpiter, diğer TÜM gezegenlerin toplamından 2,5 kat ağırdır.",
      "10 Dünya kütlelik çekirdek, 'çekirdek akresyonu' modelinin temelidir.",
      "Grand Tack modeli (2011): Mars'ın küçüklüğünü ve asteroit kuşağının karışımını tek hamlede açıklar.",
      "Jüpiter'in manyetosferi Dünya'nınkinden 20.000 kat güçlüdür: Europa'yı şımarır, Ganymede'yi aşılar.",
      "Büyük Kırmızı Leke en az 190 yıldır dönüyor: Dünya'yı yutabilecek bir fırtına.",
      "1994 Shoemaker-Levy 9: 21 parça, gezegen yüzünde kıtalar boyu izler bıraktı — ilk canlı izlenen çarpışma.",
      "Io: Güneş Sistemi'nin en volkanik gövdesi — gelgit ısınmasıyla kaynar.",
      "Europa'nın buz altı okyanusu Dünya okyanuslarının toplamından fazla su tutabilir.",
    ],
  },
  {
    id: "gunesin-olumu",
    cat: "gokyuzu",
    title: "Güneş'in Ölümü ve Sistemin Kaderi",
    subtitle:
      "Kırmızı dev, gezegenimsi nebula, beyaz cüce — evimizin 5 milyar yıllık finali",
    duration: 90,
    color: "#f87171",
    stages: [
      { until: 0.12, title: "Bugün: Dengeli Yıldız", text: "Güneş, çekirdekteki yerçekimi ile füzyon basıncının tam dengede olduğu bir ana-kol yıldızıdır. Ömrünün ~yarısındadır: her saniye 4 milyon ton kütlesini ışığa çevirir.", era: "bugün" },
      { until: 0.3, title: "Yavaş Isınma", text: "Helyum küllü çekirdeği sıkışıp ısınır: parlaklık her 1,1 milyar yılda ~%10 artar. 1-1,5 milyar yıl sonra 'nemli sera' başlar — okyanuslar buharlaşmaya yazar.", era: "+1,5 milyar yıl" },
      { until: 0.48, title: "Kırmızı Dev", text: "Çekirdek hidrojeni tükenir: dış katmanlar şişer ve soğur. Yarıçap ~0,85 AU'ya ulaşır — Merkür ve Venüs yutulur. Dünya sınırda: ya yutulur ya da eriyik bir kaya olarak kalır.", era: "+5 milyar yıl" },
      { until: 0.66, title: "Helyum Flaşı ve Pulsasyon", text: "Helyum çekirdeği 100 milyon K'de aniden tutuşur: dakikalar içinde milyar kat parlaklık. Güneş pulsasyonla dış katmanlarını sallamaya başlar.", era: "+5,2 milyar yıl" },
      { until: 0.84, title: "Gezegenimsi Nebula", text: "Dış katmanlar zarif bir bulut olarak uzaya savrulur: karbon, azot, oksijen — yaşamın hammaddesi — yıldızlararası buluta karışır. Merkezde çıplak çekirdek kalır.", era: "+5,4 milyar yıl" },
      { until: 1, title: "Beyaz Cüce: Uzun Soğuma", text: "Dünya boyutunda, ~1 ton/cm³ yoğunlukta bir beyaz cüce: bir çay kaşığı bir filin ağırlığında. Milyarlarca yıl boyunca soluklaşır — sistemin son ışığı, soğuk bir elmas gibi.", era: "+5,5 milyar yıl → sonsuz" },
    ],
    notes: [
      N(0.02, 0.1, "denge: basınç = yerçekimi", 0.5, 0.16),
      N(0.16, 0.28, "parlaklık +%10 / 1,1 milyar yıl", 0.72, 0.26),
      N(0.36, 0.46, "yarıçap ~0,85 AU", 0.28, 0.24),
      N(0.56, 0.66, "helyum flaşı: dakikalar!", 0.5, 0.16),
      N(0.72, 0.82, "gezegenimsi nebula", 0.72, 0.6),
      N(0.9, 0.99, "beyaz cüce: 1 ton/cm³", 0.5, 0.72),
    ],
    cues: [
      C(0.001, "chime", 0.4),
      C(0.12, "rumble", 0.4),
      C(0.3, "wind", 0.7),
      C(0.48, "rumble", 1),
      C(0.66, "boom", 0.9),
      C(0.84, "shimmer", 1),
      C(0.92, "chime", 0.5),
    ],
    ticker: [
      "Güneş ömrünün ~%50'sini tamamladı: 5 milyar yıl, insanlık tarihinin ~16.000 katı.",
      "Kırmızı dev Güneş gökyüzünde 200 kat büyük görünür: gezegenimsi nefes alır gibi şişer.",
      "Dünya kurtulsa bile yüzey erimiş kayadır: bugünkü Venüs'ün bile ötesinde bir cehennem.",
      "Helyum flaşı ısıyı çekirdekte tutar: dış katmanlar patlamayı 'hissetmez'.",
      "Gezegenimsi nebulalar evrenin en güzel nesneleridir: Ring Nebula, Butterfly — Güneş'imizin de böyle gideceği.",
      "Savrulan karbon-azot-oksijen sonraki yıldızların ve gezegenlerin hammaddesidir: kozmik geri dönüşüm.",
      "Beyaz cüce 'siyah cüce' olması ~10^15 yıl sürer: evren 13,8 milyar yaşında — henüz hiç yoktur.",
      "Jüpiter ve ötesi, Güneş'in kütle kaybıyla genişleyen yörüngelere kayar: dış sistem donmuş arşiv olur.",
    ],
  },
  {
    id: "pangea-tektonik",
    cat: "jeoloji",
    title: "Kıtaların Yolculuğu: Pangea ve Tektonik",
    subtitle:
      "Magma okyanusundan ilk kabuğa, Rodinya'dan Pangea'ya, bugünkü haritaya — gezegenin yaşayan derisi",
    duration: 80,
    color: "#f59e0b",
    stages: [
      { until: 0.16, title: "İlk Kabuk Doğuyor", text: "Magma okyanusu yüzeyde katılaşır: ilk bazaltik kabuk parçaları yüzer. Altındaki manto kaynar — konveksiyon hücreleri, kabuğu yüzen bir lastik zar gibi sürükler.", era: "4,4 milyar yıl önce" },
      { until: 0.34, title: "Süper Kıta Döngüsü", text: "Kabuk parçaları çarpışıp süper kıtalar kurar, sonra içlerine akan ısıyla yeniden parçalanır: döngü ~400-600 milyon yılda bir tekrarlanır. Rodinya (~1,1 milyar yıl önce) bunların bilinen en eskilerindendir.", era: "1,1 milyar yıl önce" },
      { until: 0.52, title: "Pangea: Tek Kıta", text: "~335 milyon yıl önce tüm kıtalar tek bir dev kıtada toplanır: Pangea. Etrafı tek bir okyanus (Panthalassa) sarar. İç kesimleri çöldür: okyanusa kilometrelerce uzak.", era: "335 milyon yıl önce" },
      { until: 0.7, title: "Kırılma: Atlantik Açılıyor", text: "Altında biriken ısı Pangea'yı çatlatır: kıtalar sürüklenmeye başlar. Atlantik Okyanusu bir yarıktan doğar — bugün hâlâ yılda 2-3 cm genişliyor.", era: "200 → 66 milyon yıl önce" },
      { until: 0.86, title: "Himalayalar Yükseliyor", text: "Hindistan, Asya'ya çarpılır: iki kıtanın kenarları katlanır, Everest 8.849 m'ye tırmanır. Çarpışma hâlâ sürüyor — dağ her yıl milimetreler uzuyor.", era: "50 milyon yıl önce → bugün" },
      { until: 1, title: "Bugün ve Gelecek", text: "Levhalar yılda 2-10 cm sürer — tırnak uzatan hızda. 250 milyon yıl sonra yeni bir süper kıta (Pangea Ultima?) kurulacak: döngü hiç durmaz, gezegenin derisi yaşar.", era: "bugün → +250 milyon yıl" },
    ],
    notes: [
      N(0.03, 0.13, "ilk kabuk: yüzen bazalt", 0.3, 0.28),
      N(0.22, 0.32, "Rodinya — bilinen ilk süper kıtalar", 0.7, 0.24),
      N(0.42, 0.52, "Pangea · Panthalassa", 0.5, 0.14),
      N(0.6, 0.7, "Atlantik: yılda 2-3 cm açılıyor", 0.5, 0.74),
      N(0.76, 0.86, "Hindistan-Asya çarpışması", 0.28, 0.3),
      N(0.9, 0.99, "hız: tırnak kadar — 2-10 cm/yıl", 0.5, 0.2),
    ],
    cues: [
      C(0.001, "rumble", 0.5),
      C(0.16, "rumble", 0.6),
      C(0.34, "whoosh", 0.5),
      C(0.52, "crack", 0.7),
      C(0.7, "rumble", 0.8),
      C(0.86, "boom", 0.5),
      C(0.94, "chime", 0.5),
    ],
    ticker: [
      "Levha tektoniği, bildiğimiz kadarıyla Güneş Sistemi'nde tektir: Dünya'nın imzası.",
      "Manto konveksiyonu: saniyede birkaç santimetre akan kaya, gezegenin iç ısısını dışarı taşır.",
      "Depremler levha sınırlarının gürültüsüdür: Pasifik 'Ateş Çemberi' bunun en canlı sahnesidir.",
      "Atlantik genişledikçe Pasifik daralır: 200 milyon yıl sonra Pasifik kapanmış olabilir.",
      "Afrika Rift Vadisi yarıyor: milyonlarca yıl sonra yeni bir okyanus doğuyor — bizim kızımız.",
      "Kıtalar 'yıldız gemisi' gibi yaşayan ekosistem taşır: ayrılmaları türleri ayrıştırdı (karşılaştır: Avustralya keseleri).",
      "Karbon döngüsü tektonikle çalışır: volkanik CO₂ vs silikat havası — gezegen termostatı.",
      "Everest hâlâ yükseliyor: çarpışma bitmedi, dağ 'nefes almaya' devam ediyor.",
    ],
  },
];

/* ------------------------- kategori verilerinin birleşimi ------------------ */

import { COSMOS_THEORIES } from "./theory-data/cosmos";
import { PHYSICS_THEORIES } from "./theory-data/physics";
import { EARTH_THEORIES } from "./theory-data/earth";
import { LIFE_THEORIES } from "./theory-data/life";
import { EVOLUTION_THEORIES } from "./theory-data/evolution";
import { FERMI_THEORIES } from "./theory-data/fermi";

/** TÜM teoriler (çekirdek 10 + 39 kategori teorisi) — kitaplık sırası.
 *  Her teori +5 ekstra +4 derinlik bölümle uzatılır (toplam 441 yeni aşama).
 */
export const THEORIES: TheoryDef[] = (
  [
    ...COSMOS_THEORIES, // 1-8 Büyük Patlama → Simülasyon
    ...PHYSICS_THEORIES, // 9-15 Newton → Holografik
    ...THEORIES_CORE.filter((t) => t.id === "gunesin-dogusu"), // 16 Bulutsu
    ...EARTH_THEORIES, // 17-20, 22-25
    ...THEORIES_CORE.filter((t) => t.id === "pangea-tektonik"), // 21 Tektonik
    ...LIFE_THEORIES, // 26-30
    ...EVOLUTION_THEORIES, // 31-36
    ...FERMI_THEORIES, // 37-41
    ...THEORIES_CORE.filter(
      (t) => t.id !== "gunesin-dogusu" && t.id !== "pangea-tektonik"
    ), // bonus: 8 güneş sistemi teorisi
  ] as TheoryDef[]
).map((t) =>
  extendStages(t, [...(EXTRA_STAGES[t.id] ?? []), ...(DEEP_STAGES[t.id] ?? [])])
);

export function getTheory(id: string): TheoryDef | undefined {
  return THEORIES.find((t) => t.id === id);
}
