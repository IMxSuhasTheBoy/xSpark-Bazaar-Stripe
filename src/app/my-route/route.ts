// EXAMPLE API ROUTE BY PAYLOAD

import configPromise from "@payload-config";
import { getPayload } from "payload";

export const GET = async () => {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const data = await payload.find({
      collection: "categories",
      limit: 50, // Add pagination
      depth: 0, // Control relationship depth
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
};
