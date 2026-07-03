import viLocale from "@fullcalendar/core/locales/vi";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import {Box, Typography} from "@mui/material";
import React from "react";

export interface TCalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  [key: string]: any;
}

interface CalendarProps {
  events: TCalendarEvent[];
  onMonthChange?: (start: Date, end: Date) => void;
  renderEvent?: (event: any) => React.ReactNode;
  dateClick?: (info: {date: Date}) => void;
  eventClick?: (info: {event: any}) => void;
}

const TCalendar: React.FC<CalendarProps> = ({
  events,
  onMonthChange,
  renderEvent,
  dateClick,
  eventClick,
}) => {
  const handleDatesSet = (arg: {start: Date; end: Date}) => {
    onMonthChange?.(arg.start, arg.end);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 2,
        p: 1,
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize: 14,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={viLocale}
        events={events}
        height="auto"
        contentHeight="auto"
        dayMaxEventRows={3}
        eventDisplay="block"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        buttonText={{
          today: "Hôm nay",
          month: "Tháng",
        }}
        dayHeaderClassNames="fc-day-header-custom"
        eventClassNames="fc-event-custom"
        moreLinkText={count => `+${count} sự kiện khác`}
        moreLinkClick="popover"
        views={{
          dayGrid: {
            dayMaxEventRows: 3,
          },
          dayGridMonth: {
            dayMaxEventRows: 3,
          },
        }}
        datesSet={handleDatesSet}
        dateClick={dateClick}
        eventClick={eventClick}
        eventContent={arg =>
          renderEvent ? (
            renderEvent(arg)
          ) : (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: "white",
                border: "1px solid #93C5FD",
                boxShadow: "0 2px 4px rgba(147, 197, 253, 0.1)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "#e6f1fe",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#2563EB",
                  mb: 0.5,
                }}
              >
                {arg.event.title}
              </Typography>
            </Box>
          )
        }
      />
      <style>
        {`
        .fc {
          font-family: 'Be Vietnam Pro', sans-serif !important;
          font-size: 14px !important;
        }
        .fc-day-header-custom {
          font-family: 'Be Vietnam Pro', sans-serif !important;
          font-size: 14px !important;
          background-color: #60A5FA !important;
          color: #000 !important;
          padding: 12px 0 !important;
          font-weight: 500 !important;
        }
        .fc-col-header-cell-cushion {
          color: #000 !important;
          text-decoration: none !important;
        }
        .fc-col-header-cell-cushion::first-letter {
          text-transform: uppercase !important;
        }
        .fc-day-header-custom[data-date="CN"] .fc-col-header-cell-cushion::after {
          content: "Chủ nhật" !important;
        }
        .fc-day-header-custom[data-date="T2"] .fc-col-header-cell-cushion::after {
          content: "Thứ hai" !important;
        }
        .fc-day-header-custom[data-date="T3"] .fc-col-header-cell-cushion::after {
          content: "Thứ ba" !important;
        }
        .fc-day-header-custom[data-date="T4"] .fc-col-header-cell-cushion::after {
          content: "Thứ tư" !important;
        }
        .fc-day-header-custom[data-date="T5"] .fc-col-header-cell-cushion::after {
          content: "Thứ năm" !important;
        }
        .fc-day-header-custom[data-date="T6"] .fc-col-header-cell-cushion::after {
          content: "Thứ sáu" !important;
        }
        .fc-day-header-custom[data-date="T7"] .fc-col-header-cell-cushion::after {
          content: "Thứ bảy" !important;
        }
        .fc-event-custom{ 
          border: none !important;
          // min-height: 55px !important;
          margin: 2px 0 !important;
        }
        .fc-daygrid-day.fc-day-today { 
          background-color: #F0F7FF !important; 
          position: relative; 
        }
        .fc-daygrid-day.fc-day-today::before {
          content: '⭐';
          position: absolute;
          top: 4px;
          left: 4px;
          font-size: 14px;
          color: #60A5FA;
        }
        .fc .fc-toolbar-title {
          font-family: 'Be Vietnam Pro', sans-serif !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #000 !important;
        }
        .fc .fc-button {
          background-color:#2564eb !important;
          border-color: white !important;
          font-family: 'Be Vietnam Pro', sans-serif !important;
          text-transform: none !important;
          font-weight: 500 !important;
          padding: 8px 16px !important;
          transition: all 0.2s ease !important;
          color: white !important;
        }
        .fc .fc-button:hover {
          background-color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color:#2564eb !important;
          border-color: #2563EB !important;
        }
        .fc-day { 
          background-color: white !important;
          min-height: 55px !important;
        }
        .fc-day-other { background-color: #f2f2f2 !important; }
        .fc td, .fc th { 
          border-color: #E2E8F0 !important;
          padding: 8px !important;
        }
        .fc-daygrid-day-frame {
          min-height: 85px !important;
        }
        .fc-more-popover {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
        }
        .fc-more-popover .fc-popover-title {
          background: #60A5FA !important;
          color: white !important;
          padding: 10px !important;
          font-family: 'Be Vietnam Pro', sans-serif !important;
          font-size: 14px !important;
          border-radius: 8px 8px 0 0 !important;
        }
        .fc-more-popover .fc-popover-body { padding: 10px !important; }
        .fc-daygrid-more-link {
          color: #3B82F6 !important;
          font-family: 'Be Vietnam Pro', sans-serif !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          padding: 2px 4px !important;
          margin-top: 2px !important;
        }
        .fc-daygrid-more-link:hover {
          background: #F0F7FF !important;
          border-radius: 4px !important;
        }
        .fc-daygrid-day-bottom { padding: 2px 4px !important; }
        .fc-daygrid-body {
          width: 100% !important;
        }
        .fc-daygrid-body > table {
          width: 100% !important;
        }
        .fc-daygrid-body > table > tbody > tr:last-child {
          display: none !important;
        }
        .fc-daygrid-day-number {
          color: #000 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          padding: 4px !important;
        }
        .fc-day-today .fc-daygrid-day-number {
          color: #000 !important;
        }
        .fc-day-other .fc-daygrid-day-number {
          color: #666 !important;
        }
      `}
      </style>
    </Box>
  );
};

export default TCalendar;
