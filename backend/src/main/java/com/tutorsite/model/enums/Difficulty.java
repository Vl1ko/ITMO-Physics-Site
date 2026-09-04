package com.tutorsite.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Difficulty {
    EASY("Лёгкая"),
    MEDIUM("Средняя"),
    HARD("Сложная"),
    OLYMPIAD("Олимпиадная");

    private final String title;
}
