// app/components/public/PublicNavbar.tsx
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Settings } from "lucide-react"; // Assuming you have lucide-react installed

export default function Navbar() {
  // In a real app, cartItemsCount would come from a state management solution or context
  const cartItemsCount = 3; // Placeholder
  const isDevelopment = import.meta.env.DEV;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F6FF]  backdrop-blur-md shadow-sm border-b-4 border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="text-3xl font-bold text-black dark:text-black">
          🥯 Sydney's Sourdough Co.
        </Link>
        <nav className="flex items-center gap-4">
          {isDevelopment && (
            <Link 
              to="/setup-admin"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
              Admin Setup
            </Link>
          )}
          {/* Add other nav links here if needed, e.g., About, Contact */}
          <button
            aria-label="Open cart"
            className="relative p-2 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart className="h-7 w-7 text-black dark:text-black" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}