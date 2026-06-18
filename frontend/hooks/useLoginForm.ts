"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { getLoginErrorMessage, login } from "@/lib/auth/login";
import { getLoginValues, validateLogin } from "@/lib/validation/login";
import type { LoginField, LoginFieldErrors } from "@/types/auth";

export function useLoginForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = getLoginValues(new FormData(event.currentTarget));
    const validationErrors = validateLogin(values);

    setFieldErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(values);
      router.push("/programs");
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field: LoginField) {
    if (!fieldErrors[field]) {
      return;
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  return {
    clearFieldError,
    fieldErrors,
    formError,
    handleSubmit,
    isSubmitting,
  };
}
