package com.tutorsite.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class DictionariesDto {
    List<Option> subjects;
    List<Option> difficulties;
    List<Option> statuses;
    List<String> topics;
    List<Integer> grades;

    @Value
    @Builder
    public static class Option {
        String code;
        String title;
    }
}
