import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { router, useLocalSearchParams } from "expo-router";

const verifyOTPFormSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPFormSchema>;

export const useViewModel = () => {
  const { email } = useLocalSearchParams<{ email: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: VerifyOTPFormData) => {
    if (!email) {
      alert("Email not found. Please go back and try again.");
      return;
    }

    try {
      const res = await authClient.signIn.emailOtp({
        email: email,
        otp: data.otp,
      });

      if (res.error?.status) {
        alert("Invalid OTP. Please try again. " + res.error?.message);
        return;
      } else {
        alert("OTP verified successfully!");
      }
      const session = await authClient.getSession();
      if (!session.data?.user.name) {
        router.replace({ pathname: "/(onboarding)/basic-info" });
        return;
      }
      // Success - navigate to main app or dashboard
      router.replace("/"); // Change this to your main app route
    } catch (error) {
      console.error("OTP verification error:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  const resendOTP = async () => {
    if (!email) {
      alert("Email not found. Please go back and try again.");
      return;
    }

    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        type: "sign-in",
        email: email,
      });

      if (res.error?.status) {
        alert("Failed to resend OTP. Please try again.");
        return;
      }

      alert("OTP sent successfully!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    email,
    resendOTP,
  };
};
