import React from 'react'

const CONFIG = {
  VERIFIED:  { cls: 'badge-verified',  icon: '✅', label: 'Verified'  },
  APPROVED:  { cls: 'badge-approved',  icon: '✅', label: 'Approved'  },
  SAFE:      { cls: 'badge-safe',      icon: '✅', label: 'Safe'      },
  UNCHANGED: { cls: 'badge-verified',  icon: '✅', label: 'Unchanged' },
  BLOCKED:   { cls: 'badge-blocked',   icon: '🔴', label: 'Blocked'   },
  TAMPERED:  { cls: 'badge-tampered',  icon: '🔴', label: 'Tampered'  },
  VIOLATION: { cls: 'badge-violation', icon: '🔴', label: 'Violation' },
  FAILED:    { cls: 'badge-failed',    icon: '🔴', label: 'Failed'    },
  MODIFIED:  { cls: 'badge-blocked',   icon: '🔴', label: 'Modified'  },
  DELETED:   { cls: 'badge-blocked',   icon: '🔴', label: 'Deleted'   },
  ADDED:     { cls: 'badge-info',      icon: '🔵', label: 'Added'     },
  WARNING:   { cls: 'badge-warning',   icon: '⚠️',  label: 'Warning'  },
  PENDING:   { cls: 'badge-pending',   icon: '⚠️',  label: 'Pending'  },
  RUNNING:   { cls: 'badge-running',   icon: '🔵', label: 'Running'   },
}

export default function StatusBadge({ status, text }) {
  const key = (status || '').toUpperCase()
  const c   = CONFIG[key] || { cls: 'badge-info', icon: '●', label: status || '—' }
  return (
    <span className={`badge ${c.cls}`}>
      <span>{c.icon}</span>
      {text || c.label}
    </span>
  )
}
