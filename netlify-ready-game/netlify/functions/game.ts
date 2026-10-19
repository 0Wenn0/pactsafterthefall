import { getStore } from "@netlify/blobs";
import { createGameHandler } from "../../game-api.mjs";

export default async (request: Request) => {
  const url = new URL(request.url);
  const isPublicCatalog = request.method === "GET" && url.searchParams.get("catalog") === "1";
  const rooms = isPublicCatalog ? undefined : getStore({ name: "pacts-after-the-fall-rooms", consistency: "strong" });
  return createGameHandler(rooms)(request);
};
