"use client";

import { FormEvent, useState } from "react";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label
          htmlFor="workspaceName"
          className="block text-label-md text-foreground"
        >
          Workspace name
        </label>
        <input
          id="workspaceName"
          name="workspaceName"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Lumina Wellness"
          required
          className="w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed sm:py-3 sm:text-body-md"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="block text-label-md text-foreground"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sarah Chen"
          required
          className="w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed sm:py-3 sm:text-body-md"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-label-md text-foreground"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. sarah@creator.com"
          required
          className="w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed sm:py-3 sm:text-body-md"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-label-md text-foreground"
          >
            Password
          </label>
          <span className="text-label-sm font-medium text-muted-foreground">
            At least 8 characters
          </span>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            placeholder="Create a secure password"
            required
            className="w-full rounded-md border border-transparent bg-muted px-4 py-2.5 pr-20 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed sm:py-3 sm:text-body-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword((isVisible) => !isVisible)}
            className="absolute inset-y-0 right-3 my-auto h-fit rounded-sm px-2 py-1 text-label-sm font-semibold text-primary hover:bg-primary-fixed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-controls="password"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 w-full rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:py-3"
      >
        Create workspace
      </button>
    </form>
  );
}
