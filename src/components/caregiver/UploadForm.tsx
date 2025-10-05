"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UploadFormProps = {
  patientId: string | null;
  patientDisplayName?: string | null;
  onUploaded?: () => void;
};

type UploadedMemory = {
  id: string;
  imageUrl: string;
};

export default function UploadForm({
  patientId,
  patientDisplayName,
  onUploaded,
}: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [personName, setPerson] = useState("");
  const [eventName, setEvent] = useState("");
  const [placeName, setPlace] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [memory, setMemory] = useState<UploadedMemory | null>(null);
  const [captionStatus, setCaptionStatus] = useState<"idle" | "loading" | "ready" | "saving" | "saved" | "error">("idle");
  const [aiCaption, setAiCaption] = useState("");
  const [aiTags, setAiTags] = useState("");

  useEffect(() => {
    setMemory(null);
    setCaptionStatus("idle");
    setAiCaption("");
    setAiTags("");
  }, [patientId]);

  const canSubmit = Boolean(patientId && file && !submitting);

  const resetForm = () => {
    setTitle("");
    setPerson("");
    setEvent("");
    setPlace("");
    setDateLabel("");
    setFile(null);
  };

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!patientId) {
      setError("Select a patient before uploading.");
      return;
    }
    if (!file) {
      setError("Choose a photo to upload.");
      return;
    }

    const nameForTitle =
      title.trim() || personName.trim() || eventName.trim() || "Memory";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);
    formData.append("title", nameForTitle);
    if (personName.trim()) formData.append("personName", personName.trim());
    if (eventName.trim()) formData.append("eventName", eventName.trim());
    if (placeName.trim()) formData.append("placeName", placeName.trim());
    if (dateLabel.trim()) formData.append("dateLabel", dateLabel.trim());

    try {
      setSubmitting(true);
      setError(null);
      setCaptionStatus("idle");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Upload failed");
      }
      const payload = await res.json();
      const uploaded: UploadedMemory | undefined = payload?.memory;
      if (!uploaded?.id) {
        throw new Error("Upload response missing memory id");
      }
      setMemory(uploaded);
      resetForm();
      onUploaded?.();

      setCaptionStatus("loading");
      const captionRes = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId: uploaded.id, imageUrl: uploaded.imageUrl }),
      });
      if (!captionRes.ok) {
        const details = await captionRes.json().catch(() => null);
        throw new Error(details?.error || "Caption service failed");
      }
      const { caption = "", tags = "" } = (await captionRes.json()) as {
        caption?: string;
        tags?: string;
      };
      setAiCaption(caption);
      setAiTags(tags);
      setCaptionStatus("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setCaptionStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAcceptSuggestions() {
    if (!memory) return;
    try {
      setCaptionStatus("saving");
      const res = await fetch(`/api/memories/${memory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captionAI: aiCaption,
          tagsAI: aiTags,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Unable to save suggestions");
      }
      setCaptionStatus("saved");
      onUploaded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save suggestions";
      setError(message);
      setCaptionStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <form className="grid gap-4" onSubmit={handleUpload}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="memory-photo">Photo</Label>
            <Input
              id="memory-photo"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {!patientId && (
              <p className="text-xs text-muted-foreground">
                Select or add a patient above to enable uploads.
              </p>
            )}
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="memory-title">Title</Label>
              <Input
                id="memory-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Anna's big day"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="memory-person">Person</Label>
              <Input
                id="memory-person"
                value={personName}
                onChange={(event) => setPerson(event.target.value)}
                placeholder="Anna"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="memory-event">Event</Label>
            <Input
              id="memory-event"
              value={eventName}
              onChange={(event) => setEvent(event.target.value)}
              placeholder="Wedding"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memory-place">Place</Label>
            <Input
              id="memory-place"
              value={placeName}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="Chicago"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memory-date">Date</Label>
            <Input
              id="memory-date"
              value={dateLabel}
              onChange={(event) => setDateLabel(event.target.value)}
              placeholder="Summer 1994"
            />
          </div>
        </div>

        <Button type="submit" disabled={!canSubmit}>
          {submitting
            ? "Uploading…"
            : `Save memory${patientDisplayName ? ` for ${patientDisplayName}` : ""}`}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {captionStatus !== "idle" && captionStatus !== "error" && (
        <div className="mt-6 grid gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="font-medium">AI suggestions</div>
          {captionStatus === "loading" && (
            <p className="text-sm text-muted-foreground">
              Generating caption and tags…
            </p>
          )}
          {(captionStatus === "ready" || captionStatus === "saving" || captionStatus === "saved") && (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor="memory-caption">Caption</Label>
                <Textarea
                  id="memory-caption"
                  value={aiCaption}
                  onChange={(event) => setAiCaption(event.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="memory-tags">Tags</Label>
                <Input
                  id="memory-tags"
                  value={aiTags}
                  onChange={(event) => setAiTags(event.target.value)}
                  placeholder="family, summer, beach"
                />
                <p className="text-xs text-muted-foreground">
                  Edit tags as comma-separated keywords.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleAcceptSuggestions}
                  disabled={captionStatus === "saving"}
                >
                  {captionStatus === "saving" ? "Saving…" : captionStatus === "saved" ? "Saved" : "Accept suggestions"}
                </Button>
                {captionStatus === "saved" && (
                  <span className="text-xs text-muted-foreground">
                    Suggestions saved to this memory.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
