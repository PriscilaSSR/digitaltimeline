import React, { useState } from 'react';

const AviationHistory = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const timelineItems = [
    {
      date: '5th century BC',
      location: 'China',
      title: 'Early Kites',
      description: 'Kites are invented in China, an early form of human flight. They were made of silk and bamboo and used for military signaling and recreation.',
      img: "/api/placeholder/100/100",
      people: ['Mozi', 'Lu Ban']
    },
    {
      date: '1485',
      location: 'Italy',
      title: 'Leonardo\'s Ornithopter',
      description: 'Leonardo da Vinci designs a human-powered ornithopter, a flying machine with flapping wings. While it was never built, it showed an early understanding of aerodynamics.',
      img: "/api/placeholder/100/100",
      people: ['Leonardo da Vinci']
    },
    {
      date: '1783',
      location: 'France',
      title: 'Montgolfier Brothers\' Hot Air Balloon',
      description: 'Joseph-Michel and Jacques-Étienne Montgolfier launch the first manned hot air balloon flight. This marked the beginning of human air travel.',
      img: "/api/placeholder/100/100",
      people: ['Joseph-Michel Montgolfier', 'Jacques-Étienne Montgolfier']
    },
    {
      date: '1799',
      location: 'England',
      title: 'Cayley\'s Glider',
      description: 'Sir George Cayley builds the first successful glider, establishing principles of aerodynamics. His work laid the foundations for later powered flight.',
      img: "/api/placeholder/100/100",
      people: ['Sir George Cayley']
    },
    {
      date: '1890s',
      location: 'Germany',
      title: 'Lilienthal\'s Gliders',
      description: 'Otto Lilienthal makes over 2000 flights in gliders, influencing future aviators. He was the first person to make well-documented, repeated, successful flights with gliders.',
      img: "/api/placeholder/100/100",
      people: ['Otto Lilienthal']
    },
    {
      date: '1890s',
      location: 'France',
      title: 'Clément Ader\'s Steam-Powered Aircraft',
      description: 'Clément Ader builds the Éole and Avion III, steam-powered aircraft. The Avion III is considered by some to be the first manned, powered, heavier-than-air aircraft to achieve takeoff.',
      img: "/api/placeholder/100/100",
      people: ['Clément Ader']
    },
    {
      date: '1903 (disputed)',
      location: 'New Zealand',
      title: 'Richard Pearse\'s Monoplane',
      description: 'Richard Pearse allegedly flies a monoplane months before the Wright brothers, but this claim remains disputed due to lack of reliable evidence.',
      img: "/api/placeholder/100/100",
      people: ['Richard Pearse']
    },
    {
      date: '1903',
      location: 'United States',
      title: 'Samuel Langley\'s Aerodrome',
      description: 'Samuel Pierpont Langley develops the Aerodrome A, a manned version of his earlier steam-powered unmanned aerodrome models, but it fails to fly.',
      img: "/api/placeholder/100/100",
      people: ['Samuel Pierpont Langley']
    },
    {
      date: '1906',
      location: 'France',
      title: '14-bis Flight',
      description: 'Alberto Santos-Dumont makes the first officially witnessed powered flights in Europe in his 14-bis aircraft. This was the first flight certified by the Aero-Club de France.',
      img: "/api/placeholder/100/100",
      people: ['Alberto Santos-Dumont']
    },
    {
      date: '1908',
      location: 'United States',
      title: 'Public Flights by the Wright Brothers',
      description: 'The Wright brothers make several public flights, conclusively demonstrating their control of powered aircraft. Their 1903 flights, while earlier, were not officially witnessed.',
      img: "/api/placeholder/100/100",
      people: ['Orville Wright', 'Wilbur Wright']
    },
    {
      date: '1909',
      location: 'France',
      title: 'Blériot Crosses the English Channel',
      description: 'Louis Blériot makes the first flight across the English Channel in a heavier-than-air aircraft, the Blériot XI.',
      img: "/api/placeholder/100/100",
      people: ['Louis Blériot']
    },
    {
      date: '1911',
      location: 'United States', 
      title: 'Curtiss Hydroaeroplane',
      description: 'Glenn Curtiss develops the first successful seaplane, the Curtiss Hydroaeroplane.',
      img: "/api/placeholder/100/100",
      people: ['Glenn Curtiss']
    },
    {
      date: '1914',
      location: 'United States',
      title: 'First Commercial Airline',
      description: 'The St. Petersburg-Tampa Airboat Line becomes the first scheduled commercial airline service, operating for four months in Florida. This marked the start of the commercial aviation industry.',
      img: "/api/placeholder/100/100",
      people: ['Thomas W. Benoist', 'Percival E. Fansler']
    },
    {
      date: '1915',
      location: 'Germany', 
      title: 'Junkers J 1',
      description: 'Hugo Junkers designs the Junkers J 1, the first all-metal aircraft. Junkers later pioneered commercial aircraft development.',
      img: "/api/placeholder/100/100",
      people: ['Hugo Junkers']
    },
    {
      date: '1930s',
      location: 'United Kingdom',
      title: 'de Havilland Aircraft',
      description: 'Geoffrey de Havilland founds the de Havilland aircraft company, which produces innovative designs like the Moth biplane and the Comet, the first commercial jet airliner.',
      img: "/api/placeholder/100/100",
      people: ['Geoffrey de Havilland'] 
    },
    {
      date: '1930s',
      location: 'United States',
      title: 'Northrop Flying Wings',  
      description: 'Jack Northrop founds Northrop Corporation and advocates for flying wing designs, like the Northrop YB-35 and YB-49.',
      img: "/api/placeholder/100/100",
      people: ['Jack Northrop']
    },
    {
      date: '1939',
      location: 'United States',
      title: 'Sikorsky VS-300', 
      description: 'Igor Sikorsky flies the VS-300, the first practical helicopter.',
      img: "/api/placeholder/100/100",
      people: ['Igor Sikorsky'] 
    },
    {
      date: '1947',
      location: 'United States',
      title: 'Breaking the Sound Barrier',
      description: 'Chuck Yeager pilots the Bell X-1 to become the first person to fly faster than the speed of sound. This ushered in the era of supersonic flight.',
      img: "/api/placeholder/100/100",
      people: ['Chuck Yeager']
    },
    {
      date: '1969',
      location: 'United States',
      title: 'First Moon Landing',  
      description: 'Neil Armstrong and Buzz Aldrin become the first humans to land on the moon, arriving in the Apollo 11 spacecraft. This represented a major milestone in both aviation and space exploration.',
      img: "/api/placeholder/100/100",
      people: ['Neil Armstrong', 'Buzz Aldrin']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8">The Non-Linear History of Aviation</h1>

      <div className="grid grid-cols-3 gap-8 mb-12">

        <div>
          <h2 className="text-2xl mb-4">Timeline</h2>
          {timelineItems.map((item, index) => (
            <div key={index}
                 className={`mb-4 p-4 rounded cursor-pointer hover:bg-gray-100 ${item === selectedItem ? 'bg-yellow-100' : ''}`}
                 onClick={() => setSelectedItem(item)}>
              <div className="font-bold mb-2">{item.date}</div>
              <div>{item.title}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl mb-4">Details</h2>
          {selectedItem ? (
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
              <p className="mb-4">{selectedItem.description}</p>
              <img src={selectedItem.img}
                   alt={selectedItem.title}
                   className="w-full mb-4 rounded shadow" />

              <div className="mb-4 p-4 bg-blue-100 rounded">
                Location: {selectedItem.location}
              </div>

              <div className="p-4 bg-green-100 rounded">
                <p>Key people involved:</p>
                <ul className="list-disc pl-6">
                  {selectedItem.people.map(person => <li key={person}>{person}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <p>Select an event from the timeline to see more details.</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl mb-4">Key Points</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Aviation developed over centuries in a non-linear process</li>
            <li>Multiple inventors across the world contributed</li>
            <li>Progress involved experimentation, failures and successes</li>
            <li>Collaboration and building on others' work was key</li>
          </ul>
          <p>
            From da Vinci's early designs to supersonic flight and space travel, the story of aviation is one of gradual, collaborative innovation across the globe. No single event or inventor, but a fascinating web of people, ideas and achievements.
          </p>
        </div>

      </div>

    </div>
  );
};

export default AviationHistory;
