import { useMemo, useState } from "react";
import type { User } from "../api/client";

type Props = {
  users: User[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
};

export function UserSelector({ users, selectedIds, onChange, loading }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="user-selector">
        <p className="user-selector__loading">Loading users…</p>
      </div>
    );
  }

  return (
    <div className="user-selector">
      <label className="user-selector__label">Assign users</label>
      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="user-selector__search"
        aria-label="Search users"
      />
      <p className="user-selector__count">
        {selectedIds.length} user{selectedIds.length !== 1 ? "s" : ""} selected
      </p>
      <ul className="user-selector__list" role="list">
        {filtered.map((u) => (
          <li key={u.id} className="user-selector__row">
            <label className="user-selector__label-row">
              <input
                type="checkbox"
                checked={selectedIds.includes(u.id)}
                onChange={() => toggle(u.id)}
                className="user-selector__checkbox"
              />
              <span className="user-selector__name">{u.name}</span>
              <span className="user-selector__email">{u.email}</span>
            </label>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="user-selector__empty">No users match your search.</p>
      )}
    </div>
  );
}
