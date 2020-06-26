App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("FoodTrack.json", function(foodtrack) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.FoodTrack = TruffleContract(foodtrack);
      // Connect provider to interact with contract
      App.contracts.FoodTrack.setProvider(App.web3Provider);

      //App.listenForEvents();

      return App.render();
    });
  },

  registerRole: async function() {
    var role=$("#RoleSelect").val();
    console.log("Selected role is=",role);
    var instance=await App.contracts.FoodTrack.deployed();   
    await instance.registerRoles(role, { from: App.account });
    alert("Registered successfully");        
  },

  selectedTrackingNumber:  function() {
    var trackingNumberSelected=$("#trackingIDSelect").val();
    prvInfo.empty(); 
    prvInfo.append("Loading data from Blockchain...pls wait..."); 
     App.contracts.FoodTrack.deployed().then((foodtrackInstance)=>{
      foodtrackInstance.products(trackingNumberSelected).then(function(product) {
        var id = product[0];
        var name = product[1];
        var date = product[2];
        var time = product[3];
        var productinfo = product[4];
        let productjson = {
          id: id,
          name: name,
          date: date,
          time: time,
          productinfo: productinfo
        };                
        let json = JSON.stringify(productjson);      
        prvInfo.append(json); 
        var trackindId = "<option value='" + id + "' >" + id + "</ option>"
        prvInfo.empty(); 
        trackingIDSelect.append(trackindId);
      });

     });

  },
  addProductByFarmer: async function() {
    var prdName=$("#prdName").val();
    var prdDate=$("#prdDate").val();
    var prdTime=$("#prdTime").val();
    var prdInfo=$("#prdInfo").val();       
    var instance=await App.contracts.FoodTrack.deployed();   
    await instance.addProduct(prdName,prdDate,prdTime,prdInfo );
    
    alert("Added  successfully");
        
  },


  // Listen for events emitted from the contract
  // listenForEvents: function() {
  //   App.contracts.FoodTrack.deployed().then(function(instance) {
  //     // Restart Chrome if you are unable to receive this event
  //     // This is a known issue with Metamask
  //     // https://github.com/MetaMask/metamask-extension/issues/2393
  //     instance.addedProduct({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered", event)
  //       //
  //       App.render();
  //     });
  //   });
  // },

  render: function() {
    var foodtrackInstance;
    var loader = $("#loader");
    var content = $("#content");
    var farmer = $("#farmer");
    var intermediate = $("#intermediate");
    var endUser = $("#endUser");


    loader.show();
    content.hide();
    farmer.hide();
    intermediate.hide();
    endUser.hide();

    // Load account data
    // web3.eth.getCoinbase(function(err, account) {
    //   if (err === null) {
    //     App.account = account;
    //     $("#accountAddress").html("Your Account: " + account);
    //   }
    // });
    if(window.ethereum){
      ethereum.enable().then(function(acc){
          App.account = acc[0];
          $("[id='accountAddress']").html(App.account);
      });
  }
    //alert(web3.currentProvider.selectedAddress);
    //alert(web3.eth.getAccounts());
    //$("#accountAddress").html("Your Account: " + web3.currentProvider.selectedAddress);

    App.contracts.FoodTrack.deployed().then(function(instance) {
      foodtrackInstance=instance;
      return instance.roles(App.account);
    }).then(function(role){  
      if(role=="1"){
        loader.hide();
        content.hide();
        farmer.show();
        intermediate.hide();
        endUser.hide();
      }
      else if(role=="2"){

        foodtrackInstance.productCount().then((c)=>{                
            var trackingIDSelect = $('#trackingIDSelect');
            trackingIDSelect.empty();
            var prvInfo = $('#prvInfo');
            prvInfo.empty();
      
            for (var i = 1; i <= i; i++) {
              foodtrackInstance.products(i).then(function(product) {
                var id = product[0];
                var name = product[1];
                var date = product[2];
                var time = product[3];
                var productinfo = product[4];
                let productjson = {
                  id: id,
                  name: name,
                  date: date,
                  time: time,
                  productinfo: productinfo
                };                
                let json = JSON.stringify(productjson);      
                prvInfo.append(json);        
                //prvInfo.append("id="+id+",name="+name+",date="+date+",time="+time+",productinfo="+productinfo);             
                var trackindId = "<option value='" + id + "' >" + id + "</ option>"
                trackingIDSelect.append(trackindId);
              });
            }
        });
        loader.hide();
        content.hide();
        farmer.hide();
        intermediate.show();
        endUser.hide();
      }
      else if(role=="3"){
        loader.hide();
        content.hide();
        farmer.hide();
        intermediate.hide();
        endUser.show();
      } 
      else{
        loader.hide();
        content.show();
        farmer.hide();
        intermediate.hide();
        endUser.hide();
      }
      
    });
    // // Load contract data
    // App.contracts.FoodTrack.deployed().then(function(instance) {
    //   foodtrackInstance = instance;
    //   return foodtrackInstance.candidatesCount();
    // }).then(function(candidatesCount) {
    //   var candidatesResults = $("#candidatesResults");
    //   candidatesResults.empty();

    //   var candidatesSelect = $('#candidatesSelect');
    //   candidatesSelect.empty();

    //   for (var i = 1; i <= candidatesCount; i++) {
    //     foodtrackInstance.candidates(i).then(function(candidate) {
    //       var id = candidate[0];
    //       var name = candidate[1];
    //       var voteCount = candidate[2];

    //       // Render candidate Result
    //       var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
    //       candidatesResults.append(candidateTemplate);

    //       // Render candidate ballot option
    //       var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
    //       candidatesSelect.append(candidateOption);
    //     });
    //   }
    //   return foodtrackInstance.voters(App.account);
    // }).then(function(hasVoted) {
    //   // Do not allow a user to vote
    //   if(hasVoted) {
    //     $('form').hide();
    //   }
    //   loader.hide();
    //   content.show();
    // }).catch(function(error) {
    //   console.warn(error);
    // });
  },

  // castVote: function() {
  //   var candidateId = $('#candidatesSelect').val();
  //   App.contracts.Election.deployed().then(function(instance) {
  //     return instance.vote(candidateId, { from: App.account });
  //   }).then(function(result) {
  //     // Wait for votes to update
  //     $("#content").hide();
  //     $("#loader").show();
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
