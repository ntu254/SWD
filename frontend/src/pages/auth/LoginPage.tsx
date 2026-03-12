import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPinned,
  ShieldCheck,
  Sparkles,
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
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
      toast.error(message);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Welcome back"
      heroTitle="A cleaner city starts with a calmer interface."
      heroDescription="GreenLoop now feels like a real product: softer colors, clearer hierarchy, and the same trusted workflow for citizens, collectors, enterprises and admins."
      highlights={[
        {
          icon: MapPinned,
          title: "Track field activity",
          description:
            "Follow waste reports, pickup routes and service areas in one polished workspace.",
        },
        {
          icon: ShieldCheck,
          title: "Role-based access",
          description:
            "Each team lands in the same system with tailored navigation and zero workflow drift.",
        },
        {
          icon: Sparkles,
          title: "Modern pastel system",
          description:
            "Refined cards, tables and forms create a startup-grade product feel without changing behavior.",
        },
      ]}
      panelTitle="Sign in to your workspace"
      panelDescription="Continue where you left off with the same account and permissions."
      footer={
        <p className="text-center">
          Do not have an account?{" "}
          <Link className="font-semibold text-emerald-700" to="/register">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="login-email"
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="pl-11"
            />
          </div>
          {errors.email ? (
            <p role="alert" className="text-sm text-red-700">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="login-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-11 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthScaffold>
  );
}
