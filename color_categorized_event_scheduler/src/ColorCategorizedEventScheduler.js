import React, { useState, useRef } from 'react';
// PUBLIC_INTERFACE
// FullCalendar and plugins imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import "./fullcalendar-dark-overrides.css";
// Style imports

// -- Category configuration --
const CATEGORY_CONFIG = [
  {
    id: 'work',
    name: 'Work',
    color: '#1976d2', // primary
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#39898e', // secondary
  },
  {
    id: 'deadline',
    name: 'Deadline',
    color: '#e53935', // CHANGED: Red shade for 'Deadline'
  },
];

// -- Utility function: Gets category color by ID --
function getCategoryColor(categoryId) {
  const cat = CATEGORY_CONFIG.find((cat) => cat.id === categoryId);
  return cat ? cat.color : '#888';
}

// -- Category Legend component --
function CategoryLegend() {
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 8 }}>
      {CATEGORY_CONFIG.map((cat) => (
        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            display: 'inline-block',
            width: 14, height: 14,
            background: cat.color,
            borderRadius: 3,
            marginRight: 5,
            border: '1.5px solid #1A1A1A'
          }} />
          <span style={{ color: '#bbb', fontSize: '0.98em' }}>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}

// -- Category Filter component --
function CategoryFilter({ activeCategories, setActiveCategories }) {
  // PUBLIC_INTERFACE
  function handleToggle(catId) {
    setActiveCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  }
  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap', userSelect: 'none' }}>
      {CATEGORY_CONFIG.map((cat) => (
        <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', color: '#eee', fontWeight: 500, fontSize: '1em' }}>
          <input
            type="checkbox"
            checked={activeCategories.includes(cat.id)}
            onChange={() => handleToggle(cat.id)}
            style={{
              accentColor: cat.color,
              marginRight: 3,
              width: 16,
              height: 16,
              borderRadius: 3,
            }}
          />
          {cat.name}
        </label>
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * EventDialog: Modal Form for Creating/Editing Events/Tasks.
 * Enhanced: When opened from "+ Add Task", lets user select date, month, type, category via checkboxes.
 */
function EventDialog({ open, mode, eventData, onSave, onClose }) {
  // Internal state management
  const [title, setTitle] = useState(eventData?.title || "");
  const [date, setDate] = useState(""); // Used only for Add Task modal
  const [categoryChecks, setCategoryChecks] = useState(
    (eventData?.category
      ? CATEGORY_CONFIG.map((cat) => eventData.category === cat.id)
      : CATEGORY_CONFIG.map((_, i) => i === 0))
  );
  const [category, setCategory] = useState(eventData?.category || CATEGORY_CONFIG[0].id);

  const [start, setStart] = useState(eventData?.start?.slice(0, 16) || ""); // for calendar dialog
  const [end, setEnd] = useState(eventData?.end?.slice(0, 16) || "");

  // Reset dialog state when opened/new entry
  React.useEffect(() => {
    if (open) {
      setTitle(eventData?.title || "");
      setStart(eventData?.start?.slice(0, 16) || "");
      setEnd(eventData?.end?.slice(0, 16) || "");
      setCategory(eventData?.category || CATEGORY_CONFIG[0].id);
      setCategoryChecks(
        (eventData?.category
          ? CATEGORY_CONFIG.map((cat) => eventData.category === cat.id)
          : CATEGORY_CONFIG.map((_, i) => i === 0))
      );
      setDate(""); // By default empty, unless user chooses
    }
  }, [eventData, open]);

  // Handler for "new task" checkboxes - only one allowed
  function handleCategoryCheckbox(idx) {
    // One checked at a time
    setCategoryChecks(CATEGORY_CONFIG.map((_, i) => i === idx));
    setCategory(CATEGORY_CONFIG[idx].id);
  }

  // Handle add task (from button, not from click on the calendar)
  function handleAddTaskSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    // Construct ISO datetime for "start" at 09:00 as default
    const chosenCategory = CATEGORY_CONFIG[categoryChecks.findIndex((x) => x)]?.id || CATEGORY_CONFIG[0].id;
    const isoStart = date.length === 10 ? date + "T09:00" : date;
    onSave({
      ...eventData,
      title,
      start: isoStart,
      end: "",
      category: chosenCategory,
    });
  }

  // For legacy calendar clicks, use time selector
  function handleCalendarDialogSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !start) return;
    onSave({
      ...eventData,
      title,
      start,
      end,
      category,
    });
  }

  if (!open) return null;

  // Determine if opened from "+ Add Task" button
  const isAddTaskModal = !eventData?.start && mode === "create";

  return (
    <div
      role="dialog"
      aria-modal="true"
      key={open ? (mode + (eventData?.id || "")) : undefined}
      style={{
        position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
        zIndex: 9999, background: 'rgba(32,32,36,0.80)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={isAddTaskModal ? handleAddTaskSubmit : handleCalendarDialogSubmit}
        style={{
          minWidth: 320,
          background: 'linear-gradient(145deg,#23272E,#212124)',
          color: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 40px #000b  ',
          padding: '28px 24px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          border: `2.2px solid ${getCategoryColor(category)}`
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 7 }}>
          {mode === 'edit' ? 'Edit Event' : (isAddTaskModal ? "Add New Task" : "Create Event")}
        </div>
        {/* Description/Task Entry */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, marginBottom: 2 }}>Task <span style={{color:"#e87a41"}}>*</span></span>
          <input
            required
            autoFocus
            type="text"
            value={title}
            maxLength={64}
            placeholder="Enter task/description"
            onChange={e => setTitle(e.target.value)}
            style={{
              padding: '7.5px 10px', border: '1px solid #656575',
              borderRadius: 4, background: '#252634', color: 'white', outline: 'none', fontSize: '1em',
            }}
          />
        </label>
        {/* Date field for Add Task; datetime-local for calendar modal */}
        {isAddTaskModal ? (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13 }}>Date <span style={{color:"#e87a41"}}>*</span></span>
            <input
              required
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                padding: '7.5px 9px', border: '1px solid #656575',
                borderRadius: 4, background: '#252634', color: 'white', outline: 'none'
              }}
            />
          </label>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{fontSize:13}}>Start <span style={{color:"#e87a41"}}>*</span></span>
              <input
                required
                type="datetime-local"
                value={start}
                onChange={e => setStart(e.target.value)}
                style={{
                  padding: '6.5px 9px', border: '1px solid #656575',
                  borderRadius: 4, background: '#252634', color: 'white', outline: 'none'
                }}
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{fontSize:13}}>End</span>
              <input
                type="datetime-local"
                value={end}
                onChange={e => setEnd(e.target.value)}
                style={{
                  padding: '6.5px 9px', border: '1px solid #656575',
                  borderRadius: 4, background: '#252634', color: 'white', outline: 'none'
                }}
              />
            </label>
          </div>
        )}
        {/* Category Selection (Checkbox for Add Task, select for legacy) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          <span style={{ fontSize: 13 }}>Category</span>
          {isAddTaskModal ? (
            <div style={{ display: "flex", gap: 16, marginTop: 2 }}>
              {CATEGORY_CONFIG.map((cat, i) => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#eee', fontWeight: 500, fontSize: '0.99em' }}>
                  <input
                    type="checkbox"
                    checked={categoryChecks[i]}
                    onChange={() => handleCategoryCheckbox(i)}
                    style={{
                      accentColor: cat.color,
                      marginRight: 3,
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                    }}
                  />
                  <span style={{ color: categoryChecks[i] ? cat.color : "#bbb" }}>{cat.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                padding: '8px', border: '1px solid #656575',
                borderRadius: 4, background: '#252634', color: 'white', outline: 'none'
              }}
            >
              {CATEGORY_CONFIG.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6}}>
          {mode === 'edit' && (
            <button type="button" style={{
              background: '#232529',
              color: '#e87a41',
              border: 'none',
              padding: '7px 16px', borderRadius: 4, fontWeight: 500,
              fontSize: 15, cursor: 'pointer'
            }} onClick={() => onSave({ ...eventData, _delete: true })}>
              Delete
            </button>
          )}
          <button type="submit"
            style={{
              background: '#e87a41',
              color: 'white',
              border: 'none',
              padding: '8px 20px', borderRadius: 4, fontWeight: 500,
              fontSize: 15, cursor: 'pointer'
            }}>
            {mode === 'edit' ? 'Save' : 'Create'}
          </button>
          <button type="button"
            style={{
              background: 'transparent',
              color: '#bbb',
              border: 'none',
              padding: '8px 12px', borderRadius: 4,
              fontSize: 15, cursor: 'pointer'
            }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/** Custom tooltip for event hover */
function EventTooltip({ text, position, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        background: '#24272e',
        color: 'white',
        fontSize: 15,
        borderRadius: 7,
        padding: '8px 14px',
        boxShadow: '0 2px 12px #000c',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap',
        maxWidth: 360,
        border: '2.5px solid #e87a41',
        fontWeight: 500,
      }}
    >
      {text}
    </div>
  );
}

// -- Main Component: ColorCategorizedEventScheduler --
export default function ColorCategorizedEventScheduler() {
  // State storage for events: [{ id, title, start, end, category }]
  const [events, setEvents] = useState([
    // Example starter events (can be empty)
    {
      id: "sample1",
      title: "Project Meeting",
      start: new Date().toISOString().slice(0, 10) + "T10:00",
      end: new Date().toISOString().slice(0, 10) + "T11:00",
      category: "work",
    },
    {
      id: "sample2",
      title: "Dentist Appointment",
      start: new Date().toISOString().slice(0, 10) + "T15:30",
      end: new Date().toISOString().slice(0, 10) + "T16:00",
      category: "personal",
    },
    {
      id: "sample3",
      title: "Submission Deadline",
      start: new Date(Date.now() + 86400000).toISOString().slice(0, 10) + "T23:59",
      end: "",
      category: "deadline",
    }
  ]);

  // Stores currently visible categories
  const [activeCategories, setActiveCategories] = useState(
    () => CATEGORY_CONFIG.map(c => c.id)
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'
  const [dialogEventData, setDialogEventData] = useState(null);

  const calendarRef = useRef();

  // Tooltip state: stores visibility, position, and content
  const [tooltip, setTooltip] = useState({ visible: false, text: '', position: { x: 0, y: 0 } });

  // Hide tooltip on scroll or leave
  React.useEffect(() => {
    const hideTooltip = () => setTooltip(t => t.visible ? { ...t, visible: false } : t);
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip, true);
    return () => {
      window.removeEventListener('scroll', hideTooltip, true);
      window.removeEventListener('resize', hideTooltip, true);
    };
  }, []);

  // Handle event filtering
  const filteredEvents = events.filter(ev => activeCategories.includes(ev.category));

  // -- Dialog handlers --
  function openCreateDialog(selectedDateInfo) {
    setDialogMode('create');
    setDialogEventData({
      title: "",
      start: selectedDateInfo?.dateStr?.slice(0, 16) || "",
      end: "",
      category: CATEGORY_CONFIG[0].id,
    });
    setDialogOpen(true);
  }

  function openEditDialog(eventInfo) {
    setDialogMode('edit');
    setDialogEventData({
      id: eventInfo.event.id,
      title: eventInfo.event.title,
      start: eventInfo.event.start
        ? eventInfo.event.start.toISOString().slice(0, 16) : "",
      end: eventInfo.event.end
        ? eventInfo.event.end.toISOString().slice(0, 16) : "",
      category: eventInfo.event.extendedProps.category || CATEGORY_CONFIG[0].id,
    });
    setDialogOpen(true);
  }

  function handleDialogSave(data) {
    setDialogOpen(false);
    // Handle Delete flow
    if (data?._delete) {
      setEvents((prev) => prev.filter((ev) => ev.id !== data.id));
      return;
    }
    if (dialogMode === 'create') {
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          ...data,
          id: 'event_' + Math.random().toString(36).substr(2, 8),
        }
      ]);
    } else if (dialogMode === 'edit') {
      setEvents((prevEvents) =>
        prevEvents.map(ev =>
          ev.id === data.id
            ? { ...ev, ...data }
            : ev
        )
      );
    }
  }

  // Calendar event content renderer (colors + title tooltip via HTML attribute)
  function renderEventContent(eventInfo) {
    const color = getCategoryColor(eventInfo.event.extendedProps.category);
    const title = eventInfo.event.title;

    // Handler to show tooltip at mouse position with full text
    function handleMouseEnter(e) {
      const rect = e.target.getBoundingClientRect();
      setTooltip({
        visible: true,
        text: title,
        position: {
          x: (e.clientX || (rect.left + 16)),
          y: (e.clientY || (rect.top + rect.height + 8)),
        }
      });
    }
    function handleMouseLeave() {
      setTooltip(t => t.visible ? { ...t, visible: false } : t);
    }

    // Strict containment for the event color box
    return (
      <div
        style={{
          background: color + '33',
          borderLeft: '4px solid ' + color,
          padding: "3px 6px 3.5px 7px",
          borderRadius: 5,
          color: '#fff',
          fontWeight: 500,
          fontSize: '1em',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          minHeight: 28,
          maxHeight: 38,
          boxSizing: 'border-box',
          cursor: "pointer",
          overflow: 'hidden',
          userSelect: 'none',
          boxShadow: 'none',
          position: 'relative',
          zIndex: 3,
          outline: 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={-1}
        aria-label={title}
      >
        <span style={{
          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
          background: color, flexShrink: 0
        }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "120px",
            wordBreak: "break-word",
            lineHeight: 1.18,
            display: "inline-block",
            verticalAlign: 'middle'
          }}
        >
          {title}
        </span>
      </div>
    );
  }

  // Calendar styling override (dark mode + accent)
  React.useEffect(() => {
    const styleId = "colorcat-fc-dark";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
      .fc {
        background: #181c21;
        color: #f3f3f3;
        border-radius: 14px;
        padding-bottom: 20px;
        --fc-today-bg-color: #232B3B77;
        --fc-border-color: #31333a;
      }
      .fc-toolbar.fc-header-toolbar {
        background: #222428;
        border-radius: 14px 14px 0 0;
        margin-bottom: 8px;
        padding: 13px 20px 7px 20px;
        color: #eee;
      }
      .fc-button,
      .fc-button:active,
      .fc-button:focus {
        background: #1A2535;
        color: #fff;
        border-color: #1976d2;
        font-weight: 500;
      }
      .fc-button-primary:not(:disabled).fc-button-active,
      .fc-button-primary:not(:disabled):active, .fc-button-primary:focus {
        background: #1976d2;
      }
      .fc-daygrid-day.fc-day-today {
        background: #232b3764;
      }
      .fc-daygrid-event-dot {
        border-color: #fff !important;
      }
      .fc-event {
        background: transparent !important;
        border: none !important;
        box-shadow: none;
      }
      .fc-daygrid-event, .fc-timegrid-event {
        border-radius: 5px !important;
        margin-bottom: 2px;
      }
      .fc-highlight {
        background: #1a5e8a33;
      }
      .fc-scrollgrid-section-header .fc-col-header-cell-cushion {
        color: #87bdd8;
        font-weight: 600;
      }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#181c21",
      color: "#fff",
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      padding: '0 10px'
    }}>
      {/* Toolbar with Filter & Legend */}
      <div style={{
        maxWidth: 900,
        margin: '32px auto 16px auto',
        padding: '0 18px 0 18px'
      }}>
        <div style={{
          marginBottom: 7, padding: 0,
          display: 'flex', alignItems: 'center', gap: 28
        }}>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#31d3b8', letterSpacing: 0.5 }}>
            Color-Categorized Event Scheduler
          </span>
          <button
            className="btn"
            style={{
              marginLeft: "auto",
              padding: "9px 18px",
              fontWeight: 600,
              background: "#31d3b8",
              color: "#fff",
              fontSize: "1em",
              borderRadius: 5,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 2px 6px #0002"
            }}
            onClick={() => {
              setDialogMode("create");
              setDialogEventData({
                title: "",
                start: "",
                end: "",
                category: CATEGORY_CONFIG[0].id
              });
              setDialogOpen(true);
            }}
          >
            + Add Task
          </button>
        </div>
        <CategoryFilter
          activeCategories={activeCategories}
          setActiveCategories={setActiveCategories}
        />
        <CategoryLegend />
      </div>
      {/* Main Calendar Container */}
      <div style={{
        maxWidth: 900,
        margin: 'auto',
        background: '#1A1A25',
        borderRadius: 14,
        boxShadow: '0 12px 36px #0007',
        padding: '5px 19px 30px 19px',
        border: '1.5px solid #23242A',
      }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          nowIndicator
          height="auto"
          events={filteredEvents.map(ev => ({
            ...ev,
            // Assign color for extra FC views (e.g., dot in week view)
            backgroundColor: getCategoryColor(ev.category),
            borderColor: getCategoryColor(ev.category),
            // Append category for custom rendering
            extendedProps: {
              ...ev,
              category: ev.category
            }
          }))}
          eventContent={renderEventContent}
          select={openCreateDialog}
          eventClick={openEditDialog}
          // Deselect selection on click outside
          unselectAuto={true}
          // Date selection highlight color
          selectOverlap={true}
        />
      </div>
      {/* Event Creation/Edit Dialog */}
      <EventDialog
        open={dialogOpen}
        mode={dialogMode}
        eventData={dialogEventData}
        onSave={handleDialogSave}
        onClose={() => setDialogOpen(false)}
      />
      {/* Custom Tooltip always rendered so it floats above everything */}
      <EventTooltip text={tooltip.text} position={tooltip.position} visible={tooltip.visible} />
      {/* Attribution (remove if unnecessary) */}
      <div style={{
        textAlign: 'center',
        color: '#ffffff44',
        fontSize: 13, margin: '33px auto 0 auto'
      }}>
        Powered by&nbsp;<a href="https://fullcalendar.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#31d3b8', textDecoration: 'none' }}>FullCalendar</a>
      </div>
    </div>
  );
}
