package com.tutorsite.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("каталог доступен без авторизации")
    void catalogIsPublic() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    @DisplayName("фильтр по предмету отдаёт только его задачи")
    void catalogFilterBySubject() throws Exception {
        mockMvc.perform(get("/api/tasks").param("subject", "PHYSICS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].subjectCode").value(everyItem(is("PHYSICS"))));
    }

    @Test
    @DisplayName("класс и сложность сужают выборку")
    void catalogFilterByGradeAndDifficulty() throws Exception {
        mockMvc.perform(get("/api/tasks")
                        .param("subject", "PHYSICS")
                        .param("grade", "10")
                        .param("difficulty", "HARD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].grade").value(everyItem(is(10))))
                .andExpect(jsonPath("$.content[*].difficultyCode").value(everyItem(is("HARD"))));
    }

    @Test
    @DisplayName("в справочниках есть предметы, сложности и классы")
    void dictionaries() throws Exception {
        mockMvc.perform(get("/api/tasks/dictionaries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subjects[0].code").exists())
                .andExpect(jsonPath("$.difficulties[0].title").exists())
                .andExpect(jsonPath("$.grades").isArray());
    }

    @Test
    @DisplayName("страницы про меня и исследования открыты всем")
    void pagesArePublic() throws Exception {
        mockMvc.perform(get("/api/pages/about"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("about"));
        mockMvc.perform(get("/api/pages/research"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Исследования"));
    }

    @Test
    @DisplayName("отзывы читаются без токена")
    void reviewsArePublic() throws Exception {
        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("на несуществующую страницу приходит 400 с сообщением")
    void unknownPageReturnsError() throws Exception {
        mockMvc.perform(get("/api/pages/unknown-slug"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }
}
