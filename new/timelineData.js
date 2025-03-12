// The following code contains the key parts that need to be modified 
// in the timelineData.js file to match the new structure

// 1. You'll need to update the entire file, but here are the critical changes:

// MODIFIED MAPPING FUNCTION to ensure consistent structure:
function standardizeTimelineData() {
  window.timelineItems.forEach(item => {
    // Ensure proper category structure
    if (item.category === "Key Literary & Cultural Works";
      // Assign timePeriod based on date
      const year = parseTimelineDate(item.date); // This function needs to be available
      if (year < 1400) {
        item.timePeriod = "500 BCE to 1399 CE";
      } else if (year < 1800) {
        item.timePeriod = "1400 CE to 1799 CE";
      } else {
        item.timePeriod = "1800 CE to 1945 CE";
      }
      item.nodeType = "MAJOR";
    } 
    else if (item.category === "Socioeconomic Factors";
      
      // Assign timePeriod based on date
      const year = parseTimelineDate(item.date);
      if (year < 1400) {
        item.timePeriod = "500 BCE to 1399 CE";
      } else if (year < 1700) {
        item.timePeriod = "1400 CE to 1699 CE";
      } else if (year < 1890) {
        item.timePeriod = "1760 CE to 1890 CE";
      } else {
        item.timePeriod = "1890 CE to 1980 CE";
      }
      
      // Assign MAJOR or CIRCLE based on title keywords
      if (item.title.includes("Revolution") || 
          item.title.includes("System") || 
          item.title.includes("Tradition") || 
          item.title.includes("Military Demand") ||
          item.title.includes("Commercial Aviation") ||
          item.title.includes("World Fairs")) {
        item.nodeType = "MAJOR";
      } else {
        item.nodeType = "CIRCLE";
      }
    } 
    else if (item.category === "Scientific Theories and Breakthroughs";
      
      // Assign timePeriod based on date
      const year = parseTimelineDate(item.date);
      if (year < 1600) {
        item.timePeriod = "500 BCE to 1599 CE";
      } else if (year < 1770) {
        item.timePeriod = "1600 CE to 1760 CE";
      } else if (year < 1900) {
        item.timePeriod = "1770 CE to 1899 CE";
      } else {
        item.timePeriod = "1900s CE to 1945 CE";
      }
      
      item.nodeType = "CIRCLE";
    } 
    else if (item.category === "Practical Implementations";
      
    item.nodeType = "CIRCLE";     
      }
    
    // Default catch-all (should not happen with proper data)
    if (!item.excelCategory) {
      console.warn("Item missing category assignment:", item.title);
      item.excelCategory = "4. Practical Implementations";
      item.timePeriod = "4e. Race Toward Modern Aviation";
      item.nodeType = "Timeline";
    }
  });
  }

// Call this function after the timeline data is loaded
// standardizeTimelineData();



window.timelineItems = [
  
  
  // 1. KEY LITERARY & CULTURAL WORKS
  // ==============================
  // 1a. 500s BCE to 1399s CE
  {
    date: '500s BCE',
    location: 'Greece',
    title: 'The Myth of Icarus and Daedalus',
    description: 'This myth, often depicted in classical art and referenced by poets and playwrights...',
    img: "/api/placeholder/100/100",
    people: ['The Myth of Icarus and Daedalus'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "500s BCE to 1399s CE",
    connections: ["Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]
  },
  {
    date: '500s BCE',
    location: 'India',
    title: 'The Pushpaka Vimana',
    description: 'A mythical self-moving aerial vehicle described in the Ramayana epic; one of the earliest stories featuring a flying machine.',
    img: "/api/placeholder/100/100",
    people: ['The Pushpaka Vimana'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "500s BCE to 1399s CE",
    connections: ['Abbas Ibn Firnas\'s jump', 'Eilmer of Malmesbury\'s jump', 'João Torto\'s Failed Flight Attempt']
  },
  {
    date: '800s CE',
    location: 'Middle East and India',
    title: 'The Ebony Horse Tale',
    description: "One of the tales from One Thousand and One Night. An inventor presents a magical mechanical horse to a Persian king.",
    img: "/api/placeholder/100/100",
    people: ['The Ebony Horse'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "500s BCE to 1399s CE",
    connections: ["Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]
  },
  
  // 1b. 1400 CE to 1799 CE
  {
    date: '1634',
    location: 'Holy Roman Empire',
    title: "Kepler's Somnium",
    description: "One of the first 'proto–science fiction' works. A fictional narrative describing a journey to the Moon...",
    img: "/api/placeholder/100/100",
    people: ['Johannes Kepler'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1799 CE",
    connections: []
  },
  {
    date: '1638',
    location: 'England',
    title: "Francis Godwin's The Man in the Moone",
    description: "One of the first 'proto–science fiction' works. A utopian story describing lunar travel using large, trained birds.",
    img: "/api/placeholder/100/100",
    people: ['Francis Godwin'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1799 CE",
    connections: []
  },
  {
    date: '1657',
    location: 'France',
    title: "Cyrano de Bergerac's Comical History of the States and Empires of the Moon",
    description: "One of the first 'proto–science fiction' works. Although comedic, it proposed mechanical means of leaving Earth...",
    img: "/api/placeholder/100/100",
    people: ['Cyrano de Bergerac'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1799 CE",
    connections: []
  },
  {
    date: '1726',
    location: 'England',
    title: "Jonathan Swift's Flying Island of Laputa",
    description: 'Though satire, Laputa symbolizes the human longing to master flight and the sky—exaggerated to the point of political power...',
    img: "/api/placeholder/100/100",
    people: ['Jonathan Swift'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1799 CE",
    connections: []
  },
  
  // 1c. 1800s CE to 1945 CE
  {
    date: '1865-1904',
    location: 'England',
    title: "Jules Verne's Novels",
    description: "Verne's meticulous detail and semi-scientific style enthralled readers...",
    img: "/api/placeholder/100/100",
    people: ['Jules Verne'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1800 CE to 1945 CE",
    connections: []
  },
  {
    date: '1902',
    location: 'France',
    title: "Georges Méliès's A Trip to the Moon",
    description: "Georges Méliès creates the iconic silent film, launching a bullet-shaped rocket to the Moon in a whimsical scenario.",
    img: "/api/placeholder/100/100",
    people: ['Georges Méliès'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1800 CE to 1945 CE",
    connections: ['First Moon Landing']
  },
  {
    date: '1908',
    location: 'England',
    title: "H.G. Wells's The War in the Air",
    description: "H.G. Wells's novel envisions how airplanes could revolutionize warfare, foreshadowing aerial battles of WWI.",
    img: "/api/placeholder/100/100",
    people: ['H.G. Wells'],
    Category: "Key Literary & Cultural Works",
    Subcategory: "MAJOR",
    TimePeriod: "1800 CE to 1945 CE",
    connections: []
  },
  
  // 2. SOCIOECONOMIC FACTORS
  // ==============================
  // 2a. 500s BCE to 1399s CE
  {
    date: '2700s BCE',
    location: 'China',
    title: 'The Silk Road',
    description: 'Chinese silk becomes a prized lightweight...',
    img: "/api/placeholder/100/100",
    people: ['Legendary Empress Leizu (mythical)'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "500s BCE to 1399s CE",
    connections: [
      "Early Kites", 
      "Bartolomeu de Gusmão\'s Passarola",
      "Human-Passenger Flights on Hot Air Balloons",
      "Gliders and the Foundation of Controlled Flight",
    ]
  },
  {
    date: '100s BCE',
    location: 'China',
    title: 'Paper Production and Trade',
    description: 'Paper is invented in China and then spreads to the Arabic world in the 700s BC, then to Medieval Europe. A key material innovation that aided future flight experiments.',
    img: "/api/placeholder/100/100",
    people: ['Mozi', 'Lu Ban'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "500s BCE to 1350 CE",
    connections: ['The Silk Road', 'Early Kites', "Kongming's Sky Lantern", "Leonardo da Vinci's Flying Machines"]
  },

  // 2b. 1400 CE to 1699 CE
  {
    date: '1400s CE',
    location: 'Europe',
    title: 'Renaissance Patronage System',
    description: 'Wealthy patrons supporting scientific and artistic endeavors that advanced flight concepts.',
    img: "/api/placeholder/100/100",
    people: ['Various Renaissance Patrons'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1699 CE",
    connections: ["Leonardo da Vinci's Flying Machines"]
  },
  {
    date: '1480s CE',
    location: 'Italy',
    title: "Leonardo da Vinci's Flying Machines",
    description: "Leonardo da Vinci sketches various flying machines, including an ornithopter and a precursor to the helicopter.",
    img: "/api/placeholder/100/100",
    people: ['Leonardo da Vinci'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1400 CE to 1699 CE",
    connections: ['Paper Production and Trade']
  },
  {
    date: '1440s CE',
    location: 'Mainz, Germany',
    title: "Gutenberg's Printing Press",
    description: "Johannes Gutenberg develops the movable-type printing press, drastically speeding the circulation of new ideas.",
    img: "/api/placeholder/100/100",
    people: ['Johannes Gutenberg'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1699 CE",
    connections: ['Paper Production and Trade']
  },
  {
    date: '1600–1800s CE',
    location: 'Europe',
    title: 'The Gentleman Scientist Tradition',
    description: 'Wealthy or well-connected amateurs (often aristocrats) pursued scientific research as a leisure activity.',
    img: "/api/placeholder/100/100",
    people: ['Sir George Cayley'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1400 CE to 1699 CE",
    connections: []
  },
  
  // 2c. 1760s CE to 1890s CE
  {
    date: '1760–1840',
    location: 'Great Britain',
    title: 'The Industrial Revolution',
    description: 'Steam power revolutionizes manufacturing and metallurgy, providing mass production methods and mechanical expertise that future aircraft builders would rely on.',
    img: "/api/placeholder/100/100",
    people: ['James Watt', 'Matthew Boulton'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1760 CE to 1890 CE",
    connections: ["Hero's Aeolipile"]
  },
  {
    date: '1839',
    location: 'United States',
    title: "Goodyear's Vulcanization of Rubber",
    description: "Charles Goodyear discovers how to vulcanize rubber, producing stronger, more elastic material...",
    img: "/api/placeholder/100/100",
    people: ['Charles Goodyear'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1760 CE to 1890 CE",
    connections: ['Industrial Revolution']
  },
  {
    date: '1850s',
    location: 'London, England',
    title: 'Great Exhibitions, Prizes, and World Fairs',
    description: 'International fair showcasing industrial inventions. A growing public interest in science and technology.',
    img: "/api/placeholder/100/100",
    people: ['Prince Albert', 'Henry Cole'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1760 CE to 1890 CE",
    connections: ['Industrial Revolution']
  },
  {
    date: '1886',
    location: 'United States/France',
    title: 'Hall–Héroult Process for Aluminum',
    description: 'Charles Martin Hall and Paul Héroult separately discover a cost-effective method to produce aluminum...',
    img: "/api/placeholder/100/100",
    people: ['Charles Martin Hall', 'Paul Héroult'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1760 CE to 1890 CE",
    connections: ['Industrial Revolution']
  },
    // 2d. 1890 CE to 1980 CE
  {
    date: '1901',
    location: 'France',
    title: 'Deutsch de la Meurthe Prize',
    description: 'Industrialist Henri Deutsch de la Meurthe offers prizes for airship and airplane feats...',
    img: "/api/placeholder/100/100",
    people: ['Henri Deutsch de la Meurthe'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  
 {
    date: '1914–1918',
    location: 'Europe/Worldwide',
    title: 'Military Demand in World War I',
    description: 'World War I massively accelerates aircraft innovation...',
    img: "/api/placeholder/100/100",
    people: ['Various WWI Aircraft Pioneers'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
 {
    date: '1920-1950',
    location: 'Europe/Worldwide',
    title: 'Post-War Commercial Aviation Infrastructure',
    description: 'World War I massively accelerates aircraft innovation...',
    img: "/api/placeholder/100/100",
    people: ['Various Aircraft Pioneers'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
 {
    date: '1950-1980',
    location: 'USA and USSR',
    title: 'Military-Industrial Complex and Cold War',
    description: 'World War I massively accelerates aircraft innovation...',
    img: "/api/placeholder/100/100",
    people: ['Various Aircraft Pioneers'],
    Category: "Socioeconomic Factors",
    Subcategory: "MAJOR",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1918',
    location: 'France',
    title: "Henry Farman's Aircraft in World War I",
    description: "Henry Farman develops aircraft used in World War I, advancing military aviation.",
    img: "/api/placeholder/100/100",
    people: ['Henry Farman'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1906',
    location: 'Germany',
    title: "LZ 3 and Military Adoption",
    description: "Marked the beginning of military funding for Zeppelin development, establishing airships as potential reconnaissance and bomber platforms.",
    img: "/api/placeholder/100/100",
    people: ['Ferdinand von Zeppelin'],
    TimeLineCategory: "Zeppelins",
    Category: "Socioeconomic Factors",
    Subcategory: "TIMELINE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: ['Hall–Héroult Process for Aluminum']
  },
  {
    date: '1911',
    location: 'United States',
    title: "Calbraith Perry Rodgers' Transcontinental Flight",
    description: "Calbraith Perry Rodgers completes the first transcontinental flight across the United States.",
    img: "/api/placeholder/100/100",
    people: ['Calbraith Perry Rodgers'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1914',
    location: 'United States',
    title: 'First Commercial Airline',
    description: "The St. Petersburg-Tampa Airboat Line starts commercial flights, pioneering airline service.",
    img: "/api/placeholder/100/100",
    people: ['Thomas Benoist', 'Percival Fansler'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1937',
    location: 'Germany',
    title: "Hindenburg Disaster",
    description: "The dramatic end of the Hindenburg became one of the most famous disasters in aviation history, leaving a lasting legacy on the public consciousness.",
    img: "/api/placeholder/100/100",
    people: ['Ferdinand von Zeppelin'],
    TimeLineCategory: "Zeppelins",
    Category: "Socioeconomic Factors",
    Subcategory: "TIMELINE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: ['Hall–Héroult Process for Aluminum']
  },
  {
    date: '1947',
    location: 'United States',
    title: 'Breaking the Sound Barrier',
    description: "Chuck Yeager pilots the Bell X-1 to become the first to break the sound barrier in level flight.",
    img: "/api/placeholder/100/100",
    people: ['Chuck Yeager'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1957',
    location: 'USSR',
    title: 'Satellite Launch',
    description: 'First artificial satellite',
    img: "/api/placeholder/100/100",
    people: ['Sergei Korolev'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  {
    date: '1969',
    location: 'United States',
    title: 'First Moon Landing',
    description: 'Neil Armstrong and Buzz Aldrin land on the Moon...',
    img: "/api/placeholder/100/100",
    people: ['Neil Armstrong', 'Buzz Aldrin'],
    Category: "Socioeconomic Factors",
    Subcategory: "CIRCLE",
    TimePeriod: "1890 CE to 1980 CE",
    connections: []
  },
  
  // 3. SCIENTIFIC THEORIES BREAKTHROUGHS
  // ==============================
  // 3a. 500s BCE to 1599s CE
  {
    date: '200s BCE',
    location: 'Syracuse, Sicily',
    title: "Archimedes' Buoyancy Principle",
    description: "Archimedes discovers the principles of buoyancy, which later influence theories of flight.",
    img: "/api/placeholder/100/100",
    people: ['Archimedes'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "500 BCE to 1599 CE",
    connections: ["Roger Bacon's Air Support Theory", "Robert Hooke's Airflow"]
  },
  {
    date: '100s BCE',
    location: 'Alexandria, Egypt',
    title: "Hero's Aeolipile",
    description: "Hero of Alexandria designs the aeolipile, a simple steam turbine. While not used for flight, it demonstrated the potential of steam power.",
    img: "/api/placeholder/100/100",
    people: ['Hero of Alexandria'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "500 BCE to 1599 CE",
    connections: ["Archytas' Flying Pigeon", "Henri Giffard's Dirigible"]
  },
  {
    date: '1290s CE',
    location: 'England',
    title: "Roger Bacon's Air Support Theory",
    description: "Roger Bacon theorizes that air can support objects like water supports boats.",
    img: "/api/placeholder/100/100",
    people: ['Roger Bacon'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "500 BCE to 1599 CE",
    connections: ["Archimedes' Buoyancy Principle", "Robert Hooke's Airflow"]
  },
  {
    date: '1480s CE',
    location: 'Italy',
    title: "Leonardo da Vinci's Bird Anatomy Sketches",
    description: "Leonardo da Vinci's studies of bird flight included detailed observations of how air interacts with wings to generate lift.",
    img: "/api/placeholder/100/100",
    people: ['Leonardo da Vinci'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "500 BCE to 1599 CE",
    connections: ['Paper Production and Trade']
  },
  
  // 3b. 1600s CE to 1760s CE
  {
    date: '1659',
    location: 'England',
    title: "Robert Hooke's Airflow",
    description: 'Robert Hooke investigates concepts of drag and airflow, contributing to the body of knowledge that would eventually be applied to flight.',
    img: "/api/placeholder/100/100",
    people: ['Robert Hooke'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "500 BCE to 1599 CE",
    connections: ["Archimedes' Buoyancy Principle", "Roger Bacon's Air Support Theory", 'The Gentleman Scientist Tradition']
  },
  {
    date: '1687',
    location: 'England',
    title: "Newton's Laws of Motion",
    description: 'Lays out the three laws of motion and universal gravitation, essential to understanding how and why aircraft can generate lift...',
    img: "/api/placeholder/100/100",
    people: ['Isaac Newton'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1600 CE to 1760 CE",
    connections: ['The Gentleman Scientist Tradition']
  },
  {
    date: '1709',
    location: 'Portugal',
    title: "Bartolomeu de Gusmão's Passarola Design",
    description: 'Theoretical design for a hot air balloon called the "Passarola."',
    img: "/api/placeholder/100/100",
    people: ['Bartolomeu de Gusmão'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1600 CE to 1760 CE",
    connections: ["Kongming's Sky Lantern", "Archimedes' Buoyancy Principle"]
  },
  {
    date: '1738',
    location: 'Switzerland/Netherlands',
    title: "Daniel Bernoulli's Hydrodynamica",
    description: 'Describes how pressure in a moving fluid decreases as velocity increases; foundational for many aerodynamic analyses of wing lift.',
    img: "/api/placeholder/100/100",
    people: ['Daniel Bernoulli'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1600 CE to 1760 CE",
    connections: []
  },
  
  // 3c. 1770s CE to 1899s CE
  {
    date: '1799',
    location: 'England',
    title: "George Cayley's Glider Design",
    description: "George Cayley designs the first modern glider with distinct lift, thrust, and control components.",
    img: "/api/placeholder/100/100",
    people: ['George Cayley'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: ['Early Kites', 'The Gentleman Scientist Tradition']
  },
  {
    date: '1799',
    location: 'England',
    title: "Cayley's Fixed-Wing Concept",
    description: "George Cayley's fixed-wing concept revolutionizes flight theory.",
    img: "/api/placeholder/100/100",
    people: ['George Cayley'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: ["George Cayley's Glider Design"]
  },
  {
    date: '1824',
    location: 'France',
    title: "Sadi Carnot's cycle",
    description: "Sadi Carnot describes the theoretical limits of heat engines, influencing future aircraft engine design.",
    img: "/api/placeholder/100/100",
    people: ['Sadi Carnot'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  {
    date: '1871',
    location: 'England',
    title: "Francis Wenham's Wind Tunnel",
    description: "Francis Wenham builds the first wind tunnel to study aerodynamics. Proved that long, narrow wings generate more lift.",
    img: "/api/placeholder/100/100",
    people: ['Francis Wenham'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  {
    date: '1871',
    location: 'England',
    title: "Wenham and Browning's systematic testing of aerodynamic shapes",
    description: "Systematic testing of different wing shapes and configurations.",
    img: "/api/placeholder/100/100",
    people: ['Francis Wenham', 'John Browning'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: ["Francis Wenham's Wind Tunnel"]
  },
  {
    date: '1876',
    location: 'Germany',
    title: "Nikolaus Otto's Thermodynamic principles applied to lighter engines",
    description: "Development of more efficient internal combustion engines.",
    img: "/api/placeholder/100/100",
    people: ['Nikolaus Otto'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  {
    date: '1890s',
    location: 'United States',
    title: "Octave Chanute's improved components",
    description: "Octave Chanute's theoretical improvements to aircraft design.",
    img: "/api/placeholder/100/100",
    people: ['Octave Chanute'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  {
    date: '1896',
    location: 'United States',
    title: "Samuel Pierpont Langley's Aerodrome models",
    description: "Theoretical models that influenced early aircraft design.",
    img: "/api/placeholder/100/100",
    people: ['Samuel Pierpont Langley'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  {
    date: '1899',
    location: 'United Kingdom',
    title: "Percy Pilcher's Powered Aircraft Design",
    description: "Percy Pilcher designs a powered aircraft but dies in a glider accident before testing it.",
    img: "/api/placeholder/100/100",
    people: ['Percy Pilcher'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1770 CE to 1899 CE",
    connections: []
  },
  
  // 3d. 1900s CE to 1945 CE
  {
    date: '1904',
    location: 'Germany',
    title: "Ludwig Prandtl's Boundary-Layer Theory",
    description: "Prandtl's insight that a thin layer of fluid near a surface governs most aerodynamic drag/energy loss...",
    img: "/api/placeholder/100/100",
    people: ['Ludwig Prandtl'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  {
    date: '1906',
    location: 'Germany/Russia',
    title: "Martin Wilhelm Kutta & Nikolai Zhukovsky's Lift Theorem",
    description: "Established the relationship between circulation around an airfoil and the lift force...",
    img: "/api/placeholder/100/100",
    people: ['Martin Wilhelm Kutta', 'Nikolai Zhukovsky'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  {
    date: '1908',
    location: 'United Kingdom',
    title: "John William Dunne's tailless aircraft designs",
    description: "Develops tailless aircraft designs with military applications.",
    img: "/api/placeholder/100/100",
    people: ['John William Dunne'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  {
    date: '1908',
    location: 'United Kingdom',
    title: "John William Dunne's Mathematical principles of inherent stability",
    description: "Theoretical principles for aircraft stability.",
    img: "/api/placeholder/100/100",
    people: ['John William Dunne'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  {
    date: '1910',
    location: 'Romania',
    title: "Henri Coandă's theoretical work",
    description: "Henri Coandă's theoretical contributions to jet propulsion.",
    img: "/api/placeholder/100/100",
    people: ['Henri Coandă'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  {
    date: '1914-1918',
    location: 'Worldwide',
    title: "Operational envelopes and performance limitations developed by practical testing by early aviators during WWI",
    description: "Theoretical understanding of aircraft performance limitations.",
    img: "/api/placeholder/100/100",
    people: ['Various WWI Aviators'],
    Category: "Scientific Theories and Breakthroughs",
    Subcategory: "CIRCLE",
    TimePeriod: "1900 CE to 1945 CE",
    connections: []
  },
  
  // 4. PRACTICAL IMPLEMENTATIONS
  // ==============================
  // 4a. Non-Human Flight
  {
    date: '500s BCE',
    location: 'China',
    title: 'Early Kites',
    description: 'Kites are invented in China, an early form of human flight.',
    img: "/api/placeholder/100/100",
    people: ['Mozi', 'Lu Ban'],
    TimeLineCategory: "Non-Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Paper Production and Trade']
  },
  {
    date: '400s BCE',
    location: 'Tarentum, Italy',
    title: "Archytas' Flying Pigeon",
    description: "Archytas of Tarentum creates a wooden pigeon that could \"fly\" using a jet of air.",
    img: "/api/placeholder/100/100",
    people: ['Archytas of Tarentum'],
    TimeLineCategory: "Non-Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['The Myth of Icarus and Daedalus']
  },
  {
    date: '200s BCE',
    location: 'China',
    title: "Kongming's Sky Lantern",
    description: "Kongming invents the sky lantern, the first hot air balloon. From its military use, it became known as the Kongming lantern.",
    img: "/api/placeholder/100/100",
    people: ['Kongming'],
    TimeLineCategory: "Non-Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Early Kites', 'Paper Production and Trade']
  },
  
  // 4b. Early Attempts at Human Flight
  {
    date: '800s CE',
    location: 'Spain',
    title: "Abbas Ibn Firnas's jump",
    description: "Abbas Ibn Firnas jumps from a tower wearing a cloak stiffened with wooden struts.",
    img: "/api/placeholder/100/100",
    people: ['Abbas Ibn Firnas'],
    TimeLineCategory: "Early Attempts at Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["The Myth of Icarus and Daedalus", "Eilmer of Malmesbury's jump", "João Torto's Failed Flight Attempt"]
  },
  {
    date: '1000s CE',
    location: 'England',
    title: "Eilmer of Malmesbury's jump",
    description: "A Benedictine monk who tries to fly with a glider-like apparatus. He may have glided a short distance..",
    img: "/api/placeholder/100/100",
    people: ['Eilmer of Malmesbury'],
    TimeLineCategory: "Early Attempts at Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["The Myth of Icarus and Daedalus", "Abbas Ibn Firnas's jump", "João Torto's Failed Flight Attempt", 'Early Kites']
  },
  {
    date: '1540s CE',
    location: 'Portugal',
    title: "João Torto's Failed Flight Attempt",
    description: "João Torto, a Portuguese barber, attempts human flight with fabric wings but falls to his death.",
    img: "/api/placeholder/100/100",
    people: ['João Torto'],
    TimeLineCategory: "Early Attempts at Human Flight",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["The Myth of Icarus and Daedalus", "Abbas Ibn Firnas's jump", "Eilmer of Malmesbury's jump"]
  },
  
  // 4c. The Age of the Balloon
  {
    date: '1709',
    location: 'Portugal',
    title: "Bartolomeu de Gusmão's Passarola",
    description: 'Bartolomeu de Gusmão, a Brazilian-Portuguese priest, demonstrates a hot air balloon prototype called the "Passarola."',
    img: "/api/placeholder/100/100",
    people: ['Bartolomeu de Gusmão'],
    TimeLineCategory: "The Age of the Balloon",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["Kongming's Sky Lantern", "Archimedes' Buoyancy Principle"]
  },
  {
    date: '1783',
    location: 'France',
    title: "Montgolfier Brothers' Hot Air Balloon",
    description: "Jean-François Pilâtre de Rozier and François Laurent d'Arlandes make the first manned flight in a hot air balloon built by the Montgolfier brothers.",
    img: "/api/placeholder/100/100",
    people: ['Jean-François Pilâtre de Rozier', "François Laurent d'Arlandes", 'Joseph-Michel Montgolfier', 'Jacques-Étienne Montgolfier'],
    TimeLineCategory: "The Age of the Balloon",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["Kongming's Sky Lantern"]
  },
  {
    date: '1700s',
    location: 'Europe',
    title: 'Human-Passenger Flights on Hot Air Balloons',
    description: 'Marked the first time humans experienced flight, sparking public fascination and further experimentation with aerial navigation.',
    img: "/api/placeholder/100/100",
    TimeLineCategory: "The Age of the Balloon",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Early Kites', 'Kongming\'s Sky Lantern', 'Leonardo da Vinci\'s Flying Machines']
  },
  
  // 4d. Early Glider Experiments
  {
    date: '1853',
    location: 'England',
    title: "George Cayley's Manned Glider Flight",
    description: "George Cayley successfully flies the first manned glider. Developed principles of lift, drag, and fixed-wing aircraft.",
    img: "/api/placeholder/100/100",
    people: ['George Cayley'],
    TimeLineCategory: "Early Glider Experiments",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["George Cayley's Glider Design"]
  },
  {
    date: '1891',
    location: 'Germany',
    title: "Otto Lilienthal's Glider Flights",
    description: "Otto Lilienthal achieves controlled glider flights and documents aerodynamic research, proving human flight was possible.",
    img: "/api/placeholder/100/100",
    people: ['Otto Lilienthal'],
    TimeLineCategory: "Early Glider Experiments",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1896',
    location: 'United States',
    title: "Octave Chanute's Biplane Glider",
    description: "Octave Chanute advances glider designs and builds a successful biplane glider, improving aviation theories.",
    img: "/api/placeholder/100/100",
    people: ['Octave Chanute'],
    TimeLineCategory: "Early Glider Experiments",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1890s',
    location: 'Europe',
    title: 'Gliders and the Foundation of Controlled Flight',
    description: 'Otto Lilienthal\'s glider flights in the 1890s represented the first controlled, repeatable manned flights using fixed wings and an understanding of lift and control surfaces.',
    img: "/api/placeholder/100/100",
    TimeLineCategory: "Early Glider Experiments",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Silk Production and Trade', 'The Industrial Revolution', 'Leonardo da Vinci\'s Bird Sketches']
  },
  
  // 4e. Race Toward Modern Aviation
  {
    date: '1843',
    location: 'England',
    title: "William Henson's Aircraft Design",
    description: "William Henson patents an early aircraft design with fixed wings and a steam-powered engine.",
    img: "/api/placeholder/100/100",
    people: ['William Henson'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["Hero's Aeolipile", "Leonardo da Vinci's Flying Machines"]
  },
  {
    date: '1890',
    location: 'France',
    title: "Clément Ader's Éole",
    description: "Clément Ader builds the Éole, a bat-like steam-powered aircraft, which briefly lifts off but lacks control.",
    img: "/api/placeholder/100/100",
    people: ['Clément Ader'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1894',
    location: 'United States/United Kingdom',
    title: "Hiram Maxim's Steam-Powered Biplane",
    description: "Hiram Maxim builds and tests a massive steam-powered biplane but fails to achieve sustained flight.",
    img: "/api/placeholder/100/100",
    people: ['Hiram Maxim'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1896',
    location: 'United States',
    title: "Samuel Pierpont Langley's Aerodrome",
    description: "Samuel Pierpont Langley flies small, unmanned models successfully. Built the Aerodrome A, which failed at full scale.",
    img: "/api/placeholder/100/100",
    people: ['Samuel Pierpont Langley'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1900s',
    location: 'Worldwide',
    title: 'Dawn of Modern Aviation: Powered Flight',
    description: 'A frenzied period of experimentation with countless inventors, engineers, and enthusiasts building prototypes to unlock the secrets of powered flight.',
    img: "/api/placeholder/100/100",
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Silk Production and Trade', 'The Industrial Revolution', 'Leonardo da Vinci\'s Bird Sketches']
  },
  {
    date: '1901',
    location: 'United States',
    title: "Gustave Whitehead's Reported Flight",
    description: "Gustave Whitehead reportedly flies in Connecticut, though documentation remains debated.",
    img: "/api/placeholder/100/100",
    people: ['Gustave Whitehead'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1902',
    location: 'New Zealand',
    title: "Richard Pearse's Monoplane",
    description: "Richard Pearse builds a monoplane and makes brief, uncontrolled flights.",
    img: "/api/placeholder/100/100",
    people: ['Richard Pearse'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1903',
    location: 'Germany',
    title: "Karl Jatho's Powered Aircraft",
    description: "Karl Jatho builds an unstable monoplane that flies briefly but lacks thorough documentation.",
    img: "/api/placeholder/100/100",
    people: ['Karl Jatho'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1903',
    location: 'Scotland',
    title: "Preston Watson's Alleged Flight",
    description: "Preston Watson allegedly flies, though no strong evidence exists.",
    img: "/api/placeholder/100/100",
    people: ['Preston Watson'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1906',
    location: 'Brazil/France',
    title: "Alberto Santos-Dumont's 14-bis Flight",
    description: "Alberto Santos-Dumont flies the 14-bis in Paris—the first powered airplane flight recognized by the Aéro-Club de France.",
    img: "/api/placeholder/100/100",
    people: ['Alberto Santos-Dumont'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  { 
    date: '1903',
    location: 'United States',
    title: "Wright Brothers' Flights",
    description: "The Wright brothers, Orville and Wilbur, make the first successful sustained, controlled, powered flight in their Wright Flyer at Kitty Hawk, North Carolina.",
    img: "/api/placeholder/100/100",
    people: ['Orville Wright', 'Wilbur Wright'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    nodeType: "Timeline",
    connections: []
  },
  {
    date: '1907',
    location: 'Romania',
    title: "Traian Vuia's Monoplane",
    description: "Traian Vuia designs a monoplane with wheels that takes off unaided but flies only short distances.",
    img: "/api/placeholder/100/100",
    people: ['Traian Vuia'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1909',
    location: 'France/England',
    title: 'Louis Blériot Crosses the English Channel',
    description: "Louis Blériot's successful Channel crossing proves the airplane's viability for transportation.",
    img: "/api/placeholder/100/100",
    people: ['Louis Blériot'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1910',
    location: 'Brazil',
    title: "Dimitri Sensaud de Lavaud's Flight in Latin America",
    description: "Dimitri Sensaud de Lavaud completes the first powered flight in Latin America.",
    img: "/api/placeholder/100/100",
    people: ['Dimitri Sensaud de Lavaud'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1910',
    location: 'France',
    title: "Henri Fabre's Seaplane Flight",
    description: "Henri Fabre achieves the first successful seaplane flight.",
    img: "/api/placeholder/100/100",
    people: ['Henri Fabre'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1910',
    location: 'Romania',
    title: "Henri Coandă's Coandă-1910",
    description: "Henri Coandă builds the Coandă-1910, possibly the first jet-propelled aircraft.",
    img: "/api/placeholder/100/100",
    people: ['Henri Coandă'],
    TimeLineCategory: "Race Toward Modern Aviation",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  
  // 4f. Parallel Alternative: The Zeppelin
  {
    date: '1852',
    location: 'France',
    title: "Henri Giffard's Dirigible",
    description: "Henri Giffard invents the first controllable dirigible powered by a steam engine.",
    img: "/api/placeholder/100/100",
    people: ['Henri Giffard'],
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ["Hero's Aeolipile", 'Industrial Revolution']
  },
  {
    date: '1884',
    location: 'France',
    title: "Charles Renard and Arthur Constantin's Le France",
    description: "Charles Renard and Arthur Constantin Krebs launch a non-rigid airship that inspires Zeppelin.",
    img: "/api/placeholder/100/100",
    people: ['Charles Renard', 'Arthur Constantin Krebs'],
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1900',
    location: 'Germany',
    title: "Ferdinand von Zeppelin's Rigid Airships",
    description: "Ferdinand von Zeppelin develops rigid airships, leading to widespread use of zeppelins.",
    img: "/api/placeholder/100/100",
    people: ['Ferdinand von Zeppelin'],
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Hall–Héroult Process for Aluminum', "Charles Renard and Arthur Constantin's Le France"]
  },
  {
    date: '1909',
    location: 'Germany',
    title: "Zeppelin's First Commercial Service",
    description: "The DELAG airline was the world's first commercial airline, operating Zeppelin airships and carrying over 34,000 passengers without a fatal accident until World War I.",
    img: "/api/placeholder/100/100",
    people: ['Ferdinand von Zeppelin'],
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['Hall–Héroult Process for Aluminum']
  },
  {
    date: '1900-1930s',
    location: 'Worldwide',
    title: 'Doomed Alternative: Zeppelins',
    description: 'Zeppelins were the first technology to enable sustained, long-distance passenger travel by air, bridging the gap between balloons and modern airplanes.',
    img: "/api/placeholder/100/100",
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: ['The Industrial Revolution']
  },
  {
    date: '1928',
    location: 'Germany',
    title: 'The Graf Zeppelin',
    description: "The LZ 127 Graf Zeppelin, a large passenger-carrying rigid airship, enters commercial service...",
    img: "/api/placeholder/100/100",
    people: ['Ferdinand von Zeppelin'],
    TimeLineCategory: "Parallel Alternative: The Zeppelin",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  
  // 4g. Post-War Advancements
  {
    date: '1947',
    location: 'United States',
    title: 'Breaking the Sound Barrier',
    description: "Chuck Yeager pilots the Bell X-1 to become the first to break the sound barrier in level flight.",
    img: "/api/placeholder/100/100",
    people: ['Chuck Yeager'],
    TimeLineCategory: "Post-War Advancements",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1957',
    location: 'USSR',
    title: 'Satellite Launch',
    description: 'First artificial satellite',
    img: "/api/placeholder/100/100",
    people: ['Sergei Korolev'],
    TimeLineCategory: "Post-War Advancements",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  },
  {
    date: '1969',
    location: 'United States',
    title: 'First Moon Landing',
    description: 'Neil Armstrong and Buzz Aldrin land on the Moon...',
    img: "/api/placeholder/100/100",
    people: ['Neil Armstrong', 'Buzz Aldrin'],
    TimeLineCategory: "Post-War Advancements",
    Category: "Practical Implementations",
    Subcategory: "CIRCLE",
    connections: []
  }
];
// 2. ADD TO THE BOTTOM OF THE FILE:
// Make sure to run this function to standardize data structure
standardizeTimelineData();
console.log("Timeline data standardized to new structure");
