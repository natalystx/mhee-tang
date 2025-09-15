import { google } from "@ai-sdk/google";
import { env } from "~/env";

type BASE_CONFIG_TYPE = {
  model: ReturnType<typeof google>;
  temperature: number;
  providerOptions: {
    google: {
      thinkingConfig: {
        thinkingBudget: number;
        includeThoughts: boolean;
      };
    };
  };
};

export const AI_CONFIG: BASE_CONFIG_TYPE = {
  model: google(env.GEMINI_MODEL),
  temperature: 0.5,
  providerOptions: {
    google: {
      thinkingConfig: {
        thinkingBudget: 512,
        includeThoughts: true,
      },
    },
  },
};
