import React, { useState } from 'react';
import './ScheduleSessionModal.css';

const ScheduleSessionModal = ({ isOpen, onClose, onSchedule }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
const handleSubmit = (e) => {
    e.preventDefault();

    if (date && time) {
        const dateTime = new Date(`${date}T${time}`);
        if (isNaN(dateTime)) {
            alert("Invalid date or time");
            return;
        }
        const roomId = crypto.randomUUID();
        onSchedule(dateTime, roomId);
        onClose();
    }
};


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Schedule a Session</h2>
        <form onSubmit={handleSubmit}>
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
