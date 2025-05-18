import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user?: {
    name?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <div className="flex bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-white">Campus Placement Dashboard</h1>
          <div className="flex items-center gap-4">
            {user?.name && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-indigo-800 text-white">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}