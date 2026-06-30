import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export interface AuthField {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly minLength?: number;
  readonly autoComplete?: string;
}

export interface AuthFormProps {
  readonly title: string;
  readonly subtitle: string;
  readonly formId: string;
  readonly fields: readonly AuthField[];
  readonly submitLabel: string;
  readonly loadingLabel: string;
  readonly submitId: string;
  readonly onSubmit: (formData: FormData) => void;
  readonly footerLink: {
    readonly text: string;
    readonly linkText: string;
    readonly href: string;
    readonly id: string;
  };
  readonly error: string | null;
  readonly isPending: boolean;
}

export function AuthForm({
  title,
  subtitle,
  formId,
  fields,
  submitLabel,
  loadingLabel,
  submitId,
  onSubmit,
  footerLink,
  error,
  isPending,
}: AuthFormProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <form action={onSubmit} id={formId} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              autoComplete={field.autoComplete}
              disabled={isPending}
            />
          </div>
        ))}

        {error !== null && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          id={submitId}
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoadingSpinner className="mr-2" />
              {loadingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {footerLink.text}{" "}
        <Link
          href={footerLink.href}
          id={footerLink.id}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {footerLink.linkText}
        </Link>
      </p>
    </>
  );
}
