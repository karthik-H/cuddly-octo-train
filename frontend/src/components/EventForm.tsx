import { useState, useEffect } from "react";
import { api, type EventDetail, type CreateEventBody, type User } from "../api/client";
import { UserSelector } from "./UserSelector";

type Props = {
  event?: EventDetail | null;
  onSubmit: (body: CreateEventBody) => Promise<void>;
  onCancel: () => void;
};

export function EventForm({ event, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [assignedIds, setAssignedIds] = useState<number[]>(
    event?.assigned_user_ids ?? []
  );
  const [users, setUsers] = useState<User[] | null>(null);
  const [titleError, setTitleError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getUsers().then((r) => setUsers(r.data ?? null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setTitleError("Title is required.");
      return;
    }
    setTitleError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title: t,
        description: description.trim(),
        assigned_user_ids: assignedIds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="event-title">Title *</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError("");
          }}
          className="input"
          placeholder="Event title"
          autoFocus
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "title-error" : undefined}
        />
        {titleError && (
          <p id="title-error" className="form-error" role="alert">
            {titleError}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="event-description">Description</label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input input--textarea"
          placeholder="Optional description"
          rows={4}
        />
      </div>
      <UserSelector
        users={users ?? []}
        selectedIds={assignedIds}
        onChange={setAssignedIds}
        loading={users === null}
      />
      <div className="event-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
