const WORDS_5 = (
    "about above abuse actor acute admit adopt adult after again agent agree ahead alarm album " +
    "alert alike alive allow alone along alter among anger angle angry ankle apart apple apply " +
    "arena argue arise armor arrow aside asset audio audit avoid awake award aware badly baker " +
    "bases basic basis beach began begin begun being below bench birth black blade blame blank " +
    "blast blaze bleed blend bless blind block blood blown blues board boast bonus boost booth " +
    "bound brain brand brass brave bread break breed brick bride brief bring broad broke brown " +
    "brush build built burst buyer cabin cable candy canal cargo carry catch cause chain chair " +
    "chaos charm chart chase cheap check chess chest chief child china chose civil claim class " +
    "clean clear click climb clock close cloth cloud coach coast could count court cover crack " +
    "craft crash crazy cream crime crisp cross crowd crown crude curve cycle daily dance dated " +
    "dealt death debut delay depth doing doubt dozen draft drama drank drawn dream dress dried " +
    "drill drink drive drove dying eager early earth eight elite empty ended enemy enjoy enter " +
    "entry equal error essay event every exact exist extra faith false fault fiber field fifth " +
    "fifty fight final first fixed flash fleet floor fluid focus force forth forty forum found " +
    "frame frank fraud fresh front fruit fully funny giant given glass globe glory going grace " +
    "grade grain grand grant grass grave great green gross group grown guard guess guest guide " +
    "happy harsh heart heavy hence horse hotel house human ideal image index inner input issue " +
    "joint judge known label large laser later laugh layer learn lease least leave legal lemon " +
    "level light limit links lives local lodge logic loose lower lucky lunch lying magic major " +
    "maker march match maybe mayor meant media metal might minor minus mixed model money month " +
    "moral motor mount mouse mouth movie music needs never newly night noise north noted novel " +
    "nurse occur ocean offer often order other ought paint panel paper party peace phase phone " +
    "photo piece pilot pitch place plain plane plant plate point pound power press price pride " +
    "prime print prior prize probe proof proud prove queen quick quiet quite quote radio raise " +
    "range rapid ratio reach ready realm rebel refer relax reply rider ridge rifle right rigid " +
    "rival river robot rough round route royal rural scale scene scope score sense serve seven " +
    "shade shake shall shape share sharp sheet shelf shell shift shine shirt shock shoot short " +
    "shown sight since sixth sixty skill sleep slide small smart smile smoke solid solve sorry " +
    "sound south space spare speak speed spend spent split spoke sport staff stage stake stand " +
    "start state steam steel stick still stock stone stood store storm story strip stuck study " +
    "stuff style sugar suite super sweet swift table taken taste teach teeth thank theme there " +
    "these thick thing think third those three throw tight times tired title today topic total " +
    "touch tough tower track trade train treat trend trial tribe trick tried tries truck truly " +
    "trust truth twice twist union unite unity until upper upset urban usage usual valid value " +
    "video virus visit vital voice waste watch water wheel where which while white whole woman " +
    "world worry worse worst worth would wound write wrong wrote yield young youth"
).split(/\s+/).filter(Boolean);

const WORDS_SHORT = (
    "a an as at be by do go he hi if in is it me my no of oh on or so to up us we " +
    "act add age ago aid aim air all and any are arm art ash ask ate bad bag ban bar bat " +
    "bay bed bee beg bet bid big bin bit box boy bud bug bun bus but buy cab can cap car " +
    "cat cow cry cub cup cut dad dam day den dew did die dig dim dip dog dot dry due dug " +
    "ear eat eel egg ego end era eve eye fad fan far fat fed fee few fig fin fir fit fix " +
    "fly fog for fox fry fun fur gap gas gel gem get gin got gum gun gut guy gym had ham " +
    "has hat hay hem hen her hid him hip his hit hoe hog hop hot how hub hue hug hum hut " +
    "ice icy ill imp ink inn ion ire its ivy jab jam jar jaw jay jet jig job jog jot joy " +
    "jug keg key kid kin kit lab lad lag lap law lay led leg let lid lie lip lit log lot " +
    "low mad man map mat may men met mix mob mom mop mud mug nab nag nap net new nil nip " +
    "nod nor not now nut oak oar oat odd ode off oil old one opt orb ore our out owe owl " +
    "own pad pal pan par pat paw pay pea peg pen pep pet pew pie pig pin pit ply pod pop " +
    "pot pro pry pub pug pun pup put rag ram ran rap rat raw ray red rib rid rig rim rip " +
    "rob rod roe rot row rub rug rum run rye sad sag sap sat saw say sea see set sew she " +
    "shy sin sip sir sis sit six ski sky sly sob sod son sow soy spa spy sub sue sum sun " +
    "tab tag tan tap tar tax tea tee ten the thy tie tin tip toe ton too top tot tow toy " +
    "try tub tug two urn use van vat vet via vie vow wad wag war was way web wed wee wet " +
    "who why wig win wit woe wok won woo wow yak yam yap yaw yes yet yew you zap zip zoo"
).split(/\s+/).filter(Boolean);

const WORDS_6_7 = (
    "aboard abroad accept access across action active actual advice advise affair affect afford " +
    "afraid agency agenda agents agreed agrees almost always amount animal annual answer anyone " +
    "anyway appeal appear around arrive artist aspect assess assist assume attach attack attend " +
    "august author autumn avenue backed barely basket battle beauty became become before behind " +
    "belief belong beside better beyond bidder bishop bitter bother bottom bounce bridge bright " +
    "broken broker bronze bubble bucket budget bullet bureau burden button butter camera campus " +
    "candle cannon canvas carbon career carpet casual caught center cereal chance change charge " +
    "cheese choice choose chosen church cinema circle client closed closer coffee column combat " +
    "comedy coming common cotton council count country county couple course cousin covers create " +
    "credit crisis custom danger dealer debate debtor decade decent decide defeat degree demand " +
    "depart depend deputy desert design desire detail detect device differ dinner direct doctor " +
    "dollar domain double driver during easily eating eleven employ enable ending energy engine " +
    "enough ensure entire equity escape estate ethnic evolve except excess expand expect expert " +
    "export extend fabric factor fairly family famous father fellow female figure finger finish " +
    "flight flower flying follow forget formal format former foster French friend frozen future " +
    "garden gather gender gentle ginger giving global golden ground growth guilty handle happen " +
    "hardly health hearts height hidden holder honest hunger income indeed infant inform injury " +
    "inland insect inside intend invest island itself jacket jersey junior keeper kernel killer " +
    "ladder latest latter launch lawyer leader league leaves legacy legend length lesson letter " +
    "liable lights likely linked liquid listen little living locate lonely longer looked losing " +
    "lucent luxury mainly making manage manner manual margin marine marker market master matter " +
    "mature medium member memory mental merely merger method middle mining minute mirror mobile " +
    "modern modest moment mostly mother motion museum mutual myself narrow nation native nature " +
    "nearby nearly needing nickel nobody normal notice notion number object obtain office offset " +
    "online option orange origin others output oxygen packed parent partly patent patrol pencil " +
    "people pepper period permit person phrase picked planet player please pocket police policy " +
    "polish poorly posted potato powder prayer prefer pretty prince prison profit prompt proper " +
    "proven public pulled purple pursue quoted racing random rarely rather rating reader really " +
    "reason recall recent recipe record reduce reform regard region relate relief remain remote " +
    "remove repair repeat replay report rescue resist resort result retail retain retire return " +
    "reveal review reward riding rising robust ruling runner safely salary sample saving saying " +
    "scared scheme school scrape script search season second secret sector secure seeing select " +
    "seller senior series server settle severe should signal silver simple simply singer single " +
    "sister slight slowly smooth soccer social softly sole source speaker spirit spoken stable " +
    "status steady stolen stream street stress strict strike string strips stroke strong struck " +
    "studio submit subtle sudden suffer summer sunset superb supply surely survey switch symbol " +
    "system taking talent target taught temple tenant tender tennis thanks theory thirty though " +
    "threat thrown ticket timely tissue tongue toward travel treat treaty trying twelve twenty " +
    "unable unfold unfair unique united unless unlike update useful valley varied vendor victim " +
    "viewer village violet virtue vision visual volume walked wallet wanted warmly wealth weapon " +
    "weekly weight window winner winter wisdom within wonder wooden worker writer yearly yellow"
).split(/\s+/).filter(Boolean);

const SCRABBLE_DICT = new Set([...WORDS_5, ...WORDS_SHORT, ...WORDS_6_7]);
const WORDLE_VALID = new Set(WORDS_5);

const WAFFLE_FALLBACK = {
    rows: ['HOUSE', 'CRANE', 'SPICY'],
    cols: ['HOCUS', 'UMAMI', 'EVERY']
};