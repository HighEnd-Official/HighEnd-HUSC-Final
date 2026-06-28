import CollectionCategoryPage from "./CollectionCategoryPage";

export default function ShortKurtis() {
  return (
    <CollectionCategoryPage
      categoryKey="short kurti"
      eyebrow="Category"
      title="Short Kurtis Collection"
      intro="Explore short kurtis as they’re published in the admin dashboard, kept in sync with the database."
      emptyTitle="No short kurtis available yet"
      emptyBody="Add short kurti products in the admin dashboard and they will appear here automatically."
    />
  );
}
