package com.tutorsite.dto;

import com.tutorsite.model.Assignment;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class AssignmentDto {
    Long id;
    Long taskId;
    String taskTitle;
    LocalDate deadline;
    String status;
    String statusCode;
    Integer grade;
    String comment;

    public static AssignmentDto from(Assignment a) {
        return AssignmentDto.builder()
                .id(a.getId())
                .taskId(a.getTask().getId())
                .taskTitle(a.getTask().getTitle())
                .deadline(a.getDeadline())
                .status(a.getStatus().getTitle())
                .statusCode(a.getStatus().name())
                .grade(a.getGrade())
                .comment(a.getComment())
                .build();
    }
}
