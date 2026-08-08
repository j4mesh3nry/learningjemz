export const SPACE_OBJECTS_BY_SIZE = [
  {
    id: 'sun',
    name: 'Sun',
    type: 'Star',
    astronomicalType: 'Star',
    iconType: 'star',
    typeDescription: 'A massive glowing sphere of hot plasma producing light and energy through nuclear fusion.',
    diameter: '1,392,700 km',
    orbitalOrder: 'Center of Solar System',
    funFact: 'Contains 99.86% of all mass in the Solar System.',
    img: '/textures/objects/sun.jpg',
    acceptedNames: ['sun']
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Planet',
    astronomicalType: 'Gas Giant',
    iconType: 'gas-giant',
    typeDescription: 'A massive planet composed primarily of hydrogen and helium gas with no solid surface.',
    diameter: '139,820 km',
    orbitalOrder: '5th Planet from Sun',
    funFact: 'The largest planet with a storm called the Great Red Spot raging for centuries.',
    img: '/textures/objects/jupiter.jpg',
    acceptedNames: ['jupiter']
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Planet',
    astronomicalType: 'Gas Giant',
    iconType: 'gas-giant',
    typeDescription: 'A massive planet composed primarily of hydrogen and helium gas with no solid surface.',
    diameter: '116,460 km',
    orbitalOrder: '6th Planet from Sun',
    funFact: 'Famous for its spectacular, complex ring system made of ice and rock.',
    img: '/textures/objects/saturn.jpg',
    acceptedNames: ['saturn']
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Planet',
    astronomicalType: 'Ice Giant',
    iconType: 'ice-giant',
    typeDescription: 'A giant planet composed mostly of elements heavier than hydrogen and helium, such as water and methane.',
    diameter: '50,724 km',
    orbitalOrder: '7th Planet from Sun',
    funFact: 'Rotates on its side and has a pale blue color from methane gas.',
    img: '/textures/objects/uranus.jpg',
    acceptedNames: ['uranus']
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Planet',
    astronomicalType: 'Ice Giant',
    iconType: 'ice-giant',
    typeDescription: 'A giant planet composed mostly of elements heavier than hydrogen and helium, such as water and methane.',
    diameter: '49,244 km',
    orbitalOrder: '8th Planet from Sun',
    funFact: 'The most distant major planet with supersonic winds reaching 2,100 km/h.',
    img: '/textures/objects/neptune.jpg',
    acceptedNames: ['neptune']
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Planet',
    astronomicalType: 'Terrestrial Planet',
    iconType: 'terrestrial',
    typeDescription: 'A rocky world with a solid, compact surface and high density.',
    diameter: '12,742 km',
    orbitalOrder: '3rd Planet from Sun',
    funFact: 'The only planet known to harbor life, with liquid oceans covering 71% of its surface.',
    img: '/textures/objects/earth.jpg',
    acceptedNames: ['earth']
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Planet',
    astronomicalType: 'Terrestrial Planet',
    iconType: 'terrestrial',
    typeDescription: 'A rocky world with a solid, compact surface and high density.',
    diameter: '12,104 km',
    orbitalOrder: '2nd Planet from Sun',
    funFact: 'Hottest planet in our solar system due to a runaway greenhouse effect.',
    img: '/textures/objects/venus.jpg',
    acceptedNames: ['venus']
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Planet',
    astronomicalType: 'Terrestrial Planet',
    iconType: 'terrestrial',
    typeDescription: 'A rocky world with a solid, compact surface and high density.',
    diameter: '6,779 km',
    orbitalOrder: '4th Planet from Sun',
    funFact: 'Known as the Red Planet and home to Olympus Mons, the largest volcano in the solar system.',
    img: '/textures/objects/mars.jpg',
    acceptedNames: ['mars']
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    type: 'Moon (Jupiter)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '5,268 km',
    orbitalOrder: 'Orbits Jupiter (Largest Moon)',
    funFact: 'The largest moon in the solar system, even bigger than the planet Mercury.',
    img: '/textures/objects/ganymede.jpg',
    acceptedNames: ['ganymede']
  },
  {
    id: 'titan',
    name: 'Titan',
    type: 'Moon (Saturn)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '5,149 km',
    orbitalOrder: 'Orbits Saturn',
    funFact: 'The only moon with a thick atmosphere and liquid methane lakes on its surface.',
    img: '/textures/objects/titan.jpg',
    acceptedNames: ['titan']
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Planet',
    astronomicalType: 'Terrestrial Planet',
    iconType: 'terrestrial',
    typeDescription: 'A rocky world with a solid, compact surface and high density.',
    diameter: '4,879 km',
    orbitalOrder: '1st Planet from Sun',
    funFact: 'The fastest planet in the solar system, orbiting the Sun every 88 Earth days.',
    img: '/textures/objects/mercury.jpg',
    acceptedNames: ['mercury']
  },
  {
    id: 'callisto',
    name: 'Callisto',
    type: 'Moon (Jupiter)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '4,820 km',
    orbitalOrder: 'Orbits Jupiter',
    funFact: 'Has one of the most heavily cratered surfaces in the entire solar system.',
    img: '/textures/objects/callisto.jpg',
    acceptedNames: ['callisto']
  },
  {
    id: 'io',
    name: 'Io',
    type: 'Moon (Jupiter)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '3,642 km',
    orbitalOrder: 'Orbits Jupiter',
    funFact: 'The most volcanically active celestial body in the entire solar system.',
    img: '/textures/objects/io.jpg',
    acceptedNames: ['io']
  },
  {
    id: 'luna',
    name: 'Luna (Moon)',
    type: 'Moon (Earth)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '3,474 km',
    orbitalOrder: 'Orbits Earth',
    funFact: "Earth's only natural satellite, regulating ocean tides and stabilizing axial tilt.",
    img: '/textures/objects/moon.jpg',
    acceptedNames: ['luna', 'moon', 'luna (moon)']
  },
  {
    id: 'europa',
    name: 'Europa',
    type: 'Moon (Jupiter)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '3,121 km',
    orbitalOrder: 'Orbits Jupiter',
    funFact: 'Hides a vast liquid water ocean beneath its bright, ice-covered crust.',
    img: '/textures/objects/europa.jpg',
    acceptedNames: ['europa']
  },
  {
    id: 'triton',
    name: 'Triton',
    type: 'Moon (Neptune)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '2,706 km',
    orbitalOrder: 'Orbits Neptune',
    funFact: "Orbits Neptune in the opposite direction of the planet's rotation (retrograde).",
    img: '/textures/objects/triton.jpg',
    acceptedNames: ['triton']
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '2,377 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Famous dwarf planet featuring a massive heart-shaped nitrogen glacier named Tombaugh Regio.',
    img: '/textures/objects/pluto.jpg',
    acceptedNames: ['pluto']
  },
  {
    id: 'eris',
    name: 'Eris',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '2,326 km',
    orbitalOrder: 'Scattered Disc (Kuiper Belt)',
    funFact: "A massive distant dwarf planet whose discovery led to Pluto's reclassification in 2006.",
    img: '/textures/objects/eris.jpg',
    acceptedNames: ['eris']
  },
  {
    id: 'titania',
    name: 'Titania',
    type: 'Moon (Uranus)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,576 km',
    orbitalOrder: 'Orbits Uranus',
    funFact: "The largest moon of Uranus, named after the queen of fairies in Shakespeare's play.",
    img: '/textures/objects/titania.jpg',
    acceptedNames: ['titania']
  },
  {
    id: 'haumea',
    name: 'Haumea',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '1,560 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Spins so rapidly that it has stretched into an elongated football-like ellipsoid.',
    img: '/textures/objects/haumea.jpg',
    acceptedNames: ['haumea']
  },
  {
    id: 'rhea',
    name: 'Rhea',
    type: 'Moon (Saturn)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,527 km',
    orbitalOrder: 'Orbits Saturn',
    funFact: "Saturn's second-largest moon, composed primarily of water ice with a rocky core.",
    img: '/textures/objects/rhea.jpg',
    acceptedNames: ['rhea']
  },
  {
    id: 'oberon',
    name: 'Oberon',
    type: 'Moon (Uranus)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,522 km',
    orbitalOrder: 'Orbits Uranus',
    funFact: 'The outermost major moon of Uranus, covered in heavy impact craters and dark deposits.',
    img: '/textures/objects/oberon.jpg',
    acceptedNames: ['oberon']
  },
  {
    id: 'iapetus',
    name: 'Iapetus',
    type: 'Moon (Saturn)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,469 km',
    orbitalOrder: 'Orbits Saturn',
    funFact: 'Distinctive two-toned moon with one pitch-black hemisphere and one bright icy hemisphere.',
    img: '/textures/objects/iapetus.jpg',
    acceptedNames: ['iapetus']
  },
  {
    id: 'makemake',
    name: 'Makemake',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '1,430 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Extremely cold dwarf planet covered in frozen methane ice, named after a Rapa Nui deity.',
    img: '/textures/objects/makemake.jpg',
    acceptedNames: ['makemake']
  },
  {
    id: 'gonggong',
    name: 'Gonggong',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '1,230 km',
    orbitalOrder: 'Scattered Disc',
    funFact: 'Reddish dwarf planet named after a Chinese water god with a serpentine tail.',
    acceptedNames: ['gonggong', '225088 gonggong']
  },
  {
    id: 'charon',
    name: 'Charon',
    type: 'Moon (Pluto)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,212 km',
    orbitalOrder: 'Orbits Pluto',
    funFact: 'So large compared to Pluto that they orbit a shared center of mass outside Pluto.',
    img: '/textures/objects/charon.jpg',
    acceptedNames: ['charon']
  },
  {
    id: 'umbriel',
    name: 'Umbriel',
    type: 'Moon (Uranus)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,169 km',
    orbitalOrder: 'Orbits Uranus',
    funFact: 'The darkest major moon of Uranus, reflecting very little incident sunlight.',
    acceptedNames: ['umbriel']
  },
  {
    id: 'ariel',
    name: 'Ariel',
    type: 'Moon (Uranus)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,158 km',
    orbitalOrder: 'Orbits Uranus',
    funFact: "Has the brightest surface of all Uranus's moons with deep fault canyons across its terrain.",
    img: '/textures/objects/ariel.jpg',
    acceptedNames: ['ariel']
  },
  {
    id: 'dione',
    name: 'Dione',
    type: 'Moon (Saturn)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,123 km',
    orbitalOrder: 'Orbits Saturn',
    funFact: 'Features dramatic bright ice cliffs formed by tectonic fractures across its icy surface.',
    img: '/textures/objects/dione.jpg',
    acceptedNames: ['dione']
  },
  {
    id: 'quaoar',
    name: 'Quaoar',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '1,110 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Dwarf planet encircled by a rare ring system located far beyond its Roche limit.',
    acceptedNames: ['quaoar', '50000 quaoar']
  },
  {
    id: 'tethys',
    name: 'Tethys',
    type: 'Moon (Saturn)',
    astronomicalType: 'Moon',
    iconType: 'moon',
    typeDescription: 'A natural satellite that orbits a larger planet or dwarf planet.',
    diameter: '1,062 km',
    orbitalOrder: 'Orbits Saturn',
    funFact: 'Dominated by Ithaca Chasma, a giant canyon trench stretching 2,000 km across its surface.',
    img: '/textures/objects/tethys.jpg',
    acceptedNames: ['tethys']
  },
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '939 km',
    orbitalOrder: 'Asteroid Belt',
    funFact: 'The largest object in the asteroid belt and the first dwarf planet visited by spacecraft.',
    img: '/textures/objects/ceres.jpg',
    acceptedNames: ['ceres']
  },
  {
    id: 'orcus',
    name: 'Orcus',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '910 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Often called the "anti-Pluto" because its orbit around the Sun is an exact mirror of Pluto\'s.',
    acceptedNames: ['orcus', '90482 orcus']
  },
  {
    id: 'sedna',
    name: 'Sedna',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '995 km',
    orbitalOrder: 'Detached Trans-Neptunian',
    funFact: 'Has an extremely elongated 11,400-year orbit taking it to the distant Oort Cloud.',
    acceptedNames: ['sedna', '90377 sedna']
  },
  {
    id: 'salacia',
    name: 'Salacia',
    type: 'Dwarf Planet',
    astronomicalType: 'Dwarf Planet',
    iconType: 'dwarf',
    typeDescription: 'A spherical celestial body orbiting the Sun that has not cleared its orbital neighborhood.',
    diameter: '846 km',
    orbitalOrder: 'Kuiper Belt',
    funFact: 'Very dark trans-Neptunian object named after the Roman goddess of saltwater.',
    img: '/textures/objects/salacia.jpg',
    acceptedNames: ['salacia', '120347 salacia']
  }
];

export const MNEMONIC_WORDS_LIST = [
  'Silly',       // 0: Sun (S)
  'Jumpy',       // 1: Jupiter (J)
  'Students',    // 2: Saturn (S)
  'Usually',     // 3: Uranus (U)
  'Never',       // 4: Neptune (N)
  'Ever',        // 5: Earth (E)
  'Visit',       // 6: Venus (V)
  'My',          // 7: Mars (M)
  "Grandma's",   // 8: Ganymede (G)
  'Tiny',        // 9: Titan (T)
  'Mountain',    // 10: Mercury (M)
  'Cabin',       // 11: Callisto (C)
  'Inside.',     // 12: Io (I)
  'Little',      // 13: Luna (L)
  'Elephants',   // 14: Europa (E)
  'Tumble',      // 15: Triton (T)
  'Past',        // 16: Pluto (P)
  'Every',       // 17: Eris (E)
  'Tall',        // 18: Titania (T)
  'Hill.',       // 19: Haumea (H)
  'Red',         // 20: Rhea (R)
  'Owls',        // 21: Oberon (O)
  'Inspect',     // 22: Iapetus (I)
  'Many',        // 23: Makemake (M)
  'Giant',       // 24: Gonggong (G)
  'Craters',     // 25: Charon (C)
  'Under',       // 26: Umbriel (U)
  'Ancient',     // 27: Ariel (A)
  'Dust.',       // 28: Dione (D)
  'Quiet',       // 29: Quaoar (Q)
  'Travelers',   // 30: Tethys (T)
  'Cross',       // 31: Ceres (C)
  'Outer',       // 32: Orcus (O)
  'Space',       // 33: Sedna (S)
  'Safely.'      // 34: Salacia (S)
];

export function getMnemonicUpToIndex(index) {
  if (index < 0) return '';
  const maxIdx = Math.min(index, MNEMONIC_WORDS_LIST.length - 1);
  const slice = MNEMONIC_WORDS_LIST.slice(0, maxIdx + 1);
  return slice.join(' ') + '...';
}
