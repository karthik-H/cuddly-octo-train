type Kind = "success" | "error";

export function Message({ kind, text }: { kind: Kind; text: string }) {
  if (!text) return null;
  return (
    <div className={`message message--${kind}`} role="alert">
      {text}
    </div>
  );
}
