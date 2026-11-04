/* Story content and settings. Edit this file to change text, sources, pacing and files. */

/* ============================================================
   SETTINGS
   ============================================================ */
const DASH_MS = 300;          // time between dashes appearing (higher = slower)
const DASHES_PER_LEG = 10;    // about this many dashes between two stops
const CURVE = 1.7;            // how much the line bends between stops (0 = straight, 1 = gentle)
const GLIDE_MS = 600;         // after the last dash, time to settle the page on the next stop
const DASH_LEN = 12;          // length of each dash in px (0 = round dots)
/* Background sound: one bed plays at a time. The soundscape until the lifeboats, then the waves,
   with the sonar while the line fades (days 1-4), only the sonar at the yellow dot, then the soundscape again after the rescue. */
const SOUNDSCAPE_FILE = 'sfx/soundscape.mp3';
const WAVES_FILE = 'sfx/waves.mp3';
const SONAR_FILE = 'sfx/sonar.mp3';
const SOUNDSCAPE_LEVEL = .22;  // volume, 0 to 1
const WAVES_LEVEL = .28;
const SONAR_LEVEL = .45;
const CARD_DUCK = .2;          // while a card is open, the background drops to this fraction of its volume
const PLANE_ART = 'img/plane.png'; // pops in halfway between Sri Lanka and Germany (not clickable)
const FISHBOAT_ART = 'img/fishboat.png'; // pops in halfway between the yellow beacon and St. Shott's, once they're found

/* ============================================================
   STORY CONTENT
   ============================================================ */
/* [full title, link, short name]. Cards before REVEAL_AT show the short name, so no title gives away the landing in Newfoundland.
   The sources screen at the end always shows the full title. */
const REVEAL_AT = 'rescue';
const SOURCES = {
  family:['Family photograph', ''],
  tamilHeritage:['Tamil Heritage, "Mullivaikal Tamil genocide images" (photographer not credited)', 'https://telibrary.com/en/custom-gallery/mullivaikal-tamil-genocide-images-18/'],
  aj19:['Al Jazeera, "Sri Lanka anniversary: 10 years since civil war ended," May 18, 2019', 'https://www.aljazeera.com/news/2019/05/sri-lanka-anniversary-10-years-civil-war-ended-190518160221811.html'],
  bpb80:['David Templin, "Hamburg 1980: Hotelzimmer oder Sammellager?", Deutschland Archiv, bpb, July 19, 2024 (photo © picture-alliance, Lothar Heidtmann)', 'https://www.bpb.de/themen/deutschlandarchiv/550559/hamburg-1980-hotelzimmer-oder-sammellager/'],
  hoc:   ['House of Commons Journals, No. 74, May 18, 2022', 'https://noscommunes.ca/Content/House/441/Journals/074/Journal074.PDF'],
  pier:  ['Pier 21, "The dramatic rescue of 155 people off Newfoundland"', 'https://pier21.ca/monthly-feature/dramatic-rescue-155-people-newfoundland-august-1986', 'Pier 21'],
  cbc16: ['CBC News, "Tamil refugees mark 30 years in Canada" (2016)', 'https://amp.cbc.ca/news/canada/newfoundland-labrador/tamil-refugees-mark-30-years-in-canada-1.3694420', 'CBC News (2016)'],
  vocm:  ['VOCM News', 'https://vocm.com/?p=306594'],
  rh:    ['Refugee History, "Humanitarianism in Newfoundland" (2022)', 'https://refugeehistory.org/blog/2022/1/20/humanitarianism-in-newfoundland-the-rescue-of-tamil-refugees-in-1986'],
  interview:['Interview by Anjena Anandakumar, October 25, 2026', ''],
  cpPhoto:['Canadian Press photo, via Pier 21, "The dramatic rescue of 155 people off Newfoundland, August 1986"', 'https://pier21.ca/monthly-feature/dramatic-rescue-155-people-newfoundland-august-1986'],
  star86:['The Toronto Star, "Ship at centre of refugee storm," August 16, 1986, p. A8, via Refugee History', 'https://refugeehistory.org/blog/2022/1/20/humanitarianism-in-newfoundland-the-rescue-of-tamil-refugees-in-1986'],
  cbcVideo:['CBC, "Sri Lankan migrants rescued off Newfoundland in 1986," The National, August 12, 1986 (CBC Archives video)', 'https://www.cbc.ca/player/play/video/1.3183205'],
  sfxScape:['Universfield, "Atmospheric Cinematic Soundscape" (sound effect), Pixabay, June 5, 2023', 'https://pixabay.com/sound-effects/musical-atmospheric-cinematic-soundscape-152493/'],
  sfxWaves:['DRAGON-STUDIO, "Waves Crashing" (sound effect), Pixabay, September 2, 2025', 'https://pixabay.com/sound-effects/nature-waves-crashing-397977/'],
  sfxSonar:['DRAGON-STUDIO, "Deepsea Sonar" (sound effect), Pixabay, August 8, 2025', 'https://pixabay.com/sound-effects/film-special-effects-deepsea-sonar-386156/'],
  code:['Anthropic, Claude Code (Claude Opus 5.5), website code, October–November 2026', 'https://claude.com/claude-code'],
  refuge:['Refuge journal, "An Interview on the Case of the 155 Tamil Refugees" (1986)', 'https://doi.org/10.25071/1920-7336.21493']
};

/* side: which side of the page the stop sits on. The line zigzags between them.
   audio: his clip for that stop (see INTERVIEW-SELECTS.md for what is in each one).
   quote: a line from that clip, shown under the play button. Keep it word for word from the recording.
   when / coord: shown under the place name. Leave when blank unless a source gives it.
   year: shown next to the coordinates on the map (and on the card when there is no exact date). From his account.
   dashesAfter: draw exactly this many dashes to the next stop (and place it closer).
   artLift: move the drawing up this many px (more space above the place name).
   bed: background sound from this stop on ('calm' = soundscape, 'sea' = waves).
   popup: a photo that pops up in the centre whenever this card opens. cw: a content warning; the photo stays blurred until clicked.
   video: a video in the card that only loads when clicked.
   a fact with img: clicking that clipping opens the image (img.label, img.s and img.cw are optional).
   rate: play his main clip a little faster (1.05 = 5% faster; his pitch stays the same).
   transcript: his words in that clip, word for word (INTERVIEW-SELECTS.md), hidden until "Read transcript" is clicked.
   more: extra clips from the interview, listed under the clippings ("More from him").
         title is a short description of the clip, not a quote. */
const STOPS = [
  { id:'sri-lanka', side:'left', art:'img/sri-lanka.png', label:'Sri Lanka', coord:'7.9°N 80.8°E',
    when:'', year:'1983–1984', cta:'Click the flag',
    popup:{src:'img/family-sri-lanka.jpg', caption:'His family, Sri Lanka, around 1979.', s:'family'},
    audio:'audio/01-sri-lanka.mp3', rate:1.05,
    transcript:[
      "So I decided to leave the country. If I stay there, there may be a danger for me.",
      "And so I left the country, finally. That time I was able to take the flight. I managed to come after so many hurdles and troubles to get to Colombo, to the airport, because of the war. And there were so many checkpoints… There was two incidents that I would have been [killed]. But anyway, I managed to escape. They started to shoot randomly, and people all over the place, scattered. So somehow I was running, and I was lucky to survive."
    ], quote:'If I stay there, there may be a danger for me.',
    more:[
      {audio:'audio/set-aside/parents-in-jaffna-targeting-men.mp3', title:'His parents in Jaffna, and who was being targeted'},
      {audio:'audio/set-aside/cousin-knew-the-way.mp3', title:'A cousin who knew the way to Germany'}
    ],
    facts:[
      {t:'Mullivaikkal, 2009. The war he fled ended in 2009. To this day, no one has been held accountable for the crimes committed.', s:'aj19', img:{src:'img/mullivaikkal-2009.jpg', label:'View the photo (content warning)',
        caption:'Mullivaikkal, 2009. The war he fled ended in 2009. To this day, no one has been held accountable for the crimes committed.', s:['tamilHeritage','aj19'], cw:'This photo shows the aftermath of violence at the end of the war.'}},
      {t:'In 2022, Canada\'s House of Commons unanimously acknowledged the genocide of Tamils in Sri Lanka and named May 18 Tamil Genocide Remembrance Day.', s:'hoc'}
    ]},
  { id:'germany', side:'right', art:'img/germany.png', label:'West Germany', coord:'52.5°N 13.4°E',
    when:'', year:'1984–1986', cta:'Click Germany',
    popup:{src:'img/hamburg-1980-refugee-hostel.jpg', caption:'Vietnamese refugees outside their hostel in Hamburg, West Germany, August 1980.', s:'bpb80'},
    audio:'audio/02-germany.mp3', rate:1.05,
    transcript:[
      "We weren't able to establish ourselves here. We cannot work there. We have a barrier, where we cannot go out of this area… we have to live in that area. How long we can live like that, you know?",
      "So they approached me, and we trusted them. We thought, okay, it's a good opportunity, we can come to Canada. We can manage English.",
      "They said it's going to be a kind of cruise. So we didn't have any choice. That's all, we believed it, and we decided to go, [go] with the boat."
    ], quote:'Then we cannot work… we cannot go out of this area… How long we can live like that, you know?',
    more:[
      {audio:'audio/set-aside/shelter-food-cannot-study.mp3', title:'Shelter and food, but no chance to study'},
      {audio:'audio/set-aside/camps-and-smugglers.mp3', title:'The camps, and the smugglers'}
    ],
    facts:[
      {t:'Many Tamils took cheap flights to East Berlin, crossed at the Wall and claimed asylum in West Germany.', s:'pier'},
      {t:'In 1986 The New York Times reported that West Germany had received some 30,000 Tamil refugees.', s:'pier'},
      {t:'Asylum seekers there were not allowed to work for two years.', s:'pier'}
    ]},
  { id:'aurigae', side:'left', art:'img/aurigae.png', label:'Aurigae · the “cruise”', coord:'53.3°N 8.5°E', dashesAfter:5, artLift:10,
    when:'July 28, 1986', year:'1986', cta:'Click the ship',
    audio:'audio/03-ship.mp3', rate:1.05,
    transcript:[
      "But eventually the story was different. When we reached the boat, it was a cargo boat. Not a regular passenger boat… I already left the city and we cannot go back. And then I was [afraid] and everything.",
      "I think they used to deliver animals, and oil, kind of cargo. Very rusted and smelly.",
      "And then when we went inside, there was food that was dumped about a month ago. Old, moldy… fungus, dumped like a hill. Bread, especially bread. Thousands of breads piled like a hill."
    ], quote:'When we reached the boat, it was a cargo boat… I already left the city and we cannot go back.',
    more:[
      {audio:'audio/set-aside/food-pile-seasick.mp3', title:'The canned food, and the seasickness'},
      {audio:'audio/set-aside/sharing-soup-with-135.mp3', title:'One soup shared among about 135 people'},
      {audio:'audio/set-aside/brahmin-friend-no-meat.mp3', title:'A man from his village who didn\'t eat meat'}
    ],
    facts:[
      {t:'The cargo ship MV Aurigae left Brake, West Germany, illegally and at night on July 28, 1986.', s:'pier'},
      {t:'Its captain and owner was a West German, Wolfgang Bindel.', s:'pier'}
    ]},
  { id:'lifeboats', side:'right', art:'img/lifeboat.png', label:'The lifeboats', coord:'Middle of the sea', bed:'sea',
    when:'August 1986', year:'1986', cta:'Click the lifeboat',
    audio:'audio/04-lifeboat.mp3', rate:1.1,
    transcript:[
      "And eventually they left us very far away, about 200, 300 miles away.",
      "In the small boat. Two boats with one engine… they tied [them to] each other and only gave us one engine… and nobody knows how to ride the boat. We are not experienced. We are regular people, not from fishermen families, so 99% of people didn't know how to operate the boat.… The boat can only carry 30 people each, but we were 135 or something. Seventy people in each. Can you imagine? It's only carry 35, but it doubled it up. And we was just floating in the sea. We don't know where to go and how to do.",
      "So after three days, we were just floating on the sea without any help. And the water is coming into the boat, so we have to put the water out of the boat many times. And we were falling asleep… [if we fall asleep],we will fall down into the sea, and nobody knows how to swim, because we didn't eat for several days."
    ], quote:'Seventy people in each. Can you imagine? It\'s only carry 35, but it doubled it up.',
    more:[
      {audio:'audio/set-aside/family-with-children-and-praying.mp3', title:'The family with small children, and praying in the lifeboat'},
      {audio:'audio/set-aside/fuel-ran-out-tools-fell.mp3', title:'The fuel ran out, and the tools fell into the sea'}
    ],
    stamps:[ {t:'Two boats. One engine.'}, {t:'Seventy people in each.'}, {t:'Nobody knows how to swim.'} ],  /* his words, from the interview */
    facts:[
      {t:'155 people, including a handful of women and children, were put into two lifeboats.', s:'cbc16'},
      {t:'They had been told they would be in Montreal in four hours.', s:'cbc16'}
    ]},
  { id:'rescue', side:'left', art:'img/canada.png', label:'St. Shott\'s, Newfoundland', coord:'46.6°N 53.6°W',
    when:'August 11, 1986', year:'1986', cta:'Click the flag',
    popup:{src:'img/aug-1986-boat.jpg', caption:'A group of Sri Lankan refugees on the deck of a tug boat that rescues them off the coast of Newfoundland, 12 August 1986.', s:'cpPhoto'},
    audio:'audio/05-rescue.mp3', rate:1.05,
    transcript:[
      "…just floating, floating, floating, floating. And third day, it was kind of dark, and all of a sudden the sun came. We were able to see some boats fishing there, so we were waving. We thought we are almost [dead], and people were praying, and hugging each other.",
      "And then we were able to see. There was a fisherman, and we waved our clothes and everything, and somehow they saw us. So they came to us, and immediately took us and put us in their boat.",
      "Yeah, luckily everybody survived.",
      "There were signs: Welcome to Canada. Welcome to Canada. Welcome to Canada."
    ], quote:'All of a sudden the sun came… We thought we are almost dying.',
    more:[
      {audio:'audio/set-aside/boat-didnt-capsize-70-each.mp3', title:'Seventy in each boat, and it didn\'t capsize'},
      {audio:'audio/set-aside/fishermen-radioed-for-help.mp3', title:'The fishermen radio for help'},
      {audio:'audio/set-aside/first-commercial-ship.mp3', title:'Being welcomed in Canada'}
    ],
    facts:[
      {t:'Fisherman Gus Dalton found the two lifeboats drifting in thick fog near St. Shott\'s.', s:'vocm'},
      {t:'He dumped his boatload of cod overboard to make room for people.', s:'pier'},
      {t:'His boat took about 55 people. The fisheries patrol ship Leonard J. Cowley brought most of the rest to St. John\'s.', s:'cbc16'},
      {t:'All 155 were brought to shore.', s:'rh'},
      {t:'“Ship at centre of refugee storm.”', s:'star86', img:{src:'img/toronto-star-1986-08-16.webp', caption:'The Toronto Star, Saturday, August 16, 1986, page A8.'}}
    ]},
  { id:'canada', side:'right', art:'img/canada.png', label:'Canada', coord:'Newfoundland',
    when:'1986 onward', year:'1986', cta:'Click Canada',
    video:{embed:'https://www.cbc.ca/i/phoenix/player/syndicate/?mediaId=1.3183205', title:'CBC News', s:'cbcVideo'},
    audio:'audio/06-canada.mp3', rate:1.05,
    transcript:[
      "They thought that we came from Sri Lanka. That is the only part they didn't like… unfortunately, we have to come from Germany as well, because there's no life for us there.",
      "But unfortunately, we have to escape from our own country. And Germany the second time… We are human. We don't only just live for life. We want to do something and do well. That's the reason we came, and we are contributing to Canada now."
    ], quote:'We want to do something and do well. That\'s the reason we came.',
    more:[
      {audio:'audio/set-aside/permanent-residence-took-a-while.mp3', title:'Why permanent residence took a while'},
      {audio:'audio/set-aside/thankful-to-canada.mp3', title:'Thankful to Canada'}
    ],
    facts:[
      {t:'Canada issued them renewable one-year Minister\'s permits to live and work.', s:'rh'},
      {t:'The permits did not make them recognized refugees. Their status was still undecided.', s:'refuge'},
      {t:'Once it emerged they had sailed from West Germany, some coverage called them bogus and illegal, and Canada a dumping ground.', s:'rh'},
      {t:'A year later, 174 Sikh asylum seekers arrived by lifeboat in Nova Scotia, and Parliament was recalled to amend the Immigration Act.', s:'pier'}
    ]}
];

/* Story order. 'line' draws the dotted line from one stop to the next. 'drift' is the lifeboat sequence. */
const SEQ = [
  {type:'stop',i:0},{type:'line',from:0},{type:'stop',i:1},{type:'line',from:1},{type:'stop',i:2},{type:'line',from:2},
  {type:'stop',i:3},{type:'drift'},{type:'stop',i:4},{type:'line',from:4},{type:'stop',i:5},{type:'end'}
];
