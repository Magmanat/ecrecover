let walletbook = [
  { Order: "0", Wallet: "0x2F85C00f8ccCAdAfbD4a867D849AfdBb8eD43871" },
];
// {Order: "1", Wallet: "yes"}, {Order: "1", Wallet: "yes"},{Order: "1", Wallet: "yes"},{Order: "1", Wallet: "yes"}
let x = [1];
App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  contractInstance: null,
  msg: "0x0",
  signature: "0x0",

  init: () => {
    return App.initWeb3();
  },
  initWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // for most modern browsers
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // request account unlock
        await ethereum.enable();
        // account unlocked
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        //User denied access
      }
    }
    //old browsers
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      //account exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    //Non dapp
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("Verification.json", (contract) => {
      console.log("contract", contract);
      App.contracts.Verification = TruffleContract(contract);
      App.contracts.Verification.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: () => {
    if (App.loading) {
      return;
    }

    App.loading = true;

    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();

    // Load blockchain data
    console.log(web3.eth.accounts);
    App.account = web3.eth.accounts[0];
    console.log("Your Account:", App.account);

    App.contracts.Verification.deployed()
      .then((contract) => {
        App.contractInstance = contract;
        console.log("ContractInstance", App.contractInstance);
        console.log("Contract Address:", App.contractInstance.address);
        return true;
      })
      .then((val) => {
        $("#account").html(App.account);
        loader.hide();
        content.show();
      });
  },

  signMint: () => {
    $("#content").hide();
    $("#loader").show();

    const message = web3.sha3($("#message").val());
    console.log("message", message);

    web3.eth.sign(App.account, message, function(err, result) {
      $("form").trigger("reset");
      App.msg = message;
      App.signature = result;
      App.contractInstance
        .recover(App.msg, App.signature)
        .then(function(result) {
          console.log("Recover", result);
          $("#address").html("This account signed the message:" + " " + result);
          if (walletbook[x[0] - 1].Wallet !== result) {
            walletbook.push({ Order: x[0], Wallet: result });
            let table = document.querySelector("table");
            generateTable(table, walletbook, x);
            x[0] += 1;
          } else {
            $("#error").html(
              "This wallet already signed nft maximum number of times(1)"
            );
          }
        })

        .catch((err) => {
          console.error(err);
          window.alert("There was an error recovering signature.");
        });
      window.alert("wallet address is queued!");
    });

    $("#verify").show();
    $("#content").show();
    $("#loader").hide();
  },
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});

function generateTableHead(table, data, position) {
  if (position === 1) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.setAttribute("align", "center");
      row.setAttribute("align", "center");
      th.appendChild(text);
      row.appendChild(th);
    }
  } else {
    return;
  }
}

function generateTable(table, data, position) {
  let row = table.insertRow();
  console.log(data[position[0]]);
  let cell = row.insertCell();
  let cell2 = row.insertCell();
  let text = document.createTextNode(data[position[0]].Order);
  let text2 = document.createTextNode(data[position[0]].Wallet);
  cell.setAttribute("align", "center");
  cell.appendChild(text);
  cell2.setAttribute("align", "center");
  cell2.appendChild(text2);
}
let table = document.querySelector("table");
let data = Object.keys(walletbook[0]);
generateTableHead(table, data, 1);
