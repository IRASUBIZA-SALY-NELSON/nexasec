import * as Sentry from "@sentry/nextjs";

interface ErrorContext {
  component?: string;
  action?: string;
  [key: string]: any;
}

export const captureError = (error: unknown, context: ErrorContext = {}) => {
  console.error("Error captured:", error, context);
  
  // Capture the error with Sentry
  if (error instanceof Error) {
    Sentry.captureException(error, { 
      extra: context
    });
  } else {
    Sentry.captureMessage(`Non-Error exception captured: ${String(error)}`, {
      level: "error",
      extra: context
    });
  }
  
  // You could also add additional error handling logic here
  // such as showing a toast notification
}; 