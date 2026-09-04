package com.tutorsite.dto;

import com.tutorsite.model.enums.Subject;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistrationForm {

    @NotBlank(message = "Укажите ФИО")
    private String fullName;

    @NotBlank(message = "Укажите email")
    @Email(message = "Некорректный email")
    private String email;

    @NotBlank(message = "Укажите пароль")
    @Size(min = 6, message = "Пароль не короче 6 символов")
    private String password;

    @Min(value = 1, message = "Класс/курс от 1")
    @Max(value = 11, message = "Класс/курс до 11")
    private Integer grade;

    private Subject subject;
}
