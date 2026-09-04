package com.tutorsite.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewForm {

    @NotBlank(message = "Текст отзыва не может быть пустым")
    private String text;

    @Min(1) @Max(5)
    private Integer rating;
}
