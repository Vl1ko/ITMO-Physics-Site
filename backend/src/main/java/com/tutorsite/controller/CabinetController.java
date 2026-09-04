package com.tutorsite.controller;

import com.tutorsite.dto.*;
import com.tutorsite.model.StudentProfile;
import com.tutorsite.service.ReviewService;
import com.tutorsite.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cabinet")
@RequiredArgsConstructor
public class CabinetController {

    private final StudentService studentService;

    private final ReviewService reviewService;

    @GetMapping
    @Transactional(readOnly = true)
    public CabinetDto cabinet(Authentication authentication) {
        StudentProfile student = studentService.getByUserEmail(authentication.getName());
        return CabinetDto.builder()
                .student(StudentDto.from(student))
                .assignments(studentService.findAssignments(student.getId()).stream()
                        .map(AssignmentDto::from).toList())
                .build();
    }

    @PostMapping("/reviews")
    @Transactional
    public ResponseEntity<ReviewDto> submitReview(Authentication authentication,
                                                  @Valid @RequestBody ReviewForm form) {
        ReviewDto dto = ReviewDto.from(reviewService.submit(authentication.getName(), form));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
