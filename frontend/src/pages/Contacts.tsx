import { MagicCard } from '../components/MagicCard';

export function Contacts() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">Контакты</h2>
        <MagicCard className="form-card contact-card">
          <p>
            📨 Telegram:{' '}
            <a href="https://t.me/Ney4s" target="_blank" rel="noreferrer">
              @Ney4s
            </a>
          </p>
          <p>
            ✉️ Почта: <a href="mailto:ney4s@tutorsite.local">ney4s@tutorsite.local</a>
          </p>
          <p>
            🔗 ВКонтакте:{' '}
            <a href="https://vk.com/Ney4s" target="_blank" rel="noreferrer">
              vk.com/Ney4s
            </a>
          </p>
        </MagicCard>
      </div>
    </section>
  );
}
