package com.tutorsite.dto;

import com.tutorsite.model.enums.Difficulty;
import com.tutorsite.model.enums.Subject;
import lombok.Data;

@Data
public class TaskFilter {
    private Subject subject;

    private Integer grade;

    private Difficulty difficulty;

    private String topic;
}
