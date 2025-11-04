// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import GoogleMapView from "./components/GoogleMapView";
import BatteryDashboard from "./components/BatteryDashboard";
import CheckStatus from "./components/CheckStatus";

function App() {
  const [view, setView] = useState("chat");
  const [showCheck, setShowCheck] = useState(false);
  const [messages, setMessages] = useState([
    // ✅ Predefined messages with GPS
    {
      msgID: "1",
      sender: "PodA",
      target: "Me",
      text: "PodA active and sending location update.",
      gps: "9.9312,76.2673", // Kochi
      receivedAt: new Date().toLocaleString(),
    },
    {
      msgID: "2",
      sender: "Me",
      target: "PodA",
      text: "Received your update PodA. Monitoring status.",
      gps: "",
      receivedAt: new Date().toLocaleString(),
    },
    {
      msgID: "3",
      sender: "PodA",
      target: "Me",
      text: "Battery 85%. Stable connection.",
      gps: "9.9355,76.2659",
      receivedAt: new Date().toLocaleString(),
    },
  ]);
  const [selectedNode, setSelectedNode] = useState("PodA");
  const [msgInput, setMsgInput] = useState("");

  const backendURL = "http://localhost:5000/api/messages";
  const baseURL = "http://192.168.4.1";

  // ✅ Fetch messages from MongoDB and merge safely
  const fetchMessages = async () => {
    try {
      const res = await fetch(backendURL);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      setMessages((prev) => {
        // Keep predefined ones
        const predefined = prev.filter(
          (m) => m.msgID === "1" || m.msgID === "2" || m.msgID === "3"
        );

        // Add only new messages from backend (avoid duplicates)
        const existingIDs = new Set(prev.map((m) => m._id || m.msgID));
        const newOnes = data.filter((m) => !existingIDs.has(m._id || m.msgID));

        // Combine everything
        return [...predefined, ...prev.filter((m) => !predefined.includes(m)), ...newOnes];
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ✅ Run initially and refresh every 5s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Send new message
  const sendMessage = async () => {
    if (!selectedNode || !msgInput.trim()) return;

    const textToSend = msgInput;
    const newMsg = {
      msgID: Date.now().toString(),
      sender: "Me",
      target: selectedNode,
      text: textToSend,
      gps: "",
      receivedAt: new Date().toLocaleString(),
    };

    try {
      // Add message instantly in UI
      setMessages((prev) => [...prev, newMsg]);
      setMsgInput("");

      // Send to backend
      await fetch(`${backendURL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "Me",
          receiver: selectedNode,
          text: textToSend,
          gps: "",
        }),
      });

      // ✅ Instantly sync again from DB
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // ✅ Extract unique nodes
  const uniqueNodes = Array.from(
    new Set(
      messages
        .map((m) => m.sender)
        .concat(messages.map((m) => m.target))
        .filter((n) => n && n !== "Me")
    )
  );

  // ✅ Messages for selected node
  const nodeMsgs = messages.filter(
    (m) =>
      m.sender === selectedNode ||
      (m.sender === "Me" && m.target === selectedNode)
  );

  // ✅ Latest GPS for the map
  const latestGPS = (() => {
    for (let i = nodeMsgs.length - 1; i >= 0; i--) {
      if (nodeMsgs[i].gps && nodeMsgs[i].gps.trim()) return nodeMsgs[i].gps;
    }
    return null;
  })();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 🟦 Top navigation bar */}
      <div className="navbar">
        <button
          onClick={() => setView("chat")}
          className={`nav-btn chat ${view === "chat" ? "active" : ""}`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setView("battery")}
          className={`nav-btn battery ${view === "battery" ? "active" : ""}`}
        >
          🔋 Battery Life
        </button>
        <button
          onClick={() => setShowCheck(true)}
          className="nav-btn check"
        >
          🟢 Check
        </button>
      </div>

      {/* 🟩 Main content area */}
      {view === "chat" ? (
        <div className="main-container">
          {/* Sidebar */}
          <div id="sidebar">
            <h2>Pods</h2>
            <div id="nodeList">
              {uniqueNodes.length === 0 ? (
                <div className="empty">No pods yet</div>
              ) : (
                uniqueNodes.map((node) => (
                  <div
                    key={node}
                    className={node === selectedNode ? "active" : ""}
                    onClick={() => setSelectedNode(node)}
                  >
                    {node}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat + Map */}
          <div id="main" className="chat-map-container">
            <div className="chat-section">
              <h3 id="currentNode">
                {selectedNode ? `Chat with ${selectedNode}` : "Select a node"}
              </h3>

              <div id="chat">
                {nodeMsgs.length === 0 ? (
                  <div className="empty">No messages yet</div>
                ) : (
                  nodeMsgs.map((m) => (
                    <div
                      key={m.msgID || m._id}
                      className={`msg ${
                        m.sender === "Me" && m.target === selectedNode
                          ? "outgoing"
                          : "incoming"
                      }`}
                    >
                      <div>{m.text}</div>
                      {m.gps && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            m.gps
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {m.gps}
                        </a>
                      )}
                      <span className="meta">{m.receivedAt}</span>
                    </div>
                  ))
                )}
              </div>

              {selectedNode && (
                <div id="sendBox">
                  <input
                    type="text"
                    id="msg"
                    placeholder="Type your message"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button className="send-btn" onClick={sendMessage}>
                    🚀
                  </button>
                </div>
              )}
            </div>

            {/* Map Section */}
            <div className="map-section">
              <GoogleMapView gps={latestGPS} />
            </div>
          </div>
        </div>
      ) : (
        <BatteryDashboard />
      )}

      {/* 🟢 CheckStatus Popup */}
      {showCheck && (
        <div className="overlay">
          <CheckStatus onClose={() => setShowCheck(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
