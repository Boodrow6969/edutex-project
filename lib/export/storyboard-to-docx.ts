/**
 * Storyboard to Word Export
 * Converts TipTap storyboard blocks to a formatted .docx document
 * 
 * Field names match lib/tiptap/sync.ts and lib/types/blocks.ts
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  HeadingLevel,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  VerticalAlign,
} from 'docx';

// Types matching lib/types/blocks.ts

/**
 * STORYBOARD_METADATA block content
 * From sync.ts: title, audience, duration, deliveryMethod
 */
interface StoryboardMetadataContent {
  title?: string;
  audience?: string;
  duration?: string;
  deliveryMethod?: string;  // 'elearning' | 'ilt' | 'vilt' | 'blended'
}

/**
 * CONTENT_SCREEN block content
 * From sync.ts: screenId, screenTitle, screenType, visuals, onScreenText, 
 * voiceoverScript, interactionType, interactionDetails, designerNotes, developerNotes, duration
 */
interface ContentScreenContent {
  screenId?: string;
  screenTitle?: string;
  screenType?: string;  // 'content' | 'video' | 'practice' | 'assessment' | 'scenario' | 'title_intro'
  visuals?: string;
  onScreenText?: string;
  voiceoverScript?: string;
  interactionType?: string;  // 'none' | 'click_reveal' | 'drag_drop' | 'multiple_choice' | etc.
  interactionDetails?: string;
  designerNotes?: string;
  developerNotes?: string;
  duration?: string;
}

/**
 * LEARNING_OBJECTIVES_IMPORT block content
 * From sync.ts: importedAt, objectives, displayMode, projectId
 */
interface LearningObjectivesImportContent {
  importedAt?: string;
  objectives?: Array<{
    id: string;
    text: string;
    bloomLevel?: string;
  }>;
  displayMode?: string;  // 'compact' | 'detailed'
  projectId?: string;
}

/**
 * Block from database (matches Prisma Block model)
 */
interface Block {
  id: string;
  type: string;  // BlockType enum value
  content: Record<string, unknown>;
  order: number;
}

/**
 * Storyboard metadata from Prisma Storyboard model (separate from blocks)
 */
interface StoryboardMetadata {
  targetAudience?: string;
  status?: string;
  linkedObjectiveIds?: string[];
  version?: number;
}

/**
 * Options for export
 */
interface ExportOptions {
  pageTitle: string;
  projectName?: string;
  storyboardMetadata?: StoryboardMetadata;
  exportDate?: Date;
  includeEmptyFields?: boolean;
}

// Style constants
const COLORS = {
  headerBg: 'D5E8F0',      // Light blue for headers
  altRowBg: 'F5F5F5',      // Light gray for alternating rows
  borderColor: 'CCCCCC',   // Light gray borders
  accentColor: '2B579A',   // Blue accent
};

const FONT = {
  default: 'Arial',
  size: {
    normal: 22,      // 11pt
    small: 20,       // 10pt
    heading1: 32,    // 16pt
    heading2: 28,    // 14pt
    heading3: 24,    // 12pt
  }
};

// Border helper
const createBorder = (color = COLORS.borderColor) => ({
  style: BorderStyle.SINGLE,
  size: 1,
  color,
});

const borders = {
  top: createBorder(),
  bottom: createBorder(),
  left: createBorder(),
  right: createBorder(),
};

/**
 * Creates a labeled row for the metadata table
 */
function createMetadataRow(label: string, value: string, isHeader = false): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 2500, type: WidthType.DXA },
        shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                font: FONT.default,
                size: FONT.size.normal,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders,
        width: { size: 6860, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value || '—',
                font: FONT.default,
                size: FONT.size.normal,
                italics: !value,
                color: value ? '000000' : '888888',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Creates a content screen section with all fields
 */
function createContentScreenSection(
  screen: ContentScreenContent,
  screenNumber: number,
  includeEmptyFields: boolean
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Screen header
  const screenId = screen.screenId || `SCR-${String(screenNumber).padStart(3, '0')}`;
  const screenTitle = screen.screenTitle || `Screen ${screenNumber}`;

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: `${screenId}: ${screenTitle}`,
          bold: true,
          font: FONT.default,
          size: FONT.size.heading2,
        }),
      ],
    })
  );

  // Screen type badge (if present)
  if (screen.screenType) {
    elements.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `Type: ${screen.screenType}`,
            font: FONT.default,
            size: FONT.size.small,
            italics: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  // Create table for screen content
  const rows: TableRow[] = [];

  // On-Screen Text
  if (screen.onScreenText || includeEmptyFields) {
    rows.push(createScreenFieldRow('On-Screen Text', screen.onScreenText));
  }

  // Voiceover/Narration Script
  if (screen.voiceoverScript || includeEmptyFields) {
    rows.push(createScreenFieldRow('Audio/Narration', screen.voiceoverScript));
  }

  // Visual Description
  if (screen.visuals || includeEmptyFields) {
    rows.push(createScreenFieldRow('Visual Description', screen.visuals));
  }

  // Interaction Type & Details
  if (screen.interactionType || screen.interactionDetails || includeEmptyFields) {
    const interactionText = [
      screen.interactionType ? `Type: ${screen.interactionType}` : '',
      screen.interactionDetails || '',
    ].filter(Boolean).join('\n');
    rows.push(createScreenFieldRow('Interaction', interactionText));
  }

  // Designer Notes
  if (screen.designerNotes || includeEmptyFields) {
    rows.push(createScreenFieldRow('Designer Notes', screen.designerNotes));
  }

  // Developer Notes
  if (screen.developerNotes || includeEmptyFields) {
    rows.push(createScreenFieldRow('Developer Notes', screen.developerNotes));
  }

  // Duration
  if (screen.duration) {
    rows.push(createScreenFieldRow('Duration', screen.duration));
  }

  if (rows.length > 0) {
    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2500, 6860],
        rows,
      })
    );
  }

  return elements;
}

/**
 * Creates a row for screen content table
 */
function createScreenFieldRow(label: string, value?: string): TableRow {
  // Split value by newlines and create separate text runs
  const valueLines = (value || '').split('\n').filter(Boolean);
  const valueChildren = valueLines.length > 0
    ? valueLines.flatMap((line, i) => [
        new TextRun({
          text: line,
          font: FONT.default,
          size: FONT.size.normal,
        }),
        ...(i < valueLines.length - 1 ? [new TextRun({ break: 1 })] : []),
      ])
    : [
        new TextRun({
          text: '—',
          font: FONT.default,
          size: FONT.size.normal,
          italics: true,
          color: '888888',
        }),
      ];

  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 2500, type: WidthType.DXA },
        shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                font: FONT.default,
                size: FONT.size.normal,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders,
        width: { size: 6860, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: valueChildren })],
      }),
    ],
  });
}

/**
 * Creates the learning objectives section
 */
function createObjectivesSection(objectives: Array<{ id: string; text: string; bloomLevel?: string }>): Paragraph[] {
  const elements: Paragraph[] = [];

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'Learning Objectives',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading2,
        }),
      ],
    })
  );

  objectives.forEach((obj, index) => {
    const bloomText = obj.bloomLevel ? ` [${obj.bloomLevel}]` : '';
    elements.push(
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360 },
        children: [
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
            font: FONT.default,
            size: FONT.size.normal,
          }),
          new TextRun({
            text: obj.text,
            font: FONT.default,
            size: FONT.size.normal,
          }),
          ...(bloomText ? [
            new TextRun({
              text: bloomText,
              font: FONT.default,
              size: FONT.size.small,
              italics: true,
              color: '666666',
            }),
          ] : []),
        ],
      })
    );
  });

  return elements;
}

/**
 * Main export function - converts storyboard blocks to a Word document
 */
export async function storyboardToDocx(
  blocks: Block[],
  options: ExportOptions
): Promise<Buffer> {
  const {
    pageTitle,
    projectName,
    storyboardMetadata,
    exportDate = new Date(),
    includeEmptyFields = false,
  } = options;

  const children: (Paragraph | Table)[] = [];

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Extract metadata block (STORYBOARD_METADATA)
  const metadataBlock = sortedBlocks.find(b => b.type === 'STORYBOARD_METADATA');
  const blockMetadata = (metadataBlock?.content || {}) as StoryboardMetadataContent;

  // Extract objectives blocks (LEARNING_OBJECTIVES_IMPORT)
  const objectivesBlocks = sortedBlocks.filter(b => b.type === 'LEARNING_OBJECTIVES_IMPORT');
  const objectives = objectivesBlocks.flatMap(b => {
    const content = b.content as LearningObjectivesImportContent;
    return content.objectives || [];
  });

  // Extract content screens (CONTENT_SCREEN)
  const contentScreens = sortedBlocks.filter(b => b.type === 'CONTENT_SCREEN');

  // Document title - prefer block metadata title, fallback to page title
  const docTitle = blockMetadata.title || pageTitle || 'Storyboard';

  // === DOCUMENT TITLE ===
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: docTitle,
          bold: true,
          font: FONT.default,
          size: 48, // 24pt
        }),
      ],
    })
  );

  if (projectName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({
            text: projectName,
            font: FONT.default,
            size: FONT.size.heading2,
            color: '666666',
          }),
        ],
      })
    );
  }

  // === METADATA SECTION ===
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: 'Storyboard Information',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading1,
        }),
      ],
    })
  );

  const metadataRows: TableRow[] = [];
  
  // From STORYBOARD_METADATA block
  if (blockMetadata.audience || includeEmptyFields) {
    metadataRows.push(createMetadataRow('Target Audience', blockMetadata.audience || ''));
  }
  // From Storyboard model (if provided)
  if (storyboardMetadata?.targetAudience && !blockMetadata.audience) {
    metadataRows.push(createMetadataRow('Target Audience', storyboardMetadata.targetAudience));
  }
  if (blockMetadata.duration || includeEmptyFields) {
    metadataRows.push(createMetadataRow('Duration', blockMetadata.duration || ''));
  }
  if (blockMetadata.deliveryMethod || includeEmptyFields) {
    const deliveryLabels: Record<string, string> = {
      'elearning': 'eLearning',
      'ilt': 'Instructor-Led Training (ILT)',
      'vilt': 'Virtual Instructor-Led Training (vILT)',
      'blended': 'Blended Learning',
      'eLearning': 'eLearning',  // Handle both cases
    };
    const deliveryLabel = deliveryLabels[blockMetadata.deliveryMethod || ''] || blockMetadata.deliveryMethod || '';
    metadataRows.push(createMetadataRow('Delivery Method', deliveryLabel));
  }
  if (storyboardMetadata?.status || includeEmptyFields) {
    const statusLabels: Record<string, string> = {
      'draft': 'Draft',
      'review': 'In Review',
      'approved': 'Approved',
    };
    const statusLabel = statusLabels[storyboardMetadata?.status || 'draft'] || storyboardMetadata?.status || 'Draft';
    metadataRows.push(createMetadataRow('Status', statusLabel));
  }
  if (storyboardMetadata?.version) {
    metadataRows.push(createMetadataRow('Version', `v${storyboardMetadata.version}`));
  }
  metadataRows.push(createMetadataRow('Export Date', exportDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })));

  if (metadataRows.length > 0) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2500, 6860],
        rows: metadataRows,
      })
    );
  }

  // === LEARNING OBJECTIVES ===
  if (objectives.length > 0) {
    children.push(...createObjectivesSection(objectives));
  }

  // === CONTENT SCREENS ===
  if (contentScreens.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
        children: [
          new TextRun({
            text: 'Content Screens',
            bold: true,
            font: FONT.default,
            size: FONT.size.heading1,
          }),
        ],
      })
    );

    contentScreens.forEach((block, index) => {
      // Page break before each screen (except first)
      if (index > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      const screenContent = block.content as ContentScreenContent;
      const screenElements = createContentScreenSection(
        screenContent,
        index + 1,
        includeEmptyFields
      );
      children.push(...screenElements);
    });
  }

  // === CREATE DOCUMENT ===
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT.default,
            size: FONT.size.normal,
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: FONT.size.heading1, bold: true, font: FONT.default },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: FONT.size.heading2, bold: true, font: FONT.default },
          paragraph: { spacing: { before: 180, after: 90 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240,  // 8.5 inches (US Letter)
              height: 15840, // 11 inches
            },
            margin: {
              top: 1440,    // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: docTitle,
                    font: FONT.default,
                    size: FONT.size.small,
                    color: '666666',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    font: FONT.default,
                    size: FONT.size.small,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT.default,
                    size: FONT.size.small,
                  }),
                  new TextRun({
                    text: ' of ',
                    font: FONT.default,
                    size: FONT.size.small,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT.default,
                    size: FONT.size.small,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export type { Block, ExportOptions, ContentScreenContent, StoryboardMetadataContent, StoryboardMetadata };
