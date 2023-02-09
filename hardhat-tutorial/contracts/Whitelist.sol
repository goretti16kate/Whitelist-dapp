//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Whitelist {
    // Max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    //create a mapping of whitelisedAddresses
    // if an address is whitelisted, it will be set to true and false by default for other addresses
    mapping(address => bool) public whitelistedAddresses;

    //numAddressesEhitelisted will be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    // set the Max Num of whitelisted Address in the constructor
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // Function that Adds the Address of the sender to the whitelist
    function addAddressToWhitelist() public {
        // check if the address has already been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // check if the max has been met
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More Addresses cannot be addes, Max reached");
        //Add he address that called the function to the whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;
        // increase the number of whitelstedAddresses
        numAddressesWhitelisted += 1;
    }
}