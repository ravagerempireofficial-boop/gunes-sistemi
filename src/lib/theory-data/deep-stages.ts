import type { TheoryStage } from "../theories";

/**
 * deep-stages — HER teoriye 4 derinlik bölümü daha (toplam 196 yeni aşama).
 * Her teori 5 ekstra + 4 derinlik = 9 yeni bölüm kazanır; until değerleri
 * theories.ts içindeki extendStages() tarafından otomatik hesaplanır,
 * notes/cues yeniden hizalanır ve süre orantılı olarak uzar.
 */

export type DeepStage = Omit<TheoryStage, "until">;

const d = (title: string, text: string, era: string): DeepStage => ({
  title,
  text,
  era,
});

export const DEEP_STAGES: Record<string, DeepStage[]> = {
  /* ------------------------------ Kozmoloji --------------------------------- */
  "buyuk-patlama": [
    d("Kanıt Zinciri: Hubble'dan JWST'ye", "1929 Hubble galaksilerin uzaklaştığını gördü; 1964 Penzias-Wilson CMB'yi buldu; 1998 süpernovalar ivmelenmeyi; 2014 BICEP2 toz sanılan izler aradı. Her yeni teleskop, ilk saniyelerin bir sayfasını daha çevirdi.", "1929 → bugün"),
    d("Sayılarla İlk 3 Dakika", "Sıcaklık 10 milyar °C'den 1 milyara düştüğünde çekirdekler birleşmeye başladı: %75 hidrojen, %25 helyum, iz miktarda lityum. Bu oran bugün hâlâ ölçülüyor ve modeli onaylıyor.", "ilk 3 dakika"),
    d("Yaygın Yanlış: 'Patlama' Değil", "Big Bang bir boşluktaki patlama değildi — uzayın kendisi her yerde aynı anda gerilmeye başladı. Merkezi yok, kenarı yok; her gözlemci evrenden 'merkezde' gibi görür.", "kavram düzeltmesi"),
    d("Bugün: Sondalar ve Açık Sorular", "JWST beklenmedik 'erken' galaksiler görüyor; LISA 2030'larda yerçekimi dalgalarıyla ilk saniyeleri dinleyecek. Evrenin doğum belgesi, daha okunacak onlarca satırla dolu.", "bugün → 2030'lar"),
  ],
  "kozmik-enflasyon": [
    d("Kanıt: Düz Evren Problemi", "Bir balonca çizdiğiniz üçgenin açıları eğri olur; dev bir balonca da aynı. Enflasyon evreni o kadar büyüttü ki görülebilir bölge geometrik olarak düz çıktı — Planck uydusu Ω=1'i %0,5 hassasiyetle doğruladı.", "gözlem"),
    d("Sayılarla: 60 e-Kat", "Sadece 60 kat üstel büyüme yeter: 10⁻³⁵ m'lik tohum, 10⁻³² saniyede gözlenebilir evrenin tohumuna dönüşür. Bir elektrik enerjisi, bir milyar yılda değil — bir nefeste.", "10⁻³² sn"),
    d("Yaygın Yanlış: Işıktan Hızlı Genişleme", "Uzay, ışıktan hızlı genişleyebilir; özel görelilik bunu yasaklamaz. Yasak olan, uzay İÇİNDEKİ nesnenin ışığı yerel olarak geçmesidir — boşluğun kendisi serbesttir.", "kavram düzeltmesi"),
    d("Bugün: Graviton Sismografı", "Enflasyonun yerçekimi dalgaları CMB'nin B-modu polarizasyonunda iz bırakır. LiteBIRD uydusu (2032) bu 'sismograf'ı dinleyecek: algılarsa enerji ölçeği 10¹⁶ GeV doğrulanır.", "2032"),
  ],
  "lambda-cdm": [
    d("Kanıt: Altı Parametreli Şaheser", "Model sadece 6 sayı ile CMB tepe yapısını, galaksi kümelenmesini, süpernova mesafelerini ve evrenin yaşını (13,79 ± 0,02 milyar yıl) aynı anda açıklar — fizik tarihinin en başarılı özetlerinden biri.", "model doğrulaması"),
    d("Sayılarla: Görünmez Hakimiyet", "Birim küpte ortalama 0,7 proton var; ama karanlık maddenin kütlesi onun 5,4 katı, karanlık enerjinin etkisi 13 katı. 'Görünür evren' denilen şey, donmuş bir buzdağının ucu.", "bugün"),
    d("Yaygın Yanlış: Karanlık Enerji ≠ İtme", "Karanlık enerji bir 'antigravity' itme gücü değildir; boşluğun kendi gerilme enerjisinin yerçekimini tersine çeviren basınç etkisidir. Einstein denklemindeki Tμν teriminde oturur.", "kavram düzeltmesi"),
    d("Bugün: Euclid ve Roman Çağı", "Euclid (2024→) ve Nancy Roman (2027) milyarlarca galaksinin 3D haritasını çıkaracak: karanlık enerji sabit mi, yoksa zamanla değişiyor mu (w ≠ -1)? Cevap 2030'larda netleşecek.", "2024 → 2030'lar"),
  ],
  "coklu-evren": [
    d("Kanıt Arayışı: CMB Çarpışma Yaraları", "Komşu kabarcık bizim evrenimize dokunmuşsa CMB'de dairesel sıcaklık kalıntısı bırakır. Ekipler binlerce simülasyonla gerçek veriyi karşılaştırdı: 4 aday bölge bulundu, ama 'gözlem etkisi' olasılığı henüz dışlanamadı.", "arayış"),
    d("Sayılarla: 10⁵⁰⁰ Vakum", "Sicim teorisinin manzarası, gözlemlenebilir evrendeki atom sayısından (10⁸⁰) bile tamamen kopuk bir sayı öngörür: 10⁵⁰⁰. Her vakum farklı sabitler, farklı yıldızlar, belki farklı kimya demektir.", "teori"),
    d("Yaygın Yanlış: 'Kanıtlanamaz = Bilim Değil'", "Bazı çoklu evren imzaları (B-modlar, çarpışma diskleri, Hubble gerilimi) prensipte test edilebilir. Popper'ın ölçütü bir teorinin kendisine değil, öngörülerine uygulanır — bu yüzden tartışma felsefi de olsa bilimseldir.", "felsefe + bilim"),
    d("Bugün: Anthropic Ders Kitabı Oldu", "Üniversitelerde 'ince ayar ve gözlemci seçilimi' artık ders konusu. Steven Weinberg'in Λ tahmini (1987, anthropik), 1998'de ölçüldüğünde doğru çıktı — çoklu evren düşüncesi, tahmin gücü gösterdi.", "1987 → 1998"),
  ],
  "dongusel-evren": [
    d("Kanıt: LIGO'nun Döngü Testi", "Penrose'un CCC'si önceki eonların süpernovalarından düşük frekanslı yerçekimi dalgası fırtınaları öngörür. LIGO verisi bu 'yalpak spektrum' izini aradı: 3σ'ya yaklaşan ipuçları var, 5σ kanıt henüz yok.", "2015 → bugün"),
    d("Sayılarla: 10¹⁰⁰ Yıllık Kapanış", "En uzun yaşlı süperkütleli kara delik bile Hawking buharlaşmasıyla ~10¹⁰⁰ yılda kaybolur. Son kara delik buharlaşınca evren 'ölçeksiz' olur — Penrose'a göre yeni bir Big Bang için gereken tek koşul bu.", "10¹⁰⁰ yıl"),
    d("Yaygın Yanlış: 'Evren Sıkışıp Yeniden Patlıyor' Değil", "Döngüsel kuantum kütleçekiminde (LQC) çöküş asla tekilliğe ulaşmaz: yoğunluk 10⁹⁶ kg/m³'te kuantum itme devreye girer. 'Büyük Çöküş' değil, 'Büyük Sıçrayış' (bounce) olur.", "kavram düzeltmesi"),
    d("Bugün: Kuantum Simülasyonları", "Kuantum bilgisayarlar LQC denklemini simüle etmeye başladı; sonuçlar tekilliğin gerçekten 'yumuşadığını' gösteriyor. Eğer doğruysa Big Bang bir duvar değil — bir geçitti.", "2020'ler"),
  ],
  "steady-state": [
    d("Kanıt: Radyo Galaksi Sayımı", "1950'lerin Cambridge radyo kataloğu (3C) uzak (genç) evrende radyo kaynaklarının 10 kat yoğun olduğunu gösterdi. Ryle'ın sayımları, sabit yoğunluk öngörüsünü doğrudan çürüttü.", "1955-1965"),
    d("Sayılarla: Hoyle'un Hesabı", "Metreküpte yüzyılda bir hidrojen atomu yaratmak, gözlenen genişlemeyi telafi eder: üstel büyüme katsayısı H≈70 km/sn/Mpc için gereken yaratım hızı saniyede m³ başına ~10⁻⁴⁷ kg'dır — ölçülemeyecek kadar az, ama toplamda galaksi doldurur.", "hesap"),
    d("Yaygın Yanlış: 'Hoyle Tamamen Yanıldı'", "Hayır: yıldız nükleosentezi (karbon ve oksijenin üretimi), 'Big Bang' adının takma şekli ve sabit durum yarattığı tartışma ortamı — kozmolojiye kalıcı katkılarıydı. Modeli öldü, bilim adamı olarak mirası yaşadı.", "tarihçe"),
    d("Bugün: Nicel Yanılgı Dersi", "Sabit durum modeli, 'zarif ama gözlemle yüzleşmeyen teori' kategorisinin ders kitabı örneğidir. Modern kozmoloji bu dersi unutmaz: her model, sayım verisiyle yüzleşmek zorundadır.", "ders"),
  ],
  ekpirotik: [
    d("Kanıt Arayışı: CMB'nin Düşük Frekans Yalpağı", "Enflasyon yerine brana çarpışması, CMB'nin en büyük açılı ölçeklerinde daha az güç öngörür. WMAP/Planck verisi tam da bu bölgede anomalilik gösteriyor — ancak 'evrenin doğum sesi mi, istatistiksel şans mı' tartışması sürüyor.", "gözlem"),
    d("Sayılarla: Trilyon Yıllık Ritim", "İki brana yaklaşması, ekstra boyutun ölçeğine bağlı: tipik modellerde döngü ~10¹² yıl. Evrenin yaşı (13,8 milyar yıl) bu ritmin henüz ilk turu içinde sayılır.", "10¹² yıl"),
    d("Yaygın Yanlış: 'Ekstra Boyutlar Fantezisi'", "Ekstra boyutlar estetik tercih değil, matematiksel zorunluluk: yerçekimi gradyasyon denklemleri 11 boyutta daha zarif çözülüyor. LHC'de mikro kara delik arayışı boş çıktı ama simülasyonlar ölçeği henüz dışlamadı.", "kavram düzeltmesi"),
    d("Bugün: Brana Fiziğinin Mirası", "Randall-Sundrum modelleri, holografik ilkeyle birleşerek AdS/CFT yazışmasına gitti. Ekpirotik evren kazanmasa da fikirleri, kara delik bilgisinden yoğunluk matrisine uzanan bir araştırma hattı doğurdu.", "miras"),
  ],
  "simulasyon-teorisi": [
    d("Kanıt Arayışı: Kuantum Ölçüm Bağımlılığı", "Eğer evren 'izlenmediğinde hesap yapmıyorsa', ölçüm yapan gözlemcinin müdahalesi fiziksel sonuç değiştirir. Çift yarık deneyi bunu gerçekten gösterir — ama bu, kuantum mekaniğinin doğal davranışı olabilir de.", "deney"),
    d("Sayılarla: Hesaplama Maliyeti", "Yalnızca Güneş Sistemi'ni parçacık seviyesinde simüle etmek, saniyede ~10⁵⁰ işlem ister. Dünya'nın toplam işlem kapasitesi ~10²⁰ — aradaki fark, 30 kat enerji santrali demek. Uygarlık seviyesi I bile yetmez.", "hesap"),
    d("Yaygın Yanlış: 'Planck Uzunluğu = Piksel'", "Uzay-zaman 10⁻³⁵ m altında 'anlamsızlaşır' ama bu bir ekranın piksel ızgarası değildir — kuantum yerçekiminin doğal ölçeğidir. Simülasyon teorisi buna dayanamaz; kanıt değil, göstergedir.", "kavram düzeltmesi"),
    d("Bugün: Felsefi Ders", "Simülasyon olsa bile dünya 'sahte' değildir: deneyim gerçek, acı gerçek, kuantum yasaları gerçek. Teorinin gerçek değeri, 'gerçeklik nedir' sorusunu fizik dersine sokmuş olmasıdır.", "felsefe"),
  ],

  /* -------------------------------- Fizik ---------------------------------- */
  "klasik-mekanik": [
    d("Kanıt: Ay'ın Elması", "Newton, Ay'ın yörünge ivmesi ile elmanın düşme ivmesini aynı formülle hesapladı: değerler %1 içinde uyuştu. 'Gök ile yer aynı yasaya tabidir' cümlesi, modern bilimin doğum belgesidir.", "1687"),
    d("Sayılarla: Üç Yasanın Kapsamı", "F=ma ile köprüler, uçaklar, roketler, gezegen yörüngeleri hesaplanır. Voyager 1, 1977'de fırlatıldığında neredeyse yalnızca Newton mekaniğiyle rotası çizilmişti — bugün 24 milyar km uzakta, saniyede 17 km ile hâlâ doğru rotada.", "uygulama"),
    d("Yaygın Yanlış: 'Atalet Hız Değil Durum'", "Cisim hızlanmıyorsa kuvvet yoktur; hareket eden her şeye bir 'güç' uygulandığı düşünülür (Aristoteles hatası). Newton bunu yıktı: uzayda motor kapatsan da gidersin.", "kavram düzeltmesi"),
    d("Bugün: Göreliliğin 'Hatırlatıcısı'", "GPS uyduları her gün 38 mikrosaniye kayar — Newton bunu açıklamaz. Ama köprü mühendisi, uçak tasarımcısı ve futbolcu hâlâ Newton yaşar: gündelik hızlarda klasik mekanik %99,999 doğrudur.", "bugün"),
  ],
  "ozel-gorelilik": [
    d("Kanıt: Müon Deneyi", "Atmosfer üstünde doğan müonlar, ışık hızına yakın geldikleri için 'daha yavaş yaşar' ve deniz seviyesine ulaşır. Akceleratörde saat 0,9994c hızlı müonların ömrü 29 kat uzar — Einstein'ın formülü milisaniye milisaniye doğru.", "1941 → bugün"),
    d("Sayılarla: E = mc² Neye Değer", "1 gram madde tamamen enerjiye dönüşse 9×10¹³ joule eder: 21 kiloton TNT — Hiroşima bombasının yaklaşık 3 katı. Güneş saniyede 4,3 milyon ton kütleyi saf ışığa çevirir.", "enerji denklemi"),
    d("Yaygın Yanlış: 'Her Şey Görelidir'", "Tam tersi: teorinin adı 'görelilik ilkesi'nden gelir ama en büyük katkısı MUTLAK olan şeyi bulmaktır — ışık hızı ve nedensellik (neden-sonuç sırası) her gözlemci için değişmezdir.", "kavram düzeltmesi"),
    d("Bugün: CERN'in Gündelik Göreliliği", "LHC'de protonlar %99,999999c hızla döner; kütleleri 7.000 kat 'görünür'. Görelilik artık laboratuvar gündemi — akceleratör manyetik alanları bu etkiyi hesaba katmadan tasarlanamaz.", "bugün"),
  ],
  "genel-gorelilik": [
    d("Kanıt: gravitational Lensing Kataloğu", "1919 ekliptik tutulmada ışık sapması ölçüldü; bugün Euclid ve DES, yüz milyonlarca galaksinin 'halka' (lens) efektini kataloğa geçirdi. Kütleçekimi ışığı büker — evrenin kendi büyütecidir.", "1919 → bugün"),
    d("Sayılarla: Kara Deliklerin Sınırı", "Olay ufku yarıçapı r_s = 2GM/c²: Güneş için 3 km, Dünya için 9 mm, Sgr A* için 12 milyon km. 2022'de EHT bu devin fotoğrafını çekti — gölge çapı, Einstein'ın denklemiyle milimetre hassasiyetinde uyuştu.", "2022"),
    d("Yaygın Yanlış: 'Kütleçekimi Kuvvettir'", "Einstein'a göre kütleçekimi kuvvet değildir: kütle-enerji uzay-zamanı büker, cisimler sadece 'düz' jeodezik boyunca serbest düşer. Yerçekimi hissi, yüzeyin seni jeodeziden saptırmasından gelir.", "kavram düzeltmesi"),
    d("Bugün: Yerçekimi Dalgası Astronomisi", "LIGO-Virgo-KAGRA yılda düzinelerce kütleçekimi dalgası yakalıyor; LISA 2035'te uzayda dinleyecek. Kütleçekimi artık 'görülen' değil, 'duyulan' bir olgu — kozmik ses çağı başladı.", "2015 → 2035"),
  ],
  "kuantum-alan": [
    d("Kanıt: Elektron G Factor", "Elektronun manyetik momenti, QED'in 12. dereceden hesabıyla 10¹² hassasiyetle uyuşur: 2,00231930436... Bu, fizikte ölçülen en doğru sayıdır — teori ile deney 13 hanede eşleşir.", "QED doğrulaması"),
    d("Sayılarla: Vakum Kaynaması", "Boşluk, m³ başına ~10⁻⁹ joule 'sıfır nokta enerjisi' taşır (ölçülen üst sınır). Casimir levhaları arasında ölçülen itme, bu sanal parçacık denizinin gerçek baskısıdır.", "Casimir"),
    d("Yaygın Yanlış: 'Parçacık = Küçük Top'", "Parçacık, alandaki bir uyarılma (quantum)'dır. Elektron, 'elektron alanının' bir titreşimidir — top değil, dalganın lokalize hâli. Çift yarıkta kendi kendine girişim yapması bundandır.", "kavram düzeltmesi"),
    d("Bugün: Standart Modelin Eksik %5'i", "Standart Model parçacık fiziğinin 'periyodik tablosudur' ama karanlık madde, nötrino kütlesinin kaynağı ve yerçekimini içermez. LHC bugün bu üç boşluğu dolduracak tek imza arıyor.", "bugün"),
  ],
  "sicim-m-teorisi": [
    d("Kanıt Arayışı: Süper Simetri Süper Partnerleri", "Sicim teorisi süpersimetri öngörür: her parçacığın ağır 'süper partneri' olmalı. LHC bugüne dek hiçbir süper partner bulamadı — bu, teoriyi yanlışlamaz ama doğal çözüm aralığını daralttı.", "LHC sonuçları"),
    d("Sayılarla: 10 Boyut + 1 Zaman", "M-teorisi 11 boyut gerektirir; 7'si Planck ölçeğinde 'kıvrılmış' (Calabi-Yau manifoldu). Kıvrılma şekli, parçacık kütleleri ve kuvvet şiddetlerini belirler — geometri fizik olur.", "matematik"),
    d("Yaygın Yanlış: 'Sicimler Test Edilemez'", "Teori doğrudan test edilemez AMA dolaylı öngörüleri var: süper simetri, ekstra boyutlu yerçekimi sızıntısı, kosmolojik sabitin küçük değeri. AdS/CFT yazışması kara delik entropisini doğru hesapladı — bu bir başarıdır.", "kavram düzeltmesi"),
    d("Bugün: AdS/CFT Devrimi", "Maldacena'nın 1997 yazışması, kara delik bilgisini ve yoğun maddelerdeki kuantum faz geçişlerini (kuarç-gluon plazması, yüksek-T süper iletkenler) çözmede kullanılıyor. Sicim matematiksel bir araç olarak zaten kazandı.", "1997 → bugün"),
  ],
  "dongusel-kuantum": [
    d("Kanıt Arayışı: CMB'de Bounce İzleri", "LQC, önceki çöküşün CMB'de hafif bir asimetri bırakmasını öngörür: 'nongaussian' iz. Planck verisi bu izi aradı, sonuç henüz belirsiz — ama öngörü test edilebilir olduğu için bilimseldir.", "gözlem"),
    d("Sayılarla: Kritik Yoğunluk", "Kuantum sıçrayışı, yoğunluk 10⁹⁶ kg/m³'ü aştığında tetiklenir: atom çekirdeği yoğunluğunun 10⁶² katı. Bu değer Planck ölçeğinden türetilir ve evrenin 'maksimum' sıkışabilirliğinin sınırıdır.", "sınır"),
    d("Yaygın Yanlış: 'Tekillik Kanıtlıdır'", "Tekillik, genel göreliliğin kuantum etkileri ihmal ettiği için öngördüğü bir yapayzektir. LQC'nin gösterdiği gibi, kuantum düzeltmeler tekilliği kaldırır — 'evrenin başlangıcı' bir duvar değil, bir sıçrayış olabilir.", "kavram düzeltmesi"),
    d("Bugün: Loop Kuantum Kütleçekimi Topluluğu", "Dünya çapında 40+ araştırma grubu LQC denklemlerini çözmeye çalışıyor; kuantum bilgisayarlar simülasyona katıldı. Big Bounce senaryosu, 'Big Bang'den öncesi var mı' sorusuna ilk somut matematiksel cevap.", "bugün"),
  ],
  "holografik-evren": [
    d("Kanıt: Kara Delik Entropisi", "Bekenstein-Hawking entropisi hacimle değil YÜZEYLE ölçeklenir: S = A/4. Bu, 'bilgi bir kürenin yüzeyinde kodlanır' demektir — holografik ilkenin en güçlü kanıtı. AdS/CFT bunu tam anlamıyla kanıtladı.", "temel kanıt"),
    d("Sayılarla: Bit Başına Planck Alanı", "Bir kara deliğin olay ufkuna her Planck alanı (10⁻⁷⁰ m²) 1 bit bilgi taşır: Dünya kütlesinde bir kara delik ~10⁷⁷ bit — bütün internetin 10⁵⁴ katı. Evrenin 'belleği' yüzeyindedir.", "hesap"),
    d("Yaygın Yanlış: 'Biz Bir Ekranızda Yaşıyoruz'", "Holografik ilke, 3D fizik 2D yüzeyde tam olarak kodlanabilir demektir — 'sahte dünya' demek değildir. Bir kitabın bilgisi kağıtta; ama hikâye 3D'dir. İkisi de gerçek.", "kavram düzeltmesi"),
    d("Bugün: Kuantum Yerçekim Programı", "'It from qubit' programı (John Wheeler'ın felsefesi), uzay-zamanın kuantum dolaşıklıktan 'örüldüğünü' öngörüyor. Stanford/IAS grupları ER=EPR eşitliğiyle bu fikri matematiksel temele oturtuyor.", "2013 → bugün"),
  ],
  "yildiz-nukleosentezi": [
    d("Kanıt: Hoyle Durumu", "Karbonun yıldızda oluşması için 7,65 MeV'de bir 'rezonans' seviyesi olmalıydı — Fred Hoyle bunu öngördü, Caltech'te deneyle bulundu. Teori, deney öncesi bir rezonans tahmin etmişti: fizikte nadir bir zafer.", "1953"),
    d("Sayılarla: Yıldızların Mutfak Saati", "Güneş tipi yıldız 10 milyar yıl hidrojen yakar; 1 M☉ yıldız 10 milyar, 10 M☉ yıldız sadece 30 milyon yıl. Süpernova ile saçılan kül, bir sonraki yıldız sisteminin tohumudur — senin demirin bir süpernovadan.", "ölçek"),
    d("Yaygın Yanlış: 'Yıldız Ateş Yanır'", "Yıldızlar kimyasal yakıt yanmaz: füzyon, çekirdek tepkimesidir. Sıcaklık 15 milyon °C, basınç 250 milyar atmosfer — bu bir 'ateş' değil, plazma halinde sürekli termonükleer reaktör.", "kavram düzeltmesi"),
    d("Bugün: r- ve s-süreç Simülasyonları", "FRIB (Michigan) 2022'de açıldı: düzinelerce asla sentezlenmemiş izotopun ömrünü ölçerek nükleosentez ağlarını gerçek zamanlı test ediyor. Periyodik tablonun 'nereden' hikâyesi artık laboratuvar verisiyle yazılıyor.", "2022 → bugün"),
  ],
  "r-sureci": [
    d("Kanıt: 1987A Süpernovası", "Büyük Macellan Bulutu'ndaki SN 1987A patlamasında neytrino patlaması saptandı — teorik öngörüyle tam uyuştu. Bu patlamada r-süreç elementlerinin (altın, platin) ilk tohumları atıldı.", "1987"),
    d("Sayılarla: 1 Saniyede Altın", "r-süreç bir saniyeden az sürer: serbest nötron akısı 10²² nötron/cm²·sn — çekirdekler nötron yağmurunda 'boğulur', sonra beta bozunmasıyla altın ve platin gibi ağır elementlere çözülür.", "kinetik"),
    d("Yaygın Yanlış: 'Altın Süpernovadan Gelir'", "Hayır: GW170817 kilonovası (2017) gösterdi ki asıl r-süreç fabrikası nötron yıldızı birleşmeleridir. Süpernovalar katkıda bulunur ama esas imza, iki nötron yıldızının çarpışmasından gelir.", "2017 düzeltmesi"),
    d("Bugün: Kilonova Takip Çağı", "LIGO yılda onlarca birleşme yakalıyor; teleskoplar her birini saatler içinde tarıyor. Her kilonova, altın-platin-uranyum fabrikasının 'canlı yayın' görüntüsüdür — periyodik tablonun son gizemli satırları çözülüyor.", "bugün"),
  ],
  diferansiyasyon: [
    d("Kanıt: Sismolojik Tarama", "Dünya depremleri gezegeni 'ultrason' gibi tarar: P dalgası sıvı çekirdeği geçemez, gölge bölgesi 105-140° arasıdır. Bu gölge bölgesi, dış çekirdeğin sıvı olduğunu 1906'dan beri kanıtlar.", "1906 → bugün"),
    d("Sayılarla: Magma Okyanusu Dönemi", "Dünya oluşumundan 50 milyon yıl sonra tüm yüzey 1.500 °C magma okyanusuydu. 10 milyon yıl içinde demir damlaları mantodan süzüldü: çekirdek oluşumu (diferansiyasyon) ~30 milyon yılda tamamlandı.", "4,55 → 4,50 milyar yıl"),
    d("Yaygın Yanlış: 'Gezegen Eşit Küre'", "Gezegenler katı top değildir — katmanlı bir çözeltiler sistemi: yoğunlukla sıralanmış katmanlar (kabuk/manto/çekirdek) kimyasal farklılaşmanın ürünüdür. Jeoloji bu katmanların hikâyesidir.", "kavram düzeltmesi"),
    d("Bugün: Exoplanet İç Yapıları", "Kepler/TESS verisiyle yabancı gezegenlerin yoğunluğundan iç yapıları hesaplanıyor: bazı süper-Dünyalar 'elmas manto'lu, bazı mini-Neptünler su-buhar manto'lu olabilir. Diferansiyasyon, evrensel bir kuraldır.", "bugün"),
  ],
  "agir-bombardiman": [
    d("Kanıt: Ay Taşlarının Tarihçesi", "Apollo taşları kristalleşme yaşları 4,4-3,9 milyar yıl arasında yoğunlaşır: bu, ~3,9 milyar yıl önce dev bir bombardıman dönemini işaret eder — 'Geç Ağır Bombardıman' (LHB) hipotezinin temel kanıtı.", "Apollo verisi"),
    d("Sayılarla: Krater Sayımı", "Ay'ın görünür yüzünde 5.185 krater >20 km; 39 adı >300 km. Dünya'da bunların çoğu silinmiştir ama Kanada'daki Sudbury (250 km, 1,85 milyar yıl) ve Güney Afrika Vredefort (300 km, 2 milyar yıl) izleri hâlâ durur.", "istatistik"),
    d("Yaygın Yanlış: 'Bombardıman Tek Bir Patlama'", "LHB bir 'patlama' değil, 20-200 milyon yıllık sürekli bir yağmurdı. Nedeni büyük olasılıkla dev gezegenlerin göçü: Jupiter içe, Satürn dışa kaydıkça asteroid kuşağı bozuldu.", "model düzeltmesi"),
    d("Bugün: Asteroid Madenciliği Çağı", "Osiris-Rex Bennu'dan örnek getirdi (2023), Hayabusa2 Ryugu'dan (2020): örnekler LHB döneminin kimyasal tanıklarını taşıyor. 'Bombardıman' yıldızları yok etti ama su ve organikleri de getirdi.", "2020 → bugün"),
  ],
  "hidrotermal-damar": [
    d("Kanıt: VMS Yatakları", "Dünyada 1.000'den fazla 'volkanik masif sülfür' (VMS) yatağı var: Kanada Kidd Creek, İspanya Rio Tinto, Kıbrıs Troodos. Hepsi eski okyanus tabanlarının kıtaya eklenmiş parçalarıdır — eski bacakların fosil bacakları.", "coğrafya"),
    d("Sayılarla: Sıcaklık ve Basınç", "Baca sıvısı 350-400 °C'de çıkar; 200 atm basınç altında kaynamaz. Metal taşımak için Cl⁻ iyonlarına ihtiyaç var: 1.000 ppm Cl, bakteriye 1.000 kat daha fazla metal çözündürür.", "kimya"),
    d("Yaygın Yanlış: 'Bacalar Hep Sıcak'", "'Kara dumanlılar' sıcak (300-400 °C), 'beyaz dumanlılar' soğuk (100-200 °C) ve zengin bakırdır. Soğuk bacalar, ilginç biyolojik kimyanın (metan ve sülfür redox) daha verimli olduğu yerlerdir.", "sınıflandırma"),
    d("Bugün: Deniz Altı Madenciliği Tartışması", "Papua Yeni Gine açıklarında Solwara-1 projesi bakır-altın çıkarmayı hedefliyor: 1.600 m derinlikte bacalar 1.000 km² alanı zenginleştirir. Ekosistem kaybı vs. metal ihtiyacı — çağın gerçek ikilemi.", "bugün"),
  ],
  "magmatik-ayrisma": [
    d("Kanıt: Bushveld Kompleksi", "Güney Afrika'daki Bushveld, 65.000 km²'lik dev bir magmatik tabaka: içinde dünyanın platinin %75'i ve kromun %90'ı var. Katmanların 'kristal aldatmacası' (kristal yerleşimi) mükemmel bir doğal laboratuvar.", "jeoloji"),
    d("Sayılarla: Bowen Tepki Serisi", "Mineraller soğurken belli bir sırayla kristalleşir: olivin → piroksen → amfibol → biyotit; ve plajiyoklaz kalsik→sodik. Bu 'Bowen serisi', magmanın evrimini tahmin etmenin periyodik tablosudur.", "1922"),
    d("Yaygın Yanlış: 'Magma Hep Aynı'", "Hayır: bazaltik manto magması (45-52% SiO₂) yüzeye yakın; granitik (65-75% SiO₂) kabukta eriyik oluşur. Kıtanın 'kabuğu' = eriyiklerin zenginleşmesi = magmatik ayrişmanın birikmiş sonucu.", "kimya düzeltmesi"),
    d("Bugün: Lityum ve Nadir Toprak Çağı", "Elektrikli araçlar lityuma aç: Lityum-Cesium-Tantal (LCT) pegmatitleri, dev magmatik ayrişmanın ürünüdür. Jeologlar artık 'nereye bakacağını' Bowen serisi ve fraksiyonasyon modeliyle hesaplıyor.", "bugün"),
  ],
  sedimantasyon: [
    d("Kanıt: Katmanların Okunması", "Sedimanter kayalar gezegenin %75'ini kaplar ama hacmin sadece %5'idir — çünkü yüzeyde oluşur. Her katman bir 'sayfa': çamur, kum, kireç, tuz; okunan şey iklim ve zamanın sayfasıdır.", "temel ilke"),
    d("Sayılarla: 1 mm / Yıl", "Tipik bir derin deniz çamuru 1 mm/yıl birikir; deltasal ortamda 10 mm/yıl. 1 km katman = 1-10 milyon yıl. Ama kompresyonla 1 km katman 100 m hacme iner: stratigrafi matematiksel bir denge oyunu.", "hız"),
    d("Yaygın Yanlış: 'Katmanlar Hep Yatay'", "Hayır: çapraz katlanma (cross-bedding), dalga izleri, kuruma çatlakları — bunlar sedimanın depositional ortamını anlatır. Çapraz katmanlı kum taşı, eski bir nehir yatağıdır; ripple taş, eski bir kıyı.", "yapısal ipuçları"),
    d("Bugün: Karbon Yakalama Hedefi", "Sedimanter havzalar CO₂ depolamanın ana hedefi: basenlerdeki gözenekli kumtaşı 2-4 km derinlikte süperkritik CO₂'yi hapseder. Sedimoloji artık iklim mühendisliğinin temel bilimidir.", "bugün"),
  ],
  "biyojenik-cevherlesme": [
    d("Kanıt: BIF Demir Bantları", "Dünyanın demir rezervinin %90'ı 'bantlı demir formasyonu' (BIF): 3,8-1,8 milyar yıl önce fotosentetik siyanobakteriler oksijen üretti, okyanustaki Fe²⁺ oksitlendi ve dibe çökeldi — sezonluk bantlar oluşturarak.", "3,5 → 1,8 milyar yıl"),
    d("Sayılarla: Oksijen Dökümü", "BIF'ler ~10²⁰ kg demir oksit içerir: bunun için ~5×10¹⁹ kg O₂ gerekir — atmosferin bugünkü O₂ içeriğinin 100 katı. Siyanobakteriler 1 milyar yıl boyunca okyanusu 'demir arıtarak' oksijenlendirdi.", "stokiyometri"),
    d("Yaygın Yanlış: 'Cevher Hep Magmatik'", "Hayır: manganez (Kalahari), fosfat (Florida), uranyum (Kazakistan sandstone) ve sülfür (biofilm) birikimlerinin çoğu biyojeniktir. Mikroorganizmalar gezegenin madenciliğini 3 milyar yıldır yapıyor.", "sınıflandırma"),
    d("Bugün: Biyomadencilik", "Biyolüazyo (biomining) ile bakteriler düşük dereceli bakır ve altın çıkarmada kullanılıyor: Atacama'daki tesisler yılda 200.000 ton bakır üretiyor. Cevherleşmenin geleceği, mikroorganizmaların ortak çalışmasıdır.", "bugün"),
  ],

  /* ------------------------------- Yaşam ----------------------------------- */
  "ilkel-corba": [
    d("Kanıt: Miller-Urey'nin Mirası", "1953 deneyi 11 amino asit üretti; 2008'de orijinal numuneler yeniden analiz edildi: 22 amino asit — bir proteindekilerden fazlası. Deney modern ekipmanla tekrarlandı: hidrotermal koşullarda sonuç daha da zengin.", "1953 → 2008"),
    d("Sayılarla: Kimyasal Envanter", "Erken okyanusta 10⁻⁶ mol/L amino asit, m² başına yılda 10⁷ reaksiyon. 100 milyon yılda 10²⁴ deneme — bir protein katlanması için gereken olasılık (10⁻¹⁵⁰) bile bu sayıyla başarılabilir değil: bu yüzden 'kendi kendine organizasyon' mekanizmaları aranıyor.", "hesap"),
    d("Yaygın Yanlış: 'Corba Bir Havuzdu'", "Hayır: erken okyanus çok sıcak ve asitliydi; organikler denizde değil, kuruyan göletlerin ve göl kenarlarının 'kuru-kuru ıslak' döngülerinde yoğunlaşmış olabilir. Yüzey, derinden daha verimli bir kimya laboratuvarıydı.", "ortam düzeltmesi"),
    d("Bugün: Otokatalitik Ağlar", "Stuart Kauffman'ın 'otokatalitik set' fikri, bugün yapay zekâ destekli kimya simülasyonlarıyla test ediliyor: bir molekül diğerinin oluşumunu katalizlerse, ağ kendiliğinden 'canlı' davranış sergileyebilir.", "bugün"),
  ],
  "rna-dunyasi": [
    d("Kanıt: Ribozim Keşfi", "1982 Cech ve Altman: RNA hem bilgi taşır hem kataliz yapar (ribozim). Nobel 1989. Bu keşif, 'önce protein mi DNA mı' döngüsünü kırdı: RNA ikisini de yapabilirdi.", "1982-1989"),
    d("Sayılarla: 4 Harflik Hayat", "RNA 4 nükleotit ile 10⁶⁰ olası 20-mer dizisi üretir. Ribozimlerin sadece 10⁻¹²'si katalitik; ama 100 milyon yıllık kimyasal seçilim bunu aşar. RNA dünyası, seçilimin kimyasal öncüsüdür.", "olasılık"),
    d("Yaygın Yanlış: 'RNA Yaşamın Başlangıcı'", "RNA dünyası bir 'aşama' değil, bir 'geçiş' hipotezidir: daha önce daha basit bir kimya (PNA, TNA, mineral katalizi) olabilir. RNA, ilk şampiyon değil — ilk galibiyeti getiren ekip olabilir.", "kavram düzeltmesi"),
    d("Bugün: mRNA Revolüsyonu", "COVID aşıları, RNA'nın bilgi taşıyıcılığını terapiye çevirdi: 2023 Nobel. Aynı teknoloji kanser aşıları ve gen düzenleme için çalışılıyor — RNA dünyası hipotezi, tıbbın geleceğini de aydınlattı.", "2020 → bugün"),
  ],
  "hidrotermal-baca": [
    d("Kanıt: Lost City Hidrojen Fabrikası", "Atlantik'teki Lost City bacaları, serpantinleşmeyle 1 saniyede m² başına 10⁻⁶ mol H₂ üretir — biyoloji için saf enerji, güneşsiz. Bu bacalar 30.000 yıldır aktif ve kendi ekosistemine sahip.", "2000 keşfi"),
    d("Sayılarla: Serpantin Kimyası", "Olivin + H₂O → serpantin + H₂ + metan: bu redoks tepkimesi, membran ve metabolizma için gereken proton gradyanını kendiliğinden üretir. Nick Lane'ın modeli, canlı hücrenin 'enerji motorunu' baca kimyasından alır.", "kimya"),
    d("Yaygın Yanlış: 'Bacalar Kaynar, Yaşam Olmaz'", "Tam tersi: 'beyaz dumanlı' bacalar 40-90 °C'de çalışır ve Alkalen (pH 9-11) sıvı üretir. Asitli okyanusla (pH 5,5) karşılaşınca doğal proton gradyanı doğar — hücre membranının öncüsü olabilir.", "ortam düzeltmesi"),
    d("Bugün: Europa ve Enceladus'a Bakış", "Jüpiter'in Ayı Europa ve Satürn'ün Ayı Enceladus'un buz altı okyanuslarında benzer hidrotermal bacalar bekleniyor. NASA Europa Clipper (2024→) ve Enceladus misyonları, 'ikinci genesis'i arıyor.", "2030'lar"),
  ],
  panspermia: [
    d("Kanıt: Meteoritlerdeki Organikler", "Murchison meteoriti (1969) 70+ amino asit taşıdı; Ryugu örneği (2022) 20 amino asit ve B vitamini bileşikleri içeriyordu. Uzayda organik kimya yaygındır — bu, panspermiayı 'mümkün' kılar, 'kanıtlamaz'.", "1969 → 2022"),
    d("Sayılarla: Hayatta Kalma Testi", "Bakteri sporları uzayda 6 yıl (LDEF deneyi) canlı kaldı; Tardigradlar 10 gün açık uzayda dayandı. Ancak kilometrelerce yolculukta UV ve kozmik ışın 10⁶ kat daha öldürücü — kaya koruması şart.", "deneysel limitler"),
    d("Yaygın Yanlış: 'Panspermia Kaynağı Açıklar'", "Hayır: Panspermia sorunu 'nasıl' değil, 'nereden' sorusunu erteler. Yaşam bir gezegenden diğerine taşınmışsa, ilk doğuş yine bir yerde kimyasal olarak gerçekleşti — panspermia bir taşıma mekanizmasıdır, köken açıklaması değil.", "mantık düzeltmesi"),
    d("Bugün: Mars Örnek Dönüşü", "Mars Sample Return (2030'lar) Mars toprağını getirecek: eğer marsiyal mikrofosil bulunursa, 'lithopanspermia' (kaya ile taşınma) hipotezi ciddiyet kazanır. İki gezegen, tek biyosfer olabilir mi?", "2030'lar"),
  ],
  "metabolizma-once": [
    d("Kanıt: Wächtershäuser'in Demir-Kükürt Dünyası", "1988: FeS + H₂S tepkimesi, serbest enerji üretir ve organik sentezi katalizler. Bu, 'ilk metabolizma' için kimyasal bir motordur — güneşsiz, membransız, genetik olmadan.", "1988"),
    d("Sayılarla: Redoks Merdiveni", "CO₂ → format → asetat → piruvat: her basamak ~20-50 kJ/mol enerji açığa çıkarır. Bu merdiven, bugünkü hücrelerin (asetil-CoA yolu) kullandığı yolun aynısıdır: metabolizma, 4 milyar yıldır aynı merdiveni kullanıyor.", "biyokimya"),
    d("Yaygın Yanlış: 'Metabolizma Genetikten Önce' mi?", "Tartışma sürüyor: Günümüzde hibrit modeller öne çıkıyor — mineral yüzeylerde metabolik ağlar kurulur, ama RNA benzeri moleküller stabilizasyon için gerekli. 'Önce/sonra' değil, 'birlikte' olabilir.", "tartışma"),
    d("Bugün: Yapay Metabolizma", "Chemputer ve mikroakışkan reaktörler, 'yapay metabolizma' deniyor: enerji akışı ile otokatalitik döngüler kuruluyor. Eğer başarılı olursa, 'yaşam' tanımı laboratuvarın kriterine göre yeniden yazılır.", "bugün"),
  ],

  /* ------------------------------- Evrim ----------------------------------- */
  "dogal-secilim": [
    d("Kanıt: Galapagos Fincan Kuşlarının DNA'sı", "Grant'lar 40 yıl boyunca fincan kuşlarını ölçtü: kuraklık yıllarında daha büyük gagalar (büyük tohum), ıslak yıllarda küçük gagalar. Seçilim yılda ölçülebilir — laboratuvara gerek yok, doğa 'canlı deney'dir.", "1973 → 2014"),
    d("Sayılarla: Bakteri Deneyi", "Lenski'nin E. coli uzun vadeli deneyi (1988→): 75.000+ nesil, 12 popülasyon. Bir kolonide sitrat kullanımı evrimleşti (2003): 'imkânsız' bir mutasyon, binlerce nesillik ön adımlar sonrası geldi.", "1988 → bugün"),
    d("Yaygın Yanlış: 'Evrim Rastgeledir'", "Mutasyon rastgeledir, seçilim DEĞİLDİR. Seçilim, çevreyle etkileşimin kaçınılmaz sonucudur: kararlı, yönlü ve ölçülebilir. 'Rastgele' kelimesi, teorinin en büyük yanlış anlaşılmasıdır.", "kavram düzeltmesi"),
    d("Bugün: CRISPR ve Yapay Seçilim", "CRISPR ile laboratuvar seçilimi DNA seviyesinde yönlendirilebilir: tarımda 10.000 yılda yapılan (buğday domestikasyonu), şimdi 10 yılda yapılıyor. Seçilim, insanın elinde bir tasarım aracı oldu.", "2012 → bugün"),
  ],
  "modern-sentetik": [
    d("Kanıt: DNA Fosilleri", "100.000 yıllık mamut kemiğinden DNA dizilendi (2021): 1,2 milyon yıllık diş DNA'sı bile okundu. Fosil kaydı artık sadece kemik değil — moleküler arşiv.", "2013 → 2021"),
    d("Sayılarla: Gen Akışı Haritası", "İnsan-genomda Neandertal DNA'sı %1-4 (Avrupalılarda), Denisovan %4-6 (Okyanusyalılarda). Türler arası gen akışı, 'türler kesin ayrıdır' fikrini yıktı — evrim bir ağ, değil ağaç.", "2010 → bugün"),
    d("Yaygın Yanlış: 'Evrim Sadece Doğal Seçilim'", "Modern sentetik teori 5 mekanizma içerir: seçilim, mutasyon, genetik sürüklenme, gen akışı ve non-random mating. Küçük popülasyonlarda sürüklenme, seçilimden daha güçlü olabilir — 'şans' da evrim yapar.", "kavram düzeltmesi"),
    d("Bugün: Populasyon Genetiği ile Tahmin", "Polygenic risk skorları ile hastalık riski hesaplanır; tarımda genomic selection 2 kat hızlı ıslah sağlar. Evrim teorisi artık öngörü makinesi — 'geçmişin açıklaması' değil, geleceğin hesabı.", "bugün"),
  ],
  "kesintili-denge": [
    d("Kanıt: Burgess Shale Patlaması", "Kanada'daki Burgess Shale (508 milyon yıl) 65.000+ fosil, 100+ yeni vücut planı: 10 milyon yılda trilobit, anemon, kürk böceği ve Anomalocaris birden ortaya çıktı. Bu, 'kesintili denge'nin en iyi örneği.", "1909 keşfi"),
    d("Sayılarla: Tür Yaşam Süresi", "Fosil kaydında ortalama bir tür 1-10 milyon yıl yaşar; ama türleşme olayı 10.000-100.000 yılda (jeolojik anlık) gerçekleşir. Gould-Eldredge'in 'kesintili' dediği şey bu hız farkıdır.", "istatistik"),
    d("Yaygın Yanlış: 'Darwin Yanıldı'", "Hayır: Darwin de 'türler ani görünür' sorununu biliyordu — 'eksik fosil kaydı' demişti. Kesintili denge, Darwinizm'in reddi değil, tamamlamasıdır: seçilim hızlı küçük popülasyonlarda en etkilidir.", "tarihçe düzeltmesi"),
    d("Bugün: Evo-Devo ve Hox Genler", "Gelişim biyolojisi, 'ani morfolojik değişimleri' Hox gen düzenlemeleriyle açıklıyor: tek mutasyon (Ubx geni) böceklerin 6 bacaklı olmasını belirledi. 'Ani' türleşmenin moleküler mekanizması bulundu.", "1980 → bugün"),
  ],
  endosimbiyoz: [
    d("Kanıt: Mitokondriyal DNA", "Mitokondri kendi dairesel DNA'sına, kendi ribozomlarına ve çift membrana sahiptir: bakteri izleri. İnsan mitokondriyal genomu 16.569 bp — bakteri kolonisine benzer, çekirdek DNA'sına değil.", "1963 → 1978"),
    d("Sayılarla: 1,45 Milyar Yıllık Ortaklık", "Mitokondriyal endosimbiyoz ~1,45 milyar yıl önce gerçekleşti; kloroplast ~1,2 milyar yıl önce. O zamandan beri mitokondri genlerinin %99'u çekirdeğe taşındı — ortaklık, tam entegrasyona dönüştü.", "zaman çizelgesi"),
    d("Yaygın Yanlış: 'Simbiyoz Nadir'", "Hayır: bağırsak bakterileri (10¹⁴ hücre), kök nodülleri (azot fiksasyonu), liken (alg + mantar), korall (zooxanthellae) — yaşamın büyük sıçramaları çoğunlukla ortaklıklardır. 'Bireysel' yaşam, kuraldan çok istisna.", "kavram düzeltmesi"),
    d("Bugün: Sentetik Simbiyoz Mühendisliği", "Tarımda bakteri-fungal simbiyozlarla azot ihtiyacı azaltılıyor: 'sentetik topluluklar' (syncoms) ile buğday %30 daha az gübreyle yetiştirilebiliyor. Endosimbiyoz artık bir tarım teknolojisi.", "bugün"),
  ],
  "notral-evrim": [
    d("Kanıt: Moleküler Saat", "Zuckerkandl-Pauling (1965): hemoglobinin amino asit değişimi zamana yakın oranda birikir. Nötr teori bunu açıklar: mutasyonların çoğu nötr, seçilimsiz birikir — moleküler saat takibin anahtarı oldu.", "1965 → 1968"),
    d("Sayılarla: Sürükleme Ağırlığı", "İnsan popülasyonunda her nesil ~60 yeni mutasyon doğar; %5'i hafif zararlı, %95'i nötr. Nötr mutasyonlar 1/(2N) olasılıkla sabitlenir — büyük popülasyonda şansın etkisi küçüktür, küçük popülasyonda hüküm sürer.", "matematik"),
    d("Yaygın Yanlış: 'Nötr = İşlevsiz'", "Hayır: 'nötr' sadece o anki seçilim baskısı altında işlevsiz demektir. Çevre değişince nötr varyasyonlar hızla anlamlı olur — genetik çeşitlilik, evrimin 'yedek parça deposu'dur.", "kavram düzeltmesi"),
    d("Bugün: Nearly Neutral Teorisi", "Tomoko Ohta'nın 'neredeyse nötr' teorisi (1973): küçük popülasyonlarda hafif zararlı mutasyonlar da nötr gibi davranır. Bu, moleküler evrimin gerçek dengesini açıklar — bugün standart model.", "1973 → bugün"),
  ],
  lamarckizm: [
    d("Kanıt: Epigenetik Miras", " Stockholm'deki 1890 kıtlığı: torunların metabolik genlerinde methionine değişiklikleri ölçüldü — büyükanne kıtlığı, torunun kalp hastalığı riskini 2 kat artırdı. Çevre, gen ifadesini nesil boyu değiştirebilir.", "ödeyim verisi"),
    d("Sayılarla: 100 Nesillik İz", "C. elegans'ta küçük RNA'lar 100 nesle kadar kalıtsal etki gösterir (2011). Memelilerde 2-3 nesil epigenetik etki kanıtlı — 'yumuşak kalıtım' tamamen fantezi değil, sınırı bilinen bir olgu.", "deneysel veri"),
    d("Yaygın Yanlış: 'Lamarck Tamamen Yanıldı'", "Kazanılmış özelliklerin 'genetik olarak' kalıtıldığı fikri yanlıştır; ama epigenetik kalıtım (DNA dizisi değişmeden) 3 nesil çalışır. Lamarck'ın mekanizması yanlıştı, gözlemi kısmen doğruydu.", "tarihçe"),
    d("Bugün: Epigenetik Tıp", "Kanser epigenetiği, toksin maruziyet izleri ve tarımda stres belleği — 'çevre-gen etkileşimi' artık klinik bir alan. Evrim teorisi, epigenetik katmanla zenginleşti: Extended Synthesis.", "bugün"),
  ],

  /* ------------------------- Çekirdek (Gök Cismi) -------------------------- */
  "gunesin-dogusu": [
    d("Kanıt: Meteorit Yaşı", "CAI'ler (kalsiyum-alüminyum açısından zengin inklüzyonlar) 4,567 milyar yıl: Güneş Sistemi'nin 'doğum sertifikası'. Bu mineraler, güneş sisinin ilk 2 milyon yılında yoğuştu — hepsi bir kütüphane kartı gibi tarihli.", "4,567 milyar yıl"),
    d("Sayılarla: Kütle Dengesi", "Güneş sisteminin kütlesinin %99,86'sı Güneş'te; gezegenler geri kalan %0,14'ü paylaşır. Diskin 'kaybolan' kütlesi (%50-80) genç Güneş'in rüzgârlarıyla süpürüldü — bir yıldız, doğumunda çok savurgandır.", "kütle dağılımı"),
    d("Yaygın Yanlış: 'Gezegenler Güneş'ten Koptu'", "Hayır: gezegenler diskte toz-buz birikmesiyle (akresyon) oluştu; Güneş'ten koptuğu fikri 18. yüzyıl fantezisi. Güneş, kardeşlerinin en büyüğü — hepsi aynı diskten doğdu.", "kavram düzeltmesi"),
    d("Bugün: ALMA Genç Diskleri Görüyor", "ALMA, T Tauri yıldızlarının çevresinde halka ve boşluklu diskler görüyor (HL Tauri, 2014): gezegenlerin 'inşaat şantiyelerini' doğrudan fotoğraflıyor. Güneş'in doğuşu artık bir hikâye değil — gözlenen bir süreç.", "2014 → bugün"),
  ],
  "dunyanin-olusumu": [
    d("Kanıt: Hafenyum-Tungsten Saati", "¹⁸²Hf → ¹⁸²W bozunma saati (9 milyon yıl yarı ömür): Dünya'nın çekirdek ayrımı 30-50 milyon yılda tamamlandı. Bu, 'gezegen oluşumu çok yavaştır' fikrini yıktı — gezegen, astronomik bir an'da doğdu.", "izotop saati"),
    d("Sayılarla: 100 Milyon Yıl Inşa", "Planetesimal → protoplanet → gezegen: 10⁶ yıl 100 km cisimler, 10⁷ yıl Ay boyutu, 10⁸ yıl tam gezegen. Merkür 3 milyon, Dünya 50 milyon, gaz devleri 10 milyon yılda tamamlandı.", "zaman ölçeği"),
    d("Yaygın Yanlış: 'Dünya Eski Bir Gezegen'", "Hayır: Dünya, sistemin 'geç' büyük gezegenidir — Mars 5, Jüpiter 10 milyon yılda bitti ama Dünya 50-100 milyon yılda. Yavaş oluşum, büyük çarpmanın ve Ay'ın doğuşunun nedenidir.", "kavram düzeltmesi"),
    d("Bugün: Dev Disk Simülasyonları", "GPU kütlesel simülasyonlar 10⁶-10⁷ parçacıkla gezegen doğuşunu modelliyor: 'Grand Tack' ve 'Nice' modelleri, Güneş Sistemi'nin düzenini ve Dünya'nın suyunu açıklıyor. Doğuşumuz, artık bilgisayarda izlenebilir.", "bugün"),
  ],
  "buyuk-carpma": [
    d("Kanıt: Ay'ın Kimyasal Parmak İzi", "Ay kayaları Dünya ile izotopik olarak neredeyse aynı oksijen izotoplarını taşır (Δ¹⁷O ≈ 0): Ay, büyük kısmı Dünya'nın mantosundan yapıldı. Yabancı bir cisim olsaydı imza farklı olurdu.", "Apollo izotopları"),
    d("Sayılarla: Theia'nın Boyutu", "Simülasyonlar Theia'nın Mars boyutunda (%10-45 Dünya kütlesi) ve ~45° eğik çarptığını gösteriyor: çarpma enerjisi 10³¹ joule — bir yüzey, saat içinde magma okyanusuna döner.", "enerji hesabı"),
    d("Yaygın Yanlış: 'Ay Dünya'dan Koptu'", "George Darwin'in 1898 'fission' hipotezi yaygındı ama Pasifik Havzası yaşı (200 milyon yıl) Ay'dan çok genç. Çarpma-akresyon modeli hem kütle hem açısal momentumu doğru açıklar.", "tarihçe düzeltmesi"),
    d("Bugün: Exomoon Oluşumu", "Kepler/TESS eksoplanet uyduları arıyor: büyük çarpma modeli, 'dev gezegen + büyük uydu' sistemlerini öngörür. Dünya-Ay sistemi belki de sıradan — ama bizim için paha biçilmez: gelgitler, stabilité, ve belki yaşam.", "bugün"),
  ],
  "okyanuslarin-dogusu": [
    d("Kanıt: Zirkonların Δ¹⁸O İmzası", "4,4 milyar yıllık Jack Hills zirkonları, 'süper'-¹⁸O içerir: bunlar su ile etkileşmiş magma'dan doğmuştur — 4,4 milyar yıl önce likit su vardı. 'Okyanus çok geç geldi' fikri çöktü.", "2001 keşfi"),
    d("Sayılarla: 270 Milyon Ton Su / Yıl", "Erken Dünya'da kuyrukluyıldızlar ve C-tipi asteroitler yılda 10⁸-10⁹ kg su getirdi: 100 milyon yılda okyanus hacmi tamamlandı. Bugünkü okyanus 1,4×10²¹ kg — bunun %100'ü dış kaynaklıdır.", "kütle bütçesi"),
    d("Yaygın Yanlış: 'Su Komik Bir Kuyrukluyıldızdan'", "Hayır: kuyrukluyıldızların D/H izotop oranı okyanusun 2 katı — bunlar ana kaynak olamaz. Ana kaynak C-tipi asteroitler (D/H uyuşuyor). Kuyrukluyıldızlar belki %5-10 katkı.", "izotop düzeltmesi"),
    d("Bugün: Hayabusa2 ve Osiris-Rex Sonuçları", "Ryugu ve Bennu örnekleri 'ılımlı organik + kil + su' taşıyor: bu tip cisimler, erken Dünya'ya suyu getiren sınıfın canlı örnekleri. Su, artık bir 'gizem' değil — bir teslimat protokolü.", "2020 → bugün"),
  ],
  "yasin-dogusu": [
    d("Kanıt: 3,48 Milyar Yıllık Stromatolit", "Avustralya Dresser Formasyonu'nda 3,48 milyar yıllık stromatolitler: mikrobidal matların katmanlı fosilleri. Biyolojik kökeni izotopik (¹²C zenginliği) ve morfolojik olarak kanıtlı.", "3,48 milyar yıl"),
    d("Sayılarla: 100 Milyon Yıllık Pencere", "Okyanuslar 4,4 milyar yıl önce oluştu; ilk yaşam izi 3,8-3,5 milyar yıl önce: yaşam, 'kimyasal olarak mümkün' olduktan sonra 100-300 milyon yılda başladı. Bu, evrende hızlı bir süreç demektir.", "zaman penceresi"),
    d("Yaygın Yanlış: 'Yaşam Bir Mucize An'", "Hayır: yaşam bir 'an' değil, bir geçiş sürecidir: kimyasal ağlar → protosellüler → hücreler. Bu süreç bugün laboratuvarda aşama aşama yeniden kurulmaya çalışılıyor.", "kavram düzeltmesi"),
    d("Bugün: LUCA'nın Genomu", "Genom karşılaştırmaları ile LUCA'nın (tüm yaşamın son ortak atası) ~355 geni tahmin edildi: hidrotermal baca metabolizması, RNA + DNA hibrit. LUCA'nın yaşam tarzı, erken yaşamın ortamını ele veriyor.", "2016 → bugün"),
  ],
  "saturnun-halkalari": [
    d("Kanıt: Cassini Kütle Ölçümü", "Cassini'nin halkaların kütleçekimi ölçümü: halka kütlesi ~1,5×10¹⁹ kg (Mimas'ın %40'ı). Bu kütle genç bir sistemi işaret eder — 4 milyar yıllık olsaydı kütle ve toz daha farklı olurdu.", "2017"),
    d("Sayılarla: 100 Milyon Yaşında Halkalar", "Halkaların yaşı 10-100 milyon yıl: Jürisitik dönemde, Dünya'da dinozorlar varken Satürn halkaları doğuyor. İki yöntem (toz birikimi + kütleçekimi) aynı sonucu veriyor.", "tarihleme"),
    d("Yaygın Yanlış: 'Halkalar Kalıcı'", "Hayır: 'ring rain' ile halkalar saniyede 10 ton su Satürn'e düşüyor; 100-300 milyon yılda halkalar tamamen kaybolacak. Biz, halkaların 'gençlik döneminde' yaşıyoruz — şanslıyız.", "zaman düzeltmesi"),
    d("Bugün: Moons as Ring Source", "Cassini verisi: halkaların kaynağı büyük olasılıkla yıllar önce parçalanan bir buz uydusu (Chrysalis hipotezi, 2022). Uydu parçalanması + gelgit etkisi → halkalar + Satürn'nün eğikliği açıklanıyor.", "2022 modeli"),
  ],
  "marsin-kaderi": [
    d("Kanıt: Mars'ın Manyetik Cenaze", "Mars Global Surveyor, kabukta manyetik şeritler buldu: 4,1 milyar yıl önce dinamometre durdu. Bu, atmosferin kaybının ve iklim çöküşünün ana nedeni — çekirdek soğudu, kalkan kapandı.", "1997 → 2008"),
    d("Sayılarla: Atmosferin Kayıp Yüzdesi", "MAVEN verisi: Mars atmosferinin %66'sı uzaya kaçtı (solar rüzgâr ile), 2 barlık erken atmosfer bugün 0,006 bar. Kalan CO₂ kutup buzullarında ve karbonatlarda hapsedilmiş durumda.", "MAVEN ölçümleri"),
    d("Yaygın Yanlış: 'Mars Hep Ölüydü'", "Hayır: Perseverance verisi, Jezero kraterinin göl çökeltileri ve organik moleküller içeriyor: Mars 3,8-3,5 milyar yıl önce yaşanabilir'di. 'Ölü gezegen' değil — erken ölümün bir kurbanı.", "2021 → bugün"),
    d("Bugün: Terraform Fizibilitesi", "Mars'ı ısıtmak için CO₂ sublimasyonu yeterli değil (bugünkü rezerv 0,02 bar verir): nano-toz veya Manyetik kalkan senaryoları konuşuluyor. 'Mars'ı canlandırma' bir mühendislik fantezisi — ama fizik kuralları net.", "bugün"),
  ],
  "jupiterin-dogusu": [
    d("Kanıt: Juno'nun Çekirdek Fotoğrafı", "Juno'nun kütleçekim haritası: Jüpiter'in çekirdeği 'dilute' (karışmış) — klasik 10 M⊕ çekirdek değil, 15-25 M⊕'luk seyreltik bir bölge. Bu, Jüpiter'in doğuşunda dev bir çarpma yaşadığını işaret eder.", "2017 → 2022"),
    d("Sayılarla: 3-5 Milyon Yıllık Pencere", "Jüpiter, gaz diski buharlaşmadan önce (3-5 milyon yıl) 50-100 M⊕'a ulaşmalıydı: Core Accretion modeli bu pencereyi ancak 'pebble accretion' ile açıklar — çakıl büyümesi, gaz yakalamanın anahtarı.", "model"),
    d("Yaygın Yanlış: 'Jüpiter Hep Yerde Durdu'", "Hayır: 'Grand Tack' modeli (2011) — Jüpiter 3,5 AU'ya içeri girdi, Satürn ile rezonansa girip geri çekildi. Bu göç, Mars'ın küçüklüğünü ve asteroit kuşağın boşluğunu açıklar.", "2011 modeli"),
    d("Bugün: 'Jüpiter Kalkanı' Tartışması", "Jüpiter Dünya'yı kuyrukluyıldızlardan korur mu? Yeni simülasyonlar tam tersini gösteriyor: Jüpiter bazen asteroitleri içe yollar. 'Kalkan' efsanesi, 'aile üyesi' gerçeğiyle değişiyor.", "bugün"),
  ],
  "gunesin-olumu": [
    d("Kanıt: Çevredeki planetary Nebulalar", "Helix Nebula ve Ring Nebula: Güneş tipi yıldızların cenaze görüntüleri. Spektroskopide C, O, N zenginliği — yıldızın içi, dışarı fışkırmış. Bu, 5 milyar yıl sonramızın fotoğrafı.", "gözlemsel karşılaştırma"),
    d("Sayılarla: Kırmızı Dev 1 AU Büyür", "Güneş kırmızı dev aşamasında yarıçapı 0,9-1,2 AU'ya ulaşır: Merkür ve Venüs yutulur, Dünya sınırda (gelgit sürtünmesi kaderi belirler). Ama sıcaklık: Dünya yüzeyi 2.000 °C — gezegen erir.", "ölçek"),
    d("Yaygın Yanlış: 'Güneş Patlayacak'", "Hayır: Güneş 8 M☉ altında: süpernova OLMAZ. Kaderi: kırmızı dev → planetary nebula → beyaz cüce. Beyaz cüce, Dünya boyutunda ama 200.000 °C — bir elmas kadar yoğun, bir nehir kadar sessiz.", "sınıflandırma"),
    d("Bugün: Beyaz Cüce Yaşamı", "Beyaz cüce 10¹⁵ yılda soğur: bu, evrenin yaşının 100.000 katı. 'Siyah cüce' henüz hiç var olmadı — evren yaşlı ama genç. Güneş'in cenazesi, uzak geleceğin en güzel manzarası olabilir.", "uzak gelecek"),
  ],
  "pangea-tektonik": [
    d("Kanıt: GPS ile Levha Hızları", "GPS ağı levhaların yıl-da 2-10 cm hareket ettiğini doğrudan ölçer: Pasifik 10 cm/yıl, Atlantik 2,5 cm/yıl. Wegener'in 'kıta kayması' fikri, bugün milimetre hassasiyetle ölçülen bir mühendislik gerçeği.", "1980 → bugün"),
    d("Sayılarla: 250 Milyon Yıllık Döngü", "Süper kıtalar her 400-600 milyon yılda bir kurulur: Kenorland (2,7 Ga), Nuna (1,8 Ga), Rodinya (1,1 Ga), Pangea (335-175 Ma). Sonraki: 'Amasia' — 200-250 milyon yıl sonra.", "süper kıta döngüsü"),
    d("Yaygın Yanlış: 'Levhalar Kabukta Yüzer'", "Hayır: Levhalar 'litosfer'dir (kabuk + üst manto) ve manto konveksiyonunun ÜST tabakasıdır. Motoru: manto konveksiyonu + slab çekme (çekilen plaka) + okyanus sırtı itmesi. Kabuk sadece 'deri'dir.", "kavram düzeltmesi"),
    d("Bugün: Deprem Öngörü ve Jeotermal", "Levha hareketi GPS ile izleniyor: ABD Batı kıyısı, Japonya ve Türkiye'de gerilme birikimi haritalanıyor. Jeotermal enerji (İceland, Türkiye) tektonik ısının doğrudan kullanımı — tektonik, geleceğin enerji kaynağı.", "bugün"),
  ],

  /* ------------------------------- Fermi ----------------------------------- */
  "fermi-paradoksu": [
    d("Kanıt: Drake Denkleminin Güncellenmesi", "Drake denklemi 7 parametredir; Kepler/TESS ile 4'ü ölçüldü: yıldız oluşumu, gezegen oranı (%100'e yakın), yaşanabilir bölge sayısı, kimya. Bilinmeyen: yaşamın doğma olasılığı (f_l) — asıl bilinmeyen bu.", "1961 → bugün"),
    d("Sayılarla: 10²² Yıldız, 0 Sinyal", "Gözlenebilir evrende 10²² yıldız var; SETI 60 yılda 1 milyon yıldız taradı ve hiçbir sinyal bulamadı. 'Büyük sessizlik' istatistiksel olarak anlamlı — bir şey bizim eksik olmamızı sağlıyor.", "istatistik"),
    d("Yaygın Yanlış: 'UFO'lar Kanıt'", "Hayır: Pentagon raporları (2021) bile 'açıklanamayan' olayların doğal/aygıtsal/düşman kaynaklı olabileceğini söylüyor — uzaylı kanıtı sıfır. Fermi paradoksu, bilimsel bir sorudur; popüler kültür verisi değil.", "bilimsel tutum"),
    d("Bugün: Technosignature Programı", "SETI artık radyo dışında 'technosignature' arıyor: dyson kürelerinin infrared fazlalığı, kloroflorokarbon atmosferi, lazer sinyalleri. Vera Rubin LSST (2025→) bu aramayı 10 kat hızlandıracak.", "bugün → 2025"),
  ],
  "buyuk-filtre": [
    d("Kanıt: Earth'in 'Nadir' Parametreleri", "Robin Hanson'ın Büyük Filtre (1996): evren sessizse bir basamak neredeyse imkânsızdır. Adaylar: abiogenesis, ökaryot hücre (2 milyar yıl gecikme), kompleks yaşam, teknolojik uygarlık, kendi kendini yok etme.", "1996"),
    d("Sayılarla: Abiogenesis Olasılığı", "Eğer f_l (yaşamın doğma olasılığı) 10⁻¹⁰0 gibi küçükse, evrende yalnızız; eğer 10⁻⁵ gibi büyükse, filtre BİZİM GELECEĞİMİZDEDIR (kendi kendini yok etme). Bu asimetri, paradoksun en korkutucu yüzüdür.", "olasılık"),
    d("Yaygın Yanlış: 'Teknoloji Her Zaman Artar'", "Hayır: uygarlıklar çökebilir (Bronz Çağı çöküşü, 1200 BC), gezegen kaynakları tükenir, nükleer savaş olur. 'Filtre' gelecekte olabilir: teknoloji, bir hayatta kalma garantisi değil.", "kavram düzeltmesi"),
    d("Bugün: Mars ve Europa İlk Testleri", "Eğer Mars veya Europa'da İKİNCİ bir biyosfer bulunursa, 'yaşamın doğması' kolaydır → filtre İLERİDE. Eğer hiçbir yerde yaşam yoksa, filtre GERİDE (abiogenesis). Bu, asıl büyük deneydir.", "bugün → 2030'lar"),
  ],
  "kardasev-olcegi": [
    d("Kanıt: Dyson Sphere Arama Programları", "IRAS ve Gaia verisiyle 5 milyon yıldız tarandı: 20 'anormal infrared' adayı bulundu (Boyajian Yıldızı dahil). Hiçbiri Dyson küresi değil — ama arama yöntemi artık sistematik.", "2015 → bugün"),
    d("Sayılarla: Tip I = 10¹⁶ Watt", "Tip I uygarlık gezegenin toplam akışını kullanır (10¹⁶ W); Tip II yıldızı (4×10²⁶ W); Tip III galaksiyi (10³⁷ W). İnsanlık 2×10¹³ W: Tip 0,73. Tip I'a 100-200 yıl, Tip II'ye 3.000 yıl var.", "enerji ölçeği"),
    d("Yaygın Yanlış: 'Tip III İmkânsız'", "Hayır: fizik yasaları izin verir — sorun zaman: galaksiyi kolonize etmek ışık hızının %1'i ile 10 milyon yıl sürer. Evren 13,8 milyar yaşında: yeterli zaman vardı. Bu yüzden sessizlik tuhaf.", "hesap"),
    d("Bugün: Enerji Geçişi ve Kardashev", "Küresel enerji tüketimi %2/yıl artarsa Tip I'a 200 yılda ulaşılır; füzyon enerjisi (ITER, 2035) bu grafiğin ilk dönüm noktası. Kardashev ölçeği, uygarlığın 'yaşam standardı' değil — enerji kapasitesi ölçütüdür.", "bugün"),
  ],
  "nadir-dunya": [
    d("Kanıt: Dev Gezegenlerin Koruyucu Rolü", "Jüpiter'in varlığı, Dünya'ya gelen kuyrukluyıldız akısını 10.000 kat azaltır. Simülasyonlar: Jüpiter'siz Güneş Sistemi'nde büyük çarpma oranı 1.000 kat artar — karmaşık yaşamın şansı düşer.", "simülasyon"),
    d("Sayılarla: Nadir Parametreleri", "Dünya'nın 'şanslı' özellikleri: büyük Ay (eksen kararlılığı), dev gezegen koruması, plaka tektoniği (CO₂ döngüsü), doğru konumdaki galaksi halkası, metal açısından zengin yıldız. Hepsi bir arada: olasılık belki %0,1.", "parametre listesi"),
    d("Yaygın Yanlış: 'Yaşanabilir Bölge Yeter'", "Hayır: HZ (habitable zone) sadece su için gerekli koşul; yeterli değil. Büyük bir Ay, manyetik alan, doğru kaya kimyası, 4 milyar yıllık istikrar — her biri ayrı bir 'dar geçit'.", "kavram düzeltmesi"),
    d("Bugün: Superhabitable Gezegen Arama", "Dirk Schulze-Makuch'un 'superhabitable' kavramı: Dünya'dan daha yaşanabilir gezegenler olabilir (biraz daha büyük, daha sıcak, daha stabil yıldız). 24 aday kataloglandı (2020) — 'Dünya en iyisi' efsanesi sorgulanıyor.", "2020 → bugün"),
  ],
  "kara-orman": [
    d("Kanıt: Arecibo Mesajı ve Güvenlik Tartışması", "1974 Arecibo mesajı, 25.000 yıldıza ulaştı. Stephen Hawking ve David Brin 'sessiz ol' derken, METI International 'zaten sızdık' diyor. Tartışma hâlâ açık — bu, bilim etiğinin canlı bir örneği.", "1974 → bugün"),
    d("Sayılarla: Ses Menzili vs. Sessizlik", "İnsan radyo sızıntısı 100 ışık yılından sonra karıncalanır: ~2.000 yıldız dinliyor olabilir. Ama bir 'hedefli' sinyal 10.000 yıldıza gitti — orman, artık bizim sesimizi duydu.", "aralık"),
    d("Yaygın Yanlış: 'Kara Orman Kanıtlanmış Teori'", "Hayır: Liu Cixin'in fikri bir hipotezdir — 'avcı' uygarlıklar kanıtı yok. Alternatifler: 'zoo hipotezi', 'koordinasyon sorunu', 'kaynak kıtlığı'. Kara Orman, sessizliğin BİR açıklaması; tek açıklama değil.", "hipotez sınırları"),
    d("Bugün: Protokol Tartışmaları", "IAA SETI Protokolü (1989) sadece 'bildir ve paylaş' der; 'cevap verme' için kural yok. 2022'de Birleşmiş Milletler COPUOS'ta 'post-detection' kuralları tartışıldı: ilk temas, bir toplumsal karar olacak.", "bugün"),
  ],
};
