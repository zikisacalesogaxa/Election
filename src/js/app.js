App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // if a web3 is already provided by meta mask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // default instance if no web3 instance
      App.web3Provider = new Web3.providers.HttProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", (election) => {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: () => {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // load account data
    web3.eth.getCoinbase( (err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // load contract data
    App.contracts.Election.deployed().then( (instance) => {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then( (candidatesCount) => {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for ( var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then( (candidate) => {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
          candidatesResults.append(candidateTemplate);
        });
      }

      loader.hide();
      content.show();

    }).catch( (error) => {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
