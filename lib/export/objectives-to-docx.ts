/**
 * Learning Objectives to Word Export
 * Generates a formatted .docx document from objectives data
 *
 * Pattern reference: lib/export/storyboard-to-docx.ts
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

// ─── Types ───

interface ObjectiveData {
  id: string;
  title: string;
  description?: string | null;
  bloomLevel?: string | null;
  priority?: string | null;
  condition?: string | null;
  criteria?: string | null;
  audience?: string | null;
  linkedTriageItemId?: string | null;
  parentTaskTitle?: string | null;
}

interface TriageItemData {
  id: string;
  title: string;
  column: string;
}

interface ValidationSummary {
  totalObjectives: number;
  withParentTask: number;
  orphaned: number;
  bloomDistribution: Record<string, number>;
}

export interface ObjectivesExportData {
  courseName: string;
  courseType?: string;
  exportDate: string;
  objectives: ObjectiveData[];
  triageItems: TriageItemData[];
  validationSummary?: ValidationSummary;
}

// ─── Style Constants ───

const COLORS = {
  primary: '03428e',
  headerBg: 'D5E8F0',
  altRowBg: 'F5F5F5',
  borderColor: 'CCCCCC',
  warningBg: 'FFF3CD',
};

const FONT = {
  default: 'Arial',
  size: {
    normal: 24,    // 12pt
    small: 20,     // 10pt
    heading1: 32,  // 16pt
    heading2: 28,  // 14pt
    heading3: 26,  // 13pt
  },
};

// ─── Helpers ───

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

const TABLE_WIDTH = 9360; // US Letter minus 1" margins each side (12240 - 2880)
const LABEL_COL = 2400;
const VALUE_COL = TABLE_WIDTH - LABEL_COL;

function labelCell(text: string): TableCell {
  return new TableCell({
    borders,
    width: { size: LABEL_COL, type: WidthType.DXA },
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            font: FONT.default,
            size: FONT.size.normal,
          }),
        ],
      }),
    ],
  });
}

function valueCell(text: string, bold = false): TableCell {
  const isEmpty = !text;
  return new TableCell({
    borders,
    width: { size: VALUE_COL, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '\u2014',
            font: FONT.default,
            size: FONT.size.normal,
            bold,
            italics: isEmpty,
            color: isEmpty ? '888888' : '000000',
          }),
        ],
      }),
    ],
  });
}

function row(label: string, value: string, bold = false): TableRow {
  return new TableRow({ children: [labelCell(label), valueCell(value, bold)] });
}

// Column labels for the triage column values
const COLUMN_LABELS: Record<string, string> = {
  must: 'Must Have',
  should: 'Should Have',
  nice: 'Nice to Have',
};

// Priority labels for ObjectivePriority enum
const PRIORITY_LABELS: Record<string, string> = {
  MUST: 'Must Have',
  SHOULD: 'Should Have',
  NICE_TO_HAVE: 'Nice to Have',
};

// Bloom level display labels
const BLOOM_LABELS: Record<string, string> = {
  REMEMBER: 'Remember',
  UNDERSTAND: 'Understand',
  APPLY: 'Apply',
  ANALYZE: 'Analyze',
  EVALUATE: 'Evaluate',
  CREATE: 'Create',
};

// ─── Section Builders ───

function buildTitlePage(data: ObjectivesExportData): (Paragraph | Table)[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 3600, after: 240 },
      children: [
        new TextRun({
          text: 'Learning Objectives',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading1,
          color: COLORS.primary,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: data.courseName,
          font: FONT.default,
          size: FONT.size.heading2,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: data.exportDate,
          font: FONT.default,
          size: FONT.size.normal,
          color: '888888',
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function buildSummarySection(data: ObjectivesExportData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const summary = data.validationSummary;

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'Summary',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading2,
        }),
      ],
    })
  );

  if (!summary) {
    elements.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'No objectives have been created yet.',
            font: FONT.default,
            size: FONT.size.normal,
            italics: true,
            color: '888888',
          }),
        ],
      })
    );
    return elements;
  }

  // Total count
  elements.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Total Objectives: ${summary.totalObjectives}`,
          font: FONT.default,
          size: FONT.size.normal,
          bold: true,
        }),
      ],
    })
  );

  // Bloom distribution table
  const bloomEntries = Object.entries(summary.bloomDistribution);
  if (bloomEntries.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: "Bloom's Taxonomy Distribution",
            font: FONT.default,
            size: FONT.size.normal,
            bold: true,
          }),
        ],
      })
    );

    // Header row
    const headerRow = new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 3120, type: WidthType.DXA },
          shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Level', bold: true, font: FONT.default, size: FONT.size.normal })],
            }),
          ],
        }),
        new TableCell({
          borders,
          width: { size: 3120, type: WidthType.DXA },
          shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Count', bold: true, font: FONT.default, size: FONT.size.normal })],
            }),
          ],
        }),
        new TableCell({
          borders,
          width: { size: 3120, type: WidthType.DXA },
          shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Percentage', bold: true, font: FONT.default, size: FONT.size.normal })],
            }),
          ],
        }),
      ],
    });

    const dataRows = bloomEntries.map(([level, count]) => {
      const pct = summary.totalObjectives > 0
        ? Math.round((count / summary.totalObjectives) * 100)
        : 0;
      return new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 3120, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: BLOOM_LABELS[level] || level, font: FONT.default, size: FONT.size.normal })],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 3120, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(count), font: FONT.default, size: FONT.size.normal })],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 3120, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${pct}%`, font: FONT.default, size: FONT.size.normal })],
              }),
            ],
          }),
        ],
      });
    });

    elements.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [headerRow, ...dataRows],
      })
    );
  }

  // Traceability
  elements.push(
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: `Traceability: ${summary.withParentTask} of ${summary.totalObjectives} objectives linked to parent tasks`,
          font: FONT.default,
          size: FONT.size.normal,
        }),
      ],
    })
  );

  // Orphan warning
  if (summary.orphaned > 0) {
    elements.push(
      new Paragraph({
        spacing: { after: 120 },
        shading: { fill: COLORS.warningBg, type: ShadingType.CLEAR },
        children: [
          new TextRun({
            text: `Warning: ${summary.orphaned} objective${summary.orphaned !== 1 ? 's' : ''} not linked to any parent task`,
            font: FONT.default,
            size: FONT.size.normal,
            bold: true,
            color: '856404',
          }),
        ],
      })
    );
  }

  return elements;
}

function buildObjectiveCard(obj: ObjectiveData): Table {
  const rows: TableRow[] = [
    row('Objective', obj.title || '(untitled)', true),
    row("Bloom's Level", obj.bloomLevel ? (BLOOM_LABELS[obj.bloomLevel] || obj.bloomLevel) : ''),
    row('Priority', obj.priority ? (PRIORITY_LABELS[obj.priority] || obj.priority) : ''),
    row('Audience', obj.audience || 'All learners'),
    row('Behavior', obj.title || ''),
    row('Condition', obj.condition || ''),
    row('Criteria', obj.criteria || ''),
  ];

  // Full description if it differs from title
  if (obj.description && obj.description !== obj.title) {
    rows.push(row('Full Description', obj.description));
  }

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [LABEL_COL, VALUE_COL],
    rows,
  });
}

function buildObjectivesByParentTask(data: ObjectivesExportData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: 'Objectives by Parent Task',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading2,
        }),
      ],
    })
  );

  if (data.objectives.length === 0) {
    elements.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'No objectives have been created yet.',
            font: FONT.default,
            size: FONT.size.normal,
            italics: true,
            color: '888888',
          }),
        ],
      })
    );
    return elements;
  }

  // Group objectives by parent task
  const grouped = new Map<string, ObjectiveData[]>();
  const orphaned: ObjectiveData[] = [];

  for (const obj of data.objectives) {
    if (obj.linkedTriageItemId && obj.parentTaskTitle) {
      const key = obj.linkedTriageItemId;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(obj);
    } else {
      orphaned.push(obj);
    }
  }

  // Render each parent task group
  for (const [taskId, taskObjs] of grouped) {
    const taskTitle = taskObjs[0]?.parentTaskTitle || 'Unknown Task';
    const triageItem = data.triageItems.find((t) => t.id === taskId);
    const columnLabel = triageItem ? (COLUMN_LABELS[triageItem.column] || triageItem.column) : '';
    const badge = columnLabel ? ` [${columnLabel}]` : '';

    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: taskTitle,
            bold: true,
            font: FONT.default,
            size: FONT.size.heading3,
          }),
          ...(badge
            ? [
                new TextRun({
                  text: badge,
                  font: FONT.default,
                  size: FONT.size.small,
                  italics: true,
                  color: '666666',
                }),
              ]
            : []),
        ],
      })
    );

    for (const obj of taskObjs) {
      elements.push(buildObjectiveCard(obj));
      elements.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    }
  }

  // Orphaned objectives
  if (orphaned.length > 0) {
    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: 'Unlinked Objectives',
            bold: true,
            font: FONT.default,
            size: FONT.size.heading3,
          }),
        ],
      })
    );

    for (const obj of orphaned) {
      elements.push(buildObjectiveCard(obj));
      elements.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    }
  }

  return elements;
}

function buildTriageAppendix(data: ObjectivesExportData): (Paragraph | Table)[] {
  if (data.triageItems.length === 0) return [];

  const elements: (Paragraph | Table)[] = [];

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'Appendix: Content Triage Summary',
          bold: true,
          font: FONT.default,
          size: FONT.size.heading2,
        }),
      ],
    })
  );

  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 6240, type: WidthType.DXA },
        shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Task', bold: true, font: FONT.default, size: FONT.size.normal })],
          }),
        ],
      }),
      new TableCell({
        borders,
        width: { size: 3120, type: WidthType.DXA },
        shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Priority Column', bold: true, font: FONT.default, size: FONT.size.normal })],
          }),
        ],
      }),
    ],
  });

  const dataRows = data.triageItems.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 6240, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.title, font: FONT.default, size: FONT.size.normal })],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 3120, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: COLUMN_LABELS[item.column] || item.column,
                    font: FONT.default,
                    size: FONT.size.normal,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  elements.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: [6240, 3120],
      rows: [headerRow, ...dataRows],
    })
  );

  return elements;
}

// ─── Main Export Function ───

export async function generateObjectivesDocx(data: ObjectivesExportData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // 1. Title page
  children.push(...buildTitlePage(data));

  // 2. Summary section
  children.push(...buildSummarySection(data));

  // Page break before objectives
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // 3. Objectives by parent task
  children.push(...buildObjectivesByParentTask(data));

  // 4. Triage appendix
  children.push(...buildTriageAppendix(data));

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
          run: { size: FONT.size.heading1, bold: true, font: FONT.default, color: COLORS.primary },
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
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: FONT.size.heading3, bold: true, font: FONT.default },
          paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 2 },
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
                    text: `Learning Objectives \u2014 ${data.courseName}`,
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
                  new TextRun({ text: 'Page ', font: FONT.default, size: FONT.size.small }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT.default, size: FONT.size.small }),
                  new TextRun({ text: ' of ', font: FONT.default, size: FONT.size.small }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT.default, size: FONT.size.small }),
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
