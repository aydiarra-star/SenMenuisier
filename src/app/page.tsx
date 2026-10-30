export default function HomePage() {
  return (
    <main aria-labelledby="page-title" style={{ minHeight: "100vh", padding: "2rem", display: "grid", placeItems: "center" }}>
      <section style={{ maxWidth: 680, textAlign: "center" }}>
        <p style={{ color: "var(--forest)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>SenMenuisier</p>
        <h1 id="page-title">Le savoir-faire sénégalais, connecté au monde.</h1>
        <p>La fondation technique est en cours de mise en place. L’interface de référence sera intégrée à l’identique avant l’activation des fonctionnalités métier.</p>
      </section>
    </main>
  );
}
