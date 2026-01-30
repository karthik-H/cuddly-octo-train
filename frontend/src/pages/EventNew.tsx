import { useNavigate } from "react-router-dom";
import { api, type CreateEventBody } from "../api/client";
import { Header } from "../components/Header";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Message } from "../components/Message";
import { EventForm } from "../components/EventForm";
import { useState } from "react";

export function EventNew() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (body: CreateEventBody) => {
    const res = await api.createEvent(body);
    if (res.error) {
      setError(res.error);
      return;
    }
    const id = res.data?.id;
    navigate(id ? `/events/${id}?message=${encodeURIComponent("Event was successfully created.")}` : "/");
  };

  return (
    <>
      <Header />
      <div className="app">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Events", path: "/" },
            { label: "New Event" },
          ]}
        />
        {error && <Message kind="error" text={error} />}
        <h1 className="page-title">New Event</h1>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
        />
      </div>
    </>
  );
}
