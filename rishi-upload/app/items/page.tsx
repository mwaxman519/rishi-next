import Link from "next/link";
import { getItems } from "../actions/item-actions";

// Add export configuration to force dynamic rendering
// This prevents Next.js from attempting to statically generate this page during build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ItemsPage() {
  const itemsList = await getItems();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Items Management</h1>
          <div className="flex space-x-4">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/items" className="hover:underline">
              Items
            </Link>
            <Link href="/users" className="hover:underline">
              Users
            </Link>
            <Link href="/docs" className="hover:underline">
              Documentation
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">All Items</h2>
          <Link href="/items/new" className="btn btn-primary">
            Add New Item
          </Link>
        </div>

        {itemsList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">
              No items found. Create your first item!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsList.map(
              (item: {
                id: number;
                name: string;
                description: string | null;
                created_at: Date;
              }) => (
                <div key={item.id} className="card">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {item.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/items/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>
            © {new Date().getFullYear()} Modern Next.js Application. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
