package com.tutorsite.dto;

import com.tutorsite.model.StudentProfile;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class StudentDto {
    Long id;
    String fullName;
    String email;
    Integer grade;
    String subject;
    String subjectCode;
    String goals;
    Integer progressPercent;
    String notes;
    List<Integer> grades;

    public static StudentDto from(StudentProfile s) {
        return StudentDto.builder()
                .id(s.getId())
                .fullName(s.getFullName())
                .email(s.getUser().getEmail())
                .grade(s.getGrade())
                .subject(s.getSubject() != null ? s.getSubject().getTitle() : null)
                .subjectCode(s.getSubject() != null ? s.getSubject().name() : null)
                .goals(s.getGoals())
                .progressPercent(s.getProgressPercent())
                .notes(s.getNotes())
                .grades(s.getAssignments().stream()
                        .map(a -> a.getGrade())
                        .filter(g -> g != null)
                        .toList())
                .build();
    }
}
