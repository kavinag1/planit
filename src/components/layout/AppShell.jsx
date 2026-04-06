function AppShell({ children }) {
  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <p className="app-shell__eyebrow">Section 1</p>
        <h1>Planit AI Foundation</h1>
        <p className="app-shell__subtitle">
          React + Firebase setup is connected and ready for feature build-out.
        </p>
      </header>
      <section className="app-shell__content">{children}</section>
    </main>
  )
}

export default AppShell