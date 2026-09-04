package com.tutorsite.repository;

import com.tutorsite.model.ProblemTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProblemTaskRepository
        extends JpaRepository<ProblemTask, Long>, JpaSpecificationExecutor<ProblemTask> {

    @Query("select distinct t from ProblemTask p join p.topics t order by t")
    List<String> findAllTopics();
}
