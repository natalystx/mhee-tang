import { authClient } from "@/lib/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const basicDataSchema = z.object({
  englishName: z
    .string()
    .min(2, "English name must be at least 2 characters")
    .max(100, "English name must be less than 100 characters"),
  thaiName: z
    .string()
    .min(2, "Thai name must be at least 2 characters")
    .max(100, "Thai name must be less than 100 characters"),
});

type BasicData = z.infer<typeof basicDataSchema>;

export const useViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BasicData>({
    resolver: zodResolver(basicDataSchema),
    defaultValues: {
      englishName: "",
      thaiName: "",
    },
  });

  const updateUserBasicInfo = async (data: BasicData) => {
    try {
      setIsLoading(true);
      const { data: session } = await authClient.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const result = await authClient.updateUser({
        englishName: data.englishName,
        name: data.thaiName,
      });

      console.log("Update result:", result);
      return result;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    await updateUserBasicInfo(data);
  });

  return {
    form,
    onSubmit,
    isLoading,
    updateUserBasicInfo,
  };
};
