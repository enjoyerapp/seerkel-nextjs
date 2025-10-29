import { algoliaClient } from "@/algoliaClient";

export async function GET() {
    const { hits: hitsSearch } = await algoliaClient.searchSingleIndex({
        indexName: "prod_SEARCH_SUGGESTIONS",
        searchParams: {
            hitsPerPage: 5,
        }
    })
    
    const { hits: hitsHashtags } = await algoliaClient.searchSingleIndex({
        indexName: "prod_HASHTAGS",
        searchParams: {
            hitsPerPage: 5,
        }
    })

    const searches = hitsSearch.map((e) => (e as unknown as { query: String }).query).filter((e) => e != "")
    console.log(hitsHashtags);
    
    // const hashtags = hitsHashtags.map((e) => (e as unknown as { query: String }).query).filter((e) => e != "")

    return Response.json({ searches: searches });
}
