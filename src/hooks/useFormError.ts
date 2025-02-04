import { useState, useCallback } from "react";
import { useError } from "./useError";
import { ZodError } from "zod";
import { AxiosError } from "axios";
import { ErrorSource } from "@/types/errors";

interface FormErrors {
  [key: string]: string[];
}

export function useFormError() {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { handleError } = useError();

  const clearErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  const handleFormError = useCallback(
    (error: unknown) => {
      if (error instanceof ZodError) {
        const errors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        setFormErrors(errors);
        handleError(error, "validation" as ErrorSource);
      } else if (error instanceof AxiosError && error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        handleError(error, "api" as ErrorSource);
      } else {
        handleError(error, "unknown" as ErrorSource);
      }
    },
    [handleError]
  );

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      const errors = formErrors[fieldName];
      return errors?.[0];
    },
    [formErrors]
  );

  return {
    formErrors,
    handleFormError,
    getFieldError,
    clearErrors,
  };
}
