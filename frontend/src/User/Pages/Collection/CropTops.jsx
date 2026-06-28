import CollectionCategoryPage from "./CollectionCategoryPage";

export default function CropTops() {
  return (
    <CollectionCategoryPage
      categoryKey="crop top"
      eyebrow="Category"
      title="Crop Tops Collection"
      intro="Browse live crop tops pulled from admin and updated automatically as new products are added."
      emptyTitle="No crop tops available yet"
      emptyBody="Add crop top products in the admin dashboard and they will appear here automatically."
    />
  );
}
