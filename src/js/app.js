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
      .on('submit', '#form-getBalance', App.handleGetWallet)
      .on('click', '#btn-collectGift', App.handleCollectGift)
      .on('click', '#btn-contractBalance', App.handleContractBalance);
  },

  handleContractBalance: function(event) {
    event.preventDefault();
    App.contracts.BirthdayGift.deployed().then(function(instance) {
      web3.eth.getBalance(instance.address, function(err, balance) {
        return App.showSuccess("The contract balance is " + balance.toNumber());
      })
    });
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
        App.showError("We had trouble finding your account");
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        // Execute as a transaction by sending account
        // return instance.giveAll(donationAmount, {from: account});
        return instance.giveAll({from: account, value: donationAmount});
      }).then(function(result) {
        console.log(result);
        return App.showSuccess("Awesome, thanks for your gift!");
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong.");
      });

    });

  },


  handleDonateWallet: function(event) {
    event.preventDefault();
    App.clearMessages();

    var donationAmount = parseInt($("#walletDonateAmount:input", event.target).val());
    var donationAddress = $("#walletDonateAddress:input", event.target).val();

    if (!App.isValidDonation(donationAmount)) {
      return App.showError("Oops! The amount doesn't look correct.");
      console.error("Donation amount is not valid");
      return false;
    }
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error || accounts[0] == undefined) {
        console.error(error);
        App.showError("We had trouble finding your account");
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        // Execute as a transaction by sending account
        // return instance.giveAll(donationAmount, {from: account});
        return instance.giveTo(donationAddress, {from: account, value: donationAmount});
      }).then(function(result) {
        console.log(result);
        return App.showSuccess("Awesome, " + donationAddress + " thanks you for your gift!");
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong.");
      });

    });

  },


  handleGetWallet: function(event) {
    event.preventDefault();
    App.clearMessages();
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error || accounts[0] == undefined) {
        console.error(error);
        App.showError("We had trouble finding your account");
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        return instance.viewMyGift.call({from: account});
      }).then(function(result) {
        console.log(result);
        return App.showSuccess("Balance for " + account + " is " + result.toNumber());
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong.");
      });

    });

  },


  handleCollectGift: function(event) {
    event.preventDefault();
    App.clearMessages();

    web3.eth.getAccounts(function(error, accounts) {
      if (error || accounts[0] == undefined) {
        console.error(error);
        App.showError("We had trouble finding your account");
        return false;
      }

      var account = accounts[0];

      App.contracts.BirthdayGift.deployed().then(function(instance) {
        // Execute as a transaction by sending account
        // return instance.giveAll(donationAmount, {from: account});
        return instance.collectMyGift({from: instance.account});
      }).then(function(result) {
        console.log(result);
        return App.showSuccess("Happy Birthday! " + account + " recieved " + result.receipt.transactionHash);
      }).catch(function(err) {
        console.error(err.message);
        return App.showError("Oops! Something went wrong collecting your gift.");
      });

    });

  },


  showSuccess: function(msg){
    $("#success h3").text(msg);
  },


  showError: function(msg){
    $("#error h3").text(msg);
  },


  clearMessages: function(){
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
