package com.tutorsite.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReviewStatus {
    PENDING("На модерации"),
    PUBLISHED("Опубликован"),
    REJECTED("Отклонён");

    private final String title;
}
