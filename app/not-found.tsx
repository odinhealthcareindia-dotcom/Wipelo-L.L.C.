import Link from "next/link";

export default function NotFound() {
  return <section className="sec not-found-page"><div className="wrap">
    <span className="mono-tag">// Nothing at this address</span>
    <h1 className="h-section">This page isn’t here.</h1>
    <p className="lede">Products appear here once they are published to the Headless sales channel in Shopify.</p>
    <div className="not-found-links"><Link className="btn btn-teal" href="/shop">Browse the shop →</Link><Link className="link-arrow" href="/">Back to Wipelo</Link></div>
  </div></section>;
}
