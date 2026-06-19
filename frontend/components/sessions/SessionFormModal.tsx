"use client";

import {
  AudioLines,
  Film,
  FileUp,
  Play,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type {
  SessionFormValues,
  SessionMediaType,
  SessionSummary,
} from "@/types/session";

type SessionFormModalProps = {
  error?: string;
  isSubmitting?: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSave: (values: SessionFormValues) => Promise<void>;
  session?: SessionSummary;
};

const maxMediaSize = 100 * 1024 * 1024;

function minutesToHours(minutes?: number): string {
  if (!minutes) {
    return "";
  }

  return String(Number((minutes / 60).toFixed(2)));
}

export function SessionFormModal({
  error = "",
  isSubmitting = false,
  mode,
  onClose,
  onSave,
  session,
}: SessionFormModalProps) {
  const titleId = useId();
  const durationId = useId();
  const instructorId = useId();
  const tagsId = useId();
  const titleErrorId = useId();
  const durationErrorId = useId();
  const mediaErrorId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(session?.title ?? "");
  const [durationHours, setDurationHours] = useState(
    minutesToHours(session?.duration),
  );
  const [instructorName, setInstructorName] = useState(
    session?.instructorName ?? "",
  );
  const [tags, setTags] = useState(session?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [mediaType, setMediaType] = useState<SessionMediaType | undefined>(
    session?.mediaType,
  );
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(
    session?.mediaUrl ?? "",
  );
  const [selectedFileName, setSelectedFileName] = useState("");
  const [mediaFile, setMediaFile] = useState<File>();
  const [removePersistedMedia, setRemovePersistedMedia] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [mediaError, setMediaError] = useState("");

  const isEditMode = mode === "edit";
  const modalTitle = isEditMode ? "Edit Session" : "Add Session";
  const submitLabel = isEditMode ? "Save Changes" : "Create Session";

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
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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

  useEffect(
    () => () => {
      if (mediaPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    },
    [mediaPreviewUrl],
  );

  function addTag(): void {
    const normalizedTag = tagInput.trim().replace(/,$/, "");

    if (
      !normalizedTag ||
      tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase()) ||
      tags.length >= 10
    ) {
      setTagInput("");
      return;
    }

    setTags((currentTags) => [...currentTags, normalizedTag]);
    setTagInput("");
  }

  function handleTagKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  }

  function handleMediaChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextMediaType = file.type.startsWith("audio/")
      ? "AUDIO"
      : file.type.startsWith("video/")
        ? "VIDEO"
        : undefined;

    if (!nextMediaType) {
      setMediaError("Choose an audio or video file.");
      event.target.value = "";
      return;
    }

    if (file.size > maxMediaSize) {
      setMediaError("Choose a media file smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    if (mediaPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    setMediaPreviewUrl(URL.createObjectURL(file));
    setSelectedFileName(file.name);
    setMediaFile(file);
    setMediaType(nextMediaType);
    setRemovePersistedMedia(false);
    setMediaError("");
  }

  function removeMedia(): void {
    if (mediaPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    setMediaPreviewUrl("");
    setSelectedFileName("");
    setMediaFile(undefined);
    setMediaType(undefined);
    setRemovePersistedMedia(Boolean(session?.mediaUrl || session?.mediaKey));
    setMediaError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const parsedHours = Number(durationHours);
    const durationMinutes = Math.round(parsedHours * 60);
    let hasError = false;

    if (!normalizedTitle) {
      setTitleError("Session title is required.");
      hasError = true;
    }

    if (
      !durationHours ||
      !Number.isFinite(parsedHours) ||
      parsedHours <= 0 ||
      durationMinutes > 1440
    ) {
      setDurationError("Enter a duration between 0 and 24 hours.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    await onSave({
      title: normalizedTitle,
      duration: Math.max(1, durationMinutes),
      instructorName: instructorName.trim(),
      tags,
      mediaType,
      mediaFile,
      removePersistedMedia,
    });
  }

  const MediaIcon = mediaType === "AUDIO" ? AudioLines : Film;

  return (
    <div
      aria-labelledby="session-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/35 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close session modal"
        className="absolute inset-0 cursor-default"
        disabled={isSubmitting}
        onClick={onClose}
        type="button"
      />

      <section
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
        ref={modalRef}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <MediaIcon
              aria-hidden="true"
              className="text-primary"
              size={20}
              strokeWidth={1.75}
            />
            <h2 className="text-headline-md text-primary" id="session-modal-title">
              {modalTitle}
            </h2>
          </div>
          <button
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error ? (
              <p
                className="rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div>
              <label
                className="text-label-sm uppercase tracking-wide text-muted-foreground"
                htmlFor={titleId}
              >
                Session title
              </label>
              <input
                aria-describedby={titleError ? titleErrorId : undefined}
                aria-invalid={Boolean(titleError)}
                className="mt-2 w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-body-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error-container"
                id={titleId}
                maxLength={160}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleError("");
                }}
                placeholder="e.g. Circadian Basics & Morning Sun"
                ref={titleInputRef}
                value={title}
              />
              {titleError ? (
                <p className="mt-1 text-label-sm text-error" id={titleErrorId}>
                  {titleError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  className="text-label-sm uppercase tracking-wide text-muted-foreground"
                  htmlFor={durationId}
                >
                  Duration (hours)
                </label>
                <div className="relative mt-2">
                  <input
                    aria-describedby={
                      durationError ? durationErrorId : undefined
                    }
                    aria-invalid={Boolean(durationError)}
                    className="w-full rounded-md border border-transparent bg-muted px-4 py-2.5 pr-16 text-body-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error-container"
                    id={durationId}
                    inputMode="decimal"
                    max="24"
                    min="0.01"
                    onChange={(event) => {
                      setDurationHours(event.target.value);
                      setDurationError("");
                    }}
                    placeholder="0.5"
                    step="0.01"
                    type="number"
                    value={durationHours}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-muted-foreground">
                    Hrs
                  </span>
                </div>
                {durationError ? (
                  <p
                    className="mt-1 text-label-sm text-error"
                    id={durationErrorId}
                  >
                    {durationError}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="text-label-sm uppercase tracking-wide text-muted-foreground"
                  htmlFor={instructorId}
                >
                  Instructor
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-body-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
                  id={instructorId}
                  maxLength={120}
                  onChange={(event) => setInstructorName(event.target.value)}
                  placeholder="e.g. Dr. Sarah Chen"
                  value={instructorName}
                />
              </div>
            </div>

            <div>
              <label
                className="text-label-sm uppercase tracking-wide text-muted-foreground"
                htmlFor={tagsId}
              >
                Tags
              </label>
              <div className="mt-2 rounded-md border border-transparent bg-muted px-3 py-2 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary-fixed">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-label-sm text-on-secondary-container"
                      key={tag}
                    >
                      {tag}
                      <button
                        aria-label={`Remove ${tag} tag`}
                        className="rounded-full p-0.5 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary"
                        disabled={isSubmitting}
                        onClick={() =>
                          setTags((currentTags) =>
                            currentTags.filter((item) => item !== tag),
                          )
                        }
                        type="button"
                      >
                        <X aria-hidden="true" size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="min-w-32 flex-1 bg-transparent py-1 text-label-md text-foreground outline-none placeholder:text-outline"
                    id={tagsId}
                    maxLength={40}
                    onBlur={addTag}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={
                      tags.length === 0 ? "Type a tag and press Enter" : "Add tag"
                    }
                    value={tagInput}
                  />
                </div>
              </div>
              <p className="mt-1 text-label-sm text-muted-foreground">
                Add up to 10 tags using Enter or comma.
              </p>
            </div>

            <fieldset>
              <legend className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Session media
              </legend>
              {mediaPreviewUrl ? (
                <div className="mt-2 overflow-hidden rounded-md border border-border bg-surface-container">
                  <div className="relative flex min-h-48 items-center justify-center bg-inverse-surface/10">
                    {mediaType === "VIDEO" ? (
                      <video
                        className="max-h-72 w-full object-cover"
                        controls
                        src={mediaPreviewUrl}
                      />
                    ) : mediaType === "AUDIO" ? (
                      <div className="flex w-full flex-col items-center gap-4 p-6 text-primary">
                        <AudioLines aria-hidden="true" size={40} strokeWidth={1.5} />
                        <audio className="w-full" controls src={mediaPreviewUrl} />
                      </div>
                    ) : (
                      <Play
                        aria-hidden="true"
                        className="text-primary"
                        size={38}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 border-t border-border bg-card p-3 sm:flex-row">
                    <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-label-sm text-primary hover:bg-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                      <FileUp aria-hidden="true" size={16} />
                      Change File
                      <input
                        accept="audio/*,video/*"
                        className="sr-only"
                        disabled={isSubmitting}
                        onChange={handleMediaChange}
                        type="file"
                      />
                    </label>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-error-container px-4 py-2 text-label-sm text-error hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                      disabled={isSubmitting}
                      onClick={removeMedia}
                      type="button"
                    >
                      <X aria-hidden="true" size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="mt-2 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-outline-variant bg-card px-6 text-center text-muted-foreground hover:border-primary hover:bg-muted hover:text-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                  <FileUp aria-hidden="true" size={28} strokeWidth={1.5} />
                  <span className="mt-2 text-label-md font-semibold">
                    Choose audio or video
                  </span>
                  <span className="mt-1 text-label-sm">
                    Audio or video, up to 100 MB.
                  </span>
                  <input
                    accept="audio/*,video/*"
                    aria-describedby={mediaError ? mediaErrorId : undefined}
                    className="sr-only"
                    disabled={isSubmitting}
                    onChange={handleMediaChange}
                    type="file"
                  />
                </label>
              )}
              {selectedFileName ? (
                <p className="mt-2 text-label-sm text-muted-foreground">
                  Selected: {selectedFileName}
                </p>
              ) : null}
              {mediaError ? (
                <p className="mt-1 text-label-sm text-error" id={mediaErrorId}>
                  {mediaError}
                </p>
              ) : null}
            </fieldset>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted px-6 py-4">
            <button
              className="rounded-md px-4 py-2.5 text-label-md font-medium text-foreground transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
