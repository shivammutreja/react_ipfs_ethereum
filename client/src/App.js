import React, { Component } from "react";
import User from "./contracts/User.json";
import getWeb3 from "./getWeb3";
import ipfs from "./ipfs";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null,
    buffer: null, ipfsHash: '', name: '', age: 0, sex: '' };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = User.networks[networkId];
      const instance = new web3.eth.Contract(
        User.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.captureFile = this.captureFile.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
      // window.ethereum.on('accountsChanged', function (state) {
      //   web3.eth.getAccounts(function (error, accounts) {
      //     console.log(accounts[0], 'current account after account change');
      //     this.setState({accounts})
      //   });
      // });
      // console.log(this.state.accounts);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    // const currentAccountIndex = this.state.accounts.index this.state.web3.eth.getCoinbase();
    const totalUsers = await this.state.contract.methods.usersNFT(this.state.accounts[0]).call();
    this.setState({ipfsHash: totalUsers['genome']});
    console.log(this.state.ipfsHash);
  };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;
  //
  //   await contract.methods.set(5).send({ from: accounts[0] });
  //
  //   const response = await contract.methods.get().call();
  //
  //   this.setState({ storageValue: response });
  // };

  captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log("buffer", this.state.buffer);
    }
  }

  handleChange() {
    console.log(this.refs.name.value);
    console.log(this.refs.age.valueAsNumber);
    console.log(this.refs.age.type);
    this.setState({
      "name": this.refs.name.value,
      "age": this.refs.age.value,
      "sex": this.refs.sex.value
    })
  }

  onSubmit(event) {
    event.preventDefault();
    ipfs.files.add(this.state.buffer, (err, result) => {
      if (err) {
        console.error(err);
        return
      }
      this.setState({"ipfsHash": result[0].hash})
      console.log("ipfsHash", this.state.ipfsHash);

      const {contract, name, age, sex, ipfsHash, accounts} = this.state;
      console.log(contract);
      contract.methods.mint(name, age, sex, ipfsHash).send({from: accounts[0] }).then((r) => {
          return this.setState({ ipfsHash: result[0].hash })
        })
      console.log('ifpsHash', this.state.ipfsHash)
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container className="App">
        <h1>Your image</h1>
        <p>The image is stored on IPFS.</p>
        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt="" />
        <h2>Upload Image</h2>
        <Form onSubmit={this.onSubmit}>
          <Form.Group controlId="userName">
            <Form.Control type="text" placeholder="Full Name" onChange={this.handleChange} ref="name" />
          </Form.Group>
          <Form.Group controlId="userAge">
            <Form.Control type="number" placeholder="Age" onChange={this.handleChange} ref="age" />
          </Form.Group>
          <Form.Group controlId="userSex">
            <Form.Control type="text" placeholder="Sex" onChange={this.handleChange} ref="sex" />
          </Form.Group>
          <Form.Group controlId="userFile">
          <Form.File id="custom-file" label="File Input" onChange={this.captureFile} custom />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>

      </Container>
    );
  }
}


export default App;