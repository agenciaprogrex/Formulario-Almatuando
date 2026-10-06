export const formAction = 'https://docs.google.com/forms/d/e/1FAIpQLSeaJ4K2sBat0DSEbsNiprEDmYmy0AIaB4vzlpMTYgR53CrCeg/formResponse';

export type Question = { id: string; title: string; type: 'text' | 'tel' | 'long' | 'choice'; placeholder?: string; options?: string[]; other?: boolean };
export const questions: Question[] = [
  { id: '434810380', title: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo' },
  { id: '710191863', title: 'Faturamento/renda mensal', type: 'choice', options: ['5k a 10k', '11k a 25k', '26k a 40k', '50k +'] },
  { id: '872150828', title: 'Telefone para contato', type: 'tel', placeholder: '(00) 00000-0000' },
  { id: '408480384', title: 'Cidade / Estado', type: 'text', placeholder: 'Sua cidade / UF' },
  { id: '671491852', title: 'Qual o nicho da sua empresa/marca?', type: 'choice', options: ['Moda', 'Beleza', 'Arquitetura', 'Outro'], other: true },
  { id: '2044478792', title: 'Qual o @ da sua empresa?', type: 'text', placeholder: '@suaempresa' },
  { id: '1835913488', title: 'Em quais canais de comunicação a sua empresa está? (Exemplo: Instagram, TikTok, e-mail marketing…)', type: 'long', placeholder: 'Instagram, TikTok, e-mail marketing…' },
  { id: '489145758', title: 'Qual a maior dificuldade hoje na sua empresa?', type: 'text', placeholder: 'Conte para nós' },
  { id: '1688116440', title: 'Já teve alguém responsável pelo marketing da sua empresa antes?', type: 'choice', options: ['Sim', 'Não'] },
  { id: '1000300813', title: 'Nos conte um pouco sobre o seu negócio/você:', type: 'long', placeholder: 'Toda história tem um começo. Qual é o seu?' },
  { id: '611871472', title: 'Qual serviço você busca?', type: 'text', placeholder: 'O que você está buscando?' },
  { id: '682154503', title: 'Como conheceu nosso trabalho?', type: 'choice', options: ['Instagram', 'Indicação', 'Vi um trabalho que fizeram'] },
];

export function answerError(question: Question, value: string, other: string) {
  if (!value.trim() || (question.other && value === 'Outro' && !other.trim())) return 'Preencha sua resposta para continuar.';
  if (question.type === 'tel' && (value.replace(/\D/g, '').length < 10 || value.replace(/\D/g, '').length > 15)) return 'Informe um telefone válido, com DDD.';
  return '';
}