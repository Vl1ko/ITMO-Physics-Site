package com.tutorsite.repository;

import com.tutorsite.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByStudentIdOrderByDeadlineAsc(Long studentId);
}
