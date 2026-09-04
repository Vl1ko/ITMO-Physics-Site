import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/endpoints';
import { OrbitingCircles } from '../components/OrbitingCircles';
import { BlurFade } from '../components/BlurFade';
import { NumberTicker } from '../components/NumberTicker';
import { ReviewList } from './Reviews';
import type { Review } from '../types';

export function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    publicApi.reviews().then(setReviews).catch(() => setReviews([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <BlurFade className="hero-copy" delay={0.05}>
            <p className="eyebrow"><span>Персональные занятия</span><span>9–11 классы · 1–2 курс</span></p>
            <h1>Не заучивать.<br /><em>Понимать.</em></h1>
            <p className="hero-lead">
              Физика и математика через логику, эксперименты и ясные модели. Подготовка к экзаменам,
              олимпиадам и первым университетским курсам.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn">Открыть каталог <span aria-hidden="true">↗</span></Link>
              <Link to="/register" className="text-link">Стать учеником <span aria-hidden="true">→</span></Link>
            </div>
          </BlurFade>
          <BlurFade className="orbit-visual" delay={0.18}>
            <div className="orbit-layer orbit-layer-outer">
              <OrbitingCircles radius={176} duration={13} iconSize={18}>
                <span className="electron electron-primary" />
              </OrbitingCircles>
            </div>
            <div className="orbit-layer orbit-layer-inner">
              <OrbitingCircles radius={116} duration={9} delay={2} iconSize={13} reverse>
                <span className="electron electron-secondary" />
              </OrbitingCircles>
            </div>
            <div className="orbit-core">E<span>= mc²</span></div>
            <span className="axis axis-x">x</span>
            <span className="axis axis-y">y</span>
            <span className="formula formula-one">F = ma</span>
            <span className="formula formula-two">∫ f(x)dx</span>
          </BlurFade>
        </div>
        <div className="container proof-strip">
          <div><strong><NumberTicker value={10} suffix="+" /></strong><span>лет преподавания</span></div>
          <div><strong><NumberTicker value={2} pad={2} /></strong><span>предмета в одной системе</span></div>
          <div><strong><NumberTicker value={1} pad={2} /></strong><span>цель — уверенное решение</span></div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container">
          <BlurFade className="section-heading">
            <p className="eyebrow">Обратная связь</p>
            <h2>Что говорят ученики</h2>
            <Link to="/reviews" className="text-link">Все отзывы <span aria-hidden="true">→</span></Link>
          </BlurFade>
          <BlurFade className="review-grid" delay={0.08}><ReviewList reviews={reviews} /></BlurFade>
        </div>
      </section>
    </>
  );
}
