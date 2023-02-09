import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Web3Modal from "web3modal";
import { providers, Contract, Signer} from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITE_CONTRACT_ADDRESS, abi} from "../../constants";
import { Web3Provider } from '@ethersproject/providers';


export default function Home() {
  // walletConnected Keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhiteList keeps track of whether the current metamask address has joined the whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // numberOfWhitelisted tracks the number of addresses whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // create a reference to the web3Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    //connect to metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // if user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerl");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return Web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      // we need a signer here, since it's a write function
      const signer = await getProviderOrSigner(true);
      //create a new instance of the contract with a signer, which allows update methods
      const whitelistContract = new Contract(
        WHITE_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // wait for the transaction to be mined 
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };
  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal
      const provider = await getProviderOrSigner();
      //we only have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITE_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddresseWhitelisted from the contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if the Address is in the Whitelist

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITE_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the Address associated to the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  //connectWallet 
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };
  // Returns a button based on the state of the dapp

  const renderButton = () => {
    if (walletConnected){
      if (joinedWhitelist){
        return (
          <div className={styles.description}>
            Thanks for joining the WhiteList!
          </div>
        );
      } else if (loading){
        return <button className={styles.button}>Loading ......</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the WhiteList
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in the state of the website
  // The array at the end of the function call represents what state changes will trigger this effect

  useEffect(() => {
    // if wallet is not connected, create a new instance of web3Modal and connect the metamask wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Dev!</h1>
        <div className={styles.description}>
          Its an NFT collection for developers in Crypto.
        </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
            </div>
            {renderButton()}
        </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg" />
      </div>
      </div>
      <footer className={styles.footer}>
      Made with &#10084; by k4713
      </footer>
    </div>
  );
}