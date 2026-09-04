package com.tutorsite.dto;

import com.tutorsite.model.ProblemTask;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.Set;

@Value
@Builder
public class TaskCardDto {
    Long id;
    String title;
    String statementLatex;
    String solutionLatex;
    String subject;
    String subjectCode;
    Integer grade;
    String difficulty;
    String difficultyCode;
    boolean published;
    Set<String> topics;
    String videoEmbedUrl;
    String pdfUrl;
    LocalDate publishedAt;

    public static TaskCardDto from(ProblemTask t) {
        return TaskCardDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .statementLatex(t.getStatementLatex())
                .solutionLatex(t.getSolutionLatex())
                .subject(t.getSubject().getTitle())
                .subjectCode(t.getSubject().name())
                .grade(t.getGrade())
                .difficulty(t.getDifficulty().getTitle())
                .difficultyCode(t.getDifficulty().name())
                .published(t.isPublished())
                .topics(t.getTopics())
                .videoEmbedUrl(t.getVideoEmbedUrl())
                .pdfUrl(t.getPdfUrl())
                .publishedAt(t.getPublishedAt())
                .build();
    }
}
