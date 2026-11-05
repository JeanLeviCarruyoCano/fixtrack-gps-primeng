export function susScore(answers: number[]): number {
  if (answers.length !== 10 || answers.some((a) => !Number.isInteger(a) || a < 1 || a > 5)) {
    throw new Error('El SUS requiere 10 respuestas enteras entre 1 y 5.');
  }
  const contributions = answers.map((value, index) => (index % 2 === 0 ? value - 1 : 5 - value));
  return contributions.reduce((sum, c) => sum + c, 0) * 2.5;
}
