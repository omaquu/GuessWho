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

window.getQuizQuestions = async function(lang = 'fi', mode = 'trivia', count = 10, difficulty = '') {
  if (lang === 'en' && Math.random() < 0.6) {
    // Try Open Trivia DB for dynamic English questions, fallback to local
    return await fetchOpenTriviaDB(count, difficulty);
  }
  return getLocalQuestions(lang, mode, count);
};
