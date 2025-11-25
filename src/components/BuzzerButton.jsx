import React, { useState } from 'react';

const BuzzerButton = ({ onBuzz, disabled }) => {
  const [cooldown, setCooldown] = useState(false);

  const handleBuzz = () => {
    if (disabled || cooldown) return;

    // Vibration si disponible
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Cooldown anti-spam
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);

    onBuzz();
  };

  return (
    <button
      className={`buzzer-button ${disabled || cooldown ? 'disabled' : ''}`}
      onClick={handleBuzz}
      disabled={disabled || cooldown}
    >
      <div className="buzzer-inner">
        <span className="buzzer-icon">🔔</span>
        <span className="buzzer-text">BUZZER</span>
      </div>
    </button>
  );
};

export default BuzzerButton;
