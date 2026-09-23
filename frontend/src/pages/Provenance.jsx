import React, { useState } from 'react'

const FLOW = [
  {
    icon: '🖼️',
    label: 'Raw Images',
    sub: '55,403 frames',
    id: 'COCO-RAW-v3.2',
    status: 'VERIFIED',
    color: '#2563EB',
    details: {
      Source: 'CCTV Camera Array',
      Format: 'JPEG / PNG',
      Resolution: '1920×1080',
      Captured: '2026-08-01',
      Hash: 'e7a9b1...c439',
    }
  },
  {
    icon: '🏷️',
    label: 'Annotation',
    sub: 'CVAT v2.1',
    id: 'ANNO-v3.2',
    status: 'VERIFIED',
    color: '#7C3AED',
    details: {
      Tool: 'CVAT 2.1',
      Classes: '12 object types',
      Annotators: '4 humans',
      'Reviewed By': 'QA Team',
      'Label Hash': 'f12e84...906b',
    }
  },
  {
    icon: '🗃️',
    label: 'Dataset',
    sub: 'coco-val-v3.2',
    id: 'DS-coco-val-v3.2',
    status: 'VERIFIED',
    color: '#0891B2',
    details: {
      Name: 'coco-val-v3.2',
      Split: 'Train 80% / Val 20%',
      'Manifest Hash': '9c85ec...1045',
      Created: '2026-08-15',
      Status: 'VERIFIED',
    }
  },
  {
    icon: '⚙️',
    label: 'Training Run',
    sub: 'YOLOv8 · 300 epochs',
    id: 'TRAIN-2026-08-20',
    status: 'VERIFIED',
    color: '#D97706',
    details: {
      Framework: 'PyTorch 2.1',
      Epochs: '300',
      'Batch Size': '32',
      GPU: 'A100 80GB',
      Duration: '14h 22m',
    }
  },
  {
    icon: '🛡️',
    label: 'Model',
    sub: 'YOLOv8-Perimeter v2.4',
    id: 'yolov8-perimeter.pt',
    status: 'APPROVED',
    color: '#16A34A',
    details: {
      Name: 'YOLOv8-Perimeter.pt',
      Version: 'v2.4.0',
      'SHA-256': 'd8a9...b4c2',
      Size: '6.2 MB',
      'mAP@50': '94.2%',
    }
  },
  {
    icon: '⚡',
    label: 'Inference',
    sub: '1,284 runs logged',
    id: 'INF-run-latest',
    status: 'VERIFIED',
    color: '#2563EB',
    details: {
      'Total Runs': '1,284',
      Blocked: '3',
      'Avg Latency': '9.4 ms',
      'Last Run': '2026-09-23',
      Chain: 'Merkle-verified',
    }
  },
  {
    icon: '📤',
    label: 'Output',
    sub: 'Hash-signed results',
    id: 'OUT-audited',
    status: 'VERIFIED',
    color: '#16A34A',
    details: {
      Format: 'JSON + Bounding Boxes',
      Signed: 'ED25519',
      'Audit Log': 'Immutable',
      'Chain Block': '#14,892',
      Integrity: '100%',
    }
  },
]

function ArrowSvg() {
  return (
    <div className="prov-arrow">
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
        <line x1="0" y1="10" x2="28" y2="10" stroke="#CBD5E1" strokeWidth="2" />
        <polyline points="22,4 30,10 22,16" stroke="#CBD5E1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function StatusDot({ status }) {
  const ok = /verified|approved/i.test(status || '')
  return (
    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: ok ? '#16A34A' : '#DC2626' }}>
      {ok ? '✅' : '🔴'} {status}
    </span>
  )
}

export default function Provenance() {
  const [tooltip, setTooltip] = useState(null) // index of open tooltip

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Provenance</div>
          <div className="page-subtitle">End-to-end cryptographic lineage — from raw image to signed output</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-verified" style={{ fontSize: '0.78rem' }}>
            ✅ Full Provenance Verified
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="card card-pad-sm mb-6 flex items-center gap-6 flex-wrap" style={{ padding: '12px 20px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Pipeline Steps</span>
        <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
        {[
          { color: '#16A34A', label: 'Verified / Approved' },
          { color: '#DC2626', label: 'Failed / Tampered'  },
          { color: '#D97706', label: 'Warning'            },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94A3B8' }}>
          Click any node for details
        </div>
      </div>

      {/* Flow diagram */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="prov-flow">
          {FLOW.map((node, i) => (
            <React.Fragment key={i}>
              <div
                className="prov-node prov-tooltip-wrap"
                onClick={() => setTooltip(tooltip === i ? null : i)}
              >
                {/* Tooltip */}
                {tooltip === i && (
                  <div className="prov-tooltip">
                    <div style={{ fontWeight: 700, marginBottom: 8, borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                      {node.icon} {node.label}
                    </div>
                    {Object.entries(node.details).map(([k, v]) => (
                      <div key={k} className="prov-tooltip-row">
                        <span className="prov-tooltip-key">{k}</span>
                        <span className="prov-tooltip-val" style={{ fontFamily: k.toLowerCase().includes('hash') || k.toLowerCase().includes('block') ? 'JetBrains Mono' : 'inherit', fontSize: k.toLowerCase().includes('hash') ? '0.65rem' : '0.72rem' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#64748B', borderTop: '1px solid #334155', paddingTop: 6 }}>
                      ID: <code style={{ color: '#93C5FD' }}>{node.id}</code>
                    </div>
                  </div>
                )}

                <div className="prov-card" style={{
                  borderColor: tooltip === i ? node.color : undefined,
                  boxShadow: tooltip === i ? `0 0 0 3px ${node.color}22` : undefined,
                }}>
                  {/* Step number */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: node.color,
                    color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px'
                  }}>
                    {i + 1}
                  </div>
                  <span className="prov-icon">{node.icon}</span>
                  <div className="prov-label">{node.label}</div>
                  <div className="prov-sub">{node.sub}</div>
                  <div className="prov-status" style={{ marginTop: 8 }}>
                    <StatusDot status={node.status} />
                  </div>
                </div>

                <div style={{ width: 2, height: 16, background: `${node.color}40`, borderRadius: 1 }} />
                <div style={{ fontSize: '0.6rem', color: '#94A3B8', textAlign: 'center', maxWidth: 120 }}>
                  <code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.58rem' }}>{node.id}</code>
                </div>
              </div>

              {i < FLOW.length - 1 && <ArrowSvg />}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom summary strip */}
        <div style={{
          borderTop: '1px solid #E2E8F0', background: '#F8FAFC',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
        }}>
          {[
            { label: 'Pipeline Steps', value: FLOW.length },
            { label: 'Verified Steps', value: FLOW.filter(f => /verified|approved/i.test(f.status)).length },
            { label: 'Chain Integrity', value: '100%', color: '#16A34A' },
            { label: 'Lineage Depth', value: `${FLOW.length} hops` },
            { label: 'Last Verified', value: new Date().toLocaleDateString('en-IN') },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: color || '#0F172A' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid-3 mt-6">
        {FLOW.slice(0, 6).map((node, i) => (
          <div key={i} className="card card-pad-sm" style={{ borderLeft: `3px solid ${node.color}` }}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: '1.2rem' }}>{node.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>{node.label}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{node.sub}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <StatusDot status={node.status} />
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#94A3B8', background: '#F8FAFC', padding: '5px 8px', borderRadius: 4 }}>
              {node.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
