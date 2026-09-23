import React from 'react'

export default function Card({ children, className = '', style = {}, noPad = false }) {
  return (
    <div className={`card ${noPad ? '' : 'card-pad'} ${className}`} style={style}>
      {children}
    </div>
  )
}
