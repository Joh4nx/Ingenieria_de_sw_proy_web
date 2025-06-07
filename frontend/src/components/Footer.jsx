import React from "react";

export default function Footer() {
  const footerStyle = {
    backgroundColor: "#222",
    color: "white",
    paddingTop: "40px",
    paddingBottom: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  };

  const rowStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  };

  const colStyle = {
    flex: "1 1 220px",
    marginBottom: "30px",
    minWidth: "200px",
  };

  const headingStyle = {
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: "15px",
  };

  const hrStyle = {
    width: "60px",
    height: "2px",
    backgroundColor: "#fff",
    border: "none",
    marginBottom: "15px",
  };

  const listStyle = {
    listStyle: "none",
    padding: 0,
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
  };

  const iconTextStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    marginBottom: "8px",
  };

  const socialListStyle = {
    listStyle: "none",
    padding: 0,
    display: "flex",
    gap: "15px",
  };

  const socialLinkStyle = {
    color: "white",
    fontSize: "20px",
    textDecoration: "none",
  };

  // Simple SVG icons for social media (Facebook, Twitter, Instagram, YouTube)
  // so no need for FontAwesome

  const icons = {
    facebook: (
      <svg
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.406.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.41c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.464.099 2.797.143v3.24h-1.92c-1.506 0-1.797.715-1.797 1.764v2.31h3.592l-.468 3.622h-3.124V24h6.116c.73 0 1.324-.594 1.324-1.326V1.326C24 .593 23.405 0 22.675 0z" />
      </svg>
    ),
    twitter: (
      <svg
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775a4.94 4.94 0 002.163-2.723 9.866 9.866 0 01-3.127 1.195 4.916 4.916 0 00-8.373 4.482A13.94 13.94 0 011.671 3.149a4.916 4.916 0 001.523 6.574 4.903 4.903 0 01-2.228-.616c-.054 2.28 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.922 4.922 0 004.596 3.417 9.867 9.867 0 01-6.102 2.105c-.396 0-.79-.023-1.17-.067a13.945 13.945 0 007.557 2.213c9.054 0 14-7.496 14-13.986 0-.21-.005-.423-.015-.633a9.936 9.936 0 002.457-2.548l-.047-.02z" />
      </svg>
    ),
    instagram: (
      <svg
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 2A3.75 3.75 0 004 7.75v8.5A3.75 3.75 0 007.75 20h8.5a3.75 3.75 0 003.75-3.75v-8.5A3.75 3.75 0 0016.25 4h-8.5zm8.5 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
      </svg>
    ),
    youtube: (
      <svg
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19.615 3.184A2.997 2.997 0 0017.04 2H6.96a2.997 2.997 0 00-2.576 1.184 31.03 31.03 0 00-1.854 4.774A31.031 31.031 0 002 12c0 1.17.12 2.326.53 3.543a31.028 31.028 0 001.854 4.774A2.997 2.997 0 006.96 22h10.08a2.997 2.997 0 002.575-1.184 31.028 31.028 0 001.854-4.774 31.028 31.028 0 00.53-3.543c0-1.17-.12-2.326-.53-3.543a31.028 31.028 0 00-1.854-4.774zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={rowStyle}>
          <div style={colStyle}>
            <h6 style={headingStyle}>Institucional</h6>
            <hr style={hrStyle} />
            <ul style={listStyle}>
              <li><a href="#" style={linkStyle}>¿Quiénes somos?</a></li>
              <li><a href="#" style={linkStyle}>Historia</a></li>
              <li><a href="#" style={linkStyle}>Misión y Visión</a></li>
              <li><a href="#" style={linkStyle}>Autoridades</a></li>
            </ul>
          </div>

          <div style={colStyle}>
            <h6 style={headingStyle}>Accesos Directos</h6>
            <hr style={hrStyle} />
            <ul style={listStyle}>
              <li><a href="#" style={linkStyle}>Admisiones</a></li>
              <li><a href="#" style={linkStyle}>Carreras</a></li>
              <li><a href="#" style={linkStyle}>Reglamentos</a></li>
              <li><a href="#" style={linkStyle}>Calendario Académico</a></li>
            </ul>
          </div>

          <div style={colStyle}>
            <h6 style={headingStyle}>Contáctanos</h6>
            <hr style={hrStyle} />
            <ul style={listStyle}>
              <li style={iconTextStyle}>
                <svg width="16" height="16" fill="white" viewBox="0 0 16 16"><path d="M8 0a8 8 0 108 8A8 8 0 008 0zM7 11V7h2v4H7zm1-10a1 1 0 11-1 1 1 1 0 011-1z"/></svg>
                Av. Principal #123, La Paz
              </li>
              <li style={iconTextStyle}>
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M2 3h20v18H2z"/></svg>
                info@ucb.edu.bo
              </li>
              <li style={iconTextStyle}>
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M6 2h12v20H6z"/></svg>
                +591 2 2123456
              </li>
              <li style={iconTextStyle}>
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                +591 2 2123457
              </li>
            </ul>
          </div>

          <div style={colStyle}>
            <h6 style={headingStyle}>Síguenos</h6>
            <hr style={hrStyle} />
            <ul style={socialListStyle}>
              <li><a href="#" style={socialLinkStyle} aria-label="Facebook">{icons.facebook}</a></li>
              <li><a href="#" style={socialLinkStyle} aria-label="Twitter">{icons.twitter}</a></li>
              <li><a href="#" style={socialLinkStyle} aria-label="Instagram">{icons.instagram}</a></li>
<li><a href="#" style={socialLinkStyle} aria-label="YouTube">{icons.youtube}</a></li>
</ul>
</div>
</div>
</div>
</footer>
);
}
