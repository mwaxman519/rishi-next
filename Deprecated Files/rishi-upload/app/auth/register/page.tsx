"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import Link from "next/link";

// Register form schema with registration passcode
const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    registrationPasscode: z
      .string()
      .min(1, "Registration passcode is required"),
    role: z.string().optional().default("brand_agent"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading, register } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      registrationPasscode: "",
      role: "brand_agent",
    },
  });

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await register(
        data.email, // Use email as username
        data.password,
        data.confirmPassword,
        data.role || "brand_agent",
        data.registrationPasscode,
      );

      if (result.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form Section */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Rishi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Workforce Management Platform
            </p>
          </div>

          <Card className="border shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Create Account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your information to get started
              </CardDescription>
            </CardHeader>

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your email will be used as your username
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="registrationPasscode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Passcode</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter registration passcode"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the passcode provided to you by the
                          administrator
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold"
                    disabled={registerForm.formState.isSubmitting}
                  >
                    {registerForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="/auth/login"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-lg text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Welcome to Rishi
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join the Rishi Platform to streamline your operations and
                connect with opportunities.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 text-left">
                <div className="w-10 h-10 bg-primary/15 dark:bg-primary/25 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Create Your Account
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your details and registration passcode to get started
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-left">
                <div className="w-10 h-10 bg-primary/15 dark:bg-primary/25 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Set Up Your Profile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your profile and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-left">
                <div className="w-10 h-10 bg-primary/15 dark:bg-primary/25 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Start Managing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Access your dashboard and begin managing your availability
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 dark:bg-muted/30 px-4 py-2 rounded-full">
                <AlertCircle className="h-4 w-4" />
                <span>Registration passcode required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
