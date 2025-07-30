import Link from &quot;next/link&quot;;
import { getItems } from &quot;../actions/item-actions&quot;;

// Add export configuration to force dynamic rendering
// This prevents Next.js from attempting to statically generate this page during build
export const dynamic = &quot;force-dynamic&quot;;
export const runtime = &quot;nodejs&quot;;

export default async function ItemsPage() {
  const itemsList = await getItems();

  return (
    <div className=&quot;flex flex-col min-h-screen&quot;>
      <header className=&quot;py-6&quot;>
        <nav className=&quot;flex justify-between items-center&quot;>
          <h1 className=&quot;text-2xl font-bold&quot;>Items Management</h1>
          <div className=&quot;flex space-x-4&quot;>
            <Link href=&quot;/&quot; className=&quot;hover:underline&quot;>
              Home
            </Link>
            <Link href=&quot;/items&quot; className=&quot;hover:underline&quot;>
              Items
            </Link>
            <Link href=&quot;/users&quot; className=&quot;hover:underline&quot;>
              Users
            </Link>
            <Link href=&quot;/docs&quot; className=&quot;hover:underline&quot;>
              Documentation
            </Link>
          </div>
        </nav>
      </header>

      <main className=&quot;flex-grow py-8&quot;>
        <div className=&quot;mb-8 flex justify-between items-center&quot;>
          <h2 className=&quot;text-3xl font-bold&quot;>All Items</h2>
          <Link href=&quot;/items/new&quot; className=&quot;btn btn-primary&quot;>
            Add New Item
          </Link>
        </div>

        {itemsList.length === 0 ? (
          <div className=&quot;text-center py-12&quot;>
            <p className=&quot;text-gray-500 text-xl&quot;>
              No items found. Create your first item!
            </p>
          </div>
        ) : (
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {itemsList.map(
              (item: {
                id: number;
                name: string;
                description: string | null;
                created_at: Date;
              }) => (
                <div key={item.id} className=&quot;card&quot;>
                  <h3 className=&quot;text-xl font-semibold mb-2&quot;>{item.name}</h3>
                  <p className=&quot;text-gray-600 mb-4&quot;>
                    {item.description || null}
                  </p>
                  <div className=&quot;flex justify-between items-center mt-4&quot;>
                    <span className=&quot;text-sm text-gray-500&quot;>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/items/${item.id}`}
                      className=&quot;text-blue-600 hover:underline&quot;
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

      <footer className=&quot;py-8 border-t border-gray-200&quot;>
        <div className=&quot;max-w-6xl mx-auto text-center text-gray-500&quot;>
          <p>
            © {new Date().getFullYear()} Modern Next.js Application. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
