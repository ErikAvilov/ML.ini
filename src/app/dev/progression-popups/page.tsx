import { notFound } from "next/navigation";
import { ProgressionPopupsDevClient } from "./ProgressionPopupsDevClient";

export default function ProgressionPopupsDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <ProgressionPopupsDevClient />;
}
