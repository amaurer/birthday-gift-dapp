pragma solidity ^0.4.0;

// Example Contract that contributors can give birthday gifts to wallet(s)

// Gifter can send money to all pool
// Gifter can send to specifc address
// Birthdayee can see funds
// Birthdayee will not be transfered until birthday

contract BirthdayGift {

    uint private giftAllBalance = 0;
    uint private numOfWallets = 0;

    struct Birthdayee {
        // fix int
        uint birthDate;
        // fix int
        uint balance;
        // Used to see if address has been initialized
        bool isInitialized;
    }
    
    // All participants
    mapping (address => Birthdayee) private birthdayPool;
    
    // If the wallet hasn't been initialized, then do so and increment counter
    modifier walletCheck(address birthdayeeAddress) {
        if ( isNewAddress(birthdayeeAddress) ) {
            birthdayPool[birthdayeeAddress].isInitialized = true;
            numOfWallets++;
        }
        _;
    }
    
    function isItTheirBirthday(address birthdayeeAddress) private pure returns(bool) {
        // TODO : for now, return true - need to work on dates
        return true;
    }

    // function to control counts of poolf members
    function isNewAddress(address birthdayeeAddress) private view returns(bool) {
        // Has the wallet been initialized?
        if ( birthdayPool[birthdayeeAddress].isInitialized ) {
            return true;
        }
        return false;
    }
    
    function getGiftBalance(address walletAddress) private view returns(uint payout) {
        payout = birthdayPool[walletAddress].balance;
        payout += this.balance / numOfWallets;
    }
    
    // Give to a specific wallet
    function giveTo(address birthdayeeAddress) public payable walletCheck(msg.sender) {
        birthdayPool[birthdayeeAddress].balance += msg.value;
    }
    
    // Give to birthday pool because nice people do exist
    function giveAll() public payable {
        giftAllBalance += msg.value;
    }
    
    // View Birthdayee balance assigned and from pool
    function viewMyGift() public view returns (uint balance) {
        balance = getGiftBalance(msg.sender);
    }
    
    // View Pool balance
    function viewPoolBalance() public view returns (uint balance) {
        balance = giftAllBalance;
    }
    
    // Collect birthday gift if within two weeks of birthday
    function collectMyGift() public walletCheck(msg.sender) returns (uint payout) {
        payout = getGiftBalance(msg.sender);
        require (payout > 0);
        if ( isItTheirBirthday(msg.sender) ) {
            birthdayPool[msg.sender].balance = 0;
            giftAllBalance -= payout;
            msg.sender.transfer(payout);
        } else {
            payout = 0;
        }
    }
    
    // Anon function for paying to the pool
    function () public payable {
        giveAll();
    }


}   