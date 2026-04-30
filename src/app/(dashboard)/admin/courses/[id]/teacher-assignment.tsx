"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTeacherAction, unassignTeacherAction } from "./actions";

export type AssignedTeacher = {
  teacher_id: string;
  role: "main" | "assistant";
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export type AvailableTeacher = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export function TeacherAssignment({
  courseId,
  assigned,
  available,
}: {
  courseId: string;
  assigned: AssignedTeacher[];
  available: AvailableTeacher[];
}) {
  const main = assigned.find((t) => t.role === "main") ?? null;
  const assistants = assigned.filter((t) => t.role === "assistant");
  const hasMain = Boolean(main);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Main teacher
        </div>
        {main ? (
          <TeacherRow courseId={courseId} teacher={main} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No main teacher assigned yet.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Assistants ({assistants.length})
        </div>
        {assistants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assistant teachers.
          </p>
        ) : (
          <div className="space-y-2">
            {assistants.map((t) => (
              <TeacherRow
                key={t.teacher_id}
                courseId={courseId}
                teacher={t}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2 border-t pt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Assign teacher
        </div>
        <AssignForm
          courseId={courseId}
          available={available}
          hasMain={hasMain}
        />
      </section>
    </div>
  );
}

function TeacherRow({
  courseId,
  teacher,
}: {
  courseId: string;
  teacher: AssignedTeacher;
}) {
  const [pending, startUnassign] = useTransition();

  function handleUnassign() {
    const fd = new FormData();
    fd.append("course_id", courseId);
    fd.append("teacher_id", teacher.teacher_id);
    startUnassign(async () => {
      await unassignTeacherAction(fd);
      toast.success(
        teacher.role === "main"
          ? "Main teacher removed."
          : "Assistant removed.",
      );
    });
  }

  const initials = (teacher.full_name ?? teacher.email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Avatar className="size-9">
        {teacher.avatar_url && (
          <AvatarImage src={teacher.avatar_url} alt={teacher.email} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium leading-tight">
          {teacher.full_name ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground">{teacher.email}</p>
      </div>
      <Badge variant={teacher.role === "main" ? "default" : "secondary"}>
        {teacher.role}
      </Badge>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={pending}
        onClick={handleUnassign}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

function AssignForm({
  courseId,
  available,
  hasMain,
}: {
  courseId: string;
  available: AvailableTeacher[];
  hasMain: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    assignTeacherAction,
    undefined,
  );
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All teachers are already assigned to this course.
      </p>
    );
  }

  // If a main teacher exists, default new assignments to "assistant".
  const defaultRole = hasMain ? "assistant" : "main";

  return (
    <form
      action={formAction}
      className="grid gap-2 sm:grid-cols-[1fr_160px_auto]"
      key={state?.success}
    >
      <input type="hidden" name="course_id" value={courseId} />

      <Select name="teacher_id" required>
        <SelectTrigger>
          <SelectValue placeholder="Select a teacher..." />
        </SelectTrigger>
        <SelectContent>
          {available.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex flex-col">
                <span>{t.full_name ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{t.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select name="role" defaultValue={defaultRole} required>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">Main</SelectItem>
          <SelectItem value="assistant">Assistant</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" size="sm" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Assigning..." : "Assign"}
      </Button>
    </form>
  );
}
