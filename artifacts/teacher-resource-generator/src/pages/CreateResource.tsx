import * as React from "react"
import { useGenerateResource, useCreateResource } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Copy, Save, Sparkles, RefreshCcw, FilePlus2 } from "lucide-react"

const SUBJECTS = ["English", "Mathematics", "Science", "HASS", "The Arts", "Technologies", "Health and Physical Education", "Languages"]
const YEAR_LEVELS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"]
const RESOURCE_TYPES = ["Lesson Plan", "Worksheet", "Assessment", "Classroom Activity", "PowerPoint Outline", "Curriculum Planner"]
const DURATIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "2 hours", "Full day"]
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

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
          toast.success("Resource generated successfully!")
        },
        onError: () => {
          toast.error("Failed to generate resource. Please try again.")
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

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-100px)] min-h-[600px]">
      
      {/* Left Column: Form */}
      <div className="lg:col-span-4 flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-secondary/20">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Generator
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <form id="generate-form" onSubmit={handleGenerate} className="space-y-5">
            
            <div className="space-y-1.5">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Select 
                id="resourceType" 
                value={formData.resourceType} 
                onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
              >
                {RESOURCE_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  id="subject" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select 
                  id="yearLevel" 
                  value={formData.yearLevel} 
                  onChange={(e) => setFormData({...formData, yearLevel: e.target.value})}
                >
                  {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
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
                <Select 
                  id="duration" 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  id="difficulty" 
                  value={formData.difficulty} 
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground animate-pulse">
            <Sparkles className="w-12 h-12 mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-bold text-foreground">Drafting your resource...</h3>
            <p className="max-w-sm mt-2">Our AI is analyzing the curriculum standards and structuring your {formData.resourceType.toLowerCase()}.</p>
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
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={!!result.savedId || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{result.savedId ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background custom-scrollbar">
              <div 
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground prose-li:my-0.5"
                dangerouslySetInnerHTML={{ 
                  __html: result.content
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
                    .replace(/<\/ul>\n<ul>/gim, '')
                    .replace(/\n\n/gim, '<br/><br/>') 
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FilePlus2 className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Ready to generate</h3>
            <p className="max-w-sm mt-2">Fill out the form on the left and hit generate to create your custom teaching resource.</p>
          </div>
        )}
      </div>
      
    </div>
  )
}
