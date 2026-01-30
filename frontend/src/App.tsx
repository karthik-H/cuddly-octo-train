import { Routes, Route } from "react-router-dom";
import { EventList } from "./pages/EventList";
import { EventDetailPage } from "./pages/EventDetail";
import { EventNew } from "./pages/EventNew";
import { EventEdit } from "./pages/EventEdit";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/events/new" element={<EventNew />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/events/:id/edit" element={<EventEdit />} />
    </Routes>
  );
}

export default App;
