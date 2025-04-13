// Create a new file at sanity/lib/client-only.ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const clientOnlyClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // No need for stega or token in client-only
});