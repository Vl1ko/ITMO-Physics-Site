import { useEffect, useState } from 'react';
import { publicApi } from '../api/endpoints';
import { MagicCard } from '../components/MagicCard';
import type { Review } from '../types';

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="muted">Отзывов пока нет.</p>;
  }
  return (
    <>
      {reviews.map((review) => (
        <MagicCard key={review.id} className="review-card">
          {review.rating != null && (
            <div className="stars">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
          )}
          <p>{review.text}</p>
          <div className="author">
            {review.authorName} · {new Date(review.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </MagicCard>
      ))}
    </>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    publicApi.reviews().then(setReviews).catch(() => setReviews([]));
  }, []);

  return (
    <section>
      <div className="container">
        <h2 className="section-title">Отзывы учеников</h2>
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
