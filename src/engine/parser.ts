// doas -su mylife.root - Rich Text Parser
// Converts [color], [progress], [runCommand] markup to structured objects

export interface OutputSegment {
  text: string;
  color?: string;
}

export interface OutputLine {
  segments: OutputSegment[];
}

export interface OutputBlock {
  type: 'text' | 'progress' | 'runCommand';
  text?: string;
  color?: string;
  max?: number;
  timeAdd?: number;
  command?: string;
  args?: string;
}

export function parseEchoContent(content: string): OutputBlock[] {
  const blocks: OutputBlock[] = [];
  let remaining = String(content);
  const progressRe = /\[progress(?:\s+max=(\d+))?(?:\s+timeAdd=([\d.]+))?\]\[\/progress\]/gis;
  const runCommandRe = /\[runCommand\s+command=([^\]]+)\]\((.*?)\)\[\/endrunning\]/gis;
  const colorRe = /\[color:\s*([^\]]+)\](.*?)\[\/endcolor\]/gis;

  while (remaining.length > 0) {
    const progMatch = progressRe.exec(remaining);
    const runMatch = runCommandRe.exec(remaining);
    const colorMatch = colorRe.exec(remaining);

    // Find the earliest match
    let earliest: { type: string; match: RegExpExecArray; idx: number } | null = null;

    for (const m of [progMatch, runMatch, colorMatch]) {
      if (m && (earliest === null || m.index < earliest.idx)) {
        const type = m === progMatch ? 'progress' : m === runMatch ? 'runCommand' : 'color';
        earliest = { type, match: m, idx: m.index };
      }
    }

    if (!earliest) {
      // No more markup - push remaining as plain text
      if (remaining) {
        blocks.push({ type: 'text', text: remaining });
      }
      break;
    }

    // Push text before the match
    if (earliest.idx > 0) {
      blocks.push({ type: 'text', text: remaining.slice(0, earliest.idx) });
    }

    const m = earliest.match;
    if (earliest.type === 'progress') {
      blocks.push({
        type: 'progress',
        max: parseFloat(m[1]) || 100,
        timeAdd: parseFloat(m[2]) || 1.5,
      });
    } else if (earliest.type === 'runCommand') {
      blocks.push({
        type: 'runCommand',
        command: m[1],
        args: m[2],
      });
    } else if (earliest.type === 'color') {
      blocks.push({
        type: 'text',
        text: m[2],
        color: m[1],
      });
    }

    remaining = remaining.slice(earliest.idx + m[0].length);

    // Reset regex lastIndex since we sliced the string
    progressRe.lastIndex = 0;
    runCommandRe.lastIndex = 0;
    colorRe.lastIndex = 0;
  }

  return blocks;
}

// Flatten blocks into OutputLines, merging consecutive text segments on the same line
export function blocksToLines(blocks: OutputBlock[]): OutputLine[] {
  const lines: OutputLine[] = [];
  let currentLine: OutputLine | null = null;

  function flushLine() {
    if (currentLine && currentLine.segments.length > 0) {
      lines.push(currentLine);
      currentLine = null;
    }
  }

  for (const block of blocks) {
    if (block.type === 'text' && block.text !== undefined) {
      const splitText = block.text.split('\n');
      for (let i = 0; i < splitText.length; i++) {
        const segText = splitText[i];
        if (i > 0) {
          // \n found — flush current line and start a new one
          flushLine();
        }
        if (!currentLine) {
          currentLine = { segments: [] };
        }
        if (segText.length > 0) {
          currentLine.segments.push({ text: segText, color: block.color });
        }
      }
    } else if (block.type === 'progress') {
      flushLine();
      lines.push({
        segments: [{
          text: `[PROGRESS max=${block.max} timeAdd=${block.timeAdd}]`,
          color: '#4caf50',
        }],
      });
    } else if (block.type === 'runCommand') {
      flushLine();
      lines.push({
        segments: [{
          text: `Try: ${block.command} (${block.args})`,
          color: '#00ff66',
        }],
      });
    }
  }
  flushLine();

  return lines;
}
