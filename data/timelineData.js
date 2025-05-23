const timelineData = [
{
    date: '1700s',
    location: 'Europe',
    title: 'Human-Passenger Flights on Hot Air Balloons',
    description: 'Marked the first time humans experienced flight, sparking public fascination and further experimentation with aerial navigation.',
    img: "/api/placeholder/100/100",
    category: 'Aviation Technology',
    row: 1,
    group: "AT",
    connections: ['Early Kites', 'Kongming\'s Sky Lantern', 'Leonardo da Vinci\'s Flying Machines']
  },
{
    date: '1890s',
    location: 'Europe',
    title: 'Gliders and the Foundation of Controlled Flight',
    description: 'Otto Lilienthal’s glider flights in the 1890s represented the first controlled, repeatable manned flights using fixed wings and an understanding of lift and control surfaces. Demonstrated the feasibility of heavier-than-air flight and directly influenced the Wright brothers. These gliders allowed for steering and control, essential for the development of powered aircraft.',
    img: "/api/placeholder/100/100",
    category: 'Aviation Technology',
    row: 1,
    group: "AT",
    connections: ['Silk Production and Trade', 'The Industrial Revolution', 'Leonardo da Vinci\'s Bird Sketches']
  },
{
    date: '1900s',
    location: 'Worldwide',
    title: 'Dawn of Modern Aviation: Powered Flight',
    description: 'A frenzied period of experimentation with countless inventors, engineers, and enthusiasts building prototypes to unlock the secrets of powered flight. This era was marked by a trial-and-error approach where many attempts paved the way for breakthroughs that defined the future of aviation.',
    img: "/api/placeholder/100/100",
    category: 'Aviation Technology',
    row: 1,
    group: "AT",
    connections: ['Silk Production and Trade', 'The Industrial Revolution', 'Leonardo da Vinci\'s Bird Sketches']
  },
{
    date: '1900-1930s',
    location: 'Worldwide',
    title: 'Doomed Alternative: Zeppelins',
    description: 'Zeppelins were the first technology to enable sustained, long-distance passenger travel by air, bridging the gap between balloons and modern airplanes.',
    img: "/api/placeholder/100/100",
    category: 'Aviation Technology',
    row: 1,
    group: "AT-Zeppelins",
    connections: ['The Industrial Revolution']
  },
      {
        date: '2700s BCE',
        location: 'China',
        title: 'Silk Production and Trade',
        description: 'Chinese silk becomes a prized lightweight...',
        img: 'img/silk.jpg',
        people: ['Legendary Empress Leizu (mythical)'],
        category: 'Sociocultural & Economic Factors',
        connections: [
          "Early Kites", 
          "Bartolomeu de Gusmão\'s Passarola",
            "Human-Passenger Flights on Hot Air Balloons",
            "Gliders and the Foundation of Controlled Flight",
        ],
       group: "SF", 
        row: 1
      },
  {
    date: '100s BCE',
    location: 'China',
    title: 'Paper Production and Trade',
    description: 'Paper is invented in China and then spreads to the Arabic world in the 700s BC, then to Medieval Europe. A key material innovation that aided future flight experiments. The lightweight material was later used in hot air lanterns in China. Even later, Leonardo da Vinci and George Cayley used paper and other lightweight materials to create models and test their theories of flight ',
    img: "img/paper.gif",
    people: ['Mozi', 'Lu Ban'],
    category: 'Sociocultural & Economic Factors',
    row: 1,
    group: "SF",
    connections: ['Early Kites', 'Kongming\'s Sky Lantern', 'Leonardo da Vinci\'s Flying Machines']
  },
  {
    date: '500s BCE',
    location: 'China',
    title: 'Early Kites',
    description: 'Kites are invented in China, an early form of human flight.',
    img: "img/earlykites.jpg",
    people: ['Mozi', 'Lu Ban'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 1,
    connections: ['Paper Production and Trade']
  },
      {
        date: '500s BCE',
        location: 'India',
        title: 'The Pushpaka Vimana',
        description: 'A mythical self-moving aerial vehicle described in the Ramayana epic; one of the earliest stories featuring a ‘flying machine.’',
        img: "img/ThePushpakaVimanaa.jpg",
        people: ['The Pushpaka Vimana'],
        category: 'Sociocultural & Economic Factors',
        row: 1,
       group: 'SF',
        connections: ['Abbas Ibn Firnas\'s jump', 'Eilmer of Malmesbury\'s jump', 'João Torto\'s Failed Flight Attempt' ]
      },
     {
    date: '500s BCE',
    location: 'Greece',
    title: 'The Myth of Icarus and Daedalus',
    description: 'This myth, often depicted in classical art and referenced by poets and playwrights...',
    img: "img/Icarus.jpg",
    people: ['The Myth of Icarus and Daedalus'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    row: 1,
    connections: ["Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]
  },
  {
    date: '400s BCE',
    location: 'Tarentum, Italy',
    title: "Archytas' Flying Pigeon",
    description: "Archytas of Tarentum creates a wooden pigeon that could \"fly\" using a jet of air.",
    img: "img/pigeon.jpg",
    people: ['Archytas of Tarentum'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 1,
    connections: ['The Myth of Icarus and Daedalus']
  },
  {
    date: '200s BCE',
    location: 'Syracuse, Sicily',
    title: "Archimedes' Buoyancy Principle",
    description: "Archimedes discovers the principles of buoyancy, which later influence theories of flight.",
    img: "/api/placeholder/100/100",
    people: ['Archimedes'],
    category: 'Theoretical Breakthroughs',
    group: 'CSB',
    row: 1,
    connections: ["Roger Bacon's Air Support Theory", "Robert Hooke's Airflow"]
  },
  {
    date: '200s BCE',
    location: 'China',
    title: "Kongming's Sky Lantern",
    description: "Kongming invents the sky lantern, the first hot air balloon. From its military use, it became known as the Kongming lantern.",
    img: "img/skylanterns.jpg",
    people: ['Kongming'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 1,
    connections: ['Early Kites', 'Paper Production and Trade']
  },
  {
    date: '100s BCE',
    location: 'Alexandria, Egypt',
    title: "Hero's Aeolipile",
    description: "Hero of Alexandria designs the aeolipile, a simple steam turbine. While not used for flight, it demonstrated the potential of steam power.",
    img: "img/Aeolipile.png",
    people: ['Hero of Alexandria'],
    category: 'Theoretical Breakthroughs',
    group: 'CSB',
    row: 1,
    connections: ["Archytas' Flying Pigeon", "Henri Giffard's Dirigible"]
  },
  {
    date: '800s CE',
    location: 'Spain',
    title: "Abbas Ibn Firnas's jump",
    description: "Abbas Ibn Firnas jumps from a tower wearing a cloak stiffened with wooden struts.",
    img: "img/abbas.jpg",
    people: ['Abbas Ibn Firnas'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 2,
    connections: ["The Myth of Icarus and Daedalus", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]
  },
  {
    date: '800s CE',
    location: 'Middle East and India',
    title: 'The Ebony Horse Tale',
    description: "One of the tales from One Thousand and One Night. An inventor presents a magical mechanical horse to a Persian king.",
    img: "img/Ebonyhorse.jpg",
    people: ['The Ebony Horse'],
    category: 'Sociocultural & Economic Factors',
        group: 'SF',
    row: 2,
    connections: ["Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]  // No connections here.
  },
  {
    date: '900s CE',
    location: 'China',
    title: 'Gunpowder Invention',
    description: "Invented in China for fireworks and warfare, gunpowder also sowed the seed for rocketry.",
    img: 'img/gunpowder.jppg',
    people: ['Chinese Alchemists'],
    category: 'Theoretical Breakthroughs',
        group: 'CSB',
    connections: [],
    row: 2
  },
  {
    date: '1000s CE',
    location: 'England',
    title: "Eilmer of Malmesbury's jump",
    description: "A Benedictine monk who tries to fly with a glider-like apparatus. He may have glided a short distance..",
    img: "img/Eilmer.jpg",
    people: ['Eilmer of Malmesbury'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 2,
    connections: ["The Myth of Icarus and Daedalus", "Abbas Ibn Firnas's jump", "João Torto's Failed Flight Attempt", 'Early Kites']
  },
  {
    date: '1290s CE',
    location: 'England',
    title: "Roger Bacon's Air Support Theory",
    description: "Roger Bacon theorizes that air can support objects like water supports boats.",
    img: "img/RogerBacon.jpg",
    people: ['Roger Bacon'],
    category: 'Theoretical Breakthroughs',
    group: 'CSB',
    row: 2,
    connections: ["Archimedes' Buoyancy Principle", "Robert Hooke's Airflow"]
  },
  {
    date: '1440s CE',
    location: 'Mainz, Germany',
    title: "Gutenberg's Printing Press",
    description: "Johannes Gutenberg develops the movable-type printing press, drastically speeding the circulation of new ideas. Affordable books and journals spread knowledge of flight experiments widely.",
    img: 'img/Gutenberg.jpg',
    people: ['Johannes Gutenberg'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    connections: ['Paper Production and Trade'],
    row: 2
  },
  {
    date: '1480s CE',
    location: 'Italy',
    title: "Leonardo da Vinci's Flying Machines",
    description: "Leonardo da Vinci sketches various flying machines, including an ornithopter and a precursor to the helicopter.",
    img: "img/Leonardo.jpg",
    people: ['Leonardo da Vinci'],
    category: 'Sociocultural & Economic Factors',
    group: "SF",
    row: 2,
    connections: ['Paper Production and Trade']
  },
  {
    date: '1480s CE',
    location: 'Italy',
    title: "Leonardo da Vinci's Bird Anatomy Sketches",
    description: "Leonardo da Vinci's studies of bird flight included detailed observations of how air interacts with wings to generate lift. His sketches showed an understanding of aerodynamic lift, drag, and control surfaces. Leonardo’s approach was empirical and mechanical.",
    img: "/api/placeholder/100/100",
    people: ['Leonardo da Vinci'],
    category: 'Theoretical Breakthroughs',
    group: "CSB",
    row: 2,
    connections: ['Paper Production and Trade']
  },
  {
    date: '1540s CE',
    location: 'Portugal',
    title: "João Torto's Failed Flight Attempt",
    description: "João Torto, a Portuguese barber, attempts human flight with fabric wings but falls to his death.",
    img: "img/Torto.jpg",
    people: ['João Torto'],
    category: 'Aviation Technology',
    group: 'AT',
    row: 2,
    connections: ["The Myth of Icarus and Daedalus", "Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump"]
  },
{
    date: '1600–1800s CE',
    location: 'Europe',
    title: 'The Gentleman Scientist Tradition',
    description: 'Wealthy or well-connected amateurs (often aristocrats) pursued scientific research as a leisure activity.',
    img: 'img/Gentlemen.jpg',
    people: ['Sir George Cayley'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    connections: [],
    row: 2
},
  {
    date: '1634 CE',
    location: 'Holy Roman Empire',
    title: "Kepler's Somnium",
    description: "One of the first “proto–science fiction” works. A fictional narrative describing a journey to the Moon...",
    img: "img/Somnium.jpg",
    people: ['Johannes Kepler'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    row: 2,
    connections: [] // No connections here.
  },
  {
    date: '1638 CE',
    location: 'England',
    title: "Francis Godwin's The Man in the Moone",
    description: "One of the first “proto–science fiction” works. A utopian story describing lunar travel using large, trained birds.",
    img: "img/Somnium.jpg",
    people: ['Francis Godwin'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    row: 2,
    connections: [] // No connections here.
  },
{
    date: '1657 CE',
    location: 'France',
    title: "Cyrano de Bergerac's Comical History of the States and Empires of the Moon",
    description: "One of the first “proto–science fiction” works. Although comedic, it proposed mechanical means of leaving Earth...",
    img: "img/Cyrano_Sonne.jpg",
    people: ['Cyrano de Bergerac'],
    category: 'Sociocultural & Economic Factors',
    group: 'SF',
    row: 2,
    connections: [] // No connections here.
},
        {
        date: '1659 CE',
        location: 'England',
        title: 'Robert Hooke\'s Airflow',
        description: 'Robert Hooke investigates concepts of drag and airflow, contributing to the body of knowledge that would eventually be applied to flight.',
        img: "/api/placeholder/100/100",
        people: ['Robert Hooke'],
        category: 'Theoretical Breakthroughs',
        group: 'CSB',
        row: 2,
        connections: ["Archimedes' Buoyancy Principle","Roger Bacon's Air Support Theory",'The Gentleman Scientist Tradition'] // No connections here.
    },
    {
        date: '1687 CE',
        location: 'England',
        title: 'Newton\'s Laws of Motion',
        description: 'Lays out the three laws of motion and universal gravitation, essential to understanding how and why aircraft can generate lift...',
        img: "/api/placeholder/100/100",
        people: ['Isaac Newton'],
        category: 'Theoretical Breakthroughs',
        group: 'CSB',
        row: 2,
        connections: ['The Gentleman Scientist Tradition'] // No connections here.
    },
    {
        date: '1709',
        location: 'Portugal',
        title: 'Bartolomeu de Gusmão\'s Passarola',
        description: 'Bartolomeu de Gusmão, a Brazilian-Portuguese priest, demonstrates a hot air balloon prototype called the "Passarola."',
        img: "img/gusmao.png",
        people: ['Bartolomeu de Gusmão'],
        category: 'Engineering Experiments & Demonstrations',
        group: 'EED',
        row: 3,
        connections: ["Kongming's Sky Lantern", "Archimedes' Buoyancy Principle"]
    },
        {
        date: '1726',
        location: 'England',
        title: 'Jonathan Swift\'s Flying Island of Laputa',
        description: 'Though satire, Laputa symbolizes the human longing to master flight and the sky—exaggerated to the point of political power...',
        img: "img/laputa.jpg",
        people: ['Jonathan Swift'],
        category: 'Sociocultural & Economic Factors',
        group: 'SF',
        row: 3,
        connections: [] // No connections here.
    },
    {
        date: '1738',
        location: 'Switzerland/Netherlands',
        title: 'Daniel Bernoulli\'s Hydrodynamica',
        description: 'Describes how pressure in a moving fluid decreases as velocity increases; foundational for many aerodynamic analyses of wing lift.',
        img: "/api/placeholder/100/100",
        people: ['Daniel Bernoulli'],
        category: 'Theoretical Breakthroughs',
        group: 'CSB',
        row: 3,
        connections: [] // No connections here.
    },
{
  date: '1760–1840',
  location: 'Great Britain',
  title: 'The Industrial Revolution',
  description: 'Steam power revolutionizes manufacturing and metallurgy, providing mass production methods and mechanical expertise that future aircraft builders would rely on.',
  img: '/api/placeholder/100/100',
  people: ['James Watt', 'Matthew Boulton'],
  category: 'Theoretical Breakthroughs',
    group: 'CSB',
  connections: ["Hero's Aeolipile"],
  row: 3
},
  {
    date: '1783',
    location: 'France',
    title: "Montgolfier Brothers' Hot Air Balloon",
    description: "Jean-François Pilâtre de Rozier and François Laurent d'Arlandes make the first manned flight in a hot air balloon built by the Montgolfier brothers.",
    img: "/api/placeholder/100/100",
    people: ['Jean-François Pilâtre de Rozier', "François Laurent d'Arlandes", 'Joseph-Michel Montgolfier', 'Jacques-Étienne Montgolfier'],
        group: 'EED',
    row: 4,
    category: 'Engineering Experiments & Demonstrations',
    connections: ["Kongming's Sky Lantern"]
  },
  {
    date: '1799',
    location: 'England',
    title: "George Cayley's Glider Design",
    description: "George Cayley designs the first modern glider with distinct lift, thrust, and control components.",
    img: "/api/placeholder/100/100",
    people: ['George Cayley'],
    row: 4,
    connections: ['Early Kites', 'The Gentleman Scientist Tradition'],
    group: 'CSB',
    category: "Theoretical Breakthroughs"
  },
  {
    date: '1839',
    location: 'United States',
    title: "Goodyear's Vulcanization of Rubber",
    description: "Charles Goodyear discovers how to vulcanize rubber, producing stronger, more elastic material...",
    img: '/api/placeholder/100/100',
    people: ['Charles Goodyear'],
    category: 'Theoretical Breakthroughs',
    group: 'CSB',
    connections: ['Industrial Revolution'],
    row: 4
  },
{
  date: '1850s',
  location: 'London, England',
  title: 'Great Exhibitions and World Fairs',
  description: 'International fair showcasing industrial inventions. A growing public interest in science and technology created a cultural environment that celebrated inventors and encouraged further experimentation. These exhibitions allowed inventors to exchange ideas and showcase prototypes.',
  img: '/api/placeholder/100/100',
  people: ['Prince Albert', 'Henry Cole'],
  category: 'Sociocultural & Economic Factors',
    group: 'SF',
  connections: ['Industrial Revolution'],
  row: 4
},
{
  date: '1852',
  location: 'France',
  title: "Henri Giffard's Dirigible",
  description: "Henri Giffard invents the first controllable dirigible powered by a steam engine.",
  img: "/api/placeholder/100/100",
  people: ['Henri Giffard'],
  row: 5,
  connections: ["Hero's Aeolipile", 'Industrial Revolution'],
    group: 'EED',
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1843',
  location: 'England',
  title: "William Henson's Aircraft Design",
  description: "William Henson patents an early aircraft design with fixed wings and a steam-powered engine.",
  img: "/api/placeholder/100/100",
  people: ['William Henson'],
  row: 6,
  connections: ["Hero's Aeolipile", "Leonardo da Vinci's Flying Machines"],
  group: 'EED',
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1853',
  location: 'England',
  title: "George Cayley's Manned Glider Flight",
  description: "George Cayley successfully flies the first manned glider. Developed principles of lift, drag, and fixed-wing aircraft.",
  img: "/api/placeholder/100/100",
  people: ['George Cayley'],
  row: 7,
  connections: ["George Cayley's Glider Design"],
    group: 'EED',
  category: "Engineering Experiments & Demonstrations"
},
{
 date: '1865-1904',
 location: 'England',
 title: "Jules Verne's Novels",
 description: "Verne’s meticulous detail and semi-scientific style enthralled readers...",
 img: "/api/placeholder/100/100",
 people: ['Jules Verne'],
 row: 7,
 connections: [],
    group: 'SF',
 category: "Sociocultural & Economic Factors"
},
{
  date: '1871',
  location: 'England',
  title: "Francis Wenham's Wind Tunnel",
  description: "Francis Wenham builds the first wind tunnel to study aerodynamics. Proved that long, narrow wings generate more lift.",
  img: "/api/placeholder/100/100",
  people: ['Francis Wenham'],
  row: 7,
    group: 'CSB',
  connections: [],
  category: "Theoretical Breakthroughs"
},
{
  date: '1884',
  location: 'France',
  title: "Charles Renard and Arthur Constantin's Le France",
  description: "Charles Renard and Arthur Constantin Krebs launch a non-rigid airship that inspires Zeppelin.",
  img: "/api/placeholder/100/100",
  people: ['Charles Renard', 'Arthur Constantin Krebs'],
  row: 7,
  connections: [],
    group: 'EED',
  category: "Engineering Experiments & Demonstrations"
},
  {
    date: '1885',
    location: 'Coventry, England',
    title: 'Safety Bicycle Revolution',
    description: 'John Kemp Starley produces the “safety bicycle.” This sparks a bicycle boom.',
    img: '/api/placeholder/100/100',
    people: ['John Kemp Starley'],
    category: 'Engineering Experiments & Demonstrations',
        group: 'EED',
    connections: [],
    row: 7
  },
  {
    date: '1886',
    location: 'United States/France',
    title: 'Hall–Héroult Process for Aluminum',
    description: 'Charles Martin Hall and Paul Héroult separately discover a cost-effective method to produce aluminum...',
    img: '/api/placeholder/100/100',
    people: ['Charles Martin Hall', 'Paul Héroult'],
    category: 'Theoretical Breakthroughs',
        group: 'CSB',
    connections: ['Industrial Revolution'],
    row: 7
  },
{
  date: '1891',
  location: 'Germany',
  title: "Otto Lilienthal's Glider Flights",
  description: "Otto Lilienthal achieves controlled glider flights and documents aerodynamic research, proving human flight was possible.",
  img: "/api/placeholder/100/100",
  people: ['Otto Lilienthal'],
  row: 7,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
 date: '1896',
 location: 'United States',
 title: "Octave Chanute's Biplane Glider",
 description: "Octave Chanute advances glider designs and builds a successful biplane glider, improving aviation theories.",
 img: "/api/placeholder/100/100",
 people: ['Octave Chanute'],
 row: 7,
    group: 'EED',
 connections: [],
 category: "Engineering Experiments & Demonstrations"
},
{
  date: '1890',
  location: 'France',
  title: "Clément Ader's Éole",
  description: "Clément Ader builds the Éole, a bat-like steam-powered aircraft, which briefly lifts off but lacks control.",
  img: "/api/placeholder/100/100",
  people: ['Clément Ader'],
  row: 8,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1894',
  location: 'United States/United Kingdom',
  title: "Hiram Maxim's Steam-Powered Biplane",
  description: "Hiram Maxim builds and tests a massive steam-powered biplane but fails to achieve sustained flight.",
  img: "/api/placeholder/100/100",
  people: ['Hiram Maxim'],
  row: 8,
  connections: [],
    group: 'EED',
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1896',
  location: 'United States',
  title: "Samuel Pierpont Langley's Aerodrome",
  description: "Samuel Pierpont Langley flies small, unmanned models successfully. Built the Aerodrome A, which failed at full scale.",
  img: "/api/placeholder/100/100",
  people: ['Samuel Pierpont Langley'],
  row: 8,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1899',
  location: 'United Kingdom',
  title: "Percy Pilcher's Powered Aircraft Design",
  description: "Percy Pilcher designs a powered aircraft but dies in a glider accident before testing it.",
  img: "/api/placeholder/100/100",
  people: ['Percy Pilcher'],
  row: 9,
    group: 'CSB',
  connections: [],
  category: "Theoretical Breakthroughs"
},
{
  date: '1900',
  location: 'Germany',
  title: "Ferdinand von Zeppelin's Rigid Airships",
  description: "Ferdinand von Zeppelin develops rigid airships, leading to widespread use of zeppelins.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'Zeppelins',
  connections: ['Hall–Héroult Process for Aluminum', "Charles Renard and Arthur Constantin's Le France"],
  category: "Zeppelins"
},
{
  date: '1906',
  location: 'Germany',
  title: "LZ 3 and Military Adoption",
  description: "Marked the beginning of military funding for Zeppelin development, establishing airships as potential reconnaissance and bomber platforms.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'Zeppelins',
  connections: ['Hall–Héroult Process for Aluminum'],
  category: "Zeppelins"
},
{
  date: '1909',
  location: 'Germany',
  title: "Zeppelin’s First Commercial Service",
  description: "The DELAG airline was the world’s first commercial airline, operating Zeppelin airships and carrying over 34,000 passengers without a fatal accident until World War I.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'Zeppelins',
  connections: ['Hall–Héroult Process for Aluminum'],
  category: "Zeppelins"
},
{
  date: '1919',
  location: 'Germany',
  title: "Treaty of Versailles",
  description: "The Treaty of Versailles imposed severe restrictions on Germany’s ability to build military airships, crippling Zeppelin development. Zeppelin development was forced to pivot to civilian roles, which proved unsustainable without military funding.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'Zeppelins',
  connections: ['Hall–Héroult Process for Aluminum'],
  category: "Zeppelins"
},
{
  date: '1937',
  location: 'Germany',
  title: "Hindenburg Disaster",
  description: "The dramatic end of the Hindenburg became one of the most famous disasters in aviation history, leaving a lasting legacy on the public consciousness.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'SF',
  connections: ['Hall–Héroult Process for Aluminum'],
  category: "Sociocultural & Economic Factors"
},
{
  date: '1939-1945',
  location: 'Europe',
  title: "Military Demand in World War II",
  description: "The typical cruising speed was 60–80 mph for Zappelin while early airplanes achieved speeds of 150–300 mph and continued to improve rapidly. During World War I, Zeppelins were slow-moving targets for fighter planes and anti-aircraft guns. Many were shot down, highlighting their fragility in combat.",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 9,
    group: 'SF',
  connections: ['Hall–Héroult Process for Aluminum'],
  category: "Sociocultural & Economic Factors"
},
  {
    date: '1901',
    location: 'France',
    title: 'Deutsch de la Meurthe Prize',
    description: 'Industrialist Henri Deutsch de la Meurthe offers prizes for airship and airplane feats...',
    img: '/api/placeholder/100/100',
    people: ['Henri Deutsch de la Meurthe'],
    category: 'Sociocultural & Economic Factors',
        group: 'SF',
    connections: [],
    row: 9
  },
{
  date: '1901',
  location: 'United States',
  title: "Gustave Whitehead's Reported Flight",
  description: "Gustave Whitehead reportedly flies in Connecticut, though documentation remains debated.",
  img: "/api/placeholder/100/100",
  people: ['Gustave Whitehead'],
  row: 9,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1902',
  location: 'France',
  title: "Georges Méliès's A Trip to the Moon",
  description: "Georges Méliès creates the iconic silent film, launching a bullet-shaped rocket to the Moon in a whimsical scenario.",
  img: "/api/placeholder/100/100",
  people: ['Georges Méliès'],
  row: 9,
  connections: ['First Moon Landing'],
    group: 'SF',
  category: "Sociocultural & Economic Factors"
},
{
  date: '1902',
  location: 'New Zealand',
  title: "Richard Pearse's Monoplane",
  description: "Richard Pearse builds a monoplane and makes brief, uncontrolled flights.",
  img: "/api/placeholder/100/100",
  people: ['Richard Pearse'],
  row: 9,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1903',
  location: 'Germany',
  title: "Karl Jatho's Powered Aircraft",
  description: "Karl Jatho builds an unstable monoplane that flies briefly but lacks thorough documentation.",
  img: "/api/placeholder/100/100",
  people: ['Karl Jatho'],
  row: 9,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
 date: '1903',
 location: 'Scotland',
 title: "Preston Watson's Alleged Flight",
 description: "Preston Watson allegedly flies, though no strong evidence exists.",
 img: "/api/placeholder/100/100",
 people: ['Preston Watson'],
 row: 9,
    group: 'EED',
 connections: [],
 category: "Engineering Experiments & Demonstrations"
},
{
  date: '1904',
  location: 'Germany',
  title: "Ludwig Prandtl’s Boundary-Layer Theory",
  description: "Prandtl’s insight that a thin layer of fluid near a surface governs most aerodynamic drag/energy loss...",
  img: "/api/placeholder/100/100",
  people: ['Ludwig Prandtl'],
  row: 9,
    group: 'CSB',
  connections: [],
  category: "Theoretical Breakthroughs"
},
{
  date: '1906',
  location: 'Brazil/France',
  title: "Alberto Santos-Dumont's 14-bis Flight",
  description: "Alberto Santos-Dumont flies the 14-bis in Paris—the first powered airplane flight recognized by the Aéro-Club de France.",
  img: "/api/placeholder/100/100",
  people: ['Alberto Santos-Dumont'],
  row: 10,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1906',
  location: 'Germany/Russia',
  title: "Martin Wilhelm Kutta & Nikolai Zhukovsky’s Lift Theorem",
  description: "Established the relationship between circulation around an airfoil and the lift force...",
  img: "/api/placeholder/100/100",
  people: ['Martin Wilhelm Kutta', 'Nikolai Zhukovsky'],
  row: 9,
    group: 'CSB',
  connections: [],
  category: "Theoretical Breakthroughs"
},
{
  date: '1907',
  location: 'Romania',
  title: "Traian Vuia's Monoplane",
  description: "Traian Vuia designs a monoplane with wheels that takes off unaided but flies only short distances.",
  img: "/api/placeholder/100/100",
  people: ['Traian Vuia'],
  row: 10,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1908',
  location: 'France',
  title: "Aída de Acosta Pilots Santos-Dumont's Dirigible",
  description: "Aída de Acosta becomes the first woman to pilot an aircraft: Santos-Dumont's dirigible No. 9.",
  img: "/api/placeholder/100/100",
  people: ['Aída de Acosta', 'Alberto Santos-Dumont'],
  row: 10,
    group: 'SF',
  connections: [],
  category: "Sociocultural & Economic Factors"
},
{
  date: '1908',
  location: 'England',
  title: "H.G. Wells's The War in the Air",
  description: "H.G. Wells's novel envisions how airplanes could revolutionize warfare, foreshadowing aerial battles of WWI.",
  img: "/api/placeholder/100/100",
  people: ['H.G. Wells'],
  row: 10,
  connections: [],
    group: 'SF',
  category: "Sociocultural & Economic Factors"
},
{
 date: '1908',
 location: 'United Kingdom',
 title: "John William Dunne's warplanes",
 description: "Develops tailless aircraft designs with military applications.",
 img: "/api/placeholder/100/100",
 people: ['John William Dunne'],
 row: 11,
    group: 'CSB',
 connections: [],
 category: "Theoretical Breakthroughs"
},
{
  date: '1909',
  location: 'France/England',
  title: 'Louis Blériot Crosses the English Channel',
  description: "Louis Blériot's successful Channel crossing proves the airplane's viability for transportation.",
  img: "/api/placeholder/100/100",
  people: ['Louis Blériot'],
  row: 11,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1910',
  location: 'Brazil',
  title: "Dimitri Sensaud de Lavaud's Flight in Latin America",
  description: "Dimitri Sensaud de Lavaud completes the first powered flight in Latin America.",
  img: "/api/placeholder/100/100",
  people: ['Dimitri Sensaud de Lavaud'],
  row: 11,
    group: 'EED',
  connections: [],
 category: "Engineering Experiments & Demonstrations"
},
{
  date: '1910',
  location: 'France',
  title: "Henri Fabre's Seaplane Flight",
  description: "Henri Fabre achieves the first successful seaplane flight.",
  img: "/api/placeholder/100/100",
  people: ['Henri Fabre'],
  row: 12,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1911',
  location: 'United States',
  title: "Calbraith Perry Rodgers' Transcontinental Flight",
  description: "Calbraith Perry Rodgers completes the first transcontinental flight across the United States.",
  img: "/api/placeholder/100/100",
  people: ['Calbraith Perry Rodgers'],
  row: 12,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
  {
    date: '1914–1918',
    location: 'Europe/Worldwide',
    title: 'Military Demand in World War I',
    description: 'World War I massively accelerates aircraft innovation...',
    img: '/api/placeholder/100/100',
    people: ['Various WWI Aircraft Pioneers'],
    category: 'Sociocultural & Economic Factors',
        group: 'SF',
    connections: [],
    row: 12
  },
{
  date: '1918',
  location: 'France',
  title: "Henry Farman's Aircraft in World War I",
  description: "Henry Farman develops aircraft used in World War I, advancing military aviation.",
  img: "/api/placeholder/100/100",
  people: ['Henry Farman'],
  row: 12,
    group: 'CSB',
  connections: [],
  category: "Theoretical Breakthroughs"
},
{
 date: '1910',
 location: 'Romania',
 title: "Henri Coandă's Coandă-1910",
 description: "Henri Coandă builds the Coandă-1910, possibly the first jet-propelled aircraft.",
 img: "/api/placeholder/100/100",
 people: ['Henri Coandă'],
 row: 13,
    group: 'EED',
 connections: [],
 category: "Engineering Experiments & Demonstrations"
},
{
  date: '1914',
  location: 'United States',
  title: 'First Commercial Airline',
  description: "The St. Petersburg-Tampa Airboat Line starts commercial flights, pioneering airline service.",
  img: "/api/placeholder/100/100",
  people: ['Thomas Benoist', 'Percival Fansler'],
  row: 13,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1928',
  location: 'Germany',
  title: 'The Graf Zeppelin',
  description: "The LZ 127 Graf Zeppelin, a large passenger-carrying rigid airship, enters commercial service...",
  img: "/api/placeholder/100/100",
  people: ['Ferdinand von Zeppelin'],
  row: 14,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
{
  date: '1947',
  location: 'United States',
  title: 'Breaking the Sound Barrier',
  description: "Chuck Yeager pilots the Bell X-1 to become the first to break the sound barrier in level flight.",
  img: "/api/placeholder/100/100",
  people: ['Chuck Yeager'],
  row: 14,
    group: 'EED',
  connections: [],
  category: "Engineering Experiments & Demonstrations"
},
  {
    date: '1969',
    location: 'United States',
    title: 'First Moon Landing',
    description: 'Neil Armstrong and Buzz Aldrin land on the Moon...',
    img: '/api/placeholder/100/100',
    people: ['Neil Armstrong', 'Buzz Aldrin'],
    row: 15,
        group: 'EED',
    connections: [],
    category: "Engineering Experiments & Demonstrations"
  },
    {
    date: '1957',
    location: 'USSR',
    title: 'Satellite Launch',
    description: 'First artificial satellite',
    img: '/api/placeholder/100/100',
    people: ['Sergei Korolev'],
    row: 15,
        group: 'SF',
    connections: [],
    category: "Sociocultural & Economic Factors"
  }
];
export default timelineData;
