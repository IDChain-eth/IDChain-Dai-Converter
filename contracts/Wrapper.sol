// SPDX-License-Identifier: BSD 2-Clause License

pragma solidity >=0.6.0 <0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/access/Ownable.sol";


/**
 * @dev This is a wrapper for dai tokens on IDChain
 * The approch here is, It gets old bridged DAI and return the new omnibridge's DAI.
 */
contract Wrapper is Ownable {
    using SafeMath for uint256;

    ERC20 internal oldDai;
    ERC20 internal newDai;

    string private constant TRANSFER_FROM_ERROR = "Input token transferFrom failed";
    string private constant TRANSFER_ERROR = "Token transfer failed";

    event DaiWrapped(address account, uint256 amount);
    event WithdrawNewDai(address account, uint256 amount);
    event WithdrawOldDai(address account, uint256 amount);

    /**
     * @dev sets values for
     * @param _oldDai address of old IDChain's DAI token
     * @param _newDai address of new IDChain's DAI token
     */
    constructor(ERC20 _oldDai, ERC20 _newDai) {
        oldDai = _oldDai;
        newDai = _newDai;
    }

    /**
     *@notice wrap oldDai to newDai.
     *@dev A function that gets oldDai and returns newDai
     */
    function wrap()
        external
        returns (bool success)
    {
        uint256 allowance = oldDai.allowance(_msgSender(), address(this));
        uint256 balance = newDai.balanceOf(address(this));
        if (balance < allowance) {
            allowance = balance;
        }

        require(oldDai.transferFrom(_msgSender(), address(this), allowance), TRANSFER_FROM_ERROR);

        require(newDai.transfer(_msgSender(), allowance), TRANSFER_ERROR);

        emit DaiWrapped(_msgSender(), allowance);
        return true;
    }


    /**
     *@dev withdrawal all old DAI to another account
     * @param account Destination account address.
     */
    function withdrawOldDai(address account)
        public
        onlyOwner
    {
        uint256 oldDaiBalance = oldDai.balanceOf(address(this));
        oldDai.transfer(account, oldDaiBalance);

        emit WithdrawOldDai(account, oldDaiBalance);
    }


    /**
     *@dev withdrawal all new DAI to another account
    * @param account Destination account address.
     */
    function withdrawNewDai(address account)
        public
        onlyOwner
    {
        uint256 newDaiBalance = newDai.balanceOf(address(this));
        newDai.transfer(account, newDaiBalance);

        emit WithdrawNewDai(account, newDaiBalance);
    }
}
