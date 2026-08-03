import * as React from "react"
import { marked } from "marked"
import { useListResources, useDeleteResource, getListResourcesQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Trash2, Copy, Eye, FileText, X } from "lucide-react"
import { Link } from "wouter"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const RESOURCE_TYPES = ["All", "Lesson Plan", "Worksheet", "Assessment", "Classroom Activity", "PowerPoint Outline", "Curriculum Planner"]

const selectCls = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
  "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}

export default function History() {
  const searchParams = new URLSearchParams(window.location.search)
  const initialId = searchParams.get("id")

  const [search, setSearch] = React.useState("")
  const [resourceTypeFilter, setResourceTypeFilter] = React.useState("All")
  const [selectedResource, setSelectedResource] = React.useState<any | null>(null)
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)

  const queryParams = {
    search: search.length > 2 ? search : undefined,
    resource_type: resourceTypeFilter !== "All" ? resourceTypeFilter : undefined,
    limit: 50
  }
  const { data, isLoading, refetch } = useListResources(queryParams, { query: { queryKey: getListResourcesQueryKey(queryParams) } })

  const deleteMutation = useDeleteResource()

  React.useEffect(() => {
    if (initialId && data?.resources) {
      const res = data.resources.find(r => r.id.toString() === initialId)
      if (res) {
        setSelectedResource(res)
        setIsViewerOpen(true)
      }
    }
  }, [initialId, data])

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this resource?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Resource deleted")
          if (selectedResource?.id === id) {
            setIsViewerOpen(false)
          }
          refetch()
        },
        onError: () => toast.error("Failed to delete")
      })
    }
  }

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(`${title}\n\n${content}`)
    toast.success("Copied to clipboard")
  }

  const openViewer = (resource: any) => {
    setSelectedResource(resource)
    setIsViewerOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource History</h1>
          <p className="text-muted-foreground mt-1">Browse, search and manage your generated materials.</p>
        </div>
        <Link href="/create">
          <Button>Create New Resource</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or topic..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-52 shrink-0">
          <select
            className={selectCls}
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
          >
            {RESOURCE_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : data?.resources && data.resources.length > 0 ? (
        <div className="grid gap-3">
          {data.resources.map((resource) => (
            <Card 
              key={resource.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => openViewer(resource)}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="secondary" className="shrink-0">{resource.resourceType}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-lg truncate text-foreground">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground truncate">
                    <span>{resource.subject}</span> • <span>{resource.yearLevel}</span>
                    {resource.topic && <> • <span className="truncate">{resource.topic}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="View">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={(e) => handleDelete(resource.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-xl bg-secondary/20">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No resources found</h3>
          <p className="text-muted-foreground mb-6">
            {search || resourceTypeFilter !== "All" 
              ? "Try adjusting your search filters."
              : "You haven't generated any resources yet."}
          </p>
          {!(search || resourceTypeFilter !== "All") && (
            <Link href="/create">
              <Button>Create your first resource</Button>
            </Link>
          )}
        </div>
      )}

      {/* Resource Viewer Modal */}
      {isViewerOpen && selectedResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsViewerOpen(false) }}
        >
          <div className="bg-background w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-start bg-secondary/10 shrink-0">
              <div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge>{selectedResource.resourceType}</Badge>
                  <Badge variant="outline">{selectedResource.subject}</Badge>
                  <Badge variant="outline">{selectedResource.yearLevel}</Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedResource.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(selectedResource.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsViewerOpen(false)}
                className="p-2 hover:bg-muted rounded-full ml-4 shrink-0 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-background">
              <div 
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground prose-li:my-0.5"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedResource.aiResponse) }}
              />
            </div>
            <div className="p-4 border-t border-border bg-background flex justify-end items-center gap-2 shrink-0">
              <Button 
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={(e) => handleDelete(selectedResource.id, e as any)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Button 
                onClick={() => handleCopy(selectedResource.aiResponse, selectedResource.title)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
