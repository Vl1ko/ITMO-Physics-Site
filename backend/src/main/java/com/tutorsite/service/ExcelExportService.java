package com.tutorsite.service;

import com.tutorsite.model.Assignment;
import com.tutorsite.model.StudentProfile;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private static final String[] HEADERS = {
            "ФИО ученика", "Email", "Класс / курс", "Предмет",
            "Цели и задачи", "Оценки за ДЗ (10-балльная)", "Текущий прогресс, %", "Комментарий / заметки"
    };

    private final StudentService studentService;

    @Transactional(readOnly = true)
    public byte[] exportStudents() {
        List<StudentProfile> students = studentService.findAll();

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Ученики");

            CellStyle headerStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            headerStyle.setFont(bold);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (StudentProfile s : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getFullName());
                row.createCell(1).setCellValue(s.getUser().getEmail());
                row.createCell(2).setCellValue(s.getGrade() != null ? String.valueOf(s.getGrade()) : "");
                row.createCell(3).setCellValue(s.getSubject() != null ? s.getSubject().getTitle() : "");
                row.createCell(4).setCellValue(nvl(s.getGoals()));
                row.createCell(5).setCellValue(gradesAsString(s.getAssignments()));
                row.createCell(6).setCellValue(s.getProgressPercent() != null ? s.getProgressPercent() : 0);
                row.createCell(7).setCellValue(nvl(s.getNotes()));
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Ошибка формирования Excel", e);
        }
    }

    private String gradesAsString(List<Assignment> assignments) {
        return assignments.stream()
                .filter(a -> a.getGrade() != null)
                .map(a -> String.valueOf(a.getGrade()))
                .collect(Collectors.joining(", "));
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}
