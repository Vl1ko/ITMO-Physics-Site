package com.tutorsite.service;

import com.tutorsite.dto.ReviewForm;
import com.tutorsite.model.Review;
import com.tutorsite.model.User;
import com.tutorsite.model.enums.ReviewStatus;
import com.tutorsite.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Review> findPublished() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.PUBLISHED);
    }

    @Transactional(readOnly = true)
    public List<Review> findAll() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Review submit(String authorEmail, ReviewForm form) {
        User author = userService.getByEmail(authorEmail);
        Review review = Review.builder()
                .author(author)
                .text(form.getText())
                .rating(form.getRating())
                .status(ReviewStatus.PENDING)
                .build();
        return reviewRepository.save(review);
    }

    @Transactional
    public void moderate(Long id, ReviewStatus status) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Отзыв не найден: " + id));
        review.setStatus(status);
    }

    @Transactional
    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }
}
