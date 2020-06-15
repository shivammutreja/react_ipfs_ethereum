pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";


contract User is ERC721Full {

  enum Type { Original, Shareable }
  Type internal token_type;

  /* struct UserData {
    string name;
    uint age;
    string sex;
    string genome; //this needs to be unique. Using a random id for now.
    Type tokenType;
  } */

  struct RefUserData {
    uint originalTokenId;
    string name;
    uint age;
    string sex;
    string genome;
    address ownerAddress;
    address sharedWith;
    Type tokenType;
  }

  /* UserData[] public users; */
  RefUserData[] public refUsers;
  mapping (string => bool) _userExists;
  mapping (address => RefUserData) public usersNFT;
  mapping (uint => address) public sharedWithMap;
  /* SharedTokens[] public sharedWith */

  constructor() ERC721Full("User", "USER") public {
  }


  function mint(string memory _userName, uint _userAge, string
    memory _userSex, string memory _userGenome) public {
      require(!_userExists[_userGenome]);

      /* Create original token */
      RefUserData memory newUser = RefUserData({
        originalTokenId: 0,
        name: _userName,
        age: _userAge,
        sex: _userSex,
        genome: _userGenome,
        ownerAddress: msg.sender,
        sharedWith: msg.sender,
        tokenType: Type.Original
        });

      uint _id = refUsers.push(newUser);
      _mint(msg.sender, _id);
      _userExists[_userGenome] = true;
      usersNFT[msg.sender] = newUser;

      /* Create reference token that will be transfered */
      /* RefUserData memory refUser = RefUserData({
        originalTokenId: _id,
        name: _userName,
        age: _userAge,
        sex: _userSex,
        genome: _userGenome,
        ownerAddress: msg.sender,
        tokenType: Type.Shareable
        }); */

      /* uint _refId = refUsers.push(refUser); */

      /* _mint(msg.sender, _refId); //Adding 1 to the index */

  }

  /* function newMint(string memory _userName, uint _userAge, string
    memory _userSex, string memory _userGenome)  */

  /* event checkMap(UserData); */

  function transferFrom(address from, address to, uint256 tokenId) public {
    from = from;
    to = to;
    tokenId = tokenId;
    uint256 index = tokenId - 1;

    /* Take care later. This might be required when we need to fetch
    NFTs for a user from mapping */
    RefUserData memory newToken = RefUserData({
      originalTokenId: tokenId,
      name: refUsers[index].name,
      age: refUsers[index].age,
      sex: refUsers[index].sex,
      genome: refUsers[index].genome,
      ownerAddress: msg.sender,
      sharedWith: to,
      tokenType: Type.Shareable
      });

    uint _refId = refUsers.push(newToken);
    _mint(msg.sender, _refId);

    ERC721.transferFrom(from, to, _refId);
    sharedWithMap[tokenId] = to;

    /* usersNFT[to] = newToken; */
    /* delete usersNFT[from]; */

  }

}
