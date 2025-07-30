&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Building,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
} from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;../../components/ui/dropdown-menu&quot;;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;../../components/ui/table&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;

// Mock data for client accounts

export default function ClientAccountsPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const { checkPermission } = useAuthorization();

  // Filter clients based on search query
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/client-accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching client accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const filteredClients = accounts.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.tier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case &quot;active&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            Active
          </Badge>
        );
      case &quot;inactive&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-gray-50 text-gray-700 border-gray-200&quot;
          >
            Inactive
          </Badge>
        );
      case &quot;pending&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  // Function to get tier badge color
  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case &quot;tier 1&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-blue-50 text-blue-700 border-blue-200&quot;
          >
            Tier 1
          </Badge>
        );
      case &quot;tier 2&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-purple-50 text-purple-700 border-purple-200&quot;
          >
            Tier 2
          </Badge>
        );
      case &quot;tier 3&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-teal-50 text-teal-700 border-teal-200&quot;
          >
            Tier 3
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{tier}</Badge>;
    }
  };

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
            Client Accounts
          </h1>
          <p className=&quot;mt-1 text-gray-600 dark:text-gray-400&quot;>
            Manage client organizations and their settings
          </p>
        </div>

        <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
            <Input
              type=&quot;search&quot;
              placeholder=&quot;Search clients...&quot;
              className=&quot;pl-8 w-full sm:w-[250px]&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className=&quot;flex items-center gap-1&quot;
            disabled={!checkPermission(&quot;create:client-accounts&quot;)}
          >
            <Plus className=&quot;h-4 w-4&quot; /> Add Client
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className=&quot;p-0&quot;>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=&quot;w-[300px]&quot;>Client Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className=&quot;text-right&quot;>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className=&quot;font-medium&quot;>
                      <div className=&quot;flex items-center&quot;>
                        <div className=&quot;flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3&quot;>
                          <Building className=&quot;h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>{client.type}</TableCell>
                    <TableCell>{getTierBadge(client.tier)}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{client.dateCreated}</TableCell>
                    <TableCell className=&quot;text-right&quot;>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                            <MoreVertical className=&quot;h-4 w-4&quot; />
                            <span className=&quot;sr-only&quot;>Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=&quot;end&quot;>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;edit:client-accounts&quot;)}
                          >
                            <Edit className=&quot;h-4 w-4 mr-2&quot; /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={
                              !checkPermission(&quot;manage:client-settings&quot;)
                            }
                          >
                            <Settings className=&quot;h-4 w-4 mr-2&quot; /> Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className=&quot;cursor-pointer text-red-600&quot;
                            disabled={
                              !checkPermission(&quot;delete:client-accounts&quot;)
                            }
                          >
                            <Trash2 className=&quot;h-4 w-4 mr-2&quot; /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className=&quot;text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No client accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
