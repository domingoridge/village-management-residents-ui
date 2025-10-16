"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";

/**
 * Validate redirect URL to prevent open redirect vulnerabilities
 * Same validation as middleware to ensure consistency
 */
function validateRedirectUrl(url: string): string {
  if (!url || !url.startsWith("/")) {
    return ROUTES.DASHBOARD;
  }

  if (url.startsWith("/auth")) {
    return ROUTES.DASHBOARD;
  }

  const internalPathRegex = /^\/[a-zA-Z0-9\/_-]*$/;
  if (!internalPathRegex.test(url)) {
    return ROUTES.DASHBOARD;
  }

  if (url.length > 2000) {
    return ROUTES.DASHBOARD;
  }

  return url;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await signIn(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      const redirectParam = searchParams.get("redirect") || ROUTES.DASHBOARD;
      const validatedRedirect = validateRedirectUrl(redirectParam);
      router.push(validatedRedirect);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Village Portal account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-testid="login-form"
        >
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            fullWidth
            required
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            fullWidth
            required
            {...register("password")}
          />

          <div className="flex items-center justify-end">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-sm text-primary-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <p className="text-sm text-neutral/70">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="font-medium text-primary-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
