import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateUserProfile, updateUserProfileSchema, User } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  // Animation states
  const transition = { duration: 0.5, ease: "easeOut" };

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async (): Promise<User> => {
      const res = await apiRequest("GET", "/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    }
  });

  // Initialize form
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

  // When user data arrives, populate form
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        bio: user.bio ?? "",
        timezone: user.timezone ?? "UTC",
        gender: user.gender ?? "",
        nationality: user.nationality ?? "",
        languages: Array.isArray(user.languages)
          ? user.languages
          : user.languages
          ? JSON.parse(user.languages)
          : [],
      });
    }
  }, [user, form]);

  // Show content animation when loaded
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mobile-safe-area relative">
      {/* Background card effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/50 to-background pointer-events-none" />
      
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

      <motion.main 
        className="max-w-xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pt-16 sm:pt-20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/30">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-background/80"
              onClick={() => navigate('/diary')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-crimson text-2xl sm:text-3xl font-semibold text-foreground">
              Edit Profile
            </h1>
          </div>

          <Form {...form}>
            <div className="space-y-5 sm:space-y-7">
              {/* Personal Information Group */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-5 sm:pb-7 border-b border-border/30">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} className="h-12 sm:h-11 text-base" />
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
                      <FormLabel className="text-sm">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} className="h-12 sm:h-11 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bio & Timezone Group */}
              <div className="grid grid-cols-1 gap-4 lg:gap-6 pb-5 sm:pb-7 border-b border-border/30">
                {/* Bio spans full width */}
                <div className="col-span-1 lg:col-span-2">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about yourself" {...field} className="min-h-24 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Timezone</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-12 sm:h-11 text-base">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information Group */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Gender</FormLabel>
                      <FormControl>
                        <Input placeholder="Gender" {...field} className="h-12 sm:h-11 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="Nationality" {...field} className="h-12 sm:h-11 text-base" />
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
                      <FormLabel className="text-sm">Languages (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. English, Spanish"
                          value={(field.value || []).join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          className="h-12 sm:h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8 sm:mt-10">
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
                className="w-full sm:w-auto h-12 sm:h-11 text-base mobile-touch-target bg-primary hover:bg-primary/90"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </Form>
        </div>
      </motion.main>
    </div>
  );
}