package com.example.demo.decorator;

/**
 * Concrete Decorator - thêm validation trước khi execute.
 */
public class ValidationDecorator extends ActionDecorator {

    public ValidationDecorator(BaseAction wrappedAction) {
        super(wrappedAction);
    }

    @Override
    public String execute() {
        System.out.println("  ✔️  [VALIDATION] Đang kiểm tra quyền truy cập...");
        System.out.println("  ✔️  [VALIDATION] Xác thực người dùng: OK");
        System.out.println("  ✔️  [VALIDATION] Kiểm tra dữ liệu đầu vào: OK");
        System.out.println("  ✔️  [VALIDATION] Kiểm tra session: OK");
        System.out.println();

        return super.execute();
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + Validation";
    }
}
