package com.tutorsite.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class CabinetDto {
    StudentDto student;
    List<AssignmentDto> assignments;
}
