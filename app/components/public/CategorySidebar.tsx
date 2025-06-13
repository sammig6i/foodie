import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-full md:w-56 space-y-0 md:pr-4 mb-8 md:mb-0">
      <h2 className="text-2xl font-bold text-black mb-6 hidden md:block">
        Categories
      </h2>
      <div className="flex md:flex-col gap-0 overflow-x-auto md:overflow-x-visible">
        {categories.map((category, index) => (
          <div
            key={category}
            className="relative"
          >
            {selectedCategory === category }
            <Button
              variant="ghost"
              onClick={() => onSelectCategory(category)}
              className={`w-full justify-start capitalize hover:text-black text-left whitespace-nowrap md:whitespace-normal rounded-sm py-4 px-4 text-base font-medium border-none ${
                selectedCategory === category
                  ? "text-white bg-[#EB3678] hover:bg-[#EB3678] hover:text-white"
                  : "text-black hover:bg-transparent "
              }`}
            >
              {category}
            </Button>
          </div>
        ))}
      </div>
    </aside>
  );
}