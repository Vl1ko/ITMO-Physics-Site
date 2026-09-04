package com.tutorsite.repository;

import com.tutorsite.model.Review;
import com.tutorsite.model.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status);

    List<Review> findAllByOrderByCreatedAtDesc();

    void deleteByAuthorId(Long authorId);
}
