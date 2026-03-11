package com.example.demo.decorator;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Concrete Decorator - thêm timestamp vào output.
 */
public class TimestampDecorator extends ActionDecorator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public TimestampDecorator(BaseAction wrappedAction) {
        super(wrappedAction);
    }

    @Override
    public String execute() {
        System.out.println("  🕐 [TIMESTAMP] Thời gian thực hiện: " + LocalDateTime.now().format(FORMATTER));

        String result = super.execute();

        System.out.println("  🕐 [TIMESTAMP] Thời gian kết thúc: " + LocalDateTime.now().format(FORMATTER));

        return result;
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + Timestamp";
    }
}
