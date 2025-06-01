import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function FloatingProfileButton() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U";
    if (user.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };  return (
    <div className="fixed top-4 right-4 z-50 mobile-safe-area">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-primary/20 touch-manipulation mobile-touch-target">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || user.email} />
              ) : (
                <AvatarFallback className="bg-accent text-text-blue text-xs sm:text-sm">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 sm:w-60 mr-2 sm:mr-0">
          <div className="px-2 py-1.5 text-sm font-medium text-text-blue truncate">
            {user?.name || user?.email}
          </div>
          <div className="px-2 py-1.5 text-xs text-text-blue/60 truncate">
            {user?.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick} className="py-3 touch-manipulation">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 py-3 touch-manipulation">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
