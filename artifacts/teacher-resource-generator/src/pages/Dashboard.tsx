import { useAuth } from "@workspace/replit-auth-web"
import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "wouter"
import { FilePlus2, Layers, Calendar, BarChart3 } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } })

  const displayName = user?.name || "Teacher"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your resource generation.</p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <FilePlus2 className="w-4 h-4" /> Create New Resource
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources Created</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalResources || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.recentResources?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Used Type</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold truncate">
                {stats?.resourcesByType && stats.resourcesByType.length > 0 
                  ? stats.resourcesByType[0].resourceType 
                  : "None"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Recent Resources</h2>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : stats?.recentResources && stats.recentResources.length > 0 ? (
          <div className="grid gap-4">
            {stats.recentResources.map(resource => (
              <Card key={resource.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                <Link href={`/history?id=${resource.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{resource.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">{resource.resourceType}</Badge>
                        <span>{resource.subject} • {resource.yearLevel}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-secondary/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-4 text-muted-foreground">
                <FilePlus2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No resources yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Get started by creating your first teaching resource in under 60 seconds.
              </p>
              <Link href="/create">
                <Button>Create Resource</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
