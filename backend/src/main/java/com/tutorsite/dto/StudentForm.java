package com.tutorsite.dto;

import com.tutorsite.model.enums.Subject;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentForm {

    private Long id;

    @NotBlank(message = "Укажите ФИО")
    private String fullName;

    @NotBlank(message = "Укажите email")
    @Email(message = "Некорректный email")
    private String email;

    private String password;

    @Min(1) @Max(11)
    private Integer grade;

    private Subject subject;

    private String goals;

    @Min(0) @Max(100)
    private Integer progressPercent;

    private String notes;
}
