import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Blouse() {
  return (
    <CollectionCategoryPage
      categoryKey="Tops"
      eyebrow="Category"
      title="Tops Collection"
      intro="When tops are added in admin, they appear here straight from the database."
      emptyTitle="Coming soon"
      emptyBody="Tops items are not available yet. Once they’re created in admin, this page will populate automatically."
    />
  );
}
