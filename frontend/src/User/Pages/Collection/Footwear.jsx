import CollectionCategoryPage from "./CollectionCategoryPage";

export default function Footwear() {
  return (
    <CollectionCategoryPage
      categoryKey="Footwear"
      eyebrow="Category"
      title="Footwear Collection"
      intro="Footwear products, including flats and Indian juttis, are organized here from the live catalog."
      emptyTitle="No footwear available yet"
      emptyBody="Add footwear products in the admin dashboard and they will appear here automatically."
    />
  );
}
