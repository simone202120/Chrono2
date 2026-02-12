function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-4xl font-semibold">📋 Agile Planner</h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          PWA mobile personale per la gestione degli impegni in stile agile
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <div
            className="px-4 py-2 text-white font-medium"
            style={{
              backgroundColor: 'var(--color-weight-1)',
              borderRadius: '20px',
            }}
          >
            Sprint 1
          </div>
          <div
            className="px-4 py-2 text-white font-medium"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: '20px',
            }}
          >
            Task 1.1 ✓
          </div>
        </div>
        <p
          className="text-sm mt-8"
          style={{ color: 'var(--color-text-placeholder)' }}
        >
          Setup completo • React 18 + Vite + TypeScript + Tailwind + PWA
        </p>
      </div>
    </div>
  )
}

export default App
