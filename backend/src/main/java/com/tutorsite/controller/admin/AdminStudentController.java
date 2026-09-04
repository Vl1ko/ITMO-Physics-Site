package com.tutorsite.controller.admin;

import com.tutorsite.dto.AssignmentDto;
import com.tutorsite.dto.AssignmentForm;
import com.tutorsite.dto.StudentDto;
import com.tutorsite.dto.StudentForm;
import com.tutorsite.service.ExcelExportService;
import com.tutorsite.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final StudentService studentService;

    private final ExcelExportService excelExportService;

    @GetMapping
    @Transactional(readOnly = true)
    public List<StudentDto> list() {
        return studentService.findAll().stream().map(StudentDto::from).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public StudentDto one(@PathVariable Long id) {
        return StudentDto.from(studentService.getById(id));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<StudentDto> create(@Valid @RequestBody StudentForm form) {
        form.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(StudentDto.from(studentService.save(form)));
    }

    @PutMapping("/{id}")
    @Transactional
    public StudentDto update(@PathVariable Long id, @Valid @RequestBody StudentForm form) {
        form.setId(id);
        return StudentDto.from(studentService.save(form));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelExportService.exportStudents());
    }

    @GetMapping("/{id}/assignments")
    @Transactional(readOnly = true)
    public List<AssignmentDto> assignments(@PathVariable Long id) {
        return studentService.findAssignments(id).stream().map(AssignmentDto::from).toList();
    }

    @PostMapping("/{id}/assignments")
    @Transactional
    public ResponseEntity<AssignmentDto> createAssignment(@PathVariable Long id,
                                                          @Valid @RequestBody AssignmentForm form) {
        form.setId(null);
        form.setStudentId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AssignmentDto.from(studentService.saveAssignment(form)));
    }

    @PutMapping("/{id}/assignments/{assignmentId}")
    @Transactional
    public AssignmentDto updateAssignment(@PathVariable Long id,
                                          @PathVariable Long assignmentId,
                                          @Valid @RequestBody AssignmentForm form) {
        form.setId(assignmentId);
        form.setStudentId(id);
        return AssignmentDto.from(studentService.saveAssignment(form));
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id, @PathVariable Long assignmentId) {
        studentService.deleteAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }
}
