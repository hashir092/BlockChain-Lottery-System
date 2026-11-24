import { Contract, formatEther, parseEther } from 'ethers';
import LotteryABI from '../contracts/LotteryABI.json';
import { CONTRACT_ADDRESS } from '../config';

export class ContractService {
  constructor(providerOrSigner) {
    this.contract = new Contract(CONTRACT_ADDRESS, LotteryABI, providerOrSigner);
    this.providerOrSigner = providerOrSigner;
  }

  // ---------- Reads ----------
  async getCurrentRoundInfo() {
    const [
      roundId,
      currentJackpot,
      price,
      ticketCount,
      endTime,
      open,
      winner,
      drawn,
    ] = await this.contract.getCurrentRoundInfo();

    return {
      roundId: Number(roundId),
      jackpot: formatEther(currentJackpot),
      jackpotWei: currentJackpot,
      ticketPrice: formatEther(price),
      ticketPriceWei: price,
      ticketCount: Number(ticketCount),
      endTime: Number(endTime),
      entriesOpen: open,
      winner,
      drawn,
    };
  }

  async getOwner() {
    return await this.contract.owner();
  }

  async getTotalTicketsSold() {
    return Number(await this.contract.totalTicketsSold());
  }

  async getTotalWinners() {
    return Number(await this.contract.totalWinners());
  }

  async getPlayerTicketCount(address) {
    return Number(await this.contract.playerTicketCount(address));
  }

  async getPlayerTicketsInRound(address, roundId) {
    return Number(await this.contract.getPlayerTicketsInRound(address, roundId));
  }

  async getRecentWinners(count = 10) {
    try {
      const [roundIds, winners, prizes] = await this.contract.getRecentWinners(count);
      return roundIds.map((id, i) => ({
        roundId: Number(id),
        winner: winners[i],
        prize: formatEther(prizes[i]),
      }));
    } catch (e) {
      console.warn('getRecentWinners failed', e);
      return [];
    }
  }

  async getRound(roundId) {
    const [id, jackpotAmount, winner, ticketCount, endTime, drawn] =
      await this.contract.getRound(roundId);
    return {
      roundId: Number(id),
      jackpot: formatEther(jackpotAmount),
      winner,
      ticketCount: Number(ticketCount),
      endTime: Number(endTime),
      drawn,
    };
  }

  // ---------- Writes ----------
  async buyTickets(quantity, ticketPriceWei) {
    const value = ticketPriceWei * BigInt(quantity);
    const tx = await this.contract.buyTickets(quantity, { value });
    return tx;
  }

  async startRound(durationSeconds) {
    const tx = await this.contract.startRound(durationSeconds);
    return tx;
  }

  async closeEntries() {
    const tx = await this.contract.closeEntries();
    return tx;
  }

  async executeDraw() {
    const tx = await this.contract.executeDraw();
    return tx;
  }

  async setTicketPrice(priceInEth) {
    const wei = parseEther(priceInEth.toString());
    const tx = await this.contract.setTicketPrice(wei);
    return tx;
  }
}

export function createContractService(providerOrSigner) {
  if (!providerOrSigner) return null;
  return new ContractService(providerOrSigner);
}
