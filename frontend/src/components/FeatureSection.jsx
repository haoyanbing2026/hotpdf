import { Link } from "react-router-dom"

function FeatureSection() {
  return (
    <section className="feature-section">
      <h2>What can you do with HotPDF?</h2>
      <div className="feature-grid">
        <Link to="/merge" className="feature-card" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="feature-icon">📎</div><h3>Merge PDF</h3>
          <p>Combine multiple PDF documents into one file quickly and easily.</p>
        </Link>
        <Link to="/split" className="feature-card" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="feature-icon">✂️</div><h3>Split PDF</h3>
          <p>Extract selected pages from PDF files without complicated steps.</p>
        </Link>
        <Link to="/compress" className="feature-card" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="feature-icon">📦</div><h3>Compress PDF</h3>
          <p>Reduce PDF file size while keeping documents easy to share.</p>
        </Link>
        <Link to="/convert" className="feature-card" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="feature-icon">📝</div><h3>Convert PDF</h3>
          <p>Convert PDF files into editable formats for your workflow.</p>
        </Link>
        <Link to="/edit" className="feature-card" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="feature-icon">📝</div><h3>Edit PDF</h3>
          <p>Reorder, rotate, delete, and insert PDF pages online, then download an edited PDF.</p>
        </Link>
      </div>
    </section>
  )
}

export default FeatureSection
