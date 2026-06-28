import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Pants() {
  return (
    <CollectionCategoryPage
      categoryKey="Pants"
      eyebrow="Category"
      title="Pants Collection"
      intro="Browse trousers and pants from the live catalog without any hardcoded placeholders."
      emptyTitle="No pants available yet"
      emptyBody="Add trouser products in the admin dashboard and they will appear here automatically."
    />
  );
}
