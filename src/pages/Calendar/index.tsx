import React from 'react';
import NepaliOnlyCalendar from '../../components/Calendar/NepaliOnlyCalendar';

const CalendarPage: React.FC = () => {
  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    // Add navigation or modal logic here
  };

  return (
    <div>
      {/* Nepali Only Calendar */}
      <NepaliOnlyCalendar onEventClick={handleEventClick} />
    </div>
  );
};

export default CalendarPage;
