"use client";

export default function AccountError({ reset }: { error: Error; reset: () => void }) {
  return <div className="account-empty" role="alert">
    <h1>We couldn’t load your account.</h1>
    <p>This is usually temporary. Your cart and orders are safe.</p>
    <button className="btn btn-teal" onClick={reset}>Try again</button>
  </div>;
}
