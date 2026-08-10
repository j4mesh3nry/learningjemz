export const planets = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    distanceFromSun: 57900000,
    diameter: 4879,
    mass: '3.30 × 10^23 kg',
    gravity: '3.7 m/s²',
    dayLength: '1,408 hours',
    yearLength: '88 Earth days',
    moons: 0,
    atmosphere: 'Minimal (oxygen, sodium, hydrogen, helium, potassium)',
    temperature: '-173°C to 427°C',
    funFacts: [
      'Mercury is the fastest planet, traveling through space at nearly 47 kilometers per second.',
      'It has wrinkles called Lobate Scarps that formed as the planet cooled and shrank.',
      'Despite being closest to the Sun, it is not the hottest planet.'
    ],
    color: '#8c8c8c',
    emoji: '🪐'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    distanceFromSun: 108200000,
    diameter: 12104,
    mass: '4.87 × 10^24 kg',
    gravity: '8.87 m/s²',
    dayLength: '5,832 hours',
    yearLength: '225 Earth days',
    moons: 0,
    atmosphere: 'Thick (mostly carbon dioxide with sulfuric acid clouds)',
    temperature: '462°C (Average)',
    funFacts: [
      'Venus spins in the opposite direction of most other planets.',
      'It is the hottest planet in our solar system due to a runaway greenhouse effect.',
      'A day on Venus is longer than its year.'
    ],
    color: '#e3bb76',
    emoji: '🪐'
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    distanceFromSun: 149600000,
    diameter: 12742,
    mass: '5.97 × 10^24 kg',
    gravity: '9.8 m/s²',
    dayLength: '24 hours',
    yearLength: '365.25 days',
    moons: 1,
    atmosphere: 'Nitrogen (78%), Oxygen (21%), Argon (0.9%)',
    temperature: '-88°C to 58°C (Average 15°C)',
    funFacts: [
      'Earth is the only known planet to support life.',
      'It has a powerful magnetic field that protects it from harmful solar radiation.',
      'Liquid water covers about 71% of Earth\'s surface.'
    ],
    color: '#2b82c9',
    emoji: '🌍'
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    distanceFromSun: 227900000,
    diameter: 6779,
    mass: '6.42 × 10^23 kg',
    gravity: '3.71 m/s²',
    dayLength: '24 hours 37 minutes',
    yearLength: '687 Earth days',
    moons: 2,
    atmosphere: 'Thin (carbon dioxide, nitrogen, argon)',
    temperature: '-153°C to 20°C (Average -60°C)',
    funFacts: [
      'Mars is known as the Red Planet because of iron oxide (rust) on its surface.',
      'It is home to Olympus Mons, the tallest volcano in the solar system.',
      'Mars has the largest dust storms in the solar system, which can last for months.'
    ],
    color: '#c1440e',
    emoji: '🪐'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    distanceFromSun: 778500000,
    diameter: 139820,
    mass: '1.90 × 10^27 kg',
    gravity: '24.79 m/s²',
    dayLength: '9 hours 55 minutes',
    yearLength: '11.86 Earth years',
    moons: 95,
    atmosphere: 'Hydrogen and Helium',
    temperature: '-110°C (Cloud top)',
    funFacts: [
      'Jupiter is the largest planet in our solar system; you could fit over 1,300 Earths inside it.',
      'The Great Red Spot is a giant storm that has been raging for hundreds of years.',
      'Jupiter has the shortest day of any planet in the solar system.'
    ],
    color: '#d39c7e',
    emoji: '🪐'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    distanceFromSun: 1434000000,
    diameter: 116460,
    mass: '5.68 × 10^26 kg',
    gravity: '10.44 m/s²',
    dayLength: '10.7 hours',
    yearLength: '29.5 Earth years',
    moons: 146,
    atmosphere: 'Hydrogen and Helium',
    temperature: '-140°C (Cloud top)',
    funFacts: [
      'Saturn has the most spectacular and complex ring system.',
      'It is the least dense planet; it could float in water if there were a bathtub big enough.',
      'Saturn experiences seasons, just like Earth, but each season lasts over 7 years.'
    ],
    color: '#ead6b8',
    emoji: '🪐'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    distanceFromSun: 2871000000,
    diameter: 50724,
    mass: '8.68 × 10^25 kg',
    gravity: '8.69 m/s²',
    dayLength: '17 hours 14 minutes',
    yearLength: '84 Earth years',
    moons: 28,
    atmosphere: 'Hydrogen, Helium, Methane',
    temperature: '-195°C',
    funFacts: [
      'Uranus rotates on its side, making it look like it\'s rolling around the Sun like a barrel.',
      'It is often referred to as an "Ice Giant" due to its mantle of water, ammonia, and methane ices.',
      'Uranus has faint rings made of black dust particles and large rocks.'
    ],
    color: '#4b70dd',
    emoji: '🪐'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    distanceFromSun: 4495000000,
    diameter: 49244,
    mass: '1.02 × 10^26 kg',
    gravity: '11.15 m/s²',
    dayLength: '16 hours 6 minutes',
    yearLength: '165 Earth years',
    moons: 16,
    atmosphere: 'Hydrogen, Helium, Methane',
    temperature: '-200°C',
    funFacts: [
      'Neptune has the strongest winds in the solar system, reaching up to 2,100 km/h.',
      'It was the first planet located through mathematical calculations rather than telescope observations.',
      'Its blue color comes from methane in its atmosphere, though the exact shade is a bit of a mystery.'
    ],
    color: '#274687',
    emoji: '🪐'
  }
];

export const moons = [
  { id: 'moon', name: 'Moon', planet: 'Earth', diameter: '3,474 km', orbitalPeriod: '27.3 days', funFact: 'The only celestial body besides Earth that humans have visited.', discoveredBy: 'Prehistoric humans', discoveredYear: 'Antiquity' },
  { id: 'phobos', name: 'Phobos', planet: 'Mars', diameter: '22 km', orbitalPeriod: '7.6 hours', funFact: 'Orbits so close to Mars that it rises in the west and sets in the east twice a day.', discoveredBy: 'Asaph Hall', discoveredYear: '1877' },
  { id: 'deimos', name: 'Deimos', planet: 'Mars', diameter: '12 km', orbitalPeriod: '30.3 hours', funFact: 'Smaller and further away from Mars than Phobos.', discoveredBy: 'Asaph Hall', discoveredYear: '1877' },
  { id: 'io', name: 'Io', planet: 'Jupiter', diameter: '3,642 km', orbitalPeriod: '1.8 days', funFact: 'The most volcanically active body in the solar system.', discoveredBy: 'Galileo Galilei', discoveredYear: '1610' },
  { id: 'europa', name: 'Europa', planet: 'Jupiter', diameter: '3,121 km', orbitalPeriod: '3.5 days', funFact: 'Thought to have an ocean of liquid water beneath its icy surface.', discoveredBy: 'Galileo Galilei', discoveredYear: '1610' },
  { id: 'ganymede', name: 'Ganymede', planet: 'Jupiter', diameter: '5,268 km', orbitalPeriod: '7.1 days', funFact: 'The largest moon in our solar system, bigger than the planet Mercury.', discoveredBy: 'Galileo Galilei', discoveredYear: '1610' },
  { id: 'callisto', name: 'Callisto', planet: 'Jupiter', diameter: '4,820 km', orbitalPeriod: '16.7 days', funFact: 'Has one of the most heavily cratered surfaces in the solar system.', discoveredBy: 'Galileo Galilei', discoveredYear: '1610' },
  { id: 'titan', name: 'Titan', planet: 'Saturn', diameter: '5,149 km', orbitalPeriod: '15.9 days', funFact: 'The only moon known to have a dense atmosphere and liquid lakes (of methane).', discoveredBy: 'Christiaan Huygens', discoveredYear: '1655' },
  { id: 'enceladus', name: 'Enceladus', planet: 'Saturn', diameter: '504 km', orbitalPeriod: '1.3 days', funFact: 'Shoots geysers of water ice and vapor from its south pole.', discoveredBy: 'William Herschel', discoveredYear: '1789' },
  { id: 'mimas', name: 'Mimas', planet: 'Saturn', diameter: '396 km', orbitalPeriod: '22.6 hours', funFact: 'Looks like the Death Star from Star Wars due to a giant crater named Herschel.', discoveredBy: 'William Herschel', discoveredYear: '1789' },
  { id: 'rhea', name: 'Rhea', planet: 'Saturn', diameter: '1,527 km', orbitalPeriod: '4.5 days', funFact: 'The second-largest moon of Saturn, mostly made of water ice.', discoveredBy: 'Giovanni Domenico Cassini', discoveredYear: '1672' },
  { id: 'titania', name: 'Titania', planet: 'Uranus', diameter: '1,576 km', orbitalPeriod: '8.7 days', funFact: 'The largest moon of Uranus, named after the queen of the fairies in A Midsummer Night\'s Dream.', discoveredBy: 'William Herschel', discoveredYear: '1787' },
  { id: 'oberon', name: 'Oberon', planet: 'Uranus', diameter: '1,522 km', orbitalPeriod: '13.5 days', funFact: 'The outermost of the major moons of Uranus.', discoveredBy: 'William Herschel', discoveredYear: '1787' },
  { id: 'triton', name: 'Triton', planet: 'Neptune', diameter: '2,706 km', orbitalPeriod: '5.8 days', funFact: 'Orbits Neptune in the opposite direction of the planet\'s rotation (retrograde orbit).', discoveredBy: 'William Lassell', discoveredYear: '1846' },
  { id: 'charon', name: 'Charon', planet: 'Pluto', diameter: '1,212 km', orbitalPeriod: '6.4 days', funFact: 'So large compared to Pluto that they are sometimes considered a double dwarf planet system.', discoveredBy: 'James Christy', discoveredYear: '1978' }
];

export const stars = [
  { id: 'sun', name: 'Sun', type: 'Yellow Dwarf (G2V)', distance: '0.0000158', magnitude: '-26.74', constellation: 'None', temperature: '5,500°C', color: '#ffcc00', funFact: 'Accounts for 99.86% of the mass in the solar system.' },
  { id: 'sirius', name: 'Sirius', type: 'Main-sequence (A1V)', distance: '8.6', magnitude: '-1.46', constellation: 'Canis Major', temperature: '9,940°C', color: '#aaccff', funFact: 'The brightest star in the night sky.' },
  { id: 'betelgeuse', name: 'Betelgeuse', type: 'Red Supergiant', distance: '642.5', magnitude: '0.42', constellation: 'Orion', temperature: '3,500°C', color: '#ff6600', funFact: 'It is so large that if it replaced the Sun, it would reach beyond the orbit of Mars.' },
  { id: 'rigel', name: 'Rigel', type: 'Blue Supergiant', distance: '864.3', magnitude: '0.18', constellation: 'Orion', temperature: '12,100°C', color: '#88bbff', funFact: 'Actually a multiple star system, not just a single star.' },
  { id: 'vega', name: 'Vega', type: 'Main-sequence (A0V)', distance: '25.0', magnitude: '0.03', constellation: 'Lyra', temperature: '9,600°C', color: '#aaddff', funFact: 'Was the northern pole star around 12,000 BCE and will be again around the year 13,727.' },
  { id: 'polaris', name: 'Polaris', type: 'Yellow Supergiant', distance: '433.8', magnitude: '1.97', constellation: 'Ursa Minor', temperature: '6,000°C', color: '#ffffdd', funFact: 'Known as the North Star because it is currently aligned with Earth\'s axis of rotation.' },
  { id: 'proxima-centauri', name: 'Proxima Centauri', type: 'Red Dwarf (M5.5Ve)', distance: '4.24', magnitude: '11.13', constellation: 'Centaurus', temperature: '3,000°C', color: '#ff4400', funFact: 'The closest known star to the Sun.' },
  { id: 'alpha-centauri-a', name: 'Alpha Centauri A', type: 'Yellow Dwarf (G2V)', distance: '4.37', magnitude: '-0.01', constellation: 'Centaurus', temperature: '5,790°C', color: '#ffdd22', funFact: 'Part of a triple star system that includes Proxima Centauri.' },
  { id: 'antares', name: 'Antares', type: 'Red Supergiant', distance: '550.0', magnitude: '0.96', constellation: 'Scorpius', temperature: '3,400°C', color: '#ff5500', funFact: 'Its name means "Rival of Mars" because of its reddish color.' },
  { id: 'aldebaran', name: 'Aldebaran', type: 'Orange Giant', distance: '65.3', magnitude: '0.85', constellation: 'Taurus', temperature: '3,900°C', color: '#ff8833', funFact: 'Known as the "Eye of the Bull" in the constellation Taurus.' }
];

export const quizQuestions = [
  // Planets
  { id: 'q1', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1, category: 'planets', difficulty: 1 },
  { id: 'q2', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Uranus'], correctIndex: 2, category: 'planets', difficulty: 1 },
  { id: 'q3', question: 'Which planet has the most prominent ring system?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctIndex: 1, category: 'planets', difficulty: 1 },
  { id: 'q4', question: 'Which is the hottest planet in our solar system?', options: ['Mercury', 'Venus', 'Mars', 'Jupiter'], correctIndex: 1, category: 'planets', difficulty: 2 },
  { id: 'q5', question: 'Which planet rotates on its side?', options: ['Venus', 'Mars', 'Uranus', 'Neptune'], correctIndex: 2, category: 'planets', difficulty: 2 },
  { id: 'q6', question: 'Which planet has the Great Red Spot?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], correctIndex: 1, category: 'planets', difficulty: 1 },
  { id: 'q7', question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctIndex: 1, category: 'planets', difficulty: 1 },
  { id: 'q8', question: 'Which planet has the shortest day?', options: ['Earth', 'Mars', 'Jupiter', 'Mercury'], correctIndex: 2, category: 'planets', difficulty: 3 },
  { id: 'q9', question: 'Which of these is NOT a terrestrial planet?', options: ['Mercury', 'Earth', 'Neptune', 'Mars'], correctIndex: 2, category: 'planets', difficulty: 2 },
  { id: 'q10', question: 'On which planet does a day last longer than a year?', options: ['Mercury', 'Venus', 'Uranus', 'Neptune'], correctIndex: 1, category: 'planets', difficulty: 3 },

  // Moons
  { id: 'q11', question: 'What is the largest moon in the solar system?', options: ['Titan', 'Ganymede', 'Callisto', 'The Moon'], correctIndex: 1, category: 'moons', difficulty: 2 },
  { id: 'q12', question: 'Which moon is known to have a dense atmosphere?', options: ['Europa', 'Io', 'Titan', 'Triton'], correctIndex: 2, category: 'moons', difficulty: 2 },
  { id: 'q13', question: 'Which moon is the most volcanically active body in the solar system?', options: ['Io', 'Enceladus', 'Mimas', 'Phobos'], correctIndex: 0, category: 'moons', difficulty: 3 },
  { id: 'q14', question: 'Phobos and Deimos are moons of which planet?', options: ['Jupiter', 'Saturn', 'Mars', 'Venus'], correctIndex: 2, category: 'moons', difficulty: 2 },
  { id: 'q15', question: 'Which moon orbits Neptune in the opposite direction of the planet\'s rotation?', options: ['Titania', 'Oberon', 'Triton', 'Charon'], correctIndex: 2, category: 'moons', difficulty: 3 },
  { id: 'q16', question: 'Which moon looks somewhat like the Death Star?', options: ['Mimas', 'Enceladus', 'Iapetus', 'Dione'], correctIndex: 0, category: 'moons', difficulty: 2 },
  { id: 'q17', question: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctIndex: 1, category: 'moons', difficulty: 3 },
  { id: 'q18', question: 'Europa is a moon of which planet?', options: ['Mars', 'Jupiter', 'Saturn', 'Uranus'], correctIndex: 1, category: 'moons', difficulty: 1 },
  { id: 'q19', question: 'Which moon is thought to have an ocean of liquid water beneath its ice?', options: ['Io', 'Europa', 'Titan', 'Phobos'], correctIndex: 1, category: 'moons', difficulty: 2 },
  { id: 'q20', question: 'What is Earth\'s only natural satellite called?', options: ['Luna', 'The Moon', 'Both A and B', 'Titan'], correctIndex: 2, category: 'moons', difficulty: 1 },

  // Stars
  { id: 'q21', question: 'What type of star is our Sun?', options: ['Red Dwarf', 'White Dwarf', 'Yellow Dwarf', 'Blue Supergiant'], correctIndex: 2, category: 'stars', difficulty: 2 },
  { id: 'q22', question: 'What is the brightest star in the night sky?', options: ['Polaris', 'Sirius', 'Betelgeuse', 'Vega'], correctIndex: 1, category: 'stars', difficulty: 1 },
  { id: 'q23', question: 'Which star is commonly known as the North Star?', options: ['Sirius', 'Rigel', 'Polaris', 'Antares'], correctIndex: 2, category: 'stars', difficulty: 1 },
  { id: 'q24', question: 'What is the closest star to the Sun?', options: ['Alpha Centauri A', 'Proxima Centauri', 'Sirius', 'Barnard\'s Star'], correctIndex: 1, category: 'stars', difficulty: 2 },
  { id: 'q25', question: 'Betelgeuse is located in which constellation?', options: ['Ursa Major', 'Orion', 'Scorpius', 'Lyra'], correctIndex: 1, category: 'stars', difficulty: 2 },
  { id: 'q26', question: 'Which of these stars is a Red Supergiant?', options: ['Vega', 'Sirius', 'Rigel', 'Betelgeuse'], correctIndex: 3, category: 'stars', difficulty: 3 },
  { id: 'q27', question: 'What color are the hottest stars?', options: ['Red', 'Yellow', 'White', 'Blue'], correctIndex: 3, category: 'stars', difficulty: 2 },
  { id: 'q28', question: 'What is the name of the star known as the "Eye of the Bull"?', options: ['Aldebaran', 'Antares', 'Rigel', 'Polaris'], correctIndex: 0, category: 'stars', difficulty: 3 },
  { id: 'q29', question: 'Which star was the pole star around 12,000 BCE?', options: ['Polaris', 'Vega', 'Sirius', 'Altair'], correctIndex: 1, category: 'stars', difficulty: 3 },
  { id: 'q30', question: 'What element makes up most of a star?', options: ['Oxygen', 'Helium', 'Carbon', 'Hydrogen'], correctIndex: 3, category: 'stars', difficulty: 1 }
];

export const dwarfPlanets = [
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'Dwarf Planet',
    distanceFromSun: 5906380000,
    diameter: 2377,
    mass: '1.31 × 10^22 kg',
    gravity: '0.62 m/s²',
    dayLength: '153.3 hours',
    yearLength: '248 Earth years',
    moons: 5,
    atmosphere: 'Thin (nitrogen, methane, carbon monoxide)',
    temperature: '-229°C (Average)',
    funFacts: [
      'Pluto has a heart-shaped glacier called Tombaugh Regio made of nitrogen ice.',
      'It was considered the 9th planet from 1930 to 2006 before being reclassified as a dwarf planet.',
      'Pluto and its largest moon Charon are tidally locked — they always show the same face to each other.'
    ],
    color: '#a89f91',
    emoji: '🪐'
  },
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'Dwarf Planet',
    distanceFromSun: 413000000,
    diameter: 939,
    mass: '9.39 × 10^20 kg',
    gravity: '0.28 m/s²',
    dayLength: '9 hours',
    yearLength: '4.6 Earth years',
    moons: 0,
    atmosphere: 'Transient water vapor',
    temperature: '-105°C (Average)',
    funFacts: [
      'Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner solar system.',
      'It was the first dwarf planet visited by a spacecraft (NASA\'s Dawn mission, 2015).',
      'Bright spots in Occator Crater are salt deposits from briny water that reached the surface.'
    ],
    color: '#c8c2b8',
    emoji: '🪐'
  }
];

export const flashcards = [
  { id: 'f1', front: 'Mercury', back: 'The smallest and fastest planet. It has no moons and a very thin atmosphere.', category: 'planets', image: '🪐' },
  { id: 'f2', front: 'Venus', back: 'The hottest planet in our solar system due to a thick, toxic atmosphere that traps heat.', category: 'planets', image: '🪐' },
  { id: 'f3', front: 'Earth', back: 'Our home planet, and the only known planet to harbor life and liquid water on its surface.', category: 'planets', image: '🌍' },
  { id: 'f4', front: 'Mars', back: 'The "Red Planet," colored by iron oxide (rust). Home to the largest volcano, Olympus Mons.', category: 'planets', image: '🪐' },
  { id: 'f5', front: 'Jupiter', back: 'The largest planet, a gas giant with a Great Red Spot (a massive storm) and 95 known moons.', category: 'planets', image: '🪐' },
  { id: 'f6', front: 'Saturn', back: 'A gas giant famous for its spectacular and complex ring system made of ice and rock.', category: 'planets', image: '🪐' },
  { id: 'f7', front: 'Uranus', back: 'An ice giant that rotates on its side. It has a pale blue color due to methane gas.', category: 'planets', image: '🪐' },
  { id: 'f8', front: 'Neptune', back: 'The most distant planet. It is dark, cold, and whipped by supersonic winds.', category: 'planets', image: '🪐' },
  { id: 'f9', front: 'The Moon', back: 'Earth\'s only natural satellite. It regulates our tides and stabilizes Earth\'s wobble.', category: 'moons', image: '🌕' },
  { id: 'f10', front: 'Ganymede', back: 'Jupiter\'s largest moon, and the biggest moon in the solar system (larger than Mercury).', category: 'moons', image: '🌖' },
  { id: 'f11', front: 'Titan', back: 'Saturn\'s largest moon. It has a thick atmosphere and lakes of liquid methane.', category: 'moons', image: '🌗' },
  { id: 'f12', front: 'Io', back: 'A moon of Jupiter, famous for being the most volcanically active body in the solar system.', category: 'moons', image: '🌔' },
  { id: 'f13', front: 'Europa', back: 'A moon of Jupiter covered in ice, likely hiding a vast ocean of liquid water underneath.', category: 'moons', image: '🧊' },
  { id: 'f14', front: 'Phobos & Deimos', back: 'The two tiny, potato-shaped moons of Mars. Phobos is slowly spiraling towards Mars.', category: 'moons', image: '🥔' },
  { id: 'f15', front: 'Enceladus', back: 'A small icy moon of Saturn that shoots geysers of water vapor into space.', category: 'moons', image: '💦' },
  { id: 'f16', front: 'Triton', back: 'Neptune\'s largest moon. It orbits in the opposite direction to Neptune\'s rotation.', category: 'moons', image: '🔄' },
  { id: 'f17', front: 'Sun', back: 'A yellow dwarf star at the center of our solar system. It provides the energy for life on Earth.', category: 'stars', image: '☀️' },
  { id: 'f18', front: 'Sirius', back: 'The brightest star in the night sky. Often called the "Dog Star." It is part of a binary system.', category: 'stars', image: '✨' },
  { id: 'f19', front: 'Polaris', back: 'The North Star. It appears almost stationary in the sky because it lies near the north celestial pole.', category: 'stars', image: '⭐' },
  { id: 'f20', front: 'Proxima Centauri', back: 'A red dwarf star that is the closest known star to our solar system.', category: 'stars', image: '🔴' },
  { id: 'f21', front: 'Betelgeuse', back: 'A massive red supergiant star in the constellation Orion. It is expected to explode as a supernova.', category: 'stars', image: '💥' },
  { id: 'f22', front: 'Rigel', back: 'A blue supergiant star in Orion. It is much hotter and brighter than our Sun.', category: 'stars', image: '🔵' },
  { id: 'f23', front: 'Vega', back: 'A bright blue-white star in the constellation Lyra. It has been a pole star in the past.', category: 'stars', image: '🌟' },
  { id: 'f24', front: 'Aldebaran', back: 'An orange giant star in Taurus. It is known as the "Eye of the Bull."', category: 'stars', image: '👁️' },
  { id: 'f25', front: 'Light Year', back: 'The distance light travels in one Earth year (about 9.46 trillion kilometers). Used to measure distances in space.', category: 'stars', image: '📏' },
  { id: 'f26', front: 'Supernova', back: 'The explosive death of a massive star, briefly outshining an entire galaxy.', category: 'stars', image: '🎇' },
  { id: 'f27', front: 'Black Hole', back: 'A region of space where gravity is so strong that nothing, not even light, can escape.', category: 'stars', image: '🕳️' },
  { id: 'f28', front: 'Galaxy', back: 'A vast system of stars, gas, dust, and dark matter held together by gravity (e.g., the Milky Way).', category: 'stars', image: '🌌' },
  { id: 'f29', front: 'Constellation', back: 'A grouping of stars that form a recognizable pattern or picture in the sky.', category: 'stars', image: '🌠' },
  { id: 'f30', front: 'Asteroid Belt', back: 'A region between Mars and Jupiter filled with rocky bodies (asteroids) orbiting the Sun.', category: 'planets', image: '🪨' }
];

export const sunData = {
  id: 'sun',
  name: 'Sun',
  type: 'Yellow Dwarf Star',
  distanceFromSun: 0,
  diameter: 1392700,
  mass: '1.989 × 10^30 kg',
  gravity: '274 m/s²',
  dayLength: '27 Earth days',
  yearLength: '230 million yrs',
  moons: 0,
  atmosphere: 'Hydrogen & Helium',
  temperature: '5,500°C',
  funFacts: [
    'The Sun contains 99.86% of the mass in the entire Solar System.',
    'It takes 8 minutes and 20 seconds for light from the Sun to reach Earth.',
    'Over one million Earths could fit inside the Sun.'
  ],
  color: '#FDB813',
  emoji: '☀️'
};
