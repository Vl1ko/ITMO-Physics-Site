import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/admin/students', label: 'Ученики (CRM)' },
  { to: '/admin/tasks', label: 'Задачи' },
  { to: '/admin/reviews', label: 'Отзывы' },
  { to: '/admin/pages', label: 'Страницы' },
];

export function AdminLayout() {
  return (
    <section>
      <div className="container">
        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </section>
  );
}
