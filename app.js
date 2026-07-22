(() => {
  'use strict';

  const STORAGE_KEY = 'animoa_v1_clean_data';
  const SETTINGS_KEY = 'animoa_v1_clean_settings';
  const UPDATED_AT_KEY = 'animoa_v1_clean_updated_at';
  const MEDIA_DB_NAME = 'animoa_media_v1';
  const MEDIA_STORE_NAME = 'images';
  const MEDIA_PREFIX = 'media:';
  const CLOUD_PREFIX = 'cloud:';
  const APP_VERSION = '3.2.0';
  const SUPPORT_EMAIL = 'contact@animoa.fr';
  const PET_CATALOG = Object.freeze({"Chien":[{"name":"Affenpinscher","size":"small","lifespan":14,"fci":186},{"name":"Airedale Terrier","size":"medium","lifespan":12.5,"fci":7},{"name":"Akita","size":"large","lifespan":11,"fci":255},{"name":"Akita Americain","size":"large","lifespan":11,"fci":344},{"name":"American Foxhound","size":"medium","lifespan":12.5,"fci":303},{"name":"American Staffordshire Terrier","size":"medium","lifespan":12.5,"fci":286},{"name":"Anglo-Français de Petite Venerie","size":"medium","lifespan":12.5,"fci":325},{"name":"Ariegeois","size":"medium","lifespan":12.5,"fci":20},{"name":"Azawakh","size":"large","lifespan":11,"fci":307},{"name":"Bangkaew de Thailande","size":"medium","lifespan":12.5,"fci":358},{"name":"Barbet","size":"medium","lifespan":12.5,"fci":105},{"name":"Barbu Tcheque","size":"medium","lifespan":12.5,"fci":245},{"name":"Barzoi - Levrier de Chasse Russe","size":"large","lifespan":11,"fci":193},{"name":"Basenji","size":"medium","lifespan":12.5,"fci":43},{"name":"Basset Artesien Normand","size":"small","lifespan":14,"fci":34},{"name":"Basset Bleu de Gascogne","size":"small","lifespan":14,"fci":35},{"name":"Basset de Westphalie","size":"small","lifespan":14,"fci":100},{"name":"Basset des Alpes","size":"small","lifespan":14,"fci":254},{"name":"Basset Fauve de Bretagne","size":"small","lifespan":14,"fci":36},{"name":"Basset Hound","size":"small","lifespan":14,"fci":163},{"name":"Basset Suedois","size":"small","lifespan":14,"fci":130},{"name":"Beagle","size":"medium","lifespan":12.5,"fci":161},{"name":"Beagle-Harrier","size":"medium","lifespan":12.5,"fci":290},{"name":"Berger Allemand","size":"large","lifespan":11,"fci":166},{"name":"Berger Australien","size":"medium","lifespan":12.5,"fci":342},{"name":"Berger Bergamasque","size":"medium","lifespan":12.5,"fci":194},{"name":"Berger Blanc Suisse","size":"large","lifespan":11,"fci":347},{"name":"Berger d'Asie Centrale","size":"medium","lifespan":12.5,"fci":335},{"name":"Berger de Beauce","size":"medium","lifespan":12.5,"fci":44},{"name":"Berger de Bosnie-Herzegovine et de Croatie","size":"medium","lifespan":12.5,"fci":355},{"name":"Berger de Brie","size":"medium","lifespan":12.5,"fci":113},{"name":"Berger de La Maremme et des Abruzzes","size":"medium","lifespan":12.5,"fci":201},{"name":"Berger de Picardie - Berger Picard","size":"medium","lifespan":12.5,"fci":176},{"name":"Berger de Russie Meridionale","size":"giant","lifespan":9.5,"fci":326},{"name":"Berger du Caucase","size":"giant","lifespan":9.5,"fci":328},{"name":"Berger du Karst","size":"medium","lifespan":12.5,"fci":278},{"name":"Berger Finnois de Laponie","size":"medium","lifespan":12.5,"fci":284},{"name":"Berger Hollandais","size":"large","lifespan":11,"fci":223},{"name":"Berger Miniature Américain","size":"medium","lifespan":12.5,"fci":367},{"name":"Berger Polonais de Plaine","size":"medium","lifespan":12.5,"fci":251},{"name":"Bichon à Poil Frise","size":"small","lifespan":14,"fci":215},{"name":"Bichon Bolonais","size":"small","lifespan":14,"fci":196},{"name":"Bichon Havanais","size":"small","lifespan":14,"fci":250},{"name":"Bichon Maltais","size":"small","lifespan":14,"fci":65},{"name":"Billy","size":"medium","lifespan":12.5,"fci":25},{"name":"Border Collie","size":"medium","lifespan":12.5,"fci":297},{"name":"Border Terrier","size":"small","lifespan":14,"fci":10},{"name":"Bouledogue Français","size":"small","lifespan":14,"fci":101},{"name":"Bouvier Appenzellois","size":"medium","lifespan":12.5,"fci":46},{"name":"Bouvier Australien","size":"medium","lifespan":12.5,"fci":287},{"name":"Bouvier Australien Courte Queue","size":"medium","lifespan":12.5,"fci":351},{"name":"Bouvier Bernois","size":"large","lifespan":11,"fci":45},{"name":"Bouvier de L'Entlebuch","size":"medium","lifespan":12.5,"fci":47},{"name":"Bouvier des Ardennes","size":"medium","lifespan":12.5,"fci":171},{"name":"Bouvier des Flandres","size":"large","lifespan":11,"fci":191},{"name":"Boxer","size":"large","lifespan":11,"fci":144},{"name":"Brachet Allemand","size":"medium","lifespan":12.5,"fci":299},{"name":"Brachet de Styrie à Poil Dur","size":"medium","lifespan":12.5,"fci":62},{"name":"Brachet Noir & Feu (Quatre-Oeille)","size":"medium","lifespan":12.5,"fci":63},{"name":"Brachet Polonais","size":"medium","lifespan":12.5,"fci":52},{"name":"Brachet Tyrolien","size":"medium","lifespan":12.5,"fci":68},{"name":"Braque Allemand à Poil Court","size":"large","lifespan":11,"fci":119},{"name":"Braque d'Auvergne","size":"large","lifespan":11,"fci":180},{"name":"Braque de L'Ariège","size":"large","lifespan":11,"fci":177},{"name":"Braque de Weimar","size":"large","lifespan":11,"fci":99},{"name":"Braque du Bourbonnais","size":"large","lifespan":11,"fci":179},{"name":"Braque Français - Type Gascogne","size":"large","lifespan":11,"fci":133},{"name":"Braque Français - Type Pyrenees","size":"large","lifespan":11,"fci":134},{"name":"Braque Hongrois à Poil Court (Vizsla)","size":"large","lifespan":11,"fci":57},{"name":"Braque Hongrois à Poil Dur","size":"large","lifespan":11,"fci":239},{"name":"Braque Italien","size":"large","lifespan":11,"fci":202},{"name":"Braque Saint-Germain","size":"large","lifespan":11,"fci":115},{"name":"Braque Slovaque à Poil Dur","size":"large","lifespan":11,"fci":320},{"name":"Briquet Griffon Vendeen","size":"medium","lifespan":12.5,"fci":19},{"name":"Broholmer","size":"giant","lifespan":9.5,"fci":315},{"name":"Buhund Norvegien","size":"medium","lifespan":12.5,"fci":237},{"name":"Bull Terrier","size":"medium","lifespan":12.5,"fci":11},{"name":"Bull Terrier Miniature","size":"small","lifespan":14,"fci":359},{"name":"Bulldog","size":"medium","lifespan":12.5,"fci":149},{"name":"Bulldog Campeiro Brésilien","size":"medium","lifespan":12.5,"fci":374},{"name":"Bulldog Continental","size":"medium","lifespan":12.5,"fci":369},{"name":"Bullmastiff","size":"giant","lifespan":9.5,"fci":157},{"name":"Cairn Terrier","size":"small","lifespan":14,"fci":4},{"name":"Caniche","size":"medium","lifespan":12.5,"fci":172},{"name":"Carlin","size":"small","lifespan":14,"fci":253},{"name":"Cavalier King Charles Spaniel","size":"small","lifespan":14,"fci":136},{"name":"Chien à Loutre","size":"medium","lifespan":12.5,"fci":294},{"name":"Chien Berger Croate","size":"medium","lifespan":12.5,"fci":277},{"name":"Chien Chinois à Crête","size":"small","lifespan":14,"fci":288},{"name":"Chien Courant d'Estonie","size":"medium","lifespan":12.5,"fci":366},{"name":"Chien Courant d'Istrie à Poil Dur","size":"medium","lifespan":12.5,"fci":152},{"name":"Chien Courant d'Istrie à Poil Ras","size":"medium","lifespan":12.5,"fci":151},{"name":"Chien Courant de Bosnie à Poil Raide - Dit Barak","size":"medium","lifespan":12.5,"fci":155},{"name":"Chien Courant de Halden","size":"medium","lifespan":12.5,"fci":267},{"name":"Chien Courant de Hamilton","size":"medium","lifespan":12.5,"fci":132},{"name":"Chien Courant de Hygen","size":"medium","lifespan":12.5,"fci":266},{"name":"Chien Courant de La Vallee de La Save","size":"medium","lifespan":12.5,"fci":154},{"name":"Chien Courant de Montagne du Montenegro","size":"medium","lifespan":12.5,"fci":279},{"name":"Chien Courant de Schiller","size":"medium","lifespan":12.5,"fci":131},{"name":"Chien Courant de Transylvanie","size":"medium","lifespan":12.5,"fci":241},{"name":"Chien Courant des Apennins","size":"medium","lifespan":12.5,"fci":375},{"name":"Chien Courant des Tatras","size":"medium","lifespan":12.5,"fci":377},{"name":"Chien Courant du Småland","size":"medium","lifespan":12.5,"fci":129},{"name":"Chien Courant Espagnol","size":"medium","lifespan":12.5,"fci":204},{"name":"Chien Courant Finlandais","size":"medium","lifespan":12.5,"fci":51},{"name":"Chien Courant Grec","size":"medium","lifespan":12.5,"fci":214},{"name":"Chien Courant Italien  à Poil Dur","size":"medium","lifespan":12.5,"fci":198},{"name":"Chien Courant Italien à Poil Ras","size":"medium","lifespan":12.5,"fci":337},{"name":"Chien Courant Norvegien","size":"medium","lifespan":12.5,"fci":203},{"name":"Chien Courant Polonais","size":"medium","lifespan":12.5,"fci":354},{"name":"Chien Courant Serbe","size":"medium","lifespan":12.5,"fci":150},{"name":"Chien Courant Slovaque","size":"medium","lifespan":12.5,"fci":244},{"name":"Chien Courant Suisse","size":"medium","lifespan":12.5,"fci":59},{"name":"Chien Courant Tricolore Serbe","size":"medium","lifespan":12.5,"fci":229},{"name":"Chien d'Arret Allemand à Poil Dur","size":"medium","lifespan":12.5,"fci":98},{"name":"Chien d'Arret Allemand à Poil Raide","size":"medium","lifespan":12.5,"fci":232},{"name":"Chien d'Arret Danois Ancestral","size":"medium","lifespan":12.5,"fci":281},{"name":"Chien d'Arret Frison","size":"medium","lifespan":12.5,"fci":222},{"name":"Chien d'Arret Portugais","size":"medium","lifespan":12.5,"fci":187},{"name":"Chien d'Artois","size":"medium","lifespan":12.5,"fci":28},{"name":"Chien d'Eau Americain","size":"medium","lifespan":12.5,"fci":301},{"name":"Chien d'Eau Espagnol","size":"medium","lifespan":12.5,"fci":336},{"name":"Chien d'Eau Frison","size":"medium","lifespan":12.5,"fci":221},{"name":"Chien d'Eau Irlandais","size":"medium","lifespan":12.5,"fci":124},{"name":"Chien d'Eau Portugais","size":"medium","lifespan":12.5,"fci":37},{"name":"Chien d'Eau Romagnol","size":"medium","lifespan":12.5,"fci":298},{"name":"Chien d'Elan Norvegien Gris","size":"medium","lifespan":12.5,"fci":242},{"name":"Chien d'Elan Norvegien Noir","size":"medium","lifespan":12.5,"fci":268},{"name":"Chien d'Elan Suedois","size":"medium","lifespan":12.5,"fci":42},{"name":"Chien d'Ours de Carelie","size":"medium","lifespan":12.5,"fci":48},{"name":"Chien d'Oysel Allemand","size":"medium","lifespan":12.5,"fci":104},{"name":"Chien de Bali -  Kintamani","size":"medium","lifespan":12.5,"fci":362},{"name":"Chien de Berger Anglais Ancestral","size":"large","lifespan":11,"fci":16},{"name":"Chien de Berger Belge","size":"large","lifespan":11,"fci":15},{"name":"Chien de Berger Catalan","size":"medium","lifespan":12.5,"fci":87},{"name":"Chien de Berger de Bohême - Berger de Bohême","size":"medium","lifespan":12.5,"fci":364},{"name":"Chien de Berger de La Serra de Aires","size":"medium","lifespan":12.5,"fci":93},{"name":"Chien de Berger de Majorque","size":"medium","lifespan":12.5,"fci":321},{"name":"Chien de Berger des Pyrenees à Face Rase","size":"medium","lifespan":12.5,"fci":138},{"name":"Chien de Berger des Pyrenees à Poil Long","size":"medium","lifespan":12.5,"fci":141},{"name":"Chien de Berger des Shetland","size":"medium","lifespan":12.5,"fci":88},{"name":"Chien de Berger Islandais","size":"medium","lifespan":12.5,"fci":289},{"name":"Chien de Berger Kangal","size":"giant","lifespan":9.5,"fci":331},{"name":"Chien de Berger Macédonien Karaman","size":"giant","lifespan":9.5,"fci":378},{"name":"Chien de Berger Polonais des Tatras","size":"medium","lifespan":12.5,"fci":252},{"name":"Chien de Berger Roumain Corb","size":"medium","lifespan":12.5,"fci":373},{"name":"Chien de Berger Roumain de Bucovine","size":"giant","lifespan":9.5,"fci":357},{"name":"Chien de Berger Roumain de Mioritza","size":"medium","lifespan":12.5,"fci":349},{"name":"Chien de Berger Roumain des Carpathes","size":"medium","lifespan":12.5,"fci":350},{"name":"Chien de Berger Yougoslave de Charplanina","size":"medium","lifespan":12.5,"fci":41},{"name":"Chien de Canaan","size":"medium","lifespan":12.5,"fci":273},{"name":"Chien de Castro Laboreiro","size":"medium","lifespan":12.5,"fci":170},{"name":"Chien de Cour Italien","size":"medium","lifespan":12.5,"fci":343},{"name":"Chien de Ferme Dano-Suedois","size":"medium","lifespan":12.5,"fci":356},{"name":"Chien de Garenne des Canaries","size":"medium","lifespan":12.5,"fci":329},{"name":"Chien de Garenne Portugais","size":"medium","lifespan":12.5,"fci":94},{"name":"Chien de La Serra Da Estrela","size":"medium","lifespan":12.5,"fci":173},{"name":"Chien de Leonberg","size":"giant","lifespan":9.5,"fci":145},{"name":"Chien de Montagne de L'Atlas (Aïdi)","size":"medium","lifespan":12.5,"fci":247},{"name":"Chien de Montagne des Pyrenees","size":"giant","lifespan":9.5,"fci":137},{"name":"Chien de Perdrix de Drente","size":"medium","lifespan":12.5,"fci":224},{"name":"Chien de Recherche Au Sang de Hanovre","size":"medium","lifespan":12.5,"fci":213},{"name":"Chien de Rhodesie à Crete Dorsale","size":"medium","lifespan":12.5,"fci":146},{"name":"Chien de Rouge de Baviere","size":"medium","lifespan":12.5,"fci":217},{"name":"Chien de Saint Hubert","size":"medium","lifespan":12.5,"fci":84},{"name":"Chien de Taiwan","size":"medium","lifespan":12.5,"fci":348},{"name":"Chien de Terre-Neuve","size":"giant","lifespan":9.5,"fci":50},{"name":"Chien du Groenland","size":"medium","lifespan":12.5,"fci":274},{"name":"Chien du Mont Saint-Bernard - Saint-Bernard","size":"giant","lifespan":9.5,"fci":61},{"name":"Chien du Pharaon","size":"medium","lifespan":12.5,"fci":248},{"name":"Chien Esquimau Canadien","size":"medium","lifespan":12.5,"fci":211},{"name":"Chien Finnois de Laponie","size":"medium","lifespan":12.5,"fci":189},{"name":"Chien Loup Tchecoslovaque","size":"medium","lifespan":12.5,"fci":332},{"name":"Chien Noir & Feu Pour La Chasse Au Raton Laveur","size":"medium","lifespan":12.5,"fci":300},{"name":"Chien Norvegien de Macareux","size":"medium","lifespan":12.5,"fci":265},{"name":"Chien Nu du Perou","size":"medium","lifespan":12.5,"fci":310},{"name":"Chien Thailandais à Crete Dorsale","size":"medium","lifespan":12.5,"fci":338},{"name":"Chien-Loup de Saarloos","size":"large","lifespan":11,"fci":311},{"name":"Chihuahua","size":"small","lifespan":14,"fci":218},{"name":"Chow Chow","size":"medium","lifespan":12.5,"fci":205},{"name":"Cimarron Uruguayen","size":"medium","lifespan":12.5,"fci":353},{"name":"Cirneco de L'Etna","size":"medium","lifespan":12.5,"fci":199},{"name":"Clumber Spaniel","size":"medium","lifespan":12.5,"fci":109},{"name":"Cocker Américain","size":"medium","lifespan":12.5,"fci":167},{"name":"Cocker Spaniel Anglais","size":"medium","lifespan":12.5,"fci":5},{"name":"Collie à Poil Court","size":"medium","lifespan":12.5,"fci":296},{"name":"Collie à Poil Long","size":"medium","lifespan":12.5,"fci":156},{"name":"Collie Barbu","size":"medium","lifespan":12.5,"fci":271},{"name":"Coton de Tulear","size":"small","lifespan":14,"fci":283},{"name":"Dalmatien","size":"large","lifespan":11,"fci":153},{"name":"Dandie Dinmont Terrier","size":"small","lifespan":14,"fci":168},{"name":"Deerhound","size":"medium","lifespan":12.5,"fci":164},{"name":"Deutsch Langhaar","size":"medium","lifespan":12.5,"fci":117},{"name":"Dobermann","size":"large","lifespan":11,"fci":143},{"name":"Dogue Allemand","size":"giant","lifespan":9.5,"fci":235},{"name":"Dogue Argentin","size":"large","lifespan":11,"fci":292},{"name":"Dogue de Bordeaux","size":"giant","lifespan":9.5,"fci":116},{"name":"Dogue de Majorque","size":"medium","lifespan":12.5,"fci":249},{"name":"Dogue du Tibet","size":"large","lifespan":11,"fci":230},{"name":"English Foxhound","size":"medium","lifespan":12.5,"fci":159},{"name":"English Springer Spaniel","size":"medium","lifespan":12.5,"fci":125},{"name":"Epagneul Bleu de Picardie","size":"medium","lifespan":12.5,"fci":106},{"name":"Epagneul Breton","size":"medium","lifespan":12.5,"fci":95},{"name":"Epagneul de Pont-Audemer","size":"medium","lifespan":12.5,"fci":114},{"name":"Epagneul Français","size":"medium","lifespan":12.5,"fci":175},{"name":"Epagneul Japonais","size":"small","lifespan":14,"fci":206},{"name":"Epagneul King Charles","size":"small","lifespan":14,"fci":128},{"name":"Epagneul Nain Continental","size":"small","lifespan":14,"fci":77},{"name":"Epagneul Picard","size":"medium","lifespan":12.5,"fci":108},{"name":"Epagneul Tibetain","size":"small","lifespan":14,"fci":231},{"name":"Eurasier","size":"large","lifespan":11,"fci":291},{"name":"Field Spaniel","size":"medium","lifespan":12.5,"fci":123},{"name":"Fila Brasileiro","size":"giant","lifespan":9.5,"fci":225},{"name":"Fila de Saint Miguel","size":"medium","lifespan":12.5,"fci":340},{"name":"Fox Terrier à Poil Lisse","size":"small","lifespan":14,"fci":12},{"name":"Fox-Terrier à Poil Dur","size":"medium","lifespan":12.5,"fci":169},{"name":"Français Blanc et Noir","size":"medium","lifespan":12.5,"fci":220},{"name":"Français Blanc et Orange","size":"medium","lifespan":12.5,"fci":316},{"name":"Français Tricolore","size":"medium","lifespan":12.5,"fci":219},{"name":"Gascon Saintongeois","size":"medium","lifespan":12.5,"fci":21},{"name":"Golden Retriever","size":"large","lifespan":11,"fci":111},{"name":"Grand Anglo-Français Blanc & Orange","size":"medium","lifespan":12.5,"fci":324},{"name":"Grand Anglo-Français Blanc et Noir","size":"medium","lifespan":12.5,"fci":323},{"name":"Grand Anglo-Français Tricolore","size":"medium","lifespan":12.5,"fci":322},{"name":"Grand Basset Griffon Vendeen","size":"medium","lifespan":12.5,"fci":33},{"name":"Grand Bleu de Gascogne","size":"medium","lifespan":12.5,"fci":22},{"name":"Grand Bouvier Suisse","size":"large","lifespan":11,"fci":58},{"name":"Grand Epagneul de Münster","size":"medium","lifespan":12.5,"fci":118},{"name":"Grand Griffon Vendeen","size":"medium","lifespan":12.5,"fci":282},{"name":"Griffon à Poil Dur Korthals","size":"medium","lifespan":12.5,"fci":107},{"name":"Griffon Belge","size":"small","lifespan":14,"fci":81},{"name":"Griffon Bleu de Gascogne","size":"medium","lifespan":12.5,"fci":32},{"name":"Griffon Bruxellois","size":"small","lifespan":14,"fci":80},{"name":"Griffon Fauve de Bretagne","size":"medium","lifespan":12.5,"fci":66},{"name":"Griffon Nivernais","size":"medium","lifespan":12.5,"fci":17},{"name":"Harrier","size":"medium","lifespan":12.5,"fci":295},{"name":"Hokkaido","size":"medium","lifespan":12.5,"fci":261},{"name":"Hovawart","size":"large","lifespan":11,"fci":190},{"name":"Husky de Sibérie","size":"large","lifespan":11,"fci":270},{"name":"Jindo Coreen","size":"medium","lifespan":12.5,"fci":334},{"name":"Kai","size":"medium","lifespan":12.5,"fci":317},{"name":"Kazakh Tazy","size":"large","lifespan":11,"fci":372},{"name":"Kelpie Australien","size":"medium","lifespan":12.5,"fci":293},{"name":"Kishu","size":"medium","lifespan":12.5,"fci":318},{"name":"Komondor","size":"giant","lifespan":9.5,"fci":53},{"name":"Kromfohrländer","size":"medium","lifespan":12.5,"fci":192},{"name":"Kuvasz","size":"giant","lifespan":9.5,"fci":54},{"name":"Laïka de Iakoutie","size":"medium","lifespan":12.5,"fci":365},{"name":"Laika de Siberie Occidentale","size":"medium","lifespan":12.5,"fci":306},{"name":"Laika de Siberie Orientale","size":"medium","lifespan":12.5,"fci":305},{"name":"Laika Russo-Europeen","size":"medium","lifespan":12.5,"fci":304},{"name":"Lakeland Terrier","size":"small","lifespan":14,"fci":70},{"name":"Lancashire Heeler","size":"medium","lifespan":12.5,"fci":360},{"name":"Landseer (Type Continental-Europeen)","size":"giant","lifespan":9.5,"fci":226},{"name":"Lapphund Suedois","size":"medium","lifespan":12.5,"fci":135},{"name":"Levrette d'Italie","size":"medium","lifespan":12.5,"fci":200},{"name":"Levrier Afghan","size":"large","lifespan":11,"fci":228},{"name":"Levrier Anglais","size":"medium","lifespan":12.5,"fci":158},{"name":"Levrier Espagnol","size":"medium","lifespan":12.5,"fci":285},{"name":"Levrier Hongrois","size":"medium","lifespan":12.5,"fci":240},{"name":"Levrier Irlandais","size":"giant","lifespan":9.5,"fci":160},{"name":"Levrier Polonais","size":"medium","lifespan":12.5,"fci":333},{"name":"Lhasa Apso","size":"small","lifespan":14,"fci":227},{"name":"Malamute de L'Alaska","size":"large","lifespan":11,"fci":243},{"name":"Mastiff","size":"giant","lifespan":9.5,"fci":264},{"name":"Matin des Pyrenees","size":"giant","lifespan":9.5,"fci":92},{"name":"Matin Espagnol","size":"giant","lifespan":9.5,"fci":91},{"name":"Matin Napolitain","size":"giant","lifespan":9.5,"fci":197},{"name":"Mâtin Transmontano","size":"giant","lifespan":9.5,"fci":368},{"name":"Mudi","size":"medium","lifespan":12.5,"fci":238},{"name":"Nederlandse Kooikerhondje","size":"medium","lifespan":12.5,"fci":314},{"name":"Norfolk Terrier","size":"small","lifespan":14,"fci":272},{"name":"Norwich Terrier","size":"small","lifespan":14,"fci":72},{"name":"Pekinois","size":"small","lifespan":14,"fci":207},{"name":"Perdiguero de Burgos","size":"medium","lifespan":12.5,"fci":90},{"name":"Petit Basset Griffon Vendeen","size":"small","lifespan":14,"fci":67},{"name":"Petit Bleu de Gascogne","size":"medium","lifespan":12.5,"fci":31},{"name":"Petit Brabançon","size":"small","lifespan":14,"fci":82},{"name":"Petit Chien Courant Suisse","size":"medium","lifespan":12.5,"fci":60},{"name":"Petit Chien Lion","size":"small","lifespan":14,"fci":233},{"name":"Petit Chien Russe","size":"medium","lifespan":12.5,"fci":352},{"name":"Petit Epagneul de Münster","size":"medium","lifespan":12.5,"fci":102},{"name":"Pinscher Allemand","size":"medium","lifespan":12.5,"fci":184},{"name":"Pinscher Autrichien","size":"medium","lifespan":12.5,"fci":64},{"name":"Pinscher Nain","size":"small","lifespan":14,"fci":185},{"name":"Pisteur Brésilien","size":"medium","lifespan":12.5,"fci":275},{"name":"Podenco d'Ibiza","size":"medium","lifespan":12.5,"fci":89},{"name":"Pointer Anglais","size":"large","lifespan":11,"fci":1},{"name":"Poitevin","size":"medium","lifespan":12.5,"fci":24},{"name":"Porcelaine","size":"medium","lifespan":12.5,"fci":30},{"name":"Presa Canario","size":"giant","lifespan":9.5,"fci":346},{"name":"Pudelpointer","size":"large","lifespan":11,"fci":216},{"name":"Puli","size":"medium","lifespan":12.5,"fci":55},{"name":"Pumi","size":"medium","lifespan":12.5,"fci":56},{"name":"Rafeiro de L'Alentejo","size":"medium","lifespan":12.5,"fci":96},{"name":"Ratier de Prague","size":"small","lifespan":14,"fci":363},{"name":"Ratier Valencien","size":"small","lifespan":14,"fci":370},{"name":"Retriever à Poil Boucle","size":"large","lifespan":11,"fci":110},{"name":"Retriever à Poil Plat","size":"large","lifespan":11,"fci":121},{"name":"Retriever de La Baie de Chesapeake","size":"large","lifespan":11,"fci":263},{"name":"Retriever de La Nouvelle Ecosse","size":"large","lifespan":11,"fci":312},{"name":"Retriever du Labrador","size":"large","lifespan":11,"fci":122},{"name":"Rottweiler","size":"large","lifespan":11,"fci":147},{"name":"Sabueso Fino Colombiano","size":"medium","lifespan":12.5,"fci":376},{"name":"Saluki","size":"large","lifespan":11,"fci":269},{"name":"Samoyede","size":"large","lifespan":11,"fci":212},{"name":"Schapendoes Neerlandais","size":"medium","lifespan":12.5,"fci":313},{"name":"Schipperke","size":"small","lifespan":14,"fci":83},{"name":"Schnauzer","size":"medium","lifespan":12.5,"fci":182},{"name":"Schnauzer Geant","size":"medium","lifespan":12.5,"fci":181},{"name":"Schnauzer Nain","size":"medium","lifespan":12.5,"fci":183},{"name":"Sealyham Terrier","size":"small","lifespan":14,"fci":74},{"name":"Segugio Maremmano","size":"medium","lifespan":12.5,"fci":361},{"name":"Setter Anglais","size":"large","lifespan":11,"fci":2},{"name":"Setter Gordon","size":"large","lifespan":11,"fci":6},{"name":"Setter Irlandais Rouge","size":"large","lifespan":11,"fci":120},{"name":"Setter Irlandais Rouge et Blanc","size":"large","lifespan":11,"fci":330},{"name":"Shar Pei","size":"medium","lifespan":12.5,"fci":309},{"name":"Shiba","size":"medium","lifespan":12.5,"fci":257},{"name":"Shih Tzu","size":"small","lifespan":14,"fci":208},{"name":"Shikoku","size":"medium","lifespan":12.5,"fci":319},{"name":"Skye Terrier","size":"small","lifespan":14,"fci":75},{"name":"Sloughi","size":"large","lifespan":11,"fci":188},{"name":"Smous des Pays-Bas","size":"medium","lifespan":12.5,"fci":308},{"name":"Spinone","size":"medium","lifespan":12.5,"fci":165},{"name":"Spitz Allemand","size":"medium","lifespan":12.5,"fci":97},{"name":"Spitz de Norrbotten","size":"medium","lifespan":12.5,"fci":276},{"name":"Spitz Finlandais","size":"medium","lifespan":12.5,"fci":49},{"name":"Spitz Japonais","size":"medium","lifespan":12.5,"fci":262},{"name":"Staffordshire Bull Terrier","size":"medium","lifespan":12.5,"fci":76},{"name":"Sussex Spaniel","size":"medium","lifespan":12.5,"fci":127},{"name":"Tchouvatch Slovaque","size":"medium","lifespan":12.5,"fci":142},{"name":"Teckel","size":"small","lifespan":14,"fci":148},{"name":"Terrier Andalou","size":"small","lifespan":14,"fci":371},{"name":"Terrier Anglais d'Agrement (Noir et Feu)","size":"medium","lifespan":12.5,"fci":13},{"name":"Terrier Australien","size":"small","lifespan":14,"fci":8},{"name":"Terrier Australien à Poil Soyeux","size":"small","lifespan":14,"fci":236},{"name":"Terrier Bresilien","size":"small","lifespan":14,"fci":341},{"name":"Terrier de Bedlington","size":"small","lifespan":14,"fci":9},{"name":"Terrier de Boston","size":"medium","lifespan":12.5,"fci":140},{"name":"Terrier de Chasse Allemand","size":"medium","lifespan":12.5,"fci":103},{"name":"Terrier de Manchester","size":"medium","lifespan":12.5,"fci":71},{"name":"Terrier du Reverend Russell","size":"medium","lifespan":12.5,"fci":339},{"name":"Terrier du Yorkshire","size":"small","lifespan":14,"fci":86},{"name":"Terrier Ecossais","size":"medium","lifespan":12.5,"fci":73},{"name":"Terrier Irlandais","size":"medium","lifespan":12.5,"fci":139},{"name":"Terrier Irlandais à Poil Doux","size":"medium","lifespan":12.5,"fci":40},{"name":"Terrier Irlandais Glen Of Imaal","size":"medium","lifespan":12.5,"fci":302},{"name":"Terrier Jack Russell","size":"small","lifespan":14,"fci":345},{"name":"Terrier Japonais","size":"small","lifespan":14,"fci":259},{"name":"Terrier Kerry Blue","size":"medium","lifespan":12.5,"fci":3},{"name":"Terrier Noir Russe","size":"medium","lifespan":12.5,"fci":327},{"name":"Terrier Tcheque","size":"medium","lifespan":12.5,"fci":246},{"name":"Terrier Tibetain","size":"small","lifespan":14,"fci":209},{"name":"Tosa","size":"giant","lifespan":9.5,"fci":260},{"name":"Vallhund Suedois - Spitz des Visigoths","size":"medium","lifespan":12.5,"fci":14},{"name":"Volpino Italien","size":"medium","lifespan":12.5,"fci":195},{"name":"Welsh Corgi (Cardigan)","size":"medium","lifespan":12.5,"fci":38},{"name":"Welsh Corgi (Pembroke)","size":"medium","lifespan":12.5,"fci":39},{"name":"Welsh Springer Spaniel","size":"medium","lifespan":12.5,"fci":126},{"name":"Welsh Terrier","size":"small","lifespan":14,"fci":78},{"name":"West Highland White Terrier","size":"small","lifespan":14,"fci":85},{"name":"Whippet","size":"medium","lifespan":12.5,"fci":162},{"name":"Xoloitzcuintle","size":"medium","lifespan":12.5,"fci":234},{"name":"Croisé","size":"medium","lifespan":12.5,"fci":null},{"name":"Race inconnue","size":"medium","lifespan":12.5,"fci":null},{"name":"Autre race","size":"medium","lifespan":12.5,"fci":null}],"Chat":[{"name":"Exotic Shorthair","lifespan":15},{"name":"Persan","lifespan":15},{"name":"Ragdoll","lifespan":15},{"name":"Sacré de Birmanie","lifespan":15},{"name":"Turc de Van","lifespan":15},{"name":"American Curl à poil long","lifespan":15},{"name":"American Curl à poil court","lifespan":15},{"name":"LaPerm à poil long","lifespan":15},{"name":"LaPerm à poil court","lifespan":15},{"name":"Maine Coon","lifespan":15},{"name":"Neva Masquerade","lifespan":15},{"name":"Chat des forêts norvégiennes","lifespan":15},{"name":"Sibérien","lifespan":15},{"name":"Angora turc","lifespan":15},{"name":"Bengal","lifespan":15},{"name":"British Longhair","lifespan":15},{"name":"Burmilla","lifespan":15},{"name":"British Shorthair","lifespan":15},{"name":"Burmese","lifespan":15},{"name":"Chartreux","lifespan":15},{"name":"Cymric","lifespan":15},{"name":"Européen","lifespan":15},{"name":"Bobtail des Kouriles à poil long","lifespan":15},{"name":"Bobtail des Kouriles à poil court","lifespan":15},{"name":"Korat","lifespan":15},{"name":"Manx","lifespan":15},{"name":"Mau égyptien","lifespan":15},{"name":"Ocicat","lifespan":15},{"name":"Singapura","lifespan":15},{"name":"Snowshoe","lifespan":15},{"name":"Sokoke","lifespan":15},{"name":"Selkirk Rex à poil long","lifespan":15},{"name":"Selkirk Rex à poil court","lifespan":15},{"name":"Abyssin","lifespan":15},{"name":"Balinais","lifespan":15},{"name":"Cornish Rex","lifespan":15},{"name":"Devon Rex","lifespan":15},{"name":"Donskoy","lifespan":15},{"name":"German Rex","lifespan":15},{"name":"Bobtail japonais à poil court","lifespan":15},{"name":"Oriental à poil long","lifespan":15},{"name":"Oriental à poil court","lifespan":15},{"name":"Peterbald","lifespan":15},{"name":"Bleu russe","lifespan":15},{"name":"Siamois","lifespan":15},{"name":"Somali","lifespan":15},{"name":"Sphynx","lifespan":15},{"name":"Thaï","lifespan":15},{"name":"Bombay","lifespan":15},{"name":"Lykoi","lifespan":15},{"name":"Chat domestique à poil long","lifespan":15},{"name":"Chat domestique à poil court","lifespan":15},{"name":"Croisé","lifespan":15},{"name":"Race inconnue","lifespan":15},{"name":"Autre race","lifespan":15}],"Lapin":[{"name":"Alaska","size":"medium","lifespan":9.5},{"name":"Angora français","size":"medium","lifespan":9.5},{"name":"Argenté anglais","size":"small","lifespan":10.5},{"name":"Argenté de Champagne","size":"medium","lifespan":9.5},{"name":"Argenté de Saint-Hubert","size":"medium","lifespan":9.5},{"name":"Barbu de Gand","size":"medium","lifespan":9.5},{"name":"Bélier anglais","size":"large","lifespan":8.5},{"name":"Bélier de Meissen","size":"large","lifespan":8.5},{"name":"Bélier français","size":"giant","lifespan":7.5},{"name":"Blanc de Hotot","size":"medium","lifespan":9.5},{"name":"Blanc de Vendée","size":"medium","lifespan":9.5},{"name":"Brun marron de Lorraine","size":"small","lifespan":10.5},{"name":"Californien","size":"medium","lifespan":9.5},{"name":"Chamois de Thuringe","size":"medium","lifespan":9.5},{"name":"Chinchilla","size":"small","lifespan":10.5},{"name":"Fauve de Bourgogne","size":"medium","lifespan":9.5},{"name":"Feh de Marbourg","size":"small","lifespan":10.5},{"name":"Géant blanc du Bouscat","size":"giant","lifespan":7.5},{"name":"Géant des Flandres","size":"giant","lifespan":7.5},{"name":"Géant papillon français","size":"giant","lifespan":7.5},{"name":"Grand argenté clair","size":"large","lifespan":8.5},{"name":"Grand chinchilla","size":"large","lifespan":8.5},{"name":"Grand russe","size":"large","lifespan":8.5},{"name":"Havane français","size":"small","lifespan":10.5},{"name":"Hermine","size":"dwarf","lifespan":11},{"name":"Hollandais","size":"small","lifespan":10.5},{"name":"Japonais","size":"medium","lifespan":9.5},{"name":"Lapin chèvre","size":"medium","lifespan":9.5},{"name":"Lièvre belge","size":"large","lifespan":8.5},{"name":"Lynx","size":"small","lifespan":10.5},{"name":"Nain angora","size":"dwarf","lifespan":11},{"name":"Nain bélier","size":"dwarf","lifespan":11},{"name":"Nain bélier angora","size":"dwarf","lifespan":11},{"name":"Nain bélier Rex","size":"dwarf","lifespan":11},{"name":"Nain bélier Satin","size":"dwarf","lifespan":11},{"name":"Nain bélier tête de lion","size":"dwarf","lifespan":11},{"name":"Nain de couleur","size":"dwarf","lifespan":11},{"name":"Nain lièvre","size":"dwarf","lifespan":11},{"name":"Nain papillon","size":"dwarf","lifespan":11},{"name":"Nain renard","size":"dwarf","lifespan":11},{"name":"Nain Rex","size":"dwarf","lifespan":11},{"name":"Nain Satin","size":"dwarf","lifespan":11},{"name":"Nain tête de lion","size":"dwarf","lifespan":11},{"name":"Néo-Zélandais","size":"large","lifespan":8.5},{"name":"Normand","size":"medium","lifespan":9.5},{"name":"Papillon anglais","size":"small","lifespan":10.5},{"name":"Papillon rhénan","size":"medium","lifespan":9.5},{"name":"Perl Feh","size":"small","lifespan":10.5},{"name":"Petit bélier","size":"small","lifespan":10.5},{"name":"Petit Rex","size":"small","lifespan":10.5},{"name":"Renard suisse","size":"medium","lifespan":9.5},{"name":"Rex","size":"medium","lifespan":9.5},{"name":"Russe","size":"small","lifespan":10.5},{"name":"Sablé des Vosges","size":"small","lifespan":10.5},{"name":"Satin","size":"medium","lifespan":9.5},{"name":"Vienne bleu","size":"large","lifespan":8.5},{"name":"Croisé","size":"medium","lifespan":9.5},{"name":"Race inconnue","size":"medium","lifespan":9.5},{"name":"Autre race","size":"medium","lifespan":9.5}],"Oiseau":[{"name":"Amazone à ailes orange","scientific":"Amazona amazonica","lifespan":45,"maturityMonths":48},{"name":"Amazone à front bleu","scientific":"Amazona aestiva","lifespan":50,"maturityMonths":48},{"name":"Amazone à front jaune","scientific":"Amazona ochrocephala","lifespan":50,"maturityMonths":48},{"name":"Ara bleu et jaune","scientific":"Ara ararauna","lifespan":55,"maturityMonths":60},{"name":"Ara chloroptère","scientific":"Ara chloropterus","lifespan":55,"maturityMonths":60},{"name":"Ara hyacinthe","scientific":"Anodorhynchus hyacinthinus","lifespan":55,"maturityMonths":72},{"name":"Ara militaire","scientific":"Ara militaris","lifespan":50,"maturityMonths":60},{"name":"Ara noble","scientific":"Diopsittaca nobilis","lifespan":30,"maturityMonths":30},{"name":"Ara rouge","scientific":"Ara macao","lifespan":55,"maturityMonths":60},{"name":"Bengali rouge","scientific":"Amandava amandava","lifespan":8,"maturityMonths":7},{"name":"Cacatoès à huppe jaune","scientific":"Cacatua galerita","lifespan":55,"maturityMonths":60},{"name":"Cacatoès blanc","scientific":"Cacatua alba","lifespan":55,"maturityMonths":60},{"name":"Cacatoès de Goffin","scientific":"Cacatua goffiniana","lifespan":40,"maturityMonths":36},{"name":"Cacatoès de Leadbeater","scientific":"Lophochroa leadbeateri","lifespan":50,"maturityMonths":60},{"name":"Cacatoès rosalbin","scientific":"Eolophus roseicapilla","lifespan":45,"maturityMonths":48},{"name":"Caille du Japon","scientific":"Coturnix japonica","lifespan":5,"maturityMonths":2},{"name":"Caïque à tête noire","scientific":"Pionites melanocephalus","lifespan":30,"maturityMonths":30},{"name":"Calopsitte élégante","scientific":"Nymphicus hollandicus","lifespan":18,"maturityMonths":12},{"name":"Canari domestique","scientific":"Serinus canaria domestica","lifespan":12,"maturityMonths":10},{"name":"Colombe diamant","scientific":"Geopelia cuneata","lifespan":12,"maturityMonths":8},{"name":"Conure à joues vertes","scientific":"Pyrrhura molinae","lifespan":25,"maturityMonths":18},{"name":"Conure jandaya","scientific":"Aratinga jandaya","lifespan":30,"maturityMonths":24},{"name":"Conure mitrée","scientific":"Psittacara mitratus","lifespan":30,"maturityMonths":30},{"name":"Conure nanday","scientific":"Aratinga nenday","lifespan":30,"maturityMonths":24},{"name":"Conure soleil","scientific":"Aratinga solstitialis","lifespan":30,"maturityMonths":24},{"name":"Cordon-bleu à joues rouges","scientific":"Uraeginthus bengalus","lifespan":8,"maturityMonths":7},{"name":"Diamant de Gould","scientific":"Erythrura gouldiae","lifespan":8,"maturityMonths":8},{"name":"Diamant mandarin","scientific":"Taeniopygia guttata","lifespan":8,"maturityMonths":6},{"name":"Inséparable de Fischer","scientific":"Agapornis fischeri","lifespan":18,"maturityMonths":10},{"name":"Inséparable masqué","scientific":"Agapornis personatus","lifespan":18,"maturityMonths":10},{"name":"Inséparable rosegorge","scientific":"Agapornis roseicollis","lifespan":18,"maturityMonths":10},{"name":"Lori rouge","scientific":"Eos bornea","lifespan":25,"maturityMonths":24},{"name":"Loriquet arc-en-ciel","scientific":"Trichoglossus moluccanus","lifespan":20,"maturityMonths":24},{"name":"Moineau du Japon","scientific":"Lonchura striata domestica","lifespan":8,"maturityMonths":7},{"name":"Padda de Java","scientific":"Lonchura oryzivora","lifespan":10,"maturityMonths":8},{"name":"Perroquet de Jardine","scientific":"Poicephalus gulielmi","lifespan":30,"maturityMonths":30},{"name":"Perroquet de Meyer","scientific":"Poicephalus meyeri","lifespan":25,"maturityMonths":24},{"name":"Perroquet Eclectus","scientific":"Eclectus roratus","lifespan":40,"maturityMonths":36},{"name":"Perroquet gris du Gabon","scientific":"Psittacus erithacus","lifespan":45,"maturityMonths":48},{"name":"Perruche à collier","scientific":"Psittacula krameri","lifespan":25,"maturityMonths":24},{"name":"Perruche à croupion rouge","scientific":"Psephotus haematonotus","lifespan":15,"maturityMonths":12},{"name":"Perruche à moustaches","scientific":"Psittacula alexandri","lifespan":25,"maturityMonths":24},{"name":"Perruche à tête prune","scientific":"Psittacula cyanocephala","lifespan":20,"maturityMonths":24},{"name":"Perruche alexandre","scientific":"Psittacula eupatria","lifespan":30,"maturityMonths":30},{"name":"Perruche Catherine","scientific":"Bolborhynchus lineola","lifespan":15,"maturityMonths":12},{"name":"Perruche de Bourke","scientific":"Neopsephotus bourkii","lifespan":12,"maturityMonths":10},{"name":"Perruche de Derby","scientific":"Psittacula derbiana","lifespan":25,"maturityMonths":30},{"name":"Perruche de Pennant","scientific":"Platycercus elegans","lifespan":20,"maturityMonths":18},{"name":"Perruche moine","scientific":"Myiopsitta monachus","lifespan":25,"maturityMonths":18},{"name":"Perruche omnicolore","scientific":"Platycercus eximius","lifespan":18,"maturityMonths":18},{"name":"Perruche ondulée","scientific":"Melopsittacus undulatus","lifespan":12,"maturityMonths":8},{"name":"Perruche splendide","scientific":"Neophema splendida","lifespan":12,"maturityMonths":10},{"name":"Perruche turquoisine","scientific":"Neophema pulchella","lifespan":12,"maturityMonths":10},{"name":"Pigeon domestique","scientific":"Columba livia domestica","lifespan":15,"maturityMonths":8},{"name":"Pionus à tête bleue","scientific":"Pionus menstruus","lifespan":30,"maturityMonths":30},{"name":"Poule domestique","scientific":"Gallus gallus domesticus","lifespan":10,"maturityMonths":6},{"name":"Toui céleste","scientific":"Forpus coelestis","lifespan":18,"maturityMonths":12},{"name":"Toui du Mexique","scientific":"Forpus cyanopygius","lifespan":18,"maturityMonths":12},{"name":"Tourterelle rieuse","scientific":"Streptopelia risoria","lifespan":15,"maturityMonths":8},{"name":"Youyou du Sénégal","scientific":"Poicephalus senegalus","lifespan":25,"maturityMonths":24},{"name":"Espèce inconnue","scientific":"","lifespan":15,"maturityMonths":12},{"name":"Autre espèce","scientific":"","lifespan":15,"maturityMonths":12}]});
  const BREED_PICKER_POPULAR = Object.freeze({
    Chien: ['Croisé', 'Race inconnue', 'Golden Retriever', 'Retriever du Labrador', 'Berger Allemand', 'Berger Australien', 'Chien de Berger Belge', 'Bouledogue Français', 'Chihuahua', 'Caniche', 'Beagle', 'Staffordshire Bull Terrier', 'Terrier du Yorkshire', 'Border Collie', 'Chien du Mont Saint-Bernard - Saint-Bernard'],
    Chat: ['Chat domestique à poil court', 'Chat domestique à poil long', 'Croisé', 'Race inconnue', 'Maine Coon', 'Sacré de Birmanie', 'Siamois', 'Persan', 'Bengal', 'British Shorthair', 'Ragdoll', 'Sphynx'],
    Lapin: ['Croisé', 'Race inconnue', 'Nain bélier', 'Nain de couleur', 'Nain tête de lion', 'Bélier français', 'Fauve de Bourgogne', 'Rex', 'Géant des Flandres'],
    Oiseau: ['Espèce inconnue', 'Perruche ondulée', 'Calopsitte élégante', 'Canari domestique', 'Inséparable rosegorge', 'Diamant mandarin', 'Perroquet gris du Gabon', 'Conure à joues vertes', 'Perruche à collier', 'Tourterelle rieuse']
  });
  let breedPickerState = null;
  let breedPickerCloseTimer = null;

  const RELEASE_SEEN_KEY = `animoa_release_seen_${APP_VERSION}`;
  const RELEASE_NOTES = Object.freeze({
    title: 'Animoa a été mis à jour',
    subtitle: 'Les vraies notifications téléphone arrivent dans Animoa.',
    items: [
      'Activez les notifications depuis Paramètres, avec une explication claire avant l’autorisation.',
      'Un message test confirme immédiatement que cet appareil est bien connecté.',
      'Les rendez-vous, vaccins, traitements et anniversaires disposent de rappels dédiés.',
      'Les heures silencieuses et les préférences restent modifiables à tout moment.'
    ]
  });

  const HEALTH_TYPES = ['Tous', 'Vaccin', 'Rendez-vous', 'Traitement', 'Médicament', 'Analyse', 'Document'];
  const CALENDAR_HEALTH_TYPES = new Set(['Vaccin', 'Rendez-vous', 'Traitement', 'Médicament', 'Analyse']);

  function healthTypeUsesCalendar(type) {
    return CALENDAR_HEALTH_TYPES.has(normalizeHealthType(type));
  }
  const KG_PER_LB = 0.45359237;
  const CURRENCY_OPTIONS = [
    { code: 'EUR', label: 'Euro (€)', symbol: '€' },
    { code: 'USD', label: 'Dollar américain ($)', symbol: '$' },
    { code: 'GBP', label: 'Livre sterling (£)', symbol: '£' },
    { code: 'CHF', label: 'Franc suisse (CHF)', symbol: 'CHF' },
    { code: 'CAD', label: 'Dollar canadien (CA$)', symbol: 'CA$' },
    { code: 'AUD', label: 'Dollar australien (A$)', symbol: 'A$' },
    { code: 'NZD', label: 'Dollar néo-zélandais (NZ$)', symbol: 'NZ$' },
    { code: 'CNY', label: 'Yuan chinois (CNY)', symbol: '¥' },
    { code: 'JPY', label: 'Yen japonais (JPY)', symbol: '¥' },
    { code: 'KRW', label: 'Won sud-coréen (KRW)', symbol: '₩' },
    { code: 'TWD', label: 'Nouveau dollar taïwanais (TWD)', symbol: 'NT$' },
    { code: 'HKD', label: 'Dollar de Hong Kong (HKD)', symbol: 'HK$' },
    { code: 'SGD', label: 'Dollar de Singapour (SGD)', symbol: 'S$' },
    { code: 'INR', label: 'Roupie indienne (INR)', symbol: '₹' },
    { code: 'MAD', label: 'Dirham marocain (MAD)', symbol: 'DH' },
    { code: 'DZD', label: 'Dinar algérien (DZD)', symbol: 'DA' },
    { code: 'TND', label: 'Dinar tunisien (TND)', symbol: 'DT' },
    { code: 'AED', label: 'Dirham des Émirats (AED)', symbol: 'AED' },
    { code: 'SAR', label: 'Riyal saoudien (SAR)', symbol: 'SAR' },
    { code: 'BRL', label: 'Réal brésilien (BRL)', symbol: 'R$' },
    { code: 'MXN', label: 'Peso mexicain (MXN)', symbol: 'MX$' },
    { code: 'ZAR', label: 'Rand sud-africain (ZAR)', symbol: 'R' },
    { code: 'SEK', label: 'Couronne suédoise (SEK)', symbol: 'kr' },
    { code: 'NOK', label: 'Couronne norvégienne (NOK)', symbol: 'kr' },
    { code: 'DKK', label: 'Couronne danoise (DKK)', symbol: 'kr' },
    { code: 'PLN', label: 'Zloty polonais (PLN)', symbol: 'zł' },
    { code: 'CZK', label: 'Couronne tchèque (CZK)', symbol: 'Kč' },
    { code: 'RON', label: 'Leu roumain (RON)', symbol: 'lei' },
    { code: 'TRY', label: 'Livre turque (TRY)', symbol: '₺' },
    { code: 'KMF', label: 'Franc comorien (KMF)', symbol: 'KMF' }
  ];
  const COUNTRY_OPTIONS = [
    { code: 'FR', label: 'France', currency: 'EUR', locale: 'fr-FR', weight: 'kg' },
    { code: 'BE', label: 'Belgique', currency: 'EUR', locale: 'fr-BE', weight: 'kg' },
    { code: 'CH', label: 'Suisse', currency: 'CHF', locale: 'fr-CH', weight: 'kg' },
    { code: 'CA', label: 'Canada', currency: 'CAD', locale: 'fr-CA', weight: 'kg' },
    { code: 'GB', label: 'Royaume-Uni', currency: 'GBP', locale: 'en-GB', weight: 'kg' },
    { code: 'US', label: 'États-Unis', currency: 'USD', locale: 'en-US', weight: 'lb' },
    { code: 'DE', label: 'Allemagne', currency: 'EUR', locale: 'de-DE', weight: 'kg' },
    { code: 'ES', label: 'Espagne', currency: 'EUR', locale: 'es-ES', weight: 'kg' },
    { code: 'IT', label: 'Italie', currency: 'EUR', locale: 'it-IT', weight: 'kg' },
    { code: 'PT', label: 'Portugal', currency: 'EUR', locale: 'pt-PT', weight: 'kg' },
    { code: 'MA', label: 'Maroc', currency: 'MAD', locale: 'fr-MA', weight: 'kg' },
    { code: 'DZ', label: 'Algérie', currency: 'DZD', locale: 'fr-DZ', weight: 'kg' },
    { code: 'TN', label: 'Tunisie', currency: 'TND', locale: 'fr-TN', weight: 'kg' },
    { code: 'CN', label: 'Chine', currency: 'CNY', locale: 'zh-CN', weight: 'kg' },
    { code: 'TW', label: 'Taïwan', currency: 'TWD', locale: 'zh-TW', weight: 'kg' },
    { code: 'HK', label: 'Hong Kong', currency: 'HKD', locale: 'zh-HK', weight: 'kg' },
    { code: 'JP', label: 'Japon', currency: 'JPY', locale: 'ja-JP', weight: 'kg' },
    { code: 'KR', label: 'Corée du Sud', currency: 'KRW', locale: 'ko-KR', weight: 'kg' },
    { code: 'AU', label: 'Australie', currency: 'AUD', locale: 'en-AU', weight: 'kg' },
    { code: 'NZ', label: 'Nouvelle-Zélande', currency: 'NZD', locale: 'en-NZ', weight: 'kg' },
    { code: 'IN', label: 'Inde', currency: 'INR', locale: 'en-IN', weight: 'kg' },
    { code: 'BR', label: 'Brésil', currency: 'BRL', locale: 'pt-BR', weight: 'kg' },
    { code: 'MX', label: 'Mexique', currency: 'MXN', locale: 'es-MX', weight: 'kg' },
    { code: 'AE', label: 'Émirats arabes unis', currency: 'AED', locale: 'ar-AE', weight: 'kg' },
    { code: 'SA', label: 'Arabie saoudite', currency: 'SAR', locale: 'ar-SA', weight: 'kg' },
    { code: 'ZA', label: 'Afrique du Sud', currency: 'ZAR', locale: 'en-ZA', weight: 'kg' },
    { code: 'SE', label: 'Suède', currency: 'SEK', locale: 'sv-SE', weight: 'kg' },
    { code: 'NO', label: 'Norvège', currency: 'NOK', locale: 'nb-NO', weight: 'kg' },
    { code: 'DK', label: 'Danemark', currency: 'DKK', locale: 'da-DK', weight: 'kg' },
    { code: 'PL', label: 'Pologne', currency: 'PLN', locale: 'pl-PL', weight: 'kg' },
    { code: 'CZ', label: 'Tchéquie', currency: 'CZK', locale: 'cs-CZ', weight: 'kg' },
    { code: 'RO', label: 'Roumanie', currency: 'RON', locale: 'ro-RO', weight: 'kg' },
    { code: 'TR', label: 'Turquie', currency: 'TRY', locale: 'tr-TR', weight: 'kg' },
    { code: 'SG', label: 'Singapour', currency: 'SGD', locale: 'en-SG', weight: 'kg' },
    { code: 'KM', label: 'Comores', currency: 'KMF', locale: 'fr-KM', weight: 'kg' }
  ];
  const COUNTRY_MAP = new Map(COUNTRY_OPTIONS.map((country) => [country.code, country]));
  const SUPPORTED_COUNTRIES = new Set(COUNTRY_OPTIONS.map((country) => country.code));
  const SUPPORTED_CURRENCIES = new Set(CURRENCY_OPTIONS.map((currency) => currency.code));
  const SUPPORTED_WEIGHT_UNITS = new Set(['kg', 'lb']);
  const SUPPORTED_LANGUAGES = new Set(['fr', 'en']);
  const SUPPORTED_THEMES = new Set(['light', 'dark', 'system']);
  const PALETTE_OPTIONS = [
    { id: 'animoa', label: 'Animoa', description: 'Turquoise et corail', colors: ['#20b8ae', '#ff6f73', '#f4c89a'], lightBg: '#f4fbfa', lightSurface: '#ffffff', darkBg: '#101b1a', darkSurface: '#182725' },
    { id: 'rose', label: 'Rose poudré', description: 'Doux et chaleureux', colors: ['#d77fa1', '#f4a6b8', '#f7d7df'], lightBg: '#fbf7f9', lightSurface: '#fffefe', darkBg: '#1b1217', darkSurface: '#291b22' },
    { id: 'blue', label: 'Bleu ciel', description: 'Clair et apaisant', colors: ['#5f9fd1', '#82c3e6', '#d9eef9'], lightBg: '#f5f9fc', lightSurface: '#ffffff', darkBg: '#101a22', darkSurface: '#192832' },
    { id: 'coral', label: 'Corail', description: 'Corail et pêche', colors: ['#df766c', '#f29b7f', '#f9d6c7'], lightBg: '#fcf8f6', lightSurface: '#ffffff', darkBg: '#1c1412', darkSurface: '#2b201d' },
    { id: 'yellow', label: 'Miel', description: 'Jaune doux et sable', colors: ['#c69b3c', '#efc968', '#faedbf'], lightBg: '#fbfaf4', lightSurface: '#ffffff', darkBg: '#1a1811', darkSurface: '#29251a' },
    { id: 'green', label: 'Menthe', description: 'Frais et lumineux', colors: ['#67a786', '#8cc8a6', '#dcefe3'], lightBg: '#f5f9f6', lightSurface: '#ffffff', darkBg: '#101914', darkSurface: '#18271f' },
    { id: 'violet', label: 'Violet', description: 'Prune et lilas', colors: ['#8d7ac4', '#b49bd9', '#e8def5'], lightBg: '#f8f6fb', lightSurface: '#ffffff', darkBg: '#15131c', darkSurface: '#211d2c' },
    { id: 'midnight', label: 'Nuit & or', description: 'Bleu nuit et doré', colors: ['#2f526f', '#c39a48', '#e9ddbf'], lightBg: '#f5f7f9', lightSurface: '#ffffff', darkBg: '#0d131a', darkSurface: '#17212b' }
  ];
  const PALETTE_MAP = new Map(PALETTE_OPTIONS.map((palette) => [palette.id, palette]));
  const SUPPORTED_PALETTES = new Set([...PALETTE_OPTIONS.map((palette) => palette.id), 'custom']);
  const DEFAULT_CUSTOM_COLORS = Object.freeze({
    primary: '#20b8ae', accent: '#ff6f73',
    lightBg: '#f4fbfa', lightSurface: '#ffffff',
    darkBg: '#101b1a', darkSurface: '#182725'
  });
  const THEME_OVERRIDE_VARIABLES = [
    '--bg', '--surface', '--surface-soft', '--surface-elevated', '--primary', '--primary-dark', '--primary-light',
    '--accent', '--accent-soft', '--text', '--muted', '--border', '--danger', '--warning', '--success', '--input-bg'
  ];
  const WEIGHT_GUIDES_KG = {
    Chien: { min: 0.2, max: 120, step: 0.1, label: 'chien' },
    Chat: { min: 0.2, max: 20, step: 0.05, label: 'chat' },
    Lapin: { min: 0.1, max: 15, step: 0.05, label: 'lapin' },
    Oiseau: { min: 0.005, max: 25, step: 0.001, label: 'oiseau' },
    Autre: { min: 0.001, max: 500, step: 0.01, label: 'animal' }
  };
  const HEALTH_TYPE_ALIASES = {
    vaccin: 'Vaccin', vaccins: 'Vaccin',
    rendezvous: 'Rendez-vous', rendezvouss: 'Rendez-vous', rdv: 'Rendez-vous',
    traitement: 'Traitement', traitements: 'Traitement',
    medicament: 'Médicament', medicaments: 'Médicament',
    analyse: 'Analyse', analyses: 'Analyse',
    document: 'Document', documents: 'Document',
    autre: 'Autre', autres: 'Autre'
  };

  const placeholderImage = 'assets/pet-placeholder.svg';

  const defaultData = {
    version: 4,
    activePetId: null,
    pets: [],
    health: [],
    expenses: [],
    weights: [],
    memories: []
  };

  const navItems = [
    { page: 'home', label: 'Accueil', icon: '⌂' },
    { page: 'health', label: 'Santé', icon: '♡' },
    { page: 'expenses', label: 'Dépenses', icon: 'currency' },
    { page: 'memories', label: 'Souvenirs', icon: '▧' }
  ];

  let data = loadData();
  let settings = loadSettings();
  let currentPage = 'home';
  let currentHealthFilter = 'Tous';
  let healthTabsScrollLeft = 0;
  let healthRestoreFrame = null;
  let toastTimer = null;
  let drawerCloseTimer = null;
  let modalCloseTimer = null;
  let filePickerScrollTop = 0;
  let filePickerWindowScrollY = 0;
  let mediaDbPromise = null;
  let cloudSaveTimer = null;
  let cloudHydrating = false;
  let cloudLoadFailed = false;
  let cloudRetrying = false;
  let syncState = 'local';
  const mediaUrlCache = new Map();
  const preparedPhotoFiles = new WeakMap();
  const previewObjectUrls = new WeakMap();
  let photoViewerScale = 1;
  let settingsPreviewActive = false;
  let onboardingStep = 0;
  let onboardingOverlay = null;
  let googleCalendarTokenClient = null;
  let googleCalendarAccessToken = '';
  let googleCalendarTokenExpiresAt = 0;
  let googleCalendarRequestPending = null;
  let isAdminUser = false;
  let adminResponses = [];
  let adminFeedback = [];
  let adminAccessRequests = [];
  let adminActiveTab = 'access';
  let adminStatusFilter = 'all';
  let adminLoading = false;
  let adminError = '';

  const mainContent = document.getElementById('mainContent');
  const mobileNav = document.getElementById('mobileNav');
  const desktopNav = document.getElementById('desktopNav');
  const drawerNav = document.getElementById('drawerNav');
  const drawer = document.getElementById('drawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const modal = document.getElementById('modal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const reminderBadge = document.getElementById('reminderBadge');
  const toast = document.getElementById('toast');
  const petContextBar = document.getElementById('petContextBar');
  const sidebarPetContext = document.getElementById('sidebarPetContext');
  const drawerPetContext = document.getElementById('drawerPetContext');
  const sidebarSyncStatus = document.getElementById('sidebarSyncStatus');

  function currentUserId() {
    return window.AnimoaAuth?.getUser?.()?.id || null;
  }

  function storageKey(base) {
    const userId = currentUserId();
    return userId ? `${base}:${userId}` : base;
  }

  function localUpdatedAt() {
    const value = Number(localStorage.getItem(storageKey(UPDATED_AT_KEY)) || 0);
    return Number.isFinite(value) ? value : 0;
  }

  function markLocalUpdated(date = Date.now()) {
    localStorage.setItem(storageKey(UPDATED_AT_KEY), String(date));
  }

  function appLocale() {
    const regionLocale = COUNTRY_MAP.get(settings?.country)?.locale;
    if (regionLocale) return regionLocale;
    return settings?.language === 'en' ? 'en-GB' : 'fr-FR';
  }

  function translateText(value) {
    return window.AnimoaI18n?.translateText?.(value) ?? value;
  }

  function translateTree(root) {
    window.AnimoaI18n?.translateTree?.(root);
  }

  function normalizeHexColor(value, fallback) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) return `#${raw.slice(1).split('').map((part) => part + part).join('')}`.toLowerCase();
    return fallback;
  }

  function normalizeCustomColors(value = {}) {
    return {
      primary: normalizeHexColor(value.primary, DEFAULT_CUSTOM_COLORS.primary),
      accent: normalizeHexColor(value.accent, DEFAULT_CUSTOM_COLORS.accent),
      lightBg: normalizeHexColor(value.lightBg, DEFAULT_CUSTOM_COLORS.lightBg),
      lightSurface: normalizeHexColor(value.lightSurface, DEFAULT_CUSTOM_COLORS.lightSurface),
      darkBg: normalizeHexColor(value.darkBg, DEFAULT_CUSTOM_COLORS.darkBg),
      darkSurface: normalizeHexColor(value.darkSurface, DEFAULT_CUSTOM_COLORS.darkSurface)
    };
  }

  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex, '#000000');
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    const part = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
    return `#${part(r)}${part(g)}${part(b)}`;
  }

  function mixHex(first, second, secondWeight = .5) {
    const a = hexToRgb(first);
    const b = hexToRgb(second);
    const weight = Math.max(0, Math.min(1, Number(secondWeight) || 0));
    return rgbToHex({ r: a.r + (b.r - a.r) * weight, g: a.g + (b.g - a.g) * weight, b: a.b + (b.b - a.b) * weight });
  }

  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const channel = (value) => {
      const normalized = value / 255;
      return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
    };
    return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
  }

  function readableText(background, light = '#f7faf9', dark = '#243033') {
    return relativeLuminance(background) < .34 ? light : dark;
  }

  function paletteThemeSource(preferences, mode) {
    if (preferences?.palette === 'custom') {
      const custom = normalizeCustomColors(preferences.customColors);
      return {
        primary: custom.primary,
        accent: custom.accent,
        bg: mode === 'dark' ? custom.darkBg : custom.lightBg,
        surface: mode === 'dark' ? custom.darkSurface : custom.lightSurface
      };
    }
    const palette = PALETTE_MAP.get(preferences?.palette) || PALETTE_MAP.get('animoa');
    return {
      primary: palette.colors[0],
      accent: palette.colors[1],
      bg: mode === 'dark' ? palette.darkBg : palette.lightBg,
      surface: mode === 'dark' ? palette.darkSurface : palette.lightSurface
    };
  }

  function buildThemeVariables(preferences, mode) {
    const source = paletteThemeSource(preferences, mode);
    const dark = mode === 'dark';
    const text = readableText(source.surface);
    const muted = mixHex(text, source.surface, dark ? .36 : .48);
    return {
      '--bg': source.bg,
      '--surface': source.surface,
      '--surface-soft': mixHex(source.surface, source.primary, dark ? .14 : .075),
      '--surface-elevated': mixHex(source.surface, dark ? '#ffffff' : source.bg, dark ? .06 : .18),
      '--primary': source.primary,
      '--primary-dark': mixHex(source.primary, dark ? '#ffffff' : '#000000', dark ? .28 : .27),
      '--primary-light': mixHex(source.primary, source.bg, dark ? .68 : .80),
      '--accent': source.accent,
      '--accent-soft': mixHex(source.accent, source.bg, dark ? .72 : .84),
      '--text': text,
      '--muted': muted,
      '--border': mixHex(source.surface, text, dark ? .20 : .12),
      '--danger': dark ? '#ff91a4' : '#b94455',
      '--warning': dark ? '#ffd084' : '#9a5d14',
      '--success': dark ? mixHex(source.primary, '#ffffff', .25) : mixHex(source.primary, '#000000', .20),
      '--input-bg': mixHex(source.surface, source.bg, dark ? .22 : .08)
    };
  }

  function clearThemeOverrides() {
    THEME_OVERRIDE_VARIABLES.forEach((name) => document.documentElement.style.removeProperty(name));
  }

  function resolvedTheme(preferences = settings) {
    if (preferences?.theme === 'dark' || preferences?.theme === 'light') return preferences.theme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyVisualPreferences(preferences = settings) {
    const mode = resolvedTheme(preferences);
    const palette = SUPPORTED_PALETTES.has(preferences?.palette) ? preferences.palette : 'animoa';
    document.documentElement.dataset.themePreference = preferences?.theme || 'system';
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.palette = palette;
    clearThemeOverrides();
    const variables = buildThemeVariables({ ...preferences, palette }, mode);
    Object.entries(variables).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
    const paletteColor = paletteThemeSource({ ...preferences, palette }, mode).primary;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? variables['--bg'] : paletteColor);
  }

  function renderStaticChrome() {
    const english = settings?.language === 'en';
    const tagline = english ? 'Their whole life, close to you.' : 'Toute sa vie, près de vous.';
    const taglineNode = document.querySelector('.topbar-brand span');
    if (taglineNode) taglineNode.textContent = tagline;
    const animalsButton = document.querySelector('.drawer-footer [data-page="animals"]');
    const settingsButton = document.querySelector('.drawer-footer [data-page="settings"]');
    const helpButton = document.querySelector('.drawer-footer [data-page="help"]');
    const contactButton = document.querySelector('.drawer-footer [data-page="contact"]');
    const privacyButton = document.querySelector('.drawer-footer [data-page="privacy"]');
    const legalButton = document.querySelector('.drawer-footer [data-page="legal"]');
    const versionNode = document.getElementById('drawerAppVersion');
    if (animalsButton) animalsButton.innerHTML = english ? '🐾 My pets' : '🐾 Mes animaux';
    if (settingsButton) settingsButton.innerHTML = english ? '⚙️ Settings' : '⚙️ Paramètres';
    if (helpButton) helpButton.innerHTML = english ? '❔ Help & support' : '❔ Aide & support';
    if (contactButton) contactButton.innerHTML = english ? '✉️ Contact us' : '✉️ Nous contacter';
    if (privacyButton) privacyButton.textContent = english ? 'Privacy' : 'Confidentialité';
    if (legalButton) legalButton.textContent = english ? 'Legal notice' : 'Mentions légales';
    if (versionNode) versionNode.textContent = `${english ? 'Version' : 'Version'} ${APP_VERSION}`;
    document.querySelectorAll('[aria-label="Navigation principale"], [aria-label="Main navigation"]').forEach((node) => node.setAttribute('aria-label', english ? 'Main navigation' : 'Navigation principale'));
    document.querySelectorAll('[aria-label="Navigation mobile"], [aria-label="Mobile navigation"]').forEach((node) => node.setAttribute('aria-label', english ? 'Mobile navigation' : 'Navigation mobile'));
  }

  function applyPreferences() {
    const language = SUPPORTED_LANGUAGES.has(settings?.language) ? settings.language : 'fr';
    if (window.AnimoaI18n?.getLanguage?.() !== language) window.AnimoaI18n?.setLanguage?.(language);
    document.documentElement.lang = language;
    applyVisualPreferences(settings);
    renderStaticChrome();
  }

  function setSyncStatus(state, detail = '') {
    syncState = state;
    if (!sidebarSyncStatus) return;
    const labels = { syncing: 'Synchronisation en cours…', synced: 'Synchronisé', offline: 'Hors ligne', local: 'Mode local de prévisualisation' };
    const icons = { syncing: '↻', synced: '✓', offline: '!', local: '•' };
    sidebarSyncStatus.innerHTML = `<span class="sync-dot ${state}">${icons[state] || '•'}</span><span>${translateText(labels[state] || detail || '')}</span>`;
    sidebarSyncStatus.title = detail || '';
  }

  async function flushCloudSave() {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    if (cloudLoadFailed) {
      setSyncStatus('offline');
      return false;
    }
    if (cloudHydrating || !window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return false;
    }
    setSyncStatus('syncing');
    try {
      await window.AnimoaCloud.saveBundle(data, settings);
      setSyncStatus('synced');
      return true;
    } catch (error) {
      console.warn('Synchronisation Animoa impossible', error);
      setSyncStatus('offline', error.message || 'Synchronisation impossible');
      showToast('Impossible de synchroniser les données. Elles restent enregistrées sur cet appareil.');
      throw error;
    }
  }

  function scheduleCloudSave() {
    if (cloudLoadFailed) {
      setSyncStatus('offline');
      return;
    }
    if (cloudHydrating || !window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return;
    }
    clearTimeout(cloudSaveTimer);
    setSyncStatus('syncing');
    cloudSaveTimer = setTimeout(() => {
      flushCloudSave().catch(() => {});
    }, 250);
  }

  async function hydrateUserState() {
    const userId = currentUserId();
    if (userId) {
      const userDataKey = `${STORAGE_KEY}:${userId}`;
      const userSettingsKey = `${SETTINGS_KEY}:${userId}`;
      const legacyClaimedBy = localStorage.getItem('animoa_legacy_migration_owner');

      if (localStorage.getItem(userDataKey)) {
        data = loadData();
      } else if (!legacyClaimedBy && localStorage.getItem(STORAGE_KEY)) {
        try {
          data = normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)));
        } catch {
          data = normalizeData(clone(defaultData));
        }
        localStorage.setItem(userDataKey, JSON.stringify(data));
        localStorage.setItem('animoa_legacy_migration_owner', userId);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        data = normalizeData(clone(defaultData));
        localStorage.setItem(userDataKey, JSON.stringify(data));
      }

      if (localStorage.getItem(userSettingsKey)) {
        settings = loadSettings();
      } else {
        const canMigrateLegacySettings = !legacyClaimedBy && localStorage.getItem(SETTINGS_KEY);
        if (canMigrateLegacySettings) {
          try { settings = normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY))); }
          catch { settings = normalizeSettings(); }
          localStorage.setItem('animoa_legacy_migration_owner', userId);
          localStorage.removeItem(SETTINGS_KEY);
        } else {
          settings = normalizeSettings({ language: window.AnimoaI18n?.getLanguage?.() || 'fr', theme: 'system', palette: 'animoa' });
        }
        localStorage.setItem(userSettingsKey, JSON.stringify(settings));
      }
    } else {
      data = loadData();
      settings = loadSettings();
    }

    if (!window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const bundle = await window.AnimoaCloud.loadBundle();
      const localTimestamp = localUpdatedAt();
      const remoteTimestamp = bundle?.updated_at ? Date.parse(bundle.updated_at) : 0;
      if (bundle?.data && localTimestamp > remoteTimestamp) {
        await window.AnimoaCloud.saveBundle(data, settings);
      } else if (bundle?.data) {
        cloudHydrating = true;
        data = normalizeData(bundle.data);
        settings = normalizeSettings(bundle.settings || settings);
        localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
        localStorage.setItem(storageKey(SETTINGS_KEY), JSON.stringify(settings));
        markLocalUpdated(Number.isFinite(remoteTimestamp) ? remoteTimestamp : Date.now());
        cloudHydrating = false;
      } else {
        await window.AnimoaCloud.saveBundle(data, settings);
      }
      cloudLoadFailed = false;
      setSyncStatus('synced');
    } catch (error) {
      cloudHydrating = false;
      cloudLoadFailed = true;
      console.warn('Chargement des données du compte impossible', error);
      setSyncStatus('offline', error.message || 'Synchronisation impossible');
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeHealthType(value) {
    const raw = String(value || 'Autre').trim();
    const key = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    return HEALTH_TYPE_ALIASES[key] || raw;
  }


  function petTypeLabel(pet) {
    if (!pet) return 'Animal';
    const species = String(pet.species || 'Autre').trim();
    const breed = String(pet.breed || '').trim();
    if (species.toLowerCase() === 'autre') return breed || 'Animal';
    return breed ? `${species} · ${breed}` : species;
  }

  function weightValueKg(item) {
    if (!item) return null;
    const direct = Number(item.valueKg);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const legacy = Number(item.value);
    if (!Number.isFinite(legacy) || legacy <= 0) return null;
    return item.unit === 'lb' ? legacy * KG_PER_LB : legacy;
  }

  function displayWeightValue(valueKg) {
    const kg = Number(valueKg);
    if (!Number.isFinite(kg)) return null;
    return settings.weightUnit === 'lb' ? kg / KG_PER_LB : kg;
  }

  function inputWeightToKg(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return settings.weightUnit === 'lb' ? number * KG_PER_LB : number;
  }

  function weightGuide(species) {
    return WEIGHT_GUIDES_KG[species] || WEIGHT_GUIDES_KG.Autre;
  }

  function displayWeightLimits(species) {
    const guide = weightGuide(species);
    const factor = settings.weightUnit === 'lb' ? 1 / KG_PER_LB : 1;
    return {
      min: guide.min * factor,
      max: guide.max * factor,
      step: guide.step * factor,
      label: guide.label
    };
  }

  function formatWeightNumber(valueKg, maximumFractionDigits = 2) {
    const displayed = displayWeightValue(valueKg);
    if (!Number.isFinite(displayed)) return '—';
    return displayed.toLocaleString(appLocale(), { maximumFractionDigits });
  }

  function formatWeight(valueKg, maximumFractionDigits = 2) {
    return `${formatWeightNumber(valueKg, maximumFractionDigits)} ${settings.weightUnit}`;
  }

  function validateWeightForSpecies(valueKg, species) {
    const guide = weightGuide(species);
    if (!Number.isFinite(valueKg) || valueKg <= 0) throw new Error('Veuillez indiquer un poids valide.');
    if (valueKg < guide.min || valueKg > guide.max) {
      const limits = displayWeightLimits(species);
      throw new Error(`Ce poids semble incohérent pour un ${guide.label}. Veuillez indiquer une valeur entre ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} et ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}.`);
    }
  }

  function normalizeWeightItem(item) {
    const valueKg = weightValueKg(item);
    return { ...item, valueKg };
  }

  function validatePastOrToday(dateValue, label = 'La date') {
    if (dateValue && dateValue > todayIso()) throw new Error(`${label} ne peut pas être dans le futur.`);
  }

  function validTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''));
  }

  function formatDirectTimeEntry(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  function parseHealthTime(value, required = true) {
    const raw = String(value || '').trim();
    if (!raw) {
      if (required) throw new Error('Veuillez indiquer l’heure prévue.');
      return '';
    }
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 4) throw new Error('L’heure doit contenir 4 chiffres, par exemple 1245 pour 12:45.');
    const time = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    if (!validTime(time)) throw new Error('Cette heure n’est pas valide. Veuillez saisir une heure comprise entre 00:00 et 23:59.');
    return time;
  }

  function healthDateTimeKey(item) {
    const time = validTime(item?.time) ? item.time : '00:00';
    return `${item?.date || ''}T${time}`;
  }

  function isPlannedHealthOverdue(item) {
    if (item?.status !== 'planned') return false;
    if (item.date < todayIso()) return true;
    if (item.date > todayIso() || !validTime(item.time)) return false;
    return new Date(`${item.date}T${item.time}:00`).getTime() < Date.now();
  }

  function validateHealthDate(status, dateValue) {
    const today = todayIso();
    if (status === 'done' && dateValue > today) throw new Error('La date de réalisation ne peut pas être postérieure à aujourd’hui.');
    if (status === 'planned' && dateValue < today) throw new Error('La date prévue ne peut pas être antérieure à aujourd’hui. Veuillez modifier la date ou sélectionner « Effectué ».');
  }

  function validateHealthDateTime(status, dateValue, timeValue) {
    if (!validTime(timeValue)) return;
    const plannedTime = new Date(`${dateValue}T${timeValue}:00`).getTime();
    if (!Number.isFinite(plannedTime)) return;
    if (status === 'planned' && plannedTime < Date.now()) {
      throw new Error('L’heure prévue ne peut pas être antérieure à l’heure actuelle.');
    }
    if (status === 'done' && plannedTime > Date.now()) {
      throw new Error('L’heure de réalisation ne peut pas être postérieure à l’heure actuelle.');
    }
  }

  function migrateLegacyData(value) {
    const source = value && typeof value === 'object' ? value : {};
    if (Number(source.version || 0) >= 4) return source;

    const pets = Array.isArray(source.pets) ? source.pets : [];
    const hasLegacyNala = pets.some((pet) => pet?.id === 'pet-nala');
    if (!hasLegacyNala) return { ...source, version: 4 };

    const remainingPets = pets.filter((pet) => pet?.id !== 'pet-nala');
    const keepOtherPetRecords = (items) => Array.isArray(items)
      ? items.filter((item) => item?.petId !== 'pet-nala')
      : [];

    return {
      ...source,
      version: 4,
      activePetId: source.activePetId === 'pet-nala' ? (remainingPets[0]?.id || null) : source.activePetId,
      pets: remainingPets,
      health: keepOtherPetRecords(source.health),
      expenses: keepOtherPetRecords(source.expenses),
      weights: keepOtherPetRecords(source.weights),
      memories: keepOtherPetRecords(source.memories)
    };
  }

  function normalizeData(value) {
    const migrated = migrateLegacyData(value);
    const normalized = {
      ...migrated,
      version: 4,
      pets: Array.isArray(migrated.pets) ? migrated.pets.map((pet) => ({
        ...pet,
        dogSize: ['auto', 'small', 'medium', 'large', 'giant'].includes(pet?.dogSize) ? pet.dogSize : 'auto'
      })) : [],
      health: Array.isArray(migrated.health) ? migrated.health.map((item) => ({
        ...item,
        type: normalizeHealthType(item.type),
        time: validTime(item.time) ? item.time : '',
        reminderRead: Boolean(item.reminderRead)
      })) : [],
      expenses: Array.isArray(migrated.expenses) ? migrated.expenses : [],
      weights: Array.isArray(migrated.weights) ? migrated.weights.map(normalizeWeightItem) : [],
      memories: Array.isArray(migrated.memories) ? migrated.memories : []
    };
    if (!normalized.pets.some((pet) => pet.id === normalized.activePetId)) normalized.activePetId = normalized.pets[0]?.id || null;
    return normalized;
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(storageKey(STORAGE_KEY));
      if (!saved) return normalizeData(clone(defaultData));
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.pets)) return normalizeData(clone(defaultData));
      const normalized = normalizeData(parsed);
      if (Number(parsed.version || 0) < 4) localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.warn('Impossible de lire les données Animoa', error);
      return clone(defaultData);
    }
  }

  function normalizeSettings(value = {}) {
    const calendarProvider = value.calendarProvider === 'google' ? 'google' : '';
    return {
      country: SUPPORTED_COUNTRIES.has(value.country) ? value.country : 'FR',
      autoCurrency: value.autoCurrency !== false,
      currency: SUPPORTED_CURRENCIES.has(value.currency) ? value.currency : (COUNTRY_MAP.get(SUPPORTED_COUNTRIES.has(value.country) ? value.country : 'FR')?.currency || 'EUR'),
      weightUnit: SUPPORTED_WEIGHT_UNITS.has(value.weightUnit) ? value.weightUnit : 'kg',
      language: SUPPORTED_LANGUAGES.has(value.language) ? value.language : (window.AnimoaI18n?.getLanguage?.() || 'fr'),
      theme: SUPPORTED_THEMES.has(value.theme) ? value.theme : 'system',
      palette: SUPPORTED_PALETTES.has(value.palette) ? value.palette : 'animoa',
      customColors: normalizeCustomColors(value.customColors),
      onboardingCompleted: Boolean(value.onboardingCompleted),
      calendarProvider,
      calendarConnected: Boolean(calendarProvider === 'google' && value.calendarConnected),
      calendarId: calendarProvider === 'google' ? String(value.calendarId || '') : '',
      calendarAutoSync: value.calendarAutoSync !== false,
      calendarConnectedAt: calendarProvider === 'google' ? String(value.calendarConnectedAt || '') : '',
      notifyAppointments: value.notifyAppointments !== false,
      notifyVaccines: value.notifyVaccines !== false,
      notifyTreatments: value.notifyTreatments !== false,
      notifyBirthdays: value.notifyBirthdays !== false,
      notifyNews: Boolean(value.notifyNews),
      pushEnabled: Boolean(value.pushEnabled),
      pushEndpoint: String(value.pushEndpoint || ''),
      quietHoursStart: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value.quietHoursStart || '22:00')) ? String(value.quietHoursStart || '22:00') : '22:00',
      quietHoursEnd: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value.quietHoursEnd || '08:00')) ? String(value.quietHoursEnd || '08:00') : '08:00',
      timezone: String(value.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris')
    };
  }

  function loadSettings() {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(storageKey(SETTINGS_KEY)) || '{}'));
    } catch {
      return normalizeSettings();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
      markLocalUpdated();
      updateReminderBadge();
      scheduleCloudSave();
    } catch (error) {
      if (error?.name === 'QuotaExceededError' || error?.code === 22) {
        throw new Error('Le stockage local est plein. Les photos sont maintenant séparées des données ; veuillez recharger Animoa puis réessayer.');
      }
      throw new Error('Impossible d’enregistrer les données sur cet appareil.');
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(storageKey(SETTINGS_KEY), JSON.stringify(settings));
      markLocalUpdated();
      applyPreferences();
      scheduleCloudSave();
    } catch {
      throw new Error('Impossible d’enregistrer les paramètres.');
    }
  }

  function openMediaDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('Le stockage des photos n’est pas disponible dans ce navigateur.'));
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(MEDIA_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Impossible d’ouvrir le stockage des photos.'));
      request.onblocked = () => reject(new Error('Le stockage des photos est bloqué par un autre onglet Animoa.'));
    });
    return mediaDbPromise;
  }

  async function putMediaBlob(blob, id = uid(`image-${currentUserId() || 'local'}`)) {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      transaction.objectStore(MEDIA_STORE_NAME).put({ id, blob, savedAt: new Date().toISOString() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('Impossible d’enregistrer la photo.'));
      transaction.onabort = () => reject(transaction.error || new Error('Enregistrement de la photo annulé.'));
    });
    return `${MEDIA_PREFIX}${id}`;
  }

  async function getMediaBlob(ref) {
    if (!ref?.startsWith(MEDIA_PREFIX)) return null;
    const id = ref.slice(MEDIA_PREFIX.length);
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const request = transaction.objectStore(MEDIA_STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error || new Error('Impossible de lire la photo.'));
    });
  }

  function allImageRefsFrom(sourceData = data) {
    return new Set(
      [...(sourceData.pets || []), ...(sourceData.memories || []), ...(sourceData.health || []), ...(sourceData.expenses || [])]
        .flatMap((item) => [item.image, item.attachment])
        .filter((ref) => typeof ref === 'string' && (ref.startsWith(MEDIA_PREFIX) || ref.startsWith(CLOUD_PREFIX)))
    );
  }

  function mediaRefsFrom(sourceData = data) {
    return new Set([...allImageRefsFrom(sourceData)].filter((ref) => ref.startsWith(MEDIA_PREFIX)));
  }

  async function deleteMediaRef(ref) {
    if (ref?.startsWith(CLOUD_PREFIX)) {
      try { await window.AnimoaCloud?.deleteImage?.(ref); }
      catch (error) { console.warn('Suppression de la photo distante impossible', error); }
      mediaUrlCache.delete(ref);
      return;
    }
    if (!ref?.startsWith(MEDIA_PREFIX)) return;
    const id = ref.slice(MEDIA_PREFIX.length);
    try {
      const db = await openMediaDb();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
        transaction.objectStore(MEDIA_STORE_NAME).delete(id);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Suppression de la photo impossible.'));
      });
      const cachedUrl = mediaUrlCache.get(ref);
      if (cachedUrl) URL.revokeObjectURL(cachedUrl);
      mediaUrlCache.delete(ref);
    } catch (error) {
      console.warn('Nettoyage d’une photo impossible', error);
    }
  }

  async function deleteMediaIfUnused(ref) {
    if (!ref || (!ref.startsWith(MEDIA_PREFIX) && !ref.startsWith(CLOUD_PREFIX))) return;
    if (!allImageRefsFrom().has(ref)) await deleteMediaRef(ref);
  }

  async function clearMediaStore(refsToDelete = []) {
    const refs = [...new Set(refsToDelete.filter(Boolean))];
    for (const ref of refs) await deleteMediaRef(ref);
    try {
      if (window.AnimoaCloud?.available?.()) await window.AnimoaCloud.clearUserImages();
    } catch (error) {
      console.warn('Nettoyage des photos distantes impossible', error);
    }
    mediaUrlCache.forEach((url) => { if (String(url).startsWith('blob:')) URL.revokeObjectURL(url); });
    mediaUrlCache.clear();
  }


  async function cleanupUnusedMedia() {
    try {
      const usedIds = new Set([...mediaRefsFrom()].map((ref) => ref.slice(MEDIA_PREFIX.length)));
      const db = await openMediaDb();
      const storedIds = await new Promise((resolve, reject) => {
        const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
        const request = transaction.objectStore(MEDIA_STORE_NAME).getAllKeys();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error || new Error('Lecture des photos impossible.'));
      });
      const namespacePrefix = `image-${currentUserId() || 'local'}-`;
      for (const id of storedIds) {
        const storedId = String(id);
        if (storedId.startsWith(namespacePrefix) && !usedIds.has(storedId)) await deleteMediaRef(`${MEDIA_PREFIX}${storedId}`);
      }
    } catch (error) {
      console.warn('Nettoyage des anciennes photos impossible', error);
    }
  }

  async function dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Impossible de préparer la photo.'));
      reader.readAsDataURL(blob);
    });
  }

  function detectedFileType(file) {
    if (file?.type) return file.type;
    const extension = String(file?.name || '').toLowerCase().split('.').pop();
    const types = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      gif: 'image/gif', heic: 'image/heic', heif: 'image/heif',
      pdf: 'application/pdf', doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return types[extension] || 'application/octet-stream';
  }

  function fileWithDetectedType(file) {
    if (!file || file.type) return file;
    const type = detectedFileType(file);
    try { return new File([file], file.name || 'fichier', { type, lastModified: file.lastModified || Date.now() }); }
    catch { return file.slice(0, file.size, type); }
  }

  async function compressImage(file) {
    file = fileWithDetectedType(file);
    if (!file) return null;
    if (!file.type.startsWith('image/')) throw new Error('Le fichier choisi n’est pas une image.');
    if (file.size > 20 * 1024 * 1024) throw new Error('Cette image est trop volumineuse. Veuillez choisir une photo de moins de 20 Mo.');

    const bitmap = await createImageBitmap(file);
    const maxSide = 1000;
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .72));
    if (!blob) throw new Error('Impossible de réduire cette photo.');
    return blob;
  }

  async function storeBlob(blob, fileName = 'image.webp') {
    let cloudError = null;
    try {
      const cloudRef = await window.AnimoaCloud?.uploadFile?.(blob, fileName);
      if (cloudRef) return cloudRef;
    } catch (error) {
      cloudError = error;
      console.warn('Stockage distant indisponible, conservation locale', error);
    }
    try {
      return await putMediaBlob(blob);
    } catch (localError) {
      const fallback = await blobToDataUrl(blob);
      if (fallback.length > 650000) throw (cloudError || localError);
      return fallback;
    }
  }

  async function fileToMediaRef(file) {
    if (!file) return null;
    const blob = await compressImage(file);
    return storeBlob(blob, 'image.webp');
  }

  async function fileToAttachmentRef(file) {
    if (!file) return null;
    const preparedFile = fileWithDetectedType(file);
    if (preparedFile.size > 15 * 1024 * 1024) throw new Error('Ce fichier est trop volumineux. Veuillez choisir un fichier de moins de 15 Mo.');
    if (preparedFile.type.startsWith('image/')) return fileToMediaRef(preparedFile);
    return storeBlob(preparedFile, file.name || 'document.bin');
  }

  async function resolveImageRef(ref) {
    if (!ref) return placeholderImage;
    if (ref.startsWith(CLOUD_PREFIX)) {
      try {
        const url = await window.AnimoaCloud?.getImageUrl?.(ref);
        if (!url) return placeholderImage;
        return url;
      } catch (error) {
        console.warn('Photo Animoa distante indisponible', error);
        return placeholderImage;
      }
    }
    if (!ref.startsWith(MEDIA_PREFIX)) return ref;
    if (mediaUrlCache.has(ref)) return mediaUrlCache.get(ref);
    try {
      const blob = await getMediaBlob(ref);
      if (!blob) return placeholderImage;
      const url = URL.createObjectURL(blob);
      mediaUrlCache.set(ref, url);
      return url;
    } catch (error) {
      console.warn('Photo Animoa indisponible', error);
      return placeholderImage;
    }
  }

  function imageTag(ref, className, alt, extra = '') {
    const safeRef = escapeHtml(ref || placeholderImage);
    return `<img class="${className || ''} media-loading" src="${placeholderImage}" data-image-ref="${safeRef}" alt="${escapeHtml(alt || '')}" ${extra}>`;
  }


  function petPhotoButton(pet, imageClass = '', buttonClass = '') {
    if (!pet) return imageTag(placeholderImage, imageClass, 'Photo de l’animal');
    return `<button type="button" class="pet-photo-button ${buttonClass}" data-action="open-pet-photo" data-pet-id="${escapeHtml(pet.id)}" aria-label="Agrandir la photo de ${escapeHtml(pet.name)}">${imageTag(pet.image, imageClass, `Photo de ${pet.name}`)}<span class="pet-photo-zoom" aria-hidden="true">⌕</span></button>`;
  }

  function selectedPhotoFile(input) {
    return input ? (preparedPhotoFiles.get(input) || input.files?.[0] || null) : null;
  }

  function releaseFilePreviewUrl(input) {
    const currentUrl = previewObjectUrls.get(input);
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    previewObjectUrls.delete(input);
  }

  function filePickerLabels(picker) {
    const isPhoto = picker?.dataset.isPhoto === 'true';
    return {
      add: isPhoto ? 'Ajouter une photo' : 'Ajouter une photo ou un fichier',
      replace: isPhoto ? 'Remplacer la photo' : 'Remplacer la pièce jointe'
    };
  }

  function setFilePickerEmpty(input, { removeExisting = false } = {}) {
    const picker = input?.closest('.file-picker');
    if (!picker) return;
    releaseFilePreviewUrl(input);
    preparedPhotoFiles.delete(input);
    input.value = '';
    const preview = picker.querySelector('.file-picker-preview');
    if (preview) {
      preview.hidden = true;
      preview.dataset.previewSource = 'none';
      preview.innerHTML = '';
    }
    const removeField = picker.querySelector(`input[name="${input.name}Remove"]`);
    if (removeField) removeField.value = removeExisting ? '1' : '0';
    if (removeExisting) picker.dataset.existingSuppressed = 'true';
    const labels = filePickerLabels(picker);
    const buttonText = picker.querySelector('.file-picker-button-text');
    if (buttonText) buttonText.textContent = translateText(labels.add);
    const name = picker.querySelector('.file-picker-name');
    if (name) name.textContent = translateText('Aucun fichier sélectionné');
  }

  async function restoreExistingFilePreview(input) {
    const picker = input?.closest('.file-picker');
    if (!picker) return;
    const hasExisting = picker.dataset.hasExisting === 'true';
    if (!hasExisting) {
      setFilePickerEmpty(input);
      return;
    }
    releaseFilePreviewUrl(input);
    preparedPhotoFiles.delete(input);
    input.value = '';
    picker.dataset.existingSuppressed = 'false';
    const removeField = picker.querySelector(`input[name="${input.name}Remove"]`);
    if (removeField) removeField.value = '0';
    const preview = picker.querySelector('.file-picker-preview');
    const ref = picker.dataset.existingRef || '';
    const fileName = picker.dataset.existingName || 'Fichier actuel';
    const type = picker.dataset.existingType || '';
    const isImage = picker.dataset.isPhoto === 'true' || type.startsWith('image/');
    if (preview) {
      preview.hidden = false;
      preview.dataset.previewSource = 'existing';
      preview.innerHTML = `
        <div class="file-preview-media">${isImage ? '<img class="file-preview-image media-loading" alt="Aperçu du fichier" />' : '<span class="file-preview-icon" aria-hidden="true">📄</span>'}</div>
        <div class="file-preview-copy"><strong>${escapeHtml(fileName)}</strong><span>${translateText(isImage ? 'Image jointe' : 'Document joint')}</span></div>
        <button class="file-preview-remove" type="button" data-action="remove-file-selection" data-input-id="${escapeHtml(input.id)}" aria-label="${translateText('Retirer le fichier')}">✕</button>`;
      if (isImage) {
        const image = preview.querySelector('img');
        const src = await resolveImageRef(ref);
        if (image?.isConnected && preview.dataset.previewSource === 'existing') {
          image.src = src;
          image.classList.remove('media-loading');
        }
      }
    }
    const labels = filePickerLabels(picker);
    const buttonText = picker.querySelector('.file-picker-button-text');
    if (buttonText) buttonText.textContent = translateText(labels.replace);
    const name = picker.querySelector('.file-picker-name');
    if (name) name.textContent = translateText(fileName);
  }

  function showSelectedFilePreview(input, file, displayName = '') {
    const picker = input?.closest('.file-picker');
    if (!picker || !file) return;
    releaseFilePreviewUrl(input);
    const preview = picker.querySelector('.file-picker-preview');
    const type = detectedFileType(file);
    const isImage = type.startsWith('image/');
    const fileName = displayName || file.name || 'Fichier sélectionné';
    const sizeText = `${(file.size / 1024 / 1024).toFixed(file.size >= 1024 * 1024 ? 2 : 3).replace('.', ',')} Mo`;
    if (preview) {
      preview.hidden = false;
      preview.dataset.previewSource = 'new';
      preview.innerHTML = `
        <div class="file-preview-media">${isImage ? '<img class="file-preview-image" alt="Aperçu du fichier sélectionné" />' : '<span class="file-preview-icon" aria-hidden="true">📄</span>'}</div>
        <div class="file-preview-copy"><strong>${escapeHtml(fileName)}</strong><span>${escapeHtml(sizeText)}</span></div>
        <button class="file-preview-remove" type="button" data-action="remove-file-selection" data-input-id="${escapeHtml(input.id)}" aria-label="${translateText('Retirer le fichier')}">✕</button>`;
      if (isImage) {
        const url = URL.createObjectURL(file);
        previewObjectUrls.set(input, url);
        const image = preview.querySelector('img');
        if (image) image.src = url;
      }
    }
    const removeField = picker.querySelector(`input[name="${input.name}Remove"]`);
    if (removeField) removeField.value = '0';
    const labels = filePickerLabels(picker);
    const buttonText = picker.querySelector('.file-picker-button-text');
    if (buttonText) buttonText.textContent = translateText(labels.replace);
    const name = picker.querySelector('.file-picker-name');
    if (name) name.textContent = translateText(fileName);
  }

  function removeFilePickerSelection(input) {
    const picker = input?.closest('.file-picker');
    if (!picker) return;
    const preview = picker.querySelector('.file-picker-preview');
    const source = preview?.dataset.previewSource || 'none';
    const hasExisting = picker.dataset.hasExisting === 'true';
    const existingSuppressed = picker.dataset.existingSuppressed === 'true';
    if (source === 'new' && hasExisting && !existingSuppressed) {
      restoreExistingFilePreview(input).catch(() => setFilePickerEmpty(input));
      return;
    }
    setFilePickerEmpty(input, { removeExisting: hasExisting });
  }

  function createCropperShell(title, circularGuide = false) {
    const overlay = document.createElement('div');
    overlay.className = 'cropper-overlay';
    overlay.innerHTML = `
      <section class="cropper-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="cropper-header"><div><p class="eyebrow">Photo</p><h2>${escapeHtml(title)}</h2></div><button type="button" class="icon-button cropper-close" aria-label="Annuler">✕</button></div>
        <div class="cropper-stage ${circularGuide ? 'cropper-stage-circle' : ''}"><canvas class="cropper-canvas" width="900" height="900"></canvas><div class="cropper-guide" aria-hidden="true"></div></div>
        <p class="cropper-help">Déplacez la photo avec le doigt ou la souris, puis ajustez le zoom.</p>
        <label class="cropper-zoom-row"><span>Zoom</span><input class="cropper-zoom-input" type="range" min="1" max="3" step="0.01" value="1" /></label>
        <div class="cropper-actions"><button type="button" class="secondary-button cropper-cancel">Annuler</button><button type="button" class="primary-button cropper-confirm">Valider le recadrage</button></div>
      </section>`;
    document.body.appendChild(overlay);
    document.body.classList.add('cropper-open');
    translateTree(overlay);
    return overlay;
  }

  async function cropImageFile(file, { aspect = 1, title = 'Recadrer la photo', circularGuide = false } = {}) {
    const prepared = fileWithDetectedType(file);
    if (!prepared?.type?.startsWith('image/')) throw new Error('Le fichier choisi n’est pas une image.');
    if (prepared.size > 20 * 1024 * 1024) throw new Error('Cette image est trop volumineuse. Veuillez choisir une photo de moins de 20 Mo.');

    let bitmap;
    try { bitmap = await createImageBitmap(prepared); }
    catch { throw new Error('Impossible d’ouvrir cette photo pour la recadrer.'); }

    const overlay = createCropperShell(title, circularGuide);
    const canvas = overlay.querySelector('.cropper-canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const zoomInput = overlay.querySelector('.cropper-zoom-input');
    const stage = overlay.querySelector('.cropper-stage');
    const state = { bitmap, zoom: 1, offsetX: 0, offsetY: 0, dragging: false, pointerId: null, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, aspect };
    stage.style.aspectRatio = String(aspect);

    function viewportSize() {
      const width = 900;
      return { width, height: Math.max(1, Math.round(width / aspect)) };
    }

    function geometry() {
      const viewport = viewportSize();
      if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
      }
      const baseScale = Math.max(viewport.width / bitmap.width, viewport.height / bitmap.height);
      const scale = baseScale * state.zoom;
      const drawnWidth = bitmap.width * scale;
      const drawnHeight = bitmap.height * scale;
      const maxX = Math.max(0, (drawnWidth - viewport.width) / 2);
      const maxY = Math.max(0, (drawnHeight - viewport.height) / 2);
      state.offsetX = Math.max(-maxX, Math.min(maxX, state.offsetX));
      state.offsetY = Math.max(-maxY, Math.min(maxY, state.offsetY));
      return { ...viewport, scale, drawnWidth, drawnHeight, maxX, maxY };
    }

    function renderCropper() {
      const g = geometry();
      context.fillStyle = '#172522';
      context.fillRect(0, 0, g.width, g.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, (g.width - g.drawnWidth) / 2 + state.offsetX, (g.height - g.drawnHeight) / 2 + state.offsetY, g.drawnWidth, g.drawnHeight);
    }

    function cleanup() {
      bitmap.close?.();
      overlay.remove();
      document.body.classList.remove('cropper-open');
    }

    function outputBlob() {
      renderCropper();
      const output = document.createElement('canvas');
      const outputWidth = aspect === 1 ? 1000 : 1200;
      const outputHeight = Math.max(1, Math.round(outputWidth / aspect));
      output.width = outputWidth;
      output.height = outputHeight;
      const outputContext = output.getContext('2d', { alpha: false });
      outputContext.fillStyle = '#ffffff';
      outputContext.fillRect(0, 0, outputWidth, outputHeight);
      outputContext.drawImage(canvas, 0, 0, outputWidth, outputHeight);
      return new Promise((resolve) => output.toBlob(resolve, 'image/webp', .9));
    }

    renderCropper();

    return new Promise((resolve, reject) => {
      const cancel = () => { cleanup(); resolve(null); };
      overlay.querySelector('.cropper-close').addEventListener('click', cancel);
      overlay.querySelector('.cropper-cancel').addEventListener('click', cancel);
      overlay.addEventListener('click', (event) => { if (event.target === overlay) cancel(); });
      zoomInput.addEventListener('input', () => { state.zoom = Number(zoomInput.value) || 1; renderCropper(); });

      stage.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        state.dragging = true;
        state.pointerId = event.pointerId;
        state.startX = event.clientX;
        state.startY = event.clientY;
        state.startOffsetX = state.offsetX;
        state.startOffsetY = state.offsetY;
        stage.setPointerCapture?.(event.pointerId);
      });
      stage.addEventListener('pointermove', (event) => {
        if (!state.dragging || event.pointerId !== state.pointerId) return;
        const rect = stage.getBoundingClientRect();
        const factorX = canvas.width / Math.max(1, rect.width);
        const factorY = canvas.height / Math.max(1, rect.height);
        state.offsetX = state.startOffsetX + (event.clientX - state.startX) * factorX;
        state.offsetY = state.startOffsetY + (event.clientY - state.startY) * factorY;
        renderCropper();
      });
      const stopDrag = (event) => {
        if (event.pointerId !== state.pointerId) return;
        state.dragging = false;
        state.pointerId = null;
      };
      stage.addEventListener('pointerup', stopDrag);
      stage.addEventListener('pointercancel', stopDrag);

      overlay.querySelector('.cropper-confirm').addEventListener('click', async () => {
        const confirm = overlay.querySelector('.cropper-confirm');
        confirm.disabled = true;
        confirm.textContent = translateText('Préparation…');
        try {
          const blob = await outputBlob();
          if (!blob) throw new Error('Impossible de préparer la photo recadrée.');
          const cropped = new File([blob], 'animoa-photo-recadree.webp', { type: 'image/webp', lastModified: Date.now() });
          cleanup();
          resolve(cropped);
        } catch (error) {
          cleanup();
          reject(error);
        }
      });
    });
  }

  function updatePhotoViewer() {
    const image = document.getElementById('petPhotoViewerImage');
    const label = document.getElementById('petPhotoViewerZoom');
    if (image) image.style.transform = `scale(${photoViewerScale})`;
    if (label) label.textContent = `${Math.round(photoViewerScale * 100)} %`;
  }

  async function openPetPhoto(petId) {
    const pet = data.pets.find((item) => item.id === petId);
    if (!pet) return showToast('Cet animal n’existe plus.');
    const source = await resolveImageRef(pet.image || placeholderImage);
    photoViewerScale = 1;
    openModal(`Photo de ${pet.name}`, `
      <div class="pet-photo-viewer">
        <div class="pet-photo-viewer-stage"><img id="petPhotoViewerImage" src="${escapeHtml(source)}" alt="Photo de ${escapeHtml(pet.name)}" /></div>
        <div class="pet-photo-viewer-controls"><button type="button" class="secondary-button" data-action="photo-zoom-out" aria-label="Dézoomer">−</button><span id="petPhotoViewerZoom">100 %</span><button type="button" class="secondary-button" data-action="photo-zoom-in" aria-label="Zoomer">+</button><button type="button" class="secondary-button" data-action="photo-zoom-reset">Réinitialiser</button></div>
      </div>`, 'Photo');
  }

  async function hydrateImages(root = document) {
    const images = [...root.querySelectorAll('img[data-image-ref]')];
    await Promise.all(images.map(async (image) => {
      const expectedRef = image.dataset.imageRef;
      const source = await resolveImageRef(expectedRef);
      if (image.isConnected && image.dataset.imageRef === expectedRef) {
        image.src = source;
        image.classList.remove('media-loading');
      }
    }));
  }

  async function migrateLegacyImages() {
    const targets = [...data.pets, ...data.memories].filter((item) => typeof item.image === 'string' && item.image.startsWith('data:image/'));
    if (!targets.length) return;
    let changed = false;
    for (const item of targets) {
      try {
        const sourceBlob = await dataUrlToBlob(item.image);
        const compactBlob = await compressImage(sourceBlob);
        item.image = await storeBlob(compactBlob, 'image.webp');
        changed = true;
      } catch (error) {
        console.warn('Migration d’une ancienne photo impossible', error);
      }
    }
    if (changed) saveData();
  }

  async function migrateLocalMediaToCloud() {
    if (!window.AnimoaCloud?.available?.()) return;
    const targets = [
      ...data.pets.map((item) => ({ item, field: 'image', fileName: 'image.webp' })),
      ...data.memories.map((item) => ({ item, field: 'image', fileName: 'image.webp' })),
      ...data.health.map((item) => ({ item, field: 'attachment', fileName: item.attachmentName || 'document.bin' })),
      ...data.expenses.map((item) => ({ item, field: 'attachment', fileName: item.attachmentName || 'document.bin' }))
    ].filter(({ item, field }) => typeof item[field] === 'string' && item[field].startsWith(MEDIA_PREFIX));
    if (!targets.length) return;

    const uploadedByLocalRef = new Map();
    const replacements = [];
    for (const target of targets) {
      const localRef = target.item[target.field];
      try {
        let cloudRef = uploadedByLocalRef.get(localRef);
        if (!cloudRef) {
          const blob = await getMediaBlob(localRef);
          if (!blob) continue;
          const fileName = blob.type === 'image/webp' ? 'image.webp' : target.fileName;
          cloudRef = await window.AnimoaCloud.uploadFile(blob, fileName);
          if (!cloudRef) continue;
          uploadedByLocalRef.set(localRef, cloudRef);
        }
        replacements.push({ target, localRef, cloudRef });
        target.item[target.field] = cloudRef;
      } catch (error) {
        console.warn('Synchronisation d’un ancien fichier impossible', error);
      }
    }
    if (!replacements.length) return;

    try {
      saveData();
      await window.AnimoaCloud.saveBundle(data, settings);
      setSyncStatus('synced');
      for (const localRef of new Set(replacements.map((entry) => entry.localRef))) await deleteMediaRef(localRef);
    } catch (error) {
      for (const { target, localRef } of replacements) target.item[target.field] = localRef;
      localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
      for (const cloudRef of new Set(replacements.map((entry) => entry.cloudRef))) await deleteMediaRef(cloudRef);
      console.warn('Migration des fichiers locaux vers le compte incomplète', error);
    }
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function requiredText(value, label) {
    const text = String(value || '').trim();
    if (!text) throw new Error(`Veuillez indiquer ${label}.`);
    return text;
  }

  function activePet() {
    return data.pets.find((pet) => pet.id === data.activePetId) || data.pets[0] || null;
  }

  function petItems(collection) {
    const pet = activePet();
    if (!pet) return [];
    return data[collection].filter((item) => item.petId === pet.id);
  }

  function formatDate(value, options = {}) {
    if (!value) return 'Non renseigné';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(appLocale(), options.short
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' }
    ).format(date);
  }

  function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }


  function isoDateToFrench(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
  }

  function formatDirectDateEntry(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function daysInMonth(year, month) {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
  }

  function parseFrenchDate(value, label = 'La date', { required = false } = {}) {
    const raw = String(value || '').trim();
    if (!raw) {
      if (required) throw new Error(`${label} est obligatoire.`);
      return '';
    }
    const match = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (!match) throw new Error(`${label} doit être saisie au format JJ/MM/AAAA.`);
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
      throw new Error(`${label} n’est pas valide. Veuillez vérifier le jour, le mois et l’année.`);
    }
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function tryParseFrenchDate(value) {
    try { return parseFrenchDate(value); }
    catch { return ''; }
  }

  function dateInputControl({ id, name, value = '', min = '', max = '', required = false, help = '', describedBy = '' }) {
    const frenchValue = isoDateToFrench(value);
    const helpId = describedBy || `${id}Help`;
    return `<div class="date-input-control" data-date-control>
      <input id="${id}" class="date-text-input" name="${name}" type="text" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="JJ/MM/AAAA" value="${escapeHtml(frenchValue)}" ${required ? 'required' : ''} ${helpId ? `aria-describedby="${helpId}"` : ''} data-min-date="${escapeHtml(min)}" data-max-date="${escapeHtml(max)}" />
      <label class="date-picker-button" title="Ouvrir le calendrier" aria-label="Ouvrir le calendrier pour ce champ">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 11h18"></path></svg>
        <input id="${id}Picker" class="date-picker-native" type="date" value="${escapeHtml(value)}" ${min ? `min="${escapeHtml(min)}"` : ''} ${max ? `max="${escapeHtml(max)}"` : ''} tabindex="-1" aria-hidden="true" />
      </label>
    </div>${help ? `<span id="${helpId}" class="form-help">${help}</span>` : ''}`;
  }

  function daysUntil(dateValue) {
    const today = new Date(`${todayIso()}T12:00:00`);
    const target = new Date(`${dateValue}T12:00:00`);
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  }

  function ageText(dateValue) {
    if (!dateValue) return 'Âge non renseigné';
    const birth = new Date(`${dateValue}T12:00:00`);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const anniversary = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (now < anniversary) years -= 1;
    if (years <= 0) {
      const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());
      return `${months} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  }


  function ageInMonths(dateValue) {
    if (!dateValue) return null;
    const birth = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months -= 1;
    return Math.max(0, months);
  }

  function interpolateAge(months, anchors) {
    if (months <= anchors[0][0]) return anchors[0][1];
    for (let index = 1; index < anchors.length; index += 1) {
      const [rightMonth, rightValue] = anchors[index];
      const [leftMonth, leftValue] = anchors[index - 1];
      if (months <= rightMonth) {
        const progress = (months - leftMonth) / Math.max(1, rightMonth - leftMonth);
        return leftValue + (rightValue - leftValue) * progress;
      }
    }
    return anchors.at(-1)[1];
  }

  function dogSizeFromWeight(weightKg) {
    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0) return 'medium';
    if (weight < 10) return 'small';
    if (weight < 25) return 'medium';
    if (weight < 40) return 'large';
    return 'giant';
  }

  function resolvedDogSize(pet, weightKg = null) {
    const chosen = String(pet?.dogSize || 'auto');
    if (['small', 'medium', 'large', 'giant'].includes(chosen)) return chosen;
    const weight = Number(weightKg);
    if (Number.isFinite(weight) && weight > 0) return dogSizeFromWeight(weight);
    return catalogEntry('Chien', pet?.breed)?.size || 'medium';
  }

  function dogSizeLabel(size) {
    return ({ small: 'petit', medium: 'moyen', large: 'grand', giant: 'géant' })[size] || 'moyen';
  }

  function normalizeCatalogText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’'`´-]/g, ' ')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function petCatalogEntries(species) {
    return Array.isArray(PET_CATALOG?.[species]) ? PET_CATALOG[species] : [];
  }

  function catalogEntry(species, breed) {
    const needle = normalizeCatalogText(breed);
    if (!needle) return null;
    const aliases = species === 'Chien' && ['saint bernard', 'saint-bernard', 'chien du mont saint bernard'].includes(needle)
      ? 'chien du mont saint bernard saint bernard'
      : needle;
    return petCatalogEntries(species).find((entry) => {
      const entryText = normalizeCatalogText(entry.name);
      return entryText === aliases || (species === 'Chien' && entryText === 'chien du mont saint bernard saint bernard' && aliases.includes('saint bernard'));
    }) || null;
  }

  function breedFieldLabel() {
    return 'Race, variété ou type';
  }

  function breedDisplayName(species, entry) {
    if (!entry) return '';
    if (species === 'Chien' && normalizeCatalogText(entry.name) === 'chien du mont saint bernard saint bernard') return 'Saint-Bernard';
    return entry.name;
  }

  function breedFieldPlaceholder(species) {
    if (species === 'Oiseau') return 'Choisir une espèce';
    if (species === 'Autre') return 'Précisez le type de votre animal';
    return `Choisir une race de ${species.toLowerCase()}`;
  }

  function breedCatalogHelp() {
    return '';
  }

  function breedSelectHtml(species, selectedValue = '') {
    const entries = petCatalogEntries(species);
    if (!entries.length) {
      return `<input id="petBreed" name="breedChoice" value="${escapeHtml(selectedValue)}" placeholder="Précisez la race, la variété ou le type" autocomplete="off" />`;
    }

    const otherLabel = species === 'Oiseau' ? 'Autre espèce' : 'Autre race';
    const selectedEntry = catalogEntry(species, selectedValue);
    const isCustomValue = Boolean(selectedValue) && !selectedEntry;
    const isOther = isCustomValue || selectedEntry?.name === otherLabel;
    const storedValue = isOther ? '__other__' : (selectedEntry?.name || '');
    const shownValue = isCustomValue
      ? selectedValue
      : (selectedEntry ? breedDisplayName(species, selectedEntry) : breedFieldPlaceholder(species));

    return `<div class="pet-breed-picker-field">
      <input id="petBreed" name="breedChoice" type="hidden" value="${escapeHtml(storedValue)}" />
      <button class="pet-breed-picker-trigger ${storedValue ? 'has-value' : ''}" type="button" data-action="open-breed-picker" aria-haspopup="dialog">
        <span class="pet-breed-picker-value">${escapeHtml(shownValue)}</span>
        <span class="pet-breed-picker-chevron" aria-hidden="true">⌄</span>
      </button>
      <div id="petBreedOtherRow" class="pet-breed-other-row" ${isOther ? '' : 'hidden'}>
        <label for="petBreedOther">Précisez</label>
        <input id="petBreedOther" name="breedOther" value="${escapeHtml(isCustomValue ? selectedValue : '')}" placeholder="${escapeHtml(species === 'Oiseau' ? 'Nom de l’espèce' : 'Nom de la race')}" autocomplete="off" />
      </div>
    </div>`;
  }

  function breedPickerSpecialName(species, entry) {
    const name = entry?.name || '';
    if (species === 'Oiseau') return ['Espèce inconnue', 'Autre espèce'].includes(name);
    return ['Croisé', 'Race inconnue', 'Autre race'].includes(name);
  }

  function breedPickerFilters(species) {
    if (species === 'Chien') return [
      ['popular', 'Courants'], ['all', 'Toutes'], ['small', 'Petit'], ['medium', 'Moyen'], ['large', 'Grand'], ['giant', 'Géant']
    ];
    if (species === 'Chat') return [
      ['popular', 'Courants'], ['all', 'Toutes'], ['short', 'Poil court'], ['long', 'Poil long'], ['hairless', 'Sans poil']
    ];
    if (species === 'Lapin') return [
      ['popular', 'Courants'], ['all', 'Toutes'], ['dwarf', 'Nain'], ['small', 'Petit'], ['medium', 'Moyen'], ['large', 'Grand'], ['giant', 'Géant']
    ];
    if (species === 'Oiseau') return [
      ['popular', 'Courants'], ['all', 'Toutes'], ['parakeet', 'Perruches'], ['parrot', 'Perroquets'], ['smallbird', 'Petits oiseaux'], ['otherbird', 'Autres']
    ];
    return [['all', 'Toutes']];
  }

  function breedPickerIsPopular(species, entry) {
    const popular = BREED_PICKER_POPULAR[species] || [];
    const entryName = normalizeCatalogText(entry?.name);
    return popular.some((name) => normalizeCatalogText(name) === entryName);
  }

  function catCoatGroup(entry) {
    const name = normalizeCatalogText(entry?.name);
    if (/sphynx|peterbald|donskoy/.test(name)) return 'hairless';
    if (/poil long|maine coon|persan|ragdoll|sacre de birmanie|norvegien|somali|angora|nebelung|himalayen|balinais/.test(name)) return 'long';
    return 'short';
  }

  function birdGroup(entry) {
    const name = normalizeCatalogText(entry?.name);
    if (/perruche|calopsitte|inseparable|toui/.test(name)) return 'parakeet';
    if (/amazone|ara |^ara|cacatoes|perroquet|conure|pionus|caique|lori|loriquet|youyou/.test(name)) return 'parrot';
    if (/canari|diamant|moineau|padda|bengali|cordon-bleu/.test(name)) return 'smallbird';
    return 'otherbird';
  }

  function breedPickerMatchesFilter(species, entry, filter) {
    if (breedPickerSpecialName(species, entry)) return false;
    if (filter === 'all') return true;
    if (filter === 'popular') return breedPickerIsPopular(species, entry);
    if (species === 'Chien' || species === 'Lapin') return entry.size === filter;
    if (species === 'Chat') return catCoatGroup(entry) === filter;
    if (species === 'Oiseau') return birdGroup(entry) === filter;
    return true;
  }

  function breedPickerEntrySearch(species, entry) {
    const aliases = species === 'Chien' && normalizeCatalogText(entry?.name) === 'chien du mont saint bernard saint bernard'
      ? ' saint bernard saint-bernard '
      : '';
    return normalizeCatalogText(`${entry?.name || ''} ${entry?.scientific || ''}${aliases}`);
  }

  function breedPickerSubtitle(species, entry) {
    if (species === 'Chien') return `${dogSizeLabel(entry.size)} gabarit`;
    if (species === 'Lapin') return ({ dwarf: 'gabarit nain', small: 'petit gabarit', medium: 'gabarit moyen', large: 'grand gabarit', giant: 'gabarit géant' })[entry.size] || '';
    if (species === 'Oiseau') return entry.scientific || '';
    if (species === 'Chat') return ({ short: 'poil court', long: 'poil long', hairless: 'sans poil' })[catCoatGroup(entry)] || '';
    return '';
  }

  function ensureBreedPicker() {
    if (document.getElementById('petBreedPickerBackdrop')) return;
    document.body.insertAdjacentHTML('beforeend', `<div id="petBreedPickerBackdrop" class="pet-breed-picker-backdrop" hidden>
      <section id="petBreedPicker" class="pet-breed-picker" role="dialog" aria-modal="true" aria-labelledby="petBreedPickerTitle">
        <header class="pet-breed-picker-header">
          <div><p class="eyebrow">PROFIL</p><h2 id="petBreedPickerTitle">Choisir</h2></div>
          <button class="icon-button" type="button" data-action="close-breed-picker" aria-label="Fermer">✕</button>
        </header>
        <div class="pet-breed-picker-search-wrap">
          <span class="pet-breed-picker-search-icon" aria-hidden="true">⌕</span>
          <input id="petBreedPickerSearch" type="search" placeholder="Rechercher…" autocomplete="off" spellcheck="false" />
          <button id="petBreedPickerClear" class="pet-breed-picker-clear" type="button" data-action="clear-breed-picker-search" aria-label="Effacer la recherche" hidden>✕</button>
        </div>
        <div id="petBreedPickerFilters" class="pet-breed-picker-filters" aria-label="Filtres"></div>
        <div id="petBreedPickerResults" class="pet-breed-picker-results"></div>
      </section>
    </div>`);
  }

  function renderBreedPicker() {
    if (!breedPickerState) return;
    ensureBreedPicker();
    const { species, query, filter, selected } = breedPickerState;
    const title = document.getElementById('petBreedPickerTitle');
    const search = document.getElementById('petBreedPickerSearch');
    const filters = document.getElementById('petBreedPickerFilters');
    const results = document.getElementById('petBreedPickerResults');
    const clearSearch = document.getElementById('petBreedPickerClear');
    if (title) title.textContent = species === 'Oiseau' ? 'Choisir une espèce' : `Choisir une race de ${species.toLowerCase()}`;
    if (search && search.value !== query) search.value = query;
    if (clearSearch) clearSearch.hidden = !query;
    if (filters) filters.innerHTML = breedPickerFilters(species).map(([id, label]) => `<button type="button" class="pet-breed-filter-chip ${filter === id ? 'active' : ''}" data-action="filter-breed-picker" data-filter="${id}">${label}</button>`).join('');

    const allEntries = petCatalogEntries(species);
    const special = allEntries.filter((entry) => breedPickerSpecialName(species, entry));
    const normalizedQuery = normalizeCatalogText(query);
    let entries = allEntries.filter((entry) => !breedPickerSpecialName(species, entry));
    if (normalizedQuery) entries = entries.filter((entry) => breedPickerEntrySearch(species, entry).includes(normalizedQuery));
    else entries = entries.filter((entry) => breedPickerMatchesFilter(species, entry, filter));
    entries.sort((a, b) => breedDisplayName(species, a).localeCompare(breedDisplayName(species, b), 'fr', { sensitivity: 'base' }));

    const specialHtml = !normalizedQuery ? `<div class="pet-breed-picker-section"><h3>Choix rapides</h3><div class="pet-breed-quick-grid">${special.map((entry) => {
      const value = entry.name === (species === 'Oiseau' ? 'Autre espèce' : 'Autre race') ? '__other__' : entry.name;
      const checked = value === selected || normalizeCatalogText(entry.name) === normalizeCatalogText(selected);
      return `<button type="button" class="pet-breed-quick-choice ${checked ? 'selected' : ''}" data-action="choose-breed" data-breed-value="${escapeHtml(value)}">${escapeHtml(entry.name)}</button>`;
    }).join('')}</div></div>` : '';

    const listHtml = entries.length ? entries.map((entry) => {
      const checked = normalizeCatalogText(entry.name) === normalizeCatalogText(selected);
      const subtitle = breedPickerSubtitle(species, entry);
      return `<button type="button" class="pet-breed-result ${checked ? 'selected' : ''}" data-action="choose-breed" data-breed-value="${escapeHtml(entry.name)}">
        <span class="pet-breed-result-copy"><strong>${escapeHtml(breedDisplayName(species, entry))}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}</span>
        <span class="pet-breed-result-check" aria-hidden="true">${checked ? '✓' : '›'}</span>
      </button>`;
    }).join('') : `<div class="pet-breed-empty"><strong>Aucun résultat</strong><span>Essayez un autre mot ou un autre filtre.</span></div>`;

    if (results) results.innerHTML = `${specialHtml}<div class="pet-breed-picker-section"><h3>${normalizedQuery ? 'Résultats' : filter === 'popular' ? 'Les plus courants' : 'Liste'}</h3><div class="pet-breed-result-list">${listHtml}</div></div>`;
  }

  function openBreedPicker() {
    const species = document.getElementById('petSpecies')?.value || 'Chien';
    const field = document.getElementById('petBreed');
    const other = document.getElementById('petBreedOther');
    if (!field || species === 'Autre') return;
    breedPickerState = {
      species,
      query: '',
      filter: 'popular',
      selected: field.value === '__other__' ? '__other__' : field.value,
      custom: field.value === '__other__' ? other?.value || '' : ''
    };
    ensureBreedPicker();
    if (breedPickerCloseTimer) { clearTimeout(breedPickerCloseTimer); breedPickerCloseTimer = null; }
    renderBreedPicker();
    const backdrop = document.getElementById('petBreedPickerBackdrop');
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.body.classList.add('breed-picker-open');
    setTimeout(() => document.getElementById('petBreedPickerSearch')?.focus(), 80);
  }

  function closeBreedPicker() {
    const backdrop = document.getElementById('petBreedPickerBackdrop');
    if (!backdrop || backdrop.hidden) return;
    backdrop.classList.remove('open');
    document.body.classList.remove('breed-picker-open');
    if (breedPickerCloseTimer) clearTimeout(breedPickerCloseTimer);
    breedPickerCloseTimer = setTimeout(() => {
      if (!backdrop.classList.contains('open')) backdrop.hidden = true;
      breedPickerCloseTimer = null;
    }, 180);
  }

  function updateBreedPickerTrigger() {
    const species = document.getElementById('petSpecies')?.value || 'Autre';
    const field = document.getElementById('petBreed');
    const other = document.getElementById('petBreedOther');
    const trigger = document.querySelector('.pet-breed-picker-trigger');
    const label = trigger?.querySelector('.pet-breed-picker-value');
    if (!field || !trigger || !label) return;
    let shown = breedFieldPlaceholder(species);
    if (field.value === '__other__') shown = other?.value?.trim() || (species === 'Oiseau' ? 'Autre espèce' : 'Autre race');
    else if (field.value) shown = breedDisplayName(species, catalogEntry(species, field.value)) || field.value;
    label.textContent = shown;
    trigger.classList.toggle('has-value', Boolean(field.value));
  }

  function chooseBreed(value) {
    const field = document.getElementById('petBreed');
    const other = document.getElementById('petBreedOther');
    if (!field) return;
    field.value = value;
    syncPetBreedOtherInput();
    updateBreedPickerTrigger();
    closeBreedPicker();
    if (value === '__other__') setTimeout(() => other?.focus(), 220);
  }


  function detailedAgeText(dateValue) {
    const months = ageInMonths(dateValue);
    if (months === null) return 'Date de naissance non renseignée';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (!years) return `${remainingMonths} mois`;
    if (!remainingMonths) return `${years} an${years > 1 ? 's' : ''}`;
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  }

  function catHumanAge(months) {
    if (!Number.isFinite(months)) return null;
    if (months <= 24) {
      return interpolateAge(months, [[0, 0], [2, 2], [4, 6], [6, 10], [12, 15], [18, 21], [24, 24]]);
    }
    return 24 + ((months - 24) / 12) * 4;
  }

  function dogHumanAge(months, size) {
    if (!Number.isFinite(months)) return null;
    if (months <= 24) {
      return interpolateAge(months, [[0, 0], [2, 2], [4, 6], [6, 10], [12, 15], [18, 20], [24, 24]]);
    }
    const years = months / 12;
    if (years <= 5) return 24 + (years - 2) * 4;
    const yearlyRate = ({ small: 4, medium: 5, large: 6, giant: 7 })[size] || 5;
    return 36 + (years - 5) * yearlyRate;
  }

  function rabbitHumanAge(months, lifespanYears = 9.5) {
    if (!Number.isFinite(months)) return null;
    if (months <= 24) return interpolateAge(months, [[0, 0], [3, 6], [6, 12], [12, 18], [18, 23], [24, 28]]);
    const lifespanMonths = Math.max(60, lifespanYears * 12);
    const progress = Math.max(0, (months - 24) / Math.max(12, lifespanMonths - 24));
    return Math.min(105, 28 + progress * 54);
  }

  function birdHumanAge(months, maturityMonths = 12, lifespanYears = 15) {
    if (!Number.isFinite(months)) return null;
    const maturity = Math.max(2, Number(maturityMonths) || 12);
    if (months <= maturity) return (months / maturity) * 18;
    const lifespanMonths = Math.max(maturity + 12, Number(lifespanYears || 15) * 12);
    const progress = Math.max(0, (months - maturity) / Math.max(12, lifespanMonths - maturity));
    return Math.min(105, 18 + progress * 67);
  }

  function lifeStageForPet(pet, months, metadata = {}) {
    const lifeMonths = Math.max(60, Number(metadata.lifespan || 12) * 12);
    let stages = [];
    const species = effectiveSpecies(pet);
    if (species === 'Chien') {
      stages = [['Chiot', 12], ['Jeune adulte', 36], ['Adulte', lifeMonths * .55], ['Mature', lifeMonths * .75], ['Senior', Infinity]];
    } else if (species === 'Chat') {
      stages = [['Chaton', 12], ['Jeune adulte', 36], ['Adulte', 84], ['Mature', 132], ['Senior', 180], ['Très âgé', Infinity]];
    } else if (species === 'Lapin') {
      stages = [['Lapereau', 6], ['Jeune', 18], ['Adulte', lifeMonths * .52], ['Mature', lifeMonths * .75], ['Senior', Infinity]];
    } else if (species === 'Oiseau') {
      const maturity = Math.max(2, Number(metadata.maturityMonths || 12));
      stages = [['Oisillon', maturity * .35], ['Juvénile', maturity], ['Jeune adulte', maturity * 2], ['Adulte', lifeMonths * .55], ['Mature', lifeMonths * .78], ['Senior', Infinity]];
    }
    const activeIndex = Math.max(0, stages.findIndex(([, limit]) => months < limit));
    return { label: stages[activeIndex]?.[0] || 'Âge non déterminé', stages: stages.map(([label]) => label), activeIndex };
  }

  function humanAgeEstimate(pet) {
    const months = ageInMonths(pet?.birthDate);
    const species = effectiveSpecies(pet);
    if (months === null || !['Chien', 'Chat', 'Lapin', 'Oiseau'].includes(species)) return null;
    const metadata = { ...(catalogEntry(species, pet.breed) || {}) };
    let value = null;
    let detail = '';
    if (species === 'Chat') {
      value = catHumanAge(months);
      detail = 'estimation basée principalement sur son âge réel';
    } else if (species === 'Chien') {
      const latestWeight = latestByDate(data.weights.filter((item) => item.petId === pet.id));
      const size = resolvedDogSize(pet, weightValueKg(latestWeight));
      value = dogHumanAge(months, size);
      metadata.lifespan = metadata.lifespan || ({ small: 14, medium: 12.5, large: 11, giant: 9.5 })[size];
      detail = `estimation ajustée pour un chien de gabarit ${dogSizeLabel(size)}`;
    } else if (species === 'Lapin') {
      value = rabbitHumanAge(months, metadata.lifespan || 9.5);
      detail = metadata.size ? 'estimation ajustée selon la race et le gabarit' : 'estimation pour un lapin de compagnie';
    } else if (species === 'Oiseau') {
      value = birdHumanAge(months, metadata.maturityMonths || 12, metadata.lifespan || 15);
      detail = metadata.scientific ? `estimation adaptée à l’espèce ${pet.breed}` : 'estimation indicative selon un oiseau de compagnie';
    }
    const stage = lifeStageForPet(pet, months, metadata);
    return { years: Math.max(0, Math.round(value)), detail, stage, metadata };
  }

  function humanAgeText(pet) {
    const estimate = humanAgeEstimate(pet);
    if (!estimate) return pet?.birthDate ? 'Disponible pour les chiens, chats, lapins et oiseaux' : 'Renseignez la date de naissance';
    return `Environ ${estimate.years} an${estimate.years > 1 ? 's' : ''} humains · ${estimate.detail}`;
  }

  function humanAgeCompactText(pet) {
    const estimate = humanAgeEstimate(pet);
    return estimate ? `≈ ${estimate.years} an${estimate.years > 1 ? 's' : ''} humains` : '';
  }

  function ageInsightCard(pet) {
    if (!['Chien', 'Chat', 'Lapin', 'Oiseau'].includes(pet?.species)) return '';
    const estimate = humanAgeEstimate(pet);
    if (!estimate) {
      return `<article class="card age-insight-card age-insight-empty"><div class="age-insight-icon" aria-hidden="true">⌛</div><div><p class="eyebrow">Âge & cycle de vie</p><h2>Ajoutez sa date de naissance</h2><p>Animoa pourra alors afficher son âge réel, son équivalent humain estimé et son stade de vie.</p></div></article>`;
    }
    const stageTrack = estimate.stage.stages.map((stage, index) => `<span class="life-stage-chip ${index === estimate.stage.activeIndex ? 'active' : ''}">${escapeHtml(stage)}</span>`).join('');
    return `<article class="card age-insight-card">
      <div class="age-insight-heading"><div><p class="eyebrow">Âge & cycle de vie</p><h2>Une estimation adaptée à ${escapeHtml(pet.name)}</h2></div><span class="age-estimate-badge">Indicatif</span></div>
      <div class="age-insight-grid">
        <div><span>Âge réel</span><strong>${escapeHtml(detailedAgeText(pet.birthDate))}</strong></div>
        <div><span>Équivalent humain estimé</span><strong>Environ ${estimate.years} an${estimate.years > 1 ? 's' : ''}</strong></div>
        <div><span>Stade de vie</span><strong>${escapeHtml(estimate.stage.label)}</strong></div>
      </div>
      <div class="life-stage-track" aria-label="Étapes de vie">${stageTrack}</div>
      <p class="age-insight-note">${escapeHtml(estimate.detail)}. Cette comparaison est informative et ne remplace pas l’évaluation d’un vétérinaire.</p>
    </article>`;
  }

  function currencySymbol(code = settings.currency) {
    return CURRENCY_OPTIONS.find((currency) => currency.code === code)?.symbol || '€';
  }

  function currencyOptionsHtml() {
    return CURRENCY_OPTIONS.map((currency) => `<option value="${currency.code}" ${settings.currency === currency.code ? 'selected' : ''}>${currency.label}</option>`).join('');
  }

  function countryOptionsHtml() {
    return COUNTRY_OPTIONS.map((country) => `<option value="${country.code}" ${settings.country === country.code ? 'selected' : ''}>${country.label}</option>`).join('');
  }

  function suggestedCurrencyForCountry(countryCode) {
    return COUNTRY_MAP.get(countryCode)?.currency || 'EUR';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat(appLocale(), { style: 'currency', currency: settings.currency }).format(Number(value || 0));
  }

  function latestByDate(items) {
    return [...items].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function nextReminder() {
    return petItems('health')
      .filter((item) => item.status === 'planned' && item.date >= todayIso() && !isPlannedHealthOverdue(item))
      .sort((a, b) => healthDateTimeKey(a).localeCompare(healthDateTimeKey(b)))[0] || null;
  }

  function upcomingReminders() {
    return petItems('health')
      .filter((item) => item.status === 'planned' && item.reminder && item.date >= todayIso() && !isPlannedHealthOverdue(item))
      .sort((a, b) => healthDateTimeKey(a).localeCompare(healthDateTimeKey(b)));
  }

  function unreadReminders() {
    return upcomingReminders().filter((item) => !item.reminderRead);
  }

  function currentMonthExpenses() {
    const month = todayIso().slice(0, 7);
    return petItems('expenses').filter((item) => item.date.startsWith(month));
  }

  function currentYearExpenses() {
    const year = todayIso().slice(0, 4);
    return petItems('expenses').filter((item) => item.date.startsWith(year));
  }

  function sum(items, selector) {
    return items.reduce((total, item) => total + Number(selector(item) || 0), 0);
  }

  function typeIcon(type) {
    const icons = {
      Vaccin: '💉',
      'Rendez-vous': '🩺',
      Traitement: '💊',
      Médicament: '💊',
      Analyse: '🧪',
      Document: '📄',
      Autre: '📌',
      Nourriture: '🥣',
      Vétérinaire: '🩺',
      Médicaments: '💊',
      Toilettage: '✂️',
      Jouets: '🎾',
      Accessoires: '🦮',
      Assurance: '🛡️',
      'Moment important': '✨',
      Anniversaire: '🎂',
      'Première fois': '🌟',
      Anecdote: '💬'
    };
    return icons[type] || '🐾';
  }

  function showToast(message) {
    toast.textContent = translateText(message);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function updateReminderBadge() {
    const count = unreadReminders().length;
    reminderBadge.textContent = String(count);
    reminderBadge.hidden = count === 0;
    reminderBadge.setAttribute('aria-label', `${count} rappel${count > 1 ? 's' : ''} non lu${count > 1 ? 's' : ''}`);
  }


  function adminClient() { return window.AnimoaAuth?.getClient?.() || null; }

  async function resolveAdminAccess() {
    const client = adminClient();
    const user = window.AnimoaAuth?.getUser?.();
    isAdminUser = false;
    if (!client || !user || window.AnimoaAuth?.isLocalPreview?.()) return false;
    try {
      const { data: allowed, error } = await client.rpc('is_animoa_admin');
      if (error) throw error;
      isAdminUser = allowed === true;
    } catch (error) {
      console.warn('Vérification administrateur impossible', error);
    }
    const adminLink = document.getElementById('adminDrawerLink');
    if (adminLink) adminLink.hidden = !isAdminUser;
    return isAdminUser;
  }

  function adminDate(value) {
    if (!value) return 'Date inconnue';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function readableSurveyValue(value) {
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (value && typeof value === 'object') return Object.values(value).filter(Boolean).join(', ') || '—';
    if (value === true) return 'Oui';
    if (value === false) return 'Non';
    return String(value ?? '').trim() || '—';
  }

  function surveyFieldLabel(key) {
    return ({
      animals: 'Animaux', current_method: 'Organisation actuelle', useful_features: 'Fonctionnalités souhaitées',
      testing_interest: 'Souhaite tester Animoa', email: 'Adresse e-mail', desired_use: 'Réponse libre',
      rating: 'Note', comment: 'Commentaire', liked: 'Points appréciés', missing: 'Fonctionnalités manquantes',
      issue: 'Problème rencontré', first_name: 'Prénom', animals: 'Animaux', animal_count: 'Nombre d’animaux', reason: 'Motif de la demande', contact_consent: 'Accord pour être recontacté', status: 'Statut', private_note: 'Note privée'
    })[key] || key.replaceAll('_', ' ');
  }

  async function loadAdminData() {
    if (!isAdminUser || adminLoading) return;
    const client = adminClient();
    if (!client) return;
    adminLoading = true;
    adminError = '';
    if (currentPage === 'admin') renderPage();
    try {
      const surveyResult = await client.from('animoa_survey_responses').select('*').order('created_at', { ascending: false });
      if (surveyResult.error) throw surveyResult.error;
      adminResponses = surveyResult.data || [];
      const feedbackResult = await client.from('animoa_feedback').select('*').order('created_at', { ascending: false });
      if (feedbackResult.error && !/does not exist|relation .* does not exist/i.test(feedbackResult.error.message || '')) throw feedbackResult.error;
      adminFeedback = feedbackResult.error ? [] : (feedbackResult.data || []);
      const accessResult = await client.from('animoa_access_requests').select('*').order('created_at', { ascending: false });
      if (accessResult.error && !/does not exist|relation .* does not exist/i.test(accessResult.error.message || '')) throw accessResult.error;
      adminAccessRequests = accessResult.error ? [] : (accessResult.data || []);
    } catch (error) {
      adminError = error.message || 'Impossible de charger les retours.';
    } finally {
      adminLoading = false;
      if (currentPage === 'admin') renderPage();
    }
  }

  function adminPersonTitle(item, source) {
    if (source === 'access') return item.first_name || item.email || 'Nouvelle demande';
    return item.email || (source === 'feedback' ? 'Avis anonyme' : 'Questionnaire anonyme');
  }

  function adminStatusLabel(value) {
    return ({ nouveau:'Nouveau', a_recontacter:'À recontacter', accepte:'Acceptée', refuse:'Refusée', a_etudier:'À étudier', prevu:'Prévu', traite:'Traité' })[value] || value;
  }

  function adminStatusOptions(source, status) {
    const values = source === 'access' ? ['nouveau','a_recontacter','accepte','refuse'] : ['nouveau','a_etudier','prevu','traite'];
    return values.map((value) => `<option value="${value}" ${status === value ? 'selected' : ''}>${adminStatusLabel(value)}</option>`).join('');
  }

  function renderAdminResponseCard(item, source = 'survey') {
    const ignored = new Set(['id','created_at','updated_at','user_id','status','private_note']);
    const details = Object.entries(item).filter(([key]) => !ignored.has(key)).map(([key,value]) => `<div class="admin-answer"><span>${escapeHtml(surveyFieldLabel(key))}</span><strong>${escapeHtml(readableSurveyValue(value))}</strong></div>`).join('');
    const status=item.status||'nouveau';
    const meta = source === 'access' ? `${readableSurveyValue(item.animals)} · ${adminDate(item.created_at)}` : adminDate(item.created_at);
    return `<details class="admin-accordion" data-admin-entry="${source}">
      <summary class="admin-accordion-summary"><span class="admin-summary-main"><span class="admin-summary-title">${escapeHtml(adminPersonTitle(item,source))}</span><span class="admin-summary-meta">${escapeHtml(meta)}</span></span><span class="admin-summary-side"><span class="admin-status status-${escapeHtml(status)}">${escapeHtml(adminStatusLabel(status))}</span><span class="admin-chevron">⌄</span></span></summary>
      <div class="admin-accordion-body"><div class="admin-answer-grid">${details || '<p class="muted">Aucune réponse détaillée.</p>'}</div>
      <div class="admin-note-editor"><label for="admin-note-${escapeHtml(source)}-${escapeHtml(item.id)}">Note privée</label><textarea id="admin-note-${escapeHtml(source)}-${escapeHtml(item.id)}" data-admin-note-source="${source}" data-admin-note-id="${escapeHtml(item.id)}" placeholder="Visible uniquement par vous">${escapeHtml(item.private_note || '')}</textarea></div>
      <div class="admin-actions-mobile"><select aria-label="Statut" data-admin-status-source="${source}" data-admin-id="${escapeHtml(item.id)}">${adminStatusOptions(source,status)}</select><button type="button" class="secondary-button" data-action="admin-save-note" data-admin-source="${source}" data-admin-id="${escapeHtml(item.id)}">Enregistrer la note</button>${item.email ? `<button type="button" class="secondary-button" data-action="admin-copy-email" data-email="${escapeHtml(item.email)}">Copier l’e-mail</button>` : ''}<button type="button" class="text-button danger-text-button" data-action="admin-delete-response" data-admin-source="${source}" data-admin-id="${escapeHtml(item.id)}">Supprimer</button></div></div>
    </details>`;
  }

  function adminFilteredItems(items) { return adminStatusFilter === 'all' ? items : items.filter((item) => (item.status || 'nouveau') === adminStatusFilter); }

  function renderAdminPanel() {
    const configs={
      access:{title:'Demandes d’accès',items:adminAccessRequests,empty:'Aucune demande d’accès pour le moment.',filters:['all','nouveau','a_recontacter','accepte','refuse']},
      survey:{title:'Questionnaires',items:adminResponses,empty:'Aucune réponse au questionnaire pour le moment.',filters:['all','nouveau','a_etudier','prevu','traite']},
      feedback:{title:'Avis utilisateurs',items:adminFeedback,empty:'Aucun avis enregistré pour le moment.',filters:['all','nouveau','a_etudier','prevu','traite']}
    };
    const c=configs[adminActiveTab]; const visible=adminFilteredItems(c.items);
    return `<section class="admin-section"><div class="admin-tabs"><button class="admin-tab ${adminActiveTab==='access'?'active':''}" data-action="admin-tab" data-admin-tab="access">Demandes (${adminAccessRequests.length})</button><button class="admin-tab ${adminActiveTab==='survey'?'active':''}" data-action="admin-tab" data-admin-tab="survey">Questionnaires (${adminResponses.length})</button><button class="admin-tab ${adminActiveTab==='feedback'?'active':''}" data-action="admin-tab" data-admin-tab="feedback">Avis (${adminFeedback.length})</button></div><div class="admin-filter-row">${c.filters.map(v=>`<button class="admin-filter ${adminStatusFilter===v?'active':''}" data-action="admin-filter" data-admin-filter="${v}">${v==='all'?'Tous':adminStatusLabel(v)}</button>`).join('')}</div><div class="admin-response-list">${visible.length?visible.map(item=>renderAdminResponseCard(item,adminActiveTab)).join(''):`<div class="card admin-empty">${c.empty}</div>`}</div></section>`;
  }

  function renderAdmin() {
    if (!isAdminUser) return `<section class="page-heading"><p class="eyebrow">Accès refusé</p><h1>Administration</h1><p>Cette rubrique est réservée à l’administrateur Animoa.</p></section>`;
    const newAccess=adminAccessRequests.filter(i=>(i.status||'nouveau')==='nouveau').length;
    const newSurvey=adminResponses.filter(i=>(i.status||'nouveau')==='nouveau').length;
    return `<section class="page-heading admin-heading"><div><p class="eyebrow">Espace privé</p><h1>Administration</h1><p>Vos demandes et retours, dans des listes simples à consulter sur téléphone.</p></div><button type="button" class="secondary-button" data-action="admin-refresh">Actualiser</button></section>
      <section class="admin-stats"><article class="card"><span>Nouvelles demandes</span><strong>${newAccess}</strong></article><article class="card"><span>Nouveaux questionnaires</span><strong>${newSurvey}</strong></article><article class="card"><span>Demandes totales</span><strong>${adminAccessRequests.length}</strong></article><article class="card"><span>Avis reçus</span><strong>${adminFeedback.length}</strong></article></section>
      ${adminLoading?'<div class="card card-pad admin-message">Chargement…</div>':''}${adminError?`<div class="card card-pad admin-error">${escapeHtml(adminError)}</div>`:''}${renderAdminPanel()}`;
  }

  async function updateAdminStatus(source, id, status) {
    if (!isAdminUser) return;
    const table = source === 'feedback' ? 'animoa_feedback' : source === 'access' ? 'animoa_access_requests' : 'animoa_survey_responses';
    const { error } = await adminClient().from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return showToast(error.message || 'Mise à jour impossible.');
    const collection = source === 'feedback' ? adminFeedback : source === 'access' ? adminAccessRequests : adminResponses;
    const item = collection.find((entry) => String(entry.id) === String(id));
    if (item) item.status = status;
    showToast('Statut mis à jour.');
    renderPage();
  }

  async function deleteAdminResponse(source, id) {
    if (!isAdminUser || !confirm('Supprimer définitivement ce retour ?')) return;
    const table = source === 'feedback' ? 'animoa_feedback' : source === 'access' ? 'animoa_access_requests' : 'animoa_survey_responses';
    const { error } = await adminClient().from(table).delete().eq('id', id);
    if (error) return showToast(error.message || 'Suppression impossible.');
    if (source === 'feedback') adminFeedback = adminFeedback.filter((item) => String(item.id) !== String(id));
    else if (source === 'access') adminAccessRequests = adminAccessRequests.filter((item) => String(item.id) !== String(id));
    else adminResponses = adminResponses.filter((item) => String(item.id) !== String(id));
    showToast('Retour supprimé.');
    renderPage();
  }

  async function saveAdminNote(source,id,note) {
    if (!isAdminUser) return;
    const table=source==='feedback'?'animoa_feedback':source==='access'?'animoa_access_requests':'animoa_survey_responses';
    const {error}=await adminClient().from(table).update({private_note:note,updated_at:new Date().toISOString()}).eq('id',id);
    if (error) return showToast(error.message||'Enregistrement impossible.');
    const collection=source==='feedback'?adminFeedback:source==='access'?adminAccessRequests:adminResponses;
    const item=collection.find(x=>String(x.id)===String(id)); if(item)item.private_note=note;
    showToast('Note enregistrée.');
  }

  function renderPetContexts() {
    const pet = activePet();
    const contextualPages = new Set(['health', 'expenses', 'weight', 'memories', 'pet']);

    if (!pet) {
      petContextBar.hidden = true;
      petContextBar.innerHTML = '';
      sidebarPetContext.hidden = true;
      sidebarPetContext.innerHTML = '';
      drawerPetContext.hidden = true;
      drawerPetContext.innerHTML = '';
      return;
    }

    const contextContent = `${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div class="pet-context-copy"><strong>${escapeHtml(pet.name)}</strong></div><span class="pet-context-chevron">Changer</span>`;
    petContextBar.hidden = !contextualPages.has(currentPage);
    petContextBar.innerHTML = `<button type="button" class="pet-context-button" data-action="switch-pet" aria-label="Changer d’animal">${contextContent}</button>`;

    sidebarPetContext.hidden = false;
    sidebarPetContext.innerHTML = `<button type="button" data-action="switch-pet" aria-label="Changer d’animal">${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><strong>${escapeHtml(pet.name)}</strong></div><span>↕</span></button>`;

    drawerPetContext.hidden = false;
    drawerPetContext.innerHTML = `<button type="button" data-action="switch-pet" aria-label="Changer d’animal">${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><strong>${escapeHtml(pet.name)}</strong></div><span>Changer</span></button>`;

    hydrateImages(petContextBar);
    hydrateImages(sidebarPetContext);
    hydrateImages(drawerPetContext);
  }

  function renderNavigation() {
    desktopNav.innerHTML = navItems.map((item) => navButton(item, 'desktop')).join('');
    drawerNav.innerHTML = navItems.map((item) => navButton(item, 'drawer')).join('');

    mobileNav.innerHTML = `
      ${navButton(navItems[0], 'mobile')}
      ${navButton(navItems[1], 'mobile')}
      <button type="button" class="nav-button add" data-action="open-add" aria-label="Ajouter"><img src="assets/animoa-icon-official.png" alt="" width="331" height="378" decoding="async" /></button>
      ${navButton(navItems[2], 'mobile')}
      ${navButton(navItems[3], 'mobile')}
    `;
    translateTree(desktopNav);
    translateTree(drawerNav);
    translateTree(mobileNav);
  }

  function navButton(item, mode) {
    const active = currentPage === item.page ? 'active' : '';
    const icon = item.icon === 'currency' ? currencySymbol() : item.icon;
    const iconClass = item.icon === 'currency' ? ' nav-icon-currency' : '';
    if (mode === 'mobile') {
      return `<button type="button" class="nav-button ${active}" data-page="${item.page}"><span class="nav-icon${iconClass}">${icon}</span><span>${item.label}</span></button>`;
    }
    return `<button type="button" class="${active}" data-page="${item.page}"><span class="desktop-nav-icon${iconClass}">${icon}</span>&nbsp;&nbsp;${item.label}</button>`;
  }

  function setPage(page) {
    if (page === 'admin' && !isAdminUser) { showToast('Accès administrateur requis.'); return; }
    if (currentPage === 'settings' && page !== 'settings' && settingsPreviewActive) {
      settingsPreviewActive = false;
      applyVisualPreferences(settings);
    }
    currentPage = page;
    closeDrawer();
    closeModal();
    renderNavigation();
    renderPage();
    if (page === 'admin') loadAdminData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mainContent.focus({ preventScroll: true });
  }

  function applyProfessionalFormPresentation(root = document) {
    root.querySelectorAll('form').forEach((form) => {
      const requiredControls = [...form.querySelectorAll('input[required], select[required], textarea[required]')].filter((control) => !control.disabled && control.type !== 'hidden');
      form.querySelectorAll('.required-field-marker').forEach((marker) => marker.remove());
      requiredControls.forEach((control) => {
        const id = control.id;
        const label = id ? form.querySelector(`label[for="${CSS.escape(id)}"]`) : control.closest('label');
        const target = label?.querySelector('span') || label;
        if (target && !target.querySelector('.required-field-marker')) target.insertAdjacentHTML('beforeend', '<span class="required-field-marker" aria-hidden="true"> *</span>');
      });
      form.querySelectorAll('.form-required-note').forEach((note) => note.remove());
      if (requiredControls.length) form.insertAdjacentHTML('afterbegin', '<p class="form-required-note">Les champs marqués d’un * sont obligatoires.</p>');
    });
  }

  function renderPage() {
    const pet = activePet();
    if (!pet && !['animals', 'settings', 'help', 'contact', 'privacy', 'legal', 'admin'].includes(currentPage)) currentPage = 'animals';

    const pages = {
      home: renderHome,
      health: renderHealth,
      expenses: renderExpenses,
      weight: renderWeight,
      memories: renderMemories,
      animals: renderAnimals,
      pet: renderPetProfile,
      settings: renderSettings,
      help: renderHelp,
      contact: renderContact,
      privacy: renderPrivacy,
      legal: renderLegal,
      admin: renderAdmin
    };
    const render = pages[currentPage] || renderHome;
    mainContent.innerHTML = render();
    renderPetContexts();
    translateTree(mainContent);
    translateTree(petContextBar);
    translateTree(sidebarPetContext);
    translateTree(drawerPetContext);
    hydrateImages(mainContent);
    applyProfessionalFormPresentation(mainContent);
    mainContent.classList.remove('page-refresh');
    requestAnimationFrame(() => mainContent.classList.add('page-refresh'));
    if (currentPage === 'weight') requestAnimationFrame(drawWeightChart);
    if (currentPage === 'health') {
      if (healthRestoreFrame) cancelAnimationFrame(healthRestoreFrame);
      healthRestoreFrame = requestAnimationFrame(() => {
        healthRestoreFrame = null;
        restoreHealthTabsPosition();
      });
    }
    updateReminderBadge();
  }

  function accountFirstName() {
    const user = window.AnimoaAuth?.getUser?.();
    const metadata = user?.user_metadata || user?.identities?.[0]?.identity_data || {};
    const candidate = metadata.given_name || metadata.first_name || metadata.full_name || metadata.name || '';
    const first = String(candidate).trim().split(/\s+/)[0] || '';
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
  }

  function effectiveSpecies(pet) {
    const declared = String(pet?.species || '');
    const breed = String(pet?.breed || '').trim().toLocaleLowerCase('fr-FR');
    if (!breed) return declared;
    for (const species of ['Chien', 'Chat', 'Lapin', 'Oiseau']) {
      if ((PET_CATALOG[species] || []).some((entry) => String(entry.name || '').trim().toLocaleLowerCase('fr-FR') === breed)) return species;
    }
    if (/chat|goutti[eè]re|europ[eé]en/.test(breed)) return 'Chat';
    return declared;
  }

  function renderHome() {
    const pet = activePet();
    if (!pet) return renderNoPet();

    const reminder = nextReminder();
    const weights = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const lastWeight = weights.at(-1);
    const memory = latestByDate(petItems('memories'));
    const firstName = accountFirstName();
    const greeting = firstName ? `Bonjour ${escapeHtml(firstName)} !` : 'Bonjour !';
    const ageEstimate = humanAgeEstimate(pet);
    const stage = ageEstimate?.stage?.label || '';
    const healthCount = petItems('health').length;
    const calendarStatus = googleCalendarConnected() ? 'Synchronisé' : 'À connecter';

    return `
      <div class="page-stack home-refresh">
        <section class="home-welcome" aria-label="Bienvenue">
          <div class="home-welcome-copy"><p class="eyebrow">${greeting}</p><h1>Aujourd’hui pour ${escapeHtml(pet.name)}</h1></div>
          <span class="home-welcome-mark" aria-hidden="true">🐾</span>
        </section>

        <article class="home-pet-hero" data-page="pet">
          ${petPhotoButton(pet, 'pet-avatar')}
          <div class="home-pet-copy"><h2>${escapeHtml(pet.name)}</h2><p>${escapeHtml(petTypeLabel(pet))} · ${detailedAgeText(pet.birthDate)}</p>${stage ? `<span class="home-life-chip">${escapeHtml(stage)}</span>` : ''}</div>
          <button type="button" class="home-switch-button" data-action="switch-pet">Changer <span aria-hidden="true">›</span></button>
        </article>

        <section class="home-quick-section">
          <div class="home-section-heading"><div><p class="eyebrow">Accès rapide</p><h2>Que souhaitez-vous ajouter ?</h2></div></div>
          <div class="home-quick-row">
            ${quickAction('appointment', '📅', 'Rendez-vous')}
            ${quickAction('weight', '⚖️', 'Poids')}
            ${quickAction('memory', '📷', 'Souvenir')}
            ${quickAction('expense', currencySymbol(), 'Dépense')}
            ${quickAction('health', '📄', 'Document')}
          </div>
        </section>

        <section class="home-focus-card ${reminder ? 'has-reminder' : 'is-calm'}">
          <div class="home-focus-icon" aria-hidden="true">${reminder ? typeIcon(reminder.type) : '✓'}</div>
          <div class="home-focus-copy">
            <p class="eyebrow">${reminder ? 'Prochain rendez-vous' : 'Aujourd’hui'}</p>
            <h2>${reminder ? escapeHtml(reminder.title) : `Tout va bien pour ${escapeHtml(pet.name)}`}</h2>
            <p>${reminder ? `${formatDate(reminder.date)}${validTime(reminder.time) ? ` · ${reminder.time}` : ''}${reminder.location ? ` · ${escapeHtml(reminder.location)}` : ''}` : 'Aucun rappel important ne nécessite votre attention.'}</p>
          </div>
          <button type="button" class="home-focus-arrow" data-page="health" aria-label="Voir la santé">›</button>
        </section>

        <section class="home-glance">
          <div class="home-section-heading"><div><p class="eyebrow">En un coup d’œil</p><h2>Résumé de santé</h2></div><button type="button" class="link-button" data-page="health">Voir tout</button></div>
          <div class="home-glance-grid">
            <button type="button" class="home-glance-item" data-page="weight"><span>⚖️</span><strong>${lastWeight ? formatWeight(weightValueKg(lastWeight), 2) : '—'}</strong><small>Dernier poids</small></button>
            <button type="button" class="home-glance-item" data-page="pet"><span>🎂</span><strong>${escapeHtml(detailedAgeText(pet.birthDate))}</strong><small>Âge réel</small></button>
            <button type="button" class="home-glance-item" data-page="health"><span>🩺</span><strong>${healthCount}</strong><small>Infos santé</small></button>
            <button type="button" class="home-glance-item" data-page="settings"><span>📅</span><strong>${calendarStatus}</strong><small>Calendrier</small></button>
          </div>
        </section>

        ${memory ? `<section class="home-memory-light"><div class="home-section-heading"><div><p class="eyebrow">Souvenirs</p><h2>Dernier moment avec ${escapeHtml(pet.name)}</h2></div><button type="button" class="link-button" data-page="memories">Voir plus</button></div>${renderMemoryPreview(memory)}</section>` : ''}
      </div>`;
  }

  function renderPriority(reminder, pet) {
    if (!reminder) {
      return `
        <article class="card priority-card">
          <div class="priority-accent" style="background:linear-gradient(90deg,#7dac92,#b6d3c5)"></div>
          <div class="priority-content">
            <div class="priority-row"><div class="priority-icon" style="background:#e5f1ea">✓</div><div><p class="eyebrow">À ne pas manquer</p><h2>Tout va bien pour ${escapeHtml(pet.name)}</h2><p>Aucun rappel planifié ne nécessite votre attention.</p></div></div>
          </div>
        </article>`;
    }
    const days = daysUntil(reminder.date);
    const timing = days === 0 ? "aujourd’hui" : days === 1 ? 'demain' : `dans ${days} jours`;
    return `
      <article class="card priority-card">
        <div class="priority-accent"></div>
        <div class="priority-content">
          <div class="priority-row">
            <div class="priority-icon">${typeIcon(reminder.type)}</div>
            <div><p class="eyebrow">À ne pas manquer</p><h2>${escapeHtml(reminder.title)}</h2><p>${escapeHtml(reminder.type)} prévu ${timing}, le ${formatDate(reminder.date)}${validTime(reminder.time) ? ` à ${reminder.time}` : ''}.</p></div>
          </div>
          <div class="priority-footer"><button type="button" class="link-button" data-page="health">Voir le rappel →</button></div>
        </div>
      </article>`;
  }

  function quickAction(type, icon, label) {
    return `<button type="button" class="quick-action" data-add="${type}"><span class="quick-icon">${icon}</span><span class="quick-label">${label}</span></button>`;
  }

  function summaryCard(label, value, note, page) {
    return `<button type="button" class="card summary-card" data-page="${page}" style="text-align:left;cursor:pointer"><div class="summary-label">${label}</div><div class="summary-value">${value}</div><div class="summary-note">${note}</div></button>`;
  }

  function renderMemoryPreview(memory) {
    return `
      <article class="card memory-preview" data-page="memories" style="cursor:pointer">
        ${imageTag(memory.image, 'memory-image', memory.title)}
        <div class="memory-body"><p class="eyebrow">Dernier souvenir</p><h3>${escapeHtml(memory.title)}</h3><p>${formatDate(memory.date)}</p></div>
      </article>`;
  }

  function renderEmptyMemory() {
    return `<article class="card empty-state"><div style="font-size:2rem">📷</div><strong>Aucun souvenir</strong><p>Ajoutez une photo ou une anecdote.</p><button type="button" class="primary-button" data-add="memory">Ajouter</button></article>`;
  }

  function healthViewData(filter = currentHealthFilter) {
    const allItems = petItems('health').map((item) => ({ ...item, type: normalizeHealthType(item.type) }));
    const selectedType = HEALTH_TYPES.includes(filter) ? filter : 'Tous';
    const items = allItems
      .filter((item) => selectedType === 'Tous' || item.type === selectedType)
      .sort((a, b) => healthDateTimeKey(b).localeCompare(healthDateTimeKey(a)));
    const counts = allItems.reduce((result, item) => {
      result[item.type] = (result[item.type] || 0) + 1;
      return result;
    }, {});
    return {
      allItems,
      selectedType,
      items,
      counts,
      selectedLabel: selectedType === 'Tous' ? 'Tout le dossier' : selectedType
    };
  }

  function renderHealth() {
    const pet = activePet();
    const view = healthViewData();
    currentHealthFilter = view.selectedType;

    return `
      <div class="page-stack">
        ${pageHeader('Santé', '', 'health')}
        <section class="health-filter-panel" aria-label="Filtrer le carnet de santé">
          <div class="health-filter-heading">
            <div><p class="eyebrow">Catégories</p><strong id="healthFilterLabel">${escapeHtml(view.selectedLabel)}</strong></div>
            <span id="healthFilterCount">${view.items.length} élément${view.items.length > 1 ? 's' : ''}</span>
          </div>
          <div class="health-tabs-shell">
            <button type="button" class="health-tab-arrow" data-action="health-scroll-left" aria-label="Voir les catégories précédentes">‹</button>
            <div class="section-tabs health-tabs" id="healthTabs" role="tablist">${HEALTH_TYPES.map((type) => {
              const count = type === 'Tous' ? view.allItems.length : (view.counts[type] || 0);
              return `<button type="button" class="tab-chip ${view.selectedType === type ? 'active' : ''}" data-health-filter="${type}" aria-pressed="${view.selectedType === type}" role="tab"><span>${type}</span><small>${count}</small></button>`;
            }).join('')}</div>
            <button type="button" class="health-tab-arrow" data-action="health-scroll-right" aria-label="Voir les catégories suivantes">›</button>
          </div>
        </section>
        <article class="card card-pad">
          <div class="card-title-row"><h2 id="healthListTitle">${escapeHtml(view.selectedLabel)}</h2><span id="healthListCount" class="summary-note">${view.items.length} élément${view.items.length > 1 ? 's' : ''}</span></div>
          <div class="list" id="healthList" style="margin-top:14px">
            ${view.items.length ? view.items.map(renderHealthItem).join('') : emptyList(`Aucune information dans « ${view.selectedLabel} ».`)}
          </div>
        </article>
      </div>`;
  }

  function applyHealthFilter(filter) {
    const view = healthViewData(filter);
    currentHealthFilter = view.selectedType;

    const tabs = document.getElementById('healthTabs');
    if (!tabs || currentPage !== 'health') {
      renderPage();
      return;
    }

    if (healthRestoreFrame) {
      cancelAnimationFrame(healthRestoreFrame);
      healthRestoreFrame = null;
    }
    const preservedScrollLeft = tabs.scrollLeft;

    tabs.querySelectorAll('[data-health-filter]').forEach((button) => {
      const active = button.dataset.healthFilter === view.selectedType;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const countText = `${view.items.length} élément${view.items.length > 1 ? 's' : ''}`;
    const filterLabel = document.getElementById('healthFilterLabel');
    const filterCount = document.getElementById('healthFilterCount');
    const listTitle = document.getElementById('healthListTitle');
    const listCount = document.getElementById('healthListCount');
    const list = document.getElementById('healthList');

    if (filterLabel) filterLabel.textContent = view.selectedLabel;
    if (filterCount) filterCount.textContent = countText;
    if (listTitle) listTitle.textContent = view.selectedLabel;
    if (listCount) listCount.textContent = countText;
    if (list) list.innerHTML = view.items.length
      ? view.items.map(renderHealthItem).join('')
      : emptyList(`Aucune information dans « ${view.selectedLabel} ».`);

    [filterLabel, filterCount, listTitle, listCount, list].forEach((node) => translateTree(node));
    tabs.scrollLeft = preservedScrollLeft;
    healthTabsScrollLeft = preservedScrollLeft;
    updateHealthScrollButtons();
  }

  function renderHealthItem(item) {
    const isPlanned = item.status === 'planned';
    const days = isPlanned ? daysUntil(item.date) : null;
    const overdue = isPlannedHealthOverdue(item);
    const soon = isPlanned && !overdue && days >= 0 && days <= 30;
    const statusLabel = overdue ? 'En retard' : isPlanned ? 'À venir' : 'Effectué';
    const timeLabel = validTime(item.time) ? ` à ${item.time}` : '';
    return `
      <div class="list-item record-list-item">
        <div class="list-icon">${typeIcon(item.type)}</div>
        <div><p class="list-title">${escapeHtml(item.title)}</p><p class="list-subtitle">${escapeHtml(normalizeHealthType(item.type))} · ${escapeHtml(item.professional || item.note || 'Aucun détail')}</p></div>
        <div class="record-trailing">
          <div class="list-value"><span class="status-dot ${overdue ? 'overdue' : soon ? 'soon' : ''}"></span>${formatDate(item.date, { short: true })}${timeLabel}<small>${statusLabel}</small></div>
          <button type="button" class="record-menu-button" data-action="show-health-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer ${escapeHtml(item.title)}">•••</button>
        </div>
      </div>`;
  }

  function renderReminderItem(item) {
    const isRead = Boolean(item.reminderRead);
    const timeLabel = validTime(item.time) ? ` à ${item.time}` : '';
    return `
      <div class="list-item record-list-item reminder-list-item ${isRead ? 'is-read' : ''}">
        <div class="list-icon">${typeIcon(item.type)}</div>
        <div><p class="list-title">${escapeHtml(item.title)}</p><p class="list-subtitle">${escapeHtml(normalizeHealthType(item.type))} · ${escapeHtml(item.professional || item.note || 'Aucun détail')}</p></div>
        <div class="record-trailing reminder-trailing">
          <div class="list-value"><span class="status-dot ${daysUntil(item.date) <= 30 ? 'soon' : ''}"></span>${formatDate(item.date, { short: true })}${timeLabel}<small>À venir</small></div>
          <div class="reminder-actions">
            ${isRead ? '<span class="reminder-read-state">✓ Lu</span>' : `<button type="button" class="reminder-read-button" data-action="mark-reminder-read" data-record-id="${item.id}">Marquer comme lu</button>`}
            <button type="button" class="record-menu-button" data-action="show-health-record" data-record-id="${item.id}" aria-label="Voir ${escapeHtml(item.title)}">•••</button>
          </div>
        </div>
      </div>`;
  }

  function renderExpenses() {
    const pet = activePet();
    const items = petItems('expenses').sort((a, b) => b.date.localeCompare(a.date));
    const monthItems = currentMonthExpenses();
    const yearItems = currentYearExpenses();
    const categories = groupExpenses(yearItems);
    const maxValue = Math.max(1, ...Object.values(categories));

    return `
      <div class="page-stack">
        ${pageHeader('Dépenses', '', 'expense')}
        <section class="summary-grid">
          ${summaryCard('Ce mois-ci', formatCurrency(sum(monthItems, (item) => item.amount)), `${monthItems.length} saisie${monthItems.length > 1 ? 's' : ''}`, 'expenses')}
          ${summaryCard('Cette année', formatCurrency(sum(yearItems, (item) => item.amount)), 'Total annuel', 'expenses')}
        </section>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Répartition annuelle</h2></div>
          <div class="expense-bars" style="margin-top:18px">
            ${Object.keys(categories).length ? Object.entries(categories).sort((a,b) => b[1]-a[1]).map(([category, value]) => `
              <div class="expense-bar-row"><span>${escapeHtml(category)}</span><div class="expense-bar-track"><div class="expense-bar-fill" style="width:${Math.max(5, (value/maxValue)*100)}%"></div></div><span class="expense-bar-value">${formatCurrency(value)}</span></div>`).join('') : '<p class="chart-caption">Aucune dépense cette année.</p>'}
          </div>
        </article>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Historique</h2><span class="summary-note">${items.length} dépense${items.length > 1 ? 's' : ''}</span></div>
          <div class="list" style="margin-top:14px">
            ${items.length ? items.map((item) => `
              <div class="list-item record-list-item"><div class="list-icon">${typeIcon(item.category)}</div><div><p class="list-title">${escapeHtml(item.category)}</p><p class="list-subtitle">${escapeHtml(item.note || 'Sans description')} · ${formatDate(item.date)}</p></div><div class="record-trailing"><div class="list-value">${formatCurrency(item.amount)}</div><button type="button" class="record-menu-button" data-action="show-expense-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer cette dépense">•••</button></div></div>`).join('') : emptyList('Aucune dépense enregistrée.')}
          </div>
        </article>
      </div>`;
  }

  function groupExpenses(items) {
    return items.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + Number(item.amount || 0);
      return groups;
    }, {});
  }

  function renderWeight() {
    const pet = activePet();
    const items = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const latest = items.at(-1);
    const previous = items.at(-2);
    const latestKg = weightValueKg(latest);
    const previousKg = weightValueKg(previous);
    const deltaKg = Number.isFinite(latestKg) && Number.isFinite(previousKg) ? latestKg - previousKg : null;
    const deltaDisplayed = deltaKg === null ? null : displayWeightValue(deltaKg);
    const guide = weightGuide(pet.species);
    const latestLooksWrong = Number.isFinite(latestKg) && (latestKg < guide.min || latestKg > guide.max);

    return `
      <div class="page-stack">
        ${pageHeader('Poids', '', 'weight')}
        ${latestLooksWrong ? `<div class="logic-warning"><strong>Poids à vérifier</strong><span>${escapeHtml(pet.name)} est enregistré comme ${escapeHtml(pet.species.toLowerCase())}, mais ${formatWeight(latestKg)} semble être une erreur de saisie. Vous pouvez modifier ou supprimer cette mesure.</span></div>` : ''}
        <section class="summary-grid">
          ${summaryCard('Poids actuel', latest ? formatWeight(latestKg, 2) : '—', latest ? formatDate(latest.date, { short: true }) : 'Aucune mesure', 'weight')}
          ${summaryCard('Évolution', deltaDisplayed === null ? '—' : `${deltaDisplayed > 0 ? '+' : ''}${deltaDisplayed.toFixed(2).replace('.', ',')} ${settings.weightUnit}`, 'Depuis la dernière mesure', 'weight')}
        </section>
        <article class="card chart-card">
          <div class="card-title-row"><h2>Courbe d’évolution</h2><span class="summary-note">${items.length} mesure${items.length > 1 ? 's' : ''}</span></div>
          <div class="chart-wrap"><canvas id="weightChart" aria-label="Courbe de poids"></canvas></div>
        </article>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Historique</h2></div>
          <div class="list" style="margin-top:14px">
            ${items.length ? [...items].reverse().map((item) => `<div class="list-item record-list-item"><div class="list-icon">⚖️</div><div><p class="list-title">${formatWeight(weightValueKg(item), 2)}</p><p class="list-subtitle">${escapeHtml(item.note || 'Mesure enregistrée')}</p></div><div class="record-trailing"><div class="list-value">${formatDate(item.date, { short: true })}</div><button type="button" class="record-menu-button" data-action="show-weight-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer cette mesure">•••</button></div></div>`).join('') : emptyList('Aucune mesure de poids.')}
          </div>
        </article>
      </div>`;
  }

  function drawWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    const items = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const chartItems = items.filter((item) => Number.isFinite(displayWeightValue(weightValueKg(item))));
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(document.documentElement);
    const border = styles.getPropertyValue('--border').trim();
    const primary = styles.getPropertyValue('--primary').trim();
    const muted = styles.getPropertyValue('--muted').trim();
    const surface = styles.getPropertyValue('--surface').trim();

    const pad = { left: 40, right: 16, top: 18, bottom: 32 };
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui';
    ctx.fillStyle = muted;

    for (let i = 0; i <= 4; i += 1) {
      const y = pad.top + ((height - pad.top - pad.bottom) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    }

    if (!chartItems.length) {
      ctx.textAlign = 'center';
      ctx.fillText('Ajoutez une première mesure', width / 2, height / 2);
      return;
    }

    const values = chartItems.map((item) => displayWeightValue(weightValueKg(item)));
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const margin = Math.max(.5, (max - min) * .25);
    min -= margin; max += margin;

    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const xFor = (index) => chartItems.length === 1 ? pad.left + plotW / 2 : pad.left + (index / (chartItems.length - 1)) * plotW;
    const yFor = (value) => pad.top + (1 - (value - min) / (max - min)) * plotH;

    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i += 1) {
      const value = max - ((max - min) / 4) * i;
      const y = pad.top + (plotH / 4) * i;
      ctx.fillText(value.toFixed(1).replace('.', ','), pad.left - 7, y + 4);
    }

    if (chartItems.length > 1) {
      const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
      gradient.addColorStop(0, 'rgba(79,127,115,.22)');
      gradient.addColorStop(1, 'rgba(79,127,115,0)');
      ctx.beginPath();
      chartItems.forEach((item, index) => {
        const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
        index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(xFor(chartItems.length - 1), height - pad.bottom);
      ctx.lineTo(xFor(0), height - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath();
    chartItems.forEach((item, index) => {
      const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    chartItems.forEach((item, index) => {
      const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = surface; ctx.fill();
      ctx.strokeStyle = primary; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = muted; ctx.textAlign = 'center';
      const date = new Date(`${item.date}T12:00:00`);
      ctx.fillText(new Intl.DateTimeFormat(appLocale(), { month: 'short' }).format(date), x, height - 10);
    });
  }

  function renderMemories() {
    const pet = activePet();
    const items = petItems('memories').sort((a, b) => b.date.localeCompare(a.date));
    return `
      <div class="page-stack">
        ${pageHeader('Souvenirs', '', 'memory')}
        <article class="card card-pad">
          <div class="card-title-row"><h2>Journal de vie</h2><span class="summary-note">${items.length} souvenir${items.length > 1 ? 's' : ''}</span></div>
          <div class="memory-grid" style="margin-top:14px">
            ${items.length ? items.map((item) => `
              <button type="button" class="memory-tile" data-memory-id="${item.id}">
                ${imageTag(item.image, '', item.title)}
                <div class="memory-tile-body"><h3>${item.favorite ? '♥ ' : ''}${escapeHtml(item.title)}</h3><p>${formatDate(item.date, { short: true })}</p></div>
              </button>`).join('') : `<div style="grid-column:1/-1">${emptyList('Aucun souvenir enregistré.')}</div>`}
          </div>
        </article>
      </div>`;
  }

  function renderAnimals() {
    return `
      <div class="page-stack">
        ${pageHeader('Mes animaux', '', 'pet')}
        ${data.pets.length ? `<div class="list">
          ${data.pets.map((pet) => `
            <article class="card pet-list-card ${pet.id === data.activePetId ? 'active' : ''}">
              ${petPhotoButton(pet, '', 'pet-list-photo-button')}
              <div><p class="list-title">${escapeHtml(pet.name)}</p><p class="list-subtitle">${escapeHtml(petTypeLabel(pet))} · ${ageText(pet.birthDate)}${humanAgeCompactText(pet) ? ` · ${humanAgeCompactText(pet)}` : ''}</p></div>
              <button type="button" class="secondary-button" data-select-pet="${pet.id}">${pet.id === data.activePetId ? 'Actif' : 'Choisir'}</button>
            </article>`).join('')}
        </div>` : `<article class="card empty-state"><div style="font-size:2.6rem">🐾</div><strong>Aucun compagnon</strong><p>Ajoutez votre premier compagnon pour créer son carnet de vie.</p><button type="button" class="primary-button" data-add="pet">Ajouter un nouveau compagnon</button></article>`}
      </div>`;
  }

  function renderPetProfile() {
    const pet = activePet();
    if (!pet) return renderNoPet();
    const lastWeight = latestByDate(petItems('weights'));
    return `
      <div class="page-stack">
        <div class="page-header"><div><p class="eyebrow">Profil</p><h1>${escapeHtml(pet.name)}</h1></div><button type="button" class="floating-page-button" data-action="edit-pet">Modifier</button></div>
        <article class="card pet-card">${petPhotoButton(pet, 'pet-avatar')}<div><h2 class="pet-name">${escapeHtml(pet.name)}</h2><p class="pet-meta">${escapeHtml(petTypeLabel(pet))} · ${ageText(pet.birthDate)}${humanAgeCompactText(pet) ? ` · ${humanAgeCompactText(pet)}` : ''}</p></div></article>
        ${ageInsightCard(pet)}
        <article class="card card-pad">
          <div class="profile-grid">
            ${profileRow(pet.species === 'Oiseau' ? 'Espèce' : 'Race', pet.breed || 'Non renseignée')}
            ${profileRow('Date de naissance', formatDate(pet.birthDate))}
            ${profileRow('Âge', detailedAgeText(pet.birthDate))}
            ${profileRow('Équivalent humain', humanAgeText(pet))}
            ${profileRow('Stade de vie', humanAgeEstimate(pet)?.stage?.label || 'Non déterminé')}
            ${profileRow('Sexe', pet.sex || 'Non renseigné')}
            ${profileRow('Poids actuel', lastWeight ? formatWeight(weightValueKg(lastWeight), 2) : 'Non renseigné')}
            ${profileRow('Couleur', pet.color || 'Non renseignée')}
            ${profileRow('Identification', pet.identification || 'Non renseignée')}
            ${profileRow('Allergies', pet.allergies || 'Non renseignées')}
            ${profileRow('Informations importantes', pet.importantInfo || 'Aucune')}
          </div>
        </article>
        <article class="card card-pad danger-zone">
          <div><p class="eyebrow danger-eyebrow">Gestion du profil</p><h2>Supprimer ${escapeHtml(pet.name)}</h2><p>Cette action retire aussi son carnet de santé, ses dépenses, ses poids et ses souvenirs.</p></div>
          <button type="button" class="danger-button" data-action="request-delete-pet">Supprimer cet animal</button>
        </article>
      </div>`;
  }

  function profileRow(label, value) {
    return `<div class="profile-row"><span class="profile-label">${label}</span><span class="profile-value">${escapeHtml(value)}</span></div>`;
  }


  function paletteOptionsHtml() {
    const presets = PALETTE_OPTIONS.map((palette) => `
      <label class="theme-preset ${settings.palette === palette.id ? 'selected' : ''}" title="${escapeHtml(palette.description)}">
        <input type="radio" name="paletteSetting" value="${palette.id}" ${settings.palette === palette.id ? 'checked' : ''} />
        <span class="theme-preset-preview" aria-hidden="true" style="--preview-bg:${palette.lightBg};--preview-surface:${palette.lightSurface};--preview-primary:${palette.colors[0]};--preview-accent:${palette.colors[1]}">
          <i class="theme-preset-card"></i><i class="theme-preset-button"></i><i class="theme-preset-dot"></i>
        </span>
        <span class="theme-preset-name">${palette.label}</span>
        <span class="theme-preset-check" aria-hidden="true">✓</span>
      </label>`).join('');
    const custom = normalizeCustomColors(settings.customColors);
    return `${presets}
      <label class="theme-preset theme-preset-custom ${settings.palette === 'custom' ? 'selected' : ''}" title="Créer votre propre thème">
        <input type="radio" name="paletteSetting" value="custom" ${settings.palette === 'custom' ? 'checked' : ''} />
        <span class="theme-preset-preview" aria-hidden="true" style="--preview-bg:${custom.lightBg};--preview-surface:${custom.lightSurface};--preview-primary:${custom.primary};--preview-accent:${custom.accent}">
          <i class="theme-preset-card"></i><i class="theme-preset-button"></i><i class="theme-preset-dot"></i>
        </span>
        <span class="theme-preset-name">Personnalisé</span>
        <span class="theme-preset-check" aria-hidden="true">✓</span>
      </label>`;
  }

  function customColorInput(id, label, value) {
    return `<label class="custom-color-field" for="${id}"><span>${label}</span><span class="custom-color-control"><input id="${id}" class="custom-theme-color" type="color" value="${escapeHtml(value)}" /><code>${escapeHtml(value.toUpperCase())}</code></span></label>`;
  }

  function customThemeEditorHtml() {
    const custom = normalizeCustomColors(settings.customColors);
    return `
      <section id="customThemeEditor" class="custom-theme-editor ${settings.palette === 'custom' ? 'open' : ''}" aria-label="Personnalisation du thème">
        <div class="custom-theme-heading"><div><strong>Créer mon thème</strong><span>Les textes et bordures s’adaptent automatiquement pour rester lisibles.</span></div><button type="button" class="text-button" data-action="reset-custom-theme">Valeurs Animoa</button></div>
        <div class="custom-color-group"><h3>Couleurs principales</h3><div class="custom-color-grid">${customColorInput('customPrimary', 'Principale', custom.primary)}${customColorInput('customAccent', 'Secondaire', custom.accent)}</div></div>
        <div class="custom-color-group"><h3>Mode clair</h3><div class="custom-color-grid">${customColorInput('customLightBg', 'Fond', custom.lightBg)}${customColorInput('customLightSurface', 'Cartes', custom.lightSurface)}</div></div>
        <div class="custom-color-group"><h3>Mode sombre</h3><div class="custom-color-grid">${customColorInput('customDarkBg', 'Fond', custom.darkBg)}${customColorInput('customDarkSurface', 'Cartes', custom.darkSurface)}</div></div>
      </section>`;
  }

  function readCustomThemeColors() {
    const fallback = normalizeCustomColors(settings.customColors);
    return normalizeCustomColors({
      primary: document.getElementById('customPrimary')?.value || fallback.primary,
      accent: document.getElementById('customAccent')?.value || fallback.accent,
      lightBg: document.getElementById('customLightBg')?.value || fallback.lightBg,
      lightSurface: document.getElementById('customLightSurface')?.value || fallback.lightSurface,
      darkBg: document.getElementById('customDarkBg')?.value || fallback.darkBg,
      darkSurface: document.getElementById('customDarkSurface')?.value || fallback.darkSurface
    });
  }

  function currentThemeFormValue() {
    return normalizeSettings({
      ...settings,
      theme: document.getElementById('themeSetting')?.value || settings.theme,
      palette: document.querySelector('input[name="paletteSetting"]:checked')?.value || settings.palette,
      customColors: readCustomThemeColors()
    });
  }

  function updateThemeSettingsUi(palette) {
    document.querySelectorAll('.theme-preset').forEach((option) => option.classList.toggle('selected', option.querySelector('input')?.value === palette));
    document.getElementById('customThemeEditor')?.classList.toggle('open', palette === 'custom');
    document.querySelectorAll('.custom-color-field').forEach((field) => {
      const input = field.querySelector('input[type="color"]');
      const code = field.querySelector('code');
      if (input && code) code.textContent = input.value.toUpperCase();
    });
    const custom = readCustomThemeColors();
    const customPreview = document.querySelector('.theme-preset input[value="custom"]')?.closest('.theme-preset')?.querySelector('.theme-preset-preview');
    if (customPreview) {
      customPreview.style.setProperty('--preview-bg', custom.lightBg);
      customPreview.style.setProperty('--preview-surface', custom.lightSurface);
      customPreview.style.setProperty('--preview-primary', custom.primary);
      customPreview.style.setProperty('--preview-accent', custom.accent);
    }
  }

  function previewThemeFromSettings() {
    const preview = currentThemeFormValue();
    settingsPreviewActive = true;
    updateThemeSettingsUi(preview.palette);
    applyVisualPreferences(preview);
  }

  function calendarSettingsCardHtml() {
    const configured = googleCalendarConfigured();
    const connected = googleCalendarConnected();
    const statusLabel = connected ? 'Google Agenda connecté' : configured ? 'Non connecté' : 'Configuration technique requise';
    const statusClass = connected ? 'is-connected' : configured ? '' : 'needs-config';
    return `<article id="settingsCalendar" class="card card-pad settings-section calendar-settings-card">
      <div class="calendar-settings-heading">
        <div class="calendar-settings-icon" aria-hidden="true">📅</div>
        <div><p class="eyebrow">Calendrier</p><h2>Événements de santé</h2><p>Google Agenda utilise un calendrier séparé nommé « Animoa ». Vos événements personnels ne sont ni consultés ni modifiés.</p></div>
        <span class="calendar-connection-status ${statusClass}">${statusLabel}</span>
      </div>
      ${connected ? `
        <label class="settings-toggle-row"><span><strong>Synchronisation automatique</strong><small>Ajouter, modifier et supprimer les événements planifiés dans Google Agenda.</small></span><input type="checkbox" id="calendarAutoSyncSetting" ${settings.calendarAutoSync ? 'checked' : ''} data-action="toggle-calendar-auto-sync" /></label>
        <div class="calendar-settings-actions"><button type="button" class="secondary-button" data-action="reconnect-google-calendar">Reconnecter</button><button type="button" class="text-button danger-text-button" data-action="request-disconnect-google-calendar">Désactiver la synchronisation</button></div>
        <p class="calendar-settings-footnote">La désactivation n’efface pas les événements déjà présents dans votre agenda.</p>` : `
        <div class="calendar-settings-explanation">
          <span aria-hidden="true">✓</span><p><strong>Ajout direct après l’enregistrement</strong><br />Aucun fichier à ouvrir lorsque la connexion est active.</p>
          <span aria-hidden="true">✓</span><p><strong>Mises à jour automatiques</strong><br />La date, l’heure, le lieu et les notes restent cohérents.</p>
          <span aria-hidden="true">✓</span><p><strong>Accès limité</strong><br />Animoa gère uniquement le calendrier qu’il a créé.</p>
        </div>
        ${configured
          ? '<button type="button" class="primary-button" data-action="connect-google-calendar">Connecter Google Agenda</button>'
          : '<div class="calendar-setup-warning">Le client Google Agenda n’est pas encore renseigné dans <strong>supabase-config.js</strong>. Le fichier calendrier manuel reste disponible en attendant.</div>'}`}
    </article>`;
  }

  function ensureOnboardingOverlay() {
    if (onboardingOverlay) return onboardingOverlay;
    onboardingOverlay = document.createElement('div');
    onboardingOverlay.id = 'animoaOnboarding';
    onboardingOverlay.className = 'onboarding-overlay';
    onboardingOverlay.hidden = true;
    onboardingOverlay.setAttribute('role', 'dialog');
    onboardingOverlay.setAttribute('aria-modal', 'true');
    onboardingOverlay.setAttribute('aria-labelledby', 'onboardingTitle');
    document.body.appendChild(onboardingOverlay);
    return onboardingOverlay;
  }

  function onboardingProgressHtml() {
    return `<div class="onboarding-progress" aria-label="Étape ${onboardingStep + 1} sur 4">${[0, 1, 2, 3].map((step) => `<span class="${step <= onboardingStep ? 'active' : ''}" aria-hidden="true"></span>`).join('')}</div>`;
  }

  function renderOnboarding() {
    if (!onboardingOverlay || onboardingOverlay.hidden) return;
    const connected = googleCalendarConnected();
    const configured = googleCalendarConfigured();
    const steps = [
      `<div class="onboarding-hero">
        <img src="assets/animoa-logo-official.png" alt="Animoa" width="1200" height="361" />
        <span class="onboarding-icon" aria-hidden="true">🐾</span>
        <p class="eyebrow">Bienvenue</p>
        <h1 id="onboardingTitle">Préparons Animoa ensemble</h1>
        <p>Quelques explications simples permettent d’activer uniquement les accès vraiment utiles. Chaque choix pourra être modifié plus tard dans les paramètres.</p>
      </div>
      <div class="onboarding-actions"><button type="button" class="primary-button" data-action="onboarding-next">Commencer</button><button type="button" class="text-button" data-action="onboarding-skip">Configurer plus tard</button></div>`,

      `<div class="onboarding-step-heading"><span class="onboarding-icon" aria-hidden="true">📅</span><p class="eyebrow">Calendrier</p><h1 id="onboardingTitle">Connecter votre calendrier</h1><p>Animoa peut synchroniser les rendez-vous et les actions de santé planifiées.</p></div>
      <div class="onboarding-permission-card ${connected ? 'is-approved' : ''}">
        <div><strong>${connected ? 'Google Agenda est connecté' : 'Pourquoi cette autorisation ?'}</strong><span>${connected ? 'Les prochains événements planifiés seront synchronisés automatiquement.' : 'Elle permet de créer un calendrier séparé « Animoa » et de gérer uniquement les événements enregistrés par l’application.'}</span></div>
        <ul><li>Vos rendez-vous personnels ne sont pas lus.</li><li>Votre agenda principal n’est pas modifié.</li><li>Vous pouvez désactiver la synchronisation à tout moment.</li></ul>
        ${connected
          ? '<div class="onboarding-approved-label">✓ Autorisation accordée</div>'
          : configured
            ? '<button type="button" class="primary-button" data-action="connect-google-calendar-onboarding">Autoriser Google Agenda</button>'
            : '<div class="calendar-setup-warning">La connexion automatique doit encore être activée dans la configuration Google d’Animoa. Vous pouvez continuer et l’activer plus tard.</div>'}
      </div>
      <div class="onboarding-actions split"><button type="button" class="secondary-button" data-action="onboarding-back">Retour</button><button type="button" class="primary-button" data-action="onboarding-next">${connected ? 'Continuer' : 'Plus tard'}</button></div>`,

      `<div class="onboarding-step-heading"><span class="onboarding-icon" aria-hidden="true">🛡️</span><p class="eyebrow">Vie privée</p><h1 id="onboardingTitle">Aucune permission inutile</h1><p>Animoa demande les accès au moment où ils deviennent utiles, avec une explication claire.</p></div>
      <div class="onboarding-access-list">
        <article><span aria-hidden="true">🔔</span><div><strong>Rappels</strong><p>Les rappels dans Animoa et les e-mails fonctionnent sans lire les notifications de votre téléphone.</p></div><b>Aucun accès</b></article>
        <article><span aria-hidden="true">📷</span><div><strong>Photos et documents</strong><p>Le sélecteur de fichiers s’ouvre uniquement lorsque vous choisissez d’ajouter une photo ou un document.</p></div><b>À votre demande</b></article>
        <article><span aria-hidden="true">📍</span><div><strong>Itinéraires</strong><p>Animoa utilise l’adresse saisie pour ouvrir votre application de navigation. Votre position n’est pas enregistrée.</p></div><b>Sans suivi</b></article>
      </div>
      <div class="onboarding-actions split"><button type="button" class="secondary-button" data-action="onboarding-back">Retour</button><button type="button" class="primary-button" data-action="onboarding-next">Continuer</button></div>`,

      `<div class="onboarding-hero onboarding-finish">
        <span class="onboarding-icon" aria-hidden="true">✓</span>
        <p class="eyebrow">Tout est prêt</p>
        <h1 id="onboardingTitle">Bienvenue dans Animoa</h1>
        <p>Vous pouvez maintenant organiser la santé et les souvenirs de vos animaux. Les autorisations restent accessibles dans les paramètres.</p>
        <div class="onboarding-summary"><span>📅</span><strong>Calendrier</strong><em>${connected ? 'Connecté' : 'À connecter plus tard'}</em><span>🛡️</span><strong>Vie privée</strong><em>Accès limités</em></div>
      </div>
      <div class="onboarding-actions"><button type="button" class="primary-button" data-action="complete-onboarding">Ouvrir Animoa</button></div>`
    ];
    onboardingOverlay.innerHTML = `<section class="onboarding-card">${onboardingProgressHtml()}<div class="onboarding-content">${steps[onboardingStep]}</div></section>`;
  }

  function openOnboarding(step = 0) {
    const overlay = ensureOnboardingOverlay();
    onboardingStep = Math.max(0, Math.min(3, Number(step) || 0));
    overlay.hidden = false;
    document.body.classList.add('onboarding-open');
    renderOnboarding();
  }

  function closeOnboarding({ completed = false } = {}) {
    if (completed) {
      settings = normalizeSettings({ ...settings, onboardingCompleted: true });
      saveSettings();
    }
    if (onboardingOverlay) onboardingOverlay.hidden = true;
    document.body.classList.remove('onboarding-open');
    if (completed) window.setTimeout(showReleaseNotesIfNeeded, 650);
  }

  function settingsAccordion({ id, icon, title, subtitle, content, open = false }) {
    return `<details id="${id}" class="settings-accordion" ${open ? 'open' : ''}>
      <summary class="settings-accordion-summary">
        <span class="settings-accordion-icon" aria-hidden="true">${icon}</span>
        <span class="settings-accordion-label"><strong>${title}</strong><small>${subtitle}</small></span>
        <span class="settings-accordion-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="settings-accordion-panel">
        <button type="button" class="settings-accordion-close" data-action="close-settings-section" data-settings-section="${id}" aria-label="Fermer la rubrique ${title}">×</button>
        ${content}
      </div>
    </details>`;
  }


  function pushNotificationsSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && location.protocol === 'https:';
  }

  function pushPermissionLabel() {
    if (!pushNotificationsSupported()) return 'Indisponible sur ce navigateur';
    if (Notification.permission === 'denied') return 'Bloquées dans les réglages du navigateur';
    if (settings.pushEnabled && Notification.permission === 'granted') return 'Activées sur cet appareil';
    return 'Non activées';
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
  }

  async function invokePushFunction(body) {
    const client = window.AnimoaAuth?.getClient?.();
    if (!client || window.AnimoaAuth?.isLocalPreview?.()) throw new Error('Connectez-vous à Animoa pour utiliser les notifications.');
    let { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData?.session?.access_token) {
      const refreshed = await client.auth.refreshSession();
      sessionData = refreshed.data;
      sessionError = refreshed.error;
    }
    if (sessionError || !sessionData?.session?.access_token) throw new Error('Votre session a expiré. Reconnectez-vous à Animoa.');
    const { data: response, error } = await client.functions.invoke('animoa-push-subscription', {
      body,
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
    });
    if (error) throw new Error(response?.error || error.message || 'Service de notifications indisponible.');
    if (response?.ok === false) throw new Error(response.error || 'Service de notifications indisponible.');
    return response || {};
  }

  async function getProductionServiceWorkerRegistration() {
    if (!pushNotificationsSupported()) throw new Error('Les notifications téléphone nécessitent Animoa en HTTPS sur un navigateur compatible.');
    const registration = await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`);
    await navigator.serviceWorker.ready;
    return registration;
  }

  async function enablePushNotifications({ sendTest = true } = {}) {
    if (!pushNotificationsSupported()) throw new Error('Les notifications ne sont pas disponibles ici. Ouvrez animoa.fr sur votre téléphone.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      if (permission === 'denied') throw new Error('Les notifications sont bloquées. Autorisez-les dans les réglages du navigateur.');
      throw new Error('Autorisation non accordée.');
    }
    const registration = await getProductionServiceWorkerRegistration();
    const config = await invokePushFunction({ action: 'config' });
    if (!config.publicKey) throw new Error('La clé publique des notifications n’est pas encore configurée.');
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey)
      });
    }
    const serialized = subscription.toJSON();
    await invokePushFunction({
      action: 'subscribe',
      subscription: serialized,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
      userAgent: navigator.userAgent
    });
    settings = normalizeSettings({ ...settings, pushEnabled: true, pushEndpoint: subscription.endpoint, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || settings.timezone });
    saveSettings();
    if (sendTest) await invokePushFunction({ action: 'test', endpoint: subscription.endpoint });
    renderPage();
    showToast(sendTest ? 'Notifications activées. Un message test vient d’être envoyé.' : 'Notifications activées sur cet appareil.');
  }

  async function disablePushNotifications() {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription?.();
    const endpoint = subscription?.endpoint || settings.pushEndpoint;
    if (endpoint) {
      try { await invokePushFunction({ action: 'unsubscribe', endpoint }); } catch (error) { console.warn('Désabonnement serveur incomplet', error); }
    }
    if (subscription) await subscription.unsubscribe();
    settings = normalizeSettings({ ...settings, pushEnabled: false, pushEndpoint: '' });
    saveSettings();
    renderPage();
    showToast('Notifications désactivées sur cet appareil.');
  }

  async function sendTestPushNotification() {
    if (!settings.pushEnabled) return enablePushNotifications({ sendTest: true });
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription?.();
    if (!subscription) return enablePushNotifications({ sendTest: true });
    await invokePushFunction({ action: 'test', endpoint: subscription.endpoint });
    showToast('Notification test envoyée.');
  }

  function renderSettings() {
    const user = window.AnimoaAuth?.getUser?.();
    const cloudEnabled = window.AnimoaCloud?.available?.();
    const appearanceContent = `
      <article class="card card-pad theme-studio-card settings-inner-card">
        <div class="theme-studio-top">
          <div><p class="eyebrow">Thème</p><h2>Choisissez votre ambiance</h2></div>
          <label class="theme-mode-control" for="themeSetting"><span>Mode</span><select id="themeSetting"><option value="system" ${settings.theme === 'system' ? 'selected' : ''}>Selon l’appareil</option><option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Clair</option><option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Sombre</option></select></label>
        </div>
        <div class="theme-preset-grid" role="radiogroup" aria-label="Thèmes prêts à l’emploi">${paletteOptionsHtml()}</div>
        ${customThemeEditorHtml()}
        <div class="theme-action-row"><button type="button" class="secondary-button" data-action="restore-theme-preview">Annuler l’aperçu</button><button type="button" class="primary-button" data-action="save-theme">Enregistrer le thème</button></div>
      </article>`;
    const regionContent = `
      <article class="card card-pad settings-section compact-settings-card settings-inner-card">
        <div class="card-title-row"><div><p class="eyebrow">Préférences régionales</p><h2>Langue, pays et devise</h2></div></div>
        <div class="form-grid settings-grid">
          <div class="form-row"><label for="languageSetting">Langue de l’application</label><select id="languageSetting"><option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>Français</option><option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option></select></div>
          <div class="form-row"><label for="countrySetting">Pays ou région</label><select id="countrySetting">${countryOptionsHtml()}</select><span class="form-help">Le format des dates et des montants s’adapte à cette région.</span></div>
          <div class="form-row"><label for="currencySetting">Devise</label><select id="currencySetting" ${settings.autoCurrency ? 'data-auto-currency-active="true"' : ''}>${currencyOptionsHtml()}</select><label class="inline-check regional-auto-check"><input type="checkbox" id="autoCurrencySetting" ${settings.autoCurrency ? 'checked' : ''}> Proposer automatiquement la devise du pays</label><span class="form-help">Les montants déjà enregistrés ne sont pas convertis.</span></div>
          <div class="form-row"><label for="weightSetting">Unité de poids</label><select id="weightSetting"><option value="kg" ${settings.weightUnit === 'kg' ? 'selected' : ''}>Kilogrammes (kg)</option><option value="lb" ${settings.weightUnit === 'lb' ? 'selected' : ''}>Livres (lb)</option></select></div>
          <div class="language-roadmap" aria-label="Langues prévues"><strong>Langues disponibles</strong><div><span class="language-chip is-ready">Français</span><span class="language-chip is-ready">English</span></div><strong>Traductions prévues</strong><div><span class="language-chip">Español</span><span class="language-chip">Deutsch</span><span class="language-chip">Italiano</span><span class="language-chip">Português</span><span class="language-chip">العربية</span><span class="language-chip">中文</span><span class="language-chip">日本語</span><span class="language-chip">한국어</span></div><small>Ces langues ne sont pas proposées comme actives tant que toute l’application, les messages et les e-mails ne sont pas entièrement traduits.</small></div>
          <div class="button-row"><button type="button" class="primary-button" data-action="save-settings">Enregistrer les préférences</button></div>
        </div>
      </article>`;
    const notificationsContent = `
      <article class="card card-pad settings-section notification-settings-card settings-inner-card">
        <div class="card-title-row"><div><p class="eyebrow">Notifications téléphone</p><h2>Restez informé des événements importants</h2></div><span class="push-status-badge ${settings.pushEnabled ? 'is-active' : ''}">${escapeHtml(pushPermissionLabel())}</span></div>
        <p class="push-explanation">Animoa vous prévient uniquement pour les rendez-vous, vaccins, traitements et anniversaires que vous avez choisis. Aucune notification commerciale n’est activée par défaut.</p>
        <div class="push-device-actions">
          ${settings.pushEnabled ? '<button type="button" class="secondary-button" data-action="send-test-notification">Envoyer un test</button><button type="button" class="danger-text-button" data-action="disable-push-notifications">Désactiver sur cet appareil</button>' : '<button type="button" class="primary-button" data-action="enable-push-notifications">Activer les notifications</button>'}
        </div>
        <div class="notification-toggle-list">
          <label class="settings-toggle-row"><span><strong>Rendez-vous</strong><small>24 heures avant et 2 heures avant lorsqu’une heure est renseignée.</small></span><input type="checkbox" data-setting-toggle="notifyAppointments" ${settings.notifyAppointments ? 'checked' : ''}></label>
          <label class="settings-toggle-row"><span><strong>Vaccins</strong><small>30 jours, 7 jours et le jour de l’échéance.</small></span><input type="checkbox" data-setting-toggle="notifyVaccines" ${settings.notifyVaccines ? 'checked' : ''}></label>
          <label class="settings-toggle-row"><span><strong>Traitements</strong><small>À la date et à l’heure programmées.</small></span><input type="checkbox" data-setting-toggle="notifyTreatments" ${settings.notifyTreatments ? 'checked' : ''}></label>
          <label class="settings-toggle-row"><span><strong>Anniversaires</strong><small>Un message le matin de l’anniversaire de votre animal.</small></span><input type="checkbox" data-setting-toggle="notifyBirthdays" ${settings.notifyBirthdays ? 'checked' : ''}></label>
          <label class="settings-toggle-row"><span><strong>Nouveautés Animoa</strong><small>Informations occasionnelles sur les nouvelles fonctions.</small></span><input type="checkbox" data-setting-toggle="notifyNews" ${settings.notifyNews ? 'checked' : ''}></label>
        </div>
        <div class="quiet-hours-box"><div><strong>Heures silencieuses</strong><small>Les rappels non urgents sont différés pendant cette plage.</small></div><label>De <input type="time" id="quietHoursStart" value="${escapeHtml(settings.quietHoursStart)}"></label><label>à <input type="time" id="quietHoursEnd" value="${escapeHtml(settings.quietHoursEnd)}"></label><button type="button" class="secondary-button compact-button" data-action="save-notification-hours">Enregistrer</button></div>
      </article>`;
    const accountContent = `
      <article class="card card-pad account-card settings-inner-card">
        <img src="assets/animoa-icon-official.png" alt="" class="account-logo" width="331" height="378" decoding="async" />
        <div class="account-copy"><p class="eyebrow">Compte</p><h2>${escapeHtml(user?.email || (window.AnimoaAuth?.isLocalPreview?.() ? 'Mode local de prévisualisation' : 'Animoa'))}</h2><p>${cloudEnabled ? 'Les données de ce compte sont synchronisées avec Supabase.' : 'Les données restent uniquement dans ce navigateur.'}</p><span class="account-sync ${syncState}">${cloudEnabled ? 'Synchronisation sécurisée activée' : 'Mode local de prévisualisation'}</span></div>
        <button type="button" class="secondary-button" data-action="logout">Se déconnecter</button>
      </article>
      <article class="card card-pad danger-zone settings-compact-row settings-inner-card">
        <div><p class="eyebrow danger-eyebrow">Données enregistrées</p><h2>Effacer toutes les données</h2><p>Cette action supprime le carnet et les photos de ce compte.</p></div>
        <button type="button" class="danger-button" data-action="reset-data">Effacer toutes les données</button>
      </article>`;
    const supportContent = `
      <article class="card card-pad settings-support-card settings-compact-row settings-inner-card">
        <div><p class="eyebrow">Aide & support</p><h2>Besoin d’aide avec Animoa ?</h2></div>
        <div class="settings-support-actions"><button type="button" class="secondary-button" data-page="help">Guide de l’application</button><button type="button" class="primary-button" data-page="contact">Nous contacter</button></div>
      </article>
      <div class="settings-legal-row"><button type="button" data-page="privacy">Confidentialité</button><span>·</span><button type="button" data-page="legal">Mentions légales</button><span>·</span><span>Version ${APP_VERSION}</span></div>`;

    return `
      <div class="page-stack settings-page">
        <div class="page-header"><div><p class="eyebrow">Application</p><h1>Paramètres</h1></div></div>
        <div class="settings-accordion-list" aria-label="Rubriques des paramètres">
          ${settingsAccordion({ id: 'settingsAppearance', icon: '🎨', title: 'Apparence', subtitle: 'Thème et couleurs', content: appearanceContent })}
          ${settingsAccordion({ id: 'settingsRegion', icon: '🌍', title: 'Langue et région', subtitle: 'Langue, devise et unités', content: regionContent })}
          ${settingsAccordion({ id: 'settingsNotifications', icon: '🔔', title: 'Notifications', subtitle: 'Rappels utiles', content: notificationsContent })}
          ${settingsAccordion({ id: 'settingsCalendar', icon: '📅', title: 'Calendrier', subtitle: 'Google Agenda', content: calendarSettingsCardHtml() })}
          ${settingsAccordion({ id: 'settingsAccount', icon: '👤', title: 'Compte et données', subtitle: 'Connexion, synchronisation et suppression', content: accountContent })}
          ${settingsAccordion({ id: 'settingsSupport', icon: '❔', title: 'Aide et confidentialité', subtitle: 'Guide, contact et informations légales', content: supportContent })}
        </div>
      </div>`;
  }


  function renderHelp() {
    return `
      <div class="page-stack support-page">
        <div class="page-header"><div><p class="eyebrow">Aide & support</p><h1>Guide de l’application</h1></div></div>
        <article class="card card-pad release-guide-card" id="releaseGuide">
          <div class="release-guide-heading"><div><p class="eyebrow">Nouveautés</p><h2>Version ${APP_VERSION}</h2></div><span class="release-version-badge">Mise à jour</span></div>
          <ul class="release-note-list">
            ${RELEASE_NOTES.items.map((item) => `<li><span aria-hidden="true">✓</span><span>${escapeHtml(item)}</span></li>`).join('')}
          </ul>
          <p class="release-guide-note">Les équivalents humains restent des estimations indicatives. La date de naissance, la race, le gabarit ou l’espèce permettent d’affiner la présentation.</p>
        </article>
        <section class="faq-list" aria-label="Guide Animoa">
          <details class="faq-item"><summary>Ajouter ou modifier un animal</summary><div><p>Ouvrez le menu, puis <strong>Mes animaux</strong>. Vous pouvez créer un compagnon, modifier sa fiche, changer sa photo ou sélectionner l’animal consulté.</p></div></details>
          <details class="faq-item"><summary>Choisir une race ou une espèce</summary><div><p>Dans le profil d’un chien, d’un chat, d’un lapin ou d’un oiseau, ouvrez la liste déroulante puis choisissez la race ou l’espèce souhaitée. Les choix <strong>Race inconnue</strong>, <strong>Autre race</strong> ou <strong>Autre espèce</strong> restent disponibles.</p></div></details>
          <details class="faq-item"><summary>Comprendre l’équivalent humain</summary><div><p>La fiche de l’animal affiche son âge réel, un équivalent humain estimé et son stade de vie. Pour les chiens et les lapins, le gabarit peut modifier l’estimation. Pour les oiseaux, l’espèce sélectionnée est importante.</p></div></details>
          <details class="faq-item"><summary>Ajouter un rendez-vous</summary><div><p>Appuyez sur le bouton central avec la patte, puis sur <strong>Rendez-vous</strong>. Indiquez la date et, si vous la connaissez, l’heure. La saisie <strong>1245</strong> devient automatiquement <strong>12:45</strong>.</p></div></details>
          <details class="faq-item"><summary>Ajouter un vaccin, un traitement ou une analyse</summary><div><p>Depuis l’ajout rapide, choisissez <strong>Santé</strong>, puis le type souhaité. Les onglets du carnet servent ensuite à filtrer les informations déjà enregistrées.</p></div></details>
          <details class="faq-item"><summary>Ajouter une photo ou un document</summary><div><p>Choisissez le fichier dans le formulaire. Pour une photo de profil ou un souvenir, Animoa ouvre le recadrage avant l’enregistrement.</p></div></details>
          <details class="faq-item"><summary>Gérer les rappels</summary><div><p>La cloche affiche les rappels non lus. <strong>Marquer comme lu</strong> retire le point rouge sans supprimer le rappel et sans désactiver l’e-mail automatique.</p></div></details>
          <details class="faq-item"><summary>Changer le thème ou les unités</summary><div><p>Ouvrez <strong>Paramètres</strong> pour choisir une palette de couleurs, le mode clair ou sombre, la devise et l’unité de poids.</p></div></details>
        </section>
        <article class="card card-pad support-contact-card">
          <div><p class="eyebrow">Une autre question ?</p><h2>Contactez-nous directement</h2></div>
          <button type="button" class="primary-button" data-page="contact">Nous contacter</button>
        </article>
      </div>`;
  }

  function renderContact() {
    const user = window.AnimoaAuth?.getUser?.();
    const email = user?.email || '';
    return `
      <div class="page-stack support-page">
        <div class="page-header"><div><p class="eyebrow">Aide & support</p><h1>Nous contacter</h1></div></div>
        <article class="card card-pad contact-card">
          <form id="supportForm" class="form-grid" novalidate>
            <div class="form-row"><label for="supportCategory">Sujet</label><select id="supportCategory" name="category" required><option value="Question">Question</option><option value="Problème technique">Problème technique</option><option value="Suggestion">Suggestion</option><option value="Compte et données">Compte et données</option><option value="Autre">Autre</option></select></div>
            <div class="form-row"><label for="supportEmail">Adresse e-mail pour la réponse</label><input id="supportEmail" name="email" type="email" value="${escapeHtml(email)}" placeholder="nom@exemple.fr" required /></div>
            <div class="form-row"><label for="supportMessage">Message</label><textarea id="supportMessage" name="message" minlength="10" maxlength="4000" required placeholder="Décrivez votre demande…"></textarea><span class="form-help">Ne communiquez jamais votre mot de passe ni votre code d’invitation.</span></div>
            <div class="form-row support-file-row"><label for="supportScreenshot">Capture d’écran</label><input id="supportScreenshot" class="support-attachment-input" name="screenshot" type="file" accept="image/jpeg,image/png,image/webp" /><span id="supportScreenshotName" class="form-help">Image JPG, PNG ou WebP, 2 Mo maximum.</span></div>
            <div class="contact-destination"><span>✉️</span><div><strong>Destinataire</strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div></div>
            <button id="supportSubmitButton" class="primary-button" type="submit">Envoyer le message</button>
          </form>
        </article>
      </div>`;
  }

  function renderPrivacy() {
    return `
      <div class="page-stack legal-page">
        <div class="page-header"><div><p class="eyebrow">Informations</p><h1>Politique de confidentialité</h1></div></div>
        <article class="card card-pad legal-card">
          <p class="legal-updated">Mise à jour : 21 juillet 2026 · Version bêta</p>
          <h2>Données utilisées</h2><p>Animoa enregistre les informations nécessaires au compte et au carnet : adresse e-mail, profils des animaux, rendez-vous, informations de santé, poids, dépenses, souvenirs, photos, documents et préférences.</p>
          <h2>Pourquoi ces données sont utilisées</h2><p>Elles servent uniquement à fournir le carnet Animoa, synchroniser les informations, envoyer les rappels demandés, sécuriser le compte et répondre aux messages adressés au support.</p>
          <h2>Connexion au calendrier</h2><p>Lorsque vous l’autorisez, Animoa crée un calendrier Google séparé nommé « Animoa » et utilise l’accès uniquement pour créer, mettre à jour ou supprimer les événements enregistrés depuis l’application. Animoa ne consulte pas le contenu de vos calendriers personnels. Le jeton d’accès Google reste temporaire dans la session du navigateur et n’est pas enregistré dans le carnet Animoa.</p>
          <h2>Services techniques</h2><p>Le fonctionnement peut s’appuyer sur Supabase pour le compte et les données, Vercel pour l’hébergement de l’application, Google Agenda pour la synchronisation facultative des événements planifiés, Brevo pour les e-mails automatiques et Infomaniak pour la boîte de contact.</p>
          <h2>Conservation et suppression</h2><p>Les données sont conservées tant que le compte est utilisé. Elles peuvent être effacées depuis les paramètres ou sur demande. La suppression d’un compte et de ses données peut être demandée à <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
          <h2>Vos droits</h2><p>Vous pouvez demander l’accès, la correction, l’export ou la suppression des données associées à votre compte en écrivant à l’adresse de contact. Animoa ne vend pas les données personnelles à des annonceurs.</p>
          <div class="legal-contact-box"><strong>Contact confidentialité</strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
        </article>
      </div>`;
  }

  function renderLegal() {
    return `
      <div class="page-stack legal-page">
        <div class="page-header"><div><p class="eyebrow">Informations</p><h1>Mentions légales</h1></div></div>
        <article class="card card-pad legal-card">
          <p class="legal-updated">Version bêta privée · Application ${APP_VERSION}</p>
          <h2>Service</h2><p><strong>Animoa</strong> est un carnet de vie numérique destiné au suivi quotidien des animaux. Baseline : « Toute sa vie, près de vous. »</p>
          <h2>Éditeur et contact</h2><p>Le service est actuellement proposé en bêta privée. Contact général : <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. Les informations complètes d’identification de l’éditeur seront publiées avant l’ouverture commerciale au public.</p>
          <h2>Hébergement technique</h2><p>L’interface de l’application est hébergée via Vercel. Les comptes, données et fichiers peuvent être hébergés via Supabase.</p>
          <h2>Responsabilité</h2><p>Animoa aide à organiser les informations d’un animal, mais ne remplace jamais l’avis, le diagnostic ou les soins d’un vétérinaire. En cas d’urgence, contactez directement un professionnel.</p>
          <h2>Propriété</h2><p>Le nom, le logo, l’interface et les contenus propres à Animoa ne doivent pas être reproduits sans autorisation.</p>
          <div class="legal-contact-box"><strong>Version de l’application</strong><span>${APP_VERSION}</span></div>
        </article>
      </div>`;
  }

  async function supportScreenshotPayload(file) {
    if (!file) return null;
    const type = detectedFileType(file);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error('La capture doit être une image JPG, PNG ou WebP.');
    if (file.size > 2 * 1024 * 1024) throw new Error('La capture est trop volumineuse. Veuillez choisir une image de moins de 2 Mo.');
    const dataUrl = await blobToDataUrl(fileWithDetectedType(file));
    return {
      name: String(file.name || 'capture-animoa.png').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 90),
      type,
      content: String(dataUrl).split(',')[1] || ''
    };
  }

  function openSupportEmailFallback({ category, email, message }) {
    const subject = `[Animoa] ${category}`;
    const body = `Adresse de réponse : ${email}\nVersion Animoa : ${APP_VERSION}\n\n${message}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function handleSupportSubmit(form) {
    const button = form.querySelector('#supportSubmitButton');
    const category = requiredText(form.elements.category.value, 'le sujet');
    const email = requiredText(form.elements.email.value, 'votre adresse e-mail');
    const message = requiredText(form.elements.message.value, 'votre message');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('L’adresse e-mail n’est pas valide.');
    if (message.length < 10) throw new Error('Votre message doit contenir au moins 10 caractères.');
    if (message.length > 4000) throw new Error('Votre message est trop long.');

    const previousText = button?.textContent || 'Envoyer le message';
    if (button) { button.disabled = true; button.textContent = 'Envoi…'; }
    try {
      const screenshot = await supportScreenshotPayload(form.elements.screenshot.files?.[0] || null);
      const client = window.AnimoaAuth?.getClient?.();
      const canInvoke = Boolean(client && window.AnimoaAuth?.getUser?.() && !window.AnimoaAuth?.isLocalPreview?.());
      if (!canInvoke) {
        openSupportEmailFallback({ category, email, message });
        showToast('Votre application de messagerie va s’ouvrir.');
        return;
      }

      const { data: response, error } = await client.functions.invoke('contact-animoa', {
        body: { category, replyEmail: email, message, screenshot, appVersion: APP_VERSION }
      });
      if (error || response?.ok !== true) {
        console.warn('Formulaire de contact intégré indisponible', error || response);
        openSupportEmailFallback({ category, email, message });
        showToast('L’envoi intégré est indisponible : votre application de messagerie va s’ouvrir.');
        return;
      }

      form.reset();
      const currentEmail = window.AnimoaAuth?.getUser?.()?.email || '';
      if (form.elements.email) form.elements.email.value = currentEmail;
      const fileName = document.getElementById('supportScreenshotName');
      if (fileName) fileName.textContent = 'Image JPG, PNG ou WebP, 2 Mo maximum.';
      showToast('Votre message a bien été envoyé. Nous vous répondrons dès que possible.');
    } finally {
      if (button) { button.disabled = false; button.textContent = previousText; }
    }
  }

  function pageHeader(title, subtitle, addType) {
    const subtitleHtml = subtitle ? `<p>${subtitle}</p>` : '';
    return `<div class="page-header"><div><p class="eyebrow">${title === 'Dépenses' ? 'Budget' : title === 'Souvenirs' ? 'Journal de vie' : 'Carnet de vie'}</p><h1>${title}</h1>${subtitleHtml}</div><button type="button" class="floating-page-button" data-add="${addType}">Ajouter</button></div>`;
  }

  function renderNoPet() {
    return `<div class="page-stack"><div class="page-header"><div><p class="eyebrow">Bienvenue</p><h1>Ajoutez votre premier compagnon</h1></div></div><article class="card empty-state"><div style="font-size:2.6rem">🐾</div><p>Créez son carnet de vie.</p><button type="button" class="primary-button" data-add="pet">Ajouter un nouveau compagnon</button></article></div>`;
  }

  function emptyList(message) {
    return `<div class="empty-state"><div style="font-size:1.8rem">🐾</div><strong>Rien à afficher</strong><p>${escapeHtml(message)}</p></div>`;
  }

  function openDrawer() {
    clearTimeout(drawerCloseTimer);
    drawerCloseTimer = null;
    drawerBackdrop.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeDrawer() {
    clearTimeout(drawerCloseTimer);
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerCloseTimer = setTimeout(() => {
      drawerBackdrop.hidden = true;
      drawerCloseTimer = null;
    }, 220);
  }

  function openModal(title, body, eyebrow = 'Ajouter', options = {}) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
    // Règle globale Animoa : toutes les fenêtres s'ouvrent au centre de l'écran.
    modal.classList.remove('modal-centered', 'modal-sensitive');
    modal.classList.add('modal-centered');
    if (options.sensitive) modal.classList.add('modal-sensitive');
    modalTitle.textContent = title;
    modalEyebrow.textContent = eyebrow;
    modalBody.innerHTML = body;
    modalBody.scrollTop = 0;
    document.body.classList.add('modal-open');
    translateTree(modal);
    hydrateImages(modalBody);
    applyProfessionalFormPresentation(modalBody);
    modalBackdrop.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      modal.classList.add('open');
      syncHealthDateRules(false);
      syncHealthTimeField();
      syncPetWeightGuide();
      syncPetBreedCatalog(false);
    });
  }

  function closeModal() {
    modalBody?.querySelectorAll('.file-picker-input').forEach(releaseFilePreviewUrl);
    clearTimeout(modalCloseTimer);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalCloseTimer = setTimeout(() => {
      modalBackdrop.hidden = true;
      modalBody.innerHTML = '';
      modal.classList.remove('modal-centered', 'modal-sensitive');
      modalCloseTimer = null;
    }, 220);
  }

  function releaseNotesBody() {
    return `<div class="release-notes-modal">
      <div class="release-notes-hero"><span class="release-version-badge">Version ${APP_VERSION}</span><h3>${escapeHtml(RELEASE_NOTES.subtitle)}</h3></div>
      <ul class="release-note-list">${RELEASE_NOTES.items.map((item) => `<li><span aria-hidden="true">✓</span><span>${escapeHtml(item)}</span></li>`).join('')}</ul>
      <div class="release-note-actions"><button type="button" class="secondary-button" data-action="open-release-guide">Voir le guide des nouveautés</button><button type="button" class="primary-button" data-action="dismiss-release-notes">J’ai compris</button></div>
    </div>`;
  }

  function showReleaseNotesIfNeeded() {
    const appShell = document.querySelector('.app-shell');
    if (!appShell || appShell.hidden || modal.classList.contains('open') || (onboardingOverlay && !onboardingOverlay.hidden)) return;
    try {
      if (localStorage.getItem(RELEASE_SEEN_KEY) === '1') return;
      localStorage.setItem(RELEASE_SEEN_KEY, '1');
    } catch {}
    openModal(RELEASE_NOTES.title, releaseNotesBody(), `Version ${APP_VERSION}`);
  }

  function openReleaseGuide() {
    setPage('help');
    requestAnimationFrame(() => document.getElementById('releaseGuide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function openAddMenu() {
    openModal('Que souhaitez-vous ajouter ?', `
      <div class="add-choice-grid">
        <button type="button" class="add-choice" data-add="appointment"><span>📅</span>Rendez-vous</button>
        <button type="button" class="add-choice" data-add="health"><span>🩺</span>Santé</button>
        <button type="button" class="add-choice" data-add="expense"><span class="currency-choice-icon">${currencySymbol()}</span>Dépense</button>
        <button type="button" class="add-choice" data-add="weight"><span>⚖️</span>Poids</button>
        <button type="button" class="add-choice" data-add="memory"><span>📷</span>Souvenir</button>
        <button type="button" class="add-choice" data-add="pet"><span>🐾</span>Compagnon</button>
      </div>
    `, 'Ajout rapide');
  }

  function openAddForm(type) {
    if (type !== 'pet' && !activePet()) {
      showToast('Veuillez d’abord ajouter un animal.');
      type = 'pet';
    }
    const forms = {
      appointment: () => healthForm(null, 'Rendez-vous'),
      health: healthForm,
      expense: expenseForm,
      weight: weightForm,
      memory: memoryForm,
      pet: petForm
    };
    const titles = { appointment: 'Nouveau rendez-vous', health: 'Information de santé', expense: 'Nouvelle dépense', weight: 'Nouveau poids', memory: 'Nouveau souvenir', pet: 'Nouvel animal' };
    openModal(titles[type], forms[type](), 'Ajouter');
  }

  function optionSelected(value, expected) {
    return value === expected ? 'selected' : '';
  }

  function healthSuggestionOptions(field) {
    const values = [...new Set(data.health
      .map((item) => String(item?.[field] || '').trim())
      .filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, appLocale(), { sensitivity: 'base' }));
    return values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join('');
  }

  function healthForm(item = null, initialType = 'Vaccin') {
    const editing = Boolean(item);
    const status = item?.status || 'planned';
    const selectedType = item ? normalizeHealthType(item.type) : normalizeHealthType(initialType);
    const date = item?.date || todayIso();
    const min = status === 'planned' ? todayIso() : '';
    const max = status === 'done' ? todayIso() : '';
    const isAppointment = selectedType === 'Rendez-vous';
    const usesCalendar = healthTypeUsesCalendar(selectedType);
    const showTime = status === 'planned' || isAppointment;
    const timeRequired = false;
    const timeLabel = isAppointment ? 'Heure du rendez-vous' : 'Heure prévue';
    const timeHelp = '';
    return `<form id="healthForm" class="form-grid professional-form" data-editing="${item?.id || ''}">
      <div class="form-row"><label for="healthType">Type</label><select id="healthType" name="type" required>${['Vaccin','Rendez-vous','Traitement','Médicament','Analyse','Document','Autre'].map((type) => `<option value="${type}" ${optionSelected(selectedType, type)}>${type}</option>`).join('')}</select></div>
      <div class="form-row"><label for="healthTitle">Titre</label><input id="healthTitle" name="title" required value="${escapeHtml(item?.title || '')}" placeholder="Ex. Rappel annuel" /></div>
      <div class="form-columns health-schedule-fields"><div class="form-row health-date-field"><label for="healthDate">Date</label>${dateInputControl({ id: 'healthDate', name: 'date', value: date, min, max, required: true, describedBy: 'healthDateHelp' })}<span id="healthDateHelp" class="form-help" hidden></span></div><div class="form-row health-status-field"><label for="healthStatus">État</label><select id="healthStatus" name="status"><option value="planned" ${optionSelected(status, 'planned')}>À venir</option><option value="done" ${optionSelected(status, 'done')}>Effectué</option></select></div></div>
      <div class="form-row" id="healthTimeRow" ${showTime ? '' : 'hidden'}><label id="healthTimeLabel" for="healthTime">${timeLabel}</label><input id="healthTime" name="time" type="text" inputmode="numeric" maxlength="5" autocomplete="off" placeholder="HH:MM" value="${escapeHtml(validTime(item?.time) ? item.time : '')}" ${showTime ? (timeRequired ? 'required' : '') : 'disabled'} aria-describedby="healthTimeHelp" /><span id="healthTimeHelp" class="form-help" hidden>${timeHelp}</span></div>
      <div class="form-row"><label for="healthProfessional">Vétérinaire ou professionnel</label><input id="healthProfessional" name="professional" list="healthProfessionalSuggestions" value="${escapeHtml(item?.professional || '')}" /><datalist id="healthProfessionalSuggestions">${healthSuggestionOptions('professional')}</datalist></div>
      <div class="form-row"><label for="healthLocation">Lieu ou adresse</label><input id="healthLocation" name="location" list="healthLocationSuggestions" value="${escapeHtml(item?.location || '')}" placeholder="Ex. Clinique vétérinaire, 10 rue…" /><datalist id="healthLocationSuggestions">${healthSuggestionOptions('location')}</datalist></div>
      <div class="form-row"><label for="healthNote">Note</label><textarea id="healthNote" name="note" placeholder="Informations utiles">${escapeHtml(item?.note || '')}</textarea></div>
      ${filePicker({ fieldId: 'healthAttachment', name: 'attachment', label: 'Pièce jointe', existingRef: item?.attachment || '', existingName: item?.attachmentName || '', existingType: item?.attachmentType || '', accept: 'image/*,.pdf,.doc,.docx' })}
      <label class="checkbox-row"><input name="reminder" type="checkbox" ${item ? (item.reminder ? 'checked' : '') : 'checked'} /> Créer un rappel dans Animoa</label>
      <label class="checkbox-row calendar-option-row" id="calendarOptionRow" ${usesCalendar && status === 'planned' ? '' : 'hidden'}><input name="offerCalendar" type="checkbox" ${item ? (item.offerCalendar !== false ? 'checked' : '') : 'checked'} /> ${googleCalendarConnected() && settings.calendarAutoSync ? 'Synchroniser automatiquement avec Google Agenda' : 'Ajouter cette action de santé à mon calendrier'}</label>
      <button class="primary-button form-submit-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer'}</button>
    </form>`;
  }

  function expenseForm(item = null) {
    const editing = Boolean(item);
    const categories = ['Nourriture','Vétérinaire','Médicaments','Toilettage','Jouets','Accessoires','Assurance','Autre'];
    return `<form id="expenseForm" class="form-grid professional-form" data-editing="${item?.id || ''}">
      <div class="form-columns"><div class="form-row"><label for="expenseAmount">Montant</label><input id="expenseAmount" name="amount" type="number" min="0" step="0.01" inputmode="decimal" required value="${item?.amount ?? ''}" placeholder="0,00" /></div><div class="form-row"><label for="expenseDate">Date</label>${dateInputControl({ id: 'expenseDate', name: 'date', value: item?.date || todayIso(), max: todayIso(), required: true })}</div></div>
      <div class="form-row"><label for="expenseCategory">Catégorie</label><select id="expenseCategory" name="category">${categories.map((category) => `<option value="${category}" ${optionSelected(item?.category, category)}>${category}</option>`).join('')}</select></div>
      <div class="form-row"><label for="expenseNote">Description</label><input id="expenseNote" name="note" value="${escapeHtml(item?.note || '')}" placeholder="Ex. Consultation vétérinaire" /></div>
      ${filePicker({ fieldId: 'expenseAttachment', name: 'attachment', label: 'Justificatif', existingRef: item?.attachment || '', existingName: item?.attachmentName || '', existingType: item?.attachmentType || '', accept: 'image/*,.pdf,.doc,.docx' })}
      <button class="primary-button form-submit-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer la dépense'}</button>
    </form>`;
  }

  function weightForm(item = null) {
    const pet = activePet();
    const limits = displayWeightLimits(pet?.species || 'Autre');
    const value = item ? displayWeightValue(weightValueKg(item)) : '';
    return `<form id="weightForm" class="form-grid professional-form" data-editing="${item?.id || ''}">
      <div class="form-columns"><div class="form-row"><label for="weightValue">Poids (${settings.weightUnit})</label><input id="weightValue" name="value" type="number" min="${limits.min}" max="${limits.max}" step="${limits.step}" inputmode="decimal" required value="${value ?? ''}" placeholder="0,0" /><span class="form-help">Plage indicative : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}</span></div><div class="form-row"><label for="weightDate">Date</label>${dateInputControl({ id: 'weightDate', name: 'date', value: item?.date || todayIso(), max: todayIso(), required: true })}</div></div>
      <div class="form-row"><label for="weightNote">Note</label><input id="weightNote" name="note" value="${escapeHtml(item?.note || '')}" placeholder="" /></div>
      <button class="primary-button form-submit-button" type="submit">${item ? 'Enregistrer les modifications' : 'Enregistrer le poids'}</button>
    </form>`;
  }

  function filePicker({ fieldId, name, label, existingRef = '', existingName = '', existingType = '', accept = 'image/*' }) {
    const hasExisting = Boolean(existingRef && existingRef !== placeholderImage);
    const isPhoto = name === 'photo';
    const existingIsImage = isPhoto || String(existingType || '').startsWith('image/');
    const addLabel = isPhoto ? 'Ajouter une photo' : 'Ajouter une photo ou un fichier';
    const replaceLabel = isPhoto ? 'Remplacer la photo' : 'Remplacer la pièce jointe';
    const displayName = existingName || (isPhoto ? 'Photo actuelle' : 'Fichier actuel');
    const existingPreview = hasExisting ? `
      <div class="file-picker-preview" data-preview-source="existing">
        <div class="file-preview-media">${existingIsImage ? `<img class="file-preview-image media-loading" data-image-ref="${escapeHtml(existingRef)}" alt="Aperçu de ${escapeHtml(displayName)}" />` : '<span class="file-preview-icon" aria-hidden="true">📄</span>'}</div>
        <div class="file-preview-copy"><strong>${escapeHtml(displayName)}</strong><span>${existingIsImage ? 'Image jointe' : 'Document joint'}</span></div>
        <button class="file-preview-remove" type="button" data-action="remove-file-selection" data-input-id="${fieldId}" aria-label="Retirer le fichier">✕</button>
      </div>` : '<div class="file-picker-preview" data-preview-source="none" hidden></div>';
    return `<div class="form-row file-picker-row"><label>${label}</label><div class="file-picker" data-has-existing="${hasExisting ? 'true' : 'false'}" data-existing-ref="${escapeHtml(existingRef)}" data-existing-name="${escapeHtml(displayName)}" data-existing-type="${escapeHtml(existingType)}" data-is-photo="${isPhoto ? 'true' : 'false'}">
      <input class="file-picker-input" id="${fieldId}" name="${name}" type="file" accept="${accept}" tabindex="-1" />
      <input type="hidden" name="${name}Remove" value="0" />
      <div class="file-picker-toolbar"><label class="file-picker-button" for="${fieldId}"><img src="assets/animoa-icon-official.png" alt="" width="331" height="378" decoding="async" /><span class="file-picker-button-text">${hasExisting ? replaceLabel : addLabel}</span></label><span class="file-picker-name">${hasExisting ? escapeHtml(displayName) : 'Aucun fichier sélectionné'}</span></div>
      ${existingPreview}
    </div></div>`;
  }

  function memoryForm(item = null) {
    const editing = Boolean(item);
    const types = ['Moment important','Première fois','Anniversaire','Anecdote'];
    const existingImage = item?.image && item.image !== placeholderImage ? item.image : '';
    return `<form id="memoryForm" class="form-grid professional-form" data-editing="${item?.id || ''}">
      <div class="form-row"><label for="memoryTitle">Titre</label><input id="memoryTitle" name="title" required value="${escapeHtml(item?.title || '')}" placeholder="Ex. Première baignade" /></div>
      <div class="form-columns"><div class="form-row"><label for="memoryDate">Date</label>${dateInputControl({ id: 'memoryDate', name: 'date', value: item?.date || todayIso(), max: todayIso(), required: true })}</div><div class="form-row"><label for="memoryType">Type</label><select id="memoryType" name="type">${types.map((type) => `<option value="${type}" ${optionSelected(item?.type, type)}>${type}</option>`).join('')}</select></div></div>
      ${filePicker({ fieldId: 'memoryPhoto', name: 'photo', label: 'Photo', existingRef: existingImage, existingName: item?.title ? `Photo — ${item.title}` : 'Photo du souvenir', existingType: 'image/webp' })}
      <div class="form-row"><label for="memoryNote">Anecdote</label><textarea id="memoryNote" name="note" placeholder="Racontez ce moment…">${escapeHtml(item?.note || '')}</textarea></div>
      <label class="checkbox-row"><input name="favorite" type="checkbox" ${item?.favorite ? 'checked' : ''} /> Ajouter aux favoris</label>
      <button class="primary-button form-submit-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer le souvenir'}</button>
    </form>`;
  }

  function petForm(pet = null) {
    const editing = Boolean(pet);
    const latestWeight = pet ? latestByDate(data.weights.filter((item) => item.petId === pet.id)) : null;
    const currentWeight = latestWeight ? displayWeightValue(weightValueKg(latestWeight)) : '';
    const species = pet?.species || 'Chien';
    const limits = displayWeightLimits(species);
    const existingImage = pet?.image && pet.image !== placeholderImage ? pet.image : '';
    return `<form id="petForm" class="form-grid professional-form" autocomplete="off" data-editing="${editing ? pet.id : ''}" data-weight-id="${latestWeight?.id || ''}" data-original-weight="${currentWeight ?? ''}" data-original-weight-date="${latestWeight?.date || ''}">
      <div class="form-row"><label for="petName">Nom</label><input id="petName" name="name" required value="${escapeHtml(pet?.name || '')}" placeholder="Ex. Milo" /></div>
      <div class="pet-profile-basics">
        <div class="form-row"><label for="petSpecies">Espèce</label><select id="petSpecies" name="species"><option value="Chien" ${optionSelected(species, 'Chien')}>Chien</option><option value="Chat" ${optionSelected(species, 'Chat')}>Chat</option><option value="Lapin" ${optionSelected(species, 'Lapin')}>Lapin</option><option value="Oiseau" ${optionSelected(species, 'Oiseau')}>Oiseau</option><option value="Autre" ${optionSelected(species, 'Autre')}>Autre</option></select></div>
        <div class="form-row"><label for="petSex">Sexe</label><select id="petSex" name="sex"><option value="Non renseigné" ${optionSelected(pet?.sex || 'Non renseigné', 'Non renseigné')}>Non renseigné</option><option value="Femelle" ${optionSelected(pet?.sex, 'Femelle')}>Femelle</option><option value="Mâle" ${optionSelected(pet?.sex, 'Mâle')}>Mâle</option></select></div>
        <div class="form-row pet-breed-row"><label id="petBreedLabel" for="petBreed">${breedFieldLabel(species)}</label><div id="petBreedField">${breedSelectHtml(species, pet?.breed || '')}</div></div>
      </div>
      <div class="form-row dog-size-row" id="dogSizeRow" ${species === 'Chien' ? '' : 'hidden'}><label for="petDogSize">Gabarit adulte du chien</label><select id="petDogSize" name="dogSize"><option value="auto" ${optionSelected(pet?.dogSize || 'auto', 'auto')}>Automatique selon le poids</option><option value="small" ${optionSelected(pet?.dogSize, 'small')}>Petit — moins de 10 kg</option><option value="medium" ${optionSelected(pet?.dogSize, 'medium')}>Moyen — 10 à 25 kg</option><option value="large" ${optionSelected(pet?.dogSize, 'large')}>Grand — 25 à 40 kg</option><option value="giant" ${optionSelected(pet?.dogSize, 'giant')}>Géant — plus de 40 kg</option></select></div>
      <div class="form-columns"><div class="form-row"><label for="petBirth">Date de naissance</label>${dateInputControl({ id: 'petBirth', name: 'birthDate', value: pet?.birthDate || '', max: todayIso() })}</div><div class="form-row"><label for="petColor">Couleur</label><input id="petColor" name="color" value="${escapeHtml(pet?.color || '')}" /></div></div>
      <div class="weight-profile-box"><div><strong>Poids actuel</strong></div><div class="form-columns"><div class="form-row"><label for="petCurrentWeight">Poids (${settings.weightUnit})</label><input id="petCurrentWeight" name="currentWeight" type="number" min="${limits.min}" max="${limits.max}" step="${limits.step}" value="${currentWeight ?? ''}" placeholder="" /></div><div class="form-row"><label for="petCurrentWeightDate">Date de pesée</label>${dateInputControl({ id: 'petCurrentWeightDate', name: 'currentWeightDate', value: latestWeight?.date || todayIso(), max: todayIso() })}</div></div><span id="petWeightGuide" class="form-help">Plage indicative : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}</span></div>
      ${filePicker({ fieldId: 'petPhoto', name: 'photo', label: 'Photo de profil', existingRef: existingImage, existingName: pet?.name ? `Photo de ${pet.name}` : 'Photo de profil', existingType: 'image/webp' })}
      <div class="form-row"><label for="petIdentification">Identification</label><input id="petIdentification" name="identification" value="${escapeHtml(pet?.identification || '')}" placeholder="Puce, tatouage..." /></div>
      <div class="form-row"><label for="petAllergies">Allergies</label><input id="petAllergies" name="allergies" value="${escapeHtml(pet?.allergies || '')}" /></div>
      <div class="form-row"><label for="petImportant">Informations importantes</label><textarea id="petImportant" name="importantInfo">${escapeHtml(pet?.importantInfo || '')}</textarea></div>
      <button class="primary-button form-submit-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Créer le profil'}</button>
    </form>`;
  }


  async function handleFormSubmit(form) {
    const formData = new FormData(form);
    const snapshot = clone(data);
    const createdMediaRefs = [];
    let calendarTokenPromise = null;
    if (form.id === 'healthForm' && googleCalendarConnected() && settings.calendarAutoSync) {
      const existingRecord = data.health.find((item) => item.id === form.dataset.editing);
      const nextType = normalizeHealthType(formData.get('type'));
      const nextStatus = String(formData.get('status') || '');
      const nextOfferCalendar = formData.get('offerCalendar') === 'on';
      const needsCalendarAccess = Boolean(
        existingRecord?.calendarEventId ||
        (healthTypeUsesCalendar(nextType) && nextStatus === 'planned' && nextOfferCalendar)
      );
      if (needsCalendarAccess) {
        calendarTokenPromise = requestGoogleCalendarToken({ interactive: false })
          .then((accessToken) => ({ accessToken }))
          .catch((error) => ({ error }));
      }
    }
    const submitButton = form.querySelector('[type="submit"]');
    const originalLabel = submitButton?.textContent;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Enregistrement…'; }
    try {
      if (form.id === 'healthForm') {
        const status = String(formData.get('status'));
        const date = parseFrenchDate(formData.get('date'), 'La date', { required: true });
        const type = normalizeHealthType(formData.get('type'));
        const isAppointment = type === 'Rendez-vous';
        const showsTime = status === 'planned' || isAppointment;
        const timeRequired = false;
        const time = showsTime ? parseHealthTime(formData.get('time'), timeRequired) : '';
        validateHealthDate(status, date);
        if (validTime(time)) validateHealthDateTime(status, date, time);
        const existing = data.health.find((item) => item.id === form.dataset.editing);
        const attachmentFile = form.querySelector('[name="attachment"]')?.files?.[0] || null;
        const removeAttachment = formData.get('attachmentRemove') === '1';
        const oldAttachment = existing?.attachment || '';
        let attachment = removeAttachment ? '' : oldAttachment;
        if (attachmentFile) {
          attachment = await fileToAttachmentRef(attachmentFile);
          if (attachment && attachment !== oldAttachment) createdMediaRefs.push(attachment);
        }
        const record = {
          petId: activePet().id,
          type,
          title: requiredText(formData.get('title'), 'un titre'),
          date,
          time,
          status,
          professional: String(formData.get('professional') || '').trim(),
          location: String(formData.get('location') || '').trim(),
          note: String(formData.get('note') || '').trim(),
          attachment,
          attachmentName: attachmentFile?.name || (attachment ? existing?.attachmentName || '' : ''),
          attachmentType: attachmentFile ? detectedFileType(attachmentFile) : (attachment ? existing?.attachmentType || '' : ''),
          reminder: formData.get('reminder') === 'on',
          offerCalendar: formData.get('offerCalendar') === 'on',
          calendarAdded: existing?.calendarAdded || false,
          calendarUid: existing?.calendarUid || '',
          calendarProvider: existing?.calendarProvider || '',
          calendarEventId: existing?.calendarEventId || '',
          calendarHtmlLink: existing?.calendarHtmlLink || '',
          calendarSyncedAt: existing?.calendarSyncedAt || '',
          calendarSyncError: existing?.calendarSyncError || '',
          reminderRead: false
        };
        let savedRecord;
        if (existing) { Object.assign(existing, record); savedRecord = existing; } else { savedRecord = { id: uid('health'), ...record }; data.health.push(savedRecord); }
        currentHealthFilter = record.type;
        saveData();
        if (existing && oldAttachment !== attachment) await deleteMediaIfUnused(oldAttachment);

        const shouldBeInCalendar = healthTypeUsesCalendar(record.type) && record.status === 'planned' && record.offerCalendar;
        const shouldRemoveFromCalendar = Boolean(savedRecord.calendarEventId) && !shouldBeInCalendar;
        let confirmation = existing ? 'Information de santé modifiée.' : 'Information de santé enregistrée.';

        if (googleCalendarConnected() && settings.calendarAutoSync && (shouldBeInCalendar || shouldRemoveFromCalendar)) {
          const tokenResult = await (calendarTokenPromise || requestGoogleCalendarToken({ interactive: false })
            .then((accessToken) => ({ accessToken }))
            .catch((error) => ({ error })));
          if (tokenResult.accessToken) {
            try {
              if (shouldRemoveFromCalendar) {
                await removeRecordFromGoogleCalendar(savedRecord, tokenResult.accessToken);
                saveData();
                confirmation += ' L’événement a aussi été retiré de Google Agenda.';
              } else {
                await syncRecordWithGoogleCalendar(savedRecord, tokenResult.accessToken);
                confirmation += ' L’événement a été synchronisé avec Google Agenda.';
              }
            } catch (error) {
              savedRecord.calendarAdded = false;
              savedRecord.calendarSyncError = error.message || 'Synchronisation impossible.';
              saveData();
              confirmation += ' Le calendrier n’a pas pu être mis à jour.';
              window.setTimeout(() => showCalendarPermission(savedRecord.id, true), 420);
            }
          } else {
            savedRecord.calendarAdded = false;
            savedRecord.calendarSyncError = tokenResult.error?.message || 'Autorisation Google Agenda nécessaire.';
            saveData();
            confirmation += ' Google Agenda doit être reconnecté.';
            window.setTimeout(() => showCalendarPermission(savedRecord.id, true), 420);
          }
        } else if (shouldBeInCalendar) {
          window.setTimeout(() => showCalendarPermission(savedRecord.id, Boolean(existing)), 320);
        }

        closeModal();
        setPage('health');
        showToast(confirmation);
      }

      if (form.id === 'expenseForm') {
        const date = parseFrenchDate(formData.get('date'), 'La date de la dépense', { required: true });
        validatePastOrToday(date, 'La date de la dépense');
        const amount = Number(formData.get('amount'));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error('Veuillez indiquer un montant supérieur à zéro.');
        const existing = data.expenses.find((item) => item.id === form.dataset.editing);
        const attachmentFile = form.querySelector('[name="attachment"]')?.files?.[0] || null;
        const removeAttachment = formData.get('attachmentRemove') === '1';
        const oldAttachment = existing?.attachment || '';
        let attachment = removeAttachment ? '' : oldAttachment;
        if (attachmentFile) {
          attachment = await fileToAttachmentRef(attachmentFile);
          if (attachment && attachment !== oldAttachment) createdMediaRefs.push(attachment);
        }
        const record = {
          petId: activePet().id,
          amount,
          date,
          category: formData.get('category'),
          note: String(formData.get('note') || '').trim(),
          attachment,
          attachmentName: attachmentFile?.name || (attachment ? existing?.attachmentName || '' : ''),
          attachmentType: attachmentFile ? detectedFileType(attachmentFile) : (attachment ? existing?.attachmentType || '' : '')
        };
        if (existing) Object.assign(existing, record); else data.expenses.push({ id: uid('expense'), ...record });
        saveData();
        if (existing && oldAttachment !== attachment) await deleteMediaIfUnused(oldAttachment);
        closeModal(); setPage('expenses'); showToast(existing ? 'Dépense modifiée.' : 'Dépense enregistrée.');
      }

      if (form.id === 'weightForm') {
        const date = parseFrenchDate(formData.get('date'), 'La date de pesée', { required: true });
        validatePastOrToday(date, 'La date de pesée');
        const valueKg = inputWeightToKg(formData.get('value'));
        validateWeightForSpecies(valueKg, activePet().species);
        const record = { petId: activePet().id, valueKg, date, note: String(formData.get('note') || '').trim() };
        const existing = data.weights.find((item) => item.id === form.dataset.editing);
        if (existing) Object.assign(existing, record); else data.weights.push({ id: uid('weight'), ...record });
        saveData(); closeModal(); setPage('weight'); showToast(existing ? 'Mesure de poids modifiée.' : 'Poids enregistré.');
      }

      if (form.id === 'memoryForm') {
        const date = parseFrenchDate(formData.get('date'), 'La date du souvenir', { required: true });
        validatePastOrToday(date, 'La date du souvenir');
        const existing = data.memories.find((item) => item.id === form.dataset.editing);
        const photoInput = form.querySelector('[name="photo"]');
        const file = selectedPhotoFile(photoInput);
        const removePhoto = formData.get('photoRemove') === '1';
        const oldImage = existing?.image || '';
        const retainedImage = removePhoto ? placeholderImage : (oldImage || placeholderImage);
        const image = await fileToMediaRef(file) || retainedImage;
        if (file && image !== oldImage) createdMediaRefs.push(image);
        const record = { petId: activePet().id, title: requiredText(formData.get('title'), 'un titre'), date, type: formData.get('type'), note: String(formData.get('note') || '').trim(), image, favorite: formData.get('favorite') === 'on' };
        if (existing) Object.assign(existing, record); else data.memories.push({ id: uid('memory'), ...record });
        saveData();
        if (existing && oldImage !== image) await deleteMediaIfUnused(oldImage);
        closeModal(); setPage('memories'); showToast(existing ? 'Souvenir modifié.' : 'Souvenir enregistré.');
      }

      if (form.id === 'petForm') {
        const editingId = form.dataset.editing;
        const existing = editingId ? data.pets.find((pet) => pet.id === editingId) : null;
        const photoInput = form.querySelector('[name="photo"]');
        const file = selectedPhotoFile(photoInput);
        const removePhoto = formData.get('photoRemove') === '1';
        const oldImage = existing?.image || '';
        const retainedImage = removePhoto ? placeholderImage : (oldImage || placeholderImage);
        const image = await fileToMediaRef(file) || retainedImage;
        if (file && image !== oldImage) createdMediaRefs.push(image);
        const species = String(formData.get('species'));
        const birthDate = parseFrenchDate(formData.get('birthDate'), 'La date de naissance');
        validatePastOrToday(birthDate, 'La date de naissance');
        const petData = {
          id: existing?.id || uid('pet'),
          name: requiredText(formData.get('name'), 'le nom de l’animal'), species,
          breed: (() => {
            const choice = String(formData.get('breedChoice') || '').trim();
            const custom = String(formData.get('breedOther') || '').trim();
            if (choice === '__other__') return custom || (species === 'Oiseau' ? 'Autre espèce' : 'Autre race');
            return choice;
          })(),
          dogSize: species === 'Chien' && ['auto', 'small', 'medium', 'large', 'giant'].includes(String(formData.get('dogSize'))) ? String(formData.get('dogSize')) : 'auto',
          birthDate, sex: formData.get('sex'), color: String(formData.get('color') || '').trim(),
          identification: String(formData.get('identification') || '').trim(), allergies: String(formData.get('allergies') || '').trim(),
          importantInfo: String(formData.get('importantInfo') || '').trim(), image, createdAt: existing?.createdAt || todayIso()
        };
        if (existing) Object.assign(existing, petData); else data.pets.push(petData);

        const weightRaw = String(formData.get('currentWeight') || '').trim();
        if (weightRaw) {
          const valueKg = inputWeightToKg(weightRaw);
          validateWeightForSpecies(valueKg, species);
          const weightDate = parseFrenchDate(formData.get('currentWeightDate') || isoDateToFrench(todayIso()), 'La date de pesée', { required: true });
          validatePastOrToday(weightDate, 'La date de pesée');
          const weightId = form.dataset.weightId;
          const existingWeight = weightId ? data.weights.find((item) => item.id === weightId && item.petId === petData.id) : null;
          const record = { petId: petData.id, valueKg, date: weightDate, note: existingWeight?.note || 'Poids actuel indiqué dans le profil' };
          if (existingWeight) Object.assign(existingWeight, record); else data.weights.push({ id: uid('weight'), ...record });
        }

        data.activePetId = petData.id;
        saveData();
        if (existing && oldImage !== image) await deleteMediaIfUnused(oldImage);
        closeModal(); setPage('pet'); showToast(existing ? 'Profil modifié.' : 'Animal ajouté.');
      }
    } catch (error) {
      data = snapshot;
      const snapshotRefs = allImageRefsFrom(snapshot);
      for (const ref of createdMediaRefs) {
        if (!snapshotRefs.has(ref)) await deleteMediaRef(ref);
      }
      renderPage();
      showToast(error.message || 'Une erreur est survenue.');
    } finally {
      if (submitButton?.isConnected) { submitButton.disabled = false; submitButton.textContent = originalLabel; }
    }
  }

  function requestDeletePet() {
    const pet = activePet();
    if (!pet) return;
    const counts = {
      santé: petItems('health').length,
      dépenses: petItems('expenses').length,
      poids: petItems('weights').length,
      souvenirs: petItems('memories').length
    };
    openModal(`Supprimer ${pet.name} ?`, `
      <div class="delete-confirmation">
        <div class="delete-warning-icon">!</div>
        <p><strong>Cette suppression est définitive sur cet appareil.</strong></p>
        <p>Seront supprimés : ${counts.santé} élément${counts.santé > 1 ? 's' : ''} de santé, ${counts.dépenses} dépense${counts.dépenses > 1 ? 's' : ''}, ${counts.poids} mesure${counts.poids > 1 ? 's' : ''} de poids et ${counts.souvenirs} souvenir${counts.souvenirs > 1 ? 's' : ''}.</p>
        <div class="delete-actions">
          <button type="button" class="secondary-button" data-action="close-modal">Annuler</button>
          <button type="button" class="danger-button" data-action="confirm-delete-pet" data-pet-id="${pet.id}">Oui, supprimer ${escapeHtml(pet.name)}</button>
        </div>
      </div>
    `, 'Action sensible', { sensitive: true });
  }

  async function deletePet(petId) {
    const pet = data.pets.find((item) => item.id === petId);
    if (!pet) return showToast('Cet animal n’existe plus.');
    const snapshot = clone(data);
    const memoriesToDelete = data.memories.filter((item) => item.petId === petId);
    const healthToDelete = data.health.filter((item) => item.petId === petId);
    const expensesToDelete = data.expenses.filter((item) => item.petId === petId);
    const mediaRefs = [pet.image, ...memoriesToDelete.map((item) => item.image), ...healthToDelete.map((item) => item.attachment), ...expensesToDelete.map((item) => item.attachment)]
      .filter((ref) => typeof ref === 'string' && (ref.startsWith(MEDIA_PREFIX) || ref.startsWith(CLOUD_PREFIX)));

    try {
      data.pets = data.pets.filter((item) => item.id !== petId);
      data.health = data.health.filter((item) => item.petId !== petId);
      data.expenses = data.expenses.filter((item) => item.petId !== petId);
      data.weights = data.weights.filter((item) => item.petId !== petId);
      data.memories = data.memories.filter((item) => item.petId !== petId);
      data.activePetId = data.pets[0]?.id || null;
      currentHealthFilter = 'Tous';
      saveData();
      closeModal();
      currentPage = 'animals';
      renderNavigation();
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const stillUsed = allImageRefsFrom(data);
      await Promise.all(mediaRefs.filter((ref) => !stillUsed.has(ref)).map(deleteMediaRef));
      showToast(`${pet.name} a été supprimé.`);
    } catch (error) {
      data = snapshot;
      renderNavigation();
      renderPage();
      showToast(error.message || 'Suppression impossible.');
    }
  }

  function googleCalendarClientId() {
    return String(window.ANIMOA_CONFIG?.googleCalendarClientId || '').trim();
  }

  function googleCalendarConfigured() {
    const clientId = googleCalendarClientId();
    return Boolean(clientId && clientId.endsWith('.apps.googleusercontent.com') && !clientId.includes('REMPLACER_'));
  }

  function googleCalendarConnected() {
    return Boolean(settings.calendarProvider === 'google' && settings.calendarConnected && settings.calendarId);
  }

  function calendarTimeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'; }
    catch { return 'Europe/Paris'; }
  }

  async function waitForGoogleIdentity(timeoutMs = 7000) {
    if (window.google?.accounts?.oauth2?.initCodeClient) return;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (window.google?.accounts?.oauth2?.initCodeClient) return;
    }
    throw new Error('Le service de connexion Google n’est pas disponible. Vérifiez votre connexion internet puis réessayez.');
  }

  async function invokeGoogleCalendar(action, payload = {}) {
    const client = window.AnimoaAuth?.getClient?.();
    if (!client || window.AnimoaAuth?.isLocalPreview?.()) {
      throw new Error('Connectez-vous à votre compte Animoa pour utiliser Google Agenda.');
    }

    let { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw new Error('Votre session Animoa n’est pas disponible. Reconnectez-vous puis réessayez.');

    let session = sessionData?.session || null;
    if (!session?.access_token) {
      const refreshed = await client.auth.refreshSession();
      if (refreshed.error) throw new Error('Votre session Animoa a expiré. Reconnectez-vous puis réessayez.');
      session = refreshed.data?.session || null;
    }
    if (!session?.access_token) throw new Error('Votre session Animoa a expiré. Reconnectez-vous puis réessayez.');

    const config = window.ANIMOA_CONFIG || {};
    const endpoint = `${String(config.supabaseUrl || '').replace(/\/$/, '')}/functions/v1/google-calendar-connect`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': String(config.supabaseAnonKey || '')
      },
      body: JSON.stringify({ action, ...payload })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.error || result?.message || `Le service Google Agenda a répondu avec l’erreur ${response.status}.`);
    }
    if (!result?.ok) throw new Error(result?.error || 'Google Agenda n’a pas pu terminer cette opération.');
    return result;
  }

  function initialiseGoogleCalendarTokenClient() {
    if (googleCalendarTokenClient) return googleCalendarTokenClient;
    if (!googleCalendarConfigured()) throw new Error('La connexion Google Agenda doit encore être activée dans la configuration Animoa.');
    googleCalendarTokenClient = window.google.accounts.oauth2.initCodeClient({
      client_id: googleCalendarClientId(),
      scope: 'openid email https://www.googleapis.com/auth/calendar.app.created',
      ux_mode: 'popup',
      select_account: true,
      callback: () => {},
      error_callback: () => {}
    });
    return googleCalendarTokenClient;
  }

  async function requestGoogleCalendarToken({ interactive = false } = {}) {
    if (!interactive && googleCalendarConnected()) return 'server';
    if (googleCalendarRequestPending) return googleCalendarRequestPending;
    googleCalendarRequestPending = (async () => {
      await waitForGoogleIdentity();
      const client = initialiseGoogleCalendarTokenClient();
      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (callback, value) => { if (!settled) { settled = true; callback(value); } };
        const timeout = setTimeout(() => finish(reject, new Error('La demande Google Agenda a expiré. Réessayez depuis les paramètres.')), 90_000);
        client.callback = async (response) => {
          clearTimeout(timeout);
          if (response?.error || !response?.code) {
            finish(reject, new Error(response?.error_description || 'Autorisation Google Agenda refusée.'));
            return;
          }
          try {
            const result = await invokeGoogleCalendar('connect', {
              code: response.code,
              redirectUri: location.origin
            });
            settings = normalizeSettings({
              ...settings,
              calendarProvider: 'google',
              calendarConnected: true,
              calendarId: result.calendarId || '',
              calendarAutoSync: true,
              calendarConnectedAt: new Date().toISOString()
            });
            saveSettings();
            finish(resolve, 'server');
          } catch (error) { finish(reject, error); }
        };
        client.error_callback = (error) => {
          clearTimeout(timeout);
          const code = String(error?.type || error?.error || '');
          finish(reject, new Error(code === 'popup_closed' ? 'La fenêtre Google a été fermée avant la fin de l’autorisation.' : 'La connexion à Google Agenda n’a pas pu être terminée.'));
        };
        try { client.requestCode(); } catch (error) { clearTimeout(timeout); finish(reject, error); }
      });
    })().finally(() => { googleCalendarRequestPending = null; });
    return googleCalendarRequestPending;
  }

  async function connectGoogleCalendar({ quiet = false } = {}) {
    if (!googleCalendarConfigured()) {
      if (!quiet) showToast('La connexion Google Agenda doit encore être configurée pour Animoa.');
      return false;
    }
    try {
      await requestGoogleCalendarToken({ interactive: true });
      if (!quiet) showToast('Google Agenda est connecté. Les prochains événements planifiés seront synchronisés automatiquement.');
      renderOnboarding();
      if (currentPage === 'settings') renderPage();
      return true;
    } catch (error) {
      if (!quiet) showToast(error.message || 'Connexion à Google Agenda impossible.');
      return false;
    }
  }

  async function disconnectGoogleCalendar() {
    try { await invokeGoogleCalendar('disconnect'); } catch (error) { console.warn('Déconnexion Google Agenda', error); }
    settings = normalizeSettings({ ...settings, calendarProvider: '', calendarConnected: false, calendarId: '', calendarConnectedAt: '' });
    saveSettings();
    renderPage();
    showToast('La synchronisation automatique a été désactivée. Les événements déjà créés restent dans votre calendrier.');
  }

  function normaliseCalendarLocation(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(\d+)(?=[A-Za-zÀ-ÖØ-öø-ÿ])/u, '$1 ')
      .replace(/(\d{5})(?=[A-Za-zÀ-ÖØ-öø-ÿ])/gu, '$1 ');
  }

  function calendarDateTimeParts(date, time, addMinutes = 0) {
    const safeTime = validTime(time) ? time : '12:00';
    const value = new Date(`${date}T${safeTime}:00`);
    if (addMinutes) value.setMinutes(value.getMinutes() + addMinutes);
    const pad = (number) => String(number).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:00`;
  }

  function calendarEventTitle(item) {
    const petName = data.pets.find((pet) => pet.id === item.petId)?.name || 'Votre animal';
    const type = normalizeHealthType(item.type);
    const detail = String(item.title || '').trim() || type || 'Santé';
    return `${type} – ${detail} • ${petName}`;
  }

  function calendarEventDescription(item) {
    const petName = data.pets.find((pet) => pet.id === item.petId)?.name || 'Votre animal';
    const blocks = [
      `🐾 ANIMAL\n${petName}`,
      `🩺 TYPE\n${normalizeHealthType(item.type)}`,
      `📌 OBJET\n${String(item.title || normalizeHealthType(item.type) || 'Santé').trim()}`,
      item.professional ? `👩‍⚕️ PROFESSIONNEL\n${String(item.professional).trim()}` : '',
      item.note ? `📝 NOTES\n${String(item.note).trim()}` : '',
      !validTime(item.time) ? '🕒 HORAIRE\nHeure à confirmer — affichage provisoire à 12 h' : '',
      'Pensez à apporter le carnet de santé et les documents utiles.',
      'Enregistré depuis Animoa — Toute sa vie, près de vous.'
    ];
    return blocks.filter(Boolean).join('\n\n');
  }

  function googleCalendarEventPayload(item) {
    const timeZone = calendarTimeZone();
    return {
      summary: calendarEventTitle(item),
      description: calendarEventDescription(item),
      location: normaliseCalendarLocation(item.location),
      start: { dateTime: calendarDateTimeParts(item.date, item.time, 0), timeZone },
      end: { dateTime: calendarDateTimeParts(item.date, item.time, validTime(item.time) ? 60 : 30), timeZone },
      visibility: 'private',
      transparency: 'opaque',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 },
          ...(validTime(item.time) ? [{ method: 'popup', minutes: 120 }] : [])
        ]
      },
      extendedProperties: {
        private: {
          animoaRecordId: String(item.id),
          animoaUserId: String(currentUserId() || 'local'),
          animoaSource: 'animoa.fr'
        }
      },
      source: { title: 'Animoa', url: String(window.ANIMOA_CONFIG?.appUrl || 'https://animoa.fr') }
    };
  }

  async function insertGoogleCalendarEvent(item) {
    const result = await invokeGoogleCalendar('sync', {
      sourceId: String(item.id),
      eventId: item.calendarEventId || '',
      event: googleCalendarEventPayload(item)
    });
    item.calendarProvider = 'google';
    item.calendarEventId = result.eventId || '';
    item.calendarHtmlLink = result.htmlLink || '';
    item.calendarAdded = Boolean(result.eventId);
    item.calendarSyncedAt = new Date().toISOString();
    item.calendarSyncError = '';
    return result;
  }

  async function syncRecordWithGoogleCalendar(item) {
    try {
      const event = await insertGoogleCalendarEvent(item);
      saveData();
      return event;
    } catch (error) {
      item.calendarAdded = false;
      item.calendarSyncError = error.message || 'Synchronisation impossible.';
      saveData();
      throw error;
    }
  }

  async function removeRecordFromGoogleCalendar(item) {
    if (!item?.calendarEventId) return true;
    await invokeGoogleCalendar('delete', {
      sourceId: String(item.id),
      eventId: item.calendarEventId
    });
    item.calendarEventId = '';
    item.calendarHtmlLink = '';
    item.calendarAdded = false;
    item.calendarSyncedAt = new Date().toISOString();
    item.calendarSyncError = '';
    return true;
  }

  function escapeIcsText(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  function calendarDateTime(date, time, addMinutes = 0) {
    const safeTime = validTime(time) ? time : '12:00';
    const d = new Date(`${date}T${safeTime}:00`);
    if (addMinutes) d.setMinutes(d.getMinutes() + addMinutes);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  }

  function buildCalendarIcs(item) {
    const uid = item.calendarUid || `${item.id}@animoa.fr`;
    const start = calendarDateTime(item.date, item.time, 0);
    const end = calendarDateTime(item.date, item.time, validTime(item.time) ? 60 : 30);
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Animoa//Calendrier//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', `UID:${escapeIcsText(uid)}`, `DTSTAMP:${now}`, `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(calendarEventTitle(item))}`,
      item.location ? `LOCATION:${escapeIcsText(normaliseCalendarLocation(item.location))}` : '',
      `DESCRIPTION:${escapeIcsText(calendarEventDescription(item))}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcsText(`Rappel Animoa : ${item.title || 'rendez-vous'}`)}`, 'END:VALARM',
      ...(validTime(item.time) ? ['BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcsText(`Rappel Animoa : ${item.title || 'rendez-vous'}`)}`, 'END:VALARM'] : []),
      'END:VEVENT', 'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  function downloadRecordIcs(recordId) {
    const item = data.health.find((record) => record.id === recordId);
    if (!item) return showToast('Cet événement de santé n’existe plus.');
    item.calendarUid = item.calendarUid || `${item.id}@animoa.fr`;
    saveData();
    const blob = new Blob([buildCalendarIcs(item)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const petName = data.pets.find((pet) => pet.id === item.petId)?.name || 'animal';
    link.href = url;
    link.download = `Animoa_${petName}_${item.date}.ics`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    closeModal();
    showToast('Fichier calendrier téléchargé. Ouvrez-le pour confirmer l’ajout.');
  }

  function showCalendarPermission(recordId, updating = false) {
    const item = data.health.find((record) => record.id === recordId);
    if (!item) return;
    const petName = data.pets.find((pet) => pet.id === item.petId)?.name || 'votre animal';
    const connected = googleCalendarConnected();
    const canConnect = googleCalendarConfigured();
    const title = item.calendarEventId || updating ? 'Synchroniser votre calendrier ?' : 'Ajouter à votre calendrier ?';
    openModal(title, `
      <div class="calendar-permission-card">
        <div class="calendar-permission-icon" aria-hidden="true">📅</div>
        <h3>${connected ? `Synchronisez cet événement pour ${escapeHtml(petName)}` : 'Choisissez votre mode d’ajout'}</h3>
        <p>${connected ? 'Animoa peut créer ou mettre à jour directement cet événement dans votre calendrier Animoa.' : 'La connexion Google Agenda permet un ajout automatique. Le fichier calendrier reste disponible pour les autres agendas.'}</p>
        <div class="calendar-privacy-note"><strong>Votre vie privée est respectée</strong><span>Animoa utilise un calendrier séparé nommé « Animoa ». Vos rendez-vous personnels ne sont ni consultés ni modifiés.</span></div>
        <div class="calendar-event-preview">
          <strong>${escapeHtml(calendarEventTitle(item))}</strong>
          <span>📆 ${formatDate(item.date)}${validTime(item.time) ? ` à ${escapeHtml(item.time)}` : ' — heure à confirmer'}</span>
          ${item.location ? `<span>📍 ${escapeHtml(normaliseCalendarLocation(item.location))}</span>` : ''}
          ${item.professional ? `<span>🩺 ${escapeHtml(item.professional)}</span>` : ''}
        </div>
        <div class="calendar-permission-actions calendar-permission-actions-stacked">
          ${connected
            ? `<button type="button" class="primary-button" data-action="add-to-calendar" data-record-id="${item.id}">${item.calendarEventId ? 'Mettre à jour maintenant' : 'Synchroniser maintenant'}</button>`
            : canConnect
              ? `<button type="button" class="primary-button" data-action="connect-calendar-and-sync" data-record-id="${item.id}">Connecter Google Agenda</button>`
              : '<div class="calendar-setup-warning">La connexion automatique Google Agenda doit encore être activée dans la configuration Animoa.</div>'}
          <button type="button" class="secondary-button" data-action="download-calendar-ics" data-record-id="${item.id}">Utiliser un fichier calendrier</button>
          <button type="button" class="text-button" data-action="close-modal">Plus tard</button>
        </div>
      </div>`, 'Calendrier');
  }

  async function addRecordToCalendar(recordId) {
    const item = data.health.find((record) => record.id === recordId);
    if (!item) return showToast('Cet événement de santé n’existe plus.');
    if (!googleCalendarConnected()) {
      showCalendarPermission(recordId, false);
      return;
    }
    try {
      const accessToken = await requestGoogleCalendarToken({ interactive: false });
      await syncRecordWithGoogleCalendar(item, accessToken);
      closeModal();
      renderPage();
      showToast('Événement synchronisé avec Google Agenda.');
    } catch (error) {
      showToast(`${error.message || 'Synchronisation impossible.'} Vous pouvez utiliser le fichier calendrier.`);
      showCalendarPermission(recordId, true);
    }
  }

  function showHealthRecord(recordId) {
    const item = data.health.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette information n’existe plus.');
    const status = item.status === 'planned' ? (isPlannedHealthOverdue(item) ? 'En retard' : 'À venir') : 'Effectué';
    const timeDetail = validTime(item.time) ? `<span>Heure</span><strong>${item.time}</strong>` : '';
    const locationDetail = item.location ? `<span>Lieu</span><strong>${escapeHtml(item.location)}</strong>` : '';
    const isCalendarAppointment = healthTypeUsesCalendar(item.type) && item.status === 'planned';
    const calendarSynced = Boolean(item.calendarAdded && item.calendarEventId);
    const calendarBadge = isCalendarAppointment
      ? `<div class="calendar-status-line ${calendarSynced ? 'is-synced' : item.calendarSyncError ? 'has-error' : ''}">📅 ${calendarSynced ? 'Synchronisé avec Google Agenda' : item.calendarSyncError ? 'Synchronisation à reprendre' : 'Non synchronisé'}</div>`
      : '';
    const mapButton = item.location ? `<button type="button" class="secondary-button" data-action="open-map" data-location="${escapeHtml(item.location)}">📍 Itinéraire</button>` : '';
    const calendarOpenButton = calendarSynced && item.calendarHtmlLink ? `<button type="button" class="secondary-button" data-action="open-calendar-event" data-calendar-url="${escapeHtml(item.calendarHtmlLink)}">Ouvrir dans Google Agenda</button>` : '';
    openModal(item.title, `
      <div class="record-detail">
        <p class="eyebrow">${escapeHtml(normalizeHealthType(item.type))}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong>${timeDetail}${locationDetail}<span>État</span><strong>${status}</strong><span>Professionnel</span><strong>${escapeHtml(item.professional || 'Non renseigné')}</strong></div>
        ${calendarBadge}<p>${escapeHtml(item.note || 'Aucune note.')}</p>
        ${item.attachment ? `<button class="attachment-preview" data-action="open-attachment" data-image-ref="${escapeHtml(item.attachment)}" data-file-type="${escapeHtml(item.attachmentType || '')}" data-file-name="${escapeHtml(item.attachmentName || 'Fichier joint')}"><span>${item.attachmentType?.startsWith('image/') ? '🖼️' : '📎'}</span><span>${escapeHtml(item.attachmentName || 'Voir le fichier ou l’image')}</span></button>` : ''}
        <div class="record-detail-actions">${mapButton}${calendarOpenButton}${isCalendarAppointment ? `<button type="button" class="secondary-button" data-action="show-calendar-permission" data-record-id="${item.id}">📅 ${calendarSynced ? 'Mettre à jour le calendrier' : 'Ajouter au calendrier'}</button>` : ''}<button type="button" class="secondary-button" data-action="edit-health-record" data-record-id="${item.id}">Modifier</button><button type="button" class="danger-button" data-action="request-delete-record" data-collection="health" data-record-id="${item.id}" data-label="cette information de santé" data-return-page="health">Supprimer</button></div>
      </div>`, 'Santé');
  }

  function showWeightRecord(recordId) {
    const item = data.weights.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette mesure n’existe plus.');
    openModal('Mesure de poids', `
      <div class="record-detail">
        <p class="record-big-value">${formatWeight(weightValueKg(item), 2)}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong><span>Note</span><strong>${escapeHtml(item.note || 'Aucune')}</strong></div>
        <div class="record-detail-actions"><button type="button" class="secondary-button" data-action="edit-weight-record" data-record-id="${item.id}">Modifier</button><button type="button" class="danger-button" data-action="request-delete-record" data-collection="weights" data-record-id="${item.id}" data-label="cette mesure de poids" data-return-page="weight">Supprimer</button></div>
      </div>`, 'Poids');
  }

  function showExpenseRecord(recordId) {
    const item = data.expenses.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette dépense n’existe plus.');
    openModal(item.category, `
      <div class="record-detail">
        <p class="record-big-value">${formatCurrency(item.amount)}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong><span>Description</span><strong>${escapeHtml(item.note || 'Aucune')}</strong></div>
        ${item.attachment ? `<button class="attachment-preview" data-action="open-attachment" data-image-ref="${escapeHtml(item.attachment)}" data-file-type="${escapeHtml(item.attachmentType || '')}" data-file-name="${escapeHtml(item.attachmentName || 'Justificatif')}" data-attachment-context="Dépense"><span>${item.attachmentType?.startsWith('image/') ? '🖼️' : '📎'}</span><span>${escapeHtml(item.attachmentName || 'Voir le justificatif')}</span></button>` : ''}
        <div class="record-detail-actions"><button type="button" class="secondary-button" data-action="edit-expense-record" data-record-id="${item.id}">Modifier</button><button type="button" class="danger-button" data-action="request-delete-record" data-collection="expenses" data-record-id="${item.id}" data-label="cette dépense" data-return-page="expenses">Supprimer</button></div>
      </div>`, 'Dépense');
  }

  function requestDeleteRecord(collection, recordId, label, returnPage) {
    openModal('Confirmer la suppression', `
      <div class="delete-confirmation"><div class="delete-warning-icon">!</div><p>Supprimer définitivement ${escapeHtml(label || 'cet élément')} ?</p><div class="delete-actions"><button type="button" class="secondary-button" data-action="close-modal">Annuler</button><button type="button" class="danger-button" data-action="confirm-delete-record" data-collection="${collection}" data-record-id="${recordId}" data-return-page="${returnPage}">Oui, supprimer</button></div></div>`, 'Action sensible', { sensitive: true });
  }

  async function deleteRecord(collection, recordId, returnPage) {
    if (!['health', 'expenses', 'weights', 'memories'].includes(collection)) return;
    const item = data[collection].find((record) => record.id === recordId);
    if (!item) return showToast('Cet élément n’existe plus.');
    const snapshot = clone(data);
    let calendarWarning = '';
    const calendarTokenPromise = collection === 'health' && item.calendarEventId && googleCalendarConnected()
      ? requestGoogleCalendarToken({ interactive: false }).catch((error) => ({ calendarError: error }))
      : null;
    try {
      if (calendarTokenPromise) {
        const tokenResult = await calendarTokenPromise;
        if (typeof tokenResult === 'string') {
          try { await removeRecordFromGoogleCalendar(item, tokenResult); }
          catch { calendarWarning = ' L’événement Google Agenda n’a pas pu être supprimé.'; }
        } else {
          calendarWarning = ' L’événement Google Agenda devra être supprimé manuellement.';
        }
      }
      data[collection] = data[collection].filter((record) => record.id !== recordId);
      saveData();
      const mediaToDelete = [item.image, item.attachment].filter(Boolean);
      for (const ref of mediaToDelete) if (!allImageRefsFrom(data).has(ref)) await deleteMediaRef(ref);
      closeModal();
      setPage(returnPage || currentPage);
      showToast(`Élément supprimé.${calendarWarning}`);
    } catch (error) {
      data = snapshot;
      showToast(error.message || 'Suppression impossible.');
    }
  }

  function syncHealthTimeField() {
    const type = document.getElementById('healthType');
    const status = document.getElementById('healthStatus');
    const row = document.getElementById('healthTimeRow');
    const input = document.getElementById('healthTime');
    const label = document.getElementById('healthTimeLabel');
    const help = document.getElementById('healthTimeHelp');
    if (!type || !status || !row || !input) return;
    const normalizedType = normalizeHealthType(type.value);
    const isAppointment = normalizedType === 'Rendez-vous';
    const usesCalendar = healthTypeUsesCalendar(normalizedType);
    const showTime = status.value === 'planned' || isAppointment;
    const timeRequired = false;
    row.hidden = !showTime;
    input.disabled = !showTime;
    input.required = timeRequired;
    input.placeholder = 'HH:MM';
    if (label) label.textContent = translateText(isAppointment ? 'Heure du rendez-vous' : 'Heure prévue');
    if (help) { help.textContent = ''; help.hidden = true; }
    const calendarRow = document.getElementById('calendarOptionRow');
    if (calendarRow) calendarRow.hidden = !(usesCalendar && status.value === 'planned');
  }

  function syncHealthDateRules(adjustValue = false) {
    const status = document.getElementById('healthStatus');
    const date = document.getElementById('healthDate');
    const picker = document.getElementById('healthDatePicker');
    const help = document.getElementById('healthDateHelp');
    if (!status || !date) return;
    const today = todayIso();
    const parsed = tryParseFrenchDate(date.value);
    if (status.value === 'planned') {
      date.dataset.minDate = today;
      date.dataset.maxDate = '';
      if (picker) { picker.min = today; picker.removeAttribute('max'); }
      if (adjustValue && parsed && parsed < today) {
        date.value = isoDateToFrench(today);
        if (picker) picker.value = today;
      }
      if (help) { help.textContent = ''; help.hidden = true; }
    } else {
      date.dataset.minDate = '';
      date.dataset.maxDate = today;
      if (picker) { picker.max = today; picker.removeAttribute('min'); }
      if (adjustValue && parsed && parsed > today) {
        date.value = isoDateToFrench(today);
        if (picker) picker.value = today;
      }
      if (help) { help.textContent = ''; help.hidden = true; }
    }
  }

  function syncPetBreedOtherInput() {
    const species = document.getElementById('petSpecies')?.value || 'Autre';
    const field = document.getElementById('petBreed');
    const row = document.getElementById('petBreedOtherRow');
    const input = document.getElementById('petBreedOther');
    if (!row || !field) return;
    const show = field.value === '__other__';
    row.hidden = !show;
    if (input) {
      input.disabled = !show;
      if (!show) input.value = '';
      if (show) input.placeholder = species === 'Oiseau' ? 'Nom de l’espèce' : 'Nom de la race';
    }
  }

  function syncPetBreedCatalog(clearValue = false) {
    const speciesField = document.getElementById('petSpecies');
    const fieldContainer = document.getElementById('petBreedField');
    const label = document.getElementById('petBreedLabel');
    if (!speciesField || !fieldContainer) return;
    const oldField = document.getElementById('petBreed');
    const oldOther = document.getElementById('petBreedOther');
    const previousValue = clearValue ? '' : (oldField?.value === '__other__' ? oldOther?.value || '' : oldField?.value || '');
    const species = speciesField.value;
    if (label) label.textContent = breedFieldLabel(species);
    fieldContainer.innerHTML = breedSelectHtml(species, previousValue);
    syncPetBreedOtherInput();
    updateBreedPickerTrigger();
  }

  function syncPetWeightGuide() {
    const speciesField = document.getElementById('petSpecies');
    const weightField = document.getElementById('petCurrentWeight');
    const guideField = document.getElementById('petWeightGuide');
    const dogSizeRow = document.getElementById('dogSizeRow');
    const dogSizeField = document.getElementById('petDogSize');
    if (!speciesField || !weightField) return;
    const limits = displayWeightLimits(speciesField.value);
    weightField.min = String(limits.min);
    weightField.max = String(limits.max);
    weightField.step = String(limits.step);
    if (dogSizeRow) dogSizeRow.hidden = speciesField.value !== 'Chien';
    if (dogSizeField) dogSizeField.disabled = speciesField.value !== 'Chien';
    if (guideField) guideField.textContent = translateText(`Plage indicative : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}`);
  }

  function restoreHealthTabsPosition() {
    const tabs = document.getElementById('healthTabs');
    if (!tabs) return;
    tabs.scrollLeft = healthTabsScrollLeft;
    const active = tabs.querySelector('.tab-chip.active');
    if (active) {
      const activeLeft = active.offsetLeft;
      const activeRight = activeLeft + active.offsetWidth;
      const visibleLeft = tabs.scrollLeft;
      const visibleRight = visibleLeft + tabs.clientWidth;
      if (activeLeft < visibleLeft || activeRight > visibleRight) tabs.scrollLeft = Math.max(0, activeLeft - (tabs.clientWidth - active.offsetWidth) / 2);
    }
    healthTabsScrollLeft = tabs.scrollLeft;
    updateHealthScrollButtons();
  }

  function updateHealthScrollButtons() {
    const tabs = document.getElementById('healthTabs');
    const left = document.querySelector('[data-action="health-scroll-left"]');
    const right = document.querySelector('[data-action="health-scroll-right"]');
    if (!tabs || !left || !right) return;
    left.disabled = tabs.scrollLeft <= 2;
    right.disabled = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 2;
  }

  function scrollHealthTabs(direction) {
    const tabs = document.getElementById('healthTabs');
    if (!tabs) return;
    tabs.scrollBy({ left: direction * Math.max(150, tabs.clientWidth * 0.72), behavior: 'smooth' });
    setTimeout(() => { healthTabsScrollLeft = tabs.scrollLeft; updateHealthScrollButtons(); }, 350);
  }

  function showPetSwitcher() {
    openModal('Choisir un animal', `
      <div class="list">
        ${data.pets.map((pet) => `<button type="button" class="card pet-list-card ${pet.id === data.activePetId ? 'active' : ''}" data-select-pet="${pet.id}" style="text-align:left;cursor:pointer" ${pet.id === data.activePetId ? 'aria-current="true"' : ''}>${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><p class="list-title">${escapeHtml(pet.name)}</p><p class="list-subtitle">${escapeHtml(petTypeLabel(pet))}</p></div><span>${pet.id === data.activePetId ? '✓' : '›'}</span></button>`).join('')}
        <button type="button" class="secondary-button paw-action" data-add="pet">Ajouter un animal</button>
      </div>
    `, 'Mes animaux');
  }

  function markReminderRead(recordId) {
    const item = data.health.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item || item.reminderRead) return;
    item.reminderRead = true;
    saveData();
    showReminders();
    showToast('Rappel marqué comme lu.');
  }

  function markAllRemindersRead() {
    const unread = unreadReminders();
    if (!unread.length) return;
    unread.forEach((item) => { item.reminderRead = true; });
    saveData();
    showReminders();
    showToast('Tous les rappels ont été marqués comme lus.');
  }

  function showReminders() {
    const reminders = upcomingReminders();
    const unreadCount = reminders.filter((item) => !item.reminderRead).length;
    const toolbar = reminders.length ? `<div class="reminder-toolbar"><span>${unreadCount ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}</span>${unreadCount ? '<button type="button" class="secondary-button reminder-read-all" data-action="mark-all-reminders-read">Tout marquer comme lu</button>' : ''}</div>` : '';
    openModal('Rappels à venir', reminders.length ? `${toolbar}<div class="list reminder-list">${reminders.map(renderReminderItem).join('')}</div>` : emptyList('Aucun rappel à venir.'), 'Notifications');
  }

  function showMemory(memoryId) {
    const memory = data.memories.find((item) => item.id === memoryId);
    if (!memory) return;
    openModal(memory.title, `
      ${imageTag(memory.image, '', memory.title, 'style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:18px;background:var(--primary-light)"')}
      <div style="margin-top:15px"><p class="eyebrow">${escapeHtml(memory.type)}</p><p style="color:var(--muted);font-size:.82rem">${formatDate(memory.date)}</p><p style="line-height:1.55">${escapeHtml(memory.note || 'Aucune anecdote.')}</p><div class="record-detail-actions"><button type="button" class="secondary-button" data-action="edit-memory-record" data-record-id="${memory.id}">Modifier</button><button type="button" class="danger-button" data-action="request-delete-record" data-collection="memories" data-record-id="${memory.id}" data-label="ce souvenir" data-return-page="memories">Supprimer</button></div></div>
    `, memory.favorite ? 'Souvenir favori' : 'Souvenir');
  }


  function requestResetAnimoa() {
    openModal('Effacer toutes les données ?', `
      <div class="delete-confirmation">
        <div class="delete-warning-icon">!</div>
        <p><strong>Toutes les données locales seront effacées.</strong></p>
        <p>Compagnons, santé, dépenses, poids, souvenirs et photos seront définitivement supprimés de ce navigateur.</p>
        <div class="delete-actions">
          <button type="button" class="secondary-button" data-action="close-modal">Annuler</button>
          <button type="button" class="danger-button" data-action="confirm-reset-data">Oui, tout effacer</button>
        </div>
      </div>
    `, 'Action sensible', { sensitive: true });
  }

  async function resetAnimoa() {
    const snapshot = clone(data);
    const settingsSnapshot = { ...settings };
    const mediaRefsToDelete = [...allImageRefsFrom(data)];
    try {
      data = normalizeData(clone(defaultData));
      settings = normalizeSettings({ ...settings });
      saveData();
      saveSettings();
      await clearMediaStore(mediaRefsToDelete);
      closeModal();
      setPage('home');
      showToast('Toutes les données ont été effacées.');
    } catch (error) {
      data = snapshot;
      settings = settingsSnapshot;
      try { saveData(); saveSettings(); } catch {}
      showToast(error.message || 'Suppression des données impossible.');
    }
  }

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button, [data-action], [data-page], [data-add]');
    if (!target) return;

    const page = target.dataset.page;
    const action = target.dataset.action;
    const add = target.dataset.add;
    const filter = target.dataset.healthFilter;

    if (filter) {
      const tabs = document.getElementById('healthTabs');
      healthTabsScrollLeft = tabs?.scrollLeft || healthTabsScrollLeft;
      applyHealthFilter(HEALTH_TYPES.includes(filter) ? filter : normalizeHealthType(filter));
      return;
    }

    if (page) setPage(page);
    if (add) openAddForm(add);

    if (action === 'open-menu') openDrawer();
    if (action === 'admin-refresh') { adminResponses=[]; adminFeedback=[]; adminAccessRequests=[]; await loadAdminData(); }
    if (action === 'admin-tab') { adminActiveTab=target.dataset.adminTab||'access'; adminStatusFilter='all'; renderPage(); }
    if (action === 'admin-filter') { adminStatusFilter=target.dataset.adminFilter||'all'; renderPage(); }
    if (action === 'admin-save-note') { const field=document.querySelector(`[data-admin-note-source="${target.dataset.adminSource}"][data-admin-note-id="${target.dataset.adminId}"]`); await saveAdminNote(target.dataset.adminSource,target.dataset.adminId,field?.value||''); }
    if (action === 'admin-copy-email') { try { await navigator.clipboard.writeText(target.dataset.email||''); showToast('Adresse e-mail copiée.'); } catch { showToast('Copie impossible.'); } }
    if (action === 'admin-delete-response') await deleteAdminResponse(target.dataset.adminSource, target.dataset.adminId);
    if (action === 'close-menu') closeDrawer();
    if (action === 'open-add') openAddMenu();
    if (action === 'close-modal') closeModal();
    if (action === 'open-breed-picker') openBreedPicker();
    if (action === 'close-breed-picker') closeBreedPicker();
    if (action === 'filter-breed-picker') {
      if (breedPickerState) { breedPickerState.filter = target.dataset.filter || 'popular'; breedPickerState.query = ''; renderBreedPicker(); document.getElementById('petBreedPickerSearch')?.focus(); }
    }
    if (action === 'choose-breed') chooseBreed(target.dataset.breedValue || '');
    if (action === 'dismiss-release-notes') closeModal();
    if (action === 'open-release-guide') openReleaseGuide();
    if (action === 'remove-file-selection') {
      const input = document.getElementById(target.dataset.inputId || '');
      if (input) removeFilePickerSelection(input);
    }
    if (action === 'switch-pet') showPetSwitcher();
    if (action === 'open-pet-photo') openPetPhoto(target.dataset.petId);
    if (action === 'photo-zoom-in') { photoViewerScale = Math.min(3, photoViewerScale + .25); updatePhotoViewer(); }
    if (action === 'photo-zoom-out') { photoViewerScale = Math.max(1, photoViewerScale - .25); updatePhotoViewer(); }
    if (action === 'photo-zoom-reset') { photoViewerScale = 1; updatePhotoViewer(); }
    if (action === 'show-reminders') showReminders();
    if (action === 'enable-push-notifications') { try { await enablePushNotifications({ sendTest: true }); } catch (error) { showToast(error.message || 'Activation impossible.'); } }
    if (action === 'disable-push-notifications') { try { await disablePushNotifications(); } catch (error) { showToast(error.message || 'Désactivation impossible.'); } }
    if (action === 'send-test-notification') { try { await sendTestPushNotification(); } catch (error) { showToast(error.message || 'Envoi du test impossible.'); } }
    if (action === 'save-notification-hours') {
      settings = normalizeSettings({ ...settings, quietHoursStart: document.getElementById('quietHoursStart')?.value, quietHoursEnd: document.getElementById('quietHoursEnd')?.value, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || settings.timezone });
      saveSettings();
      showToast('Heures silencieuses enregistrées.');
    }
    if (action === 'mark-reminder-read') markReminderRead(target.dataset.recordId);
    if (action === 'mark-all-reminders-read') markAllRemindersRead();
    if (action === 'health-scroll-left') scrollHealthTabs(-1);
    if (action === 'health-scroll-right') scrollHealthTabs(1);
    if (action === 'close-settings-section') {
      const section = document.getElementById(target.dataset.settingsSection || '');
      if (section instanceof HTMLDetailsElement) {
        section.open = false;
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    if (action === 'show-health-record') showHealthRecord(target.dataset.recordId);
    if (action === 'show-calendar-permission') showCalendarPermission(target.dataset.recordId, false);
    if (action === 'add-to-calendar') await addRecordToCalendar(target.dataset.recordId);
    if (action === 'download-calendar-ics') downloadRecordIcs(target.dataset.recordId);
    if (action === 'connect-calendar-and-sync') {
      const connected = await connectGoogleCalendar({ quiet: false });
      if (connected) await addRecordToCalendar(target.dataset.recordId);
    }
    if (action === 'connect-google-calendar' || action === 'reconnect-google-calendar') await connectGoogleCalendar({ quiet: false });
    if (action === 'connect-google-calendar-onboarding') await connectGoogleCalendar({ quiet: false });
    if (action === 'request-disconnect-google-calendar') {
      openModal('Désactiver la synchronisation ?', `<div class="delete-confirmation"><div class="delete-warning-icon calendar-warning-icon">📅</div><p><strong>Les nouveaux événements Animoa ne seront plus ajoutés automatiquement.</strong></p><p>Les événements déjà présents dans Google Agenda ne seront pas supprimés.</p><div class="delete-actions"><button type="button" class="secondary-button" data-action="close-modal">Annuler</button><button type="button" class="danger-button" data-action="disconnect-google-calendar">Désactiver</button></div></div>`, 'Calendrier');
    }
    if (action === 'disconnect-google-calendar') { closeModal(); disconnectGoogleCalendar(); }
    if (action === 'toggle-calendar-auto-sync') {
      settings = normalizeSettings({ ...settings, calendarAutoSync: Boolean(target.checked) });
      saveSettings();
      showToast(settings.calendarAutoSync ? 'Synchronisation automatique activée.' : 'Synchronisation automatique désactivée.');
    }
    if (action === 'open-map') {
      const locationValue = String(target.dataset.location || '').trim();
      if (locationValue) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationValue)}`, '_blank', 'noopener,noreferrer');
    }
    if (action === 'open-calendar-event') {
      try {
        const calendarUrl = new URL(target.dataset.calendarUrl || '');
        if (calendarUrl.protocol === 'https:' && /(^|\.)google\.com$/.test(calendarUrl.hostname)) window.open(calendarUrl.href, '_blank', 'noopener,noreferrer');
      } catch { showToast('Lien Google Agenda invalide.'); }
    }
    if (action === 'onboarding-next') { onboardingStep = Math.min(3, onboardingStep + 1); renderOnboarding(); }
    if (action === 'onboarding-back') { onboardingStep = Math.max(0, onboardingStep - 1); renderOnboarding(); }
    if (action === 'onboarding-skip') closeOnboarding({ completed: true });
    if (action === 'complete-onboarding') closeOnboarding({ completed: true });
    if (action === 'show-weight-record') showWeightRecord(target.dataset.recordId);
    if (action === 'show-expense-record') showExpenseRecord(target.dataset.recordId);
    if (action === 'edit-health-record') { const item = data.health.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier une information', healthForm(item), 'Santé'); }
    if (action === 'edit-weight-record') { const item = data.weights.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier le poids', weightForm(item), 'Poids'); }
    if (action === 'edit-expense-record') { const item = data.expenses.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier la dépense', expenseForm(item), 'Dépense'); }
    if (action === 'edit-memory-record') { const item = data.memories.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier le souvenir', memoryForm(item), 'Souvenir'); }
    if (action === 'request-delete-record') requestDeleteRecord(target.dataset.collection, target.dataset.recordId, target.dataset.label, target.dataset.returnPage);
    if (action === 'confirm-delete-record') deleteRecord(target.dataset.collection, target.dataset.recordId, target.dataset.returnPage);
    if (action === 'edit-pet') openModal('Modifier le profil', petForm(activePet()), 'Profil');
    if (action === 'request-delete-pet') requestDeletePet();
    if (action === 'confirm-delete-pet') deletePet(target.dataset.petId);
    if (action === 'save-theme') {
      const preview = currentThemeFormValue();
      settings = normalizeSettings({ ...settings, theme: preview.theme, palette: preview.palette, customColors: preview.customColors });
      settingsPreviewActive = false;
      saveSettings();
      renderNavigation();
      renderPage();
      showToast('Thème enregistré.');
    }
    if (action === 'restore-theme-preview') {
      settingsPreviewActive = false;
      applyVisualPreferences(settings);
      renderPage();
      showToast('Aperçu annulé.');
    }
    if (action === 'reset-custom-theme') {
      const values = normalizeCustomColors(DEFAULT_CUSTOM_COLORS);
      const pairs = [['customPrimary', values.primary], ['customAccent', values.accent], ['customLightBg', values.lightBg], ['customLightSurface', values.lightSurface], ['customDarkBg', values.darkBg], ['customDarkSurface', values.darkSurface]];
      pairs.forEach(([id, value]) => { const input = document.getElementById(id); if (input) input.value = value; });
      const customRadio = document.querySelector('input[name="paletteSetting"][value="custom"]');
      if (customRadio) customRadio.checked = true;
      previewThemeFromSettings();
    }
    if (action === 'save-settings') {
      const preview = currentThemeFormValue();
      const selectedCountry = document.getElementById('countrySetting')?.value || settings.country;
      const autoCurrency = Boolean(document.getElementById('autoCurrencySetting')?.checked);
      settings = normalizeSettings({
        ...settings,
        country: selectedCountry,
        autoCurrency,
        currency: autoCurrency ? suggestedCurrencyForCountry(selectedCountry) : document.getElementById('currencySetting')?.value,
        weightUnit: document.getElementById('weightSetting')?.value,
        language: document.getElementById('languageSetting')?.value,
        theme: preview.theme,
        palette: preview.palette,
        customColors: preview.customColors
      });
      settingsPreviewActive = false;
      saveSettings();
      renderNavigation();
      renderPage();
      showToast('Préférences enregistrées.');
    }
    if (target.id === 'countrySetting') {
      const autoCurrencyInput = document.getElementById('autoCurrencySetting');
      const currencyInput = document.getElementById('currencySetting');
      const country = COUNTRY_MAP.get(target.value);
      if (autoCurrencyInput?.checked && currencyInput && country) currencyInput.value = country.currency;
      const weightInput = document.getElementById('weightSetting');
      if (weightInput && country?.weight) weightInput.value = country.weight;
    }
    if (target.id === 'autoCurrencySetting') {
      const currencyInput = document.getElementById('currencySetting');
      const countryInput = document.getElementById('countrySetting');
      if (target.checked && currencyInput && countryInput) currencyInput.value = suggestedCurrencyForCountry(countryInput.value);
    }
    if (target.matches('[data-setting-toggle]')) {
      const key = target.dataset.settingToggle;
      if (key) {
        settings = normalizeSettings({ ...settings, [key]: Boolean(target.checked) });
        saveSettings();
        showToast('Préférence de notification enregistrée.');
      }
    }
    if (action === 'logout') {
      try { await flushCloudSave(); } catch {}
      try { await window.AnimoaAuth?.signOut?.(); }
      catch (error) { showToast(error.message || 'Déconnexion impossible.'); }
    }
    if (action === 'open-attachment') {
      const ref = target.dataset.imageRef;
      const fileType = target.dataset.fileType || '';
      const fileName = target.dataset.fileName || 'Fichier joint';
      resolveImageRef(ref).then((src) => {
        if (fileType.startsWith('image/') || !fileType) {
          openModal(fileName, `<img src="${escapeHtml(src)}" alt="${escapeHtml(fileName)}" class="attachment-full" />`, target.dataset.attachmentContext || 'Santé');
        } else {
          const opened = window.open(src, '_blank', 'noopener,noreferrer');
          if (!opened) showToast('Veuillez autoriser l’ouverture du fichier dans votre navigateur.');
        }
      });
    }
    if (action === 'reset-data') requestResetAnimoa();
    if (action === 'confirm-reset-data') resetAnimoa();

    const petId = target.dataset.selectPet;
    if (petId) {
      if (petId === data.activePetId) {
        closeModal();
        showToast(`${activePet()?.name || 'Cet animal'} est déjà sélectionné.`);
      } else {
        const snapshot = clone(data);
        try {
          data.activePetId = petId;
          saveData();
          closeModal();
          renderNavigation();
          renderPage();
          showToast(`${activePet()?.name || 'Animal'} est maintenant sélectionné.`);
        } catch (error) {
          data = snapshot;
          showToast(error.message || 'Impossible de changer d’animal.');
        }
      }
    }

    const memoryId = target.dataset.memoryId;
    if (memoryId) showMemory(memoryId);
  });


  document.addEventListener('click', (event) => {
    if (event.target?.id === 'petBreedPickerBackdrop') closeBreedPicker();
  });


  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.file-picker-button')) return;
    filePickerScrollTop = modalBody?.scrollTop || 0;
    filePickerWindowScrollY = window.scrollY || 0;
  });

  document.addEventListener('change', async (event) => {
    if (event.target.matches('[data-admin-status-source]')) {
      await updateAdminStatus(event.target.dataset.adminStatusSource, event.target.dataset.adminId, event.target.value);
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('.date-picker-native')) {
      const control = event.target.closest('[data-date-control]');
      const textInput = control?.querySelector('.date-text-input');
      if (textInput && event.target.value) {
        textInput.value = isoDateToFrench(event.target.value);
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    if (event.target.id === 'healthStatus') { syncHealthDateRules(true); syncHealthTimeField(); }
    if (event.target.id === 'healthType') syncHealthTimeField();
    if (event.target.id === 'petSpecies') { syncPetWeightGuide(); syncPetBreedCatalog(true); }
    if (event.target.id === 'petBreedOther') updateBreedPickerTrigger();
    if (event.target.id === 'supportScreenshot') {
      const file = event.target.files?.[0] || null;
      const label = document.getElementById('supportScreenshotName');
      if (label) label.textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2).replace('.', ',')} Mo` : 'Image JPG, PNG ou WebP, 2 Mo maximum.';
    }
    if (event.target.matches('input[name="paletteSetting"], #themeSetting')) {
      previewThemeFromSettings();
    }
    if (event.target.matches('.file-picker-input')) {
      const input = event.target;
      const originalFile = input.files?.[0] || null;
      const picker = input.closest('.file-picker');
      const label = picker?.querySelector('.file-picker-name');
      input.blur();

      const restorePickerPosition = () => requestAnimationFrame(() => {
        if (modalBody) modalBody.scrollTop = filePickerScrollTop;
        window.scrollTo(0, filePickerWindowScrollY);
      });

      if (!originalFile) {
        const hasExisting = picker?.dataset.hasExisting === 'true';
        const suppressed = picker?.dataset.existingSuppressed === 'true';
        if (hasExisting && !suppressed) restoreExistingFilePreview(input).finally(restorePickerPosition);
        else { setFilePickerEmpty(input, { removeExisting: hasExisting && suppressed }); restorePickerPosition(); }
        return;
      }

      const shouldCrop = ['petPhoto', 'memoryPhoto'].includes(input.id) && detectedFileType(originalFile).startsWith('image/');
      if (!shouldCrop) {
        preparedPhotoFiles.delete(input);
        showSelectedFilePreview(input, originalFile);
        restorePickerPosition();
        return;
      }

      if (label) label.textContent = translateText('Recadrage en cours…');
      const cropOptions = input.id === 'petPhoto'
        ? { aspect: 1, title: 'Recadrer la photo de profil', circularGuide: false }
        : { aspect: 4 / 3, title: 'Recadrer la photo du souvenir', circularGuide: false };
      cropImageFile(originalFile, cropOptions)
        .then((croppedFile) => {
          if (!croppedFile) {
            preparedPhotoFiles.delete(input);
            input.value = '';
            const hasExisting = picker?.dataset.hasExisting === 'true';
            const suppressed = picker?.dataset.existingSuppressed === 'true';
            if (hasExisting && !suppressed) return restoreExistingFilePreview(input);
            setFilePickerEmpty(input, { removeExisting: hasExisting && suppressed });
            return;
          }
          preparedPhotoFiles.set(input, croppedFile);
          showSelectedFilePreview(input, croppedFile, `${originalFile.name} · recadrée`);
        })
        .catch((error) => {
          preparedPhotoFiles.delete(input);
          input.value = '';
          const hasExisting = picker?.dataset.hasExisting === 'true';
          const suppressed = picker?.dataset.existingSuppressed === 'true';
          if (hasExisting && !suppressed) restoreExistingFilePreview(input).catch(() => setFilePickerEmpty(input));
          else setFilePickerEmpty(input, { removeExisting: hasExisting && suppressed });
          showToast(error.message || 'Impossible de recadrer cette photo.');
        })
        .finally(restorePickerPosition);
    }
  });


  document.addEventListener('input', (event) => {
    if (event.target.id === 'petBreedPickerSearch' && breedPickerState) { breedPickerState.query = event.target.value; renderBreedPicker(); }
    if (event.target.id === 'petBreedOther') updateBreedPickerTrigger();
    if (event.target.matches('.custom-theme-color')) {
      const customRadio = document.querySelector('input[name="paletteSetting"][value="custom"]');
      if (customRadio) customRadio.checked = true;
      previewThemeFromSettings();
    }
    if (event.target.id === 'healthTime') {
      const formatted = formatDirectTimeEntry(event.target.value);
      if (event.target.value !== formatted) event.target.value = formatted;
    }
    if (event.target.matches('.date-text-input')) {
      const formatted = formatDirectDateEntry(event.target.value);
      if (event.target.value !== formatted) event.target.value = formatted;
      const parsed = tryParseFrenchDate(formatted);
      const picker = event.target.closest('[data-date-control]')?.querySelector('.date-picker-native');
      if (picker) picker.value = parsed;
    }
  });

  document.addEventListener('scroll', (event) => {
    if (event.target?.id === 'healthTabs') {
      healthTabsScrollLeft = event.target.scrollLeft;
      updateHealthScrollButtons();
    }
  }, true);

  document.addEventListener('submit', async (event) => {
    if (event.target.matches('#supportForm')) {
      event.preventDefault();
      try { await handleSupportSubmit(event.target); }
      catch (error) { showToast(error.message || 'Impossible d’envoyer le message.'); }
      return;
    }
    if (!event.target.matches('#healthForm, #expenseForm, #weightForm, #memoryForm, #petForm')) return;
    event.preventDefault();
    handleFormSubmit(event.target);
  });

  drawerBackdrop.addEventListener('click', closeDrawer);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const breedBackdrop = document.getElementById('petBreedPickerBackdrop');
    if (breedBackdrop && !breedBackdrop.hidden) { closeBreedPicker(); return; }
    if (document.querySelector('.cropper-overlay')) {
      document.querySelector('.cropper-cancel')?.click();
      return;
    }
    closeDrawer(); closeModal();
  });
  window.addEventListener('resize', () => { if (currentPage === 'weight') drawWeightChart(); if (currentPage === 'health') restoreHealthTabsPosition(); });
  async function retryCloudConnection() {
    if (cloudRetrying || !window.AnimoaCloud?.available?.()) return;
    cloudRetrying = true;
    cloudLoadFailed = false;
    try {
      await hydrateUserState();
      if (!cloudLoadFailed) {
        await migrateLocalMediaToCloud();
        applyPreferences();
        renderNavigation();
        renderPage();
      }
    } finally {
      cloudRetrying = false;
    }
  }

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (settingsPreviewActive && currentPage === 'settings') applyVisualPreferences(currentThemeFormValue());
    else if (settings.theme === 'system') applyPreferences();
  });
  window.addEventListener('online', () => { retryCloudConnection().catch(() => {}); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushCloudSave().catch(() => {});
  });
  window.addEventListener('pagehide', () => { flushCloudSave().catch(() => {}); });

  async function init() {
    await window.AnimoaAuth?.ready?.();
    await hydrateUserState();
    settings = normalizeSettings(settings);
    applyPreferences();
    try {
      await migrateLegacyImages();
      await migrateLocalMediaToCloud();
    } catch (error) {
      console.warn('Migration des anciennes photos incomplète', error);
    }
    data = normalizeData(data);
    try { saveData(); } catch (error) { console.warn('Migration des données incomplète', error); }
    await cleanupUnusedMedia();
    await resolveAdminAccess();
    renderNavigation();
    renderPage();
    if (googleCalendarConfigured()) {
      waitForGoogleIdentity().then(initialiseGoogleCalendarTokenClient).catch((error) => console.warn('Google Agenda indisponible', error));
    }
    if (!settings.onboardingCompleted) window.setTimeout(() => openOnboarding(0), 420);
    else window.setTimeout(showReleaseNotesIfNeeded, 800);
    const isLocalPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      if (isLocalPreview) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
          }
        } catch (error) {
          console.warn('Nettoyage du cache local incomplet', error);
        }
      } else {
        navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`).catch((error) => console.warn('Mode installable Animoa indisponible', error));
      }
    }
  }

  init();
})();
