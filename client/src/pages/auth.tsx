import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signIn, signUp } from "@/lib/auth";
import { Heart, Eye, EyeOff } from "lucide-react";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

export default function AuthPage() {
  // Custom CSS for text shadow
  const textShadowStyle = `
    .text-shadow {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  `;
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn.email({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      await refreshAuth();
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message || "Please check your information and try again.",
          variant: "destructive",
        });
        return;
      }      toast({
        title: "Account Created!",
        description: "Welcome to Daily Reflections. Let's set up your profile.",
      });

      await refreshAuth();
      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  return (
    <>
      {/* Inject custom CSS */}
      <style>{textShadowStyle}</style>
    <div 
      className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 mobile-safe-area overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/40 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <Heart className="text-white" size={28} />
          </div>
          <h1 className="font-crimson text-2xl sm:text-3xl font-semibold text-white mb-2 text-shadow">
            Daily Reflections
          </h1>
          <p className="text-white font-inter text-sm sm:text-base text-shadow">
            Your personal space for mindful journaling
          </p>
        </div>

        <Card className="bg-background/95 border-primary/20 shadow-lg backdrop-blur-sm relative z-10 overflow-visible">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 mobile-touch-target">
              <TabsTrigger value="signin" className="mobile-touch-target text-text-blue font-medium">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="mobile-touch-target text-text-blue font-medium">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">              <CardHeader className="text-center pb-3 sm:pb-4">
                <CardTitle className="font-crimson text-lg sm:text-xl text-text-blue">Welcome Back</CardTitle>
                <CardDescription className="text-text-blue/60 text-sm">
                  Sign in to continue your reflection journey
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signin-email" className="text-text-blue text-sm">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signin-password" className="text-text-blue text-sm">Password</Label>
                    <div className="relative">                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="bg-primary/20 border-none rounded-xl sm:rounded-2xl pr-12 h-12 sm:h-11 text-base"
                        required
                      />                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-2 mobile-touch-target"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 sm:py-2 rounded-xl h-12 sm:h-11 text-base mobile-touch-target"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>            <TabsContent value="signup">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <CardTitle className="font-crimson text-lg sm:text-xl text-text-blue">Create Account</CardTitle>
                <CardDescription className="text-text-blue/60 text-sm">
                  Join us and start your reflection journey
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-name" className="text-text-blue text-sm">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                      required
                    />                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-email" className="text-text-blue text-sm">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-password" className="text-text-blue text-sm">Password</Label>
                    <div className="relative">                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="bg-primary/20 border-none rounded-xl sm:rounded-2xl pr-12 h-12 sm:h-11 text-base"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-2 mobile-touch-target"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-text-blue text-sm">Confirm Password</Label>
                    <div className="relative">                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className="bg-primary/20 border-none rounded-xl sm:rounded-2xl pr-12 h-12 sm:h-11 text-base"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-2 mobile-touch-target"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 sm:py-2 rounded-xl h-12 sm:h-11 text-base mobile-touch-target"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
    </>
  );
}
