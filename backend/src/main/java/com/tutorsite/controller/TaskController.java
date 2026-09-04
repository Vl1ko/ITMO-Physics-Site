package com.tutorsite.controller;

import com.tutorsite.dto.DictionariesDto;
import com.tutorsite.dto.TaskCardDto;
import com.tutorsite.dto.TaskFilter;
import com.tutorsite.model.enums.AssignmentStatus;
import com.tutorsite.model.enums.Difficulty;
import com.tutorsite.model.enums.Subject;
import com.tutorsite.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public Page<TaskCardDto> list(TaskFilter filter,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        return taskService.findCards(filter, page, size);
    }

    @GetMapping("/{id}")
    public TaskCardDto one(@PathVariable Long id) {
        return TaskCardDto.from(taskService.getById(id));
    }

    @GetMapping("/dictionaries")
    public DictionariesDto dictionaries() {
        return DictionariesDto.builder()
                .subjects(options(Subject.values(), Subject::name, Subject::getTitle))
                .difficulties(options(Difficulty.values(), Difficulty::name, Difficulty::getTitle))
                .statuses(options(AssignmentStatus.values(), AssignmentStatus::name, AssignmentStatus::getTitle))
                .topics(taskService.findAllTopics())
                .grades(IntStream.rangeClosed(9, 11).boxed().toList())
                .build();
    }

    private <T> List<DictionariesDto.Option> options(T[] values,
                                                     java.util.function.Function<T, String> code,
                                                     java.util.function.Function<T, String> title) {
        return Arrays.stream(values)
                .map(v -> DictionariesDto.Option.builder()
                        .code(code.apply(v))
                        .title(title.apply(v))
                        .build())
                .toList();
    }
}
