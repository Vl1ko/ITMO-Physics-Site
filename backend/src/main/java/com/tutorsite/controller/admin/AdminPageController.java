package com.tutorsite.controller.admin;

import com.tutorsite.dto.PageDto;
import com.tutorsite.dto.PageForm;
import com.tutorsite.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pages")
@RequiredArgsConstructor
public class AdminPageController {

    private final PageService pageService;

    @GetMapping
    public List<PageDto> list() {
        return pageService.findAll().stream().map(PageDto::from).toList();
    }

    @GetMapping("/{slug}")
    public PageDto one(@PathVariable String slug) {
        return PageDto.from(pageService.getBySlug(slug));
    }

    @PutMapping("/{slug}")
    public PageDto update(@PathVariable String slug, @Valid @RequestBody PageForm form) {
        return PageDto.from(pageService.updateContent(slug, form.getTitle(), form.getHtmlContent()));
    }
}
