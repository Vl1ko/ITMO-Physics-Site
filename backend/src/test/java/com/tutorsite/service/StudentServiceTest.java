package com.tutorsite.service;

import com.tutorsite.dto.StudentForm;
import com.tutorsite.model.StudentProfile;
import com.tutorsite.model.enums.Subject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class StudentServiceTest {

    @Autowired
    private StudentService studentService;

    @Test
    @DisplayName("создаём и правим ученика из админки")
    void createAndEdit() {
        StudentForm form = new StudentForm();
        form.setFullName("Петров Пётр");
        form.setEmail("petrov_" + System.nanoTime() + "@test.local");
        form.setGrade(11);
        form.setSubject(Subject.MATH);
        form.setGoals("ЕГЭ 100 баллов");
        form.setProgressPercent(10);

        StudentProfile created = studentService.save(form);
        assertThat(created.getId()).isNotNull();
        assertThat(created.getFullName()).isEqualTo("Петров Пётр");

        form.setId(created.getId());
        form.setProgressPercent(55);
        form.setNotes("Хороший темп");
        StudentProfile updated = studentService.save(form);

        assertThat(updated.getProgressPercent()).isEqualTo(55);
        assertThat(updated.getNotes()).isEqualTo("Хороший темп");
    }

    @Test
    @DisplayName("на дубль email ругается")
    void duplicateEmailRejected() {
        String email = "dup_" + System.nanoTime() + "@test.local";
        StudentForm form = new StudentForm();
        form.setFullName("Первый");
        form.setEmail(email);
        studentService.save(form);

        StudentForm dup = new StudentForm();
        dup.setFullName("Второй");
        dup.setEmail(email);
        assertThatThrownBy(() -> studentService.save(dup))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("удалённый ученик пропадает из списка")
    void delete() {
        StudentForm form = new StudentForm();
        form.setFullName("Удаляемый");
        form.setEmail("del_" + System.nanoTime() + "@test.local");
        Long id = studentService.save(form).getId();

        studentService.delete(id);

        assertThat(studentService.findAll())
                .extracting(StudentProfile::getId)
                .doesNotContain(id);
    }
}
