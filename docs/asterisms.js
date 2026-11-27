// Астеризмы для визуала: только названия, положения и размеры — без описаний.
// Список — по D. Ramakers, «Asterisms: small star patterns for telescopes and binoculars», v4.2 (2011); названия переведены на русский.
// Описания «как найти» в публичный файл не входят: при желании они подключаются личным каталогом в настройках.
// id;русское название;английские названия через |;созвездие;RA°;Dec°;a′;b′
const ASTERISMS=`
STAR 14;Клюшка для гольфа;The Golf Putter|Golf Putter|Star 14;And;28;37.5;95;25
The Home Plate;Домашняя база;The Home Plate|Home Plate;And;1.875;40.583;44;31
TPK 1;;TPK 1;And;354.825;47.517;23;11
Smiley Face;Смайлик;Smiley Face;Aur;81.75;35;60;30
STAR 4;Летящий пескарь;The Flying Minnow|STAR 4;Aur;79.75;33.667;75;75
Picot 1;Треуголка Наполеона;Napoleon's Hat|Picot 1;Boo;213.5;18.55;20;7
STAR 3;Каскад Кембла;Kemble's Cascade|STAR 3;Cam;61.75;62.333;150;150
Nagler 1;Нэглер 1;Nagler 1;CMa;95.5;-26.467;48;16
STAR 15;Воздушный змей Кембла;Kemble's Kite|Star 15;Cas;52;72;90;30
STAR 29;Счастливая семёрка;Lucky 7|Star 29;Cas;345.75;59.5;125;70
STAR 12;Самолёт;The Airplane|Star 12;Cas;350;62.333;60;60
STAR 13;Змей королевы;The Queen's Kite|Queens Kite|Star 13;Cas;24.5;58.5;120;90
STAR 11;;STAR 11|Star 11;Cep;327;61;180;90
The Cosmic Question Mark;Космический вопросительный знак;The Cosmic Question Mark|Question Mark|The Cosmic;Cet;39;6.7;126;42
STAR 20;Звёздные врата;Stargate|STAR 20;Crv;189;-12.033;15;15
STAR 28;Подкова;Horseshoe|STAR 28;Cyg;317;47.233;25;25
Leiter 9;Маленький Орион;Little Orion|Leiter 9;Cyg;314;43.567;30;30
Meerschaum Pipe;Пенковая трубка;Meerschaum Pipe|Pipe|Meerschaum;Cyg;297.75;30.117;22;22
STAR 26;Красношеий эму;Red Necked Emu|STAR 26;Cyg;303.5;36.5;45;45
The Fairy Ring;Кольцо фей (Дуга Чапла);The Fairy Ring|Chaple's Arc;Cyg;301;38.233;20;20
Vultus Irrisorie;Смеющееся лицо;Vultus Irrisorie;Cyg;298.25;47.267;84;84
STAR 9;Группа θ Дельфина;Theta Delphinus Group|STAR 9;Del;309.5;13.167;60;30
STAR 27;Поганка (Бриллианты Дельфина);The Toadstool|STAR 27;Del;316.75;16.333;15;15
Poskus 1;Поскус 1;Poskus 1;Del;311.5;16.333;6.5;6.5
STAR 25;Маленькая Кассиопея;Mini-Cassiopeia|STAR 25;Dra;278.75;72.417;20;10
STAR 2;Хи 1, 2, 3;Chi 1, 2, 3|STAR 2;For;51.75;-35;30;30
STAR 23;Обратная пятёрка;Backwards 5|STAR 23;Her;249.25;30.75;20;20
Markov 1;Марков 1;Markov 1;Her;269.25;29.483;15;15
STAR 24;Рубиновое кольцо;Ruby Ring|STAR 24;Her;270.75;26.333;25;25
Webb's Wreath;Венок Уэбба;Webb's Wreath;Her;270.5;26.3;11;7
STAR 7;Зигзаг;Zig Zag|STAR 7;Her;244.5;13;100;15
Night Owl;Ночная сова;Night Owl;Hya;210;-25;60;42
Triangle;Треугольник;Triangle;Hya;211;-28.467;30;30
STAR 6;Парусник;The Sailboat Cluster|STAR 6;LMi;153.5;31.5;45;45
STAR 18;Тройка Пакана;Pakan's 3|STAR 18;Mon;103;-10.167;30;30
STAR 5 / 17;Рог единорога (Наконечник стрелы);Unicorn's Horn|STAR 5 / 17;Mon;100;-9;15;15
Lambda-Lambda;Лямбда-Лямбда;Lambda-Lambda|Lambda;Ori;84;10;50;20
Delphinus Minor;Малый Дельфин;Delphinus Minor|Delphinus;Peg;345.75;23.2;66;66
Stephan's Test;Тест Стефана;Stephan's Test;Peg;339.25;34.133;3;3
The Mini-Cross;Мини-крест;The Mini-Cross;Peg;2.625;15.3;16.5;16.5
HD 4798 Group;Группа HD 4798;HD 4798 Group;Psc;12.5;28.367;5.6;5.6
Renou 18;Рену 18;Renou 18;Psc;18.625;30;18;18
Arrowchain;Цепочка стрелы;Arrowchain;Sge;298.75;17.3;36;36
Leiter 4;Лейтер 4;Leiter 4;Sge;300.25;20.05;7;5
Button Hook;Крючок для пуговиц;Button Hook;Sct;280.75;-6.833;75;45
Essertoo String;Нить Эссерту;Essertoo String;Sct;281.25;-10.6;6;6
Rinnan's Run;Пробежка Ринана;Rinnan's Run;Sex;161.5;3.433;180;180
Davis' Dog;Пёс Дэвиса;Davis' Dog;Tau;65.5;21.417;210;90
Spermatozoon;Сперматозоид;Spermatozoon;Tau;85.75;21.5;30;30
Triangulum Minor;Малый Треугольник;Triangulum Minor|Triangulum;Tri;35;30;90;60
STAR 19;Разбитое обручальное кольцо;Broken Engagement Ring|STAR 19;UMa;162.75;56.15;20;20
Ferrero 6;Эйфелева башня;Eiffel tower|Eiffel Tower|Ferrero 6;UMa;197.5;57.517;28;20
Gas Pump Handle;Пистолет бензоколонки;Gas Pump Handle|Gas Pump;UMa;204.5;52.933;60;60
The Spade;Лопата;The Spade;UMa;145.75;53.283;66;66
STAR 1;Обручальное кольцо;Engagement Ring|STAR 1;UMi;38;89;45;45
STAR 22;Мини-вешалка;Mini-Coathanger|STAR 22;UMi;247.25;80.217;15;15
The Shark;Акула;The Shark;UMi;251;77.8;90;90
STAR 21;Челюсти;Jaws|STAR 21;Vir;189.5;-11.5;15;15
Collinder 399;Вешалка;The Coathanger|Collinder 399;Vul;291.25;20.183;90;60
`;
