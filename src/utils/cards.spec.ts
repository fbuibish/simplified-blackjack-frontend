import { calculateHandValue  } from "./cards";

describe('calculateHandValue()', () => {
  it('should calculate 21', () => {
    const cards = [
      { code: 'AS' },
      { code: '0S' },
    ] as any; // using any here for the sake of speed, but normally would have fully typed

    const handValue = calculateHandValue(cards);

    expect(handValue).toEqual(21);
  });

  it('should calculate 18', () => {
    const cards = [
      { code: 'AS' },
      { code: '0S' },
      { code: '7H' },
    ] as any;

    const handValue = calculateHandValue(cards);

    expect(handValue).toEqual(18);
  });

  it('should calculate 15', () => {
    const cards = [
      { code: 'AS' },
      { code: '2S' },
      { code: '2H' },
    ] as any;

    const handValue = calculateHandValue(cards);

    expect(handValue).toEqual(15);
  });
})
