import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { router } from "expo-router";

const signInFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

export const useViewModel = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        type: "sign-in",
        email: data.email,
      });

      if (res.error?.status) {
        alert("Failed to send OTP. Please try again." + res.error?.status);
        return;
      }

      router.push({
        pathname: "/(onboarding)/verify-otp",
        params: { email: data.email },
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };
  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
  };
};
