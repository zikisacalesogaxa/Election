App = {
  web3Provider: null,
  contracts: {},

  init: async  () => {
    return await App.initWeb3();
  },

  initWeb3: async  () => {
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

      App.listenForEvents();

      return App.render();
    });
  },

  render: () => {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase( (err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then( (instance) => {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then( (candidatesCount) => {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then( (candidate) => {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then( (hasVoted) => {
      // Do not allow a user to vote
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch( (error) => {
      console.warn(error);
    });
  },

  castVote: () => {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed().then( (instance) => {
      return instance.vote(candidateId, { from: App.account });
    }).then( (result) => {
      $("#content").hide();
      $("#loader").show();
    }).catch( (err) => {
      console.error(err);
    });
  },

  listenForEvents: () => {
    App.contracts.Election.deployed().then( (instance) => {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch( (error, event) => {
        console.log("event triggered", event);
        App.render();
      });
    });
  }
};

$( () => {
  $(window).load( () => {
    App.init();
  });
});
