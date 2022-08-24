// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

contract Event is Ownable, Pausable, ERC1155, ERC1155Supply{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenSupply;
    
    string baseURI;
    string name_;
    uint256 amountOfTickets;
    uint256 costPerTicket;

    event Mint(uint256 indexed id, address indexed account, uint256 amount);

    constructor(
        string memory _name,
        string memory _uri,
        uint256 _amountOfTickets,
        uint256 _costPerTicket) ERC1155(_uri) {
        baseURI = _uri;
        amountOfTickets = _amountOfTickets;
        costPerTicket = _costPerTicket;
        name_ = _name;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function name() public view returns (string memory) {
        return name_;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function mint(uint256 _amount, uint8 _id) public payable {
        require(_amount > 0, "Amount of tickets must be greater than 0.");
        require(_amount <= 3, "Cannot mint more than 3 tickets."); // can customize this per host preference
        uint256 mintIndex = _tokenSupply.current() + _amount;
        require(mintIndex <= amountOfTickets, "not enough tickets");
        require(_amount + balanceOf(msg.sender, _id) < 3, "Only 3 tickets per wallet."); // can customize
        require(msg.value >= costPerTicket * _amount);

        for (uint256 i = 0; i < _amount; i++) {
            _tokenSupply.increment();
        }
        _mint(msg.sender, 0, _amount, " ");
        emit Mint(_id, msg.sender, _amount);
    }

    function ticketsMinted() public view returns (uint256) {
        return _tokenSupply.current();
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success);
    }
}

contract CreateEvent {

    event EventCreated(string indexed name, uint256 amountOfTickets, uint256 costPerTicket);

    function create(
        string memory _name,
        string memory _uri,
        uint256 _amountTickets,
        uint256 _costPerTicket) public {
        new Event(_name, _uri, _amountTickets, _costPerTicket);
        emit EventCreated(_name, _amountTickets, _costPerTicket);
    }

}