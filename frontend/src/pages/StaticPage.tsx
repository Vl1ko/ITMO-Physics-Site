import { useEffect, useState } from 'react';
import { publicApi } from '../api/endpoints';
import type { SitePage } from '../types';

export function StaticPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<SitePage | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(null);
    setError('');
    publicApi
      .page(slug)
      .then(setPage)
      .catch(() => setError('Не удалось загрузить страницу'));
  }, [slug]);

  return (
    <section>
      <div className="container">
        {error && <div className="alert alert-err">{error}</div>}
        {page && (
          <>
            <h2 className="section-title">{page.title}</h2>
            <div className="page-content" dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
          </>
        )}
        {!page && !error && <p className="muted">Загрузка...</p>}
      </div>
    </section>
  );
}
