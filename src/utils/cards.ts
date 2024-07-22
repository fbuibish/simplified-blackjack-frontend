import React from 'react';
import axios from 'axios';

const CARD_API = 'https://deckofcardsapi.com/api/deck';

export interface ICard {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit:  'CLUBS' | 'DIAMONDS' | 'HEARTS' | 'SPADES';
}

interface IInitializeShoeResponse {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

interface IDrawCardResponse {
  success: boolean;
  deck_id: string;
  cards: ICard[];
  remaining: number;
}

export const shuffleShoe = async (
  deckId: string, 
  numberOfDecks = 1,   
  setDeckId: React.Dispatch<React.SetStateAction<string>>,
  setRemainingCards: React.Dispatch<React.SetStateAction<number>>) => {

  const response = await axios.get<IInitializeShoeResponse>(`${CARD_API}/${deckId}/shuffle/?deck_count=${numberOfDecks}`);
  setDeckId(response.data.deck_id);
  setRemainingCards(response.data.remaining);

  return {
    deckId: response.data.deck_id,
    remaining: response.data.remaining,
  };
};

export const drawCards = async (
  deckId: string, 
  numberOfCards: number,
  setRemainingCards: React.Dispatch<React.SetStateAction<number>>) => {

  const response = await axios.get<IDrawCardResponse>(`${CARD_API}/${deckId}/draw/?count=${numberOfCards}`);
  setRemainingCards(response.data.remaining);

  return response.data.cards;
};

export function calculateHandValue(hand: ICard[]): number {
  let total = 0;
  let aceCount = 0;

  hand.forEach(card => {
    let cardNumber = card.code[0];
    switch (cardNumber) {
      case 'A':
        cardNumber = '1';
        break;
      case '0':
      case 'J':
      case 'Q':
      case 'K':
        cardNumber = '10';
        break;
    }

    const parsedValue = parseInt(cardNumber, 10);
    if (parsedValue > 10) {
      total += 10;
    } else if (parsedValue === 1) {
      total += 11;
      aceCount++;
    } else {
      total += parsedValue;
    }
  });

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return total;
}
