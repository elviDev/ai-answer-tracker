"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultEngineSelection, EnginePicker } from "@/features/engines/components/engine-picker";
import { useEngines } from "@/features/engines/hooks";
import type { Engine } from "@/features/engines/schemas";

import { useCreateTracker } from "../hooks";
import { trackerFormSchema, type TrackerFormInput, type TrackerInput } from "../schemas";

const INTERVALS = [
  { value: 60, label: "Every hour" },
  { value: 360, label: "Every 6 hours" },
  { value: 1440, label: "Daily" },
  { value: 10080, label: "Weekly" },
];

export function TrackerForm() {
  const { data: engines, isPending } = useEngines();
  if (isPending || !engines) return <Skeleton className="h-[32rem]" />;
  // Mounted only once engines are known, so default values are computed once.
  return <TrackerFormFields engines={engines} />;
}

function TrackerFormFields({ engines }: { engines: Engine[] }) {
  const create = useCreateTracker();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackerFormInput, unknown, TrackerInput>({
    resolver: zodResolver(trackerFormSchema),
    defaultValues: {
      name: "",
      brand: "",
      aliases: "",
      competitors: "",
      prompt: "",
      engines: defaultEngineSelection(engines),
      interval_minutes: 1440,
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => create.mutate(values))} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" error={errors.name?.message}>
          <Input placeholder="Note apps — Notion" {...register("name")} />
        </FormField>
        <FormField label="Brand or keyword" error={errors.brand?.message}>
          <Input placeholder="Notion" {...register("brand")} />
        </FormField>
        <FormField label="Aliases" hint="Comma separated. Other names that count as the brand." error={errors.aliases?.message}>
          <Input placeholder="Notion.so, Notion AI" {...register("aliases")} />
        </FormField>
        <FormField label="Competitors" hint="Comma separated. Used to rank the brand." error={errors.competitors?.message}>
          <Input placeholder="Obsidian, Coda, Evernote" {...register("competitors")} />
        </FormField>
      </div>

      <FormField label="Question to ask" hint="Phrase it the way a customer would ask an AI assistant." error={errors.prompt?.message}>
        <Textarea placeholder="What is the best note-taking app for startups?" {...register("prompt")} />
      </FormField>

      <FormField label="Engines" error={errors.engines?.message}>
        <Controller
          control={control}
          name="engines"
          render={({ field, fieldState }) => (
            <EnginePicker engines={engines} value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
          )}
        />
      </FormField>

      <FormField label="Schedule" hint="The worker re-asks on this schedule. You can always run it manually." error={errors.interval_minutes?.message} className="sm:max-w-xs">
        <select
          className="h-9 w-full rounded-[3px] border border-line bg-surface px-3 text-sm text-fg hover:border-fg/40 focus:border-fg focus:outline-none"
          {...register("interval_minutes")}
        >
          {INTERVALS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" variant="accent" loading={create.isPending}>
          Create tracker
        </Button>
      </div>
    </form>
  );
}
