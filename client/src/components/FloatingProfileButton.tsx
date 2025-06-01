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
          <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur-md hover:bg-card shadow-lg hover:shadow-xl transition-all duration-500 ease-out transform hover:scale-105 flex items-center justify-center border border-border/50 hover:border-gentle/50 touch-manipulation mobile-touch-target group">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || user.email} />
              ) : (
                <AvatarFallback className="bg-gentle/20 text-foreground text-xs sm:text-sm border border-gentle/30">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gentle/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </DropdownMenuTrigger>        <DropdownMenuContent align="end" className="w-56 sm:w-60 mr-2 sm:mr-0 bg-card/95 backdrop-blur-md border-border/50">
          <div className="px-2 py-1.5 text-sm font-medium text-foreground truncate">
            {user?.name || user?.email}
          </div>
          <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem onClick={handleProfileClick} className="py-3 touch-manipulation hover:bg-gentle/10 focus:bg-gentle/10 text-foreground">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 py-3 touch-manipulation">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
