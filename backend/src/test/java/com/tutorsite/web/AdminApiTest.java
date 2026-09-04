package com.tutorsite.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    private String studentToken;

    @BeforeEach
    void authenticate() throws Exception {
        adminToken = login("ney4s@test.local", "ney4s");
        studentToken = login("student@tutorsite.local", "student");
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    @Test
    @DisplayName("гостя в админку не пускает")
    void anonymousBlocked() throws Exception {
        mockMvc.perform(get("/api/admin/students")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ученику в админку тоже нельзя, 403")
    void studentForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/students").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("админу кабинет ученика недоступен, 403")
    void adminCannotUseCabinet() throws Exception {
        mockMvc.perform(get("/api/cabinet").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ученик видит свой кабинет с дз и прогрессом")
    void studentSeesCabinet() throws Exception {
        mockMvc.perform(get("/api/cabinet").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.student.fullName").isNotEmpty())
                .andExpect(jsonPath("$.student.progressPercent").exists())
                .andExpect(jsonPath("$.assignments").isArray());
    }

    @Test
    @DisplayName("crm целиком: создали, поменяли, удалили")
    void studentCrud() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("fullName", "Сидоров Сидор");
        payload.put("email", "sidorov_" + System.nanoTime() + "@test.local");
        payload.put("grade", 11);
        payload.put("subject", "MATH");
        payload.put("progressPercent", 20);

        String created = mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Сидоров Сидор"))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(created).get("id").asLong();

        payload.put("progressPercent", 75);
        payload.put("notes", "Отличный прогресс");
        mockMvc.perform(put("/api/admin/students/" + id)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressPercent").value(75))
                .andExpect(jsonPath("$.notes").value("Отличный прогресс"));

        mockMvc.perform(delete("/api/admin/students/" + id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("выдали дз и оно появилось у ученика")
    void assignmentFlow() throws Exception {
        String students = mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long studentId = objectMapper.readTree(students).get(0).get("id").asLong();

        String tasks = mockMvc.perform(get("/api/admin/tasks")
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn().getResponse().getContentAsString();
        long taskId = objectMapper.readTree(tasks).get(0).get("id").asLong();

        String created = mockMvc.perform(post("/api/admin/students/" + studentId + "/assignments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "studentId", studentId,
                                "taskId", taskId,
                                "status", "CHECKED",
                                "grade", 9,
                                "comment", "Хорошая работа"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grade").value(9))
                .andReturn().getResponse().getContentAsString();

        long assignmentId = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(get("/api/admin/students/" + studentId + "/assignments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + assignmentId + ")]").isNotEmpty());

        mockMvc.perform(delete("/api/admin/students/" + studentId + "/assignments/" + assignmentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("оценку больше 10 не принимает")
    void assignmentGradeValidation() throws Exception {
        String students = mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn().getResponse().getContentAsString();
        long studentId = objectMapper.readTree(students).get(0).get("id").asLong();

        mockMvc.perform(post("/api/admin/students/" + studentId + "/assignments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "studentId", studentId, "taskId", 1, "grade", 42))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.grade").exists());
    }

    @Test
    @DisplayName("экспорт отдаёт xlsx")
    void excelExport() throws Exception {
        mockMvc.perform(get("/api/admin/students/export").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=students.xlsx"))
                .andExpect(content().contentType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @Test
    @DisplayName("ученик выгрузку не скачает")
    void excelExportForbiddenForStudent() throws Exception {
        mockMvc.perform(get("/api/admin/students/export").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("созданная задача сразу видна в каталоге")
    void taskCreatedAppearsInCatalog() throws Exception {
        String topic = "Тема-" + System.nanoTime();
        Map<String, Object> payload = Map.of(
                "title", "API-задача",
                "statementLatex", "Найдите $x$",
                "solutionLatex", "$x = 1$",
                "subject", "MATH",
                "grade", 9,
                "difficulty", "EASY",
                "topics", topic,
                "published", true);

        mockMvc.perform(post("/api/admin/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.topics[0]").value(topic));

        mockMvc.perform(get("/api/tasks").param("topic", topic))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("API-задача"));
    }

    @Test
    @DisplayName("задачу без условия не создать")
    void taskValidation() throws Exception {
        mockMvc.perform(post("/api/admin/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "", "statementLatex", "", "subject", "MATH",
                                "grade", 9, "difficulty", "EASY", "published", true))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.title").exists());
    }

    @Test
    @DisplayName("отзыв появляется на сайте только после одобрения")
    void reviewModerationFlow() throws Exception {
        String text = "Отзыв-" + System.nanoTime();

        String created = mockMvc.perform(post("/api/cabinet/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("text", text, "rating", 5))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        long reviewId = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.text == '" + text + "')]").isEmpty());

        mockMvc.perform(patch("/api/admin/reviews/" + reviewId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "PUBLISHED"))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.text == '" + text + "')]").isNotEmpty());
    }

    @Test
    @DisplayName("непонятный статус отзыва не проходит")
    void invalidReviewStatus() throws Exception {
        mockMvc.perform(patch("/api/admin/reviews/1/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "WRONG"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("правки страницы видно в публичном api")
    void pageEditing() throws Exception {
        String html = "<p>Обновлено " + System.nanoTime() + "</p>";

        mockMvc.perform(put("/api/admin/pages/about")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("title", "Обо мне", "htmlContent", html))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pages/about"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.htmlContent").value(html));
    }
}
