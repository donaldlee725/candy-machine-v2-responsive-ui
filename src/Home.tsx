import {useEffect, useState} from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {GatewayProvider} from '@civic/solana-gateway-react';
import Countdown from "react-countdown";
import {Snackbar, Paper} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {toDate, AlertState, getAtaForMint} from './utils';
import {MintButton} from './MintButton';
import {
    CandyMachine,
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken,
    CANDY_MACHINE_PROGRAM,
} from "./candy-machine";

const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString() : 9;

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const WalletAmount = styled.div`
  color: black;
  width: auto;
  padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 22px;
  background-color: var(--main-text-color);
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #4E44CE;
  margin: 0 auto;
`;

const Card = styled(Paper)`
  display: inline-block;
  margin: 5px;
  min-width: 40px;
  padding: 24px;
  h1{
    margin:0px;
  }
`;

const MintButtonContainer = styled.div`
  button.MuiButton-contained:not(.MuiButton-containedPrimary).Mui-disabled {
    color: #464646;
  }

  button.MuiButton-contained:not(.MuiButton-containedPrimary):hover,
  button.MuiButton-contained:not(.MuiButton-containedPrimary):focus {
    -webkit-animation: pulse 1s;
    animation: pulse 1s;
    box-shadow: 0 0 0 2em rgba(255, 255, 255, 0);
  }

  @-webkit-keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #3f7eeb;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #3f7eeb;
    }
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;

  img {
    height: 60px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 0 auto;

  li {
    margin: 0 12px;

    a {
      color: var(--main-text-color);
      list-style-image: none;
      list-style-position: outside;
      list-style-type: none;
      outline: none;
      text-decoration: none;
      text-size-adjust: 100%;
      touch-action: manipulation;
      transition: color 0.3s;
      padding-bottom: 15px;

      img {
        max-height: 26px;
      }
    }

    a:hover, a:active {
      color: rgb(131, 146, 161);
      border-bottom: 4px solid var(--title-text-color);
    }

  }
`;

const SolExplorerLink = styled.a`
  color: var(--title-text-color);
  border-bottom: 1px solid var(--title-text-color);
  font-weight: bold;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;

  :hover {
    border-bottom: 2px solid var(--title-text-color);
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 4%;
  margin-left: 4%;
  text-align: center;
  justify-content: center;
  background: "blue";
`;

const whitelistList = [
    "2kYnGoaXcksThoe4wFdyf8qnbmUjvM58NVuP8vgwPBeh",
"2pFqj4rjxXW9u3A7BPBcRh7jcWnTvEPuBC2mk9tKh82T",
"58F59ATk6dWyh6TiLx7sZSnj98i5Gzqe4Cau1Sf9mks5",
"5SNZH3EovVoP76bXd9EWgDe1JQMjuVdadNboVuSmcvhJ",
"6aNnHK7Xju2UrpAgS7WqNqZoCFN4RmNgwj29jTDjYLUA",
"9Futrj9BV25nvjW7uAv2S5TUzyzPRtQjxDcNzCjt1st1",
"Ee9wKwVv1RghzvU13WsaM7U2vsiTcR2YWM2YMfv6r7X6",
"FFVD9v1bFbuV7ak4CgVYMfvZpaed51FsD9RsGXzX6Tdh",
"FgH8dzACWbUQKnjpzYRSMPyZjh8cfCLP9adSYLTx8Q2k",
"FQmxqQcqDwujeUCWyPncyjf3zDKJwBJg5tn74CzTTDP8",
"GsiuNTxbcbNC1RC691kWcpkwqnrMZduvVDExyD9r4byy",
"Gz6y3HS1ajg61y4SDeopv8x1qxhb2Su9TKpAVNebpRAy",
"HkMSyNmjaFVdh4a81mQo8G71P5BgCxYVRxXH21eBVVDD",
"QCKinwcWrBckQcE6ycgxtXkC18X34LowTJ8ay2Bi1KY",
"DQGW3XrNtNciWJrtA5os6Kndy8vvr7z3Dz1xKhCsr9L3",
"8v81brHNS33VDRBMRGjtSVw3n8CdmzyREHbYJfUSWaT1",
"Esdhs6i7Lx4WUSdrQEhG4QXWhsrGMkkZVHQu1gPvWz8F",
"7ikiQgzB93iAdasjnCA2BBwMDFuEssfxXPyPt4F8VMmg",
"Dr5wHGtozD6jrMFTQKHRBCnCVGPA6d6DHxZsSiNkdFE9",
"8r2hNSQmmby7KMbzLqDEu9eJoHL5ik4uqgusktMDFMWS",
"25m7LLUrmVGcgkkdFVBbDD7tTBU3e9UxscWdnm6196k3",
"HHZ7Ts8ULQVW6ApnPAdbW1rW3ZgNe3Hsbks6CA3UaE1p",
"87h4KyimQX9MeLRHpK9wn3ws2c7CrJjbkydTSyev8CCH",
"5pPNCG8FPbACPaHCNX6KZdkjRYX3vK329TjurTLMAvgi",
"GFWLqWAiFsiaSvAD85PDVRGCkHtpUFauLx7aDtJJZqAC",
"GEehF982WJeTMCLoccJKtChbUdGqagMNCBxUY2p1u7Mc",
"8ZqhC8wA6wK2TXr6cJpB1XaCkUqPk1jARXR5GMNUwZ6e",
"HxJaudqYYXMiZSGPRuDSfDn87QZsrxeubBznJa9b4pWc",
"GoUUz3FFsLYkuyVppfKCSVQCEEgT7c9Pxu6saoq9tSxV",
"FCtzGgxNCYzjuam6fREfaDCTqjysysadtS1gB5wQENom",
"4KUwTVkudmxeU4yV4fpuSjWDPcYgkLYSiTqXg8hBf2Ji",
"9WYDPsWspN7t6fXZCFu2QEQT7NSCri99tyod1xy5EwuL",
"DHcutxV1eY4FatduUo5jAZz9p4nST8ephmmYQUqBswj6",
"CKWSR3QHE7i3ojPL6WBL4z241SVGsEnoLWqfC3RTvE6R",
"CjQ5hrqF3Hd4yqv4ZGQqtcnjC15K7rEXeWvVgpCNBeSf",
"2DURLrJDQNKeAgVaorTRVW3ZHgYiUFFMQqwNaMKkoPCo",
"HiG7KsRRsgHu7766v8euUVmCagNvbbnPBRQ75mzd1JKF",
"J4TGHNusK4dMs1rsLR3T9NdJ6pRiL3rQwGMzmbC7zSnm",
"FPq5v4EvFxtwiHuPjr9T29o7Hh2irDnZbERr7NvnU3Pq",
"CdCwpBcam5ZRmeTcB6ow9TzZr8ykoXwf7JTjKc8dGcou",
"4GR6zuKbN1n1nXu9UnJaXEVgRyyEKg7B1R2eM14CtMKS",
"HzUCDzgReHRGDLgitPvu65Dz6opQ7qZqVEMNV3v6osbS",
"Ae1DGx9XdhC3jP1hzudBnZ6rrFZT7CWWDcurvUpXCBH4",
"YpKDW4noWR4b4T2xkZsFYh7Pxt6CxW2oQLZpzW5KPhV",
"6VvCqN3aWpJMkbKDLT1MKV1XW9AYGeRHHe2qacE8kq4V",
"5pXzKzzNbhUAZHoSmBDMhXd187pwJ78BGyx3ahwEKYxS",
"9u5x1Ho8K4KQGXXDgv6PAznL5NAmzWJeU9awndMeZxyi",
"ABgFSeu5q7pVuLYY2ZrFmnBjHnzSLLbK6qEiXcyw4osi",
"4YJctZcyvNvsAut4wpbmGPDJthMgUVjmfmVYzWVg5d9q",
"AAbPk6bkfWpWwd6MdUaEK6uFs81QVmRfH5L4Lbsnnkub",
"AG4z4azS41KuQ3ppWqdeSGfjrGPzyhBGEvxvUxqycfQU",
"7RasVVed592UyLqx22QJNxS26MCCGLmqJFxWPkPuFrLy",
"FGug6Go5a5SVzgp7oriwCU1sKyAgjfgQwjuowzvWSfpF",
"EKhN9xM9DiQ6mVchAKbK7uVBZKMJw7zSvWSZRaQcA33y",
"EPbtFvGGX2ndbXR9PYhUHQf3HUf3mHmWUckNvCErEsKC",
"9aJ418VDHJEbrMpiSJFnfjWHa8q2hn5CWDXRcE1hDWW9",
"FNxmvRgovAKqaQiy3TbCB7JUf6Rvyvd95xDBm64DQe6U",
"ETjA9ziT3JAoQpkSR3L3cLZJ1d8DmM6tQg45koxDnf8K",
"HpoxU45Hsp3fYgLuPVYeaPbotrb8qtAKfTTLBH4xyhvr",
"EKhN9xM9DiQ6mVchAKbK7uVBZKMJw7zSvWSZRaQcA33y",
"23SR7oxU6YSmDcChpetMgUiMNLcsBXaWQ4BPndJL5XGi",
"FGug6Go5a5SVzgp7oriwCU1sKyAgjfgQwjuowzvWSfpF",
"23SR7oxU6YSmDcChpetMgUiMNLcsBXaWQ4BPndJL5XGi",
"8iVgn3ZnirzoLgET3Sr5D8P7orYArqaFBRRCbRfAyMug",
"gT1tAzCuKFisGJVypvi5XXehXDQpqQcrpYJfaDrfQjB",
"CmEkegNVDrzFcTatjyAo42KGHhFm2XuhkH11Rh38z7e9",
"46kUoXBy8pfAeZ8Fv3Xix7PpJsZ4pzGVXKDDFWwDUhCP",
"4dYtHp9Yku8UywuZ62A8zCcDFtY6BuR9D1aYtT8L68Lq",
"FHd3UvduepBBzaTL3RF4v2a8LmfR4dAAFDqhVkGGAQku",
"6MAvbCRkN9KSPqi9ehFDy4BPCqS23h2TmgaLwsq6XryB",
"9cbZMYbie6w6oKnwjEWyxegqLpq1tYy3uAeiBmt4QWq1",
"CmEkegNVDrzFcTatjyAo42KGHhFm2XuhkH11Rh38z7e9",
"Cgm96Dwq2LuviwyWUjVNsM44V2xyEnFV3kFrMWwFuZAE",
"DEFX2iHxQWrLioAyPxvkU7qQ2VA43XwDrrhF2KXHY1Pj"
];

export interface HomeProps {
    candyMachineId: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    txTimeout: number;
    rpcHost: string;
}

const Home = (props: HomeProps) => {
    const [balance, setBalance] = useState<number>();
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
    const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
    const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
    const [itemsAvailable, setItemsAvailable] = useState(0);
    const [itemsRedeemed, setItemsRedeemed] = useState(0);
    const [itemsRemaining, setItemsRemaining] = useState(0);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [payWithSplToken, setPayWithSplToken] = useState(false);
    const [price, setPrice] = useState(0);
    const [whitelistPrice, setWhitelistPrice] = useState(0);
    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [isBurnToken, setIsBurnToken] = useState(false);
    const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const [endDate, setEndDate] = useState<Date>();
    const [isPresale, setIsPresale] = useState(false);
    const [isWLOnly, setIsWLOnly] = useState(false);

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const wallet = useAnchorWallet();
    const [candyMachine, setCandyMachine] = useState<CandyMachine>();

    const rpcUrl = props.rpcHost;

    const refreshCandyMachineState = () => {
        (async () => {
            if (!wallet) return;

            const cndy = await getCandyMachineState(
                wallet as anchor.Wallet,
                props.candyMachineId,
                props.connection
            );

            setCandyMachine(cndy);
            setItemsAvailable(cndy.state.itemsAvailable);
            setItemsRemaining(cndy.state.itemsRemaining);
            setItemsRedeemed(cndy.state.itemsRedeemed);

            var divider = 1;
            if (decimals) {
                divider = +('1' + new Array(decimals).join('0').slice() + '0');
            }

            // detect if using spl-token to mint
            if (cndy.state.tokenMint) {
                setPayWithSplToken(true);
                // Customize your SPL-TOKEN Label HERE
                // TODO: get spl-token metadata name
                setPrice(cndy.state.price.toNumber() / divider);
                setWhitelistPrice(cndy.state.price.toNumber() / divider);
            }else {
                setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
                setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
            }


            // fetch whitelist token balance
            if (cndy.state.whitelistMintSettings) {
                setWhitelistEnabled(true);
                setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
                setIsPresale(cndy.state.whitelistMintSettings.presale);
                setIsWLOnly(!isPresale && cndy.state.whitelistMintSettings.discountPrice === null);

                if (cndy.state.whitelistMintSettings.discountPrice !== null && cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price) {
                    if (cndy.state.tokenMint) {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider);
                    } else {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL);
                    }
                }

                let balance = 0;
                try {
                    const tokenBalance =
                        await props.connection.getTokenAccountBalance(
                            (
                                await getAtaForMint(
                                    cndy.state.whitelistMintSettings.mint,
                                    wallet.publicKey,
                                )
                            )[0],
                        );

                    balance = tokenBalance?.value?.uiAmount || 0;
                } catch (e) {
                    console.error(e);
                    balance = 0;
                }
                setWhitelistTokenBalance(balance);
                setIsActive(isPresale && !isEnded && balance > 0);
            } else {
                setWhitelistEnabled(false);
            }

            // end the mint when date is reached
            if (cndy?.state.endSettings?.endSettingType.date) {
                setEndDate(toDate(cndy.state.endSettings.number));
                if (
                    cndy.state.endSettings.number.toNumber() <
                    new Date().getTime() / 1000
                ) {
                    setIsEnded(true);
                    setIsActive(false);
                }
            }
            // end the mint when amount is reached
            if (cndy?.state.endSettings?.endSettingType.amount) {
                let limit = Math.min(
                    cndy.state.endSettings.number.toNumber(),
                    cndy.state.itemsAvailable,
                );
                setItemsAvailable(limit);
                if (cndy.state.itemsRedeemed < limit) {
                    setItemsRemaining(limit - cndy.state.itemsRedeemed);
                } else {
                    setItemsRemaining(0);
                    cndy.state.isSoldOut = true;
                    setIsEnded(true);
                }
            } else {
                setItemsRemaining(cndy.state.itemsRemaining);
            }

            if (cndy.state.isSoldOut) {
                setIsActive(false);
            }
        })();
    };

    const renderGoLiveDateCounter = ({days, hours, minutes, seconds}: any) => {
        return (
            <div><Card elevation={1}><h1>{days}</h1>Days</Card><Card elevation={1}><h1>{hours}</h1>
                Hours</Card><Card elevation={1}><h1>{minutes}</h1>Mins</Card><Card elevation={1}>
                <h1>{seconds}</h1>Secs</Card></div>
        );
    };

    const renderEndDateCounter = ({days, hours, minutes}: any) => {
        let label = "";
        if (days > 0) {
            label += days + " days "
        }
        if (hours > 0) {
            label += hours + " hours "
        }
        label += (minutes+1) + " minutes left to MINT."
        return (
            <div><h3>{label}</h3></div>
        );
    };

    function displaySuccess(mintPublicKey: any): void {
        let remaining = itemsRemaining - 1;
        setItemsRemaining(remaining);
        setIsSoldOut(remaining === 0);
        if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
            let balance = whitelistTokenBalance - 1;
            setWhitelistTokenBalance(balance);
            setIsActive(isPresale && !isEnded && balance > 0);
        }
        setItemsRedeemed(itemsRedeemed + 1);
        const solFeesEstimation = 0.012; // approx
        if (!payWithSplToken && balance && balance > 0) {
            setBalance(balance - (whitelistEnabled ? whitelistPrice : price) - solFeesEstimation);
        }
        setSolanaExplorerLink(cluster === "devnet" || cluster === "testnet"
            ? ("https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster)
            : ("https://solscan.io/token/" + mintPublicKey));
        throwConfetti();
    };

    function throwConfetti(): void {
        confetti({
            particleCount: 400,
            spread: 70,
            origin: {y: 0.6},
        });
    }

    const onMint = async () => {
        try {
            setIsMinting(true);
            if (wallet && candyMachine?.program && wallet.publicKey && whitelistList.includes(wallet.publicKey.toString())) {
                console.log(wallet.publicKey.toString())
                const mint = anchor.web3.Keypair.generate();
                const mintTxId = (
                    await mintOneToken(candyMachine, wallet.publicKey, mint)
                )[0];

                let status: any = {err: true};
                if (mintTxId) {
                    status = await awaitTransactionSignatureConfirmation(
                        mintTxId,
                        props.txTimeout,
                        props.connection,
                        'singleGossip',
                        true,
                    );
                }

                if (!status?.err) {
                    localStorage.setItem('address', wallet.publicKey.toString());
                    console.log(wallet.publicKey.toString())
                    setAlertState({
                        open: true,
                        message: 'Congratulations! Mint succeeded!',
                        severity: 'success',
                    });

                    // update front-end amounts
                    displaySuccess(mint.publicKey);
                } else {
                    setAlertState({
                        open: true,
                        message: 'Mint failed! Please try again!',
                        severity: 'error',
                    });
                }
            }
        } catch (error: any) {
            // TODO: blech:
            let message = error.msg || 'Minting failed! Please try again!';
            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction Timeout! Please try again.';
                } else if (error.message.indexOf('0x138')) {
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`;
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            setAlertState({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setIsMinting(false);
        }
    };


    useEffect(() => {
        (async () => {
            if (wallet) {
                const balance = await props.connection.getBalance(wallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
        })();
    }, [wallet, props.connection]);

    useEffect(refreshCandyMachineState, [
        wallet,
        props.candyMachineId,
        props.connection,
        isEnded,
        isPresale
    ]);

    return (
        <main>
            <MainContainer>
                <WalletContainer>
                    <Logo><a href="http://spiritualgoats.com/" target="_blank" rel="noopener noreferrer"><img alt=""
                                                                                                          src="logo.png"/></a></Logo>
                    <Menu>
                    </Menu>
                    <Wallet>
                        {wallet ?
                            <WalletAmount>{(balance || 0).toLocaleString()} SOL<ConnectButton/></WalletAmount> :
                            <ConnectButton>Connect Wallet</ConnectButton>}
                    </Wallet>
                </WalletContainer>
                <br/>
                    <h2>Spiritual Goats Public Mint for Whitelist</h2>
                    <br/>

                    {wallet && isActive && whitelistEnabled && (whitelistTokenBalance > 0) && isBurnToken &&
                        <h3>You own {whitelistTokenBalance} WL mint {whitelistTokenBalance > 1 ? "tokens" : "token" }.</h3>}
                    {wallet && isActive && whitelistEnabled && (whitelistTokenBalance > 0) && !isBurnToken &&
                        <h3>Whitelisted GOAT</h3>}
                    {wallet && isActive && !whitelistEnabled &&
                    <h3>0.69 SOL</h3>}

                    {wallet && isActive && endDate && Date.now() < endDate.getTime() &&
                        <Countdown
                        date={toDate(candyMachine?.state?.endSettings?.number)}
                        onMount={({completed}) => completed && setIsEnded(true)}
                        onComplete={() => {
                            setIsEnded(true);
                        }}
                        renderer={renderEndDateCounter}
                        />}
                    {wallet && isActive &&
                        <h3>TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}</h3>}
                    <br/>
                    
                    <MintButtonContainer>
                        {!isActive && !isEnded && candyMachine?.state.goLiveDate && (!isWLOnly || whitelistTokenBalance > 0) ? (
                            <Countdown
                                date={toDate(candyMachine?.state.goLiveDate)}
                                onMount={({completed}) => completed && setIsActive(!isEnded)}
                                onComplete={() => {
                                    setIsActive(!isEnded);
                                }}
                                renderer={renderGoLiveDateCounter}
                            />) : (
                            !wallet ? (
                                    <ConnectButton>Connect Wallet</ConnectButton>
                                ) : (!isWLOnly || whitelistTokenBalance > 0) ?
                                candyMachine?.state.gatekeeper &&
                                wallet.publicKey &&
                                wallet.signTransaction ? (
                                    <GatewayProvider
                                        wallet={{
                                            publicKey:
                                                wallet.publicKey ||
                                                new PublicKey(CANDY_MACHINE_PROGRAM),
                                            //@ts-ignore
                                            signTransaction: wallet.signTransaction,
                                        }}
                                        // // Replace with following when added
                                        // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                                        gatekeeperNetwork={
                                            candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                                        } // This is the ignite (captcha) network
                                        /// Don't need this for mainnet
                                        clusterUrl={rpcUrl}
                                        options={{autoShowModal: false}}
                                    >
                                        <MintButton
                                            candyMachine={candyMachine}
                                            isMinting={isMinting}
                                            isActive={isActive}
                                            isEnded={isEnded}
                                            isSoldOut={isSoldOut}
                                            onMint={onMint}
                                        />
                                    </GatewayProvider>
                                ) : (
                                    <MintButton
                                        candyMachine={candyMachine}
                                        isMinting={isMinting}
                                        isActive={isActive}
                                        isEnded={isEnded}
                                        isSoldOut={isSoldOut}
                                        onMint={onMint}
                                    />
                                ) :
                                <h1>Mint is private.</h1>
                                )}
                    </MintButtonContainer>
                    <br/>
                    {wallet && isActive && solanaExplorerLink &&
                        <SolExplorerLink href={solanaExplorerLink} target="_blank">View on Solscan</SolExplorerLink>}
            </MainContainer>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
                    severity={alertState.severity}
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default Home;
