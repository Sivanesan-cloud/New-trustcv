import React from 'react'

const STATUS_MAP = {
  VERIFIED:  { cls: 'badge--verified',  dot: 'green',  label: 'Verified'   },
  SUCCESS:   { cls: 'badge--success',   dot: 'green',  label: 'Success'    },
  APPROVED:  { cls: 'badge--approved',  dot: 'blue',   label: 'Approved'   },
  VIOLATION: { cls: 'badge--violation', dot: 'red',    label: 'Violation'  },
  TAMPERED:  { cls: 'badge--tampered',  dot: 'red',    label: 'Tampered'   },
  FAILED:    { cls: 'badge--error',     dot: 'red',    label: 'Failed'     },
  ERROR:     { cls: 'badge--error',     dot: 'red',    label: 'Error'      },
  MODIFIED:  { cls: 'badge--modified',  dot: 'red',    label: 'Modified'   },
  UNCHANGED: { cls: 'badge--unchanged', dot: 'gray',   label: 'Unchanged'  },
  ADDED:     { cls: 'badge--added',     dot: 'blue',   label: 'Added'      },
  DELETED:   { cls: 'badge--deleted',   dot: 'gray',   label: 'Deleted'    },
  PENDING:   { cls: 'badge--pending',   dot: 'gray',   label: 'Pending'    },
}

export default function StatusBadge({ status = '', size = 'md' }) {
  const key = (status || '').toUpperCase()
  const { cls, dot, label } = STATUS_MAP[key] || {
    cls: 'badge--unknown', dot: 'gray', label: status || 'Unknown',
  }

  return (
    <span
      className={`badge ${cls}`}
      style={size === 'sm' ? { fontSize: '0.68rem', padding: '2px 8px' } : {}}
      aria-label={`Status: ${label}`}
    >
      <span className={`badge-indicator badge-indicator--${dot}`} />
      {label}
    </span>
  )
}
