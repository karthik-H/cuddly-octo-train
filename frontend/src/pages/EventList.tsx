import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EventSummary } from "../api/client";
import { Header } from "../components/Header";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Message } from "../components/Message";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function EventList() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.getEvents().then((r) => {
      setEvents(r.data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("message");
    const kind = params.get("kind") === "error" ? "error" : "success";
    if (m) {
      setMessage({ kind, text: m });
      window.history.replaceState({}, "", location.pathname);
    }
    load();
  }, []);

  const handleRemove = (id: number) => setRemoveId(id);
  const confirmRemove = async () => {
    if (removeId == null) return;
    const res = await api.deleteEvent(removeId);
    setRemoveId(null);
    if (res.error) {
      setMessage({ kind: "error", text: res.error });
      return;
    }
    setMessage({ kind: "success", text: "Event was successfully removed." });
    load();
  };

  return (
    <>
      <Header />
      <div className="app">
        <Breadcrumbs items={[{ label: "Home", path: "/" }, { label: "Events" }]} />
        {message && (
          <Message kind={message.kind} text={message.text} />
        )}
        <h1 className="page-title">All Events</h1>
        {loading ? (
          <p className="muted">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet.</p>
            <Link to="/events/new" className="btn btn--primary">
              Add your first event
            </Link>
          </div>
        ) : (
          <ul className="event-list" role="list">
            {events.map((e) => (
              <li key={e.id} className="event-card fade-in">
                <div className="event-card__main">
                  <h2 className="event-card__title">{e.title}</h2>
                  <p className="event-card__description">
                    {e.description || "No description"}
                  </p>
                  <p className="event-card__meta">
                    {e.assigned_count} user{e.assigned_count !== 1 ? "s" : ""} assigned
                  </p>
                </div>
                <div className="event-card__actions">
                  <Link to={`/events/${e.id}`} className="btn btn--secondary btn--sm">
                    View
                  </Link>
                  <Link to={`/events/${e.id}/edit`} className="btn btn--secondary btn--sm">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => handleRemove(e.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog
        open={removeId != null}
        title="Remove event"
        message="Are you sure?"
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveId(null)}
      />
    </>
  );
}
