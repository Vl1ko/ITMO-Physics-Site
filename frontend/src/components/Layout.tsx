import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="site-header">
        <nav className="container nav">
          <NavLink to="/" className="logo" aria-label="На главную">
            <span className="logo-mark" aria-hidden="true">φ</span>
            <span>Физика <i>/</i> Математика</span>
          </NavLink>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
          <div id="site-menu" className={`nav-menu${menuOpen ? ' is-open' : ''}`} key={location.pathname}>
            <div className="nav-links" onClick={() => setMenuOpen(false)}>
              <NavLink to="/about">Обо мне</NavLink>
              <NavLink to="/research">Исследования</NavLink>
              <NavLink to="/catalog">Задачи</NavLink>
              <NavLink to="/reviews">Отзывы</NavLink>
              <NavLink to="/contacts">Контакты</NavLink>
            </div>
            <div className="nav-actions" onClick={() => setMenuOpen(false)}>
              {isStudent && <NavLink to="/cabinet" className="btn btn-sm">Кабинет</NavLink>}
              {isAdmin && <NavLink to="/admin/students" className="btn btn-sm">Админ-панель</NavLink>}
              {user ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
              ) : (
                <NavLink to="/login" className="btn btn-ghost btn-sm">Войти</NavLink>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><span className="logo-mark" aria-hidden="true">φ</span> Физика / Математика</div>
          <p>Понимать закономерности.<br />Решать уверенно.</p>
          <p className="footer-meta">© 2026 · Преподавание и исследования</p>
        </div>
      </footer>
    </>
  );
}
