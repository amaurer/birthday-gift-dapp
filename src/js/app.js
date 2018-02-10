App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Maybe load wallets?
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BirthdayGift.json', function(BirthdayGiftContract) {
      App.contracts.BirthdayGift = TruffleContract(BirthdayGiftContract);
    
      // Set the provider for our contract
      App.contracts.BirthdayGift.setProvider(App.web3Provider);
    
      // return App.updateWalletCounts();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document)
      .on('submit', '#form-donatePool', App.handleDonatePool)
      .on('submit', '#form-donateWallet', App.handleDonateWallet)
      .on('submit', '#form-getWallet', App.handleGetWallet)
      .on('click', '#btn-collectGift', App.handleCollectGift);
  },

  handleDonatePool: function(event) {
    event.preventDefault();
    App.clearMessages();

    var donationAmount = parseInt($("#poolDonate:input", event.target).val());

    if (!App.isValidDonation(donationAmount)) {
      return App.showError("Oops! The amount doesn't look correct.");
      console.error("Donation amount is not valid");
      return false;
    }
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error || accounts[0] == undefined) {
        console.error(error);
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        // Execute as a transaction by sending account
        return instance.giveAll(donationAmount, {from: account});
      }).then(function(result) {
        console.log(result);
        return App.showSuccess("Awesome, thanks for your gift!");
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong.");
      });

    });

  },

  handleDonateWallet: function(e) {
    event.preventDefault();

  },

  handleGetWallet: function(e) {
    event.preventDefault();
    App.clearMessages();
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error || accounts[0] == undefined) {
        console.error(error);
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        // Execute as a transaction by sending account
        return instance.getGiftBalance({to: account});
      }).then(function(result) {
        console.log(result);
        return App.showBalance(result.message.value);
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong.");
      });

    });
  },

  handleCollectGift: function(e) {
    event.preventDefault();

  },

  showSuccess: function(msg){
    $("#success h3").text(msg);
  },

  showError: function(msg){
    $("#error h3").text(msg);
  },

  showBalance: function(msg){
    $("#birthdayBalance h3").text(msg);
  },

  clearMessages: function(){
    App.showBalance("");
    App.showError("");
    App.showSuccess("");
  },

  isValidDonation: function(val){
    // Make sure value is a number and greater than zero.
    return (val != undefined && val != NaN && val > 0);
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
