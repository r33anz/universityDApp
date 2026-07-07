import React from "react";

export function Footer() {
    return (
      <footer className="border-t py-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-secondary)' }}>
        <div className="container mx-auto px-4 text-center text-xs theme-text-tertiary">
          <p>&copy; {new Date().getFullYear()} Universidad Mayor de San Simon. Todos los derechos reservados.</p>
        </div>
      </footer>
    );
}
