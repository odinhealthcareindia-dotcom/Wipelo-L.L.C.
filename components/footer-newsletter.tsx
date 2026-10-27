"use client";

import { useState, type FormEvent } from "react";

export function FooterNewsletter() {
  const [joined, setJoined] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setJoined(true);
  }

  return <div className="wipe-footer-news">
    <div className="wipe-footer-news-copy">
      <span className="wipe-footer-news-tag">// Messages, not newsletters</span>
      <h2>Short. Useful. <em>Occasionally provocative.</em></h2>
      <p>Body-skin intelligence and early access. No daily drip, no &ldquo;final hours&rdquo; theater. Unsubscribe stings us, works instantly.</p>
    </div>
    <form className="wipe-footer-news-form" aria-label="Email signup" onSubmit={submit}>
      <div className="wipe-footer-news-field">
        <input type="email" required placeholder="your@email.com" aria-label="Email address" autoComplete="email" onInput={() => setJoined(false)} />
        <button type="submit">Join <span aria-hidden="true">→</span></button>
      </div>
      <p className="wipe-footer-news-status" role="status">{joined ? "Welcome in. Messages, not newsletters." : ""}</p>
    </form>
  </div>;
}
