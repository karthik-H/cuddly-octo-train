"""Event Manager API — Flask backend with SQLite."""
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

from database import get_connection, init_db

app = Flask(__name__)
# Allow all origins for /api so proxy and direct access (e.g. /api/users) work
CORS(app, resources={r"/api/*": {"origins": "*"}})

USERS_URL = "https://jsonplaceholder.typicode.com/users"


# ---------- Users (external) ----------

@app.route("/api/users", methods=["GET"])
def get_users():
    """Fetch users from JSONPlaceholder (cached in memory for the request)."""
    try:
        r = requests.get(USERS_URL, timeout=10)
        r.raise_for_status()
        users = r.json()
        return jsonify([{"id": u["id"], "name": u["name"], "email": u["email"]} for u in users])
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# ---------- Events ----------

@app.route("/api/events", methods=["GET"])
def list_events():
    """List all events, newest first, with assigned user count."""
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT e.id, e.title, e.description, e.created_at,
                   (SELECT COUNT(*) FROM event_users WHERE event_id = e.id) AS assigned_count
            FROM events e
            ORDER BY e.created_at DESC
            """
        ).fetchall()
        return jsonify([
            {
                "id": r["id"],
                "title": r["title"],
                "description": r["description"] or "",
                "created_at": r["created_at"],
                "assigned_count": r["assigned_count"],
            }
            for r in rows
        ])
    finally:
        conn.close()


@app.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Get one event with assigned user IDs."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, title, description, created_at FROM events WHERE id = ?", (event_id,)
        ).fetchone()
        if not row:
            return jsonify({"error": "Event not found"}), 404
        user_ids = [
            r["user_id"]
            for r in conn.execute(
                "SELECT user_id FROM event_users WHERE event_id = ?", (event_id,)
            ).fetchall()
        ]
        return jsonify({
            "id": row["id"],
            "title": row["title"],
            "description": row["description"] or "",
            "created_at": row["created_at"],
            "assigned_user_ids": user_ids,
        })
    finally:
        conn.close()


def _validate_event_title(title):
    """Return (ok, error_message). Title is required and trimmed."""
    if not title or not str(title).strip():
        return False, "Title is required."
    return True, None


@app.route("/api/events", methods=["POST"])
def create_event():
    """Create a new event with optional assigned user IDs."""
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    ok, err = _validate_event_title(title)
    if not ok:
        return jsonify({"error": err}), 400
    description = (data.get("description") or "").strip()
    assigned_user_ids = data.get("assigned_user_ids")
    if not isinstance(assigned_user_ids, list):
        assigned_user_ids = []
    assigned_user_ids = [int(x) for x in assigned_user_ids if isinstance(x, (int, str)) and str(x).isdigit()]

    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO events (title, description) VALUES (?, ?)",
            (title, description or None),
        )
        event_id = cur.lastrowid
        for uid in assigned_user_ids:
            conn.execute(
                "INSERT OR IGNORE INTO event_users (event_id, user_id) VALUES (?, ?)",
                (event_id, uid),
            )
        conn.commit()
        return jsonify({"id": event_id, "message": "Event was successfully created"}), 201
    finally:
        conn.close()


@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an event (title, description, assigned users)."""
    conn = get_connection()
    row = conn.execute("SELECT id FROM events WHERE id = ?", (event_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    ok, err = _validate_event_title(title)
    if not ok:
        conn.close()
        return jsonify({"error": err}), 400
    description = (data.get("description") or "").strip()
    assigned_user_ids = data.get("assigned_user_ids")
    if not isinstance(assigned_user_ids, list):
        assigned_user_ids = []
    assigned_user_ids = [int(x) for x in assigned_user_ids if isinstance(x, (int, str)) and str(x).isdigit()]

    try:
        conn.execute(
            "UPDATE events SET title = ?, description = ? WHERE id = ?",
            (title, description or None, event_id),
        )
        conn.execute("DELETE FROM event_users WHERE event_id = ?", (event_id,))
        for uid in assigned_user_ids:
            conn.execute(
                "INSERT OR IGNORE INTO event_users (event_id, user_id) VALUES (?, ?)",
                (event_id, uid),
            )
        conn.commit()
        return jsonify({"message": "Event was successfully updated"})
    finally:
        conn.close()


@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete an event."""
    conn = get_connection()
    row = conn.execute("SELECT id FROM events WHERE id = ?", (event_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Event not found"}), 404
    try:
        conn.execute("DELETE FROM event_users WHERE event_id = ?", (event_id,))
        conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        return jsonify({"message": "Event was successfully removed"})
    finally:
        conn.close()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8853, debug=True)
