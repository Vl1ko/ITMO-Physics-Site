package com.tutorsite.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Subject {
    PHYSICS("Физика"),
    MATH("Математика");

    private final String title;
}
