import { algoliasearch } from "algoliasearch";

// 1️⃣ Initialize Algolia
export const algoliaClient = algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_API_KEY! // use Admin key only on backend
);