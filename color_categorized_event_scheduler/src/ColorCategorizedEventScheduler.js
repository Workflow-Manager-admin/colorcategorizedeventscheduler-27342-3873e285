import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./ColorCategorizedEventScheduler.css";

// PUBLIC_INTERFACE
/**
 * ColorCategorizedEventScheduler - Main container for the event scheduler.
 * Allows for creating, editing, viewing, and filtering events by category:
 * Work, Personal, Deadline. Supports dark theme and category color legend.
 */
function ColorCategorizedEventScheduler() {
  // Event categories and color scheme (provided in requirements)
  const CATEGORIES = [
    {
      key: "work",
      name: "Work",
      color: "#1976d2" // Primary
    },
    {
      key: "personal",
      name: "Personal",
      color: "#39898e" // Secondary
    },
    {
      key: "deadline",
      name: "Deadline",
      color: "#31d3b8" // Accent
    }
  ];

  // Demo: initial events
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Team Standup",
      start: new Date().toISOString().split("T")[0],
      category: "work"
    },
    {
      id: "2",
      title: "Buy Groceries",
      start: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
      category: "personal"
    },
    {
      id: "3",
      title: "Project Deadline",
      start: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], // day after tomorrow
      category: "deadline"
    }
  ]);

  const [filters, setFilters] = useState({
    work: true,
    personal: true,
    deadline: true
  });

  // Dialog (modal) state for creating/editing events
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id: null,
    title: "",
    start: "",
    end: "",
    category: CATEGORIES[0].key
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const calendarRef = useRef(null);

  // Filtered event list based on selected categories
  const filteredEvents = events.filter(e => filters[e.category]);

  // Category lookup for easy style binding
  const categoryMap = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = cat;
    return acc;
  }, {});

  // Handle filter checkbox change
  const handleFilterChange = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Open modal for new event
  const openCreateModal = (dateStr = "") => {
    setModalData({
      id: null,
      title: "",
      start: dateStr,
      end: "",
      category: CATEGORIES[0].key
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  // Open modal for editing event
  const openEditModal = (event) => {
    setModalData({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr || "",
      category: event.extendedProps.category || CATEGORIES[0].key
    });
    setIsEditMode(true);
    setModalOpen(true);
  };

  // Handle modal field changes
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Save event (add or edit)
  const handleModalSave = (e) => {
    e.preventDefault();
    if (!modalData.title || !modalData.start || !modalData.category) return;
    if (isEditMode && modalData.id) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === modalData.id
            ? {
                ...ev,
                ...modalData
              }
            : ev
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          title: modalData.title,
          start: modalData.start,
          end: modalData.end,
          category: modalData.category
        }
      ]);
    }
    setModalOpen(false);
  };

  const handleModalDelete = () => {
    if (isEditMode && modalData.id) {
      setEvents((prev) => prev.filter((ev) => ev.id !== modalData.id));
    }
    setModalOpen(false);
  };

  // FullCalendar event handlers
  // on date click: open create event modal
  const handleDateClick = (arg) => {
    openCreateModal(arg.dateStr);
  };

  // on event click: open edit modal
  const handleEventClick = (arg) => {
    openEditModal(arg.event);
  };

  // Specify event styling based on category color
  const eventContent = (eventInfo) => {
    const cat = eventInfo.event.extendedProps.category;
    const color = (categoryMap[cat] && categoryMap[cat].color) || "#888";
    // Custom content for FullCalendar event
    return (
      <div
        className="event-content"
        style={{
          borderLeft: `5px solid ${color}`,
          background: "#222",
          color: "#fff",
          padding: "2px 6px"
        }}
      >
        <span>{eventInfo.event.title}</span>
      </div>
    );
  };

  // Map events to add category via extendedProps for FullCalendar
  const fsEvents = filteredEvents.map((e) => ({
    ...e,
    backgroundColor: "#23272b", // fallback for FullCalendar dark
    borderColor: categoryMap[e.category]?.color,
    textColor: "#fff",
    extendedProps: {
      category: e.category
    }
  }));

  return (
    <div className="color-categorized-event-scheduler">
      {/* Header: Filter and Legend */}
      <div className="cces-header">
        <div className="cces-filters">
          <span>Show:</span>
          {CATEGORIES.map((cat) => (
            <label
              key={cat.key}
              className="cces-filter-label"
              style={{
                color: filters[cat.key] ? cat.color : "#aaa"
              }}
            >
              <input
                type="checkbox"
                checked={filters[cat.key]}
                onChange={() => handleFilterChange(cat.key)}
              />
              <span
                className="cces-color-dot"
                style={{ background: cat.color }}
              ></span>
              {cat.name}
            </label>
          ))}
        </div>

        {/* Legend */}
        <div className="cces-legend">
          <span>Legend:</span>
          {CATEGORIES.map((cat) => (
            <span key={cat.key} className="cces-legend-item">
              <span
                className="cces-color-dot"
                style={{ background: cat.color }}
              ></span>
              {cat.name}
            </span>
          ))}
        </div>

        <button className="cces-add-btn" onClick={() => openCreateModal()}>
          + Add Event
        </button>
      </div>

      {/* FullCalendar Main View */}
      <div className="cces-calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={fsEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: ""
          }}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventContent={eventContent}
          height="auto"
          fixedWeekCount={false}
        />
      </div>

      {/* Modal for create/edit event */}
      {modalOpen && (
        <div className="cces-modal-overlay">
          <div className="cces-modal">
            <h2>{isEditMode ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleModalSave} autoComplete="off">
              <div className="cces-modal-group">
                <label htmlFor="title">Title</label>
                <input
                  autoFocus
                  id="title"
                  name="title"
                  type="text"
                  value={modalData.title}
                  onChange={handleModalChange}
                  required
                  maxLength={100}
                />
              </div>
              <div className="cces-modal-row">
                <div className="cces-modal-group">
                  <label htmlFor="start">Start</label>
                  <input
                    id="start"
                    name="start"
                    type="date"
                    value={modalData.start}
                    onChange={handleModalChange}
                    required
                  />
                </div>
                <div className="cces-modal-group">
                  <label htmlFor="end">End</label>
                  <input
                    id="end"
                    name="end"
                    type="date"
                    value={modalData.end || ""}
                    onChange={handleModalChange}
                  />
                </div>
              </div>
              <div className="cces-modal-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={modalData.category}
                  onChange={handleModalChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cces-modal-actions">
                {isEditMode && (
                  <button
                    type="button"
                    className="cces-delete-btn"
                    onClick={handleModalDelete}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  className="cces-cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cces-save-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorCategorizedEventScheduler;
