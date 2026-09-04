package com.tutorsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SitePage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String htmlContent;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
