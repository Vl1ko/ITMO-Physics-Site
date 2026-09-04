package com.tutorsite.dto;

import com.tutorsite.model.enums.AssignmentStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssignmentForm {

    private Long id;

    @NotNull(message = "Выберите ученика")
    private Long studentId;

    @NotNull(message = "Выберите задачу")
    private Long taskId;

    private LocalDate deadline;

    private AssignmentStatus status;

    @Min(1) @Max(10)
    private Integer grade;

    private String comment;
}
