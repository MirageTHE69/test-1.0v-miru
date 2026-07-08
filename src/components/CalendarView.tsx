'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  X,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface CalendarEvent {
  id: string;
  title: string;
  type: 'MEETING' | 'TASK' | 'POST';
  date: string; // YYYY-MM-DD
  time?: string;
  status?: string;
  priority?: string;
  channels?: string[];
  assignee?: any;
  project?: any;
}

interface CalendarViewProps {
  clientId?: string;
  isClientView?: boolean;
  readOnly?: boolean;
}

export default function CalendarView({ clientId, isClientView = false, readOnly = false }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterPosts, setFilterPosts] = useState(true);
  const [filterMeetings, setFilterMeetings] = useState(true);
  const [filterTasks, setFilterTasks] = useState(true);

  // Scheduling Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [eventType, setEventType] = useState<'MEETING' | 'TASK' | 'POST'>('MEETING');
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventPriority, setEventPriority] = useState('MEDIUM');
  const [postChannels, setPostChannels] = useState<string[]>(['instagram']);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = clientId ? `/api/calendar?clientId=${clientId}` : '/api/calendar';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        // Transform tasks, meetings, posts into unified CalendarEvent format
        const unifiedEvents: CalendarEvent[] = [];

        // 1. Transform meetings
        if (data.meetings) {
          data.meetings.forEach((m: any) => {
            const dateObj = new Date(m.date);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            unifiedEvents.push({
              id: m.id,
              title: m.title,
              type: 'MEETING',
              date: `${yyyy}-${mm}-${dd}`,
              time: m.time,
              status: 'SCHEDULED',
            });
          });
        }

        // 2. Transform tasks
        if (data.tasks) {
          data.tasks.forEach((t: any) => {
            if (t.dueDate) {
              const dateObj = new Date(t.dueDate);
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dateObj.getDate()).padStart(2, '0');
              unifiedEvents.push({
                id: t.id,
                title: t.title,
                type: 'TASK',
                date: `${yyyy}-${mm}-${dd}`,
                time: 'All Day',
                status: t.status,
                priority: t.priority,
                assignee: t.assignee,
                project: t.project,
              });
            }
          });
        }

        // 3. Transform posts
        if (data.posts) {
          data.posts.forEach((p: any) => {
            unifiedEvents.push({
              id: p.id,
              title: p.content,
              type: 'POST',
              date: p.date, // already YYYY-MM-DD
              time: p.time,
              status: p.status,
              channels: p.channels,
            });
          });
        }

        setEvents(unifiedEvents);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [clientId]);

  // Navigate month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar math
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
    return firstDay;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const monthName = monthNames[currentDate.getMonth()];

  // Render calendar grid days
  const calendarCells = [];
  
  // Empty slots for padding before first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, dateStr: '' });
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateStr });
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (e.type === 'POST' && !filterPosts) return false;
    if (e.type === 'MEETING' && !filterMeetings) return false;
    if (e.type === 'TASK' && !filterTasks) return false;
    return true;
  });

  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  const handleCellClick = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedDateStr(dateStr);
    setEventTitle('');
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || submitting || !clientId) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          title: eventTitle,
          date: selectedDateStr,
          time: eventTime,
          clientId,
          priority: eventPriority,
          content: eventTitle, // for posts
          channels: postChannels, // for posts
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    const confirmDelete = window.confirm(`Are you sure you want to cancel this ${eventToDelete.type.toLowerCase()}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/calendar?type=${eventToDelete.type}&id=${eventToDelete.id}&clientId=${clientId || ''}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setSelectedEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden flex flex-col h-[75vh]">
      {/* Calendar Header Control Bar */}
      <div className="bg-[#0F172A] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-tight">{monthName} {year}</h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Marketing & Collaboration Calendar</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <label className="flex items-center gap-1.5 text-pink-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterPosts}
              onChange={() => setFilterPosts(!filterPosts)}
              className="rounded accent-pink-500"
            />
            Posts
          </label>
          <div className="h-3 w-px bg-slate-800" />
          <label className="flex items-center gap-1.5 text-amber-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterMeetings}
              onChange={() => setFilterMeetings(!filterMeetings)}
              className="rounded accent-amber-500"
            />
            Meetings
          </label>
          <div className="h-3 w-px bg-slate-800" />
          <label className="flex items-center gap-1.5 text-emerald-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterTasks}
              onChange={() => setFilterTasks(!filterTasks)}
              className="rounded accent-emerald-500"
            />
            Tasks
          </label>
        </div>

        {/* Navigator buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Titles Row */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Days Grid */}
      <div className="flex-1 grid grid-cols-7 bg-slate-100 divide-x divide-y divide-slate-200 overflow-y-auto">
        {calendarCells.map((cell, idx) => {
          const isToday =
            cell.day !== null &&
            new Date().getDate() === cell.day &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear();

          const dayEvents = cell.day ? getEventsForDate(cell.dateStr) : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] bg-white p-2 flex flex-col justify-between group transition-colors hover:bg-slate-50/50 ${
                !cell.day ? 'bg-slate-50/50 cursor-default' : 'cursor-pointer'
              }`}
              onClick={() => cell.day && !readOnly && handleCellClick(cell.dateStr)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  {cell.day}
                </span>

                {cell.day && !readOnly && (
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 flex items-center gap-0.5 transition-opacity">
                    <Plus className="h-3 w-3" /> Add
                  </span>
                )}
              </div>

              {/* Day Events stack list */}
              <div className="flex-1 mt-2 space-y-1 overflow-y-auto">
                {dayEvents.map((evt) => {
                  let colorClass = '';
                  let prefixIcon = '•';

                  if (evt.type === 'MEETING') {
                    colorClass = 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100';
                    prefixIcon = '🤝';
                  } else if (evt.type === 'TASK') {
                    colorClass = 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100';
                    prefixIcon = '📝';
                  } else if (evt.type === 'POST') {
                    colorClass = 'bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100';
                    prefixIcon = '📱';
                  }

                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering cell schedule popup
                        setSelectedEvent(evt);
                      }}
                      className={`w-full text-left rounded px-1.5 py-1 text-[10px] font-semibold truncate transition-colors flex items-center gap-1 cursor-pointer ${colorClass}`}
                      title={evt.title}
                    >
                      <span className="shrink-0">{prefixIcon}</span>
                      <span className="truncate">{evt.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Modal: Schedule New Event Form */}
      {isModalOpen && clientId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                Schedule Event: {selectedDateStr}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-medium text-slate-700">
              {/* Event Type Select */}
              <div className="grid grid-cols-3 gap-2">
                {(['MEETING', 'TASK', 'POST'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventType(t)}
                    className={`rounded-lg py-2 border text-center font-bold uppercase transition-all ${
                      eventType === t
                        ? t === 'MEETING' ? 'bg-amber-600 border-amber-600 text-white' :
                          t === 'TASK' ? 'bg-emerald-600 border-emerald-600 text-white' :
                          'bg-pink-600 border-pink-600 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {t.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Title / Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {eventType === 'POST' ? 'Post Caption / Text' : 'Event Title'}
                </label>
                {eventType === 'POST' ? (
                  <textarea
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter copy caption text for post..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 min-h-[80px]"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder={eventType === 'MEETING' ? 'e.g. Website Layout Approval' : 'e.g. Wireframe homepage'}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Time</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2"
                    required
                  />
                </div>

                {/* Priority (Task only) */}
                {eventType === 'TASK' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Priority</label>
                    <select
                      value={eventPriority}
                      onChange={(e) => setEventPriority(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Social Channels Selection (Post only) */}
              {eventType === 'POST' && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Channels</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'instagram', icon: InstagramIcon, color: 'text-pink-600 bg-pink-50 border-pink-100' },
                      { id: 'facebook', icon: FacebookIcon, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                      { id: 'linkedin', icon: LinkedinIcon, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                      { id: 'twitter', icon: TwitterIcon, color: 'text-slate-900 bg-slate-50 border-slate-200' },
                    ].map((ch) => {
                      const isSelected = postChannels.includes(ch.id);
                      const Icon = ch.icon;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            setPostChannels((prev) =>
                              prev.includes(ch.id)
                                ? prev.filter((x) => x !== ch.id)
                                : [...prev, ch.id]
                            );
                          }}
                          className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                            isSelected ? `${ch.color} border-2 scale-105` : 'border-slate-200 bg-white text-slate-400'
                          }`}
                          title={ch.id}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 border border-slate-200 text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Event Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className={`text-[9px] font-bold uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${
                selectedEvent.type === 'MEETING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                selectedEvent.type === 'TASK' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                'bg-pink-50 border-pink-200 text-pink-700'
              }`}>
                {selectedEvent.type} Event
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedEvent.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                  <CalendarIcon className="h-3.5 w-3.5" /> Scheduled for: {selectedEvent.date}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Time slot</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {selectedEvent.time || 'All Day'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Status Indicator</span>
                  <span className="font-bold text-slate-800 mt-0.5 block capitalize">
                    {selectedEvent.status?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              {selectedEvent.type === 'TASK' && (
                <div className="space-y-2 text-xs">
                  {selectedEvent.project && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Project Campaign</span>
                      <span className="font-bold text-slate-700">{selectedEvent.project.name}</span>
                    </div>
                  )}
                  {selectedEvent.priority && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Priority Rank</span>
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        selectedEvent.priority === 'HIGH' ? 'text-rose-600' :
                        selectedEvent.priority === 'MEDIUM' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        <AlertCircle className="h-3.5 w-3.5" />
                        {selectedEvent.priority}
                      </span>
                    </div>
                  )}
                  {selectedEvent.assignee && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                        {selectedEvent.assignee.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Assignee</span>
                        <span className="font-bold text-slate-700">{selectedEvent.assignee.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Channels Details */}
              {selectedEvent.type === 'POST' && selectedEvent.channels && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Omnichannel Targets</span>
                  <div className="flex gap-1.5">
                    {selectedEvent.channels.map((ch) => (
                      <span key={ch} className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] capitalize font-bold text-slate-600">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

             {/* Actions Footer */}
             {!isClientView && !readOnly ? (
               <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                 <button
                   onClick={() => handleDeleteEvent(selectedEvent)}
                   className="rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                 >
                   <Trash2 className="h-3.5 w-3.5" /> Delete Event
                 </button>
                 <button
                   onClick={() => setSelectedEvent(null)}
                   className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs"
                 >
                   Close View
                 </button>
               </div>
             ) : (
               <div className="flex justify-end border-t border-slate-100 pt-4">
                 <button
                   onClick={() => setSelectedEvent(null)}
                   className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs"
                 >
                   Close View
                 </button>
               </div>
             )}
            {isClientView && (
              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs"
                >
                  Close View
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
