import * as React from "react"
import { marked } from "marked"
import { useGenerateResource, useCreateResource } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Copy, Save, Sparkles, RefreshCcw, FilePlus2, FileDown, Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadPowerPoint, downloadWordDocument } from "@/lib/exporters"

const SUBJECTS = ["English", "Mathematics", "Science", "Humanities", "The Arts", "Technologies", "Health and Physical Education", "Languages"]
const YEAR_LEVELS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"]
const RESOURCE_TYPES = ["Lesson Plan", "Worksheet", "Assessment", "Classroom Activity", "PowerPoint Outline", "Curriculum Planner"]
const DURATIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "2 hours", "Full day"]
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]
const GENERATION_STEPS = [
  "Understanding your teaching brief",
  "Aligning content to the Australian Curriculum",
  "Structuring a classroom-ready resource",
]

const selectCls = cn(
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm",
  "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}

export default function CreateResource() {
  const generateMutation = useGenerateResource()
  const createMutation = useCreateResource()
  
  const [formData, setFormData] = React.useState({
    resourceType: "Lesson Plan",
    subject: "English",
    yearLevel: "Year 7",
    topic: "",
    learningObjectives: "",
    duration: "60 minutes",
    difficulty: "Intermediate",
    additionalInstructions: ""
  })

  const [result, setResult] = React.useState<{title: string, content: string, savedId: number | null} | null>(null)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [loadingStep, setLoadingStep] = React.useState(0)

  React.useEffect(() => {
    if (!generateMutation.isPending) {
      setLoadingStep(0)
      return
    }

    const interval = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % GENERATION_STEPS.length)
    }, 1600)

    return () => window.clearInterval(interval)
  }, [generateMutation.isPending])

  React.useEffect(() => {
    if (!isPreviewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreviewOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPreviewOpen])

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formData.topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    setResult(null)
    generateMutation.mutate(
      { data: formData },
      {
        onSuccess: (data) => {
          setResult({ title: data.title, content: data.content, savedId: null })
           setIsPreviewOpen(true)
          toast.success("Resource generated successfully!")
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.error || error?.message || "Failed to generate resource. Please try again."
          toast.error(msg, { duration: 8000 })
        }
      }
    )
  }

  const handleSave = () => {
    if (!result) return
    
    createMutation.mutate(
      { 
        data: {
          ...formData,
          title: result.title,
          aiResponse: result.content
        } 
      },
      {
        onSuccess: (savedResource) => {
          setResult(prev => prev ? { ...prev, savedId: savedResource.id } : null)
          toast.success("Resource saved to your history")
        },
        onError: () => {
          toast.error("Failed to save resource")
        }
      }
    )
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(`${result.title}\n\n${result.content}`)
    toast.success("Copied to clipboard")
  }

  const handleDownload = async () => {
    if (!result) return
    setIsDownloading(true)

    const exportInput = {
      title: result.title,
      content: result.content,
      resourceType: formData.resourceType,
      subject: formData.subject,
      yearLevel: formData.yearLevel,
      topic: formData.topic,
      duration: formData.duration,
      difficulty: formData.difficulty,
    }

    try {
      if (formData.resourceType === "PowerPoint Outline") {
        await downloadPowerPoint(exportInput)
        toast.success("PowerPoint downloaded")
      } else {
        await downloadWordDocument(exportInput)
        toast.success("Word document downloaded")
      }
    } catch {
      toast.error("Could not create the download. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-100px)] min-h-[600px]">
      
      {/* Left Column: Form */}
      <div className="lg:col-span-4 flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-secondary/20">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Generator
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <form id="generate-form" onSubmit={handleGenerate} className="space-y-5">
            
            <div className="space-y-1.5">
              <Label htmlFor="resourceType">Resource Type</Label>
              <select
                id="resourceType"
                className={selectCls}
                value={formData.resourceType}
                onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
              >
                {RESOURCE_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  className={selectCls}
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yearLevel">Year Level</Label>
                <select
                  id="yearLevel"
                  className={selectCls}
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({...formData, yearLevel: e.target.value})}
                >
                  {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic <span className="text-destructive">*</span></Label>
              <Input 
                id="topic" 
                placeholder="e.g. The Water Cycle, Macbeth Themes..." 
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="learningObjectives">Learning Objectives (Optional)</Label>
              <Textarea 
                id="learningObjectives" 
                placeholder="What should students know by the end?" 
                value={formData.learningObjectives}
                onChange={(e) => setFormData({...formData, learningObjectives: e.target.value})}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  className={selectCls}
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className={selectCls}
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
              <Textarea 
                id="additionalInstructions" 
                placeholder="Any specific pedagogical approach or accommodations?" 
                value={formData.additionalInstructions}
                onChange={(e) => setFormData({...formData, additionalInstructions: e.target.value})}
                className="min-h-[80px]"
              />
            </div>

          </form>
        </div>
        <div className="p-4 border-t border-border bg-background">
          <Button 
            type="submit" 
            form="generate-form" 
            className="w-full h-12 text-base font-bold shadow-md"
            disabled={generateMutation.isPending || !formData.topic.trim()}
          >
            {generateMutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Generate Resource</>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column: Result Viewer */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {generateMutation.isPending ? (
          <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />
            <div className="relative w-24 h-24 mb-7">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="relative space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">EduFlow is working</p>
              <h3 className="text-2xl font-bold text-foreground">Creating your {formData.resourceType.toLowerCase()}</h3>
              <p className="max-w-md min-h-6 mt-2 text-muted-foreground transition-all">
                {GENERATION_STEPS[loadingStep]}...
              </p>
            </div>
            <div className="relative mt-8 flex items-center gap-2" aria-label="Generation progress">
              {GENERATION_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 w-12 rounded-full transition-colors",
                    index <= loadingStep ? "bg-primary" : "bg-primary/15",
                  )}
                />
              ))}
            </div>
          </div>
        ) : result ? (
          <>
            <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default">{formData.resourceType}</Badge>
                  {!result.savedId && <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950">Unsaved Draft</Badge>}
                  {result.savedId && <Badge variant="success">Saved</Badge>}
                </div>
                <h2 className="font-bold text-lg line-clamp-1">{result.title}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleCopy} title="Copy to clipboard">
                  <Copy className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleGenerate()} title="Regenerate">
                  <RefreshCcw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} title="Open full preview">
                  <Maximize2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  title={formData.resourceType === "PowerPoint Outline" ? "Download PowerPoint" : "Download Word document"}
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{formData.resourceType === "PowerPoint Outline" ? "PPTX" : "DOCX"}</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={!!result.savedId || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{result.savedId ? "Saved" : "Save Draft"}</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
              <div 
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground prose-li:my-0.5"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.content) }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FilePlus2 className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Ready to generate</h3>
            <p className="max-w-sm mt-2">Fill out the form on the left and hit Generate to create your custom teaching resource.</p>
          </div>
        )}
      </div>

      {isPreviewOpen && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsPreviewOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-preview-title"
            className="flex h-[min(900px,calc(100dvh-1.5rem))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in zoom-in-95 duration-200 sm:h-[min(860px,calc(100dvh-3rem))]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-secondary/20 p-4 sm:p-6">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge>{formData.resourceType === "PowerPoint Outline" ? "PPTX preview" : "DOCX preview"}</Badge>
                  {!result.savedId && <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950">Unsaved Draft</Badge>}
                  {result.savedId && <Badge variant="success">Saved</Badge>}
                </div>
                <h2 id="resource-preview-title" className="truncate text-xl font-bold sm:text-2xl">{result.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review your resource, save it to History, or download the finished file.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} aria-label="Close preview" className="shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-background p-5 sm:p-8">
              <div
                className="prose prose-sm max-w-none dark:prose-invert md:prose-base prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground prose-li:my-0.5"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.content) }}
              />
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border bg-background p-3 sm:p-4">
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" onClick={() => handleGenerate()} disabled={generateMutation.isPending}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Download {formData.resourceType === "PowerPoint Outline" ? ".pptx" : ".docx"}
              </Button>
              <Button onClick={handleSave} disabled={!!result.savedId || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {result.savedId ? "Saved" : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
