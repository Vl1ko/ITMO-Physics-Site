package com.tutorsite.controller.admin;

import com.tutorsite.dto.TaskCardDto;
import com.tutorsite.dto.TaskForm;
import com.tutorsite.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tasks")
@RequiredArgsConstructor
public class AdminTaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskCardDto> list() {
        return taskService.findAll().stream().map(TaskCardDto::from).toList();
    }

    @GetMapping("/{id}")
    public TaskCardDto one(@PathVariable Long id) {
        return TaskCardDto.from(taskService.getById(id));
    }

    @PostMapping
    public ResponseEntity<TaskCardDto> create(@Valid @RequestBody TaskForm form) {
        form.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TaskCardDto.from(taskService.save(form)));
    }

    @PutMapping("/{id}")
    public TaskCardDto update(@PathVariable Long id, @Valid @RequestBody TaskForm form) {
        form.setId(id);
        return TaskCardDto.from(taskService.save(form));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
