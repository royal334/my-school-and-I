import type { Metadata } from 'next';
import { LegalDocument, type LegalSection } from '@/components/legal/legal-document';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Agent Agreement | Campus&Me',
  description: 'Terms and conditions for Campus&Me External Accommodation Partners (Agents).',
};

function parseMarkdownToSections(md: string): LegalSection[] {
  // Split by ## headings
  const parts = md.split(/^##\s+/m);
  const sections: LegalSection[] = [];
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lines = part.split('\n');
    const title = lines[0].trim();
    const body = lines.slice(1).join('\n');
    
    // Skip Schedules and certain sections if needed, but include all
    const paragraphs: string[] = [];
    const bullets: string[] = [];
    
    // Simple parsing - extract paragraphs and bullets
    const bodyLines = body.split('\n');
    let currentPara = '';
    for (const line of bodyLines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentPara) {
          paragraphs.push(currentPara);
          currentPara = '';
        }
        continue;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentPara) {
          paragraphs.push(currentPara);
          currentPara = '';
        }
        bullets.push(trimmed.replace(/^[-*]\s+/, ''));
      } else if (trimmed.startsWith('|')) {
        // Skip tables for now or handle them
        continue;
      } else if (trimmed.startsWith('**') && trimmed.includes(':')) {
        if (currentPara) {
          paragraphs.push(currentPara);
          currentPara = '';
        }
        currentPara += trimmed + ' ';
      } else if (!trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        currentPara += (currentPara ? ' ' : '') + trimmed;
      }
    }
    if (currentPara) {
      paragraphs.push(currentPara);
    }
    
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    sections.push({ id, title, paragraphs, bullets: bullets.length > 0 ? bullets : undefined });
  }
  return sections;
}

export default function AgentAgreementPage() {
  const mdPath = path.join(process.cwd(), 'src/app/agent-agreement.md');
  const md = fs.readFileSync(mdPath, 'utf8');
  const sections = parseMarkdownToSections(md);
  
  return (
    <LegalDocument
      title="Agent Agreement"
      summary="Terms and conditions for Campus&Me External Accommodation Partners (Agents)."
      updatedAt="October 19, 2026"
      sections={sections}
    />
  );
}
