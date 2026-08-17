export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px", fontFamily: "Inter, ui-sans-serif, system-ui", color: "#1e293b", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#64748b", marginBottom: 32 }}>Last updated: August 2026</p>

      <p>
        SmartZone Dashboard ("we", "our", "the app") is an internal order-management
        tool used by our business to track and fulfill orders placed on eBay and other
        sales channels. This page explains what data we access and how it's used.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>Data We Access</h2>
      <p>
        When you connect an eBay seller account to this app, we request access to:
      </p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Order and fulfillment details (buyer username, items purchased, quantities, order status, shipping information)</li>
        <li>Inventory and account information needed to keep listings and stock levels in sync</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>How We Use It</h2>
      <p>
        This data is used solely to display and manage orders inside our internal
        dashboard — tracking fulfillment, stock deduction, and profit/margin reporting
        for our own business operations. We do not sell, rent, or share this data with
        any third party.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>Data Storage</h2>
      <p>
        Order and account data is stored securely in our private database and is
        accessible only to authorized staff of our business through authenticated
        logins.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>Account Deletion</h2>
      <p>
        If an eBay seller disconnects their store or requests account deletion, all
        associated access tokens are revoked and the connection is removed from our
        system.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href="mailto:driftlineautohaus@gmail.com">driftlineautohaus@gmail.com</a>.
      </p>
    </div>
  );
}
