// Астеризмы для телескопа (визуал): названия, положения, размеры и блеск — без заметок и описаний.
// Данные: Saguaro Astronomy Club Asterisms Database v3.2 (Steve Coe, 2013) — https://www.saguaroastro.org/sac-downloads/
// и Asterism Observing List, Astronomical League (2025) — https://www.astroleague.org/asterism-observing-program/
// Совпадающие объекты объединены по положению; крупнее 2° и раздел «для бинокля» не включены. Названия переведены на русский.
// id;русское название;английские названия через |;созвездие;RA°;Dec°;a′;b′;блеск звёзд;источник
const ASTERISMS=`
Little Joe;Малыш Джо;;Psc;0.5;-4.45;120;60;5;SAC
Triangulum Minor;Малый Треугольник;;Tri;35;30;90;60;5;SAC
Diamond Ring;Бриллиантовое кольцо;Engagement Ring;UMi;38;89;45;45;2;SAC+AL
Lilium (Lilly);Лилия;;Ari;41.25;27;120;120;4;SAC
Medusa's Head;Голова Медузы;;Per;45;40;120;120;3;SAC
Saxophone;Саксофон;;Per;51.075;49.867;120;120;2;SAC
Kemble's Kite;Воздушный змей Кембла;Measuring Scoop;Cas;52;72;90;30;6;SAC+AL
Flying Minnow;Летящий пескарь;Leaping Minnow|Melotte 31;Aur;79.75;33.667;75;75;5;SAC+AL
Smiley Face;Смайлик;Cheshire Cat;Aur;81.75;35;60;30;6;SAC+AL
Lambda-Lambda;Лямбда-Лямбда;;Ori;84;10;50;20;3;SAC
Spermatozoon;Сперматозоид;Barbecue Fork;Tau;85.75;21.5;30;30;8;SAC+AL
African Buffalo Horns;Рога африканского буйвола;;Ori;87.225;-0.667;24;8;9;SAC
False Kids;Ложные Козлята;;Aur;87.5;38;120;30;4;SAC
Unicorn's Horn;Рог единорога;;Mon;100.125;-9;10;10;8;SAC
Pakan's 3;Тройка Пакана;;Mon;103.125;-10.167;30;30;8;SAC+AL
Mini Orion;Маленький Орион (Большой Пёс);;CMa;109.25;-24.35;15;15;5;SAC
Southern Little Queen;Маленькая южная Кассиопея;;Pup;122;-15.183;7;2;8;SAC
Sailboat Cluster;Парусник;Sailboat;LMi;153.5;31.5;45;45;7;SAC+AL
Broken Engagement Ring;Разбитое обручальное кольцо;Broken engagement Ring;UMa;162.75;56.15;20;20;7;SAC+AL
Stargate;Звёздные врата;;Crv;188.925;-12.033;15;15;6;SAC+AL
Jaws;Челюсти;Ty's Oil Can;Vir;189.625;-11.5;15;15;7;SAC+AL
Horse and Rider;Конь и всадник;;UMa;201.25;55;12;12;3;SAC
Night Owl (Noctus);Ночная сова;;Hya;210;-25;78;42;5;SAC
Napoleon's Hat;Треуголка Наполеона;Picot 1;Boo;213.5;18.55;20;7;8;SAC+AL
Zig Zag;Зигзаг;;Her;244.5;13;100;15;7;SAC
Mini-Coathanger;Мини-вешалка;Mini - Coathanger|Mini Coathanger;UMi;247.25;80.217;15;15;8;SAC+AL
Backwards 5;Обратная пятёрка;;Her;249.025;30.75;20;20;8;SAC+AL
Ruby Ring;Рубиновое кольцо;Webb's Wreath;Her;270.75;26.333;25;25;7;SAC+AL
Jenn's Confluence;Слияние Дженн;;Sgr;273.35;-18.783;15;15;8;SAC
HSL Chain;Цепочка HSL;;Sgr;273.625;-21.8;30;30;9.5;SAC
Little Queen;Маленькая Кассиопея;Mini-Cas|Kemble 2;Dra;278.75;72.417;20;10;7;SAC+AL
Button Hook;Крючок для пуговиц;;Sct;280.75;-6.833;75;45;5;SAC
Essertoo String;Нить Эссерту;;Sct;281.25;-10.6;6;6;11;SAC
Arrowchain;Цепочка стрелы;;Sge;298.75;17.3;36;36;8.6;SAC+AL
Fairy Ring;Кольцо фей;Chaple's Arc;Cyg;301.025;38.233;20;20;7;SAC+AL
Red Necked Emu;Красношеий эму;Bent Fan;Cyg;303.45;36.5;45;45;9;SAC+AL
Theta Delphini;Группа θ Дельфина;;Del;309.5;13.167;60;30;5;SAC
Toadstool;Поганка;French 1;Del;316.825;16.333;15;15;8;SAC+AL
Horseshoe;Подкова;;Cyg;317.075;47.233;25;25;10;SAC
Air Balloon;Воздушный шар;Air ballon;PsA;322.5;-25.5;48;40;7;SAC
Stephan's Test;Тест Стефана;;Peg;339.25;34.133;3;3;12;SAC
Airplane;Самолёт;The Airplane|Party Balloon;Cas;350;62.333;60;60;5;SAC+AL
Keystone (Cet);Замковый камень (Кит);Keystone;Cet;5.75;-23.5;105;105;7–8;AL
Renou 18;Рену 18;;Psc;18.5;30;18;18;9;AL
E.T.;Инопланетянин;NGC-457;Cas;19.75;58.333;30;30;5–10;AL
Spatula;Лопаточка;;Psc;23.75;8;90;90;6–10;AL
David's D;Буква D Дэвида;David's 'D';Tri;27.5;27.067;6;6;;AL
Pouring Cup;Ковшик;;Cet;33;8.5;90;90;6–10;AL
Letter F;Буква F;;Eri;54.5;-7.75;60;60;8–11;AL
Letter D;Буква D;;Eri;54.75;-1.75;30;30;9.5;AL
Fish Hook;Рыболовный крючок;;Tau;66.25;21.25;90;90;8–9.5;AL
Elosser 1;Элоссер 1;;Ori;72.5;7.85;21;21;7;AL
Dolidze 17;Метроном (Metronome);Dolidze 17 - Metronome|Stratton 2;Ori;80.5;7.083;17;12;7–8;AL
Funnel;Воронка;;Lep;86.5;-15.667;30;30;9.5–10.5;AL
NGC 2169;«37»;37;Ori;92;13.95;7;7;6;AL
Nagler 1;Нэглер 1;;CMa;95.5;-26.467;48;16;7–10;AL
Christmas Tree;Ёлочка;NGC 2264;Mon;100.25;9.667;30;30;9.5;AL
Little Leo;Маленький Лев;Lovett 1;Gem;117.5;28.783;60;35;6–7;AL
Ray's Shrimp;Креветка Рэя;Howard 1;Pup;122.75;-14.367;15;6;7.6–10.9;AL
Levy 384;Леви 384;;Pup;123.75;-13.967;2;2;;AL
Inchworm;Пяденица;;Lyn;136.25;38.267;46;46;4;AL
Greg's 3;Тройка Грега;Greg's '3';Leo;144.5;15.283;16;12;;AL
Spade;Лопата;;UMa;145.5;53.333;60;60;9.5–10.5;AL
The Heart;Сердце;;Hya;145.75;-13.833;45;45;10–11.5;AL
Camel;Верблюд;French 2;Hya;151.75;-24.917;39;39;7–11;AL
Weisman 1;Буква A;A;Sex;155;3.117;11;11;9–11;AL
Curved Arrow;Изогнутая стрела;;Com;193.25;19.5;45;45;9.5;AL
Ferrero 6;Эйфелева башня;Eiffel Tower;UMa;197.5;57.517;28;20;7;AL
Sand Shovel;Совок для песка;;Com;198.75;19;90;90;9;AL
Gas Pump Handle;Пистолет бензоколонки;;UMa;204.5;52.833;45;45;7.5–9.5;AL
Do Dz 5;Do Dz 5;;Her;246.75;38.067;27;27;8;AL
Do Dz 6;Do Dz 6;;Her;251.25;38.35;3.5;3.5;8;AL
Shark;Акула;;UMi;251.25;77.833;90;90;9;AL
Do Dz 7;Do Dz 7;;Her;257.75;15.483;10;10;10;AL
Do Dz 8;Do Dz 8;;Her;261.5;24.2;15;15;7;AL
Markov 1;Марков 1;;Her;269.25;29.483;15;15;7;AL
Chinese Kite;Китайский воздушный змей;;Her;269.5;45.833;90;90;8.5–11;AL
Levy 157;Трость;Cane;Cyg;297;37.717;20;10;9;AL
Tennis Racket;Теннисная ракетка;;Aql;297.5;-4.583;45;45;7–9.5;AL
Meerschaum Pipe;Пенковая трубка;;Cyg;297.75;30.117;22;22;9–12;AL
Vultus Irrisorie;Смеющееся лицо;;Cyg;298.25;47.267;84;84;6–8;AL
Leiter 4;Лейтер 4;;Sge;300.25;20.05;7;5;6;AL
Patchik 56;Патчик 56;;Cyg;306;41.617;3.3;2.2;11;AL
Thompson 1;Томпсон 1;;Del;309.5;11.333;6;6;9;AL
HD 196944;HD 196944;;Aqr;310.25;-6.817;23;23;6.6;AL
Poskus 1;Мухобойка;Flyswatter;Del;311.5;16.333;6;6;10–11;AL
M73;M73;;Aqr;314;-12.833;2.8;2.8;9;AL
Little Orion;Маленький Орион;Leiter 9;Cyg;314;43.567;45;45;10–11;AL
10 Aquarii;10 Водолея;;Aqr;315;-5.583;29;15;5.8;AL
Seedling;Росток;;Peg;325.75;10.333;45;45;10;AL
Tobacco Pipe;Курительная трубка;;Cep;337.5;70.5;90;90;8–9;AL
Delphinus Minor;Малый Дельфин;;Peg;345.75;23.2;60;60;7–8;AL
Rocketship;Ракета;Posey 1;Psc;349;-1.583;50;22;7–8;AL
The Yacht;Яхта;;Cep;351.25;64.25;120;120;9–10;AL
TPK 1;TPK 1;;And;354.75;47.517;23;11;9–12;AL
`;
