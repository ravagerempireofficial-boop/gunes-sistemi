import type { TheoryStage } from "../theories";

/**
 * extended-stages — HER teoriye 5 ekstra bölüm (toplam 245 yeni aşama).
 * until değerleri theories.ts içindeki extendStages() tarafından otomatik
 * hesaplanır; notlar ve ses ipuçları da yeniden hizalanır.
 */

export type ExtraStage = Omit<TheoryStage, "until">;

const s = (title: string, text: string, era: string): ExtraStage => ({
  title,
  text,
  era,
});

export const EXTRA_STAGES: Record<string, ExtraStage[]> = {
  /* ------------------------------ 1-8 Kozmoloji ----------------------------- */
  "buyuk-patlama": [
    s("Planck Dönemi", "Zamanın en küçük anlamlı dilimi: 10⁻⁴³ saniye. Bu anın ötesini bugünkü fizik göremez — dört kuvvet tek bir süper güç olarak birleşiktir.", "t = 10⁻⁴³ sn"),
    s("Kuvvetler Ayrılıyor", "Evren soğudukça büyükleşmiş kuvvet zincir halkaları gibi kopar: önce yerçekimi, sonra güçlü çekirdek kuvveti serbest kalır. Her kopuş dev enerji boşaltır.", "10⁻⁴³ → 10⁻³⁶ sn"),
    s("Madde-Antimadde Savaşı", "Her 1 milyar antimaddeye 1 milyar 1 madde denk gelir. Savaş biterken artan o 'bir' kalır: bugünkü her şey — yıldızlar, gezegenler, sen — o fazlalığın kalıntısıdır.", "t = 10⁻¹⁰ sn"),
    s("CMB'nin 13,8 Milyar Yıllık Yolculuğu", "İlk ışık serbest kaldığında 3.000 K idi; genişleme onu bugün 2,725 K'lik mikrodalgaya dönüştürdü. Televizyonun statik gürültüsünün %1'i hâlâ bu ışıktır.", "380.000 yıl → bugün"),
    s("Isıl Ölüm: Son Sahne", "Yıldızlar söner, kara delikler buharlaşır, entropi maksimuma çıkar. Işık bile çığlığını duyuramaz — ama bu, yüzlerce milyar yıl sonrasının hikâyesidir.", "10¹⁰⁰ yıl"),
  ],
  "kozmik-enflasyon": [
    s("Sahte Vakum", "Boşluk aslında doludur: kuantum alanlarının enerjisiyle kaynar. Enflasyon, bu 'sahte vakum'un negatif basıncının yerçekimini tersine çevirmesidir.", "t = 10⁻³⁶ sn"),
    s("Üstel Şişme", "Evren 10⁻³⁶ saniyede en az e⁶⁰ kat büyür — bir protondan bir üzüm tanesine. Işıktan hızlı hareket etmez; boşluğun kendisi gerilir.", "10⁻³⁶ → 10⁻³² sn"),
    s("Kuantum Tohumları", "Şişme sırasındaki kuantum dalgalanmalar büyütülür ve donar: CMB'deki sıcaklık lekeleri bu tohumlardandır. Galaksilerin kimlik kartı, enflasyonun parmak izidir.", "şişme boyunca"),
    s("Isınma: Enerji Yağmuru", "Şişme biter, sahte vakum çöker ve depoladığı devasa enerji parçacıklara dönüşür: kuark-gluon plazması kaynayan bir evren doğar.", "t = 10⁻³² sn"),
    s("Kanıtlar: Düz, Homojen, İzotropik", "Gözlenebilir evren çarpışan küreler gibi düzdür (Ω=1), CMB 100.000'de bir doğrulukla homojendir — enflasyon bunu tek hamlede açıklar.", "gözlemsel test"),
  ],
  "lambda-cdm": [
    s("Kozmik Bütçe Tablosu", "Evrenin içeriği: %68 karanlık enerji, %27 karanlık madde, %5 atom. Bildiğimiz her şey — yıldız, gezegen, insan — son dilimdir.", "bugün"),
    s("Karanlık Maddenin İskeleti", "Karanlık madde halo'ları, atomik maddenin tutunduğu görünmez iskeletlerdir. Galaksiler bu kafeslerin uçlarında ışık boncuklarıdır.", "ilk milyar yıl"),
    s("1998 Şoku: Hızlanan Genişleme", "İki ekip uzak süpernovaları ölçtü: evren hızlanarak genişliyor. Nobel 2011'e giden bu keşif, Λ'yı kozmolojinin merkezine oturttu.", "1998"),
    s("Einstein'ın 'En Büyük Hatası'", "Λ'yı 1917'de ekledi, 'hata' diyerek çıkardı; 81 yıl sonra kozmik ivmelenme onu haklı çıkardı. Λ bugün fizikte en kötü tahmin edilen sayıdır (10¹²⁰ kat sapma).", "1917 → 1998"),
    s("H₀ Gerilimi", "Yakın evren 73, uzak evren 67 km/sn/Mpc diyor. İki yöntem arasındaki bu 5σ gerilim, yeni fizik işareti olabilir — ya da ölçüm hatası.", "2010'lar → bugün"),
  ],
  "coklu-evren": [
    s("Şişirme Baloncukları", "Kozmik enflasyon bir yerde durur, başka yerde sürer: durduğu her nokta bir baloncuk evren doğurur. Bizimkisi belki sonsuz köpüğün bir kabarcığıdır.", "enflasyon sonrası"),
    s("Sicim Manzarası", "Sicim teorisi ~10⁵⁰⁰ farklı vakum öngörür: her biri farklı fizik yasalarıyla bir evren. Manzara o kadar büyüktür ki 'bizimki' mutlaka bir yerdedir.", "teori"),
    s("İnce Ayar Argümanı", "Kozmolojik sabit neden doğal değerinin 10¹²⁰ katı küçük? Çoklu evrende küçük Λ'lı evrenlerde gözlemci doğabilir — biz böyle bir evrendeyiz.", "anthropik"),
    s("Aranan İzler", "Komşu bir baloncuk çarpsaydı CMB'de dairesel soğuk nokta bırakırdı. Planck verisinde adaylar var — istatistiksel olarak ikna edici değil.", "gözlemsel arayış"),
    s("Bilim Sınırında", "Diğer evrenler asla gözlenemeyebilir: Popper ölçütünü geçemezler mi? Eleştiriler ciddi — ama kara delik bilgisi de bir zamanlar 'felsefe'ydi.", "felsefi tartışma"),
  ],
  "dongusel-evren": [
    s("Büyük Çöküş Senaryosu", "Yerçekimi genişlemeyi yenerse evren içine çöker: Büyük Çöküş. Eski evrenin külleri yeni bir ateşin odunu olabilir mi?", "gelecek senaryo"),
    s("Penrose'un Uyumsuz Uygarlığı", "Roger Penrose'un CCC modeli: yıldızlar bitince kütleye dönüşen fotonlar evrenin 'ölçeğini' unutur — ısı ölümü, yeni bir Büyük Patlama'nın doğum anıdır.", "CCC"),
    s("Entropi Engeli", "Her döngüde entropi artar: nasıl sıfırlanır? Penrose'a göre şişme benzeri yeniden ölçekleme entropiyi 'seyreltir' — çözüm tartışmalıdır.", "problematik"),
    s("Kuantum Sıçraması", "Döngüsel kuantum kütleçekiminde çöküş, yoğunluk 10⁹⁶ kg/m³'e ulaşınca kuantum itmeyle geri sıçrayışa döner: çöküş, doğumun diğer adıdır.", "LQC"),
    s("CMB'de İz Arayanlar", "Önceki evrenden halkalar, çizgiler kalır mı? Penrose'un iddia ettiği 'kontur noktaları' bağımsız analizlerde istatistiksel gürültü çıktı — arayış sürüyor.", "gözlem"),
  ],
  "steady-state": [
    s("Hoyle'un İsyanı", "1948: Fred Hoyle, Bondi ve Gold ileri sürdü — evren sonsuz yaşta, sabit yoğunlukta; genişledikçe uzayda sürekli hidrojen yaratılır.", "1948"),
    s("Sürekli Yaratım Alanı", "Saniyede metre küp başına birkaç hidrojen atomu: göze görünmez ama bir galaksinin yerini dolduracak kadar topludur. Ne zarif, ne test edilebilir...", "model"),
    s("Kuasar Çağı Kanıtı", "Uzak (yani genç) evrende kuasarlar inanılmaz yoğundur. Sabit durum evrende her yer her zaman aynı görünmeliydi — görmüyor. Bu, modelin mezar taşıdır.", "1960'lar"),
    s("CMB'i Açıklayamamak", "1965'te bulunan 2,7 K mikrodalga fonu, sıcak geçmişin dumanıdır. Sabit durumda bu ışığın kaynağı olamazdı — arka arkaya patlayan demir tozları fikri gülünç bulundu.", "1965"),
    s("Hoyle'un Devasa Mirası", "Model yenildi ama Hoyle'un 'Big Bang' ismi, yıldızlarda karbon üreten nükleosentez teorisi ve 20. yüzyıla damga vuran sert zekâsı kaldı.", "miras"),
  ],
  ekpirotik: [
    s("Brana Dünyaları", "M-teorisinde evren, 11 boyutlu uzayda yüzen membranlardır. Bizim evrenimiz, yüzeyinde yaşadığımız bir brana — ışık ona yapışıktır, yerçekimi değildir.", "M-teorisi"),
    s("Çarpışma = Büyük Patlama", "Steinhardt-Turok modelinde iki brana her trilyon yılda bir çarpışır: çarpma noktasındaki devasa enerji, bizim 'Big Bang' dediğimiz şeydir. Sonu yok, başlangıcı yok — sadece ritim var.", "ekpirotik döngü"),
    s("Yerçekimi Neden Kaçıyor", "Yerçekimi, brananın dışına sızabilen tek kuvvettir: bu yüzden zayıftır ve 'karanlık madde' olarak görülen şey, komşu branadan sızan yerçekimidir.", "yerçekimi sızmaları"),
    s("CMB'nin Düşük Frekans Yalpağı", "Enflasyon yerine brana çarpışması da benzer bir CMB üretir — ama büyük açı ölçeklerinde daha az güç öngörür. Gözlem bu yönde hafif bir eğilim gösterir.", "ayrıcı test"),
    s("Test Edilebilirlik Sınırı", "Model zarif ama ekstra boyutlar henüz saptanamadı. LHC'de mikro kara delik aranması boş çıktı — ekpirotik senaryo, teoride zarif, deneysel olarak sessiz kalıyor.", "bugünkü durum"),
  ],
  "simulasyon-teorisi": [
    s("Bostrom Üçlüsü", "Filozof Nick Bostrom 2003: Ya uygarlıklar teknolojik olgunluğa ulaşamaz, ya ileri uygarlıklar simülasyon çalıştırmaz, ya da biz bir simülasyon içindeyiz. En az biri kesin doğrudur.", "2003"),
    s("Piksel Sınırı: Planck Uzunluğu", "Uzay-zaman 10⁻³⁵ metre altında anlamsızlaşır: bir görüntünün piksel sınırı gibi. Ama bu, simülasyon kanıtı değil — doğanın kendi ölçeğidir.", "gösterge değil kanıt"),
    s("Hesaplama Maliyeti", "Evreni parçacık başına simüle etmek, bir uygarlığın gezegen ölçeğindeki tüm enerjisini tüketirdi. O kadar güçlü bir uygarlık var mı? Bilmiyoruz — belki evrenin kendisi simülasyonu hafifleten 'hileler' kullanır (kuantum belirsizliği?).", "hesaplama teorisi"),
    s("Deneyle Sınamak", "Eğer simülasyon 'sadece izlendiğinde hesap yaparsa' (kuantum ölçüm bağımlılığı gibi), doğal deneysel sapmalar aranabilir. Bugüne dek hiçbir sapma bulunamadı.", "deneysel testler"),
    s("Felsefi Kapan", "Simülasyon olsa bile dünya 'sahte' değildir: acı gerçek, deney gerçek. Ama sonsuz simülasyon zinciri (simülasyon içinde simülasyon) anlamsızlaşır — soru daha çok ahlaki bir aynadır.", "felsefe"),
  ],

  /* ------------------------------ 9-15 Fizik -------------------------------- */
  "klasik-mekanik": [
    s("Newton'un Elması", "1687: 'Principia' yayımlanır. Tek bir kütleçekim yasası, elma ile Ay'ı aynı denklemde birleştirir — bilim tarihinde ilk kez gök ile yer aynı yasaya boyun eğer.", "1687"),
    s("Üç Yasası", "Atalet: dokunulmazsa düzgün hızla devam. F=ma: kuvvet ivme üretir. Etil-tepki: her etkiye eşit ve zıt tepki. Bu üç cümle, üç yüzyıl mühendisliği yazdı.", "temel yasalar"),
    s("Kepler'i Kanıtlamak", "Newton, Kepler'in üç yasasını kütleçekiminden matematiksel olarak türetti: elipsler, eşit alanlar, T²∝a³ — hepsi tek ilkenin doğal sonuçlarıydı.", "türetme"),
    s("Laplace'ın Şeytanı", "Eğer bir zeka tüm parçacıkların konum ve hızını bilse, geleceği tek bir denklemle hesaplardı. Klasik evren bir saat mekanizmasıydı — ta ki kuantum gelene dek.", "belirlenimcilik"),
    s("43 Yay-saniyelik Çatlak", "Merkür'ün perihelion'u her yüzyılda 43 yay-saniye fazla ilerliyor. Newton bunu açıklayamadı; 1915'te Einstein'ın genel göreliliği bu çatlağı kapatı — klasik dünyanın ilk kapanış sahnesi.", "1859 → 1915"),
  ],
  "genel-gorelilik": [
    s("En Mutlu Düşünce", "Einstein 1907: 'Düşen bir insan serbest düşüşte ağırlığını hissetmez.' Eşdeğerlik ilkesi doğdu — yerçekimi ile ivme aynı şeydir.", "1907"),
    s("Uzay-Zaman Kumaşı", "Kütle, etrafındaki 4 boyutlu uzay-zamanı büker: gezegenler düşmez, düz çizgilerini bükülmüş kumaşta izler. 'Matter tells spacetime how to curve; spacetime tells matter how to move.'", "1915"),
    s("1919 Tutulması", "Eddington, güneş tutulmasında yıldız ışığının Güneş yakınında 1,75 yay-saniye sapmasını ölçtü. Telegraflar Einstein'ı dünyaya duyurdu: klasik fizik çatladı, yeni bir kâğıt devri başladı.", "1919"),
    s("Uzay-Zamanın Dalgaları", "2015: LIGO, iki kara delik birleşmesinden yayılan yerçekimi dalgalarını duyar — uzay-zamanın kendisi 10⁻¹⁸ metre titreşir. Einstein 100 yıl önce öngörmüştü.", "2015"),
    s("Günlük Görelilik", "GPS uydularındaki saatler hem hız (günde 7 μs yavaş) hem yükseklik (45 μs hızlı) nedeniyle düzeltme ister. Görelilik artık sofistike bir teori değil, telefonunuzdaki bir yamadır.", "uygulamalar"),
  ],
  "ozel-gorelilik": [
    s("Eter Arayışı", "Işık neyin içinde dalgalanır? 19. yüzyıl 'eter' dedi. Michelson-Morley 1887'de eter rüzgârını aradı — hiçbir şey bulamadı. Fiziğin en ünlü başarısız deneyi.", "1887"),
    s("İki Postülat", "1) Fizik yasaları tüm sabit hızlı gözlemciler için aynıdır. 2) Işık hızı, kaynağın hızından bağımsız sabittir. İki cümle, bin yıllık sezgileri yıktı.", "1905"),
    s("Zaman Esnek Bir Kumaş", "Hızla hareket eden saat yavaş ilerler: teorik 0,999c'de 1 yıl, yerde 22 yıl. Muonlar bunu her gün kanıtlar — atmosferde doğup yere ulaşamazken ulaşırlar.", "zaman genleşmesi"),
    s("E=mc²", "Kütle sıkışmış enerjidir: 1 gram madde, 21 kiloton TNT'ye eşittir. Güneş bunu her saniye 4 milyon tonluk bir oranda yapar — yıldızlar kütle-enerji değişimidir.", "1905"),
    s("Eşzamanlılık Yoktur", "Trende paralel iki şimşek: platformdaki 'aynı anda' der, trendeki 'önce arkadaki' der. İkisi de haklıdır — eşzamanlılık gözlemciye bağlıdır. Evrenin tek bir 'şimdi'si yoktur.", "paradoks"),
  ],
  "kuantum-alan": [
    s("Parçacık Değil, Titreşim", "Kuantum alan teorisinde evren, iç içe sonsuz alanlar denizidir: elektron alanı, foton alanı, kuark alanı... 'Parçacık', bu denizlerin lokalize dalgacıklarıdır — kumsalda tepecikler gibi.", "temel fikir"),
    s("Vakum Kaynaması", "Boşluk bile doludur: sanal parçacık-antiparçacık çiftleri Planck zamanı ölçeğinde doğup yok olur. Casimir etkisi, bu kaynamanın metal plakalar üzerinde ölçülebilir itmesi kanıtıdır.", "vakum"),
    s("QED: 12 Basamak Doğruluk", "Feynman diyagramlarıyla kurulan kuantum elektrodinamiği, elektron manyetik momentini 12 basamağa kadar doğru öngörür — insanlık tarihindeki en hassas teori.", "QED"),
    s("Standart Model Tablosu", "6 kuark, 6 lepton, 4 kuvvet taşıyıcısı + Higgs: maddenin periyodik tablosu. 2012'de Higgs bozonu bulundu — tablonun son taşı yerine oturdu.", "1960'lar → 2012"),
    s("Açık Kapılar", "Karanlık madde parçacığı yok, kütle hiyerarşisi açıklanamıyor, yerçekimi alanla birleşmiyor. Standart model muhteşem ama eksik — kapı, daha büyük bir teoriye açılıyor.", "açık sorunlar"),
  ],
  "sicim-m-teorisi": [
    s("Titreşen Teller", "Her parçacık aslında 10⁻³⁵ metrelik minicik titreşen bir teldir: titreşim frekansı farklıysa farklı parçacık. Evren bir orkestra, madde bir symphony.", "temel fikir"),
    s("Ekstra Boyutlar", "Matematik tutarlı olması için 10 boyut (M-teorisinde 11) gerekir: ekstra 6-7 boyut, Planck ölçeğinde minicik sarılmıştır. Kaluza-Klein 1921'de 5. boyutla elektromanyetizmayı üretmişti.", "kompaktifikasyon"),
    s("Süpersimetri", "Her fermiyonun boson eşü vardır: elektron↔selektron, kuark↔skuark. LHC'de hiçbir süper-eş bulunamadı — ya enerji yetmedi ya da teori yapısında bir çatlak var.", "SUSY"),
    s("Beş Teori, Tek M", "1995: Witten, birbirine dönüştürülebilen beş farklı sicim teorisinin aslında tek bir M-teorisinin farklı yüzleri olduğunu gösterdi. Beş kör adam, aynı fili farklı tarıyor.", "M-teorisi"),
    s("İce Mıknatıs Eleştirisi", "Test edilebilirlik yok: Planck enerjisi (10¹⁹ GeV) her parçacık hızlandırıcıdan milyarlarca kat yüksek. Eleştiriler ciddi — ama matematiksel derinlik de gerçek. Teori, deneyin gelmesini bekliyor.", "tartışma"),
  ],
  "dongusel-kuantum": [
    s("Uzay-Zamanın Atomları", "Loop kuantum kütleçekimi: uzay-zaman da sürekli değil, 10⁻³⁵ m'lik minicik 'hücrelerden' örülmüştür — kumaşın iplikleri gibi.", "LQG"),
    s("Spin Ağları", "Alan kuantumları, düğümlü bir ağda (spin network) kodlanır: düğümler hacim, çizgiler yüzey alanı taşır. Geometri bile kuantumlanmıştır.", "spin ağları"),
    s("Big Bounce", "Evren çökerken yoğunluk sonsuza gitmez: kuantum itme 10⁹⁶ kg/m³'te devreye girer ve çöküş, yeni bir genişlemeye dönüşür. 'Big Bang', bir 'Big Bounce'un anısıdır.", "bounce"),
    s("Ashtekar Değişkenleri", "1986: Abhay Ashtekar'ın yeniden yazdığı yerçekimi değişkenleri, Einstein denklemlerini kuantumlaştırılabilir hale getirdi — alanın doğum belgesi.", "1986"),
    s("Gama-Işını Sınamaları", "Eğer uzay 'taneliyse' yüksek enerjili fotonlar hafifçe farklı hızda ilerler: uzak gama ışını patlamalarında mikrosaniye gecikme aranır. Bugüne dek gecikme yok — LQG'nin enerji ölçeği çok yüksek olmalı.", "gözlemsel sınır"),
  ],
  "holografik-evren": [
    s("Bilgi Nereye Gitti", "Hawking, kara deliklerin buharlaşıp yok olduğunu söyledi — ama içindeki bilgi de yok olur mu? Kuantum mekaniği 'bilgi yok olmaz' diyor: paradoks 40 yıl sürdü.", "bilgi paradoksu"),
    s("Bekenstein Sınırı", "Bir bölgedeki maksimum bilgi, hacimle değil YÜZEY ALANIyla ölçeklenir: her Planck alanına 1 bit. Evren bir hologram gibi — 3 boyutlu dünya, 2 boyutlu sınırın projeksiyonu olabilir.", "1972"),
    s("AdS/CFT Uyumu", "1997: Maldacena, 5 boyutlu Anti-de Sitter uzayındaki yerçekimi ile sınırındaki 4 boyutlu kuantum alan teorisinin BİREBİR eşdeğer olduğunu kanıtladı. 10.000+ makale — teorik fiziğin Rosetta taşı.", "1997"),
    s("Biz Bir Hologram mıyız", "AdS evrenimiz değil (biz de Sitter'dayız) ama ilke çarpıcı: kütleçekimi bile bir sınır teorisinden türetilebilir. Uzay-zaman, görünüş olabilir.", "düşünce deneyi"),
    s("Bugünkü Sınır", "Holografi, kara delik entropisini doğru sayar; kara delik bilgi paradoksu 2019'da 'evrensel madde' hesaplamalarıyla yumuşadı. De Sitter holografisi — gerçek evrenimizin sürümü — hâlâ kutsal kâse.", "açık problem"),
  ],

  /* --------------------------- 16-25 Gökyüzü/Yer ---------------------------- */
  "yildiz-nukleosentezi": [
    s("PP Zinciri", "Güneş çekirdeğinde 4 proton → 1 helyum-4: her döngüde 26,7 MeV ışık doğar. Yıldızlar, hidrojeni helyuma çeviren kontrollü füzyon reaktörleridir.", "ana kol"),
    s("CNO Döngüsü", "Güneşten daha ağır yıldızlarda karbon, azot, oksijen katalizör olarak çalışır: aynı ürün, farklı yol. 10 M☉ üzerinde baskın enerji kaynağı budur.", "ağır yıldızlar"),
    s("Üçlü-Alfa ve Hoyle Durumu", "İki helyum → berilyum-8 (kararsız!); üçüncü alfa yetişirse karbon-12 doğar. Hoyle, bu sürecin çalışması için karbonun 'sihirli' bir enerji seviyesi olması gerektiğini öngördü — deneyle kanıtlandı. Sezginin zaferi.", "1954"),
    s("Soğan Katmanları", "Ağır yıldızın son dönemi: dıştan içe H→He→C→Ne→O→Si katmanları, çekirdekte demir. Her katman daha sıcak, daha kısa ömürlü — silikat yakma fazı bir gündür.", "son günler"),
    s("Demir Duvarı", "Demir-56 en kararlı çekirdektir: füzyon artık enerji üretmez, TÜKETİR. Radyasyon basıncı çöker — yıldızın kaderi, saniyeler içinde mühürlenir.", "ölüm anı"),
  ],
  "r-sureci": [
    s("Nötron Yağmuru", "Serbest nötronlar, protonlardan hafifçe ağır ama zararsızdır: çekirdek, saniyede milyonlarca nötron yakalar — kararlılaşma vakti bulamadan giderek ağırlaşır.", "mekanizma"),
    s("Kararlılık Vadisinin Ötesi", "Bilinen element tablosunun 'vadisi' dışında yüzlerce egzotik çekirdek oluşur: 100+ saniye ömürlü, derece derece beta bozunarak kararlı hale iner.", "nüclid haritası"),
    s("Aktinid Fabrikası", "r-süreci, uranyum-238 ve toryum-232 gibi doğal radyoaktif ağır elementleri üretir: Dünya'nın çekirdeğindeki ısı ve jeodinamo bu elementlerin bozunumundan beslenir.", "uranyum/toryum"),
    s("GW170817: Altının Doğum Belgesi", "2017: iki nötron yıldızı birleşti; kızılötesi ışıkta stronsiyum, altın, platin imzaları okundu. r-süreci artık teori değil, göksel bir olayın doğrudan fotoğrafıdır.", "2017"),
    s("Diğer Kaynaklar", "Nötron yıldızı birleşmeleri yetiyor mu? Bazı r-element oranları mıknatısal yıldız flare'lerini işaret ediyor: galaksinin r-süreci menüsü belki birden fazla şefe sahiptir.", "açık soru"),
  ],
  diferansiyasyon: [
    s("Erimiş Dünya", "Birikim + radyoaktif ısı, genç gezegeni tamamen eritir: yüzeyden çekirdeğe magma okyanusu. Gezegen, bir sıvı metal-kaya karışımıdır.", "ilk evre"),
    s("Ağır Batar, Hafif Yüzer", "Eriyikte demir-nikel damlaları merkezde toplanır: çekirdek doğar. Hafif silikatlar yüzer: manto ve kabuk. Kimyasal katmanlaşma — yoğunluk sıralaması — tamamlanır.", "ayrışma"),
    s("Üç Katmanlı Gezegen", "Çekirdek (demir-nikel, 5.500°C), manto (silikat, akışkan kaya), kabuk (soğumuş ince deri). Bu mimari, jeolojiyi ve atmosferi milyarlarca yıl yönetir.", "yapı"),
    s("Jeodinamo Doğuyor", "Sıvı dış çekirdekteki konveksiyon + gezegen dönüşü = dev dinamoma dönüşür. Manyetik alan, atmosferi güneş rüzgârından koruyan görünmez kalkandır.", "manyetik kalkan"),
    s("Sismik Kulaklıkla Dinlemek", "Deprem dalgaları gezegenin içinden geçer: S-dalgaları sıvıda ölür. Bu gölge bölgeler çekirdeğin sıvı dış + katı iç yapısını kanıtlar — gezegenin CT taraması.", "kanıtlar"),
  ],
  "agir-bombardiman": [
    s("Ay'ın Yaraları", "Ay yüzeyindeki dev havzalar — Imbrium 1.145 km, Orientale 930 km — 4,1-3,8 milyar yıl önceki bombalamanın dokuma izleridir: birer şok kristali arşivi.", "kanıt"),
    s("700 Milyon Yıllık Yağmur", "Geç Ağır Bombardıman: iç sistem, aniden (astronomik ölçekte) dev meteor yağmuruna tutulur. Apollon örnekleri bu pencerelere tarih damgası basar.", "4,1-3,8 Ga"),
    s("Nice Modeli", "Neden? Dev gezegenler göç etti: Jüpiter-Satürn rezonansa girdi, Neptün dışarı savruldu, Kuiper kuşağı bozuldu — iç sistem mermi yağmuruna tutuldu.", "nedeni"),
    s("Dünya'daki İzler", "Dünya'da doğrudan krater yok (tektonik siler) ama zirkon kristalleri 4,1 Ga'da şok izleri taşır: bombardıman Dünya'yı da vurdu, belki ilk yaşamı sterilize etti.", "dünya izleri"),
    s("Kader mi Şans mı", "Bombardıman su ve organik madde taşıdı ama aynı zamanda ilk ekosistemleri yakıp küle çevirdi. Yaşam, bu iki uç arasındaki dar pencerede doğdu.", "sonuçlar"),
  ],
  "hidrotermal-damar": [
    s("Sıcak Kan Dolaşımı", "Magmaya yakın su, çatlaklardan derine sızar: ısıtır, mineral çözer, geri yükselir. Yer altında dolaşan dev bir sıcak su sistemi.", "dolaşım"),
    s("Damarların Doğumu", "Sıcak çözelti yükselirken soğur ve yükünü bırakır: kuvars damarları içinde altın, bakır, gümüş çöker. Maden ocakları, eski sıvıların donmuş yollarıdır.", "çökelme"),
    s("Siyah Sigara Bacıları", "Okyanus tabanında 400°C'lik mineral zengini sıcak su, buz soğuk denize karışınca siyah duman gibi çöker: bacalar, yılda 30 cm büyür.", "denizaltı"),
    s("Kimya Fabrikası", "H₂S, Fe²⁺, metan, şelatlayıcılar: bacalar, organik molekül sentezi için doğal reaktörlerdir. Yaşamın ilk mutfağı olabilirler.", "prebiyotik kimya"),
    s("Kemosentez Ekosistemi", "Işıksız derinlikte boru solucanları, dev midyeler, kemosentetik bakteriler: güneşe hiç bakmadan yaşayan ekosistemler — biyoloji ders kitaplarını yeniden yazdılar.", "1977 keşfi"),
  ],
  "magmatik-ayrisma": [
    s("Yer Altı Eriyik Havuzu", "Manto kısmen eriyince magma odası doğar: gezegenin altında kaynayan, basınçlı bir kimya reaktörü.", "magma odası"),
    s("Bowen'ın Serisi", "Mineraller belirli bir sırayla kristallenir: olivin → piroksen → amfibol → biyotit → feldspat. N.L. Bowen 1922'de bu ritmi deneyle gösterdi.", "1922"),
    s("Ağır Kristaller Batar", "İlk kristallenler (olivin, piroksen) yoğundur ve oda dibine çöker: kalan magma bileşimi değişir. Fraksiyonel kristalleşme — magmanın 'damıtma' işlemi.", "fraksiyonasyon"),
    s("Kalan Sıvı Zenginleşir", "Son damla, silis ve uçucu gazlarda zengindir: granit gibi açık renkli kayalar doğar. Kıtaların hafif 'yüzen' kabuğu bu damıtmanın ürünüdür.", "granit"),
    s("Cevher Tabakaları", "Kristal yataklarında platin, krom, vanadyum toplanır: Güney Afrika Bushveld, gezegenin en büyük platin madenidir — magmatik ayrişmanın endüstriyel mirası.", "cevherler"),
  ],
  sedimantasyon: [
    s("Dagları Eren Zaman", "Su, rüzgâr, buz ve yerçekimi kabuğu aşındırır: her yıl Himalaya'dan milyonlarca ton kaya denize taşınır — yavaş ama yenilmez bir ordu.", "erozyon"),
    s("Nehirler Taşır", "Akış hızı, tane boyu seçer: çakıl hızlı nehirde, kil yavaş deltada çöker. Nehirler, doğal eleme makineleridir.", "taşınma"),
    s("Katman Katman Çökme", "Ağır önce, hafif sonra: tabakalı çökelme. Alüvyon yelpazesi, delta, lagün, deniz tabanı — her ortam kendi imzasını basar.", "çökelme"),
    s("Taşa Dönüşüm", "Basınç + kimyasal çimento: gevşek kum kumtaşına, çamur şiste dönüşür. Diagenez — zamanın pres makinesi.", "diagenez"),
    s("Fosil Arşivi", "Sedimanter katmanlar, zamanın sayfalarıdır: fosiller bu sayfalara yazılmış kelimelerdir. William Smith 1815'te 'katman sırası' yoluyla jeolojiye zaman vermeyi öğretti.", "stratigrafi"),
  ],
  "biyojenik-cevherlesme": [
    s("Canlılar Metal Toplar", "Bakteriler metal iyonlarını metabolizmalarında kullanır ve dışlarında biriktirir: demir oksit kabuklar, mangan nodülleri — mikroskobik madenler.", "biyomineralizasyon"),
    s("Oksijen Devrimi", "2,4 milyar yıl önce siyanobakteriler oksijen patlatır: denizdeki çözünmüş demir oksitlenir ve çöker.", "GOE"),
    s("Şeritli Demir Formasyonu", "Kırmızı-beyaz demir oksit + silis şeritleri: BIF'ler, dev oksijen salınımlarının yıllık halkalarıdır. Bugünün çelik endüstrisi bu eski biyolojinin deposudur.", "BIF"),
    s("Organik Cevherler", "Kömür: Karbonifer ormanları. Petrol ve doğal gaz: deniz planktonu. Biyojenik cevherleşme, canlıların jeolojik birikimidir.", "fosil yakıtlar"),
    s("Fosfat ve Sülfür", "Guano, kemik yatakları, biyojenik pirit: tarımın ve kimya endüstrisinin temelindeki biyolojik madde havuzları.", "endüstriyel miras"),
  ],

  /* ------------------------------ 26-30 Yaşam ------------------------------- */
  "ilkel-corba": [
    s("Çorba Hipotezinin Doğumu", "1924: Oparin (Rusya) ve Haldane (İngiltere), bağımsız olarak aynı fikri ileri sürer: genç Dünya, organik moleküllerle dolu sıcak bir 'çorbaydı'.", "1924"),
    s("Miller-Urey Deneyi", "1953: Metan, amonyak, hidrojen ve suyun içinden elektrik akımı geçirildi — bir haftada amino asitler doğdu. Şimşek, cansız kimyadan canlıya ilk köprüydü.", "1953"),
    s("Enerji Menüsü", "UV ışığı, şimşek, volkan ısısı, meteor şokları: genç Dünya'da enerji bol, molekül sentezi sürekliydi. Milyonlarca yıl, tonlarca organik madde birikti.", "enerji kaynakları"),
    s("Polimerler ve Mikrosferler", "Amino asitler ısınan çamurda peptitlere, lipitlar kendiliğinden keseciklere (mikrosfer) toplandı: ilk 'hücre dışı' iskeletler kabaca vardı.", "organizasyon"),
    s("Modern Eleştiriler", "Erken atmosfer belki metan-zengin değildi (N₂+CO₂ hakim): Miller koşulları çok iyimserdi. Alternatif sahneler — derin deniz bacaları, mineral yüzeyler — devreye girdi.", "güncel tartışma"),
  ],
  "rna-dunyasi": [
    s("RNA'nın İki Yüzü", "DNA sadece bilgi taşır, protein sadece iş yapar. RNA İKİSİNİ DE yapar: hem kalıtım hem kataliz. Bu ikilik, ilk yaşamın anahtarıdır.", "temel fikir"),
    s("Ribozimlerin Keşfi", "1982: Thomas Cech, RNA'nın kendi kendini kesebildiğini gösterdi — protein olmadan enzim görevi! Nobel 1989: 'RNA da bir enzimdir.'", "1982"),
    s("Kendini Kopyalayan RNA", "Aranan molekül: kendi kopyasını çekebilen ribozim (RNA polimeraz ribozim). Laboratuvarda yüzlerce nükleotlik versiyonlar evrimleştirildi — henüz öz-kopyalama sınırında.", "in vitro evrim"),
    s("Ribozom Kanıtı", "Ribozom — protein fabrikası — çekirdeğinde PROTEİN YOK: tamamı RNA. Hücrenin en kalıcı makinesi RNA'dan yapılmış: RNA dünyasının canlı fosili.", "ribozom"),
    s("Geçiş: DNA + Protein Devri", "DNA daha kararlı (arşiv), protein daha yetenekli (araç): RNA dünyası, uzmanlaşmış iki ortağa evrildi. Geçiş mekanizması hâlâ araştırılıyor.", "geçiş"),
  ],
  "hidrotermal-baca": [
    s("Demir-Sülfür Dünyası", "Wächtershäuser 1988: yaşam, demir-sülfür mineral yüzeylerinde başladı — FeS + H₂S reaksiyonu, organik sentezin ilk katalizörüydü.", "1988 teorisi"),
    s("Alkali Bacalar", "Lost City (Atlantik): 90°C, pH 9-11, doğal nano-porozite. Alkali baca + asit okyanus = doğal proton gradyanı — hücre membranının ilk taslağı.", "Lost City"),
    s("Mineral Hücreler", "Demir sülfür membranları, mikro boşluklarda organik molekülleri hapseder: 'mineral hücre' — gerçek zarın öncüsü.", "kompartıman"),
    s("Proton Gradyeni", "Peter Mitchell'in kemosentez teorisi (Nobel 1978): tüm canlılar ATP'yi proton gradyanıyla üretir. Bacalar bu gradyanı hazır sunuyordu — evrensel metabolizmanın köküsü.", "kemosentez"),
    s("Asetil-CoA Yolu", "Bugünkü en 'ilkel' metabolizma (asetil-CoA yolu) hidrotermal koşulları işler: CO₂ + H₂ → organik. Bu yol, 4 milyar yıllık bir gelenektir.", "modern kanıt"),
  ],
  panspermia: [
    s("Uzaydan Tohumlar", "Svante Arrhenius 1903: yaşam, radyasyon basıncıyla yıldızlar arasında taşınan sporlardır. 'Panspermia' — her yerde tohum.", "1903"),
    s("Uzayda Hayatta Kalma", "Deinococcus radiodurans radyasyonu taş gibi yer; Tardigradlar vakumda 10 gün dayanır. 2021: bakteriler ISS dışında 3 yıl hayatta kaldı — sert ama bir yıldız yolculuğu için yetmez mi?", "deneysel"),
    s("Meteorit Kuryeleri", "ALH84001 (Mars meteoru) 1996'da 'mikro-fosil' iddiasıyla sarsıldı: sonuç belirsiz ama fikir canlandı. Dünya ve Mars, geçmişte birbirine taş fırlatmıştır.", "meteoritler"),
    s("Uzay Zaten Organik", "Moleküler bulutlarda glisin, meteoritlerde 70+ amino asit, kuyruklu yıldızlarda nükleobazlar: uzay, prebiyotik kimya deposudur. Soru: canlı kendisi mi taşındı, sadece hammade mi?", "uzay kimyası"),
    s("Sınırları", "Panspermia kökeni açıklamaz: ilk canlının nerede doğduğunu erteler. İster Dünya'da, ister uzayda — kimya bir yerde, bir kez yapmak zorunda.", "felsefi sınır"),
  ],
  "metabolizma-once": [
    s("Önce Ağ, Sonra Bilgi", "Gen-önce (RNA dünyası) alternatifi: metabolizma-önce. Önce kendini sürdüren kimyasal ağlar doğdu; RNA sonra bu ağın 'hafızası' oldu.", "temel ayrım"),
    s("Redox Motorları", "Demir-sülfür yüzeylerinde redox reaksiyonları kendi kendine döner: akış, bugünkü metabolizmanın elektrik devrelerinin atalarıdır.", "enerji akışı"),
    s("Otobesik Başlangıç", "CO₂ + H₂ → organik moleküller: dışarıdan besin beklemeden üretim. Bu 'otobesik' senaryo, bacalarla mükemmel uyumludur.", "sentez"),
    s("Ters Krebs Döngüsü", "RevTCA (ters sitrik asit döngüsü): CO₂'yi organiğe çeviren, enzim-siz mineral katalizde dönebilen evrensel bir ağ — metabolizmanın ilk taslağı olabilir.", "ağ topolojisi"),
    s("RNA'yı Beslemek", "Metabolizma-önce dünyası, RNA sentezi için ham madde + enerji üretir: iki teori düşman değil, ardışık olabilir. Ağ önce, bilgi sonra.", "sentez görüşü"),
  ],

  /* ----------------------------- 31-36 Evrim -------------------------------- */
  "dogal-secilim": [
    s("Galapagos 1835", "Genç Darwin, adalarda küçük farklar fark eder: her adada ayrı ispinoz gagası. On yıl sonra defterine şüphe yazılır: 'türler sabit değil.'", "1835"),
    s("Varyasyon + Filtre", "Bireyler farklıdır (varyasyon); kaynak sınırlıdır (mücadele); çevreye uyanlar çoğalır (seçilim). Basit üç adım — ama milyonlarca yıl uygulandığında devasa sonuç.", "mekanizma"),
    s("Uzun Zamanın Gücü", "Yılda %0,1'lik avantaj, 1000 kuşakta türü değiştirir. 4 milyar yıl, mikroskobik adımlarla bakteriden balinaya giden yol haritasıdır.", "zaman ölçeği"),
    s("Modern Kanıtlar", "Antibiyotik direnci (gerçek zamanlı evrim), endüstriyel koyulaşma (Biston betularia), çiçek-arı ortak evrimi: seçilim her gün çalışıyor.", "kanıt havuzu"),
    s("Yanlış Anlaşılma", "Seçilim 'en güçlüyü' değil, uyumluyu seçer; hedefi yoktur, planı yoktur. Tsuris değil — sonucun adı: uyum.", "kavramsal netlik"),
  ],
  "modern-sentetik": [
    s("Mendel'in Kayıp Yasaları", "1866: Mendel bezelyelerde kalıtımın 'parçacıklı' olduğunu gösterir. Makale 35 yıl unutulur — evrim teorisinin en büyük kayıp parçası.", "1866"),
    s("Büyük Sentez", "1930'lar: Fisher, Haldane, Wright — Mendel genetiği + Darwin seçilimi + istatistik = modern sentetik evrim teorisi. İki akım tek çatı altında birleşir.", "1930'lar"),
    s("Genetik Sürüklenme", "Seçilim tek güç değil: küçük popülasyonlarda şans (sürüklenme) alel frekanslarını yönlendirir. Wright'ın ada modeli — rastgelelik de evrimleştirir.", "sürüklenme"),
    s("Moleküler Saat", "1960'lar: protein dizileri mutasyon oranını gösterir — saat gibi düzenli birikir. Türler arası fark, ayrılma zamanını ölçer: paleontolojiye moleküler kronometre.", "moleküler saat"),
    s("Evo-Devo", "Gelişim biyolojisi katıldı: Hox genleri vücut planını yönetir. Az sayıda genin küçük değişimi, dev morfolojik sıçramalar üretebilir — sentez hâlâ büyüyor.", "evo-devo"),
  ],
  "kesintili-denge": [
    s("Fosil Boşluğu Sorunu", "Darwin'i rahatsız eden şey: fosil kaydında türler 'aniden' belirir, uzun süre değişmez, sonra kaybolur. Dengezi model bunu açıklamakta zorlanır.", "sorun"),
    s("Eldredge & Gould 1972", "Niles Eldredge ve Stephen Jay Gould: boşluk bir eksiklik değil, GERÇEK — evrim 'denge' ve 'atılım' ritmiyle ilerler.", "1972"),
    s("Staz: Değişmeyen Uzun Gece", "Türler milyonlarca yıl neredeyse hiç değişmez: sünger 600 milyon yıldır benzer, Ginkgo 200 milyon yıldır aynı yaprak — staz, evrimin varsayılan modudur.", "staz"),
    s("Periferik Spekiasyon", "Hızlı değişim küçük, izole popülasyonlarda olur: ana popülasyondan kopan bir grup, yeni çevrede hızla ayrışır. Fosilde 'sıçrama' görünen şey, periferideki hızlı ayrışmadır.", "mekanizma"),
    s("Tartışma: Derece mi Kader mi", "Darwinciler: sıçrama sadece zaman ölçeği meselesi. Gould: evrim tarihi tek yönlü değil, bağlamsal. Bugünkü uzlaşma: her ikisi de farklı ölçeklerde çalışır.", "güncel bakış"),
  ],
  endosimbiyoz: [
    s("Margulis'in İsyanı", "1967: Lynn Margulis, eukaryot hücrenin bir 'birlik' olduğunu ileri sürer — mitokondri ve kloroplast bir zamanlar özgür bakteriydi. Dergiler 15 kez reddetti.", "1967"),
    s("Kanıt 1: Çift Zar + Kendi DNA'sı", "Mitokondri iki zarlıdır (yutulanın dış zarı) ve kendi dairesel DNA'sını taşır — bakteri DNA'sına benzer, çekirdek DNA'sına değil.", "morfolojik kanıt"),
    s("İlk Yutma", "Bir arkea, bir alfaproteobakteriyi yuttu ama sindirmedi: enerji üretiminde ortaklık doğdu. ~2 milyar yıl önce — evrimin en büyük ortak girişimi.", "birleşme"),
    s("Enerji Patlaması", "Mitokondri, hücreye 10.000x enerji verir: büyük genomlar, karmaşık yapılar, çok hücrelilik — eukaryot devrimi bu enerji fazlasıyla mümkün oldu.", "sonuçlar"),
    s("Bugün Hâlâ Ortakız", "Likenden bağırsak mikrobiyotasına, kök mantar ortaklığına: endosimbiyoz bir olay değil, yaşamın kalıcı iş modelidir. 'Birey', bir topluluktur.", "modern görünüm"),
  ],
  "notral-evrim": [
    s("Kimura'nın Radikal İddiası", "1968: Motoo Kimura — proteinlerdeki mutasyonların çoğu seçilim için 'nötr'dür: görünmez ama birikir. Moleküler evrimin motoru çoğunlukla şanstır.", "1968"),
    s("Moleküler Saat Doğuyor", "Nötr mutasyonlar sabit oranda birikir: DNA farkı ≈ zaman. İnsan-şempanze ~%1,2 fark ≈ 6-7 milyon yıl — paleontolojiyle eşleşir.", "saat"),
    s("Sürüklenmenin Gücü", "Küçük popülasyonda nötr aleller şansla sabitlenebilir: Wright'ın ada modeli. Rastgelelik, moleküler düzeyde asıl şofördür.", "sürüklenme"),
    s("Kodon Bias", "Sinonom mutasyonlar (aynı amino asit) nötr sayılır ama bazı organizmalar 'sevilen' kodonları tercih eder: hafif seçilim bile nötrlüğün üstüne biner — sınırlar bulanık.", "ince detay"),
    s("Seçilim vs Nötrlük", "Tartışma 50+ yıldır sürer. Bugünkü uzlaşma: fenotip düzeyinde seçilim güçlüdür; moleküler düzeyde nötrlük/sürükleme hakimdir. İki motor, tek araba.", "uzlaşma"),
  ],
  lamarckizm: [
    s("Lamarck'ın Cesur Fikri", "1809: Jean-Baptiste Lamarck — türler değişir! Kullanılan organlar gelişir, kazanılan özellikler yavrulara geçer. İlk ciddi evrim teorisidir.", "1809"),
    s("Zürafa Argümanı", "Zürafa yapraklara uzanırken boynu uzar; bu 'kazanılan boyun' yavrulara kalır. Cazip, sezgisel — ama mekanizması yok.", "klasik örnek"),
    s("Weismann Bariyeri", "1892: August Weismann — 'germ plasm' (üreme hücreleri) vücut hücrelerinden bağımsızdır: kuyruğu kesilen farelerin yavruları kuyrukludur. Klasik Lamarckizm çöktü.", "1892"),
    s("Epigenetik Kısmi Dönüş", "21. yüzyıl: metilasyon, histon modifikasyonları birkaç kuşak kalıtabiliyor! 'Yumuşak kalıtım' var — ama DNA dizisi değişmiyor: klasik Lamarckizm hâlâ yanlış, ama tamamen de değil.", "epigenetik"),
    s("Bugünkü Bakış", "Lamarck'ın mekanizması yanlıştı ama sezgisi (çevre etkisi kalıtımı etkileyebilir) kısmen doğrulandı. Bilim, cesur hataları da anar.", "hakemlik"),
  ],

  /* ------------------------------ 37-41 Fermi ------------------------------- */
  "fermi-paradoksu": [
    s("Yaz Mutfak Sorusu", "1950: Los Alamos'ta yemek yerken Enrico Fermi aniden sorar: 'Peki, hepsi nerede?' Galakside milyarlarca yıldız var — hiç kimse mi yok?", "1950"),
    s("Drake Denklemi", "1961: Frank Drake, tartışmayı sayıya döker: yıldız oranı × gezegen × yaşam × zeka × teknoloji × ömür. Sonuç: galaksi dolu uygarlık olmalı — ama sessizlik var.", "1961"),
    s("Mesafe Zamanı", "Işık bile 4,2 yıl sürer en yakın yıldıza: galaksi çapında iletişim 100.000 yıl. Uygarlıklar belki var — birbirinden farkında değil.", "fizik engeli"),
    s("Cevap Adayları", "Yaşam nadir (Nadir Dünya), teknoloji kısa ömürlü (Büyük Filtre), sesli yayından kaçınıyorlar (Kara Orman) ya da biz ilkiz — her hipotez kendi sessizliğini öngörür.", "hipotezler"),
    s("Bugünkü Arayış", "SETI radyo dinliyor, James Webb atmosferlerde biyo-imza tarıyor, Breakthrough Listen 1 milyon yıldız dinliyor: sessizlik bile veridir — arayış sürüyor.", "bugün"),
  ],
  "buyuk-filtre": [
    s("Hanson'ın Filtresi", "1996: Robin Hanson — bir yerde (abiyojenez, ökaryot, teknoloji...) aşılması neredeyse imkânsız bir eşik var: Büyük Filtre. Sessizliğin adı bu.", "1996"),
    s("Filtre Adayları", "Yaşamın doğması? Ökaryot hücre (Dünya'da 1 kez!) Teknoloji? Kendini yok etme? Her aday, farklı bir gelecek öngörür.", "adaylar"),
    s("Bizden Önce mi Sonra mı", "Filtre geçmişteyse: biz nadiriz, umut var. Filtre gelecekteyse: önümüzde duvar var. İkinci senaryo, uygarlıkların kısa ömrlü olduğunu öngörür.", "korkutucu soru"),
    s("Mars Testi", "Eğer Mars'ta (veya Avrupa'da) bağımsız yaşam bulunursa: abiyojenez kolaydı → filtre ileridedir → kötü haber. Boş bulunursa: filtre geçmişte → iyi haber.", "gözlemsel test"),
    s("Pratik Çıkarım", "Hanson'ın tavsiyesi: hayatta kalmaya yatırım yap. Eğer filtre öndeyse, tek çıkış yolu — onu geçmek.", "çıkarım"),
  ],
  "kardasev-olcegi": [
    s("Enerji = Uygarlık", "1964: Sovyet astronom Nikolay Kardaşev, uygarlıkları enerji tüketimine göre sınıflandırır: bir uygarlık ne kadar güçlüyse, o kadar çok enerji yer.", "1964"),
    s("Tip I: Gezegen", "Ana yıldızından gelen tüm enerjiyi (Dünya için 10¹⁶ W) kullanır: hava, okyanus, deprem kontrolü. Biz Type 0,73'iz (Sagan ölçeği) — hâlâ fosil yakıt çağında.", "Tip I"),
    s("Tip II: Yıldız", "Ana yıldızın TÜM çıktısı: Dyson küresi/swarm. Güneş'in 10²⁶ W'u — uygarlık, yıldızı 'giyer'. Dyson kürelerin kızılötesi izi SETI'nin hedefidir.", "Tip II"),
    s("Tip III: Galaksi", "Galaksinin 100 milyar yıldızının enerjisi: milyonlarca Dyson küresi, yıldız mühendisliği. Tip III uygarlık galaksi kızılötesinde parlar — bugüne dek hiçbir aday bulunamadı.", "Tip III"),
    s("Biz Neredeyiz", "Sagan ölçeği: log10(W)/10 → biz 0,73. Tip I'e ulaşmak ~100-200 yıl, Tip II'ye ~birkaç bin yıl. Merdivenin ilk basamağındayız — enerjiye bak.", "konumumuz"),
  ],
  "nadir-dunya": [
    s("Ward & Brownlee 2000", "'Rare Earth': mikrobiyal yaşam belki yaygın, AMA karmaşık yaşam gezegende muhteşem bir şans dizesi ister — Dünya nadir bir istisna olabilir.", "2000"),
    s("Jüpiter Kalkanı", "Dev gezegen, kuyruklu yıldız ve asteroitleri çekerek iç sistemi korur: 1994 Shoemaker-Levy 9 çarpması — Jüpiter Dünya için süpürge görevi yaptı.", "koruyucu"),
    s("Dev Ay'ın Hediyesi", "Büyük Ay: eksen eğikliğini kararlı tutar (iklim salınımı az), gelgitlerle kıyı ekosistemleri kurar. Ay'sız Dünya, başıboş sallanan bir gemicik olabilir.", "ay etkisi"),
    s("Levha Tektoniği Termostatı", "Tektonik olmayan gezegende karbon-silikat döngüsü çalışmaz: CO₂ ya birikir (Venüs gibi) ya tükenir (Mars gibi). Tektonik, gezegen termostatıdır — Dünya'da biliyoruz ki nadir.", "termostat"),
    s("Galaktik Yaşanabilir Kuşak", "Çok merkezde: süpernova radyasyonu. Çok dışta: metal yoksulluğu. Yaşanabilir kuşak dar bir halkadır — Güneş tam üstünde, ama şans mı düzen mi?", "konum"),
  ],
  "kara-orman": [
    s("Liu Cixin'in Karanlık Ormanı", "2008: Çinli yazar Liu Cixin'in üçlemesinde evren bir karanlık ormandır: her uygarlık silahlı avcı, her açık konum hedeftir.", "2008 roman"),
    s("Avla veya Avlan", "İletişim kurmak = konumunu açıklamak. İlk vuran hayatta kalır: teknolojik patlama (bir uygarlığın 100 yılda devleşmesi) korkutur — önlemek mantıklıdır.", "strateji"),
    s("Işıklar Kapalı Neden", "SETI 60 yıldır dinliyor: hiçbir şey. Kara Orman öngörüsü: uygarlıklar BİLİNÇLİ olarak sessizdir — açık yayını yapanlar uzun yaşamamıştır.", "sessizlik"),
    s("Dünya'nın Açık Konumu", "Biz zaten duyurduk: Arecibo mesajı (1974), Voyager plakları, TV yayınlamız 100 yıldır ışık küresiyle yayılıyor. Geri dönüş yok — ormanda fener yaktık.", "bizim durumumuz"),
    s("Bilim mi Kurgu mu", "Roman bir hipotez değil, bir korku estetiğidir. Karşı argüman: ileri uygarlık muhtemelen korkuya gerek duymaz. Ama sessizlik gerçek — ve açıklaması hâlâ açık.", "değerlendirme"),
  ],

  /* ------------------------- Çekirdek 10 (gökyüzü) -------------------------- */
  "gunesin-dogusu": [
    s("Süpernova Kıvılcımı", "Komşu bir büyük yıldız patlar: şok dalgası, buluta dokunur ve çöküşü tetikler. Güneş'in doğum belgesinde bir süpernovanın imzası vardır.", "4,6 milyar yıl önce"),
    s("Toz Taneleri Tutunuyor", "Mikroskobik toz taneleri Van der Waals kuvvetiyle birbirine yapışır: milimetre → santimetre → metre. Yapışmak, evrenin ilk icadıdır.", "çöküş başlangıcı"),
    s("Turbülans Fırtınaları", "Genç disk, magnetorotasyonel türbülansla kaynar: gaz ve toz, içten dışa madde akışı kurar — gezegen tohumları bu akışta beslenir.", "disk dönemi"),
    s("Güneş'in Eşsiz Dönüşü", "Ekvatorda 25 günde, kutuplarda 35 günde bir tur: Güneş plazma topu olarak 'diferansiyel' döner — bu sürüklenme, manyetik alanın dinamosudur.", "yeni yıldız"),
    s("Gezegen Tohumları", "Pebble birikimi: santim boyu çakıllar, metrelik planetesimallere dakikalar içinde yapışır. Gezegenler, bu hızlı tohumlardan büyüdü.", "gezegen fabrikası"),
  ],
  "dunyanin-olusumu": [
    s("Kaçış Hızına Doğru Büyüme", "Birikim hızlanır: büyük gövde, yerçekimiyle daha çok toz çeker — runaway accretion. 10.000 yıl içinde Ay boyu gövdeler doğar.", "ilk 10.000 yıl"),
    s("Ay Boyu Çarpıcılar", "Dünya yörüngesinde onlarca Mars-Ay boyu 'embriyo' dolaşır: çarpışmalar devasa, füzyon kaçınılmaz. Gezegen, çarpışmaların eritilmiş toplamıdır.", "embriyo dönemi"),
    s("Su Teslimatı", "Karbon kondriti meteoritler su taşır: Dünya'nın okyanusları kısmen uzay teslimatıdır. İzotop oranı bu kaynağın parmak izini gösterir.", "su kaynağı"),
    s("İlk Atmosferin Kaybı", "Helyum-hidrojen ilkel atmosfer, genç Güneş'in şiddetli rüzgârıyla süpürülür: Dünya bir süre 'çıplak' kaya olarak dolaşır.", "atmosfer kaybı"),
    s("4,4 Milyar Yıllık Zirkonlar", "Jack Hills zirkonları Dünya'nın en eski kristalleri: 4,4 milyar yıl önce sıvı suyun varlığını kanıtlar — gezegen çok erken 'soğumuş'.", "kanıt"),
  ],
  "buyuk-carpma": [
    s("Theia'nın Doğum Yeri", "Theia, Dünya ile aynı yörüngede L4/L5 Lagrange noktasında büyüdü: aynı besin kaynağından iki gezegen embriyosi — kaderin komedyası.", "embriyo"),
    s("Eğik Darbe", "Çarpma açısı ~45°, hız saatte 40.000 km: yıkım değil, füzyon. İki çekirdek iç içe geçer, iki manto karışır — saniyeler içinde.", "çarpışma anı"),
    s("Demir Takası", "Sıcak çekirdekler demir takas eder: bugünkü Ay'ın küçük demir çekirdeği, bu takasın kanıtıdır — Ay neredeyse tamamen Dünya mantosundan yapılmıştır.", "kimya"),
    s("Roche Sınırının Ötesi", "Yırtılan moloz diski Roche sınırının dışında yoğunlaşır: sınır içindeki malzeme Dünya'ya düşer, dışındaki toplanıp Ay olur.", "disk"),
    s("Ay'ın Geri Çekilmesi", "Doğumda Ay 20.000 km'deydi (bugün 384.400 km): gelgit sürtünmesi onu yılda 3,8 cm dışarı taşır — lazer ölçümleri bunu milimetre hassasiyetiyle doğrular.", "bugüne yol"),
  ],
  "okyanuslarin-dogusu": [
    s("Buhar Sarmalı", "Sıcak Dünya, suyu atmosferde buhar olarak tutar: 200+ bar basınçlı devasa bir buhar atmosferi — yüzeyde bir damla su yoktur.", "buhar çağı"),
    s("Dev Yağmur", "Yüzey 100°C'nin altına inince yağmur başlar: binlerce yıl süren devasa yağış, çukurları doldurur. İlk okyanus, gökten boşalır.", "soğuma"),
    s("Geç Teslimat", "Buz gövdeli asteroitler (karbon kondrit) suyun son kısmını taşır: geç ağır bombardıman, okyanusu 'dolduran' ikinci musluktur.", "su teslimatı"),
    s("Asit Okyanus", "İlk okyanus CO₂ doygun, asidik ve demir-zengindi: bugünkü mavi okyanustan çok yeşil-gri bir denizdi.", "kimya"),
    s("Zirkonun Su Hafızası", "4,4 milyar yıllık zirkon kristallerindeki oksijen izotopları: soğuk suyla temas etmişler. Okyanus, Dünya'nın ilk yüz milyonunda vardı.", "kanıt"),
  ],
  "yasin-dogusu": [
    s("Lipit Kesecikler", "Ampifilik lipitlar suda kendiliğinden çift katman küreler kurar: zar, kimyanın en kolay 'icadı' — hücrenin duvarı hazır.", "zar"),
    s("LUCA: Son Ortak Ata", "Tüm canlıların son ortak atası: hidrotermal bir bakteri-arkea hibriti, anaerobik, H₂ ile beslenen, RNA+DNA karışık dünya yurttaşı.", "LUCA"),
    s("İlk Enzimler", "RNA ribozimleri kopyalanırken, proteinler katalizi devralır: enzimler, kimyanın hızını 10⁶ kat artırır — yaşamın mühendisleri.", "kataliz devri"),
    s("Fotosentez Devrimi", "Siyanobakteriler suyu parçalar, oksijen üretir: 2,4 milyar yıl önce atmosfer değişir (GOE). Oksijen önce zehir, sonra enerji kaynağı olur.", "GOE"),
    s("Çok Hücrelilik", "600 milyon yıl önce: hücreler iş birliğine girer — yapışma, iletişim, uzmanlaşma. Yaşamın en büyük sıçramalarından biri: birlik güçtür.", "çok hücre"),
  ],
  "saturnun-halkalari": [
    s("Halkalar Çok Genç", "Cassini verisi: halkalar 10-100 milyon yaşında — Satürn'den genç! Dinozorlar halkasız bir Satürn görmüş olabilir.", "yaş"),
    s("Buz Fabrikası", "Halkalar %99+ su buzudur: metre-kilometre boyutlu parçalar. Kaynak: yırtılan bir buz ay mı, kuyruklu yıldız çarpması mı — tartışmalı.", "buz kaynağı"),
    s("Çoban Uydular", "Prometheus ve Pandora gibi minik aylar, halka kenarlarını 'çobanlık' eder: F halkasını örgü gibi örerler — yerçekimi sanatı.", "çobanlar"),
    s("Cassini Bölmesi", "1675: Giovanni Cassini, halkalar arasında 4.800 km'lik boşluk fark eder: Mimas'ın 2:1 rezonansı, o bölgedeki parçaları temizler.", "1675"),
    s("Halkalar Ölüyor", "Halka yağmuru: buz parçacıkları Satürn'e düşüyor — halkalar 100-300 milyon yıl içinde kaybolabilir. Biz, onların gençlik fotoğrafına bakıyoruz.", "gelecek"),
  ],
  "marsin-kaderi": [
    s("Sıcak Gençlik", "4 milyar yıl önce Mars ılıktı: nehir yatakları, delta oluşumları, Jezero krateri bir göldü — Perseverance'ın keşfettiği yer.", "geçmiş"),
    s("Dinamo Durdu", "4,1 milyar yıl önce Mars'ın küçük çekirdeği soğudu: manyetik alan kapandı. Kalkan olmadan atmosfer savunmasız kaldı.", "kayıp kalkan"),
    s("Atmosfer Süpürüldü", "Güneş fırtınaları, kalkansız atmosferi milyonlarca yılda süpürür: MAVEN 2014'te bu süpürmeyi canlı olarak ölçtü.", "MAVEN"),
    s("Su Nereye Gitti", "UV, su moleküllerini parçalar: hafif hidrojen uzaya kaçar (izotop oran kanıtı), oksijen yüzeydeki demiri paslatır — Mars kırmızıdır çünkü su kaybetti.", "su kaybı"),
    s("Gelecek: Kırmızıdan Yeşile", "Teraform hayali: kutup buzunu eritmek, atmosferi kalınlaştırmak... Fizik mümkün kılabilir ama teknik ve etik engeller dev — şimdilik robotlar geziniyor.", "bugün"),
  ],
  "jupiterin-dogusu": [
    s("Kaya Çekirdek", "Jüpiter, 10-20 Dünya kütlesi silikat-buz çekirdekle başlar: diskteki ilk dev embriyo — diğerlerinden hızlı büyüyen.", "çekirdek"),
    s("Gaz Patlaması", "Çekirdek yeterince büyük olunca disk gazını hızla süpürür: 1 milyon yılda 300 Dünya kütlesi hidrojen-helyum — gezegen değil, mini yıldız eşiği.", "hızlı büyüme"),
    s("Hâlâ Sıcak", "Jüpiter, doğum ısısını hâlâ yayıyor: aldığından %60 daha fazla enerji ışır — 4,6 milyar yıllık bir 'yeni doğan' kızarıklığı.", "ışınım"),
    s("Büyük Kırmızı Leke", "350+ yıldır dönen fırtına: Dünya'dan büyük, saatte 430 km rüzgâr. Leke küçülüyor — belki biz onun son yüzyıllarını izliyoruz.", "fırtına"),
    s("Büyük Geçiş", "Nice modeli: Jüpiter önce içteydi, sonra dışa göç etti — Mars'ın küçüklüğünü ve asteroit kuşağının sıyrılmasını bu göç açıklar.", "geçiş"),
  ],
  "gunesin-olumu": [
    s("Yakıt Azalıyor", "5 milyar yıl sonra çekirdek hidrojeni %10'a düşer: füzyon yavaşlar, çekirdek büzülüp ısınır — dış katmanlar şişmeye başlar.", "erken yaşlanma"),
    s("Kırmızı Dev", "Yüzey 200 kata büyür, renk kızarır: Merkür ve Venüs yutulur, Dünya yörüngesi kenarında fırın olur — okyanuslar kaynar, kayalar yumuşar.", "dev evre"),
    s("Gezegen Sisi", "Dış katmanlar hafifçe uzaya salınır: gezegen sisi (planetary nebula) — ağır elementler bu rüzgârla galaksiye geri dağılır, yeni yıldızların tohumu.", "salınım"),
    s("Beyaz Cüce", "Kalan çekirdek: Dünya boyu, yarım Güneş kütlesi, 1 ton/cm³ yoğunluk — füzyon yok, sadece soğuyan bir atom kristali.", "kalıntı"),
    s("Siyah Cüceye Doğru", "10¹⁵ yıl içinde soğuyup görünmez olur (hipotetik: evren henüz o yaşta değil). Güneş'in mirası: gezegenler, ağır elementler ve belki biz.", "son"),
  ],
  "pangea-tektonik": [
    s("Manto Konveksiyonu", "Motor: çekirdek ısısı, manto kayaçlarını saniyede santimetre hızla döndürür — gezegenin iç ısısı, dış derisini oğuşturur.", "motor"),
    s("Okyanus Tabanı Yayılması", "Ortosedimanter sırtta yeni kabuk doğar, iki yana akar: Atlantik yılda 2-3 cm genişler — tırnak kadar ama 200 milyon yılda okyanus.", "sırtlar"),
    s("Dalma-Batma Zonları", "Eski soğuk kabuk, manto altına dalar: derin depremler, magmalar, volkan zincirleri. Pasifik Ateş Çemberi — gezegenin en canlı yara hattı.", "subduksiyon"),
    s("Süper Kıta Döngüsü", "Her 300-500 milyon yılda kıtalar toplanıp dağılır: Rodinya → Pangea → bugün. Döngü, iklimi ve evrimi yöneten büyük metronomdur.", "döngü"),
    s("Gelecek: Amasya", "250 milyon yıl sonra: yeni süper kıta (Pangea Ultima / Amasya). Afrika Rift'ü yarıyor, Avustralya kuzeye koşuyor — harita hâlâ canlı.", "gelecek"),
  ],
};
