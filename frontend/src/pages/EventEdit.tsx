import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type EventDetail, type UpdateEventBody } from "../api/client";
import { Header } from "../components/Header";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Message } from "../components/Message";
import { EventForm } from "../components/EventForm";

export function EventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const eventId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (!id || isNaN(eventId)) {
      setLoading(false);
      return;
    }
    api.getEvent(eventId).then((r) => {
      setEvent(r.data ?? null);
      setLoading(false);
    });
  }, [id, eventId]);

  const handleSubmit = async (body: UpdateEventBody) => {
    if (!event) return;
    const res = await api.updateEvent(event.id, body);
    if (res.error) {
      setError(res.error);
      return;
    }
    navigate(
      `/events/${event.id}?message=` +
        encodeURIComponent("Event was successfully updated.")
    );
  };

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
          <button type="button" className="btn btn--secondary" onClick={() => navigate("/")}>
            Back to Events
          </button>
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
            { label: event.title, path: `/events/${event.id}` },
            { label: "Edit" },
          ]}
        />
        {error && <Message kind="error" text={error} />}
        <h1 className="page-title">Edit Event</h1>
        <EventForm
          event={event}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/events/${event.id}`)}
        />
      </div>
    </>
  );
}
