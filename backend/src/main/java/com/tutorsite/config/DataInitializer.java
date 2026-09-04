package com.tutorsite.config;

import com.tutorsite.model.*;
import com.tutorsite.model.enums.*;
import com.tutorsite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    private final StudentProfileRepository studentRepository;

    private final ProblemTaskRepository taskRepository;

    private final AssignmentRepository assignmentRepository;

    private final SitePageRepository pageRepository;

    private final ReviewRepository reviewRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        userRepository.save(User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .fullName("Ney4s")
                .role(Role.ADMIN)
                .build());

        pageRepository.save(SitePage.builder()
                .slug("about").title("Обо мне")
                .htmlContent("<p>Преподаватель физики и математики. Научные интересы - космическая энергетика.</p>"
                        + "<p>Отредактируйте этот текст в админ-панели.</p>")
                .build());
        pageRepository.save(SitePage.builder()
                .slug("research").title("Исследования")
                .htmlContent("<p>Перечень научных проектов и публикаций с аннотациями.</p>")
                .build());

        ProblemTask t1 = taskRepository.save(ProblemTask.builder()
                .title("Идеальный газ в цикле")
                .statementLatex("Один моль идеального газа совершает цикл. Найдите КПД цикла, если $Q_1 = 500\\,\\text{Дж}$, а $Q_2 = 300\\,\\text{Дж}$.")
                .solutionLatex("КПД: $\\eta = 1 - \\dfrac{Q_2}{Q_1} = 1 - \\dfrac{300}{500} = 0{,}4 = 40\\%$.")
                .subject(Subject.PHYSICS).grade(10).difficulty(Difficulty.HARD)
                .topics(topics("Термодинамика"))
                .videoEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
                .publishedAt(LocalDate.now().minusDays(3))
                .build());

        taskRepository.save(ProblemTask.builder()
                .title("Квадратное уравнение с параметром")
                .statementLatex("При каких значениях параметра $a$ уравнение $x^2 - 2ax + a^2 - 1 = 0$ имеет два положительных корня?")
                .solutionLatex("Корни: $x = a \\pm 1$. Оба положительны при $a > 1$.")
                .subject(Subject.MATH).grade(9).difficulty(Difficulty.MEDIUM)
                .topics(topics("Квадратные уравнения", "Параметры"))
                .publishedAt(LocalDate.now().minusDays(1))
                .build());

        taskRepository.save(ProblemTask.builder()
                .title("Закон сохранения импульса")
                .statementLatex("Тело массой $m_1 = 2\\,\\text{кг}$, движущееся со скоростью $v_1 = 3\\,\\text{м/с}$, сталкивается с покоящимся телом массой $m_2 = 4\\,\\text{кг}$. Найдите скорость тел после абсолютно неупругого удара.")
                .solutionLatex("$v = \\dfrac{m_1 v_1}{m_1 + m_2} = \\dfrac{2 \\cdot 3}{6} = 1\\,\\text{м/с}$.")
                .subject(Subject.PHYSICS).grade(9).difficulty(Difficulty.EASY)
                .topics(topics("Механика", "Импульс"))
                .publishedAt(LocalDate.now())
                .build());

        User studentUser = userRepository.save(User.builder()
                .email("student@tutorsite.local")
                .password(passwordEncoder.encode("student"))
                .fullName("Иванов Иван Иванович")
                .role(Role.STUDENT)
                .build());
        StudentProfile student = studentRepository.save(StudentProfile.builder()
                .user(studentUser).grade(10).subject(Subject.PHYSICS)
                .goals("Подготовка к ЕГЭ по физике на 90+")
                .progressPercent(45)
                .notes("Сильная механика, подтянуть термодинамику")
                .build());
        assignmentRepository.save(Assignment.builder()
                .student(student).task(t1)
                .deadline(LocalDate.now().plusDays(7))
                .status(AssignmentStatus.ASSIGNED)
                .build());

        User secondUser = userRepository.save(User.builder()
                .email("petrova@tutorsite.local")
                .password(passwordEncoder.encode("student"))
                .fullName("Петрова Анна Сергеевна")
                .role(Role.STUDENT)
                .build());
        StudentProfile secondStudent = studentRepository.save(StudentProfile.builder()
                .user(secondUser).grade(11).subject(Subject.MATH)
                .goals("Профильная математика, олимпиады")
                .progressPercent(72)
                .notes("Быстро считает, теряет баллы на оформлении")
                .build());
        assignmentRepository.save(Assignment.builder()
                .student(secondStudent).task(t1)
                .deadline(LocalDate.now().minusDays(2))
                .status(AssignmentStatus.CHECKED)
                .grade(9)
                .comment("Верно, но не расписан переход к КПД")
                .build());

        // Один отзыв опубликован - он виден на сайте, второй ждёт модерации в админке
        reviewRepository.save(Review.builder()
                .author(secondUser)
                .text("За полгода вытянули профильную математику с 60 до 88 баллов на пробнике. "
                        + "Разборы задач видео очень выручают перед контрольными.")
                .rating(5)
                .status(ReviewStatus.PUBLISHED)
                .build());
        reviewRepository.save(Review.builder()
                .author(studentUser)
                .text("Отличные объяснения по механике, стало понятно наконец.")
                .rating(5)
                .status(ReviewStatus.PENDING)
                .build());
    }

    private Set<String> topics(String... values) {
        return new LinkedHashSet<>(List.of(values));
    }
}
