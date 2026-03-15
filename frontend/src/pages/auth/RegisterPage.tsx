import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

import { authApi } from "../../api/auth";
import { AuthScaffold } from "../../components/ui/auth-scaffold";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({ ...data, role: "CITIZEN" });
      const auth = res.data.data;
      setAuth(auth);
      toast.success("Tạo tài khoản thành công");
      navigate("/citizen");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Tham gia GreenLoop"
      heroTitle="Kết nối công dân, thu gom và doanh nghiệp trong cùng một hệ thống."
      heroDescription="Tạo tài khoản để bắt đầu với trải nghiệm sản phẩm rõ ràng hơn, trong khi tính năng báo cáo, phần thưởng và thu gom vẫn hoạt động như hiện tại."
      highlights={[
        {
          icon: Users,
          title: "Bắt đầu từ cộng đồng",
          description:
            "Khởi đầu với vai trò công dân trong một sản phẩm đã sẵn sàng cho mọi vai trò.",
        },
        {
          icon: Gift,
          title: "Khuyến khích bằng phần thưởng",
          description:
            "Báo cáo rác, tích điểm và theo dõi trạng thái giờ mượt mà và dễ tin cậy hơn.",
        }
      ]}
      panelTitle="Tạo tài khoản của bạn"
      panelDescription="Bắt đầu với tài khoản công dân và truy cập nền tảng ngay lập tức."
      footer={
        <p className="text-center">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-emerald-700" to="/login">
            Đăng nhập
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="register-first-name"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              Tên
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                id="register-first-name"
                {...register("firstName")}
                placeholder="An"
                className="pl-11"
              />
            </div>
            {errors.firstName ? (
              <p role="alert" className="text-sm text-red-700">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="register-last-name"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              Họ
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                id="register-last-name"
                {...register("lastName")}
                placeholder="Nguyễn"
                className="pl-11"
              />
            </div>
            {errors.lastName ? (
              <p role="alert" className="text-sm text-red-700">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Địa chỉ email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="register-email"
              {...register("email")}
              type="email"
              placeholder="ban@example.com"
              className="pl-11"
            />
          </div>
          {errors.email ? (
            <p role="alert" className="text-sm text-red-700">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-password"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="register-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Chọn mật khẩu mạnh"
              className="pl-11 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--text-primary)]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p role="alert" className="text-sm text-red-700">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-sm sm:text-base"
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>
    </AuthScaffold>
  );
}
