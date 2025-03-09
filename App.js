import React, { useState } from "react";
import TimelineCircle from "./components/TimelineCircle";
import EventDetailsModal from "./components/EventDetailsModal";
import useTimelineData from "./hooks/useTimelineData";
import "./styles/index.css";

const App = () => {
  const { timelineItems, categories } = useTimelineData();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All"
    ? timelineItems
    : timelineItems.filter(item => item.category === activeCategory);

  return (
    <div className="app-container">
      <h1 className="text-center text-3xl font-bold my-5">Interactive Aviation Timeline</h1>
      
      <div className="flex justify-center mb-5">
        <select
          className="border p-2"
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <TimelineCircle
        events={filteredItems}
        onEventClick={setSelectedEvent}
      />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default App;
