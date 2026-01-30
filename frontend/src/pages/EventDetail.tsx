import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { api, type EventDetail as EventDetailType, type User } from "../api/client";
import { Header } from "../components/Header";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Message } from "../components/Message";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [showRemove, setShowRemove] = useState(false);

  const eventId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("message");
    const kind = params.get("kind") === "error" ? "error" : "success";
    if (m) {
      setMessage({ kind, text: m });
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.search, location.pathname]);

  useEffect(() => {
    if (!id || isNaN(eventId)) {
      setLoading(false);
      return;
    }
    Promise.all([api.getEvent(eventId), api.getUsers()]).then(([er, ur]) => {
      setEvent(er.data ?? null);
      setUsers(ur.data ?? null);
      setLoading(false);
    });
  }, [id, eventId]);

  const confirmRemove = async () => {
    if (!event) return;
    const res = await api.deleteEvent(event.id);
    setShowRemove(false);
    if (res.error) {
      setMessage({ kind: "error", text: res.error });
      return;
    }
    navigate("/?message=" + encodeURIComponent("Event was successfully removed."));
  };

  const assignedNames =
    event && users
      ? event.assigned_user_ids
          .map((uid) => users.find((u) => u.id === uid)?.name)
          .filter(Boolean) as string[]
      : [];

  if (loading) {
    return (
      <>
        <Header />
        <div className="app">
          <p className="muted">Loading…</p>
        </div>
      </>
    );
  }
  if (!event) {
    return (
      <>
        <Header />
        <div className="app">
          <Message kind="error" text="Event not found." />
          <Link to="/">Back to Events</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="app">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Events", path: "/" },
            { label: event.title },
          ]}
        />
        {message && <Message kind={message.kind} text={message.text} />}
        <div className="detail-header">
          <h1 className="page-title">{event.title}</h1>
          <div className="detail-header__actions">
            <Link to={`/events/${event.id}/edit`} className="btn btn--secondary">
              Edit
            </Link>
            <Link to="/" className="btn btn--secondary">
              Back to Events
            </Link>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setShowRemove(true)}
            >
              Remove
            </button>
          </div>
        </div>
        <p className="detail-description">
          {event.description || "No description"}
        </p>
        <section className="detail-section">
          <h2 className="detail-section__title">Assigned users</h2>
          {assignedNames.length === 0 ? (
            <p className="muted">No users assigned</p>
          ) : (
            <ul className="detail-users" role="list">
              {assignedNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={showRemove}
        title="Remove event"
        message="Are you sure?"
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setShowRemove(false)}
      />
    </>
  );
}
