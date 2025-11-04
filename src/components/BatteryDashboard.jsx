import React, { useState, useEffect } from "react";
import "./BatteryDashboard.css";

export default function BatteryDashboard() {
  const [pods, setPods] = useState([]);

  useEffect(() => {
    // Simulated ESP32 data
    const sample = [
      { node_id: "POD-01", voltage: 3.83, current: 150 },
      { node_id: "POD-02", voltage: 3.45, current: 100 },
      { node_id: "POD-03", voltage: 3.10, current: 200 },
    ];
    const processed = sample.map(calculateBatteryStats);
    setPods(processed);
  }, []);

  function calculateBatteryStats(nodeData) {
    const { voltage, current } = nodeData;
    const minV = 3.0, maxV = 4.2;
    const percentage = Math.min(
      100,
      Math.max(0, ((voltage - minV) / (maxV - minV)) * 100)
    );
    const power = (voltage * current) / 1000;
    const status = current > 0 ? "Discharging" : "Charging";
    const batteryCapacity = 2200; // mAh
    const runtime = (batteryCapacity / Math.abs(current)) * (percentage / 100);
    return {
      ...nodeData,
      percentage: Math.round(percentage),
      status,
      power: power.toFixed(2),
      runtime: runtime.toFixed(1),
    };
  }

  return (
    <div className="battery-dashboard">
      <h2>🔋 Battery Life</h2>
      <div className="pods-container">
        {pods.map((pod) => (
          <div
            key={pod.node_id}
            className={`pod-card ${
              pod.percentage < 20
                ? "low"
                : pod.percentage < 60
                ? "medium"
                : "good"
            }`}
          >
            <h3>{pod.node_id}</h3>
            <div className="battery-bar">
              <div
                className="battery-fill"
                style={{ width: `${pod.percentage}%` }}
              ></div>
            </div>
            <p>🔋 {pod.percentage}%</p>
            <p>⚡ {pod.voltage.toFixed(2)}V | {pod.current}mA</p>
            <p>💡 Power: {pod.power}W</p>
            <p>⏳ Runtime Left: {pod.runtime} hrs</p>
            <p>Status: {pod.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
