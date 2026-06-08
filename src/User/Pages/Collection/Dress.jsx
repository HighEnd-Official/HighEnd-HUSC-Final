import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Dress() {
  return (
    <CollectionCategoryPage
      categoryKey="Dresses"
      eyebrow="Category"
      title="Dresses Collection"
      intro="Live dress products are pulled from the database, so the collection always stays in sync with admin updates."
      emptyTitle="No dresses available yet"
      emptyBody="Add dress products in the admin dashboard and they will appear here automatically."
    />
  );
}
