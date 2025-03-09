import React from "react";

const EventDetailsModal = ({ event, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-5 rounded-lg max-w-md shadow-lg relative">
      <button
        className="absolute top-2 right-2 text-red-500"
        onClick={onClose}
      >
        ✖
      </button>
      <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong> {event.description}</p>

      {event.connections.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold">Related Events:</h3>
          <ul>
            {event.connections.map((conn) => (
              <li key={conn} className="text-blue-500 cursor-pointer">
                {conn}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default EventDetailsModal;
