import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ErrorAlert({ error }) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="break-words">{String(error)}</AlertDescription>
    </Alert>
  );
}