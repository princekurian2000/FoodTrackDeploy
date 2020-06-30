App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',  
    loading:false,
    allblocks:[],
  
    init: async function() {
      return App.initWeb3();
    },
  
    initWeb3: async function() {
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
  
    initContract: async function() {
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
      //console.log("Selected role is=",role);
      var instance=await App.contracts.FoodTrack.deployed();   
      await instance.registerRoles(role, { from: App.account });
      alert("Registered successfully");   
      App.render();     
    },
  
    selectedTrackingNumber:async  function() {    
      var trackingNumberSelected=parseInt($("#trackingIDSelect").val());
      console.log(trackingNumberSelected);
      var prvInfo = $('#prvInfo');
      prvInfo.empty(); 
      var chainHistory = $("#chainHistory");
      chainHistory.empty();           
      
      var prev_info_model = {
                            role:null,
                            address:null,
                            id: null,
                            name: null,
                            date: null,
                            time: null,
                            productinfo: null
                          };  
          
      for(var i=0;i<App.allblocks.length;i++){
        var block= App.allblocks[i];
        if(block.args._productId.toNumber()==trackingNumberSelected)
        {     
              //To append on Prev Info field
              prev_info_model.address=block.args.owner ;
              prev_info_model.id=block.args._productId;
              prev_info_model.name=block.args.name;
              prev_info_model.date=block.args.date;
              prev_info_model.time=block.args.time;
              prev_info_model.productinfo=block.args.productinfo;      
          //getting Roles for each address  
          var foodtrackInstance=await App.contracts.FoodTrack.deployed();
          var roleForChainHistory=await foodtrackInstance.roles(block.args.owner);       
           var str;
           var tooltip=JSON.stringify(block);
           if(roleForChainHistory=="1"){   
            prev_info_model.role="Farmer" ;               
             str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";             
           }
           else{
            prev_info_model.role="InterMediate" ;
             str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";               
           }   
                  
           chainHistory.append(str);  
           prvInfo.append(JSON.stringify(prev_info_model)) ;
           prvInfo.append("\n\r");
           
                                                     
        } 
      }

    },
    selectedTrackingNumberEndUser:async  function() {    
      var trackingNumberSelected=parseInt($("#trackingIDSelectEndUser").val());
      console.log(trackingNumberSelected);
      var prvInfo = $('#prvInfoEndUser');
      prvInfo.empty(); 
      var chainHistory = $("#chainHistoryEndUser");
      chainHistory.empty();
      var prev_info_model = {
                            role:null,
                            address:null,
                            id: null,
                            name: null,
                            date: null,
                            time: null,
                            productinfo: null
                          };  
          
      for(var i=0;i<App.allblocks.length;i++){
        var block= App.allblocks[i];
        if(block.args._productId.toNumber()==trackingNumberSelected)
        {     
              //To append on Prev Info field
              prev_info_model.address=block.args.owner ;
              prev_info_model.id=block.args._productId;
              prev_info_model.name=block.args.name;
              prev_info_model.date=block.args.date;
              prev_info_model.time=block.args.time;
              prev_info_model.productinfo=block.args.productinfo;      
          //getting Roles for each address  
          var foodtrackInstance=await App.contracts.FoodTrack.deployed();
          var roleForChainHistory=await foodtrackInstance.roles(block.args.owner);       
           var str;
           var tooltip=JSON.stringify(block);
           if(roleForChainHistory=="1"){   
            prev_info_model.role="Farmer" ;               
             str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";             
           }
           else{
            prev_info_model.role="InterMediate" ;
             str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";               
           }   
                  
           chainHistory.append(str);  
           prvInfo.append(JSON.stringify(prev_info_model)) ;
           prvInfo.append("\n\r");                   
        } 
      }     
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
    listenForEvents:async  function() {
      App.contracts.FoodTrack.deployed().then(function(instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance.addedProduct({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {  
          //console.log("event captured")  ;             
          App.allblocks.push(event);
          App.render();
        });


        // instance.registeredEvent({}, {
        //   fromBlock: 0,
        //   toBlock: 'latest'
        // }).watch(function(error, event) {  
        //   //console.log("event captured")  ;             
        //   //App.allblocks.push(event);
        //   App.render();
        // });

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
      var foodtrackInstance=await App.contracts.FoodTrack.deployed();
      var role=await foodtrackInstance.roles(App.account);      
        if(role=="1"){ //Farmer
          App.loading=false;
          loader.hide();
          content.hide();
          farmer.show();
          intermediate.hide();
          endUser.hide();
        }
        else if(role=="2"){ //Intermediate
          var initialSelectedId=1;
          var chainHistory = $("#chainHistory");
          chainHistory.empty();
          foodtrackInstance.productCount().then((c)=>{                
              var trackingIDSelect = $('#trackingIDSelect');
              trackingIDSelect.empty();                          
                //Loading all Product ID's from blockchain
                for (var i = 1; i <= c; i++) {
                  foodtrackInstance.products(i).then(function(product) {
                               var id = product[0];                              
                  var trackindId = "<option value='" + id + "' >" + id + "</ option>"
                  trackingIDSelect.append(trackindId);                
                });
              }
          });
          //reading history for selected trackID(initialSelectedId) & Store in Prev Info field
          var prvInfo = $('#prvInfo');
          prvInfo.empty();          
          var prev_info_model = {
                                role:null,
                                address:null,
                                id: null,
                                name: null,
                                date: null,
                                time: null,
                                productinfo: null
                              };         
          for(var i=0;i<App.allblocks.length;i++){
            var block= App.allblocks[i];            
            if(block.args._productId.toNumber()==initialSelectedId)
            {       
              prev_info_model.address=block.args.owner ;
              prev_info_model.id=block.args._productId;
              prev_info_model.name=block.args.name;
              prev_info_model.date=block.args.date;
              prev_info_model.time=block.args.time;
              prev_info_model.productinfo=block.args.productinfo;
              //getting Roles for each address  
              var roleForChainHistory=await foodtrackInstance.roles(block.args.owner);       
               var str;
               var tooltip=JSON.stringify(block);               
               if(roleForChainHistory=="1"){     
                  prev_info_model.role="Farmer" ;                       
                  str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";             
               }
               else{
                  prev_info_model.role="InterMediate" ;                  
                  str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";               
               }              
               chainHistory.append(str); 
               prvInfo.append(JSON.stringify(prev_info_model)) ;
               prvInfo.append("\n\r");                           
            } 
          }
          
          App.loading=false;
          loader.hide();
          content.hide();
          farmer.hide();
          intermediate.show();
          endUser.hide();
          
        }
        else if(role=="3"){ //EndUser

          var initialSelectedId=1;
          var chainHistory = $("#chainHistoryEndUser");
          chainHistory.empty();
          foodtrackInstance.productCount().then((c)=>{                
              var trackingIDSelect = $('#trackingIDSelectEndUser');
              trackingIDSelect.empty();                          
                //Loading all Product ID's from blockchain
                for (var i = 1; i <= c; i++) {
                  foodtrackInstance.products(i).then(function(product) {
                               var id = product[0];                              
                  var trackindId = "<option value='" + id + "' >" + id + "</ option>"
                  trackingIDSelect.append(trackindId);                
                });
              }
          });
          //reading history for selected trackID(initialSelectedId) & Store in Prev Info field
          var prvInfo = $('#prvInfoEndUser');
          prvInfo.empty();          
          var prev_info_model = {
                                role:null,
                                address:null,
                                id: null,
                                name: null,
                                date: null,
                                time: null,
                                productinfo: null
                              };         
          for(var i=0;i<App.allblocks.length;i++){
            var block= App.allblocks[i];            
            if(block.args._productId.toNumber()==initialSelectedId)
            {       
              prev_info_model.address=block.args.owner ;
              prev_info_model.id=block.args._productId;
              prev_info_model.name=block.args.name;
              prev_info_model.date=block.args.date;
              prev_info_model.time=block.args.time;
              prev_info_model.productinfo=block.args.productinfo;
              //getting Roles for each address  
              var roleForChainHistory=await foodtrackInstance.roles(block.args.owner);       
               var str;
               var tooltip=JSON.stringify(block);               
               if(roleForChainHistory=="1"){     
                  prev_info_model.role="Farmer" ;                       
                  str="<button type='button' class='btn btn-primary' title="+tooltip+">Farmer </button>->";             
               }
               else{
                  prev_info_model.role="InterMediate" ;                  
                  str="<button type='button' class='btn btn-primary' title="+tooltip+">InterMediate </button>->";               
               }              
               chainHistory.append(str); 
               prvInfo.append(JSON.stringify(prev_info_model)) ;
               prvInfo.append("\n\r");                           
            } 
          }
          App.loading=false;
          loader.hide();
          content.hide();
          farmer.hide();
          intermediate.hide();
          endUser.show();
        } 


        else{  // if no roles assigned render Registration page
          App.loading=false;
          loader.hide();
          content.show();
          farmer.hide();
          intermediate.hide();
          endUser.hide();
        }      
        
    }
    
  };
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  