package com.tutorsite.dto;

import com.tutorsite.model.SitePage;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PageDto {
    Long id;
    String slug;
    String title;
    String htmlContent;
    LocalDateTime updatedAt;

    public static PageDto from(SitePage p) {
        return PageDto.builder()
                .id(p.getId())
                .slug(p.getSlug())
                .title(p.getTitle())
                .htmlContent(p.getHtmlContent())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
