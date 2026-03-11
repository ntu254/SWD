package com.example.demo.decorator;

/**
 * Concrete Decorator - thêm logging trước và sau khi action execute.
 */
public class LoggingDecorator extends ActionDecorator {

    public LoggingDecorator(BaseAction wrappedAction) {
        super(wrappedAction);
    }

    @Override
    public String execute() {
        System.out.println();
        System.out.println("  📝 [LOG] Bắt đầu thực hiện: " + wrappedAction.getDescription());
        System.out.println("  ─────────────────────────────────────────────────────────");

        String result = super.execute();

        System.out.println("  ─────────────────────────────────────────────────────────");
        System.out.println("  📝 [LOG] Hoàn thành: " + wrappedAction.getDescription());
        System.out.println();

        return result;
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + Logging";
    }
}
