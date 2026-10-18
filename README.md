# 🎯 Kuka haluaa miljonääriksi? / Who Wants to Be a Millionaire?
### 🌟 Live Kick & Twitch Chat Trivia Game

> **🌐 Live Demo (GitHub Pages):** [https://omaquu.github.io/GuessWho/](https://omaquu.github.io/GuessWho/)  
> **🏆 Tulostaulukko / Leaderboard:** [https://omaquu.github.io/GuessWho/leaderboard.html](https://omaquu.github.io/GuessWho/leaderboard.html)

Interaktiivinen ja moderni TV-tietovisapeli livestriimeihin ja selaimeen. Peli tukee reaaliaikaista **Kick-** ja **Twitch-chat** -äänestystä, leaderboardia, aitoja oljenkorsia, jännittävää TV-studiomusiikkia ja moninpeliä.

Toimii suoraan **GitHub Pagesissa ilman palvelinta** (Standalone Mode) tai **omalla Node.js/Docker-palvelimella**.

---

## 🌟 Ominaisuudet / Features

- 🌐 **Kaksikielinen / Bilingual (FI / EN)**:
  - Vaihda kieli yläpalkista milloin tahansa (🇫🇮 Suomi / 🇬🇧 English).
  - Kaikki tekstit, kysymykset ja selitteet kääntyvät saumattomasti.
  - Englanninkieliset kysymykset voidaan hakea suoraan myös **Open Trivia DB** -rajapinnasta!
- 📺 **TV-studioteema**:
  - Tumma ja näyttävä visualisointi liikkuvilla valokeiloilla.
  - Anton & Rubik -fontit, neon-LED-paneelit ja klassiset timanttivaihtoehdot.
  - Klassinen 15-portainen voittotikas (Money Ladder 100 € – 1 000 000 €).
- 💬 **Kick- & Twitch-chatti-integraatio**:
  - Chattilaiset äänestävät suoraan kirjoittamalla chattiin `A`, `B`, `C` tai `D` (tai `!A`, `!B`, `!C`, `!D`).
  - Tukee Kick-kanavanimen automaattista hakua ilman manuaalisia tunnuksia.
  - Twitch IRC -yhteys toimii anonyymisti ja viiveettömästi.
  - Toimii jopa suoraan selaimesta käsin (GitHub Pages) WebSocket-yhteyksillä!
- 👥 **Moninpeli & Leaderboard**:
  - Chattilaiset kilpailevat keskenään ja keräävät pisteitä.
  - Reaaliaikainen tulostaulukko pelin aikana sekä pysyvä globaali tulostaulukko (Kaikki ajat, Tämä viikko, Tämä kuukausi).
  - Palkintopallinäkymä (Top 3 kulta, hopea, pronssi) ja tarkkuusprosentit.
  - GitHub Pagesissa tulokset tallentuvat selaimeen (`localStorage`), Node.js-tilassa SQLite-tietokantaan.
- 💡 **4 Aitoa Oljenkortta**:
  1. ❌ **50:50 (Poista 2 väärää vastausta)**: Jättää jäljelle oikean ja yhden satunnaisen väärän vaihtoehdon.
  2. ⏱️ **Lisää aikaa (+30s)**: Antaa lisäaikaa miettiä tai äänestää.
  3. 💡 **Lisävihje**: Paljastaa kysymykseen liittyvän lisävihjeen.
  4. 👥 **Kysy yleisöltä / chatilta**: Näyttää chatin äänestysprosentit reaaliaikaisena pylväsdiagrammina.
- 🎵 **Jännittävä kilpailumusiikki**:
  - "Haluatko miljonääriksi" -tyylinen matala analoginen bassodrone, sydämenlyönnit (60 BPM), sekuntikellon tikitys ja nousevat jännityssoinnut.
  - Ääniefektit kysymyksen aloitukselle (gong), oikealle vastaukselle (fanfaari), väärälle vastaukselle (dramaattinen pudotus) ja oljenkorsille.
  - Sisäänrakennettu äänenvoimakkuuden säädin ja mykistyspainike.
- ⚙️ **Monipuoliset asetukset**:
  - Säädettävä kysymysmäärä ja äänestysaika (esim. 30s chatille ennen vastausta).
  - Pelitilat: Yleistieto, Striimikulttuuri, Open Trivia DB.

---

## 🚀 Käyttöönotto GitHub Pagesissa (Ilmainen & nopea)

Tämä repositorio on valmis toimimaan **suoraan GitHub Pagesissa**:

1. Avaa GitHubissa reposti asetukset: `https://github.com/omaquu/GuessWho/settings/pages`
2. Valitse **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`, kansioksi `/ (root)`
3. Klikkaa **Save**.
4. Sivu on hetken kuluttua auki osoitteessa:  
   👉 **`https://omaquu.github.io/GuessWho/`**

---

## 💻 Paikallinen ajo & Palvelinasennus (Node.js)

Jos haluat käyttää omaa palvelinta (esim. Proxmox, VPS tai oma tietokone):

### Vaatimukset:
- **Node.js 22+** (tai 24)

### 1. Asenna ja käynnistä:
```bash
# Asenna riippuvuudet
npm install

# Generoi taustamusiikki (jos tarpeen)
node scripts/generate_music.js

# Käynnistä palvelin
npm start
```

### 2. Avaa selaimessa:
- 🎮 **Pelisivu**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Isännän hallintapaneeli**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- 🏆 **Tulostaulukko**: [http://localhost:3000/leaderboard.html](http://localhost:3000/leaderboard.html)

---

## 🐳 Docker / Proxmox CT

Käynnistä koko palvelu taustalle yhdellä komennolla:

```bash
docker compose up -d --build
```

Peli käynnistyy porttiin `3000`.

---

## 🎮 Pelin kulku livestriimissä

1. Avaa peli osoitteessa `https://omaquu.github.io/GuessWho/` (tai oma palvelimesi).
2. Avaa **Asetukset ⚙️** -nappi ylhäältä ja syötä Twitch- ja/tai Kick-kanavasi nimi.
3. Valitse kieli (FI/EN), kysymysten määrä ja äänestysaika.
4. Klikkaa **Aloita peli 🎮**:
   - Chattilaisilla on asetettu aika (esim. 30s) äänestää kirjoittamalla chattiin A, B, C tai D.
   - Äänet päivittyvät ruudulle reaaliajassa.
   - Isäntä tai pelaaja voi käyttää oljenkorsia (50:50, lisäaika, vihje, kysy yleisöltä).
   - Oikea vastaus paljastetaan dramaattisen animaation ja ääniefektien kera!
   - Chattilaisten pisteet päivittyvät leaderboardille.

---

## 🛠️ Tekninen arkkitehtuuri

- **Monikielisyys**: `js/i18n.js` — dynaaminen kääntäjä ja kielitiedostot
- **Äänijärjestelmä**: `js/audio.js` + `assets/suspense.wav` — Web Audio API synteesi & jännitysraita
- **Kysymyspankki**: `js/questions.js` — Suomalaiset triviakysymykset + Open Trivia DB API -integraatio
- **Pelimoottori**:
  - `js/client-engine.js` — Täysin itsenäinen selainmoottori GitHub Pagesille
  - `server.js` — WebSocket + REST API -palvelin omalle hostaukselle
- **Tietokanta**: SQLite (`node:sqlite` — sisäänrakennettu, ei C++ kääntäjäongelmia)
- **Chat-protokollat**: Kick Pusher WS & Twitch IRC WebSocket
