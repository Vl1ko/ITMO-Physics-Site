package com.tutorsite.service;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.ByteArrayInputStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ExcelExportServiceTest {

    @Autowired
    private ExcelExportService excelExportService;

    @Test
    @DisplayName("в xlsx все колонки и данные учеников")
    void exportStudents() throws Exception {
        byte[] bytes = excelExportService.exportStudents();
        assertThat(bytes).isNotEmpty();

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheet("Ученики");
            assertThat(sheet).isNotNull();

            Row header = sheet.getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("ФИО ученика");
            assertThat(header.getCell(6).getStringCellValue()).isEqualTo("Текущий прогресс, %");
            assertThat(header.getCell(7).getStringCellValue()).isEqualTo("Комментарий / заметки");

            assertThat(sheet.getLastRowNum()).isGreaterThanOrEqualTo(1);
            assertThat(sheet.getRow(1).getCell(0).getStringCellValue()).isNotBlank();
        }
    }
}
