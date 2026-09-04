package com.tutorsite.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AssignmentStatus {
    ASSIGNED("Назначено"),
    IN_PROGRESS("В работе"),
    SUBMITTED("Сдано"),
    CHECKED("Проверено");

    private final String title;
}
