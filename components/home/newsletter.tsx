"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSection() {
  const [showMessage, setShowMessage] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setShowMessage(true);
    window.setTimeout(() => setShowMessage(false), 2600);
  }

  return <section className="sec dark" style={{ paddingBottom: 64 }}>
    <div className="wrap nl-box">
      <div className="rv">
        <span className="mono-tag">// Messages, not newsletters</span>
        <h2 className="h-section" style={{ marginTop: 14 }}>Short. Useful.<br />Occasionally provocative.</h2>
        <p className="lede" style={{ marginTop: 14 }}>Body-skin intelligence and early access. No daily drip, no "final hours" theater. Unsubscribe stings us, works instantly.</p>
      </div>
      <form className="nl-form rv" aria-label="Email signup" onSubmit={submit}>
        <input type="email" required placeholder="your@email.com" aria-label="Email address" />
        <button className="btn btn-teal" type="submit">Join</button>
      </form>
    </div>
    <div className={`toast${showMessage ? " on" : ""}`} role="status">Welcome in. Messages, not newsletters.</div>
  </section>;
}
