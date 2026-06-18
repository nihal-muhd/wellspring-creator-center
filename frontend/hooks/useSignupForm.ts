"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createWorkspace,
  getSignupErrorMessage,
} from "@/lib/auth/signup";
import type {
  SignupField,
  SignupFieldErrors,
} from "@/types/auth";
import {
  getSignupValues,
  validateSignup,
} from "@/lib/validation/signup";

export function useSignupForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = getSignupValues(new FormData(event.currentTarget));
    const validationErrors = validateSignup(values);

    setFieldErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createWorkspace(values);
      router.push("/programs");
    } catch (error) {
      setFormError(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field: SignupField) {
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
