// app/routes/(public)/route.tsx
import { Outlet, createFileRoute } from '@tanstack/react-router'
import Navbar from '@/components/public/Navbar'
import React from 'react'

export const Route = createFileRoute('/(public)')({
  component: HomeLayoutComponent,
})

function HomeLayoutComponent() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFD7C4]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The Outlet will render child routes like index.tsx (our homepage) */}
        <Outlet />
      </main>
      <footer className="bg-[#F4F6FF] dark:bg-gray-950 border-t-4 border-black mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <a
            href="#"
            className="text-2xl font-bold  text-black dark:text-black"
          >
            🥯 Sydney's Sourdough Co.
          </a>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
            123 Bagel Street, Foodie City, FC 12345
            <br />
            (123) 456-7890 | order@bagelbliss.com
          </p>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Bagel Bliss. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
