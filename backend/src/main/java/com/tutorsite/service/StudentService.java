package com.tutorsite.service;

import com.tutorsite.dto.AssignmentForm;
import com.tutorsite.dto.StudentForm;
import com.tutorsite.model.Assignment;
import com.tutorsite.model.StudentProfile;
import com.tutorsite.model.User;
import com.tutorsite.model.enums.AssignmentStatus;
import com.tutorsite.model.enums.Role;
import com.tutorsite.repository.AssignmentRepository;
import com.tutorsite.repository.ReviewRepository;
import com.tutorsite.repository.StudentProfileRepository;
import com.tutorsite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentRepository;

    private final UserRepository userRepository;

    private final AssignmentRepository assignmentRepository;

    private final ReviewRepository reviewRepository;

    private final TaskService taskService;

    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<StudentProfile> findAll() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public StudentProfile getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ученик не найден: " + id));
    }

    @Transactional(readOnly = true)
    public StudentProfile getByUserEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Профиль ученика не найден"));
    }

    @Transactional
    public StudentProfile save(StudentForm form) {
        StudentProfile profile;
        if (form.getId() != null) {
            profile = getById(form.getId());
            User user = profile.getUser();
            user.setFullName(form.getFullName());
            user.setEmail(form.getEmail());
            if (form.getPassword() != null && !form.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(form.getPassword()));
            }
        } else {
            if (userRepository.existsByEmailIgnoreCase(form.getEmail())) {
                throw new IllegalArgumentException("Email уже занят: " + form.getEmail());
            }
            String rawPassword = (form.getPassword() == null || form.getPassword().isBlank())
                    ? "student123" : form.getPassword();
            User user = userRepository.save(User.builder()
                    .email(form.getEmail())
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(form.getFullName())
                    .role(Role.STUDENT)
                    .build());
            profile = StudentProfile.builder().user(user).build();
        }
        profile.setGrade(form.getGrade());
        profile.setSubject(form.getSubject());
        profile.setGoals(form.getGoals());
        profile.setProgressPercent(form.getProgressPercent() != null ? form.getProgressPercent() : 0);
        profile.setNotes(form.getNotes());
        return studentRepository.save(profile);
    }

    @Transactional
    public void delete(Long id) {
        StudentProfile profile = getById(id);
        reviewRepository.deleteByAuthorId(profile.getUser().getId());
        userRepository.delete(profile.getUser());
    }

    @Transactional(readOnly = true)
    public List<Assignment> findAssignments(Long studentId) {
        return assignmentRepository.findByStudentIdOrderByDeadlineAsc(studentId);
    }

    @Transactional
    public Assignment saveAssignment(AssignmentForm form) {
        Assignment a = form.getId() != null
                ? assignmentRepository.findById(form.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Задание не найдено: " + form.getId()))
                : new Assignment();
        a.setStudent(getById(form.getStudentId()));
        a.setTask(taskService.getById(form.getTaskId()));
        a.setDeadline(form.getDeadline());
        a.setStatus(form.getStatus() != null ? form.getStatus() : AssignmentStatus.ASSIGNED);
        a.setGrade(form.getGrade());
        a.setComment(form.getComment());
        return assignmentRepository.save(a);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
}
