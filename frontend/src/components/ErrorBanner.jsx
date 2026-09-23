import React, { useState } from 'react'

export default function ErrorBanner({ message, onDismiss }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !message) return null
  return (
    <div className="alert alert-error" style={{ marginBottom: 16 }}>
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => { setVisible(false); onDismiss?.() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}
      >×</button>
    </div>
  )
}
