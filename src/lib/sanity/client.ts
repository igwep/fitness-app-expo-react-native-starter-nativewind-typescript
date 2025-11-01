import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0rrv9glg",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  // Always false unless explicitly set to "true"
  useCdn: process.env.NEXT_PUBLIC_SANITY_USE_CDN === "true" ? true : false,
};

export const client = createClient(config);

//admin level client , use for backend
// admin client for mutations
export const adminClient = createClient({
  ...config,
  token: process.env.SANITY_API_TOKEN, // only works on server side
  useCdn: false,
});
  
const builder = imageUrlBuilder(client);
export const urlFor = (source: string) => builder.image(source);
