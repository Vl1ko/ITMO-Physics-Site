package com.tutorsite.model;

import com.tutorsite.model.enums.Difficulty;
import com.tutorsite.model.enums.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "problem_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String statementLatex;

    @Column(columnDefinition = "text")
    private String solutionLatex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private Integer grade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_topics", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "topic")
    private Set<String> topics = new LinkedHashSet<>();

    private String videoEmbedUrl;

    private String pdfUrl;

    @Builder.Default
    @Column(nullable = false)
    private LocalDate publishedAt = LocalDate.now();

    @Builder.Default
    @Column(nullable = false)
    private boolean published = true;
}
