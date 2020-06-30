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

    // event 
    event addedProduct (
        uint indexed _productId,
        address owner,
        string name,
        string date,
        string time,
        string productinfo
    );
    event registeredEvent(
        address owner
    );

    function registerRoles (string memory _role) public {
        require(bytes(roles[msg.sender]).length<=0);
        roles[msg.sender] = _role;
        //emit registeredEvent(msg.sender);
    }
  
    function addProduct (string memory _name,string memory _date,string memory _time,string memory _productinfo) public {
        productCount ++;
        products[productCount] = Product(productCount, _name,_date,_time,_productinfo);
        emit addedProduct(productCount,msg.sender,_name,_date,_time,_productinfo);
    }
    function updateProduct (uint _id,string memory _date,string memory _time,string memory _productinfo) public {
        string memory _name=products[_id].name;
        products[_id] = Product(_id, _name,_date,_time,_productinfo);
        emit addedProduct(_id,msg.sender,_name,_date,_time,_productinfo);
    }
    
}
