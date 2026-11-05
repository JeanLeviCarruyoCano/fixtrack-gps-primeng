import { DEFAULT_SETTINGS, sanitizeSettings } from './settings.service';

describe('sanitizeSettings', () => {
  it('devuelve los valores por defecto con entradas inválidas', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('x')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({ fontSize: 'enorme', theme: 3 })).toEqual(DEFAULT_SETTINGS);
  });

  it('conserva los valores válidos y descarta los inválidos', () => {
    const result = sanitizeSettings({ fontSize: 'grande', theme: 'oscuro', palette: 'xx', colorBlind: 'tritanopia', reduceMotion: true });
    expect(result).toEqual({
      fontSize: 'grande',
      theme: 'oscuro',
      palette: 'azul',
      colorBlind: 'tritanopia',
      reduceMotion: true,
    });
  });
});
