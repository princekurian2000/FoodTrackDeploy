App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',  
  loading:false,
  allblocks:[],

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
      App.listenForEvents();
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
    var trackingNumberSelected=parseInt($("#trackingIDSelect").val());
    console.log(trackingNumberSelected);
    var prvInfo = $('#prvInfo');
    prvInfo.empty(); 
    var chainHistory = $("#chainHistory");
    chainHistory.empty();
    prvInfo.append("Loading data from Blockchain...pls wait..."); 
     App.contracts.FoodTrack.deployed().then((foodtrackInstance)=>{
       
      foodtrackInstance.products(trackingNumberSelected).then(function(product) {
        console.log(product);
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
        prvInfo.empty();    
        prvInfo.append(json);  
      });
    });

    //reading history for selected trackID(trackingNumberSelected)        
    App.allblocks.forEach(block => {
      if(block.args._productId.toNumber()==trackingNumberSelected)
      {           
        //getting Roles for each address
        App.contracts.FoodTrack.deployed().then((instance)=>{
            return instance.roles(block.args.owner); 
        }).then((role)=>{
          console.log("Addresses       ");
          console.log(block.args.owner);
          console.log("Role      ");
          console.log(role);
          var str;
          var tooltip=JSON.stringify(block);
          if(role=="1"){
            
            str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";
            //str=block.args.owner+"(Farmer)->";
          }
          else{
            str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";
            //str=block.args.owner+"(InterMediate)->";
          }
          $("#roleAddress").html(block.args.owner);
          chainHistory.append(str);
        });      
        
      }
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

  updtaeByInterMediate: async function() {    
    var prdId=parseInt($("#trackingIDSelect").val());
    var prdDate=$("#newDate").val();
    var prdTime=$("#newTime").val();
    var prdInfo=$("#newPrdInfo").val();       
    var instance=await App.contracts.FoodTrack.deployed();   
    await instance.updateProduct(prdId,prdDate,prdTime,prdInfo );    
    alert("updated   successfully");        
  },

  displayChainHistory: async function() {   
    var initialSelectedId=1; 
      
  },


  //Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.FoodTrack.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.addedProduct({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
         //console.log(event.args);
        //console.log(event);
        //alert(event.args.owner);
        console.log("before inside Event push...");
        console.log(event.args.owner);
        App.allblocks.push(event);
        console.log("after  push... inside Event...");
        App.allblocks.forEach(block => {
          console.log(block.args.owner);
        });
        App.render();
      });
    });
  },

  render: async function() {
    if(App.loading){
      return;
    }
    App.loading=true;
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
    //load accout data 
    if(window.ethereum){
      ethereum.enable().then(function(acc){
          App.account = acc[0];
          $("[id='accountAddress']").html(App.account);
      });
  }    
    App.contracts.FoodTrack.deployed().then(function(instance) {
      foodtrackInstance=instance;
      return instance.roles(App.account);
    }).then(function(role){  
      if(role=="1"){
        App.loading=false;
        loader.hide();
        content.hide();
        farmer.show();
        intermediate.hide();
        endUser.hide();
      }
      else if(role=="2"){
        var initialSelectedId=1;
        var chainHistory = $("#chainHistory");
        chainHistory.empty();
        foodtrackInstance.productCount().then((c)=>{                
            var trackingIDSelect = $('#trackingIDSelect');
            trackingIDSelect.empty();
            var prvInfo = $('#prvInfo');
            prvInfo.empty();
            var flag=0;
            
            for (var i = 1; i <= c; i++) {
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
                if(flag==0){prvInfo.append(json); flag=1;}  
                var trackindId = "<option value='" + id + "' >" + id + "</ option>"
                trackingIDSelect.append(trackindId);                
              });
            }
        });
        //reading history for selected trackID(initialSelectedId)
        App.allblocks.forEach(block => {          
           if(block.args._productId.toNumber()==initialSelectedId)
           {           
             //getting Roles for each address               
            App.contracts.FoodTrack.deployed().then((instance)=>{
                return instance.roles(block.args.owner);
            }).then((role)=>{              
              var str;
              var tooltip=JSON.stringify(block);
              if(role=="1"){                
                str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";             
              }
              else{
                str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";               
              }              
              chainHistory.append(str);  
            });                                            
           }  
          })
        App.loading=false;
        loader.hide();
        content.hide();
        farmer.hide();
        intermediate.show();
        endUser.hide();
        
      }
      else if(role=="3"){
        App.loading=false;
        loader.hide();
        content.hide();
        farmer.hide();
        intermediate.hide();
        endUser.show();
      } 
      else{
        App.loading=false;
        loader.hide();
        content.show();
        farmer.hide();
        intermediate.hide();
        endUser.hide();
      }      
    });  
  }
  
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
