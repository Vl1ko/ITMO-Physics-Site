package com.tutorsite.service;

import com.tutorsite.model.SitePage;
import com.tutorsite.repository.SitePageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PageService {

    private final SitePageRepository pageRepository;

    @Transactional(readOnly = true)
    public SitePage getBySlug(String slug) {
        return pageRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Страница не найдена: " + slug));
    }

    @Transactional(readOnly = true)
    public List<SitePage> findAll() {
        return pageRepository.findAll();
    }

    @Transactional
    public SitePage updateContent(String slug, String title, String htmlContent) {
        SitePage page = getBySlug(slug);
        page.setTitle(title);
        page.setHtmlContent(htmlContent);
        page.setUpdatedAt(LocalDateTime.now());
        return page;
    }

}
