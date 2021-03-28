$('a[href$="#Modal"]').on("click", function() {
  $('#privacyPolicyModal').modal('show');
});

function changeActiveStep(step) {
  $(".step-box").removeClass("active");
  $(".step-box-" + step).addClass("active done");
  $(".step-box-" + step)
    .find(".loader")
    .show();
  $(".step-box-" + (step - 1))
    .find(".loader")
    .hide();
  $(".step-box-" + (step - 1))
    .find(".confirm-icon")
    .show();
}

function checkTX(hash, type) {
  confirmed = false;
  changeActiveStep(4);
  web3.eth.getTransactionReceipt(hash, function(error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function() {
        checkTX(hash, type);
      }, 5000);
      return;
    }
    if (result.status) {
      isConfirmed(result.blockNumber, type);
    } else {
      changeActiveStep(5);
      Swal.fire({
        type: "error",
        title: "Error",
        text: "There was a problem with the contract execution",
        footer: ""
      });
    }
  });
}

function isConfirmed(txBlockNumber, type) {
  web3.eth.getBlockNumber(function(error, blockNumber) {
    if (error) {
      console.error(error);
      return false;
    } else if (1 <= blockNumber - txBlockNumber) {
      changeActiveStep(5);
      Swal.fire({
        type: "success",
        title: "Success",
        text: "DAIs were Wrapped",
        footer: ""
      });
    } else {
      setTimeout(function() {
        isConfirmed(txBlockNumber, type);
      }, 5000);
      return;
    }
  });
}

function checkApproveResult(hash, cb) {
  changeActiveStep(2);
  web3.eth.getTransactionReceipt(hash, function(error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function() {
        checkApproveResult(hash, cb);
      }, 5000);
      return;
    }
    changeActiveStep(3);
    cb();
  });
}

function numberDecorator(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}