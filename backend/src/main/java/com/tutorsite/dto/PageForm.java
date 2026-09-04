package com.tutorsite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PageForm {

    @NotBlank(message = "Укажите заголовок")
    private String title;

    private String htmlContent;
}
