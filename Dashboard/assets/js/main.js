var oldDaiContract;
var newDaiContract;
var wrapperContract;
var networkId = 1;
var daiAmount = 0

if (window.ethereum) {
  ethereum.autoRefreshOnNetworkChange = false;
  ethereum.on("networkChanged", init);
  ethereum.on("accountsChanged", init);
}

window.addEventListener('load', init);

async function init() {
  await unlockProvider();
  await openModal();
}

async function openModal() {
  business = true;
  $(".dai-step").hide();
  $(".dai-input").show();
  $("#daiModal").modal({
    backdrop: "static",
    keyboard: false
  });
  $(".confirm-icon").hide();
  $(".loader").hide();
}

async function unlockProvider() {
  $body = $("body");
  $body.addClass("loading");
  if (window.ethereum) {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
    web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
    } catch (error) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
    }
  } else {
    window.provider = false;
    Swal.fire({
      type: "error",
      title: "MetaMask is not installed",
      text: "Please install MetaMask from below link",
      footer: '<a href="https://metamask.io">Install MetaMask</a>'
    });
    return;
  }

  await web3.eth.getAccounts(function(error, accounts) {
    if (error != null) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
      return;
    }
    if (accounts.length === 0) {
      window.provider = false;
      Swal.fire({
        type: "info",
        title: "Your wallet provider is locked",
        text: "Please unlock your wallet",
        footer: ""
      });
      return;
    } else {
      web3.eth.defaultAccount = accounts[0];
    }
    web3.eth.net.getId(function(error, id) {
      if (error != null) {
        window.provider = false;
        Swal.fire({
          type: "error",
          title: "Something went wrong",
          text: error.message || error,
          footer: ""
        });
        return;
      }
      networkId = id;
      if (networkId == 74) {
        oldDaiContract = new web3.eth.Contract(abies.oldDai, addresses.oldDai);
        newDaiContract = new web3.eth.Contract(abies.newDai, addresses.newDai);
        wrapperContract = new web3.eth.Contract(abies.wrapper, addresses.wrapper);
        oldDaiContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
          if (error) {
            return;
          }
          daiAmount = result;
          $("#oldDai").html("Old DAI Balance: " + numberDecorator((result / 10 ** 18).toFixed(2)));
        });
        newDaiContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
          if (error) {
            return;
          }
          $("#newDai").html("New DAI Balance: " + numberDecorator((result / 10 ** 18).toFixed(2)));
        });
      } else {
        $(".wrapBtn").hide();
        window.provider = false;
        Swal.fire({
          type: "info",
          title: "Wrong network",
          text: "Please select the IDChain network in your wallet and try again.",
          footer: ""
        });
        $body.removeClass("loading");
        return;
      }
      window.provider = true;
      $body.removeClass("loading");
    });
  });
}

function wrap() {
  newDaiContract.methods.balanceOf(addresses.wrapper).call(function(error, result) {
    if (error) {
      return;
    }
    if (daiAmount == 0) {
      Swal.fire({
        type: "error",
        title: "Error",
        text: `Insufficient balance on ${web3.eth.defaultAccount}`,
        footer: ""
      });
      return;
    } else if (result == 0) {
      Swal.fire({
        type: "error",
        title: "Error",
        text: "Insufficient balance on Wrapper Contract.",
        footer: "Please try again later."
      });
      return;
    } else {
      $(".dai-input").hide();
      $(".dai-step").show();
      changeActiveStep(1);
      oldDaiContract.methods.approve(addresses.wrapper, daiAmount).send({ from: web3.eth.defaultAccount }, function(error, hash) {
        if (error) {
          console.log(error);
          Swal.fire({
            type: "error",
            title: "Something went wrong",
            text: error.message || error,
            footer: ""
          });
          return;
        }
        checkApproveResult(hash, wrapConfirm);
      });
      $("#wrapBtn").prop("disabled", true);
    }
  });
}

function wrapConfirm() {
  wrapperContract.methods.convert().send({ from: web3.eth.defaultAccount }, function(error, hash) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(hash, 'wrap');
  });
}


async function addDai() {
  if (networkId != 74) {
    Swal.fire({
      type: "info",
      title: "Wrong network",
      text: "Please select the main network in your wallet and try again.",
      footer: ""
    });
    $body.removeClass("loading");
    return;
  }

  try {
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: addresses.newDai,
          symbol: 'DAI',
          decimals: 18,
          image: 'https://research.binance.com/static/images/projects/dai/logo.png',
        },
      },
    });

    if (wasAdded) {
      console.log('Thanks for your interest!');
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }
}
