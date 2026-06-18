"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type { ProgramFormValues, ProgramSummary } from "@/types/program";

type ProgramFormModalProps = {
  mode: "add" | "edit";
  program?: ProgramSummary;
  onClose: () => void;
  onSave: (values: ProgramFormValues) => void;
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 10 * 1024 * 1024;

export function ProgramFormModal({
  mode,
  program,
  onClose,
  onSave,
}: ProgramFormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const titleErrorId = useId();
  const imageErrorId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(program?.title ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    program?.coverImageUrl ?? "",
  );
  const [titleError, setTitleError] = useState("");
  const [imageError, setImageError] = useState("");

  const isEditMode = mode === "edit";
  const modalTitle = isEditMode ? "Edit Program Details" : "Add New Program";
  const submitLabel = isEditMode ? "Save Changes" : "Create Program";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      setImageError("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageSize) {
      setImageError("Choose an image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setCoverImageUrl(reader.result);
        setImageError("");
      }
    });
    reader.addEventListener("error", () => {
      setImageError("We could not preview that image. Please try another.");
    });
    reader.readAsDataURL(file);
  }

  function removeImage(): void {
    setCoverImageUrl("");
    setImageError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setTitleError("Program title is required.");
      titleInputRef.current?.focus();
      return;
    }

    onSave({
      title: normalizedTitle,
      description: description.trim(),
      coverImageUrl: coverImageUrl || undefined,
    });
  }

  return (
    <div
      aria-labelledby="program-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/35 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close program modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <section
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
        ref={modalRef}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2
            className="text-headline-md text-primary"
            id="program-modal-title"
          >
            {modalTitle}
          </h2>
          <button
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label
                className="text-label-sm uppercase tracking-wide text-muted-foreground"
                htmlFor={titleId}
              >
                Title
              </label>
              <input
                aria-describedby={titleError ? titleErrorId : undefined}
                aria-invalid={Boolean(titleError)}
                className="mt-2 w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-body-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error-container"
                id={titleId}
                maxLength={120}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (titleError) {
                    setTitleError("");
                  }
                }}
                placeholder="e.g. 30-Day Sleep Reset"
                ref={titleInputRef}
                value={title}
              />
              {titleError ? (
                <p
                  className="mt-1 text-label-sm text-error"
                  id={titleErrorId}
                >
                  {titleError}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="text-label-sm uppercase tracking-wide text-muted-foreground"
                htmlFor={descriptionId}
              >
                Description
              </label>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-md border border-transparent bg-muted px-4 py-3 text-body-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
                id={descriptionId}
                maxLength={500}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the purpose and experience of this program."
                value={description}
              />
            </div>

            <fieldset>
              <legend className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Program photo
              </legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {coverImageUrl ? (
                  <div className="relative aspect-square w-32 overflow-hidden rounded-md border border-border bg-surface-container">
                    <Image
                      alt="Selected program cover preview"
                      className="object-cover"
                      fill
                      sizes="128px"
                      src={coverImageUrl}
                      unoptimized={coverImageUrl.startsWith("data:")}
                    />
                    <button
                      aria-label="Remove selected photo"
                      className="absolute right-1.5 top-1.5 rounded-full bg-inverse-surface/75 p-1 text-inverse-on-surface transition-colors hover:bg-inverse-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                      onClick={removeImage}
                      type="button"
                    >
                      <X aria-hidden="true" size={14} />
                    </button>
                  </div>
                ) : null}

                <label className="flex aspect-square w-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-outline-variant bg-card text-center text-muted-foreground transition-colors hover:border-primary hover:bg-muted hover:text-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                  {coverImageUrl ? (
                    <ImagePlus aria-hidden="true" size={24} strokeWidth={1.5} />
                  ) : (
                    <Camera aria-hidden="true" size={24} strokeWidth={1.5} />
                  )}
                  <span className="mt-2 text-label-sm">
                    {coverImageUrl ? "Change photo" : "Add photo"}
                  </span>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    aria-describedby={imageError ? imageErrorId : undefined}
                    className="sr-only"
                    onChange={handleImageChange}
                    type="file"
                  />
                </label>
              </div>
              <p className="mt-2 text-label-sm text-muted-foreground">
                JPEG, PNG, or WebP. Maximum 10 MB.
              </p>
              {imageError ? (
                <p className="mt-1 text-label-sm text-error" id={imageErrorId}>
                  {imageError}
                </p>
              ) : null}
            </fieldset>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted px-6 py-4">
            <button
              className="rounded-md px-4 py-2.5 text-label-md font-medium text-foreground transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              type="submit"
            >
              {submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
