import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { User, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateUserProfileSchema, type UpdateUserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Asia/Kolkata",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshAuth } = useAuth();

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      timezone: "UTC",
      gender: "",
      nationality: "",
      languages: [],
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/complete-onboarding", {});
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Welcome to Daily Reflections!",
        description: "Your profile has been set up. Start writing your first reflection.",
      });
      // Refresh auth session to update isOnboarded status
      await refreshAuth();
      navigate("/");
    },
  });

  const handleNext = () => {
    if (step === 1) {
      const firstName = form.getValues("firstName");
      const lastName = form.getValues("lastName");
      
      if (!firstName.trim() || !lastName.trim()) {
        form.setError("firstName", { message: "First name is required" });
        form.setError("lastName", { message: "Last name is required" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    
    try {
      await updateProfileMutation.mutateAsync(formData);
      await completeOnboardingMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 mobile-safe-area">
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8 mt-16 sm:mt-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Heart className="text-accent" size={28} />
          </div>
          <h1 className="font-crimson text-2xl sm:text-3xl font-semibold text-text-blue mb-2">
            Welcome to Daily Reflections
          </h1>
          <p className="text-text-blue/70 font-inter text-sm sm:text-base">
            Let's set up your personal space for daily journaling
          </p>
        </div>

        <div className="bg-background/90 entry-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6 sm:mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full transition-colors ${
                  stepNumber <= step ? "bg-accent" : "bg-primary/30"
                }`}
              />
            ))}
          </div>

          <Form {...form}>
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <User className="text-accent mx-auto mb-2" size={20} />
                  <h2 className="font-crimson text-lg sm:text-xl font-semibold text-text-blue">
                    Tell us about yourself
                  </h2>
                </div>
                
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <Clock className="text-accent mx-auto mb-2" size={20} />
                  <h2 className="font-crimson text-lg sm:text-xl font-semibold text-text-blue">
                    Choose your timezone
                  </h2>
                  <p className="text-text-blue/60 text-sm mt-2">
                    This helps us send evening prompts at the right time
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base">
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <Heart className="text-accent mx-auto mb-2" size={20} />
                  <h2 className="font-crimson text-lg sm:text-xl font-semibold text-text-blue">
                    Tell your story
                  </h2>
                  <p className="text-text-blue/60 text-sm mt-2">
                    Share a bit about yourself (optional)
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">About you</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What brings you to daily reflection? What are your hopes for this journey?"
                          {...field}
                          className="bg-primary/20 border-none rounded-xl sm:rounded-2xl min-h-24 resize-none text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">Gender (optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base">
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">Nationality (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., American, British, Canadian"
                          {...field}
                          className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-blue text-sm">Languages (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., English, Spanish, French (comma-separated)"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const languages = e.target.value
                              .split(",")
                              .map(lang => lang.trim())
                              .filter(lang => lang.length > 0);
                            field.onChange(languages);
                          }}
                          className="bg-primary/20 border-none rounded-xl sm:rounded-2xl h-12 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between mt-6 sm:mt-8">
              {step > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-text-blue/70 hover:text-text-blue h-12 sm:h-11 px-4 mobile-touch-target"
                >
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 sm:py-2 px-6 rounded-xl h-12 sm:h-11 mobile-touch-target"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={updateProfileMutation.isPending || completeOnboardingMutation.isPending}
                    className="bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 sm:py-2 px-6 rounded-xl h-12 sm:h-11 mobile-touch-target"
                  >
                    {updateProfileMutation.isPending || completeOnboardingMutation.isPending 
                      ? "Setting up..." 
                      : "Start Journaling"
                    }
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
