import React, { useEffect } from "react";
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
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-3 sm:p-4 max-w-lg mx-auto min-h-screen bg-background mobile-safe-area">
      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />
      
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 mt-16 sm:mt-12">Edit Profile</h1>
      <Form {...form}>
        <div className="space-y-4 sm:space-y-6">
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

        <div className="flex justify-end mt-6 sm:mt-8">
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto h-12 sm:h-11 text-base mobile-touch-target"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Form>
    </div>
  );
}