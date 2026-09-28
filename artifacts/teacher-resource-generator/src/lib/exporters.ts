import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx"
import pptxgen from "pptxgenjs"

export type ResourceExportInput = {
  title: string
  content: string
  resourceType: string
  subject: string
  yearLevel: string
  topic?: string | null
  duration?: string | null
  difficulty?: string | null
}

function fileNamePart(value: string): string {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
}

function metadataLines(input: ResourceExportInput): string[] {
  return [
    `Resource type: ${input.resourceType}`,
    `Subject: ${input.subject}`,
    `Year level: ${input.yearLevel}`,
    input.topic ? `Topic: ${input.topic}` : "",
    input.duration ? `Duration: ${input.duration}` : "",
    input.difficulty ? `Difficulty: ${input.difficulty}` : "",
  ].filter(Boolean)
}

function contentLines(content: string): string[] {
  return content.split(/\r?\n/)
}

function headingLevel(
  line: string,
): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  const match = line.match(/^(#{1,3})\s+/)
  if (!match) return undefined
  if (match[1].length === 1) return HeadingLevel.HEADING_1
  if (match[1].length === 2) return HeadingLevel.HEADING_2
  return HeadingLevel.HEADING_3
}

export async function downloadWordDocument(input: ResourceExportInput) {
  const children: Paragraph[] = [
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: metadataLines(input).map(
        (line) => new TextRun({ text: `${line}\n`, size: 20 }),
      ),
      spacing: { after: 260 },
    }),
  ]

  for (const rawLine of contentLines(input.content)) {
    const line = rawLine.trim()
    if (!line) {
      children.push(new Paragraph({ text: "" }))
      continue
    }

    const heading = headingLevel(line)
    if (heading) {
      children.push(
        new Paragraph({
          text: cleanMarkdown(line.replace(/^#{1,3}\s+/, "")),
          heading,
          spacing: { before: 180, after: 100 },
        }),
      )
      continue
    }

    const bullet = line.match(/^(?:[-*]|\d+[.)])\s+(.+)$/)
    if (bullet) {
      children.push(
        new Paragraph({
          text: cleanMarkdown(bullet[1]),
          bullet: { level: 0 },
          spacing: { after: 60 },
        }),
      )
      continue
    }

    children.push(
      new Paragraph({
        text: cleanMarkdown(line),
        spacing: { after: 100 },
      }),
    )
  }

  const document = new Document({
    creator: "EduFlow",
    title: input.title,
    description: `${input.resourceType} for ${input.subject}, ${input.yearLevel}`,
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(document)
  downloadBlob(
    blob,
    `${fileNamePart(input.title) || "teaching-resource"}.docx`,
  )
}

type Slide = {
  title: string
  bullets: string[]
  visuals: string[]
  notes: string[]
}

type SlideSection = "content" | "visuals" | "notes"

function parseSlides(content: string): Slide[] {
  const slides: Slide[] = []
  let current: Slide | undefined
  let activeSection: SlideSection = "content"

  const addValue = (value: string) => {
    if (!current) {
      current = { title: "Teaching resource", bullets: [], visuals: [], notes: [] }
      slides.push(current)
    }

    const cleaned = cleanMarkdown(value)
    if (!cleaned) return

    if (activeSection === "visuals") current.visuals.push(cleaned)
    else if (activeSection === "notes") current.notes.push(cleaned)
    else current.bullets.push(cleaned)
  }

  for (const rawLine of contentLines(content)) {
    const line = rawLine.trim()
    const slideHeading = line.match(
      /^(?:#{1,6}\s*)?(?:[-*]\s*)?slide\s+(\d+)\s*[:\-]\s*(.*)$/i,
    )

    if (slideHeading) {
      current = {
        title: cleanMarkdown(slideHeading[2]) || `Slide ${slideHeading[1]}`,
        bullets: [],
        visuals: [],
        notes: [],
      }
      slides.push(current)
      activeSection = "content"
      continue
    }

    if (!line) continue

    const section = line.match(
      /^(?:[-*]\s*)?(on[-\s]?slide content|content|student[-\s]?facing text)\s*:?\s*(.*)$/i,
    )
    if (section) {
      activeSection = "content"
      addValue(section[2])
      continue
    }

    const visual = line.match(
      /^(?:[-*]\s*)?(suggested visuals?|visual cue|visuals?)\s*:?\s*(.*)$/i,
    )
    if (visual) {
      activeSection = "visuals"
      addValue(visual[2])
      continue
    }

    const notes = line.match(
      /^(?:[-*]\s*)?(teacher notes?|speaker notes?|delivery notes?)\s*:?\s*(.*)$/i,
    )
    if (notes) {
      activeSection = "notes"
      addValue(notes[2])
      continue
    }

    addValue(line.replace(/^(?:[-*]|\d+[.)])\s+/, ""))
  }

  return slides
}

function addSlideFooter(slide: pptxgen.Slide, slideNumber: number, total: number) {
  slide.addText("EduFlow", {
    x: 0.65,
    y: 7.05,
    w: 1.3,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: "E86F2E",
    margin: 0,
  })
  slide.addText(`${slideNumber} / ${total}`, {
    x: 11.75,
    y: 7.05,
    w: 0.95,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 9,
    color: "9A8E87",
    align: "right",
    margin: 0,
  })
}

function addSpeakerNotes(slide: pptxgen.Slide, generated: Slide) {
  const notes = [
    ...generated.notes,
    generated.visuals.length > 0
      ? `Suggested visual: ${generated.visuals.join("; ")}`
      : "",
  ].filter(Boolean)

  if (notes.length > 0) {
    slide.addNotes(notes.join("\n"))
  }
}

export async function downloadPowerPoint(input: ResourceExportInput) {
  const presentation = new pptxgen()
  presentation.layout = "LAYOUT_WIDE"
  presentation.author = "EduFlow"
  presentation.company = "EduFlow"
  presentation.subject = `${input.subject} — ${input.yearLevel}`
  presentation.title = input.title

  const slides = parseSlides(input.content)
  const generatedSlides =
    slides.length > 0
      ? slides
      : [{
          title: "Generated resource",
          bullets: [cleanMarkdown(input.content)],
          visuals: [],
          notes: [],
        }]
  const totalSlides = generatedSlides.length

  generatedSlides.forEach((generated, index) => {
    const isTitleSlide = index === 0
    const isActivitySlide = /practice|activity|discussion|assessment|exit|homework/i.test(generated.title)
    const slide = presentation.addSlide()
    slide.background = { color: isTitleSlide ? "FFF8F2" : isActivitySlide ? "FFFDF9" : "FFFFFF" }

    if (isTitleSlide) {
      slide.addText(input.title, {
        x: 0.75,
        y: 1.15,
        w: 11.6,
        h: 1.1,
        fontFace: "Aptos Display",
        fontSize: 30,
        bold: true,
        color: "2D2521",
        margin: 0,
        breakLine: false,
      })
      slide.addText(generated.title, {
        x: 0.75,
        y: 2.55,
        w: 11.6,
        h: 0.55,
        fontFace: "Aptos",
        fontSize: 20,
        color: "E86F2E",
        margin: 0,
      })
      slide.addText(metadataLines(input).join("  •  "), {
        x: 0.75,
        y: 3.45,
        w: 11.3,
        h: 0.65,
        fontFace: "Aptos",
        fontSize: 13,
        color: "6D625D",
        margin: 0,
        breakLine: false,
      })
      if (generated.bullets.length > 0) {
        slide.addText(generated.bullets.join("\n"), {
          x: 0.85,
          y: 4.45,
          w: 10.8,
          h: 1.2,
          fontFace: "Aptos",
          fontSize: 15,
          color: "3E3733",
          margin: 0,
          breakLine: false,
        })
      }
    } else {
      slide.addText(generated.title, {
        x: 0.7,
        y: 0.55,
        w: 11.7,
        h: 0.65,
        fontFace: "Aptos Display",
        fontSize: 25,
        bold: true,
        color: "2D2521",
        margin: 0,
      })
      slide.addText(generated.bullets.join("\n") || "Use this slide to guide the lesson discussion.", {
        x: 0.8,
        y: 1.55,
        w: generated.visuals.length > 0 ? 7.25 : 11.25,
        h: 4.95,
        fontFace: "Aptos",
        fontSize: 18,
        color: "3E3733",
        breakLine: false,
        bullet: { indent: 18 },
        paraSpaceAfter: 12,
        valign: "top",
        margin: 0.05,
      })

      if (generated.visuals.length > 0) {
        slide.addText("Suggested visual", {
          x: 8.45,
          y: 1.55,
          w: 3.7,
          h: 0.35,
          fontFace: "Aptos",
          fontSize: 12,
          bold: true,
          color: "E86F2E",
          margin: 0,
        })
        slide.addText(generated.visuals.join("\n"), {
          x: 8.45,
          y: 2.05,
          w: 3.7,
          h: 3.95,
          fontFace: "Aptos",
          fontSize: 14,
          italic: true,
          color: "6D625D",
          breakLine: false,
          valign: "top",
          margin: 0.05,
        })
      }
    }

    addSlideFooter(slide, index + 1, totalSlides)
    addSpeakerNotes(slide, generated)
  })

  const blob = (await presentation.write({ outputType: "blob" })) as Blob
  downloadBlob(
    blob,
    `${fileNamePart(input.title) || "teaching-resource"}.pptx`,
  )
}