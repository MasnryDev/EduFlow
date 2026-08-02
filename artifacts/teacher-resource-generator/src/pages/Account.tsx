import * as React from "react"
import { useAuth } from "@workspace/replit-auth-web"
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { UserCircle, Shield, LogOut, Check, Badge } from "lucide-react"
import { toast } from "sonner"

export default function Account() {
  const { logout } = useAuth()
  const { data: profile, isLoading, refetch } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } })
  const updateProfileMutation = useUpdateProfile()

  const [displayName, setDisplayName] = React.useState("")

  React.useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName)
    }
  }, [profile])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(
      { data: { displayName } },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully")
          refetch()
        },
        onError: () => toast.error("Failed to update profile")
      }
    )
  }

  const initials = displayName 
    ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "T"

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and subscription.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information and identity.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-inner">
                  {initials}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.displayName || "Teacher"}</h3>
                  <p className="text-sm text-muted-foreground">Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}</p>
                </div>
              </div>

              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ""} 
                    disabled 
                    className="bg-secondary/50 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3" /> Email is managed by your Replit account
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={updateProfileMutation.isPending || displayName === profile?.displayName}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your billing and plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-primary/20 bg-primary/5 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                Free Plan <Badge variant="default" className="text-[10px] h-5">Current</Badge>
              </h3>
              <p className="text-muted-foreground text-sm mt-1">Unlimited generations during beta.</p>
            </div>
            <Button variant="outline" disabled className="shrink-0">
              Upgrade options coming soon
            </Button>
          </div>
          <ul className="mt-6 space-y-3">
            {["Unlimited lesson plans", "All resource types included", "Full history tracking", "Priority generations"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Sign out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => logout()} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
