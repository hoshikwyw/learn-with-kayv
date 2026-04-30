"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLessonForm } from "./create-lesson-form";
import { LessonRow, type Lesson } from "./lesson-row";

export function LessonsSection({
  courseId,
  lessons,
  canEdit,
}: {
  courseId: string;
  lessons: Lesson[];
  canEdit: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {lessons.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No lessons yet.
          {canEdit && " Click \"Add lesson\" to create the first one."}
        </p>
      )}

      {lessons.map((lesson, idx) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          index={idx}
          isFirst={idx === 0}
          isLast={idx === lessons.length - 1}
          canEdit={canEdit}
        />
      ))}

      {canEdit && (
        adding ? (
          <CreateLessonForm
            courseId={courseId}
            onDone={() => setAdding(false)}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" />
            Add lesson
          </Button>
        )
      )}
    </div>
  );
}
