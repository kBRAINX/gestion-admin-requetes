'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

export default function ResourceCalendar({ resource, onTimeSlotClick }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load resource bookings
    if (resource?.bookings) {
      const formattedEvents = resource.bookings.map(booking => ({
        id: booking.id,
        title: booking.userName,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
      }));
      setEvents(formattedEvents);
    }
  }, [resource]);

  const handleTimeSlotSelect = (info) => {
    const timeSlot = {
      start: info.start,
      end: info.end,
      resource: resource,
      available: isSlotAvailable(info.start, info.end),
    };

    if (onTimeSlotClick) {
      onTimeSlotClick(timeSlot);
    }
  };

  const isSlotAvailable = (startTime, endTime) => {
    if (!resource?.bookings) return true;

    return !resource.bookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return (startTime < bookingEnd && endTime > bookingStart);
    });
  };

  const calendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    allDaySlot: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: false,
    events: events,
    select: handleTimeSlotSelect,
    eventColor: '#3B82F6',
    eventBorderColor: '#3B82F6',
    eventTextColor: '#FFFFFF',
    locale: frLocale,
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
  };

  return (
    <div className="resource-calendar">
      <style jsx global>{`
        .fc {
          font-size: 0.9rem;
        }

        .fc-button-primary {
          background-color: #3B82F6!important;
          border-color: #3B82F6!important;
        }

        .fc-button-primary:hover {
          background-color: #2563EB!important;
          border-color: #2563EB!important;
        }

        .fc-button-active {
          background-color: #2563EB!important;
          border-color: #2563EB!important;
        }

        .fc-highlight {
          background: rgba(59, 130, 246, 0.2)!important;
        }
      `}</style>

      <FullCalendar {...calendarOptions} />

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm mr-2 bg-blue-600" />
          <span className="text-sm text-gray-700">Réservé</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm mr-2 border border-gray-300 bg-transparent" />
          <span className="text-sm text-gray-700">Disponible</span>
        </div>
      </div>
    </div>
  );
}