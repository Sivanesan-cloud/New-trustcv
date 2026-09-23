import React from 'react'

export default function Spinner({ text = 'Loading…', size = 'md' }) {
  return (
    <div className="spinner-wrap">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {text && <span>{text}</span>}
    </div>
  )
}
