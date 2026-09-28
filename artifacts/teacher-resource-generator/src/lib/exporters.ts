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

type Slide = { title: string; bullets: string[] }

function parseSlides(content: string): Slide[] {
  const slides: Slide[] = []
  let current: Slide | undefined

  for (const rawLine of contentLines(content)) {
    const line = rawLine.trim()
    const slideHeading = line.match(
      /^(?:#{1,6}\s*)?(?:[-*]\s*)?slide\s+(\d+)\s*[:\-]\s*(.*)$/i,
    )

    if (slideHeading) {
      current = {
        title: cleanMarkdown(slideHeading[2]) || `Slide ${slideHeading[1]}`,
        bullets: [],
      }
      slides.push(current)
      continue
    }

    if (!line) continue
    if (!current) {
      current = { title: "Resource overview", bullets: [] }
      slides.push(current)
    }

    const bullet = line.replace(/^(?:[-*]|\d+[.)])\s+/, "")
    current.bullets.push(cleanMarkdown(bullet))
  }

  return slides
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
      : [{ title: "Generated resource", bullets: [cleanMarkdown(input.content)] }]

  generatedSlides.forEach((generated, index) => {
    const slide = presentation.addSlide()
    slide.background = { color: index === 0 ? "FFF8F2" : "FFFFFF" }
    slide.addText(generated.title, {
      x: 0.65,
      y: index === 0 ? 1.15 : 0.55,
      w: 12,
      h: 0.75,
      fontFace: "Aptos Display",
      fontSize: index === 0 ? 30 : 25,
      bold: true,
      color: "2D2521",
      margin: 0,
    })

    if (index === 0) {
      slide.addText(input.title, {
        x: 0.65,
        y: 2.1,
        w: 12,
        h: 0.65,
        fontFace: "Aptos",
        fontSize: 20,
        color: "E86F2E",
        margin: 0,
      })
      slide.addText(metadataLines(input).join("  •  "), {
        x: 0.65,
        y: 3.05,
        w: 11.8,
        h: 0.5,
        fontFace: "Aptos",
        fontSize: 13,
        color: "6D625D",
        margin: 0,
        breakLine: false,
      })
    } else if (generated.bullets.length > 0) {
      slide.addText(generated.bullets.join("\n"), {
        x: 0.85,
        y: 1.55,
        w: 11.35,
        h: 5.1,
        fontFace: "Aptos",
        fontSize: 18,
        color: "3E3733",
        breakLine: false,
        bullet: { indent: 18 },
        paraSpaceAfter: 12,
        valign: "top",
        margin: 0.05,
      })
    }

    slide.addText(`${index + 1}`, {
      x: 12.25,
      y: 7.05,
      w: 0.45,
      h: 0.2,
      fontFace: "Aptos",
      fontSize: 9,
      color: "9A8E87",
      align: "right",
      margin: 0,
    })
  })

  const blob = (await presentation.write({ outputType: "blob" })) as Blob
  downloadBlob(
    blob,
    `${fileNamePart(input.title) || "teaching-resource"}.pptx`,
  )
}