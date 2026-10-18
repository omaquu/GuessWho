'use strict';

/**
 * questions.js — Bilingual questions database (FI & EN) + Open Trivia DB API integration
 * Works 100% client-side in the browser on GitHub Pages!
 */

const QUESTION_BANK = {
  fi: [
    {
      question_fi: 'Mikä on Suomen pääkaupunki?',
      option_a: 'Tampere',
      option_b: 'Turku',
      option_c: 'Helsinki',
      option_d: 'Oulu',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Maantieto',
      hint: 'Se sijaitsee Etelä-Suomessa Suomenlahden rannalla.',
      mode: 'trivia'
    },
    {
      question_fi: 'Montako maan rajanaapuria Suomella on?',
      option_a: '2',
      option_b: '3',
      option_c: '4',
      option_d: '5',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Maantieto',
      hint: 'Naapurit ovat Ruotsi, Norja ja Venäjä.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mikä on Suomen pisin joki?',
      option_a: 'Ounasjoki',
      option_b: 'Tornionjoki',
      option_c: 'Oulujoki',
      option_d: 'Kemijoki',
      correct_answer: 'D',
      difficulty: 'medium',
      category: 'Maantieto',
      hint: 'Se virtaa Lapin halki Perämereen ja on n. 550 km pitkä.',
      mode: 'trivia'
    },
    {
      question_fi: 'Missä kaupungissa sijaitsi Suomen vanhin yliopisto alun perin (Turun Akatemia)?',
      option_a: 'Helsinki',
      option_b: 'Turku',
      option_c: 'Tampere',
      option_d: 'Jyväskylä',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Historia',
      hint: 'Perustettiin vuonna 1640 Aurajoen rannalle.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mikä on Suomen suurin luonnonjärvi?',
      option_a: 'Päijänne',
      option_b: 'Oulujärvi',
      option_c: 'Saimaa',
      option_d: 'Inarijärvi',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Maantieto',
      hint: 'Se on myös Euroopan neljänneksi suurin luonnonjärvi.',
      mode: 'trivia'
    },
    {
      question_fi: 'Minä vuonna Suomi julistautui itsenäiseksi?',
      option_a: '1905',
      option_b: '1917',
      option_c: '1919',
      option_d: '1921',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Historia',
      hint: 'Itsenäisyyspäivää vietetään 6. joulukuuta.',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuka oli Suomen ensimmäinen tasavallan presidentti?',
      option_a: 'P. E. Svinhufvud',
      option_b: 'Lauri Kristian Relander',
      option_c: 'K. J. Ståhlberg',
      option_d: 'Kyösti Kallio',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'Historia',
      hint: 'Hän toimi presidenttinä vuosina 1919–1925.',
      mode: 'trivia'
    },
    {
      question_fi: 'Minä vuonna kesäolympialaiset järjestettiin Helsingissä?',
      option_a: '1948',
      option_b: '1950',
      option_c: '1952',
      option_d: '1956',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'Historia',
      hint: 'Kisoja varten valmistui Olympiastadion.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mikä sota käytiin marraskuun 1939 ja maaliskuun 1940 välisenä aikana?',
      option_a: 'Jatkosota',
      option_b: 'Sisällissota',
      option_c: 'Talvisota',
      option_d: 'Lapin sota',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Historia',
      hint: 'Kesti 105 kunniakasta päivää.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mikä on Suomen kansallislintu?',
      option_a: 'Merikotka',
      option_b: 'Keltasirkku',
      option_c: 'Laulujoutsen',
      option_d: 'Metso',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Luonto',
      hint: 'Se on komea valkoinen vesilintu.',
      mode: 'trivia'
    },
    {
      question_fi: 'Millä tieteellisellä nimellä tunnetaan pohjoisen revontulet?',
      option_a: 'Borealis aurora',
      option_b: 'Aurora australis',
      option_c: 'Aurora borealis',
      option_d: 'Polaris lux',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Tiede',
      hint: 'Latinankielinen nimi viittaa pohjoistuuleen (Boreas).',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuka suomalainen tiedemies voitti kemian Nobel-palkinnon AIV-rehun keksinnöstä (1945)?',
      option_a: 'A. I. Virtanen',
      option_b: 'Ragnar Granit',
      option_c: 'Bengt Holmström',
      option_d: 'Johan Gadolin',
      correct_answer: 'A',
      difficulty: 'hard',
      category: 'Tiede',
      hint: 'Keksinnön nimikirjaimet tulevat suoraan hänen nimestään.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mikä on Suomen kansallispuu?',
      option_a: 'Mänty',
      option_b: 'Kuusi',
      option_c: 'Rauduskoivu',
      option_d: 'Haapa',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Luonto',
      hint: 'Tämä lehtipuu tunnetaan valkoisesta tuohirungostaan.',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuka kirjoitti kansallisromaanin "Seitsemän veljestä"?',
      option_a: 'J. L. Runeberg',
      option_b: 'Aleksis Kivi',
      option_c: 'Mika Waltari',
      option_d: 'Väinö Linna',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Kulttuuri',
      hint: 'Hänen syntymäpäivänsä 10. lokakuuta on suomalaisen kirjallisuuden päivä.',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuka loi rakastetut Muumit?',
      option_a: 'Astrid Lindgren',
      option_b: 'Mauri Kunnas',
      option_c: 'Kirsi Kunnas',
      option_d: 'Tove Jansson',
      correct_answer: 'D',
      difficulty: 'easy',
      category: 'Kulttuuri',
      hint: 'Hän asui ja maalasi pitkään Klovharun saarella.',
      mode: 'trivia'
    },
    {
      question_fi: 'Minä vuonna Lordi voitti Euroviisut kappaleella "Hard Rock Hallelujah"?',
      option_a: '2004',
      option_b: '2006',
      option_c: '2007',
      option_d: '2008',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Viihde',
      hint: 'Kilpailu pidettiin Ateenassa Kreikassa.',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuinka monta olympiakultaa kestävyysjuoksija Paavo Nurmi voitti urallaan?',
      option_a: '7',
      option_b: '8',
      option_c: '9',
      option_d: '12',
      correct_answer: 'C',
      difficulty: 'hard',
      category: 'Urheilu',
      hint: '"Lentävä suomalainen" voitti 9 kultaa ja 3 hopeaa.',
      mode: 'trivia'
    },
    {
      question_fi: 'Kuka suomalainen F1-kuljettaja voitti maailmanmestaruuden Ferrarilla vuonna 2007?',
      option_a: 'Mika Häkkinen',
      option_b: 'Kimi Räikkönen',
      option_c: 'Valtteri Bottas',
      option_d: 'Keke Rosberg',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Urheilu',
      hint: 'Hänet tunnetaan lempinimellä "The Iceman".',
      mode: 'trivia'
    },
    {
      question_fi: 'Missä kaupungissa SM-liigajoukkue Tappara pelaa kotiottelunsa?',
      option_a: 'Helsinki',
      option_b: 'Turku',
      option_c: 'Tampere',
      option_d: 'Oulu',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Urheilu',
      hint: 'He pelaavat Nokia Arenalla.',
      mode: 'trivia'
    },
    {
      question_fi: 'Mitä tarkoittaa chat-termi "Kappa"?',
      option_a: 'Peukku ylös',
      option_b: 'Häviö pelissä',
      option_c: 'Sarkasmia ja ironiaa osoittava emote',
      option_d: 'Uusi seuraaja',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Striimikulttuuri',
      hint: 'Yksi maailman tunnetuimmista mustavalkoisista kasvot-emotesta.',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'Mitä "PogChamp" tai "POG" tarkoittaa chatissa?',
      option_a: 'Tylsää tai noloa hetkeä',
      option_b: 'Suurta innostusta, hypeä tai upeaa suoritusta',
      option_c: 'Pelin lopettamista',
      option_d: 'Musiikin vaihtoa',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Striimikulttuuri',
      hint: 'Käytetään kun striimissä tapahtuu jotain uskomatonta!',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'Mitä pelikeskustelussa ja chatissa tarkoittaa kirjain "W"?',
      option_a: 'Varoitus (Warning)',
      option_b: 'Voitto / onnistuminen (Win)',
      option_c: 'Miksi (Why)',
      option_d: 'Odotus (Wait)',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Striimikulttuuri',
      hint: 'Vastakohta on "L" (Loss).',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'Mitä "GG" tarkoittaa ottelun päätyttyä moninpelissä tai chatissa?',
      option_a: 'Good Game (Hyvä peli)',
      option_b: 'Get Good (Opi pelaamaan)',
      option_c: 'Going Going (Lähden pois)',
      option_d: 'Great Guy (Hieno tyyppi)',
      correct_answer: 'A',
      difficulty: 'easy',
      category: 'Striimikulttuuri',
      hint: 'Kohtelias urheiluhenkinen ele pelin päättyessä.',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'Mitä ilmaus "no cap" tarkoittaa modernissa nettislangissa?',
      option_a: 'Ei lippalakkia',
      option_b: 'Totta / Ei valhetta (totta puhuen)',
      option_c: 'Ei rajoitusta striimille',
      option_d: 'Lopeta chattiin kirjoittaminen',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Striimikulttuuri',
      hint: 'Slangissa "cap" tarkoittaa valhetta tai liioittelua.',
      mode: 'chat_quotes'
    }
  ],

  en: [
    {
      question_fi: 'What is the capital city of Australia?',
      option_a: 'Sydney',
      option_b: 'Melbourne',
      option_c: 'Canberra',
      option_d: 'Brisbane',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'Geography',
      hint: 'It is a planned city purpose-built as the federal capital.',
      mode: 'trivia'
    },
    {
      question_fi: 'Which chemical element has the symbol "Au" on the periodic table?',
      option_a: 'Silver',
      option_b: 'Gold',
      option_c: 'Copper',
      option_d: 'Platinum',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Science',
      hint: 'The symbol comes from its Latin name "Aurum".',
      mode: 'trivia'
    },
    {
      question_fi: 'In what year did the Titanic sink in the North Atlantic?',
      option_a: '1905',
      option_b: '1912',
      option_c: '1918',
      option_d: '1923',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'History',
      hint: 'It occurred in April during its maiden voyage from Southampton.',
      mode: 'trivia'
    },
    {
      question_fi: 'Who directed the 1994 cinematic masterpiece "Pulp Fiction"?',
      option_a: 'Steven Spielberg',
      option_b: 'Martin Scorsese',
      option_c: 'Quentin Tarantino',
      option_d: 'Christopher Nolan',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Movies',
      hint: 'He also directed Reservoir Dogs and Kill Bill.',
      mode: 'trivia'
    },
    {
      question_fi: 'What is the largest planet in our Solar System?',
      option_a: 'Saturn',
      option_b: 'Neptune',
      option_c: 'Jupiter',
      option_d: 'Uranus',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Science',
      hint: 'It features a famous Great Red Spot storm.',
      mode: 'trivia'
    },
    {
      question_fi: 'How many keys does a standard full-size acoustic piano have?',
      option_a: '76',
      option_b: '84',
      option_c: '88',
      option_d: '92',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'Music',
      hint: 'It includes 52 white keys and 36 black keys.',
      mode: 'trivia'
    },
    {
      question_fi: 'Which video game franchise features the Master Chief as its main protagonist?',
      option_a: 'Destiny',
      option_b: 'Gears of War',
      option_c: 'Halo',
      option_d: 'Call of Duty',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Gaming',
      hint: 'It was originally developed by Bungie for the original Xbox.',
      mode: 'trivia'
    },
    {
      question_fi: 'What is the highest mountain peak in the world above sea level?',
      option_a: 'K2',
      option_b: 'Kangchenjunga',
      option_c: 'Mount Everest',
      option_d: 'Mount Kilimanjaro',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Geography',
      hint: 'It stands 8,848 meters tall in the Himalayas.',
      mode: 'trivia'
    },
    {
      question_fi: 'Who invented the World Wide Web in 1989 while working at CERN?',
      option_a: 'Steve Jobs',
      option_b: 'Tim Berners-Lee',
      option_c: 'Bill Gates',
      option_d: 'Alan Turing',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'Technology',
      hint: 'He is an English computer scientist who also proposed HTML and HTTP.',
      mode: 'trivia'
    },
    {
      question_fi: 'What is the hardest natural substance on Earth?',
      option_a: 'Titanium',
      option_b: 'Tungsten',
      option_c: 'Diamond',
      option_d: 'Graphene',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Science',
      hint: 'It scores 10 on the Mohs scale of mineral hardness.',
      mode: 'trivia'
    },
    {
      question_fi: 'Which country won the FIFA Men\'s World Cup in 2022 in Qatar?',
      option_a: 'France',
      option_b: 'Brazil',
      option_c: 'Argentina',
      option_d: 'Germany',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Sports',
      hint: 'Lionel Messi captained the championship team.',
      mode: 'trivia'
    },
    {
      question_fi: 'In streaming and gaming culture, what does "AFK" stand for?',
      option_a: 'Always Fighting Kings',
      option_b: 'Away From Keyboard',
      option_c: 'All For Kicks',
      option_d: 'Action Fast Kill',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'Stream Culture',
      hint: 'Used when stepping away from the computer temporarily.',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'What does "Pog" or "Poggers" express in live stream chats?',
      option_a: 'Boredom or fatigue',
      option_b: 'Disappointment',
      option_c: 'Extreme excitement and hype',
      option_d: 'Angry frustration',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Stream Culture',
      hint: 'Spammed whenever an epic gamer play occurs!',
      mode: 'chat_quotes'
    },
    {
      question_fi: 'What popular sandbox game created by Mojang is the best-selling video game in history?',
      option_a: 'Tetris',
      option_b: 'Grand Theft Auto V',
      option_c: 'Minecraft',
      option_d: 'Wii Sports',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Gaming',
      hint: 'You mine blocks, craft tools, and avoid Creepers.',
      mode: 'trivia'
    },
    {
      question_fi: 'Which streaming platform launched in late 2022 featuring a 95/5 subscription revenue split?',
      option_a: 'Twitch',
      option_b: 'YouTube Gaming',
      option_c: 'Kick',
      option_d: 'Mixer',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'Stream Culture',
      hint: 'Its signature color is bright green.',
      mode: 'chat_quotes'
    }
  ]
};

function getLocalQuestions(lang = 'fi', mode = 'trivia', count = 10) {
  const bank = QUESTION_BANK[lang] || QUESTION_BANK.fi;
  const filtered = bank.filter(q => mode === 'all' || q.mode === mode || !q.mode);
  const shuffled = [...(filtered.length >= count ? filtered : bank)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Fetch fresh questions from Open Trivia DB (English)
 */
async function fetchOpenTriviaDB(count = 10, difficulty = '') {
  try {
    let url = `https://opentdb.com/api.php?amount=${count}&type=multiple`;
    if (['easy','medium','hard'].includes(difficulty)) url += `&difficulty=${difficulty}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      return data.results.map(item => {
        const letters = ['A','B','C','D'];
        const allOpts = [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5);
        const correctIndex = allOpts.indexOf(item.correct_answer);

        return {
          question_fi: decodeHTMLEntities(item.question),
          option_a: decodeHTMLEntities(allOpts[0]),
          option_b: decodeHTMLEntities(allOpts[1]),
          option_c: decodeHTMLEntities(allOpts[2]),
          option_d: decodeHTMLEntities(allOpts[3]),
          correct_answer: letters[correctIndex],
          difficulty: item.difficulty,
          category: decodeHTMLEntities(item.category),
          hint: `Category: ${decodeHTMLEntities(item.category)}`,
          mode: 'trivia'
        };
      });
    }
  } catch (err) {
    console.warn('[Questions] Open Trivia DB fetch failed, falling back to local bank:', err.message);
  }
  return getLocalQuestions('en', 'trivia', count);
}

function decodeHTMLEntities(text) {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}


// ---------------------------------------------------------------------------
// Real Twitch Channel Chat Quotes ("Kuka sen sanoi?" / "Who said it?")
// ---------------------------------------------------------------------------

const EMBEDDED_OMAQUU_QUOTES = {
  "chatters": [
    "ilaris",
    "Wiba",
    "AggreKani",
    "Lube_Fiasco",
    "OfficialPappaPelaa",
    "pepezzion",
    "beat_that_beaver",
    "kovalaki",
    "hcBakeman",
    "jimppab",
    "jenska007",
    "Inter1tum",
    "tuskatappaja_",
    "BurggaBallo",
    "Idadaada",
    "Haltron",
    "Poopladle",
    "KoskelainenM",
    "kerosiini_",
    "taxfree_",
    "proton_fig",
    "JasKaKo1",
    "FoulCreature",
    "officialsmythj",
    "Polttiz",
    "asentomies69",
    "officialseppo89",
    "diego_jokla666",
    "PeteOx",
    "kulluh_",
    "LiukasValas_",
    "skipxi",
    "KuV4J4",
    "turb0mummo",
    "1mrnostalgia"
  ],
  "messages": [
    {
      "author": "kerosiini_",
      "text": "KOCCA K-Contents: Gaming 11.30 expo stagella",
      "sentAt": "2026-08-01T08:20:21.783Z"
    },
    {
      "author": "hcBakeman",
      "text": "Missä ne minihameiset animetytyt on? omaquuNuolija",
      "sentAt": "2026-08-01T08:41:56.353Z"
    },
    {
      "author": "Wiba",
      "text": "Joo nyt alko särisee taas",
      "sentAt": "2026-08-01T08:46:36.746Z"
    },
    {
      "author": "FoulCreature",
      "text": "Ääni ja kuvaa tulee ihan eri aikaan?",
      "sentAt": "2026-08-01T09:10:45.063Z"
    },
    {
      "author": "diego_jokla666",
      "text": "Mäkin tuun kohta sinne",
      "sentAt": "2026-08-01T09:58:16.293Z"
    },
    {
      "author": "diego_jokla666",
      "text": "Mä oon vähän 2 jälkeen siel",
      "sentAt": "2026-08-01T10:00:47.634Z"
    },
    {
      "author": "Polttiz",
      "text": "onko jenskaa tai haltronia näkyny?",
      "sentAt": "2026-08-01T10:05:03.199Z"
    },
    {
      "author": "FoulCreature",
      "text": "Ja eks eile tehny niitä punnerruksiaki?",
      "sentAt": "2026-08-01T10:05:43.069Z"
    },
    {
      "author": "FoulCreature",
      "text": "Ei oo sanonu ja sit ne animetytyt yhtäkkiä sattumalta tuliki?",
      "sentAt": "2026-08-01T10:16:33.075Z"
    },
    {
      "author": "hcBakeman",
      "text": "Sil ekal tähä mennessä",
      "sentAt": "2026-08-01T10:28:24.683Z"
    },
    {
      "author": "tuskatappaja_",
      "text": "bake on ihan muna pystyssä mitä marsipaania on käytetty asuihin",
      "sentAt": "2026-08-01T10:36:04.797Z"
    },
    {
      "author": "tuskatappaja_",
      "text": "hitto kun joudutaan katsomaan kun oma koittaa saada housujen napit kiinni",
      "sentAt": "2026-08-01T10:39:26.581Z"
    },
    {
      "author": "PeteOx",
      "text": "jo mennee laneilla huonosti ku joutuu tämmöstä animu kakkaa sekottaa",
      "sentAt": "2026-08-01T10:45:00.931Z"
    },
    {
      "author": "Nasibihc",
      "text": "Pikkupojat pelailee cs:ää ja kattellaa pelivideoita.",
      "sentAt": "2026-08-01T11:20:22.053Z"
    },
    {
      "author": "Polttiz",
      "text": "Eikö siikaa ole huudettu jo joku 10 vuotta",
      "sentAt": "2026-08-01T11:23:40.477Z"
    },
    {
      "author": "mikk3lson",
      "text": "Mitäs assyille kuuluu? Onko ollu hyvä tapahtuma?",
      "sentAt": "2026-08-01T11:34:29.833Z"
    },
    {
      "author": "Bartfasti",
      "text": "jaa ei taida olla pikkurahasta kiinni ku käydään k-kaupassa",
      "sentAt": "2026-08-01T11:51:38.929Z"
    },
    {
      "author": "diego_jokla666",
      "text": "Sä oot väärällä puolella",
      "sentAt": "2026-08-01T12:00:29.456Z"
    },
    {
      "author": "diego_jokla666",
      "text": "Mä oon toisella puolella messukeskusts",
      "sentAt": "2026-08-01T12:01:04.262Z"
    },
    {
      "author": "tuskatappaja_",
      "text": "onko täällä ketään söpöjä paikalla",
      "sentAt": "2026-08-01T12:02:48.085Z"
    },
    {
      "author": "tuskatappaja_",
      "text": "minne takas me menää",
      "sentAt": "2026-08-01T12:03:18.887Z"
    },
    {
      "author": "Bartfasti",
      "text": "liian helppo, laske of kontsaajat",
      "sentAt": "2026-08-01T12:10:27.766Z"
    },
    {
      "author": "Bartfasti",
      "text": "miten niin et kehtaa",
      "sentAt": "2026-08-01T12:11:04.685Z"
    },
    {
      "author": "Bartfasti",
      "text": "tuolla on varmasti of, käy kysyy",
      "sentAt": "2026-08-01T12:13:02.688Z"
    },
    {
      "author": "Lube_Fiasco",
      "text": "solid snake oli paras",
      "sentAt": "2026-08-01T12:17:21.188Z"
    },
    {
      "author": "FoulCreature",
      "text": "Muista siitä koodista kysyä",
      "sentAt": "2026-08-01T13:10:56.568Z"
    },
    {
      "author": "kovalaki",
      "text": "Joko sä hait sinne BB taloon?",
      "sentAt": "2026-08-07T12:56:18.135Z"
    },
    {
      "author": "kovalaki",
      "text": "sun pitää tehdä se esittely video",
      "sentAt": "2026-08-07T12:56:48.033Z"
    },
    {
      "author": "BurggaBallo",
      "text": "Moi lurjus nro 2",
      "sentAt": "2026-08-07T13:05:04.230Z"
    },
    {
      "author": "officialsmythj",
      "text": "Tee se hahmo ja pelaa se tutoriali",
      "sentAt": "2026-08-07T13:08:35.800Z"
    },
    {
      "author": "officialsmythj",
      "text": "pelaat tota sorsaa ni sua pannaan vasemmalt ja oikeelt",
      "sentAt": "2026-08-07T13:10:19.949Z"
    },
    {
      "author": "officialsmythj",
      "text": "seeriki o kova kyl",
      "sentAt": "2026-08-07T13:11:24.463Z"
    },
    {
      "author": "beat_that_beaver",
      "text": "Mikäs tää peli o",
      "sentAt": "2026-08-07T13:21:47.345Z"
    },
    {
      "author": "officialsmythj",
      "text": "ni opit revaa ittes hehe",
      "sentAt": "2026-08-07T13:44:33.795Z"
    },
    {
      "author": "jenska007",
      "text": "Olin töissä ja kävin tilaa uuden pyykkikoneen",
      "sentAt": "2026-08-07T13:48:10.922Z"
    },
    {
      "author": "jenska007",
      "text": "En tiiä tuleeko siitä mitään kun viikko ollut vastaamatta viestiin",
      "sentAt": "2026-08-07T13:53:46.918Z"
    },
    {
      "author": "beat_that_beaver",
      "text": "Kovaa peliä aamuun asti Kappa",
      "sentAt": "2026-08-07T14:26:04.087Z"
    },
    {
      "author": "Lube_Fiasco",
      "text": "ostin doom bundlen tänään steamistä",
      "sentAt": "2026-08-07T14:30:03.752Z"
    },
    {
      "author": "beat_that_beaver",
      "text": "Elä laita kaljarahoja peliin Kappa",
      "sentAt": "2026-08-07T15:01:29.487Z"
    },
    {
      "author": "beat_that_beaver",
      "text": "Aa en mä tiiä ku katoin et olivat vasta lisänneet 3 seasonii tonne ja yleensä tekevät ku tulee uus",
      "sentAt": "2026-08-07T15:08:40.409Z"
    },
    {
      "author": "jenska007",
      "text": "Tästä sen huomaa että miehet juoksee karkuun",
      "sentAt": "2026-08-07T15:09:02.268Z"
    },
    {
      "author": "jenska007",
      "text": "@beat_that_beaver Ei ole ensimmäinen kerta",
      "sentAt": "2026-08-07T15:12:26.487Z"
    },
    {
      "author": "1mrnostalgia",
      "text": "Onko ollu hyvä peli",
      "sentAt": "2026-08-07T15:48:40.254Z"
    },
    {
      "author": "1mrnostalgia",
      "text": "Kattelin tätä itekin et vois pelailla joku kerta ja sit sitä beast of reincarnation pelii",
      "sentAt": "2026-08-07T15:49:18.166Z"
    },
    {
      "author": "1mrnostalgia",
      "text": "Oi täs on crossplay pitääpä kysyy systeriltä jos tulis pelaa tätä mun kans",
      "sentAt": "2026-08-07T15:58:05.887Z"
    },
    {
      "author": "1mrnostalgia",
      "text": "Juu mulla on game pass koko ajan",
      "sentAt": "2026-08-07T16:05:04.559Z"
    },
    {
      "author": "jimppab",
      "text": "Gothic 1 remake edelleen",
      "sentAt": "2026-08-07T16:30:03.687Z"
    },
    {
      "author": "BurggaBallo",
      "text": "Minkä ikäinen poika sul olikaan",
      "sentAt": "2026-08-07T16:38:09.998Z"
    },
    {
      "author": "Wiba",
      "text": "Sun ääni on muute paljon hiljasemmalla ku muiden",
      "sentAt": "2026-08-07T16:49:47.502Z"
    },
    {
      "author": "Wiba",
      "text": "ja peliäänet kaikkein kovimmalla",
      "sentAt": "2026-08-07T16:49:55.131Z"
    },
    {
      "author": "Wiba",
      "text": "Kyl sitä joku 5x per boss vähintää",
      "sentAt": "2026-08-07T17:14:06.639Z"
    },
    {
      "author": "JasKaKo1",
      "text": "Relax, viikko mökillä ilman masiinaa, hiljentää kenet vain.",
      "sentAt": "2026-08-07T17:24:56.461Z"
    },
    {
      "author": "JasKaKo1",
      "text": "Ja , tekijä voi myös kutoa pilkkihanskat.",
      "sentAt": "2026-08-07T17:33:31.220Z"
    },
    {
      "author": "asentomies69",
      "text": "miten on teillä toiminnu tää peli kun itellä lagaillu pahasti?",
      "sentAt": "2026-08-07T17:37:57.448Z"
    },
    {
      "author": "JasKaKo1",
      "text": "Onkos QUU vähän modifioinut omaa pelistudiota?",
      "sentAt": "2026-08-07T17:40:15.980Z"
    },
    {
      "author": "JasKaKo1",
      "text": "Lähen kattoo hunttia. Käyn taas näytillä joku päivä.",
      "sentAt": "2026-08-07T17:46:14.185Z"
    },
    {
      "author": "hcBakeman",
      "text": "Ai pro pelaaja tullu clutchaa sua",
      "sentAt": "2026-08-07T18:49:44.361Z"
    },
    {
      "author": "hcBakeman",
      "text": "Vadelmaa toinen pullo ja toinen punaviinimarjaa",
      "sentAt": "2026-08-07T18:51:38.987Z"
    },
    {
      "author": "mikk3lson",
      "text": "Mitäs videoita oot.ehtiny jo kattoa?",
      "sentAt": "2026-08-07T20:26:32.949Z"
    },
    {
      "author": "mikk3lson",
      "text": "Juu vähän huitelee tuo äänentaso",
      "sentAt": "2026-08-07T20:29:05.575Z"
    },
    {
      "author": "mikk3lson",
      "text": "Elämä pyörii aika lailla 5kk koiranpennun ympärillä ku ei se osaa olla yksin kovin kauaa",
      "sentAt": "2026-08-07T20:31:54.286Z"
    },
    {
      "author": "Lube_Fiasco",
      "text": "ootko taas pannu koko yön ku ihan poikki",
      "sentAt": "2026-08-09T06:07:19.441Z"
    },
    {
      "author": "kerosiini_",
      "text": "huomenta, piti tulla tänne ku wibaa alko väsyttää ja se feidas meidät omaquuPjam",
      "sentAt": "2026-08-09T06:29:51.901Z"
    },
    {
      "author": "Lube_Fiasco",
      "text": "pelatkaa see uus halo kaksinpelinä",
      "sentAt": "2026-08-09T06:31:17.641Z"
    },
    {
      "author": "kerosiini_",
      "text": "wiba lupas että se alkaa pelaa meille pornopelejä Kappa",
      "sentAt": "2026-08-09T06:34:11.305Z"
    },
    {
      "author": "kerosiini_",
      "text": "me innostuttiin tossa kaverin kanssa hakkaa remnant 2m se on kyl ollu ihan superhauskaa kimpassa",
      "sentAt": "2026-08-09T06:35:53.008Z"
    },
    {
      "author": "Haltron",
      "text": "Lahden oma Heihatchi Wiba :P",
      "sentAt": "2026-08-09T06:53:55.789Z"
    },
    {
      "author": "Haltron",
      "text": "voinko linkata mitä löysin tohon heihachiin liittyen, ois kyl hyvä sijoitus :D",
      "sentAt": "2026-08-09T06:59:46.248Z"
    },
    {
      "author": "Haltron",
      "text": "aina sama eri striimeis KEKW",
      "sentAt": "2026-08-09T07:01:14.873Z"
    },
    {
      "author": "KoskelainenM",
      "text": "kanat on syönny suklaata, not, erimerkkisia kanoja kuin ne valkoset",
      "sentAt": "2026-08-09T08:19:18.302Z"
    },
    {
      "author": "KoskelainenM",
      "text": "mitäs juontaja mieltä oliks se poliisien kiilaus tapon yritys vai normaalia poliisitoimintaa?",
      "sentAt": "2026-08-09T08:26:54.040Z"
    },
    {
      "author": "KoskelainenM",
      "text": "katoitko sen kypärä videon?",
      "sentAt": "2026-08-09T08:27:45.396Z"
    },
    {
      "author": "KoskelainenM",
      "text": "sini vilkku oli, ei punasta",
      "sentAt": "2026-08-09T08:36:48.051Z"
    },
    {
      "author": "Poopladle",
      "text": "Mistäs päin tää tämmöne on?",
      "sentAt": "2026-08-09T08:54:50.083Z"
    },
    {
      "author": "kovalaki",
      "text": "laitettiin kuristukset päälle, että testiajossa ei enää kulje",
      "sentAt": "2026-08-09T09:07:25.710Z"
    },
    {
      "author": "kovalaki",
      "text": "se oli henki siinä",
      "sentAt": "2026-08-09T09:09:04.424Z"
    },
    {
      "author": "Poopladle",
      "text": "Aa siis sä sitä mienaat",
      "sentAt": "2026-08-09T09:24:33.552Z"
    },
    {
      "author": "Poopladle",
      "text": "Sekopäät \"vahtimassa\" vielä enemmän sekasin olevia ukkeleita, ei ikinä tonne",
      "sentAt": "2026-08-09T09:35:12.160Z"
    },
    {
      "author": "Poopladle",
      "text": "Salakuljettamalla mä veikkaisin. Kontin kylkeen temun tarra ja siellä saa olla mitä vaan sisällä :D",
      "sentAt": "2026-08-09T09:37:26.510Z"
    },
    {
      "author": "KuV4J4",
      "text": "taitaa torakat olla ensimmäiset mitkä tollaseen läävään ilmestyy",
      "sentAt": "2026-08-09T14:27:30.191Z"
    }
  ]
};

/**
 * Format raw chat messages and chatters into multiple-choice quiz questions
 */
function parseAndGenerateQuotes(chatData, channel = 'omaquu', count = 10) {
  const normChannel = (channel || 'omaquu').toLowerCase().replace('#', '').trim() || 'omaquu';
  if (!chatData) return [];

  // Gather unique chatters
  const chatterSet = new Set();
  if (Array.isArray(chatData.chatters)) {
    chatData.chatters.forEach(c => {
      const name = typeof c === 'string' ? c : (c.displayName || c.login);
      if (name) chatterSet.add(name);
    });
  }
  if (Array.isArray(chatData.messages)) {
    chatData.messages.forEach(m => {
      const name = m.author || m.displayName || m.login;
      if (name) chatterSet.add(name);
    });
  }
  const allChatters = Array.from(chatterSet);

  // Filter messages suitable for a quiz question
  const validMessages = (chatData.messages || []).filter(m => {
    if (!m.text) return false;
    const t = m.text.trim();
    if (t.length < 8 || t.length > 130) return false;
    if (/^[!#?]/.test(t)) return false; // commands like !sr, !rank, !points
    if (/^(A|B|C|D|1|2|3|4)$/i.test(t)) return false; // single letter voting spam
    const author = m.author || m.displayName || m.login;
    if (!author) return false;
    if (t.toLowerCase().includes(author.toLowerCase())) return false; // don't spoil author name
    return true;
  });

  if (validMessages.length === 0) return [];

  const shuffled = [...validMessages].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const msg = shuffled[i];
    const author = msg.author || msg.displayName || msg.login;

    // Pick 3 decoy chatters distinct from author
    const decoys = allChatters
      .filter(c => c.toLowerCase() !== author.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    while (decoys.length < 3) {
      decoys.push(`Chattaaja_${decoys.length + 1}`);
    }

    const options = [author, ...decoys].sort(() => Math.random() - 0.5);
    const letters = ['A', 'B', 'C', 'D'];
    const correctLetter = letters[options.indexOf(author)];

    let hint = 'Twitch-chatin viesti';
    if (msg.sentAt) {
      try {
        const d = new Date(msg.sentAt);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        hint = `Lähetetty chatissa ${day}.${month}. klo ${hours}:${mins}`;
      } catch {}
    }

    questions.push({
      question_fi: `"${msg.text.trim()}"`,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_answer: correctLetter,
      difficulty: 'medium',
      category: `Kuka sen sanoi? · #${normChannel}`,
      hint,
      mode: 'chat_quotes'
    });
  }

  return questions;
}

/**
 * Fetch channel quotes from backend API, static files, samppalandia, or embedded fallback
 */
async function fetchChannelQuotes(channel = 'omaquu', count = 10) {
  const normChannel = (channel || 'omaquu').toLowerCase().replace('#', '').trim() || 'omaquu';

  // 1. Try local/backend API if running
  try {
    const r = await fetch(`api/channel-quotes/${encodeURIComponent(normChannel)}?count=${count}`);
    if (r.ok) {
      const data = await r.json();
      if (data && data.questions && data.questions.length > 0) {
        console.log(`[Quotes] Received ${data.questions.length} quotes from backend API for #${normChannel}`);
        return data.questions;
      }
    }
  } catch {}

  // 2. Try static JSON files (works on GitHub Pages and local servers)
  const pathsToTry = [
    `data/quotes_${normChannel}.json`,
    `data/quotes_omaquu.json`,
    `./data/quotes_${normChannel}.json`,
    `./data/quotes_omaquu.json`
  ];
  for (const p of pathsToTry) {
    try {
      const r = await fetch(p);
      if (r.ok) {
        const data = await r.json();
        if (data && data.messages && data.messages.length > 0) {
          console.log(`[Quotes] Loaded quotes from static file ${p}`);
          const questions = parseAndGenerateQuotes(data, normChannel, count);
          if (questions.length > 0) return questions;
        }
      }
    } catch {}
  }

  // 3. Try direct samppalandia.wtf API (if CORS allowed)
  try {
    const r = await fetch(`https://samppalandia.wtf/kukasano/api/messages.php?channel=${encodeURIComponent(normChannel)}&mode=kuka`);
    if (r.ok) {
      const data = await r.json();
      if (data && data.messages && data.messages.length > 0) {
        console.log(`[Quotes] Loaded live quotes from samppalandia API for #${normChannel}`);
        const questions = parseAndGenerateQuotes(data, normChannel, count);
        if (questions.length > 0) return questions;
      }
    }
  } catch {}

  // 4. Fallback to embedded quotes bank
  console.log(`[Quotes] Using embedded quotes bank for #${normChannel}`);
  return parseAndGenerateQuotes(EMBEDDED_OMAQUU_QUOTES, normChannel, count);
}

window.getQuizQuestions = async function(lang = 'fi', mode = 'chat_quotes', count = 10, difficulty = '', channel = '') {
  const targetChannel = (channel || localStorage.getItem('mp_twitch_channel') || 'omaquu').toLowerCase().replace('#', '').trim();

  // If chat_quotes mode or if channel quotes requested
  if (mode === 'chat_quotes' || mode === 'quotes') {
    try {
      const quotes = await fetchChannelQuotes(targetChannel, count);
      if (quotes && quotes.length > 0) return quotes;
    } catch (err) {
      console.warn('[Questions] Failed to fetch channel quotes:', err);
    }
  }

  if (lang === 'en' && Math.random() < 0.6) {
    // Try Open Trivia DB for dynamic English questions, fallback to local
    return await fetchOpenTriviaDB(count, difficulty);
  }
  return getLocalQuestions(lang, mode, count);
};
