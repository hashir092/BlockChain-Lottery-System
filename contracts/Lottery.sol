// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LotteryChain
 * @notice Premium decentralized lottery contract
 * @dev Owner can start rounds, close entries, and execute draws.
 *      Players buy tickets. Winner is selected via pseudo-randomness
 *      (for demo / local Anvil). In production replace with VRF.
 */
contract Lottery {
    // ============ State ============
    address public owner;
    uint256 public ticketPrice;
    uint256 public currentRound;
    uint256 public jackpot;
    uint256 public totalTicketsSold;
    uint256 public totalWinners;
    bool public entriesOpen;
    uint256 public roundEndTime;

    struct Round {
        uint256 roundId;
        uint256 jackpotAmount;
        address winner;
        uint256 ticketCount;
        uint256 endTime;
        bool drawn;
    }

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => address[]) public roundTickets; // roundId => list of ticket owners
    mapping(address => uint256[]) public playerTickets; // player => list of ticket IDs they own (global)
    mapping(address => uint256) public playerTicketCount;
    mapping(uint256 => mapping(address => uint256)) public ticketsPerPlayerInRound;

    // ============ Events ============
    event RoundStarted(uint256 indexed roundId, uint256 ticketPrice, uint256 endTime);
    event TicketPurchased(address indexed player, uint256 indexed roundId, uint256 quantity, uint256 totalPaid);
    event EntriesClosed(uint256 indexed roundId);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prize);
    event PrizeClaimed(address indexed winner, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenEntriesOpen() {
        require(entriesOpen, "Entries closed");
        require(block.timestamp < roundEndTime, "Round ended");
        _;
    }

    // ============ Constructor ============
    constructor(uint256 _ticketPrice) {
        owner = msg.sender;
        ticketPrice = _ticketPrice;
        currentRound = 0;
        entriesOpen = false;
    }

    // ============ Admin Functions ============
    function startRound(uint256 durationInSeconds) external onlyOwner {
        require(!entriesOpen, "Round already open");
        currentRound += 1;
        entriesOpen = true;
        roundEndTime = block.timestamp + durationInSeconds;
        jackpot = 0;

        rounds[currentRound] = Round({
            roundId: currentRound,
            jackpotAmount: 0,
            winner: address(0),
            ticketCount: 0,
            endTime: roundEndTime,
            drawn: false
        });

        emit RoundStarted(currentRound, ticketPrice, roundEndTime);
    }

    function closeEntries() external onlyOwner {
        require(entriesOpen, "Already closed");
        entriesOpen = false;
        emit EntriesClosed(currentRound);
    }

    function executeDraw() external onlyOwner {
        require(!entriesOpen, "Close entries first");
        require(currentRound > 0, "No round");
        require(!rounds[currentRound].drawn, "Already drawn");

        address[] storage tickets = roundTickets[currentRound];
        require(tickets.length > 0, "No tickets sold");

        // Pseudo-random for local/demo. Production: use Chainlink VRF
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    tickets.length,
                    msg.sender
                )
            )
        ) % tickets.length;

        address winner = tickets[randomIndex];
        uint256 prize = jackpot;

        rounds[currentRound].winner = winner;
        rounds[currentRound].jackpotAmount = prize;
        rounds[currentRound].drawn = true;
        totalWinners += 1;

        // Transfer prize
        jackpot = 0;
        (bool success, ) = payable(winner).call{value: prize}("");
        require(success, "Prize transfer failed");

        emit WinnerSelected(currentRound, winner, prize);
        emit PrizeClaimed(winner, prize);
    }

    function setTicketPrice(uint256 _price) external onlyOwner {
        require(!entriesOpen, "Cannot change during open round");
        ticketPrice = _price;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Emergency withdraw (only if no open round and jackpot remains)
    function emergencyWithdraw() external onlyOwner {
        require(!entriesOpen, "Round open");
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // ============ Player Functions ============
    function buyTickets(uint256 quantity) external payable whenEntriesOpen {
        require(quantity > 0, "Quantity zero");
        require(msg.value == ticketPrice * quantity, "Incorrect payment");

        for (uint256 i = 0; i < quantity; i++) {
            roundTickets[currentRound].push(msg.sender);
            totalTicketsSold += 1;
        }

        jackpot += msg.value;
        rounds[currentRound].ticketCount += quantity;
        rounds[currentRound].jackpotAmount = jackpot;
        ticketsPerPlayerInRound[currentRound][msg.sender] += quantity;
        playerTicketCount[msg.sender] += quantity;

        emit TicketPurchased(msg.sender, currentRound, quantity, msg.value);
    }

    // ============ View Functions ============
    function getCurrentRoundInfo()
        external
        view
        returns (
            uint256 roundId,
            uint256 currentJackpot,
            uint256 price,
            uint256 ticketCount,
            uint256 endTime,
            bool open,
            address winner,
            bool drawn
        )
    {
        Round memory r = rounds[currentRound];
        return (
            currentRound,
            jackpot,
            ticketPrice,
            r.ticketCount,
            roundEndTime,
            entriesOpen,
            r.winner,
            r.drawn
        );
    }

    function getRound(uint256 roundId)
        external
        view
        returns (
            uint256 id,
            uint256 jackpotAmount,
            address winner,
            uint256 ticketCount,
            uint256 endTime,
            bool drawn
        )
    {
        Round memory r = rounds[roundId];
        return (r.roundId, r.jackpotAmount, r.winner, r.ticketCount, r.endTime, r.drawn);
    }

    function getPlayerTicketsInRound(address player, uint256 roundId)
        external
        view
        returns (uint256)
    {
        return ticketsPerPlayerInRound[roundId][player];
    }

    function getTicketsSoldInRound(uint256 roundId) external view returns (uint256) {
        return roundTickets[roundId].length;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getRecentWinners(uint256 count)
        external
        view
        returns (uint256[] memory roundIds, address[] memory winners, uint256[] memory prizes)
    {
        uint256 found = 0;
        uint256 max = currentRound < count ? currentRound : count;

        roundIds = new uint256[](max);
        winners = new address[](max);
        prizes = new uint256[](max);

        for (uint256 i = currentRound; i >= 1 && found < max; i--) {
            if (rounds[i].drawn && rounds[i].winner != address(0)) {
                roundIds[found] = i;
                winners[found] = rounds[i].winner;
                prizes[found] = rounds[i].jackpotAmount;
                found++;
            }
            if (i == 1) break;
        }

        // Resize if needed (simple approach for demo)
        if (found < max) {
            uint256[] memory r2 = new uint256[](found);
            address[] memory w2 = new address[](found);
            uint256[] memory p2 = new uint256[](found);
            for (uint256 j = 0; j < found; j++) {
                r2[j] = roundIds[j];
                w2[j] = winners[j];
                p2[j] = prizes[j];
            }
            return (r2, w2, p2);
        }
        return (roundIds, winners, prizes);
    }
}
