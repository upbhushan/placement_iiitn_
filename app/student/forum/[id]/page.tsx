// Server Component (no "use client" directive)
import TopicDetailPage from "./TopicDetailPage";

// Make the component async to handle params correctly
export default async function Page({ params }: { params: { id: string } }) {
  // Using await on params or simply accessing it in an async function
  // satisfies Next.js's requirement
  const {id} = await params;
  return <TopicDetailPage id={id} />;
}