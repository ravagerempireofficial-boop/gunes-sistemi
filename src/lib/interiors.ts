/**
 * Bilgi Havuzu — İç yapı katmanları, bölgeler ve galaksi verileri.
 * INTERIORS: her gökcismi için gerçek ölçülere dayalı iç yapı kesiti
 * REGIONS: 3D sahnede işaretlenerek seçilebilen bölgeler/sınırlar/sondalar
 */

export interface InteriorLayer {
  /** Katman adı */
  name: string;
  /** Dış sınırın gezegen yarıçapına oranı (%) */
  pct: number;
  /** Görsel renk */
  color: string;
  /** Sıcaklık aralığı */
  temp: string;
  /** Kalınlık + bileşim detayı (km) */
  detail: string;
}

export interface InteriorProfile {
  intro: string;
  layers: InteriorLayer[];
}

export const INTERIORS: Record<string, InteriorProfile> = {
  sun: {
    intro:
      "Güneş, katmanlardan oluşan dev bir füzyon reaktörüdür. Enerji çekirdekte doğar; radyatif bölgede fotonlar on binlerce yıl zıplayarak ilerler, konvektif bölgede ise sıcak plazma yükselip soğuyarak taşınır.",
    layers: [
      { name: "Çekirdek (Füzyon Bölgesi)", pct: 25, color: "#fff3c4", temp: "15,7 milyon °C", detail: "Yarıçap ~174.000 km · Her saniye 600 milyon ton hidrojen → helyum (füzyon)" },
      { name: "Radyatif Bölge", pct: 70, color: "#ffd24d", temp: "2-7 milyon °C", detail: "0,35-0,7 R☉ (~350.000 km) · Fotonlar burada on binlerce yıl sürtünerek dışarı sızar" },
      { name: "Konvektif Bölge", pct: 97, color: "#ff9a1f", temp: "~2 milyon → 5.500 °C", detail: "~200.000 km kalınlık · Kaynayan plazma hücreleri (granüller ~1.000 km)" },
      { name: "Fotosfer", pct: 100, color: "#ffb45e", temp: "5.505 °C", detail: "~500 km · 'Görünür yüzey' — güneş lekeleri 3.800 °C'ye kadar soğur" },
    ],
  },
  mercury: {
    intro:
      "Ay'a benzeyen küçük görüntüsünün altında dev bir çekirdek gizlidir: Merkür'ün yarıçapının %85'i demir çekirdektir. Bu yüzden metal açısından Güneş Sistemi'nin en zengin gökcismidir.",
    layers: [
      { name: "İç Çekirdek (Katı Demir)", pct: 40, color: "#8a8480", temp: "~2.000 °C", detail: "Yarıçap ~1.000 km · Sıvı dış çekirdeğin ortasında katı demir kristali" },
      { name: "Dış Çekirdek (Sıvı Fe-S)", pct: 85, color: "#a89a8a", temp: "~1.800 °C", detail: "~640 km kalınlık · Demir-kükürt eriyiği; zayıf manyetik alan üretir" },
      { name: "Manto", pct: 96, color: "#8f7a6a", temp: "~1.000 °C", detail: "Sadece ~600 km silikat manto — gezegenin büyüklüğüne göre çok ince" },
      { name: "Kabuk", pct: 100, color: "#b8aca0", temp: "-173 → +427 °C", detail: "35-40 km bazaltik kabuk · Kraterli, loblu skarp (fesih) uçurumlarıyla kaplı" },
    ],
  },
  venus: {
    intro:
      "Dünya'nın ikizi boyut olarak, ama iç yapısı kadar. Ağır bazaltik kabuğunun altında kaynayan manto, onun altında Dünya benzeri demir çekirdek vardır. Levha tektoniği yoktur — ısı kabuktaki dev volkanlarla atılır.",
    layers: [
      { name: "Çekirdek (Demir-Nikel)", pct: 50, color: "#e8b25a", temp: "~5.200 °C", detail: "Yarıçap ~3.200 km · Dünya'nınkine benzer ama manyetik alan üretmiyor (yavaş dönüş)" },
      { name: "Manto", pct: 98, color: "#c98a4a", temp: "~1.500 °C", detail: "~2.800 km silikat manto · 'Kaplama tektoniği': kabuk periyodik olarak içine çöker" },
      { name: "Kabuk", pct: 100, color: "#e3c48f", temp: "+464 °C (yüzey)", detail: "~50 km bazaltik kabuk · 1.600'den fazla büyük volkan — Güneş Sistemi'nin en genç yüzeylerinden" },
    ],
  },
  earth: {
    intro:
      "Bildiğimiz tek yaşanabilir gezegenin içi katmanlı bir soğan gibidir: ince kabukta okyanuslar ve yaşam, mantoda levhaları hareket ettiren konveksiyon, dış çekirdekteki sıvı demirde ise bizi koruyan manyetik alan vardır.",
    layers: [
      { name: "İç Çekirdek (Katı Fe-Ni)", pct: 19, color: "#fff1b8", temp: "~5.400 °C (Güneş yüzeyi kadar!)", detail: "Yarıçap 1.220 km · Basınç 3,6 milyon atm — demir burada katı kalır" },
      { name: "Dış Çekirdek (Sıvı Fe-Ni)", pct: 55, color: "#f2b544", temp: "4.000-5.000 °C", detail: "1.220-3.480 km · Dönen sıvı demir → jeodinamo → manyetik alan (auroraların kaynağı)" },
      { name: "Manto", pct: 98, color: "#c1663a", temp: "500-3.700 °C", detail: "~2.890 km kalın, hacmin %84'ü · Sıcak kayanın konveksiyonu levhaları yılda 2-10 cm sürükler" },
      { name: "Kabuk", pct: 100, color: "#7da86a", temp: "-89 → +57 °C", detail: "Okyanuslarda 5-10 km, kıtalarda 30-70 km · Üzerinde 1,4 milyar km³ su ve tek bilinen yaşam" },
    ],
  },
  moon: {
    intro:
      "Ay, dev bir çarpmanın parçalarından doğduğu için Dünya'ya benzer ama küçük çekirdekli bir yapıya sahiptir. İçi büyük ölçüde soğumuş, katılaşmıştır.",
    layers: [
      { name: "Çekirdek", pct: 20, color: "#d8c8a8", temp: "~1.500 °C", detail: "Yarıçap ~350 km · Kısmen erimiş küçük demir çekirdek — Dünya'ya göre çok küçük" },
      { name: "Manto", pct: 96, color: "#a89a90", temp: "~1.000 °C", detail: "Kısmen erimiş silikat manto · Derin ay sarsıntıları burada oluşur" },
      { name: "Kabuk", pct: 100, color: "#c8c4bc", temp: "-173 → +127 °C", detail: "~34-43 km anortozit kabuk · Üstünde koyu 'maria' lav ovaları ve 30.000+ krater" },
    ],
  },
  mars: {
    intro:
      "NASA'nın InSight sondası 2022'de Mars'ın içini depremlerle taradı: orta boy bir çekirdek, büyük bir manto ve ince bir kabuk. Sönmüş bir jeodinamo, ama geçmişte manyetik alanı ve kalın atmosferi vardı.",
    layers: [
      { name: "Çekirdek (Sıvı Fe-S)", pct: 53, color: "#e8a85a", temp: "~1.900 °C", detail: "Yarıçap ~1.830 km · Sıvı, kükürt bakımından zengin — InSight sismik verisiyle ölçüldü" },
      { name: "Manto", pct: 96, color: "#b8603a", temp: "~1.500 °C", detail: "~1.560 km · Artık aktif konveksiyon yok; volkanlar (Olympus Mons 21,9 km) sönmüş durumda" },
      { name: "Kabuk", pct: 100, color: "#d8824a", temp: "-140 → +20 °C", detail: "24-72 km · Kuzeyde ince, güneyde kalın · Demir oksit (pas) tozuyla kaplı" },
    ],
  },
  jupiter: {
    intro:
      "Katı yüzeyi yoktur: gaz devinin içine doğru batarak basınç, hidrojeni önce sıvı okyanusa, sonra elektrik iletken metalik hidrojene dönüştürür. En derinde belki de Dünya büyüklüğünde seyreltik bir kaya-buz çekirdeği vardır.",
    layers: [
      { name: "Seyreltik Kaya-Buz Çekirdeği", pct: 12, color: "#e8c890", temp: "~36.000 °C", detail: "~10 Dünya kütlesi · Juno verisi: keskin değil, metalik hidrojenle karışmış 'erimiş' çekirdek" },
      { name: "Metalik Hidrojen Manto", pct: 78, color: "#d8a868", temp: "10.000-36.000 °C", detail: "Derin %70 · Basınç hidrojeni metalleştirir — bu katman Güneş Sistemi'nin en güçlü manyetik alanını üretir" },
      { name: "Sıvı Moleküler H-He", pct: 97, color: "#c89455", temp: "2.000-10.000 °C", detail: "Binlerce km derinlik · Sıvı hidrojen-helyum okyanusu; atmosfere yumuşakça geçer" },
      { name: "Bulut Atmosferi", pct: 100, color: "#e8d0a8", temp: "-145 °C (tepe)", detail: "~1.000 km · Amonyak bulut bantları, 600 km/sa jet akıntıları, Büyük Kırmızı Leke (Dünya'dan büyük fırtına)" },
    ],
  },
  saturn: {
    intro:
      "Jüpiter'in küçük kardeşi: onun gibi gaz devi, ama o kadar düşük ortalama yoğunluklu ki suda yüzerdi. İçi metalik hidrojen ve derin bir kaya-buz çekirdeği barındırır.",
    layers: [
      { name: "Kaya-Buz Çekirdeği", pct: 15, color: "#e8d8a0", temp: "~11.700 °C", detail: "~9-22 Dünya kütlesi · Kaya ve buzun sıkıştırılmış karışımı" },
      { name: "Metalik Hidrojen", pct: 50, color: "#d8b878", temp: "8.000-11.700 °C", detail: "Jüpiter'den daha ince metalik katman · Manyetik alanın kaynağı" },
      { name: "Sıvı H-He Okyanusu", pct: 97, color: "#d0a86a", temp: "~1.000-8.000 °C", detail: "Devasa sıvı hidrojen-helyum katmanı · Helyum yağmuru burada damlalar halinde çöker" },
      { name: "Bulut Atmosferi", pct: 100, color: "#e8d8ac", temp: "-178 °C (tepe)", detail: "Soluk altın bantlar, 1.800 km/sa rüzgârlar · Etrafındaki halka sistemi buz parçacıklarından (kabuktan bağımsız)" },
    ],
  },
  uranus: {
    intro:
      "'Buz devi' — hidrojen-helyumdan çok su, metan ve amonyak 'sıcak buzundan' oluşur. Yan yatmış ekseni (98°) muhtemelen dev bir çarpmadan kalan bu farklı iç yapıyla birlikte gizemini koruyor.",
    layers: [
      { name: "Kaya-Buz Çekirdeği", pct: 20, color: "#d8e8d0", temp: "~5.000 °C", detail: "Yarım Dünya kütlesi kadar küçük çekirdek" },
      { name: "Buz Manto (Su-Amonyak-Metan)", pct: 80, color: "#a8d8d0", temp: "2.000-5.000 °C", detail: "~8.000 km kalınlık · Sıcak, sıkışmış 'buz okyanusu' — bazı modellere göre elmas yağmuru burada oluşur" },
      { name: "H-He Atmosferi", pct: 100, color: "#b8f0e8", temp: "-224 °C (en soğuk atmosfer!)", detail: "%80 hidrojen %15 helyum %2 metan · Metan kırmızıyı yutar → camgöbeği görünüm" },
    ],
  },
  neptune: {
    intro:
      "Uranüs'ün ikizi ama daha küçük, daha yoğun ve çok daha dinamik: iç ısı kaynağı sayesinde Güneş Sistemi'nin en hızlı rüzgârları (2.100 km/sa) onun atmosferinde eser.",
    layers: [
      { name: "Kaya-Buz Çekirdeği", pct: 25, color: "#e8d8c0", temp: "~5.400 °C", detail: "Uranüs'ten biraz daha büyük/kütleli çekirdek" },
      { name: "Buz Manto", pct: 82, color: "#88c8c8", temp: "2.000-5.000 °C", detail: "Su-amonyak-metan akışkanı · Belki elmas yağmuru + muhtemel 'süperiyonik buz' okyanusu" },
      { name: "H-He Atmosferi", pct: 100, color: "#7fd4e0", temp: "-218 °C", detail: "Metan bantları, Büyük Karanlık Leke fırtınaları, süpersonik rüzgârlar" },
    ],
  },
  pluto: {
    intro:
      "Küçük ama şaşırtıcı: New Horizons 2015'te Plüton'un içermiş olduğu su buzundan bir okyanusu ve yarıçapının %70'i kadarki kaya çekirdeğini ortaya çıkardı. Yüzeyindeki 'kalp' (Sputnik Planitia) bir azot buzu denizidir.",
    layers: [
      { name: "Kaya Çekirdeği", pct: 70, color: "#c8a888", temp: "~1.700 °C", detail: "Yarıçap ~850 km · Radyoaktif bozunma ısıtıyor — bu ısı okyanusu canlı tutuyor" },
      { name: "Su-Buz Manto + Okyanus", pct: 98, color: "#a8c0d0", temp: "~0-200 °C", detail: "~100-180 km kalınlıkta muhtemel sıvı su okyanusu, üstünde su buzu" },
      { name: "Uçucu Buz Kabuğu", pct: 100, color: "#e8d8c0", temp: "-229 °C", detail: "Azot, metan, CO buzları · Sputnik Planitia: 1.000 km'lik konvektif azot buzu 'kalbi'" },
    ],
  },
  ceres: {
    intro:
      "Asteroit kuşağının en büyüğü ve tek cüce gezegeni. Çıplak gözle değil ama içi ilginç: tuzlu su kalıntılarının (brine) hâlâ yüzeye sızıp sızmadığı merak konusu. Dawn sondası, parlak Ocator kraterindeki tuz birikintilerini çözümledi.",
    layers: [
      { name: "Kaya Çekirdeği", pct: 25, color: "#c8b098", temp: "~700 °C", detail: "Kısmen farklılaşmış kaya çekirdek" },
      { name: "Buzlu Manto", pct: 95, color: "#b8c8c0", temp: "~0 °C", detail: "Su buzu + muhtemel derin tuzlu su kalıntısı (kriyovolkanizmanın kaynağı)" },
      { name: "Tozlu Kabuk", pct: 100, color: "#a89a88", temp: "-105 °C", detail: "Karışık toz-buz kabuk · Parlak tuz yatakları (Ocator) genç kriyovolkan izleri" },
    ],
  },
  europa: {
    intro:
      "Dünya dışındaki en ümit verici yaşam adayı! Buz kabuğunun altında Dünya'nın tüm okyanuslarından daha fazla su barındıran dev bir tuzlu okyanus gizlidir.",
    layers: [
      { name: "Demir Çekirdek", pct: 25, color: "#d8b890", temp: "~1.000 °C", detail: "Demir-nikel çekirdek (muhtemelen kısmen sıvı)" },
      { name: "Kaya Manto", pct: 75, color: "#a89078", temp: "~1.000 °C", detail: "Silikat manto · Suyun tepesindeki okyanusa mineral besler (hidrotermal kimya)" },
      { name: "Tuzlu Okyanus", pct: 92, color: "#88b8c8", temp: "~0 °C", detail: "Kabuğun 15-25 km altında, 60-150 km kalınlıkta — Dünya okyanuslarının 2-3 katı su" },
      { name: "Buz Kabuğu", pct: 100, color: "#d8e0dc", temp: "-160 °C", detail: "15-25 km buz · Yüzeyi çizik çatlaklarla kaplı; Hubble su buharı püskürmeleri gördü" },
    ],
  },
  titan: {
    intro:
      "Kalın atmosferi ve yüzeydeki metan gölleriyle Dünya'nın gizli ikizi. Altında dev bir su okyanusu, üstünde hidrokarbon 'su döngüsü' vardır.",
    layers: [
      { name: "Kaya-Buz Çekirdeği", pct: 55, color: "#c8a878", temp: "~1.000 °C", detail: "Diferansiye olmuş kaya + su buzu çekirdek" },
      { name: "Yüksek Basınçlı Buz + Okyanus", pct: 90, color: "#98c0b8", temp: "~0-100 °C", detail: "Derin yeraltı su-amonyak okyanusu (Cassini gravite verisiyle kanıtlandı)" },
      { name: "Buz Kabuğu", pct: 100, color: "#e0b060", temp: "-179 °C", detail: "~100 km buz kabuk · Üstünde metan-etan gölleri, nehirleri ve yağmurları (Huygens 2005 inişi)" },
    ],
  },
  io: {
    intro:
      "Güneş Sistemi'nin en volkanik gövdesi: Io, Jüpiter'in devasa gelgit çekimiyle her gün yoğrulur; sürtünme ısısı içini eritir. Yüzeyde 400'den fazla aktif volkan, sülfür kaplı sarı-turuncu-kızıl ovalar ve dev lav gölleri — jeolojik olarak 'yaşayan' bir cehennem.",
    layers: [
      { name: "Demir Çekirdek", pct: 50, color: "#e8b25a", temp: "~1.500-2.000 °C", detail: "Yarıçap ~650 km · Demir-sülfür çekirdek; gelgit ısınmasının ürettiği ısının bir bölümü burada toplanır" },
      { name: "Silikat Manto (Magma Okyanusu)", pct: 85, color: "#d9683a", temp: "~1.200-1.500 °C", detail: "~700 km kalınlık · Gelgit ısınmasıyla kısmen erimiş, magma odalarıyla dolu iç — Loki Patera gibi dev lav göllerinin kaynağı" },
      { name: "Sülfür Bileşik Kabuk", pct: 100, color: "#e8d44d", temp: "-130 → +1.300 °C (lavlar)", detail: "20-40 km · Sülfür ve SO₂ buzları: sarı-turuncu-kızıl ovalar, 400+ aktif volkan, 17 km'ye ulaşan dağlar" },
    ],
  },
  ganymede: {
    intro:
      "Güneş Sistemi'nin en büyük uydusu — Merkür'den büyük. Ayırt edici özelliği: kendi manyetik alanını üreten tek uydudur; bu, içinde sıvı ve iletken bir demir çekirdeğin olduğunun kanıtıdır. Buz kabuğunun altında, buz katmanları arasında tuzlu su okyanusları uzanır.",
    layers: [
      { name: "Demir-Sülfür Çekirdek", pct: 30, color: "#e8b25a", temp: "~1.500 °C", detail: "Yarıçap ~700-900 km · Konveksiyon ya da kristalizasyonla jeodinamo çalıştırır: Ganymede'in manyetik alanının kaynağı" },
      { name: "Kaya Manto", pct: 55, color: "#a89078", temp: "~1.000-1.500 °C", detail: "Silikat manto · Radyoaktif ve gelgit ısısını üst katmanlara taşır" },
      { name: "Katmanlı Tuzlu Okyanuslar", pct: 80, color: "#88b8c8", temp: "~0 → -20 °C", detail: "Buz katmanları arasına gömülü, toplam ~800 km kalınlıkta çok katmanlı tuzlu su (Hubble aurora ölçümleriyle kanıtlandı)" },
      { name: "Buz Kabuğu", pct: 100, color: "#d8e0dc", temp: "-163 °C", detail: "~150 km · İki yüzey tipi: koyu, kraterli 'regio'lar (Galileo Regio) ve bükümlü çatlak ovaları 'sulci'" },
    ],
  },
  callisto: {
    intro:
      "Jüpiter'in en dış büyük uydusu ve Güneş Sistemi'nin en eski yüzeylerinden birine sahip gövde: 4 milyar yıldır neredeyse hiç yenilenmemiş. İç kısmı büyük ölçüde farklılaşmamıştır — kaya ve buz birbirine karışmıştır; üstünde muhtemel bir okyanus saklıdır.",
    layers: [
      { name: "Farklılaşmamış Kaya-Buz İç", pct: 40, color: "#8a8478", temp: "~1.000 °C", detail: "Kaya + buz karışımı, homojen değil: Callisto, farklılaşmayı hiç tamamlamamış 'donmuş' bir bebek gövdedir" },
      { name: "Muhtemel Okyanus", pct: 70, color: "#88b8c8", temp: "~0 °C", detail: "~100-150 km derinlikte tuzlu su katmanı — Galileo'nun indüklenmiş manyetik alan ölçümlerinin en olası açıklaması" },
      { name: "Buz + Kaya Kabuğu", pct: 100, color: "#c8c4bc", temp: "-139 °C", detail: "~200-250 km · Güneş Sistemi'nin en yoğun kraterli yüzeyi: 3.800 km'lik Valhalla halka sistemi ve milyarlarca yıllık kraterler" },
    ],
  },
  enceladus: {
    intro:
      "Satürn'ün minik buz uydusu, Güneş Sistemi'nin en şaşırtıcı okyanus dünyası: güney kutbundan fışkıran su buzu jetleri, altındaki küresel okyanusun penceresidir. Cassini bu jetlerin içinden uçarak tuz, silika nanoparçacıkları ve organik moleküller ölçtü — hidrotermal ocakların imzası.",
    layers: [
      { name: "Kaya Çekirdek", pct: 65, color: "#c8a888", temp: "~100-1.000 °C", detail: "Silikat çekirdek · Gelgit sürtünmesi burada ısı üretir; hidrotermal ocaklar okyanusa mineral besler" },
      { name: "Küresel Okyanus", pct: 92, color: "#88b8c8", temp: "~0 °C", detail: "Buz kabuğunun altında her yere uzanan ~10 km derinlik (Cassini gravite + şekil analiziyle kanıtlandı)" },
      { name: "Buz Kabuğu", pct: 100, color: "#e8f0ee", temp: "-201 °C (çizgilerde -120 °C)", detail: "20-30 km · Güney kutbundaki 'kaplan çizgileri'nden su buzu, tuz ve organik moleküllü fıskiyeler püskürür — Satürn'ün E halkasını bunlar besler" },
    ],
  },
  triton: {
    intro:
      "Kuiper Kuşağı'ndan yakalanmış bir esir: retrograd yörüngesi, bir zamanlar cüce gezegen olduğunu anlatır. İç ısı kaynağı kısıtlıdır ama Neptün'ün gelgit sürtünmesi ve radyoaktif bozunum, yüzeyde azot fıskiyelerini besleyecek kadar enerji üretir.",
    layers: [
      { name: "Kaya Çekirdek", pct: 50, color: "#c8a888", temp: "~1.000 °C", detail: "Silikat çekirdek · Radyoaktif bozunum + gelgit ısıtması: belki manto katmanları arasında hâlâ bir sıvı su katmanı saklıdır" },
      { name: "Buz Manto (Su-Amonyak)", pct: 85, color: "#a8c0d0", temp: "~0 → -100 °C", detail: "Su, amonyak ve metan buzları · Amonyak, suyun donma noktasını düşürerek okyanus ihtimalini güçlendirir" },
      { name: "Azot / Su Buz Kabuğu", pct: 100, color: "#e0dcd4", temp: "-235 °C", detail: "Pembe 'kavun kabuğu' azot buzu · Voyager 2'nin 1989'da gördüğü 8 km yükseklikteki azot fıskiyeleri güney kutbundaydı" },
    ],
  },
  haumea: {
    intro:
      "Kuiper Kuşağı'nın ucube cüce gezegeni: 3,9 saatlik bir günle uçurum hızında döner ve bu hız, onu Rugby topu biçimli bir elipsoide çevirmiştir. Yüzeyi yüksek yansıtmalı kristal buzla kaplıdır — iç ısının yüzeye taşıdığı konveksiyonun işareti. 2017'de bir halkası keşfedildi.",
    layers: [
      { name: "Kaya Çekirdek", pct: 35, color: "#c8a888", temp: "~1.000 °C", detail: "Silikat bakımından zengin çekirdek · Yoğunluk (~1,9 g/cm³) kaya oranının yüksek olduğunu gösterir" },
      { name: "Kaya-Buz Manto", pct: 60, color: "#b0c0c8", temp: "~0 → -100 °C", detail: "Kaya ve su buzunun karışımı · İki uydusu (Hi'iaka ve Namaka) ile halkası, eski bir çarpmanın parçalarıdır" },
      { name: "Kristal Buz Kabuğu", pct: 100, color: "#e8f0f4", temp: "-241 °C", detail: "Yüksek albedolu (~0,7) kristalize su buzu · Bu kadar düzenli kristaller, güneş ışığıyla değil iç ısının sürüklediği 'konvektif buz'la açıklanır" },
    ],
  },
  makemake: {
    intro:
      "Kuiper Kuşağı'nın parlak 'ikinci Plüton'u: kırmızımsı yüzeyi metan ve etan buzlarıyla kaplıdır; ince bir metan atmosferi izi vardır. 2015'te Hubble, yanında yüzeyinden 1.300 kat daha karanlık küçük bir uydu (MK 2) buldu.",
    layers: [
      { name: "Kaya Çekirdek", pct: 45, color: "#c8a888", temp: "~1.000 °C", detail: "Silikat çekirdek · Yoğunluk ~1,7 g/cm³: yarı kaya, yarı buz karışımı" },
      { name: "Buz Manto", pct: 75, color: "#b0c0c8", temp: "~0 → -150 °C", detail: "Su buzu manto · Alt katmanlarında ince bir sıvı katman ihtimali tartışılıyor" },
      { name: "Metan / Azot Buz Kabuğu", pct: 100, color: "#d8c0a8", temp: "-239 °C", detail: "Metan-etan buzları + tholinler (kırmızımsı renk) · 2016 örtülme gözlemleri ince bir metan atmosferi izi gösterdi" },
    ],
  },
  eris: {
    intro:
      "Gezegen tanımını deviren gövde: 2005 keşfi, Plüton'un sınıf düşürmesine yol açtı. Plüton'dan daha küçük görünür ama daha kütleli ve daha yoğundur — yani içinde daha çok kaya saklar. Güneş'e 38-97,5 AB arası gidip gelen soğuk ve genç yüzlü bir buz dünyasıdır.",
    layers: [
      { name: "Kaya Çekirdek", pct: 55, color: "#c8a888", temp: "~1.000-1.500 °C", detail: "Plüton'dan daha yoğun (2,43 g/cm³): kaya oranı yüksek · Radyoaktif ısı, mantoda bir okyanusu koruyor olabilir" },
      { name: "Buz Manto", pct: 80, color: "#b0c0c8", temp: "~0 → -150 °C", detail: "Su buzu manto · Yoğunluk ölçümleri kaya-buz ayrımının tamamlandığını gösterir" },
      { name: "Azot-Metan Buz Kabuğu", pct: 100, color: "#e8e4dc", temp: "-243 °C", detail: "Metan buzu + tholinler (gri-kızıl renk) · Yörünge uzakken atmosferdeki azot donup yüzeye çöker: yüzey çok genç ve kratersizdir" },
    ],
  },
  pallas: {
    intro:
      "İlkel bir C-tipi dünya: Pallas, Güneş Sistemi'nin doğduğu bulutun kimyasal tarifini 4,6 milyar yıldır neredeyse hiç değiştirmeden taşır. Kuşağın büyükleri arasında en az işlenmiş gövdedir — hiçbir zaman eriyip katmanlanmamış olabilir; içi, kondrit meteoritlerinin annesi gibi durur.",
    layers: [
      { name: "Küçük Metalik Çekirdek", pct: 35, color: "#e8b25a", temp: "~500-1.000 °C", detail: "Belki hiç farklılaşmamış: iç, metal oranının düşük olduğu homojen bir kaya-buz karışımı olabilir" },
      { name: "Karbonlu Silikat Manto", pct: 70, color: "#8a8478", temp: "~100-500 °C", detail: "Karbonlu kondrit benzeri kayaç · Kil mineralleri, organik bileşikler ve su izleri barındırır" },
      { name: "Koyu Tozlu Kabuk", pct: 100, color: "#8f887c", temp: "-109 °C", detail: "Albedo ~0,09 ile kömürden koyu · Kil + organik + karbon kaplı; radar, taşlı ve derin çukurlu bir yüzey gösterir" },
    ],
  },
  hygiea: {
    intro:
      "Kuşağın 4. büyük gövdesi ve sessiz cüce gezegen adayı: 2019-20 VLT görüntüleri, Hygiea'nın beklenmedik biçimde küresel olduğunu gösterdi. Bu, ya iç ısının gövdeyi 'yuvarlaklaştırdığını' ya da gövdenin çarpışma sonrası çakılların yeniden toplanmasıyla (rubble pile) oluştuğunu düşündürür — küreselleşme ile rubble pile tartışması sürüyor.",
    layers: [
      { name: "Belki Metal Çekirdek", pct: 40, color: "#e8b25a", temp: "belirsiz (~500 °C?)", detail: "Küçük ve şüpheli: farklılaşma tamamlanmadıysa gerçek bir çekirdek bile olmayabilir — ilkel C-tipi malzeme hâkimdir" },
      { name: "Buzlu-Karbonlu Manto", pct: 75, color: "#8a8478", temp: "~0 → -100 °C", detail: "Karbonlu kayaç + su buzu karışımı · Yüzeydeki hidratlı minerallerin kaynağı" },
      { name: "Karbonlu Kabuk", pct: 100, color: "#6b655c", temp: "-108 °C", detail: "Albedo ~0,07 ile sistemin en karanlık yüzeylerinden biri · Karbonca zengin, pürüzsüz ve az kraterli — küreselleşen bir gövdeye uygun" },
    ],
  },
  juno: {
    intro:
      "S-tipi sınıfın klasik temsilcisi: Juno, silisli kayaçtan oluşan, sıcak bir başlangıç yaşamış ve katmanlanmış bir gövdendir. C-tiplerinin aksine farklılaşmıştır: demir-nikel çekirdek, kaya manto ve parlak silikat kabuk.",
    layers: [
      { name: "Demir-Nikel Çekirdek", pct: 35, color: "#e8b25a", temp: "~1.000-1.500 °C", detail: "Ayırt edilmiş gövdenin metal kalbi · Çarpmalarda kopan parçalar, Dünya'ya meteorit olarak düşebilir" },
      { name: "Kaya Manto", pct: 65, color: "#a89078", temp: "~500-1.000 °C", detail: "Olivin-piroksen bakımından zengin silikat manto · S-tipi spektrumun kaynağı" },
      { name: "Silikat Kabuk", pct: 100, color: "#a89a84", temp: "-110 °C", detail: "Parlak (albedo ~0,23) taşlı kabuk · ~100 km çapındaki dev çarpma havzası yüzeyin büyük bir bölümünü kaplar" },
    ],
  },
  psyche: {
    intro:
      "Bir metal dünyası: Psyche, muhtemelen büyürken dış kabuğu ve mantosu soyulmuş bir protoplanetin çıplak demir-nikel çekirdeğidir. Eski bir jeodinamonun manyetik izleri aranıyor; NASA'nın Psyche sondası 2029'da varınca insanlık ilk kez bir metal gövdeyi yakından tanıyacak.",
    layers: [
      { name: "Kaya-Buz Dış Tabaka (Kalıntı)", pct: 60, color: "#8a8478", temp: "~0 → -100 °C", detail: "Soyulmamış son silikat örtü ya da çarpışma döküntüsü · Radar, gövdenin %80-90 metal, %10-20 silikat kaldığını gösterir" },
      { name: "Demir-Nikel Çekirdek (Maruz)", pct: 100, color: "#b8b4ac", temp: "soğumuş metal (~500 °C)", detail: "Gövdenin tamamına yakını: ~226 km'lik demir-nikel kütlesi · Değer tahmini ~10¹⁹ dolar; manyetik alan izleri ve sonda görevi bunu inceliyor" },
    ],
  },
  bennu: {
    intro:
      "Bir çakıl yığını (rubble pile): Bennu, eski bir gövdenin parçalanıp uzayda yeniden toplanmasından doğmuş. Yerçekimi o kadar zayıf ki içi boşluklu; OSIRIS-REx yüzeye dokunduğunda sonda ~50 cm 'batarak' bunu kanıtladı. Getirdiği numunede su ve organik moleküller bulundu.",
    layers: [
      { name: "Küçük Çekirdek Artığı", pct: 40, color: "#8a8478", temp: "~0 → -50 °C", detail: "Orijinal ana gövdenin sağ kalan parçası: yoğun kaya kümeleri, çakılların arasında dağınık durur" },
      { name: "Boşluklu İç", pct: 70, color: "#5c564e", temp: "-40 → +100 °C", detail: "Çakıllar arasında %30-40 boşluk · Yerçekimi zayıf olduğundan sıkışamamış; dönüş hızlanırsa gövde parçalanabilir (YORP etkisi)" },
      { name: "Çakıl Yığını Kabuk", pct: 100, color: "#4a443e", temp: "gece ~-40 °C · gündüz ~+100 °C", detail: "1-10 m'lik kayalarla kaplı gevşek yüzey · Termal yorgunluk: güneş ısınması kayaları her gün genleştirip büzerek çatlattıyor" },
    ],
  },
  ryugu: {
    intro:
      "Hayabusa2'nin amino asit bulduğu çakıl yığını: Ryugu, eski bir ana gövdenin yıkılıp yeniden toplanmasından doğmuş bir rubble pile'dır. İçi boşluklu, dönüşü hızlı ve yüzeyi geyliklerle dolu; yapay çarpma deneyi, alttaki taze malzemeyi ortaya çıkardı.",
    layers: [
      { name: "Buz-Kaya Karışım Çekirdek", pct: 40, color: "#8a8478", temp: "~0 → -50 °C", detail: "Orijinal ana gövdenin artığı: kaya ve su buzu karışımı, boşluklu çakılların içinde dağınık" },
      { name: "Boşluklu Çakıl İç", pct: 65, color: "#5c564e", temp: "-50 → +100 °C", detail: "Yoğunluk ~1,2 g/cm³: çakıllar arasında büyük boşluklar · Dönüş hızlanınca parçalanma riski artar" },
      { name: "Geylikli Yüzey", pct: 100, color: "#5c564e", temp: "gece ~-70 °C · gündüz ~+100 °C", detail: "7-17 m çaplı 300+ geylik (çarpma kaynaklı oyuk) · Gevşek malzeme, dönüşle ekvatora kayıp çıkrık biçimini yaratmış" },
    ],
  },
  halley: {
    intro:
      "Bir kuyruklu yıldız çekirdeği, Fred Whipple'ın 1950'deki deyimiyle 'kirli kar topu'dur; bugün 'buzlu kar topu' denir, çünkü toz oranı buzdan bile fazla olabilir. Halley, 15 × 8 km'lik kömürden siyah bir gövdedir: güneşe yaklaşınca içindeki uçucular süblimleşir, koma ve iki ayrı kuyruk doğar.",
    layers: [
      { name: "Uçucu Gaz Cepeleri", pct: 35, color: "#a8d8e8", temp: "-100 → -200 °C", detail: "CO, CO₂ ve azot buzuna gömülü gaz cepleri · Güneş ısısı bunları süblimleştirip jetlere dönüştürür: çekirdeğin 'patlayan' bölgeleri" },
      { name: "Buz-Kaya Karışım", pct: 60, color: "#b0c0c8", temp: "-70 °C (yaklaşım)", detail: "Su buzu + toz + organik bileşikler · 4,6 milyar yıldır hiç ısınmamış ilkel malzeme: Güneş Sistemi'nin kimyasal arşivi" },
      { name: "Koyu Krust", pct: 100, color: "#3a352f", temp: "-70 → +100 °C (yüzey)", detail: "Kömürden siyah toz kabuğu (albedo ~0,04) · Işığı yutar, altındaki buzu yalıtır: güneşten uzakta neredeyse ölü görünür" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*                          BÖLGELER & SINIRLAR                        */
/* ------------------------------------------------------------------ */

export interface RegionData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  color: string;
  stats: { label: string; value: string }[];
  description: string;
  facts: string[];
}

export const REGIONS: RegionData[] = [
  {
    id: "asteroid-belt",
    name: "Asteroit Kuşağı",
    subtitle: "Mars ile Jüpiter arasındaki kaya denizi",
    type: "Bölge",
    color: "#c9a227",
    stats: [
      { label: "Güneş'ten Uzaklık", value: "315-490 milyon km (2,1-3,3 AU)" },
      { label: "Nesne Sayısı", value: "1,1-1,9 milyon (>1 km)" },
      { label: "Toplam Kütle", value: "~3×10²¹ kg (Ay'ın %4'ü)" },
      { label: "En Büyük Nesne", value: "Ceres — kütlenin ~%30'u tek başına" },
    ],
    description:
      "Bir gezegen olamayan bölge: Jüpiter'in devasa çekimi, buradaki malzemenin hiçbir zaman gezegen toplayamamasına neden oldu. Kuşak, filmlerdeki gibi sık bir kaya duvarı değil — ortalama iki asteroit arasında bir milyon km boşluk vardır. Bölge, Mars ve Jüpiter'in yörüngeleri arasındaki 'Kirkwood boşlukları'yla desenlenir: Jüpiter'in yörünge rezonansları, belirli mesafelerdeki asteroitleri 'süpürüp' atmıştır.",
    facts: [
      "Jüpiter Trojaları: kuşağın dışında, Jüpiter'in yörüngesinde 60° önde (L4) ve 60° arkada (L5) toplanmış iki dev asteroit ordusu — sayıları ana kuşaktan fazla olabilir.",
      "Kuşaktaki en büyük dört nesne — Ceres, Vesta, Pallas, Hygiea — kütlenin yarısından fazlasını içerir. Gerisi 'döküntü'.",
      "Vesta bir protoplanettir: 4,6 milyar yıl önce gezegen olmaya başlamış, Jüpiter'in çekimi 'donmuş' bırakmıştır. Dünya'ya düşen HED meteoritlerinin %6'sı Vestadır!",
      "Bazı asteroitler 'metalik': Psyche 16, muhtemelen patlamış bir protoplanetin çıplak çekirdeğidir — 2029'da NASA sondası ziyaret edecek. Demir değeri trilyonlarca dolar.",
    ],
  },
  {
    id: "kuiper-belt",
    name: "Kuiper Kuşağı",
    subtitle: "Buz devlerinin ötesindeki soğuk hazine",
    type: "Bölge",
    color: "#8fd0c8",
    stats: [
      { label: "Güneş'ten Uzaklık", value: "4,5-7,5 milyar km (30-50 AU)" },
      { label: "Nesne Sayısı", value: "100.000+ (>100 km çaplı)" },
      { label: "Toplam Kütle", value: "~0,02 Dünya kütlesi" },
      { label: "Ünlü Sakinleri", value: "Plüton, Haumea, Makemake, Arrokoth" },
    ],
    description:
      "Güneş Sistemi'nin 'buz deposu': gezegenlerin doğduğu diskten artan, hiç gezegen olmamış buzlu gövdeler. Kısa dönemli kuyruklu yıldızların (Halley gibi) ana kaynağıdır. Kuşağın kalın 'klasik' bölümü ile Neptün'le 2:3 rezonansta kilitlenmiş 'Plütinolar' (Plüton gibi) ayrılır. 2019'da New Horizons, Arrokoth'a uçarak insanlığın ilk kez temas ettiği 'ilkel planetesimal' oldu — iki yumru birbirine yumuşakça birleşmiş, 4,6 milyar yıllık bir fosil.",
    facts: [
      "Plüton'un yörüngesi 17° eğik ve Neptün'le 2:3 rezonansta: Plüton 2 tur dönerken Neptün tam 3 tur döner — bu yüzden asla çarpışmazlar.",
      "Haumea uçurum hızında döner: bir günü sadece 3,9 saat! Bu hız onu Rugby topu şekline getirmiştir ve üzerinde bir halka bile vardır.",
      "Eris (67,8 AU) Plüton'dan büyük kütleli ama küçük görünür — 2005'teki keşfi 'gezegen nedir?' tartışmasını başlatıp Plüton'un cüce gezegen sınıfına düşmesine yol açtı.",
      "Kuiper Kuşağı'nın ötesinde 'dağınık disk' uzanır: Sedna gibi gövdeler 1.000 AU'ya kadar gidip gelir.",
    ],
  },
  {
    id: "oort-cloud",
    name: "Oort Bulutu",
    subtitle: "Güneş'in buz kalesi — sistemin gerçek sınırı",
    type: "Bölge",
    color: "#d8d2c8",
    stats: [
      { label: "Güneş'ten Uzaklık", value: "2.000-100.000 AU (0,03-1,5 ış yılı)" },
      { label: "Nesne Sayısı", value: "~1 trilyon buz gövdesi (tahmini)" },
      { label: "Toplam Kütle", value: "~5 Dünya kütlesi (tahmini)" },
      { label: "Görülebilir mi?", value: "Hayır — henüz hiçbir nesnesi doğrudan görülmedi" },
    ],
    description:
      "Güneş'in kütleçekiminin bittiği yere kadar uzanan devasa, küresel buz kabuğu. Uzun dönemli kuyruklu yıldızların (Hale-Bopp gibi) doğduğu yerdir. İç kısmı 'Hills Bulutu', dış kısmı klasik Oort Bulutu'dur. Dış sınırı, Güneş'in komşu yıldızlara bakan kütleçekim sınırıdır; oradaki cisimler artık Güneş'e değil, galaksinin genel alanına aittir. Hiçbir insansız aracı henüz oraya ulaşamadı — Voyager 1'in oraya varması ~300 yıl, geçip gitmesi ~30.000 yıl sürecek.",
    facts: [
      "Oort Bulutu henüz hiçbir teleskopla doğrudan görülmedi — varlığı, uzun dönemli kuyruklu yıldızların yörüngelerinden hesaplandı (Jan Oort, 1950).",
      "Bulutun dışına ulaşan ışık 1 yıldan fazla yol alır; güneş ışığı orada Dünya'dakinin milyarda biri kadar zayıftır.",
      "Bazı Oort nesneleri 'yakalanan' yıldızlararası gövdeler olabilir: 'Oumuamua (2017) muhtemelen başka bir yıldız sisteminden geldi.",
      "Sıcaklık: -270 °C'ye yakın. Buz gövdeleri 4,6 milyar yıldır Güneş'in doğduğu bulutun donmuş arşivleri gibi korunur.",
    ],
  },
  {
    id: "heliopause",
    name: "Heliopause — Güneş Sistemi Sınırı",
    subtitle: "Güneş rüzgârının bittiği, yıldızlararası boşluğun başladığı yer",
    type: "Sınır",
    color: "#fbbf24",
    stats: [
      { label: "Güneş'ten Uzaklık", value: "~120 AU (18 milyar km)" },
      { label: "Sıcaklık", value: "~50.000 K (heliosheath plazması)" },
      { label: "Geçen Sonde", value: "Voyager 1 (2012), Voyager 2 (2018)" },
      { label: "Önceki Sınır", value: "Terminasyon şoku ~80-100 AU" },
    ],
    description:
      "Güneş, her yöne 1,5 milyon km/sa hızla yüklü parçacık rüzgârı savurur; bu rüzgâr 'heliosfer' denilen dev bir manyetik balon şişirir. Yıldızlararası ortamın basıncıyla dengelendiği dış duvar heliopause'dir. İçeride 'bizim plazmamız' (sıcak, yavaş), dışarıda yıldızlararası plazma (soğuk, yoğun) vardır. Voyager 1, 25 Ağustos 2012'de plazma yoğunluğundaki sıçramadan sınırı geçtiğini anladı — insan yapımı ilk nesne yıldızlararası uzaya çıkmıştı.",
    facts: [
      "Terminasyon şokunda güneş rüzgârı aniden yavaşlar ve ısınır — dev bir 'ses dalgası kırılması' gibi.",
      "Heliosfer, kuyruklu yıldız kuyruğu gibi galaksinin rüzgârı yönünde uzar: kuyruk tarafı belki 10.000 AU'ya kadar gider.",
      "Heliopause'de manyetik alan çizgileri birbirine dolanır: iki yıldız sisteminin manyetik 'el sıkışması' orada olur.",
      "Sınırın tam yeri değişkendir: Güneş aktivitesi ve galaktik rüzgârla 110-130 AU arasında oynar.",
    ],
  },
  {
    id: "voyager-1",
    name: "Voyager 1",
    subtitle: "İnsanlığın en uzak elçisi — yıldızlararası uzayda",
    type: "Sonda",
    color: "#e8e4dc",
    stats: [
      { label: "Fırlatma", value: "5 Eylül 1977 (Titan IIIE roketi)" },
      { label: "Şu Anki Mesafe", value: "~25 milyar km (165 AU)" },
      { label: "Hız", value: "17 km/sn (61.200 km/sa)" },
      { label: "Sinyal Gecikmesi", value: "~23 saat tek yön" },
    ],
    description:
      "İnsanlığın gönderdiği en uzak nesne. 1979'da Jüpiter'i, 1980'de Satürn'ü ziyaret etti; Titan'a yakın geçiş için yörüngesi Plüton'a yönlendirildi. 25 Ağustos 2012'de heliopozu geçerek yıldızlararası uzaya giren ilk insan yapımı nesne oldu. Enerjisi plutonyum-238 RTG'den gelir; 2030'lara kadar en azından birkaç bilimsel alet çalışabilir. Sesi kesince bile 'Altın Plak' ile mesajı 4-5 milyar yıl daha galakside süzecektir.",
    facts: [
      "Altın Plak'ta (The Sounds of Earth) 55 dilde selamlar, Beethoven, Chuck Berry, bir kalp atışı ve Dünya'nın 116 görüntüsü var.",
      "Voyager 1'in 'Soluk Mavi Nokta' fotoğrafı (1990, 6 milyar km'den): Dünya'yı 0,12 piksellik bir ışık noktası olarak gösterir — Carl Sagan'ın ünlü konuşmasını ilham verdi.",
      "Görev başladığında ömrüne sadece 5 yıl biçilmişti; 47+ yıldır çalışıyor — NASA tarihinin en uzun görevi.",
      "Her gün ~40.000 trilyon kez daha güçlü radyo sinyalleri gönderir; Dünya'daki antenler (DSN) watt'ın milyarda birini yakalar.",
    ],
  },
  {
    id: "voyager-2",
    name: "Voyager 2",
    subtitle: "Uranüs ve Neptün'ün tek ziyaretçisi",
    type: "Sonda",
    color: "#d0ccc4",
    stats: [
      { label: "Fırlatma", value: "20 Ağustos 1977 (1'den önce!)" },
      { label: "Şu Anki Mesafe", value: "~21 milyar km (138 AU)" },
      { label: "Hız", value: "15,4 km/sn (55.400 km/sa)" },
      { label: "Büyük Gezegen Turu", value: "4 gezegen (J-S-U-N) — tek seferde" },
    ],
    description:
      "Voyager ikizlerinin çalışkan kardeşi: yörünge hizalaması sayesinde 4 dev gezegeni tek turda ziyaret eden tek sonda. 1986'da Uranüs'ü (10 yeni uydu, 2 halka keşfetti), 1989'da Neptün'ü (Büyük Karanlık Leke, geysers'lı Triton) buldu. 5 Kasım 2018'de Voyager 1'in ardından yıldızlararası uzaya geçti. Hâlâ 5 bilimsel aletiyle plazma ve manyetik alan ölçüyor.",
    facts: [
      "Fırlatma tarihi aslında Voyager 1'den 16 gün önce — adı '1', çünkü daha hızlı yolda güneşe uzak mesafeyi önce o aştı.",
      "Keşfettiği Miranda uydusundaki 20 km yükseklikteki Verona Rupes uçurumu, Güneş Sistemi'nin en dik yamacıdır (düşüş 12 dakika sürer!).",
      "Uranüs'ün manyetik ekseninin dönüş ekseninden 59° sapmış olduğunu keşfetti — manyetik kutupları neredeyse ekvatorda geziyor.",
      "2018'de heliopozu geçerken plazma yoğunluğu aniden sıçradı — sınır o kadar keskindir.",
    ],
  },
  {
    id: "sagittarius-a",
    name: "Sagittarius A*",
    subtitle: "Samanyolu'nun kalbindeki süperdev karadelik",
    type: "Karadelik",
    color: "#ffb85e",
    stats: [
      { label: "Kütle", value: "4,15 milyon güneş kütlesi" },
      { label: "Uzaklık", value: "~26.000 ış yılı (Yay takımyıldızı)" },
      { label: "Olay Ufku", value: "~12,4 milyon km çap (Merkür yörüngesi)" },
      { label: "Fotoğraf", value: "Event Horizon Telescope — 12 Mayıs 2022" },
    ],
    description:
      "Galaksimizin merkezinde oturan dev: yıldızların yörüngelerinden hesaplandı (Nobel Fizik 2020, Genzel & Ghez — S2 yıldızı saatte 24.000 km'yle etrafından geçerken süper kütleçekimi kanıtlandı). Karadeliğin kendisi görünmez; EHT 2022'de etrafındaki parlayan gaz halkasını (akresiyon diski) fotoğrafladı. Güneş Sistemi ondan çok uzakta, güvenli bir banliyödedir — 26.000 ış yılı ötede, Orion Spuru'nda.",
    facts: [
      "Adındaki yıldız işareti (*) 'heyecan verici radyo kaynağı' demektir: keşfi 1974'te radyo teleskoplarıyla oldu.",
      "Etrafındaki S2 yıldızı 16 yılda bir tur tamamlar; en yakın geçişinde karadelikten 120 AU uzaklığa gelir.",
      "2022 EHT fotoğrafı, 'araç garajı boyutunda bir dondurmaya Ay'dan fotoğraf çekmek' kadar zor bir ölçümdü.",
      "Şu anda 'aç' durumdur: yıldızları yutmuyor, sadece yakalayan gaz parçalarını çiğniyor — Sakarya'nın (Sgr A East) kalıntıları büyümesini durduruyor olabilir.",
      "Beklenen: her büyük galaksinin merkezinde bir süperdev karadelik vardır — bizimki ortalama kalmıştır (M87'ninki 6,5 milyar güneş kütlesi!).",
    ],
  },
  {
    id: "orion-spur",
    name: "Orion Spuru (Güneş'in Kolu)",
    subtitle: "Yerel Kol — Güneş Sistemi'nin içinde bulunduğu küçük kol parçası",
    type: "Bölge",
    color: "#ffd27a",
    stats: [
      { label: "Uzunluk", value: "~3.500 ış yılı" },
      { label: "Güneş'ten Merkeze", value: "~26.660 ış yılı" },
      { label: "Galaktik Yıl", value: "~230 milyon yıl (1 tur)" },
      { label: "Konum", value: "Yay ve Persey kolları arasında" },
    ],
    description:
      "Samanyolu'nun dört büyük kolu vardır: Kalkan–Centaurus ve Persey (büyük kollar), Yay ve Norma (zayıf kollar). Güneş hiçbirine ait değildir; Orion Spuru denen küçük bir ara kol parçasında yaşar. Bu yüzden 'Yerel Kol' (Local Arm) da denir. Komşularımız: Orion Bulutsusu (yıldız doğum hastanesi), Alpha Centauri (4,24 ış yılı) ve Barnard Yıldızı. Güneş saatte ~828.000 km hızla galaktik merkezin çevresinde döner; bir turu ~230 milyon yıl sürer — dinozorlar son turların bazılarını izledi.",
    facts: [
      "Kollar sabit yapılar değil, yoğunluk dalgalarıdır: Güneş her 100-150 milyon yılda bir bir kolun içinden geçer.",
      "Orion Spuru'nun adı, kış gökyüzünün en ünlü takımyıldızından gelir: Orion Bulutsusu bizim kolumuzdadır.",
      "Kol geçişleri Oort Bulutu'nu sarsabilir: bazı araştırmacılara göre yok oluş döngülerinin gizli motoru budur.",
      "Bizim galaktik mahallemiz olağanüstü boştur: en yakın yıldız 4,2 ış yılı — galaksi ölçeğinde neredeyse çöl.",
    ],
  },
  {
    id: "galaxy",
    name: "Samanyolu Galaksisi",
    subtitle: "Evimiz: 100-400 milyar yıldızlı çubuklu sarmal",
    type: "Galaksi",
    color: "#ffd9a0",
    stats: [
      { label: "Çap", value: "~100.000 ış yılı (disk)" },
      { label: "Yıldız Sayısı", value: "100-400 milyar" },
      { label: "Güneş'in Konumu", value: "Merkezden 26.660 ış yılı (Orion Spuru)" },
      { label: "Galaktik Merkez", value: "Sagittarius A* — 4,15 milyon güneş kütlesi" },
    ],
    description:
      "Bizim evimiz: çubuklu sarmal (SBbc) bir galaksi. Güneş, galaksinin düz dış mahallesinde, Orion Spuru denen küçük bir kol parçasında yaşar. Güneş Sistemi, merkezdeki Sagittarius A* etrafında saatte 828.000 km hızla döner — bir turunu (1 'galaktik yıl') ~230 milyon yılda tamamlar. Dinazorların soyu tünerken, Güneş son galaktik turunu yeni bitiriyordu. Galaksinin merkezine bakan yön (Yay takımyıldızı) en yoğun yıldız alanını gösterir.",
    facts: [
      "2022'de Event Horizon Telescope, Sagittarius A*'ın ilk fotoğrafını çekti: 26.000 ış yılı ötede, 4 milyon güneş kütlesindeki karadelik.",
      "Samanyolu ve Andromeda, saatte 400.000 km hızla birbirine yaklaşıyor: ~4,5 milyar yıl sonra 'Milkomeda' adlı dev bir eliptik galakside birleşecekler.",
      "Güneş Sistemi aslında galaktik düzlemin üstünde-altında salınır: 60-70 milyon yılda bir diski keser — bazı bilim insanları dinazorları yok eden çarpmaların bu salınımla bağlantılı olabileceğini düşünüyor.",
      "Gökyüzünde gördüğün 'Samanyolu şeridi', galaksimizin diskini içeriden bakarken gördüğümüz halidir — 100 milyar yıldızın ışığı, bir ışık şeridine dönüşür.",
    ],
  },
];

/** Galaksi modunda gösterilecek HUD notu */
export const GALAXY_HUD = {
  title: "Samanyolu Görünümü",
  lines: [
    "Güneş Sistemi, merkezden 26.660 ış yılı uzakta Orion Spuru'nda yaşar.",
    "Merkezdeki Sagittarius A* etrafında 828.000 km/sa hızla döneriz.",
    "Bir tur ≈ 230 milyon yıl: son turu dinazorlar gördü.",
    "Nokta ne kadar küçükse, evimiz o kadar büyüktür.",
  ],
};

/** 3D sahnede etiketle gösterilecek bölge işaretçileri (Voyager'lar, heliopause) */
export const SCENE_MARKERS: { id: string; label: string }[] = [
  { id: "heliopause", label: "Heliopause" },
  { id: "voyager-1", label: "Voyager 1" },
  { id: "voyager-2", label: "Voyager 2" },
];
