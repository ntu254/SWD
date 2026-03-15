import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPinned,
  ShieldCheck,
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
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const auth = res.data.data;
      setAuth(auth);
      const roleRoutes: Record<string, string> = {
        CITIZEN: "/citizen",
        COLLECTOR: "/collector",
        ENTERPRISE: "/enterprise",
        ADMIN: "/admin",
      };
      navigate(roleRoutes[auth.role] || "/");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Login failed";
      const localizedMessage = message === "Login failed" ? "Đăng nhập thất bại" : message;
      toast.error(localizedMessage);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Chào mừng quay lại"
      heroTitle="Một thành phố sạch hơn bắt đầu từ trải nghiệm gọn gàng hơn."
      heroDescription="GreenLoop giờ mang cảm giác của một sản phẩm hoàn chỉnh: màu sắc dịu hơn, phân cấp rõ hơn và vẫn giữ nguyên luồng quen thuộc cho công dân, nhân viên thu gom, doanh nghiệp và quản trị viên."
      highlights={[
        {
          icon: MapPinned,
          title: "Theo dõi hoạt động thực địa",
          description:
            "Theo dõi báo cáo rác, lộ trình thu gom và khu vực phục vụ trong một không gian thống nhất.",
        },
        {
          icon: ShieldCheck,
          title: "Truy cập theo vai trò",
          description:
            "Mỗi nhóm vào cùng một hệ thống nhưng có điều hướng phù hợp mà không lệch luồng công việc.",
        },

      ]}
      panelTitle="Đăng nhập vào không gian làm việc"
      panelDescription="Tiếp tục công việc bằng chính tài khoản và quyền truy cập hiện có."
      footer={
        <p className="text-center">
          Chưa có tài khoản?{" "}
          <Link className="font-semibold text-emerald-700" to="/register">
            Tạo tài khoản
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
        <div className="space-y-2.5">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Địa chỉ email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="login-email"
              {...register("email")}
              type="email"
              placeholder="ban@example.com"
              className="h-12 rounded-[20px] border-[rgba(32,48,51,0.1)] bg-[rgba(255,255,255,0.98)] pl-11 shadow-[0_10px_24px_rgba(24,58,49,0.05)]"
            />
          </div>
          {errors.email ? (
            <p role="alert" className="text-sm text-red-700">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="login-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="h-12 rounded-[20px] border-[rgba(32,48,51,0.1)] bg-[rgba(255,255,255,0.98)] pl-11 pr-12 shadow-[0_10px_24px_rgba(24,58,49,0.05)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-50)] hover:text-[var(--text-primary)]"
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
          size="lg"
          disabled={isSubmitting}
          className="w-full rounded-[20px] text-sm font-semibold shadow-[0_22px_36px_rgba(31,93,78,0.26)] sm:text-base"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </AuthScaffold>
  );
}
