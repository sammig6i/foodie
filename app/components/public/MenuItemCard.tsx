import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { useState } from "react";

type ProductWithImageUrl = Doc<"products"> & { imageUrl: string | null };

interface MenuItemCardProps {
  product: ProductWithImageUrl;
  batchOptions?: Doc<"batchOptions">[]; 
}

export default function MenuItemCard({
  product,
  batchOptions,
}: MenuItemCardProps) {
  const isBagel = product.category === "bagels";
  // TODO: Implement dynamic pricing based on batch selection
  const [selectedBatchSize, setSelectedBatchSize] = useState<string | undefined>(
    isBagel && batchOptions && batchOptions.length > 0 ? String(batchOptions[0].size) : "1"
  );

  let displayPrice = product.price.toFixed(2);
  if (isBagel && selectedBatchSize && batchOptions) {
    const selectedOption = batchOptions.find(opt => String(opt.size) === selectedBatchSize);
    if (selectedOption) {
      const discountedPricePerBagel = product.price * (1 - selectedOption.discount / 100);
      displayPrice = (discountedPricePerBagel * selectedOption.size).toFixed(2);
    } else if (selectedBatchSize === "1") {
        displayPrice = product.price.toFixed(2);
    }
  }

  return (
    <div className="bg-white border-4 border-black shadow-lg p-4 w-full min-h-[500px] flex flex-col">
      <img
        src={
          product.imageUrl ??
          "https://via.placeholder.com/400x300/cccccc/888888?text=" +
            product.name.replace(/\s/g, "+")
        }
        alt={product.name}
        className="w-full h-64 object-cover border border-gray-200"
      />
      
      <div className="mt-4 text-center space-y-2 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-black" style={{ fontFamily: 'Comic Sans MS, cursive, Roboto, Arial, sans-serif' }}>
          {product.name}
        </h3>
        <p className="text-sm italic text-gray-700" style={{ fontFamily: 'Comic Sans MS, cursive, Roboto, Arial, sans-serif' }}>
          {product.description || "Delicious item."}
        </p>

        {isBagel && batchOptions && batchOptions.length > 0 && (
          <div className="mt-3">
            <label
              htmlFor={`batch-select-${product._id}`}
              className="block text-xs font-medium mb-1 text-black"
              style={{ fontFamily: 'Comic Sans MS, cursive, Roboto, Arial, sans-serif' }}
            >
              Select Batch:
            </label>
            <Select
              defaultValue={selectedBatchSize}
              onValueChange={(value) => setSelectedBatchSize(value)}
            >
              <SelectTrigger
                id={`batch-select-${product._id}`}
                className="w-full rounded-md border-gray-400 bg-white text-black shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm py-2 px-3"
              >
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  Single - ${product.price.toFixed(2)}
                </SelectItem>
                {batchOptions.map((option) => {
                  const batchPrice = (
                    product.price * option.size * (1 - option.discount / 100)
                  ).toFixed(2);
                  return (
                    <SelectItem key={option._id} value={String(option.size)}>
                      {option.name} ({option.size}) - ${batchPrice}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="inline-block bg-black text-white rounded-none px-3 py-1 text-sm font-semibold" style={{ fontFamily: 'Comic Sans MS, cursive, Roboto, Arial, sans-serif' }}>
            {isBagel
              ? selectedBatchSize === "1"
                ? `$${product.price.toFixed(2)}`
                : `$${displayPrice}`
              : `$${product.price.toFixed(2)}`}
          </span>
          <Button
            size="sm"
            className="bg-[#EB3678] hover:bg-black text-white font-semibold py-2 px-3 text-xs sm:text-sm rounded-none"
            onClick={() => console.log("Add to cart:", product.name, selectedBatchSize)}
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}