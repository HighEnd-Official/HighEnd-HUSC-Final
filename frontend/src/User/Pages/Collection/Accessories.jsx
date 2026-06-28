import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Accessories() {
  return (
    <CollectionCategoryPage
      categoryKey="Accessories"
      eyebrow="Category"
      title="Accessories Collection"
      intro="Accessories added in admin appear here instantly, keeping the storefront and backend in sync."
      emptyTitle="No accessories available yet"
      emptyBody="Add accessories in the admin dashboard and they will appear here automatically."
    />
  );
}
