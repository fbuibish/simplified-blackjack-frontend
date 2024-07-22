'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { shuffleShoe, drawCards, ICard, calculateHandValue } from '@/utils/cards';

// later can add PUSH
type HandResult = 'WIN' | 'LOSE' | '';

export default function Home() {
  const [deckId, setDeckId] = useState<string>('new');
  const [remainingCards, setRemainingCards] = useState<number>(0);
  const [playerStand, setPlayerStand] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<ICard[]>([]);
  const [dealerHand, setDealerHand] = useState<ICard[]>([]);
  const [handResult, setHandResult] = useState<HandResult>('');
  let displayResultTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialized = useRef(false);

  /*
    This will initialize the shoe at the start and also shuffle since it's the same
    api call
  */
  const initializeShoe = useCallback(async (deckId: string) => {
    try {
      return await shuffleShoe(deckId, 1, setDeckId, setRemainingCards);
    } catch (e) {
      alert('Error suffling the shoe of cards');
    }
  }, []);

  // deal number of cards and shuffle the deck if we run out
  const dealCards = useCallback(async (deckId: string, remaining: number, numberOfCards: number) => {
    if (!deckId) {
      throw 'Deal card action was triggered without a deck';
    }

    try {
      // if we need to shuffle for the next amount of cards
      if (remaining < numberOfCards) {
        await initializeShoe(deckId);
      }

      return await drawCards(deckId, numberOfCards, setRemainingCards);
    } catch (e) {
      alert('There was an error dealing cards, try again later');
      return [];
    }
  }, [initializeShoe])

  const hit = async () => {
    try {
      const [newCard] = await dealCards(deckId, remainingCards, 1);
      setPlayerHand([...playerHand, newCard]);
    } catch (e) {
      alert('There was an error dealing a card, please try again later');
    }
  }

  const stand = () => {
    setPlayerStand(true);
  }

  const renderHand = (cards: ICard[]) => (
    <div className='flex items-center'>
      {
        cards.map((card, index) => (
          <div className='w-32 h-48 bg-card rounded-lg shadow-lg' key={index}>
            <Image src={card.image} alt='' width={226} height={314} />
          </div>
        ))
      }
    </div>
  );

  const dealNewHands = useCallback(async (deckId: string, remaining: number) => {
    if (!deckId) {
      throw 'Deal card action was triggered without a deck';
    }

    try {
      // this will reset the count to 52
      if (remaining < 4) {
        await initializeShoe(deckId);
      }

      const [dealerCard1, dealerCard2, playerCard1, playerCard2] = await dealCards(deckId, remaining, 4);
      setDealerHand([dealerCard1, dealerCard2]);
      setPlayerHand([playerCard1, playerCard2]);
    } catch (e) {
      alert('There was an error dealing new hands, please try again later');
    }

  }, [dealCards, initializeShoe]);

  // component on mount, shuffle the shoe of cards
  useEffect(() => {
    const initializeGame = async () => {
      const deckData = await initializeShoe(deckId);
      if (deckData) {
        dealNewHands(deckData.deckId, deckData.remaining);
      }
    }

    if (!hasInitialized.current) {
      initializeGame();
      hasInitialized.current = true;
    }

    // on unmount let's clear the timeout
    return () => {
      if (displayResultTimeout.current) {
        clearTimeout(displayResultTimeout.current);
      }
    }
  }, [deckId, dealNewHands, initializeShoe]);

  const evaluateGame = useCallback(() => {
    const dealerTotal = calculateHandValue(dealerHand);
    const playerTotal = calculateHandValue(playerHand);

    let result: HandResult = '';

    if (playerTotal > 21) {
      result = 'LOSE';
    }

    if (playerStand) {
      // due to simplified calculation we can handle all the lose totals
      if (playerTotal <= dealerTotal) {
        result = 'LOSE';
      }
      else {
        result = 'WIN';
      }
    }

    if (result) {
      setHandResult(result);

      // after 2 seconds move to next hand
      displayResultTimeout.current = setTimeout(() => {
        setHandResult('');
        setPlayerStand(false);
        setPlayerHand([]);
        setDealerHand([]);
        dealNewHands(deckId, remainingCards);
      }, 2000);
    }
  }, [deckId, remainingCards, playerHand, dealerHand, playerStand, dealNewHands]);

  // due to simplistic game logic, we only need to watch the player hand to evaluate the game
  useEffect(() => {
    evaluateGame();
  }, [playerHand, playerStand, evaluateGame]);

  return (
    <div className='flex flex-col items-center text-center justify-center min-h-screen bg-background p-4'>
      <div>
        {
          !handResult ? <>
            <div className='mb-8'>
              <h1 className='mb-4'>Dealer</h1>
              {renderHand(dealerHand)}
            </div>
            <div className='mb-8'>
              <h2 className='mb-4'>Player</h2>
              {renderHand(playerHand)}
              <div className='flex justify-center space-x-4 mt-4'>
                {
                  // since it's only 2 buttons this is fine in my opinion, if we were to make this into more actions then I would use
                  // a render block and dynamic properties
                }
                <button
                  id='hitButton'
                  className='bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-dark transition duration-300'
                  onClick={hit}>Hit</button>
                <button
                  id='standButton'
                  className='bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-dark transition duration-300'
                  onClick={stand}>Stand</button>
              </div>
            </div>
          </> :
          <div className='mt-8 p-4 bg-background text-white font-bold rounded-lg shadow-lg'>
            <h1>{handResult}</h1>
          </div>
        }
      </div>
    </div>
  );
}
