package com.tutorsite.dto;

import com.tutorsite.model.enums.Difficulty;
import com.tutorsite.model.enums.Subject;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskForm {

    private Long id;

    @NotBlank(message = "Укажите название")
    private String title;

    @NotBlank(message = "Укажите условие (LaTeX)")
    private String statementLatex;

    private String solutionLatex;

    @NotNull(message = "Укажите предмет")
    private Subject subject;

    @NotNull(message = "Укажите класс/курс")
    @Min(1) @Max(11)
    private Integer grade;

    @NotNull(message = "Укажите сложность")
    private Difficulty difficulty;

    private String topics;

    private String videoEmbedUrl;

    private String pdfUrl;

    private LocalDate publishedAt;

    private boolean published = true;
}
