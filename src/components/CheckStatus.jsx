import React, { useState, useEffect } from "react";
import "./CheckStatus.css";

const CheckStatus = ({ onClose }) => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Predefined fallback pod data
  const samplePods = [
    {
      _id: "1",
      pod_id: "PodA",
      status: "ACTIVE",
      battery: 85.4,
      last_seen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      _id: "2",
      pod_id: "PodB",
      status: "INACTIVE",
      battery: 42.1,
      last_seen: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      _id: "3",
      pod_id: "PodC",
      status: "ACTIVE",
      battery: 67.9,
      last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ];

  // ✅ Fetch from backend or fallback to sample data
  const fetchPodData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/pods");
      if (!res.ok) throw new Error("No backend data found");
      const data = await res.json();
      setPods(data.length > 0 ? data : samplePods);
    } catch (err) {
      console.warn("⚠️ Using predefined pod data (backend not responding)");
      setPods(samplePods);
    }
    setLoading(false);
  };

  // ✅ Manual check (refresh)
  const manualCheck = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:5000/api/pods/check", { method: "POST" });
      await fetchPodData();
    } catch (err) {
      console.error("Error checking pods:", err);
      setPods(samplePods);
    }
    setLoading(false);
  };

  // ✅ Auto-refresh every 1 minute
  useEffect(() => {
    fetchPodData();
    const interval = setInterval(fetchPodData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="check-popup">
      <div className="check-box">
        <div className="check-header">
          <h2>Pod Check Status</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <button onClick={manualCheck} disabled={loading}>
          🔄 Manual Check
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : pods.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Pod Name</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {pods.map((pod) => (
                <tr key={pod._id}>
                  <td>{pod.pod_id}</td>
                  <td
                    style={{
                      color: pod.status === "ACTIVE" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {pod.status}
                  </td>
                  <td>{pod.battery.toFixed(1)}%</td>
                  <td>{new Date(pod.last_seen).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No pod data yet. Try clicking “Manual Check.”</p>
        )}
      </div>

      {/* Overlay background to close when clicked */}
      <div className="overlay-bg" onClick={onClose}></div>
    </div>
  );
};

export default CheckStatus;
