pragma solidity >=0.4.21 <0.7.0;

contract FoodTrack {
    // Model a Product
    struct Product {
            uint id;
            string name;
            string date;
            string time;
            string productinfo;
    }

    // Store accounts roles
    mapping(address => string) public roles;
    // Store Products
    
    mapping(uint => Product) public products;
    
    uint public productCount;

    // voted event
    event addedProduct (
        uint indexed _productId
    );

    function registerRoles (string memory _role) public {
        //require(roles[msg.sender]!=0);
        roles[msg.sender] = _role;
    }
  
    function addProduct (string memory _name,string memory _date,string memory _time,string memory _productinfo) public {
        productCount ++;
        products[productCount] = Product(productCount, _name,_date,_name,_productinfo);
    }
    
}
