package com.tutorsite.model;

import com.tutorsite.model.enums.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer grade;

    @Enumerated(EnumType.STRING)
    private Subject subject;

    @Column(columnDefinition = "text")
    private String goals;

    @Builder.Default
    private Integer progressPercent = 0;

    @Column(columnDefinition = "text")
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("deadline ASC")
    private List<Assignment> assignments = new ArrayList<>();

    public String getFullName() {
        return user != null ? user.getFullName() : "";
    }
}
