/**
 * Design Strategy to Word Export
 * Generates a formatted .docx document pre-filled with objectives and lesson stubs
 *
 * Pattern reference: lib/export/objectives-to-docx.ts
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
  LevelFormat,
} from 'docx';

// ─── Types ───

interface ObjectiveEntry {
  title: string;
  bloomLevel?: string;
  priority?: string;
  condition?: string;
  criteria?: string;
  parentTaskTitle?: string;
  requiresAssessment: boolean;
}

interface SolutionComponent {
  component: string;
  percentage: number;
  description?: string;
}

interface EvaluationPlan {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

interface LessonStub {
  title: string;
  objectiveIds: string[];
  objectiveTitles?: string[];
  duration?: string;
  format?: string;
}

export interface DesignStrategyDocxData {
  courseName: string;
  courseType?: string;
  exportDate: string;
  businessChallenge?: string;
  businessGoal?: string;
  trainingPercent?: number;
  solutionComponents?: SolutionComponent[];
  evaluationPlan?: EvaluationPlan;
  objectives: ObjectiveEntry[];
  lessonStubs?: LessonStub[];
  bloomDistribution: Record<string, number>;
}

// ─── Style Constants (match objectives-to-docx.ts) ───

const COLORS = {
  primary: '03428e',
  headerBg: 'D5E8F0',
  altRowBg: 'F5F5F5',
  borderColor: 'CCCCCC',
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

const TABLE_WIDTH = 9360; // US Letter minus 1" margins each side

const BLOOM_LABELS: Record<string, string> = {
  REMEMBER: 'Remember',
  UNDERSTAND: 'Understand',
  APPLY: 'Apply',
  ANALYZE: 'Analyze',
  EVALUATE: 'Evaluate',
  CREATE: 'Create',
};

const PRIORITY_LABELS: Record<string, string> = {
  MUST: 'Must Have',
  SHOULD: 'Should Have',
  NICE_TO_HAVE: 'Nice to Have',
};

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
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

function textCell(text: string, width: number, opts?: { bold?: boolean; italic?: boolean; color?: string }): TableCell {
  const isEmpty = !text;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '\u2014',
            font: FONT.default,
            size: FONT.size.normal,
            bold: opts?.bold,
            italics: opts?.italic ?? isEmpty,
            color: opts?.color ?? (isEmpty ? '888888' : '000000'),
          }),
        ],
      }),
    ],
  });
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT.default,
        size: FONT.size.heading2,
      }),
    ],
  });
}

function heading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT.default,
        size: FONT.size.heading3,
      }),
    ],
  });
}

function bodyParagraph(text: string, opts?: { italic?: boolean; color?: string; bold?: boolean }): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT.default,
        size: FONT.size.normal,
        italics: opts?.italic,
        color: opts?.color,
        bold: opts?.bold,
      }),
    ],
  });
}

// ─── Section Builders ───

function buildTitlePage(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 3600, after: 240 },
      children: [
        new TextRun({
          text: 'Design Strategy',
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
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'DRAFT \u2014 Generated from Learning Objectives Wizard',
          font: FONT.default,
          size: FONT.size.normal,
          italics: true,
          color: '888888',
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

function buildBusinessAlignment(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(heading2('Business Challenge & Goal'));

  elements.push(bodyParagraph('Business Challenge', { bold: true }));
  elements.push(
    bodyParagraph(
      data.businessChallenge ||
        '[To be completed \u2014 enter the business problem or opportunity this training addresses]',
      data.businessChallenge ? undefined : { italic: true, color: '888888' }
    )
  );

  elements.push(bodyParagraph('Business Goal', { bold: true }));
  elements.push(
    bodyParagraph(
      data.businessGoal || '[To be completed \u2014 enter the measurable business goal]',
      data.businessGoal ? undefined : { italic: true, color: '888888' }
    )
  );

  return elements;
}

function buildSolutionBreakdown(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(heading2('Solution Breakdown'));

  const colWidths = [2800, 1200, 5360];

  const headerRow = new TableRow({
    children: [
      headerCell('Component', colWidths[0]),
      headerCell('%', colWidths[1]),
      headerCell('Description', colWidths[2]),
    ],
  });

  let dataRows: TableRow[];

  if (data.solutionComponents && data.solutionComponents.length > 0) {
    dataRows = data.solutionComponents.map(
      (sc) =>
        new TableRow({
          children: [
            textCell(sc.component, colWidths[0]),
            textCell(sc.percentage != null ? `${sc.percentage}%` : '__%', colWidths[1]),
            textCell(sc.description || '', colWidths[2]),
          ],
        })
    );
  } else {
    const defaults = [
      { component: 'Training', desc: '[Define what training will address]' },
      { component: 'Leadership Reinforcement', desc: '[Define management support needed]' },
      { component: 'Process/Environment Changes', desc: '[Define non-training factors]' },
      { component: 'Peer Accountability', desc: '[Define peer support structures]' },
    ];
    dataRows = defaults.map(
      (d) =>
        new TableRow({
          children: [
            textCell(d.component, colWidths[0]),
            textCell('__%', colWidths[1]),
            textCell(d.desc, colWidths[2], { italic: true, color: '888888' }),
          ],
        })
    );
  }

  elements.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...dataRows],
    })
  );

  elements.push(
    bodyParagraph(
      'Percentages should total 100%. Training alone rarely solves the full problem.',
      { italic: true, color: '666666' }
    )
  );

  return elements;
}

function buildObjectivesSection(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  elements.push(heading2('Learning Objectives'));

  const colWidths = [600, 4160, 1600, 1400, 1600];

  const headerRow = new TableRow({
    children: [
      headerCell('#', colWidths[0]),
      headerCell('Objective', colWidths[1]),
      headerCell("Bloom's Level", colWidths[2]),
      headerCell('Priority', colWidths[3]),
      headerCell('Assessment', colWidths[4]),
    ],
  });

  const dataRows = data.objectives.map(
    (obj, i) =>
      new TableRow({
        children: [
          textCell(String(i + 1), colWidths[0]),
          textCell(obj.title, colWidths[1]),
          textCell(obj.bloomLevel ? (BLOOM_LABELS[obj.bloomLevel] || obj.bloomLevel) : '', colWidths[2]),
          textCell(obj.priority ? (PRIORITY_LABELS[obj.priority] || obj.priority) : '', colWidths[3]),
          textCell(obj.requiresAssessment ? 'Yes' : 'No', colWidths[4]),
        ],
      })
  );

  elements.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...dataRows],
    })
  );

  // Bloom distribution summary
  const bloomEntries = Object.entries(data.bloomDistribution);
  if (bloomEntries.length > 0) {
    const summary = bloomEntries
      .map(([level, count]) => `${BLOOM_LABELS[level] || level}: ${count}`)
      .join(', ');
    elements.push(
      bodyParagraph(`Bloom's Distribution: ${summary}`, { italic: true, color: '666666' })
    );
  }

  return elements;
}

function buildLessonPlanSection(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  elements.push(heading2('Curriculum Structure'));

  const stubs = data.lessonStubs ?? [];

  if (stubs.length === 0) {
    elements.push(
      bodyParagraph(
        '[No lesson stubs generated \u2014 link objectives to parent tasks to auto-generate.]',
        { italic: true, color: '888888' }
      )
    );
    return elements;
  }

  for (const stub of stubs) {
    elements.push(heading3(stub.title));

    // Linked objectives as bullet list
    const titles = stub.objectiveTitles ?? stub.objectiveIds;
    if (titles.length > 0) {
      elements.push(bodyParagraph('Linked Objectives:', { bold: true }));
      for (const label of titles) {
        elements.push(
          new Paragraph({
            numbering: { reference: 'bullet-list', level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: label,
                font: FONT.default,
                size: FONT.size.normal,
              }),
            ],
          })
        );
      }
    }

    elements.push(
      bodyParagraph(
        `Duration: ${stub.duration || '[To be determined]'}`,
        stub.duration ? undefined : { italic: true, color: '888888' }
      )
    );
    elements.push(
      bodyParagraph(
        `Format: ${stub.format || '[To be determined]'}`,
        stub.format ? undefined : { italic: true, color: '888888' }
      )
    );
  }

  return elements;
}

function buildEvaluationSection(data: DesignStrategyDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  elements.push(heading2('Evaluation Plan (Kirkpatrick Model)'));

  const assessedCount = data.objectives.filter((o) => o.requiresAssessment).length;

  const ep = data.evaluationPlan;

  const colWidths = [1400, 2800, 2800, 2360];

  const headerRow = new TableRow({
    children: [
      headerCell('Level', colWidths[0]),
      headerCell('Description', colWidths[1]),
      headerCell('Method', colWidths[2]),
      headerCell('Timing', colWidths[3]),
    ],
  });

  const level2Description = assessedCount > 0
    ? `${assessedCount} objective${assessedCount !== 1 ? 's' : ''} require formal assessment`
    : 'No objectives flagged for assessment';

  const rows = [
    {
      level: 'Level 1',
      desc: 'Reaction',
      method: ep?.level1 || '[Learner satisfaction survey \u2014 define timing and questions]',
      timing: '[Post-training]',
    },
    {
      level: 'Level 2',
      desc: 'Learning',
      method: ep?.level2 || level2Description,
      timing: '[During/post-training]',
    },
    {
      level: 'Level 3',
      desc: 'Behavior',
      method: ep?.level3 || '[On-the-job observation \u2014 define method and timing]',
      timing: '[30/60/90 days]',
    },
    {
      level: 'Level 4',
      desc: 'Results',
      method: ep?.level4 || '[Business KPI measurement \u2014 link to business goal above]',
      timing: '[Quarterly]',
    },
  ];

  const dataRows = rows.map(
    (r) =>
      new TableRow({
        children: [
          textCell(r.level, colWidths[0], { bold: true }),
          textCell(r.desc, colWidths[1]),
          textCell(r.method, colWidths[2]),
          textCell(r.timing, colWidths[3]),
        ],
      })
  );

  elements.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...dataRows],
    })
  );

  return elements;
}

function buildCommunicationPlan(): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  elements.push(heading2('Communication Plan'));

  const colWidths = [1800, 3000, 2280, 2280];

  const headerRow = new TableRow({
    children: [
      headerCell('Audience', colWidths[0]),
      headerCell('Message', colWidths[1]),
      headerCell('Timing', colWidths[2]),
      headerCell('Channel', colWidths[3]),
    ],
  });

  const defaults = [
    { audience: 'Learners', message: '[What learners need to know and do]' },
    { audience: 'Managers', message: '[How managers can support the training]' },
    { audience: 'Stakeholders', message: '[Progress updates and outcomes reporting]' },
    { audience: 'SMEs', message: '[Content review and validation schedule]' },
  ];

  const dataRows = defaults.map(
    (d) =>
      new TableRow({
        children: [
          textCell(d.audience, colWidths[0], { bold: true }),
          textCell(d.message, colWidths[1], { italic: true, color: '888888' }),
          textCell('[To be determined]', colWidths[2], { italic: true, color: '888888' }),
          textCell('[To be determined]', colWidths[3], { italic: true, color: '888888' }),
        ],
      })
  );

  elements.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...dataRows],
    })
  );

  return elements;
}

// ─── Main Export Function ───

export async function generateDesignStrategyDocx(data: DesignStrategyDocxData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // 1. Title page
  children.push(...buildTitlePage(data));

  // 2. Business Alignment
  children.push(...buildBusinessAlignment(data));

  // 3. Solution Breakdown
  children.push(...buildSolutionBreakdown(data));

  // 4. Learning Objectives
  children.push(...buildObjectivesSection(data));

  // 5. Lesson Plan Stubs
  children.push(...buildLessonPlanSection(data));

  // 6. Evaluation Strategy
  children.push(...buildEvaluationSection(data));

  // 7. Communication Plan
  children.push(...buildCommunicationPlan());

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
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
                    text: `Design Strategy \u2014 ${data.courseName}`,
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
