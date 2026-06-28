import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Shirt() {
  return (
    <CollectionCategoryPage
      categoryKey="Shirts"
      eyebrow="Category"
      title="Shirts Collection"
      intro="These shirts are loaded directly from the database, so new inventory shows up here without code changes."
      emptyTitle="No shirts available yet"
      emptyBody="Add shirt products in the admin dashboard and they will appear here automatically."
    />
  );
}
