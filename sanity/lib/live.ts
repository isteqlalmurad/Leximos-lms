// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity";
import { client } from "./client";

const token = process.env.SANITY_API_TOKEN || "skbNKB81zOaGQ1IVS6uIgcGsziz21UNylW9eSWlChYADL9RvNBZPHMfijwmf03JEruqsUs3X0DmYXSVFSTOm3OU9SKIUU76TjjntzvLWE4Clq0kcxNPeOoOh0zDK0Fov5YgOjwbGnlXBDGDLDYw7CznuqwybYE1J2s6h0NsJi4O1uDt9atCc";
if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  fetchOptions: {
    revalidate: 0,
  },
});
