import React, { useState, useEffect } from 'react';
import './ScheduleSessionModal.css';

const ScheduleSessionModal = ({ isOpen, onClose, onSchedule, connections = null }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');

  useEffect(() => {
      if (typeof isOpen === 'string' && isOpen !== '') {
          setSelectedConnection(isOpen);
      }
  }, [isOpen]);

const handleSubmit = (e) => {
    e.preventDefault();

    if (date && time && title) {
        if (connections && !selectedConnection) {
            alert("Please select a connection to schedule with.");
            return;
        }

        const dateTime = new Date(`${date}T${time}`);
        if (isNaN(dateTime)) {
            alert("Invalid date or time");
            return;
        }
        const roomId = crypto.randomUUID();
        
        // Pass selectedConnection if connections mode is on
        if (connections) {
            onSchedule(title, dateTime, roomId, selectedConnection);
        } else {
            onSchedule(title, dateTime, roomId);
        }
        
        onClose();
        setTitle('');
        setDate('');
        setTime('');
        setSelectedConnection('');
    }
};


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Schedule a Session</h2>
        <form onSubmit={handleSubmit}>
          {connections && (
              <>
                  <label>Partner:</label>
                  <select 
                    value={selectedConnection} 
                    onChange={(e) => setSelectedConnection(e.target.value)} 
                    required 
                    className="w-full mb-4 p-2 border rounded"
                  >
                      <option value="" disabled>Select a connection</option>
                      {connections.map(c => (
                          <option key={c.otherParticipant._id} value={c.otherParticipant._id}>
                              {c.otherParticipant.firstName} {c.otherParticipant.lastName}
                          </option>
                      ))}
                  </select>
              </>
          )}
          <label>Topic:</label>
          <input type="text" placeholder="e.g. React Hooks" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <label>Time:</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          <div className="modal-buttons">
            <button type="submit">Confirm</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
