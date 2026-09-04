package com.tutorsite.controller;

import com.tutorsite.dto.PageDto;
import com.tutorsite.service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @GetMapping("/{slug}")
    public PageDto one(@PathVariable String slug) {
        return PageDto.from(pageService.getBySlug(slug));
    }
}
