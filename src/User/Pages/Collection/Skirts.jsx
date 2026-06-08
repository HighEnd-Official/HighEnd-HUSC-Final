import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Skirts() {
  return (
    <CollectionCategoryPage
      categoryKey="Skirts"
      eyebrow="Category"
      title="Skirts Collection"
      intro="Skirts from the database show up here instantly, so the page always reflects current stock."
      emptyTitle="No skirts available yet"
      emptyBody="Add skirt products in the admin dashboard and they will appear here automatically."
    />
  );
}
