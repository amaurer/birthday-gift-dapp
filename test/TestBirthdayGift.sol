pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BirthdayGift.sol";

contract TestBirthdayGift {
    BirthdayGift birthdayGiftInstance = BirthdayGift(DeployedAddresses.BirthdayGift());

    function testInitalBalance() public {
        uint returnBalance = birthdayGiftInstance.viewPoolBalance();
        uint expected = 0;
        Assert.equal(returnBalance, expected, "Initial balance should be zero");
    }

    function testGiveAll() public {
        birthdayGiftInstance.send(100);
        uint returnBalance = birthdayGiftInstance.viewPoolBalance();
        uint expected = 100;
        Assert.equal(returnBalance, expected, "Give all 100 should equal 100 balance");
    }


}