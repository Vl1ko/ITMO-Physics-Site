package com.tutorsite.controller;

import com.tutorsite.dto.ReviewDto;
import com.tutorsite.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Transactional(readOnly = true)
    public List<ReviewDto> published() {
        return reviewService.findPublished().stream().map(ReviewDto::from).toList();
    }
}
