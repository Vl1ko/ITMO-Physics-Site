package com.tutorsite.service;

import com.tutorsite.dto.TaskCardDto;
import com.tutorsite.dto.TaskFilter;
import com.tutorsite.dto.TaskForm;
import com.tutorsite.model.ProblemTask;
import com.tutorsite.repository.ProblemTaskRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ProblemTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public Page<TaskCardDto> findCards(TaskFilter filter, int page, int size) {
        Specification<ProblemTask> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("published")));
            if (filter.getSubject() != null) {
                predicates.add(cb.equal(root.get("subject"), filter.getSubject()));
            }
            if (filter.getGrade() != null) {
                predicates.add(cb.equal(root.get("grade"), filter.getGrade()));
            }
            if (filter.getDifficulty() != null) {
                predicates.add(cb.equal(root.get("difficulty"), filter.getDifficulty()));
            }
            if (filter.getTopic() != null && !filter.getTopic().isBlank()) {
                predicates.add(cb.isMember(filter.getTopic(), root.get("topics")));
            }
            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return taskRepository
                .findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt", "id")))
                .map(TaskCardDto::from);
    }

    @Transactional(readOnly = true)
    public List<ProblemTask> findAll() {
        return taskRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt", "id"));
    }

    @Transactional(readOnly = true)
    public ProblemTask getById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Задача не найдена: " + id));
    }

    @Transactional(readOnly = true)
    public List<String> findAllTopics() {
        return taskRepository.findAllTopics();
    }

    @Transactional
    public ProblemTask save(TaskForm form) {
        ProblemTask task = form.getId() != null ? getById(form.getId()) : new ProblemTask();
        task.setTitle(form.getTitle());
        task.setStatementLatex(form.getStatementLatex());
        task.setSolutionLatex(form.getSolutionLatex());
        task.setSubject(form.getSubject());
        task.setGrade(form.getGrade());
        task.setDifficulty(form.getDifficulty());
        task.setTopics(parseTopics(form.getTopics()));
        task.setVideoEmbedUrl(emptyToNull(form.getVideoEmbedUrl()));
        task.setPdfUrl(emptyToNull(form.getPdfUrl()));
        task.setPublishedAt(form.getPublishedAt() != null ? form.getPublishedAt() : LocalDate.now());
        task.setPublished(form.isPublished());
        return taskRepository.save(task);
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.deleteById(id);
    }

    private LinkedHashSet<String> parseTopics(String raw) {
        if (raw == null || raw.isBlank()) return new LinkedHashSet<>();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
