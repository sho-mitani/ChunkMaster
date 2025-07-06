import { ComparisonResult, TextDiff } from '../types';

export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[　\u3000]/g, ' ')
    .replace(/[！-～]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0))
    .toLowerCase();
}

export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}

export function calculateAccuracy(original: string, input: string): number {
  const normalizedOriginal = normalizeText(original);
  const normalizedInput = normalizeText(input);
  
  if (normalizedOriginal === normalizedInput) {
    return 100;
  }

  const distance = calculateLevenshteinDistance(normalizedOriginal, normalizedInput);
  const maxLength = Math.max(normalizedOriginal.length, normalizedInput.length);
  
  if (maxLength === 0) {
    return 100;
  }

  const accuracy = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, Math.round(accuracy * 100) / 100);
}

export function findTextDiff(original: string, input: string): TextDiff {
  const normalizedOriginal = normalizeText(original);
  const normalizedInput = normalizeText(input);
  
  let correct = '';
  let incorrect = '';
  let missing = '';
  let extra = '';
  
  const originalChars = normalizedOriginal.split('');
  const inputChars = normalizedInput.split('');
  
  let i = 0; // original index
  let j = 0; // input index
  
  while (i < originalChars.length || j < inputChars.length) {
    if (i < originalChars.length && j < inputChars.length) {
      if (originalChars[i] === inputChars[j]) {
        correct += originalChars[i];
        i++;
        j++;
      } else {
        let foundMatch = false;
        
        for (let k = 1; k <= 3 && j + k < inputChars.length; k++) {
          if (originalChars[i] === inputChars[j + k]) {
            extra += inputChars.slice(j, j + k).join('');
            j += k;
            foundMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          for (let k = 1; k <= 3 && i + k < originalChars.length; k++) {
            if (originalChars[i + k] === inputChars[j]) {
              missing += originalChars.slice(i, i + k).join('');
              i += k;
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          incorrect += originalChars[i];
          i++;
          j++;
        }
      }
    } else if (i < originalChars.length) {
      missing += originalChars[i];
      i++;
    } else {
      extra += inputChars[j];
      j++;
    }
  }
  
  return {
    correct,
    incorrect,
    missing,
    extra,
  };
}

export function compareTexts(original: string, input: string): ComparisonResult {
  const accuracy = calculateAccuracy(original, input);
  const diff = findTextDiff(original, input);
  const isMatch = accuracy >= 95;
  
  return {
    accuracy,
    diff,
    isMatch,
  };
}

export function getFirstWordHints(text: string): string {
  const lines = text.split('\n');
  return lines
    .map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        return '';
      }
      return trimmedLine.substring(0, 8);
    })
    .join('\n');
}

export function getLineHints(text: string): string {
  const lines = text.split('\n');
  return lines
    .map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        return '';
      }
      return trimmedLine.substring(0, 8);
    })
    .join('\n');
}

export function splitTextIntoChunks(text: string, delimiter: 'auto' | 'manual' = 'auto'): string[] {
  if (delimiter === 'auto') {
    const patterns = [
      /\d+[-－]\d+/g,
      /\(\d+\)/g,
      /（\d+）/g,
      /\n\s*\n/g,
    ];
    
    let chunks: string[] = [];
    let remainingText = text;
    
    for (const pattern of patterns) {
      const matches = remainingText.match(pattern);
      if (matches && matches.length > 1) {
        chunks = remainingText.split(pattern);
        break;
      }
    }
    
    if (chunks.length === 0) {
      chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 0);
    }
    
    if (chunks.length === 0) {
      chunks = [text];
    }
    
    return chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
  }
  
  return [text];
}

export function generateChunkName(index: number, content: string): string {
  const firstLine = content.split('\n')[0].trim();
  const numberMatch = firstLine.match(/^(\d+[-－]\d+|\(\d+\)|（\d+）)/);
  
  if (numberMatch) {
    return `チャンク${index + 1}: ${numberMatch[1]}`;
  }
  
  const shortContent = firstLine.substring(0, 8);
  return `チャンク${index + 1}: ${shortContent}${firstLine.length > 8 ? '...' : ''}`;
}