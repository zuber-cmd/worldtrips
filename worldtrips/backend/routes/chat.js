const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// WorldTrips Smart AI Assistant — works 100% with no external API
// ═══════════════════════════════════════════════════════════════

const DESTINATIONS = {
  'masai mara': {
    name: 'Masai Mara', country: 'Kenya', price: 240000,
    duration: '4-7 days', bestTime: 'July–October (Great Migration)',
    highlights: ['Big Five safari', 'Great Wildebeest Migration', 'Maasai culture', 'hot air balloon rides', 'Mara River crossing'],
    hotels: ['Governors Camp', 'Angama Mara', 'Siana Springs', 'Mara Serena Lodge'],
    activities: ['game drives', 'bush walks', 'cultural village visits', 'hot air balloon safari', 'sundowner picnics'],
    visa: 'No visa required for Kenyan citizens. East African Tourist Visa available for regional travel.',
    tips: 'Book July–September well in advance for Great Migration. Pack neutral-colored clothing. Carry binoculars.',
    weather: 'Warm and dry Jul–Oct. Short rains Nov. Long rains Mar–May.',
    flight: 'Fly from Nairobi Wilson Airport (45 mins) or drive via Narok (5–6 hrs).',
  },
  'zanzibar': {
    name: 'Zanzibar', country: 'Tanzania', price: 156000,
    duration: '5-8 days', bestTime: 'June–October (dry season)',
    highlights: ['white sand beaches', 'Stone Town UNESCO heritage', 'spice tours', 'snorkelling & diving', 'Jozani Forest & red colobus monkeys'],
    hotels: ['Zuri Zanzibar', 'Baraza Resort', 'Meliá Zanzibar', 'Zanzibar Serena Hotel'],
    activities: ['snorkelling', 'spice farm tours', 'Stone Town walking tours', 'dolphin watching', 'kitesurfing', 'sunset dhow cruises'],
    visa: 'Kenyan citizens need a Tanzania visa (~USD 50). East African Tourist Visa covers Tanzania.',
    tips: 'Stay in Stone Town for 1-2 nights for the culture, then head to the northern or eastern beaches.',
    weather: 'Hot year-round. Dry Jun–Oct and Jan–Feb. Avoid Mar–May (heavy rains).',
    flight: 'Fly Nairobi to Zanzibar via Dar es Salaam or direct charter (~2 hrs).',
  },
  'paris': {
    name: 'Paris', country: 'France', price: 312000,
    duration: '5-7 days', bestTime: 'April–June or September–October',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées', 'Versailles Palace', 'Montmartre'],
    hotels: ['Hotel Le Marais', 'CitizenM Paris', 'Novotel Eiffel Tower', 'Hotel du Collectionneur'],
    activities: ['Seine river cruise', 'Louvre art tour', 'Eiffel Tower visit', 'wine & cheese tasting', 'day trip to Versailles', 'bakery tour'],
    visa: 'Kenyan citizens need a Schengen visa. Apply at French Embassy Nairobi 3–6 weeks in advance.',
    tips: 'Get a Paris Museum Pass for 2–6 days. Book Eiffel Tower tickets online weeks ahead. Metro is the best transport.',
    weather: 'Best Apr–Jun and Sep–Oct. Avoid Aug (many locals on holiday, busy tourists).',
    flight: 'Direct flights from Nairobi on Kenya Airways (~9 hrs). Also Air France via CDG.',
  },
  'bali': {
    name: 'Bali', country: 'Indonesia', price: 195000,
    duration: '7-10 days', bestTime: 'May–September (dry season)',
    highlights: ['Ubud rice terraces', 'Tanah Lot temple', 'Seminyak beaches', 'Mount Batur sunrise hike', 'traditional dance performances'],
    hotels: ['Four Seasons Jimbaran', 'Alaya Ubud', 'W Bali Seminyak', 'Como Uma Ubud'],
    activities: ['temple tours', 'rice terrace walk', 'surfing lessons', 'cooking class', 'Mount Batur trek', 'spa treatments', 'white water rafting'],
    visa: 'Kenyan citizens get free 30-day visa on arrival at Bali Airport. Extendable to 60 days.',
    tips: 'Split time between Ubud (culture/nature) and Seminyak/Canggu (beach/nightlife). Hire a private driver for temple tours.',
    weather: 'Dry May–Sep (perfect). Wet Nov–Mar but still beautiful. Avoid Jan–Feb peak rains.',
    flight: 'Fly Nairobi–Singapore or Nairobi–KL–Bali (~14 hrs with stopover).',
  },
  'dubai': {
    name: 'Dubai', country: 'UAE', price: 390000,
    duration: '4-6 days', bestTime: 'November–March (cool season)',
    highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall & Fountain', 'desert safari', 'Dubai Frame', 'Gold & Spice Souks'],
    hotels: ['Atlantis The Palm', 'Burj Al Arab', 'JW Marriott Marquis', 'Rove Downtown'],
    activities: ['Burj Khalifa observation deck', 'desert safari with BBQ dinner', 'Dubai Creek dhow cruise', 'ski Dubai', 'Ferrari World Abu Dhabi', 'Dubai Marina yacht'],
    visa: 'Kenyan citizens need a UAE visa. Apply online (Emirates website) or on arrival (~USD 90 for 30 days).',
    tips: 'Book Burj Khalifa At the Top SKY (level 148) for sunrise views. Download Careem or Uber app for transport.',
    weather: 'Best Nov–Mar (25–30°C). Very hot Jun–Sep (40–45°C). Perfect shopping weather year-round indoors.',
    flight: 'Nairobi to Dubai on Emirates or Kenya Airways (~5 hrs direct). Very affordable fares.',
  },
  'maldives': {
    name: 'Maldives', country: 'Maldives', price: 520000,
    duration: '5-7 days', bestTime: 'November–April (dry season)',
    highlights: ['overwater villas', 'crystal lagoons', 'house reef snorkelling', 'dolphin cruises', 'bioluminescent beach', 'underwater restaurants'],
    hotels: ['Gili Lankanfushi', 'Soneva Fushi', 'Huvafen Fushi', 'Constance Moofushi', 'budget guesthouses on local islands'],
    activities: ['snorkelling', 'scuba diving', 'whale shark encounter', 'dolphin watching sunset cruise', 'sandbank picnic', 'seaplane rides'],
    visa: 'Free 30-day visa on arrival for all nationalities including Kenyans.',
    tips: 'Local islands (Maafushi, Thulusdhoo) are 70% cheaper than resort islands. Book seaplane transfers in advance.',
    weather: 'Dry and sunny Nov–Apr. Wet May–Oct but still beautiful with fewer tourists.',
    flight: 'Nairobi to Malé via Dubai, Doha or Colombo (~8–12 hrs). Then speedboat or seaplane to resort.',
  },
  'santorini': {
    name: 'Santorini', country: 'Greece', price: 280000,
    duration: '5-7 days', bestTime: 'May–June or September–October',
    highlights: ['Oia blue-domed churches', 'caldera sunset views', 'Fira clifftop village', 'Akrotiri archaeological site', 'volcanic black sand beaches', 'wine tours'],
    hotels: ['Canaves Oia', 'Grace Santorini', 'Andronis Luxury Suites', 'budget hotels in Fira'],
    activities: ['sunset at Oia', 'volcano boat tour', 'wine tasting at Santo Wines', 'ATV island tour', 'sailing catamaran trip', 'Akrotiri ruins'],
    visa: 'Kenyan citizens need a Schengen visa. Apply at Greek Embassy or consulate 4–6 weeks ahead.',
    tips: 'Stay in Oia or Imerovigli for best sunset views. Book cave hotels 6+ months ahead for July–August.',
    weather: 'Best May–Jun and Sep–Oct (less crowded, 25–28°C). July–Aug is peak season and very hot.',
    flight: 'Fly Nairobi–Athens on Ethiopian or Turkish Airlines, then domestic flight to Santorini (~16 hrs total).',
  },
  'tokyo': {
    name: 'Tokyo', country: 'Japan', price: 260000,
    duration: '7-10 days', bestTime: 'March–May (cherry blossoms) or October–November',
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mount Fuji day trip', 'Tsukiji fish market', 'Akihabara electronics', 'teamLab digital art'],
    hotels: ['Park Hyatt Tokyo', 'Shinjuku Granbell', 'Aman Tokyo', 'budget capsule hotels'],
    activities: ['Mount Fuji day trip', 'Shinkansen bullet train', 'ramen & sushi tour', 'anime & manga shopping', 'Nikko temples day trip', 'tea ceremony'],
    visa: 'Kenyan citizens need a Japan visa. Apply at Japan Embassy Nairobi. Free but requires documentation.',
    tips: 'Get a 7-day JR Pass (book before flying). IC Card (Suica/Pasmo) for city transport. Download Google Translate with Japanese offline.',
    weather: 'Cherry blossoms Mar–Apr. Hot & humid Jul–Aug. Beautiful autumn Oct–Nov. Cold but clear Dec–Feb.',
    flight: 'Nairobi to Tokyo via Dubai, Doha or Singapore (~16–18 hrs). Ethiopian Airlines also serves Tokyo.',
  },
  'new york': {
    name: 'New York', country: 'USA', price: 350000,
    duration: '6-8 days', bestTime: 'April–June or September–November',
    highlights: ['Times Square', 'Central Park', 'Statue of Liberty', 'Empire State Building', 'Brooklyn Bridge', 'Broadway shows', 'Metropolitan Museum'],
    hotels: ['The Standard High Line', 'citizenM New York Times Square', 'The Plaza', 'YOTEL New York'],
    activities: ['Broadway show', 'Ellis Island & Statue of Liberty ferry', 'Central Park bike ride', 'Brooklyn food tour', 'Top of the Rock observation', 'NYC subway explorer'],
    visa: 'Kenyan citizens need a US B1/B2 tourist visa. Apply at US Embassy Nairobi well in advance (60–90 days).',
    tips: 'Get NYC CityPASS for major attractions. Use subway (USD 2.90/ride) or walk Manhattan. Times Square best at night.',
    weather: 'Spring (Apr–Jun) and Fall (Sep–Nov) are ideal. Very cold Dec–Feb. Hot & humid Jul–Aug.',
    flight: 'Nairobi to JFK via Doha (Qatar), Dubai (Emirates) or Amsterdam (KLM) (~16–18 hrs).',
  },
  'cape town': {
    name: 'Cape Town', country: 'South Africa', price: 182000,
    duration: '5-7 days', bestTime: 'November–April (summer)',
    highlights: ['Table Mountain', 'Cape of Good Hope', 'Boulders Beach penguins', 'V&A Waterfront', 'Winelands (Stellenbosch)', 'Robben Island'],
    hotels: ['The Silo Hotel', 'Ellerman House', 'One&Only Cape Town', 'budget guesthouses in Bo-Kaap'],
    activities: ['Table Mountain cable car', 'Cape Point day trip', 'penguin colony at Boulders', 'wine tasting in Stellenbosch', 'Robben Island tour', 'shark cage diving'],
    visa: 'Kenyan citizens need a South Africa visa. Apply at SA High Commission Nairobi. Can take 2–4 weeks.',
    tips: 'Rent a car for Cape Peninsula day trip. Uber is reliable and cheap in Cape Town. Visit Bo-Kaap for colorful photos.',
    weather: 'Best Nov–Apr (summer, 25–30°C). Windy but beautiful. Jun–Aug is winter with rain.',
    flight: 'Nairobi to Cape Town on South African Airways, Kenya Airways or Ethiopian Airlines (~6 hrs).',
  },
  'machu picchu': {
    name: 'Machu Picchu', country: 'Peru', price: 298000,
    duration: '8-12 days', bestTime: 'May–October (dry season)',
    highlights: ['Machu Picchu citadel', 'Inca Trail hike', 'Sun Gate sunrise', 'Aguas Calientes hot springs', 'Sacred Valley', 'Cusco city'],
    hotels: ['Belmond Sanctuary Lodge', 'Inkaterra Machu Picchu Pueblo', 'budget hostels in Aguas Calientes'],
    activities: ['Machu Picchu entrance tour', 'Huayna Picchu mountain climb', 'Classic Inca Trail (4 days)', 'Sacred Valley tour', 'Cusco city tour', 'Rainbow Mountain'],
    visa: 'Kenyan citizens need a Peru visa. Apply at nearest Peruvian embassy. Tourist visa free on arrival for many but Kenyans should verify.',
    tips: 'Book Machu Picchu entry tickets months in advance — they sell out. Altitude in Cusco (3400m) — rest 2 days on arrival.',
    weather: 'Dry season May–Oct (best). Wet Nov–Apr but still accessible. Avoid Feb (heaviest rains).',
    flight: 'Nairobi to Lima via São Paulo (LATAM), Madrid or US hub (~20–24 hrs). Then Cusco domestic flight.',
  },
  'barcelona': {
    name: 'Barcelona', country: 'Spain', price: 234000,
    duration: '5-7 days', bestTime: 'May–June or September–October',
    highlights: ['Sagrada Família', 'Park Güell', 'Las Ramblas', 'Gothic Quarter', 'Camp Nou', 'Barceloneta beach', 'Picasso Museum'],
    hotels: ['Hotel Arts Barcelona', 'W Barcelona', 'Praktik Rambla', 'budget hostels in Gothic Quarter'],
    activities: ['Sagrada Família tour', 'Park Güell visit', 'Gothic Quarter walking tour', 'FC Barcelona museum & stadium', 'Montjuïc cable car', 'tapas & wine evening'],
    visa: 'Kenyan citizens need a Schengen visa. Apply at Spanish Embassy Nairobi 3–6 weeks in advance.',
    tips: 'Book Sagrada Família online (always sells out). T-10 metro card for cheap transport. Dinner is after 9pm locally.',
    weather: 'Best May–Jun and Sep–Oct (25–28°C, less crowded). Jul–Aug is very hot and packed.',
    flight: 'Fly Nairobi–Barcelona via Madrid (Iberia), Dubai (Emirates) or Doha (Qatar) (~12–14 hrs).',
  },
  'iceland': {
    name: 'Iceland', country: 'Iceland', price: 450000,
    duration: '7-10 days', bestTime: 'June–August (midnight sun) or November–February (Northern Lights)',
    highlights: ['Northern Lights', 'Golden Circle', 'Blue Lagoon', 'Jökulsárlón glacier lagoon', 'midnight sun', 'Skógafoss waterfall', 'puffins'],
    hotels: ['Hotel Rangá', 'Fosshotel Glacier Lagoon', 'The Retreat at Blue Lagoon', 'Reykjavík guesthouses'],
    activities: ['Northern Lights tour', 'Blue Lagoon geothermal spa', 'whale watching', 'glacier hiking', 'Golden Circle self-drive', 'ice cave tour', 'puffin watching'],
    visa: 'Kenyan citizens need a Schengen visa. Apply at nearest Schengen embassy (Iceland has no embassy in Kenya — apply via Danish or Norwegian embassy).',
    tips: 'Rent a 4WD for full freedom. Midnight sun in June–July means no darkness — bring eye mask. Northern Lights best Jan–Mar.',
    weather: 'Summer Jun–Aug (15–20°C, 24-hr daylight). Winter Nov–Feb (dark, cold, -5 to 5°C, Northern Lights).',
    flight: 'Nairobi to Reykjavík via London or Copenhagen (~14–16 hrs). Icelandair from London Heathrow.',
  },
  'sydney': {
    name: 'Sydney', country: 'Australia', price: 320000,
    duration: '7-10 days', bestTime: 'September–November or March–May',
    highlights: ['Sydney Opera House', 'Harbour Bridge climb', 'Bondi Beach', 'Manly Ferry', 'Taronga Zoo', 'Blue Mountains day trip', 'Darling Harbour'],
    hotels: ['Park Hyatt Sydney', 'QT Sydney', 'The Langham Sydney', 'YHA Sydney Harbour'],
    activities: ['Opera House tour', 'BridgeClimb Sydney', 'Bondi to Coogee coastal walk', 'Blue Mountains day trip', 'Sydney Harbour kayak', 'koala & kangaroo at Taronga Zoo'],
    visa: 'Kenyan citizens need an Australian ETA or tourist visa. Apply online at immi.homeaffairs.gov.au (USD 20 processing fee).',
    tips: 'Opal card for all public transport. Ferry to Manly is a highlight in itself. Bondi Beach is free. Book BridgeClimb online.',
    weather: 'Spring Sep–Nov and Autumn Mar–May are ideal (20–25°C). Summer Dec–Feb is hot and busy. Winter Jun–Aug mild 15°C.',
    flight: 'Nairobi to Sydney via Singapore (Singapore Airlines) or Doha (Qatar Airways) (~16–18 hrs).',
  },
  'amboseli': {
    name: 'Amboseli', country: 'Kenya', price: 188500,
    duration: '3-5 days', bestTime: 'June–October or January–February',
    highlights: ['Kilimanjaro views', 'largest elephant herds in Africa', 'Observation Hill panorama', 'Maasai villages', 'flamingoes at Lake Amboseli'],
    hotels: ['Amboseli Serena Safari Lodge', 'Ol Tukai Lodge', 'Tortilis Camp', 'Kibo Safari Camp'],
    activities: ['morning & evening game drives', 'elephant research project visit', 'Maasai village cultural tour', 'guided bush walks', 'bird watching (400+ species)'],
    visa: 'No visa required for Kenyan citizens.',
    tips: 'Stay minimum 2 nights for best game viewing. Best elephant viewing is at water sources midday. Dusty — wear sunglasses.',
    weather: 'Dry Jun–Oct and Jan–Feb are best. Avoid Apr–May (long rains). Always bring warm clothing for mornings.',
    flight: 'Drive from Nairobi (4–5 hrs via Namanga road) or fly from Wilson Airport to Amboseli airstrip (~45 mins).',
  },
};

// ── Smart response engine ──────────────────────────────────────
function generateReply(userMsg) {
  const msg = userMsg.toLowerCase().trim();

  // ── Greeting ──
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|hujambo|habari|sasa)/.test(msg)) {
    return `👋 Hello! I'm your **WorldTrips AI Travel Assistant**.\n\nI can help you with:\n**• Destination info** — details on all 15 destinations\n**• Pricing** — all in Kenya Shillings (KES)\n**• Visa requirements** — for Kenyan travellers\n**• Best travel times** — weather & seasons\n**• Hotels & activities** — what to book\n**• Itineraries** — day-by-day planning\n\nWhere would you like to travel? ✈️`;
  }

  // ── Find destination mentioned ──
  let foundDest = null;
  for (const [key, dest] of Object.entries(DESTINATIONS)) {
    if (msg.includes(key) || msg.includes(dest.name.toLowerCase()) || msg.includes(dest.country.toLowerCase())) {
      foundDest = dest;
      break;
    }
  }
  // Partial matches
  if (!foundDest) {
    const partials = { 'mara': 'masai mara', 'masai': 'masai mara', 'maldive': 'maldives', 'nyc': 'new york', 'ny ': 'new york', 'tokyo': 'tokyo', 'bali': 'bali', 'cape': 'cape town', 'machu': 'machu picchu', 'inca': 'machu picchu', 'reykjavik': 'iceland', 'aurora': 'iceland', 'northern lights': 'iceland', 'eiffel': 'paris', 'burj': 'dubai', 'opera house': 'sydney', 'sagrada': 'barcelona', 'gaudi': 'barcelona', 'kilimanjaro': 'amboseli', 'stone town': 'zanzibar' };
    for (const [partial, key] of Object.entries(partials)) {
      if (msg.includes(partial)) { foundDest = DESTINATIONS[key]; break; }
    }
  }

  // ── Topic detection ──
  const isVisa = /visa|passport|entry|require|document/.test(msg);
  const isBudget = /budget|cost|price|cheap|afford|how much|kes|expensive/.test(msg);
  const isHotel = /hotel|stay|lodge|resort|accommodation|where to sleep|book/.test(msg);
  const isActivity = /activ|do|see|visit|experience|things to do|what to|tour/.test(msg);
  const isBestTime = /best time|when|season|month|weather|rain|temperature/.test(msg);
  const isItinerary = /itinerar|day|plan|trip|days|week|schedule|how many/.test(msg);
  const isFlight = /flight|fly|airline|airport|how to get|travel to/.test(msg);

  // ── Single destination + topic ──
  if (foundDest) {
    const d = foundDest;
    const fmt = (n) => `KES ${n.toLocaleString()}`;

    if (isVisa) {
      return `🛂 **Visa Info — ${d.name}**\n\n${d.visa}\n\n**Tips:** Apply early — visas can take 2–4 weeks. Carry proof of accommodation and return flight. Contact us to help with your booking documents! 😊`;
    }
    if (isBestTime) {
      return `🌤️ **Best Time to Visit ${d.name}**\n\n**Best time:** ${d.bestTime}\n\n**Weather:** ${d.weather}\n\n**Recommended duration:** ${d.duration}\n\nShall I help you plan a trip for a specific date? 📅`;
    }
    if (isHotel) {
      return `🏨 **Hotels in ${d.name}**\n\nTop recommended hotels:\n${d.hotels.map(h => `**• ${h}**`).join('\n')}\n\n**Starting price:** ${fmt(d.price)} per person\n\nOptions range from luxury lodges to budget guesthouses. Want me to suggest the best fit for your budget?`;
    }
    if (isActivity) {
      return `🎯 **Things to Do in ${d.name}**\n\n${d.activities.map(a => `• ${a}`).join('\n')}\n\n**Top highlights:**\n${d.highlights.slice(0, 3).map(h => `✨ ${h}`).join('\n')}\n\nWant a full day-by-day itinerary? Just ask! 📋`;
    }
    if (isFlight) {
      return `✈️ **Getting to ${d.name}**\n\n${d.flight}\n\n**Tip:** Book flights 6–8 weeks ahead for best prices. We can help coordinate your full travel package including flights, hotel and activities!`;
    }
    if (isItinerary) {
      const days = d.duration.split('-')[0];
      return `📋 **${d.duration} Itinerary — ${d.name}**\n\n**Day 1:** Arrive, check in, explore the area\n**Day 2-3:** ${d.highlights.slice(0,2).join(' + ')}\n**Day ${Math.ceil(parseInt(days)/2)+1}-${parseInt(days)-1}:** ${d.activities.slice(2,4).join(', ')}\n**Last day:** Final sightseeing + departure\n\n**Best time:** ${d.bestTime}\n**Starting price:** ${fmt(d.price)}\n\nWant a detailed day-by-day plan? I can customise it for you! 🗺️`;
    }

    // General destination info
    return `✈️ **${d.name}, ${d.country}**\n\n**Starting price:** ${fmt(d.price)} per person\n**Duration:** ${d.duration}\n**Best time:** ${d.bestTime}\n\n**Top highlights:**\n${d.highlights.slice(0,4).map(h => `• ${h}`).join('\n')}\n\n**Popular activities:** ${d.activities.slice(0,3).join(', ')}\n\n**Visa:** ${d.visa.split('.')[0]}.\n\n💬 Ask me about hotels, activities, visa details, or flights for ${d.name}!`;
  }

  // ── No specific destination — general questions ──

  if (isBudget || /cheap|affordable|under|budget/.test(msg)) {
    const sorted = Object.values(DESTINATIONS).sort((a,b) => a.price - b.price);
    const cheap = sorted.slice(0,4);
    return `💰 **Most Affordable Destinations from Nairobi**\n\n${cheap.map(d => `**${d.name}** — KES ${d.price.toLocaleString()} from`).join('\n')}\n\nAll prices include accommodation and activities. We handle everything — just pick your destination! 😊`;
  }

  if (/romantic|honeymoon|couple|anniversary/.test(msg)) {
    return `💑 **Top Romantic Destinations**\n\n**• Maldives** (KES 520,000) — overwater villas, private beaches\n**• Santorini** (KES 280,000) — sunset caldera views, cave hotels\n**• Zanzibar** (KES 156,000) — secluded beaches, dhow cruises\n**• Bali** (KES 195,000) — rice terraces, spa retreats, temples\n\nAll can be tailored as honeymoon packages. Which destination interests you most? 💍`;
  }

  if (/adventure|hiking|trekking|extreme|safari/.test(msg)) {
    return `🏔️ **Top Adventure Destinations**\n\n**• Masai Mara** (KES 240,000) — Big Five safari, hot air balloon\n**• Iceland** (KES 450,000) — glacier hike, ice caves, whale watching\n**• Machu Picchu** (KES 298,000) — Inca Trail trek, Rainbow Mountain\n**• Amboseli** (KES 188,500) — elephants under Kilimanjaro\n**• Bali** (KES 195,000) — Mount Batur sunrise trek, white water rafting\n\nWhich type of adventure excites you most? 🦁`;
  }

  if (/beach|sun|ocean|sea|island|swim/.test(msg)) {
    return `🏖️ **Top Beach & Island Destinations**\n\n**• Maldives** (KES 520,000) — crystal lagoons, overwater villas\n**• Zanzibar** (KES 156,000) — white sand, Stone Town culture\n**• Bali** (KES 195,000) — Seminyak, Canggu, surfing\n**• Sydney** (KES 320,000) — Bondi Beach, coastal walks\n\nWant details on any of these? I'll include best time to visit and hotel picks! 🌊`;
  }

  if (/family|kids|children|child/.test(msg)) {
    return `👨‍👩‍👧‍👦 **Best Family Destinations**\n\n**• Amboseli** (KES 188,500) — kids love the elephants, easy local travel\n**• Zanzibar** (KES 156,000) — calm beaches, snorkelling, safe\n**• Dubai** (KES 390,000) — theme parks, Ski Dubai, Aquaventure\n**• Cape Town** (KES 182,000) — penguin beach, Waterfront, Table Mountain\n\nAll are family-friendly with activities for all ages. Which appeals to you? 😊`;
  }

  if (/all destination|list|show me|what destination|where can|available/.test(msg)) {
    const list = Object.values(DESTINATIONS);
    return `🌍 **Our 15 Destinations**\n\n${list.map(d => `**${d.name}**, ${d.country} — KES ${d.price.toLocaleString()}`).join('\n')}\n\nAsk me about any destination for full details — visa, hotels, activities, best time and more! ✈️`;
  }

  if (/mpesa|m-pesa|pay|payment|card|how to pay/.test(msg)) {
    return `💳 **Payment Methods**\n\nWe accept:\n**• M-Pesa** — Paybill or Till Number, instant confirmation\n**• Credit/Debit Card** — Visa, Mastercard, Amex\n\nPayment is 100% secure. You can pay a deposit to book and the balance before travel. Contact us to start your booking! 😊`;
  }

  if (/thank|thanks|asante|great|awesome|perfect|wonderful/.test(msg)) {
    return `😊 You're very welcome! Happy to help you plan your dream trip.\n\nIs there anything else you'd like to know — destinations, visa info, itineraries, or pricing? I'm here anytime! ✈️`;
  }

  if (/who are you|what are you|worldtrips|about you/.test(msg)) {
    return `🌍 **About WorldTrips**\n\nI'm the **WorldTrips AI Travel Assistant** — your personal travel consultant.\n\nWorldTrips is a Kenyan travel agency offering curated trips to 15 amazing global and local destinations, all priced in Kenya Shillings (KES).\n\n**We offer:**\n• Complete travel packages (flights, hotels, activities)\n• M-Pesa and card payment\n• Expert travel advice for Kenyan travellers\n\nHow can I help you plan your next adventure? ✈️`;
  }

  // ── Default helpful response ──
  return `🌍 I'd be happy to help with your travel plans!\n\nI can tell you about:\n**• Any of our 15 destinations** (Masai Mara, Zanzibar, Paris, Bali, Dubai, Maldives, Santorini, Tokyo, New York, Cape Town, Machu Picchu, Barcelona, Iceland, Sydney, Amboseli)\n**• Visa requirements** for Kenyan travellers\n**• Best travel times** and weather\n**• Hotels, activities, and itineraries**\n**• Pricing in KES**\n\nWhich destination interests you? Just ask! 😊`;
}

// ── POST /api/chat ────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: 'Messages required.' });

    const last = messages[messages.length - 1];
    const userText = typeof last.content === 'string' ? last.content : String(last.content || '');

    console.log(`[chat] user ${req.user?.id}: "${userText.slice(0,80)}"`);

    const reply = generateReply(userText);
    return res.json({ success: true, reply });

  } catch (e) {
    console.error('[chat] Error:', e);
    res.status(500).json({ success: false, message: 'Chat error. Please try again.' });
  }
});

module.exports = router;