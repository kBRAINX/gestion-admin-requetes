'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function ResourceCalendar({ resource, onTimeSlotClick }) {
  const { colors, isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Charger les réservations de la ressource
    if (resource?.bookings) {
      const formattedEvents = resource.bookings.map(booking => ({
        id: booking.id,
        title: booking.userName,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      }));
      setEvents(formattedEvents);
    }
  }, [resource, colors.primary]);

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

  const customButtonStyle = {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    borderColor: colors.primary,
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
    weekends: false, // Masquer les weekends par défaut
    events: events,
    select: handleTimeSlotSelect,
    eventColor: colors.primary,
    eventBorderColor: colors.primary,
    eventTextColor: '#FFFFFF',
    locale: 'fr',
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    customButtons: {
      myCustomButton: {
        text: 'Personnalisé',
        click: function() {
          alert('clicked the custom button!');
        }
      }
    },
  };

  return (
    <div className="resource-calendar" style={{ color: colors.text.primary }}>
      <style jsx global>{`
        .fc {
          --fc-page-bg-color: ${colors.background.primary};
          --fc-neutral-bg-color: ${colors.background.secondary};
          --fc-today-bg-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
          --fc-border-color: ${colors.border};
          --fc-event-border-color: ${colors.primary};
          --fc-event-bg-color: ${colors.primary};
          --fc-event-text-color: #FFFFFF;
          font-size: 0.9rem;
        }

        .fc-button-primary {
          background-color: ${colors.primary}!important;
          border-color: ${colors.primary}!important;
        }

        .fc-button-primary:hover {
          background-color: ${colors.primaryDark}!important;
          border-color: ${colors.primaryDark}!important;
        }

        .fc-button-active {
          background-color: ${colors.primaryDark}!important;
          border-color: ${colors.primaryDark}!important;
        }

        .fc-col-header-cell {
          color: ${colors.text.primary}!important;
        }

        .fc-timegrid-slot-label {
          color: ${colors.text.secondary}!important;
        }

        .fc-daygrid-day-number {
          color: ${colors.text.primary}!important;
        }

        .fc-timegrid-slot {
          border-color: ${colors.border}!important;
        }

        .fc-highlight {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)'}!important;
        }
      `}</style>

      <FullCalendar {...calendarOptions} />

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm mr-2"
            style={{ backgroundColor: colors.primary }}
          />
          <span className="text-sm" style={{ color: colors.text.primary }}>
            Réservé
          </span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm mr-2 border"
            style={{ borderColor: colors.border, backgroundColor: 'transparent' }}
          />
          <span className="text-sm" style={{ color: colors.text.primary }}>
            Disponible
          </span>
        </div>
      </div>
    </div>
  );
}