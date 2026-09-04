package com.tutorsite.service;

import com.tutorsite.dto.RegistrationForm;
import com.tutorsite.dto.ReviewForm;
import com.tutorsite.model.Review;
import com.tutorsite.model.enums.ReviewStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ReviewServiceTest {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    private String email;

    @BeforeEach
    void setUp() {
        email = "reviewer_" + System.nanoTime() + "@test.local";
        RegistrationForm form = new RegistrationForm();
        form.setFullName("Тестовый Ученик");
        form.setEmail(email);
        form.setPassword("password");
        userService.registerStudent(form);
    }

    @Test
    @DisplayName("новый отзыв уходит на модерацию и его не видно")
    void newReviewIsPending() {
        ReviewForm form = new ReviewForm();
        form.setText("Отличный преподаватель!");
        form.setRating(5);
        Review review = reviewService.submit(email, form);

        assertThat(review.getStatus()).isEqualTo(ReviewStatus.PENDING);
        assertThat(reviewService.findPublished())
                .extracting(Review::getId)
                .doesNotContain(review.getId());
    }

    @Test
    @DisplayName("после публикации отзыв виден всем")
    void publishedReviewVisible() {
        ReviewForm form = new ReviewForm();
        form.setText("Рекомендую!");
        Review review = reviewService.submit(email, form);

        reviewService.moderate(review.getId(), ReviewStatus.PUBLISHED);

        assertThat(reviewService.findPublished())
                .extracting(Review::getId)
                .contains(review.getId());
    }

    @Test
    @DisplayName("отклонённый отзыв не показываем")
    void rejectedReviewHidden() {
        ReviewForm form = new ReviewForm();
        form.setText("Текст");
        Review review = reviewService.submit(email, form);

        reviewService.moderate(review.getId(), ReviewStatus.REJECTED);

        assertThat(reviewService.findPublished())
                .extracting(Review::getId)
                .doesNotContain(review.getId());
    }
}
