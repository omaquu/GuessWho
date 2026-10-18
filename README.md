# 🎯 Kuka haluaa miljonääriksi? — Live Kick & Twitch Trivia

Interaktiivinen, suomalainen "Haluatko miljonääriksi?" -tyylinen tietovisapeli livestriimeihin. Peli tukee reaaliaikaista **Kick-** ja **Twitch-chat** -äänestystä, leaderboardia, aitoja oljenkorsia, jännittävää TV-studiomusiikkia ja moninpeliä.

---

## 🌟 Ominaisuudet

- 📺 **TV-studioteema**: Tumma studiovalaistus, liikkuvat valokeilat, Anton & Rubik -fontit, neon-LED-paneelit ja klassiset timanttivaihtoehdot.
- 💬 **Kick- & Twitch-chatti-integraatio**:
  - Chattilaiset äänestävät suoraan kirjoittamalla chattiin `A`, `B`, `C` tai `D` (tai `!A`, `!B`, `!C`, `!D`).
  - Tukee Kick-kanavanimen automaattista hakua ilman manuaalisia numerotunnuksia.
  - Twitch IRC -yhteys toimii suoraan ja luotettavasti.
- 👥 **Moninpeli & Leaderboard**:
  - Chattilaiset kilpailevat keskenään ja keräävät pisteitä.
  - Reaaliaikainen tulostaulukko pelin aikana sekä pysyvä globaali tulostaulukko (Kaikki ajat, Tämä viikko, Tämä kuukausi).
  - Palkintopallinäkymä (Top 3 kulta, hopea, pronssi) ja tarkkuusprosentit.
- 💡 **4 Aitoa Oljenkortta**:
  1. ❌ **50:50 (Poista 2 väärää vastausta)**: Jättää jäljelle oikean ja yhden satunnaisen väärän vaihtoehdon.
  2. ⏱️ **Lisää aikaa (+30s)**: Antaa lisäaikaa miettiä tai äänestää.
  3. 💡 **Lisävihje**: Paljastaa kysymykseen liittyvän lisävihjeen.
  4. 👥 **Kysy yleisöltä / chatilta**: Näyttää chatin äänestysprosentit reaaliaikaisena pylväsdiagrammina.
- 🎵 **Jännittävä kilpailumusiikki**:
  - "Haluatko miljonääriksi" -tyylinen matala analoginen bassodrone, sydämenlyönnit (60 BPM), sekuntikellon tikitys ja nousevat jännityssoinnut.
  - Ääniefektit kysymyksen aloitukselle (gong), oikealle vastaukselle (fanfaari), väärälle vastaukselle (dramaattinen pudotus) ja oljenkorsille.
  - Sisäänrakennettu äänenvoimakkuuden säädin ja mykistyspainike.
- 💰 **Voittotaulukko (Money Ladder)**:
  - 15 tasoa (100 € -> 1 000 000 €) turvatasoilla (1 000 € ja 32 000 €).
- ⚙️ **Monipuolinen Isännän / Admin-ohjauspaneeli**:
  - Aloita ja lopeta pelit yhdellä klikkauksella.
  - Säädettävä äänestysaika (esim. 30s chatille ennen kuin isäntä vastaa tai käyttää oljenkorsia).
  - Kysymyspankin hallinta (lisää, muokkaa ja poista kysymyksiä suoraan selaimessa).
  - Open Trivia DB -tuonti ja JSON-vienti.

---

## 🚀 Asennus ja käynnistys

### Vaihtoehto A: Node.js (Suositeltu paikalliseen ajoon)

Vaatimukset: **Node.js 22+** (tai 24)

1. Asenna riippuvuudet:
   ```bash
   npm install
   ```

2. Generoi taustamusiikki (jos tarpeen):
   ```bash
   node scripts/generate_music.js
   ```

3. Käynnistä palvelin:
   ```bash
   npm start
   ```

4. Avaa selaimessa:
   - 🎮 **Pelisivu**: [http://localhost:3000](http://localhost:3000)
   - ⚙️ **Isännän hallintapaneeli**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - 🏆 **Tulostaulukko**: [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard)

---

### Vaihtoehto B: Docker / Proxmox CT

Käynnistä peli taustalle yhdellä komennolla:

```bash
docker compose up -d --build
```

Peli käynnistyy porttiin `3000`.

---

## 🎮 Pelin kulku livestriimissä

1. Avaa hallintapaneeli `/admin` toisessa välilehdessä tai toisella näytöllä.
2. Syötä Kick- tai Twitch-kanavasi nimi ja klikkaa **Yhdistä**.
3. Valitse pelitila (*Yleistieto* tai *Striimikulttuuri*) ja kysymysten määrä.
4. Klikkaa **Aloita peli**.
5. Kysymys ilmestyy ruutuun:
   - Chattilaisilla on ensimmäiset 30 sekuntia aikaa äänestää (A/B/C/D).
   - Äänestysajan päätyttyä vuoro siirtyy isännälle.
   - Isäntä voi tarvittaessa käyttää oljenkorsia (esim. *Kysy yleisöltä*, jolloin chatin äänestysjakauma heijastuu ruudulle).
   - Oikean vastauksen paljastuttua oikein arvanneet chattilaiset saavat pisteitä tulostaulukkoon!

---

## 🛠️ Teknologiat

- **Backend**: Node.js, Express, WebSocket (`ws`)
- **Tietokanta**: SQLite (`node:sqlite` - sisäänrakennettu, ei vaadi ulkoisia C++ kääntäjiä)
- **Frontend**: HTML5, Moderni CSS3 (Grid & Flexbox), Vanilla JS, Web Audio API
- **Live Chatti**: Kick Pusher WebSocket API & Twitch IRC WebSocket
