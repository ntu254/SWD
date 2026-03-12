import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  User,
  Users,
  Waves,
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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
      toast.success("Account created successfully");
      navigate("/citizen");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Registration failed";
      toast.error(message);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Join GreenLoop"
      heroTitle="Bring citizens, collectors and enterprises into one system."
      heroDescription="Create an account and step into a more intentional product experience with the same reporting, rewards and pickup features already wired to the platform."
      highlights={[
        {
          icon: Users,
          title: "Community-first onboarding",
          description:
            "Start as a citizen and move through a product that already understands every role.",
        },
        {
          icon: Gift,
          title: "Reward-driven engagement",
          description:
            "Reporting waste, earning points and checking status now feel smoother and more trustworthy.",
        },
        {
          icon: Waves,
          title: "Soft visual hierarchy",
          description:
            "Pastel surfaces and cleaner typography make the product easier to scan under pressure.",
        },
      ]}
      panelTitle="Create your account"
      panelDescription="Get started as a citizen account and access the same live platform immediately."
      footer={
        <p className="text-center">
          Already have an account?{" "}
          <Link className="font-semibold text-emerald-700" to="/login">
            Sign in
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
              First name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                id="register-first-name"
                {...register("firstName")}
                placeholder="Jane"
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
              Last name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                id="register-last-name"
                {...register("lastName")}
                placeholder="Doe"
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
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="register-email"
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
            htmlFor="register-password"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="register-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Choose a strong password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthScaffold>
  );
}
