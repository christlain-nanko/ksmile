import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory } from "../actions";

export const instant = false;

export default function NewCategoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ksmile-ink">
        Nouvelle catégorie
      </h1>
      <CategoryForm action={createCategory} submitLabel="Créer la catégorie" />
    </div>
  );
}
