import { describe, expect, it } from 'vitest';
import { answerError, questions, formAction } from '@/lib/questionnaire';

describe('Almatuando questionnaire', () => {
  it('preserves all twelve unique Google fields', () => {
    expect(questions).toHaveLength(12);
    expect(new Set(questions.map(q => q.id)).size).toBe(12);
    expect(formAction).toContain('/formResponse');
  });
  it('requires a response and validates phone numbers', () => {
    const name = questions[0];
    const phone = questions[2];
    if (!name || !phone) throw new Error('Missing required questions');
    expect(answerError(name, ' ', '')).not.toBe('');
    expect(answerError(phone, '123', '')).not.toBe('');
    expect(answerError(phone, '(65) 99999-1234', '')).toBe('');
  });
  it('requires the custom niche only for Other', () => {
    const niche = questions[4];
    if (!niche) throw new Error('Missing niche question');
    expect(answerError(niche, 'Outro', '')).not.toBe('');
    expect(answerError(niche, 'Outro', 'Consultoria')).toBe('');
    expect(answerError(niche, 'Moda', '')).toBe('');
  });
});