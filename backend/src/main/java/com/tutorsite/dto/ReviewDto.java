package com.tutorsite.dto;

import com.tutorsite.model.Review;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ReviewDto {
    Long id;
    String authorName;
    String text;
    Integer rating;
    String status;
    String statusCode;
    LocalDateTime createdAt;

    public static ReviewDto from(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .authorName(r.getAuthor().getFullName())
                .text(r.getText())
                .rating(r.getRating())
                .status(r.getStatus().getTitle())
                .statusCode(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
