package com.tutorsite.service;

import com.tutorsite.dto.TaskCardDto;
import com.tutorsite.dto.TaskFilter;
import com.tutorsite.dto.TaskForm;
import com.tutorsite.model.enums.Difficulty;
import com.tutorsite.model.enums.Subject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    private Long hardPhysicsId;

    private String uniqueTopic;

    @BeforeEach
    void setUp() {
        uniqueTopic = "Тест-Термодинамика-" + System.nanoTime();
        hardPhysicsId = taskService.save(taskForm(
                "Тест: цикл Карно", Subject.PHYSICS, 10, Difficulty.HARD, uniqueTopic)).getId();
        taskService.save(taskForm(
                "Тест: производная", Subject.MATH, 11, Difficulty.EASY, "Тест-Производные"));
    }

    @Test
    @DisplayName("фильтр по всем четырём критериям сразу")
    void filterAllCriteria() {
        TaskFilter filter = new TaskFilter();
        filter.setSubject(Subject.PHYSICS);
        filter.setGrade(10);
        filter.setDifficulty(Difficulty.HARD);
        filter.setTopic(uniqueTopic);

        Page<TaskCardDto> page = taskService.findCards(filter, 0, 10);

        assertThat(page.getContent())
                .extracting(TaskCardDto::getId)
                .containsExactly(hardPhysicsId);
    }

    @Test
    @DisplayName("без фильтров отдаёт все опубликованные")
    void filterEmpty() {
        Page<TaskCardDto> page = taskService.findCards(new TaskFilter(), 0, 50);
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("по несуществующей теме ничего нет")
    void filterNoMatch() {
        TaskFilter filter = new TaskFilter();
        filter.setTopic("Несуществующая тема");
        assertThat(taskService.findCards(filter, 0, 10).getTotalElements()).isZero();
    }

    @Test
    @DisplayName("черновик в каталог не попадает")
    void unpublishedHidden() {
        TaskForm form = taskForm("Тест: скрытая", Subject.MATH, 9, Difficulty.MEDIUM, "Тест-Скрытые");
        form.setPublished(false);
        taskService.save(form);

        TaskFilter filter = new TaskFilter();
        filter.setTopic("Тест-Скрытые");
        assertThat(taskService.findCards(filter, 0, 10).getTotalElements()).isZero();
    }

    @Test
    @DisplayName("темы разбираются из строки через запятую")
    void topicsParsed() {
        TaskForm form = taskForm("Тест: темы", Subject.MATH, 9, Difficulty.MEDIUM, "A, B , ,C");
        Long id = taskService.save(form).getId();
        assertThat(taskService.getById(id).getTopics()).containsExactly("A", "B", "C");
        assertThat(taskService.findAllTopics()).contains("A", "B", "C");
    }

    private TaskForm taskForm(String title, Subject s, int grade, Difficulty d, String topics) {
        TaskForm form = new TaskForm();
        form.setTitle(title);
        form.setStatementLatex("Условие $x^2$");
        form.setSolutionLatex("Решение $x$");
        form.setSubject(s);
        form.setGrade(grade);
        form.setDifficulty(d);
        form.setTopics(topics);
        return form;
    }
}
