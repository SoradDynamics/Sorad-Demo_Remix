import { useState } from "react";

function App() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendEmail = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Email sent successfully!");
      } else {
        setStatus("❌ Failed: " + data.error);
      }
    } catch (err) {
      setStatus("❌ Error sending email: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sorad Mail Sender</h2>
      <input
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "300px" }}
      />
      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "300px" }}
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        style={{ display: "block", marginBottom: "1rem", width: "300px" }}
      />
      <button onClick={sendEmail}>Send Email</button>
      <p>{status}</p>
    </div>
  );
}

export default App;
