const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');

function formatAndSendTweet(event) {
    var tokenContract = _.get(event, ['asset','asset_contract','name']);
    var tokenName; 
    var purchaseName = (_.get(event, ['winner_account','user','username']) + "'s");
    if (tokenContract == "Warriors of Aradena"){
        tokenName = ("Warrior " + _.get(event, ['asset', 'token_id']) );}
    if (tokenContract == "Women of Aradena"){
        tokenName = ("Women of Aradena: Warrior " + _.get(event, ['asset', 'token_id']) );}
    if (tokenContract == "Aradena Comics"){
        tokenName = ( _.get(event, ['asset', 'name']) + " #" + _.get(event, ['asset', 'token_id']) );}
    if (tokenContract === null){
        tokenName = ("Warrior " + _.get(event, ['asset', 'token_id']) + "~"); }
    if (purchaseName == "null's"){
        purchaseName = ("a new");}
    if (purchaseName == "undefined's"){
        purchaseName = ("a new");}
    
    const image = _.get(event, ['asset', 'image_url']);
    const openseaLink = _.get(event, ['asset', 'permalink']);
    const totalPrice = _.get(event, 'total_price');
    const usdValue = _.get(event, ['payment_token', 'usd_price']);
    const tokenSymbol = _.get(event, ['payment_token', 'symbol']);

    const formattedTokenPrice = ethers.utils.formatEther(totalPrice.toString());
    const formattedUsdPrice = (formattedTokenPrice * usdValue).toFixed(2);
    const formattedPriceSymbol = (
        (tokenSymbol === 'WETH' || tokenSymbol === 'ETH') 
            ? 'Ξ' 
            : ` ${tokenSymbol}`
    );

    if ((tokenContract == "Women of Aradena") || (tokenContract == "Warriors of Aradena")) {
        const tweetText = `${tokenName} has joined ${purchaseName} guild for ${formattedTokenPrice}${formattedPriceSymbol} ($${formattedUsdPrice}). Aradena welcomes you ⚔️🍻! #NFT #StrategyGame #PlayToEarn ${openseaLink}`;
        console.log(tweetText);
        return tweet.handleDupesAndTweet(tokenName, tweetText, image);}
    else if (tokenContract == "Aradena Comics") {
        const tweetText = `${tokenName} has joined ${purchaseName} library for ${formattedTokenPrice}${formattedPriceSymbol} ($${formattedUsdPrice}). Happy reading📚! #NFT #StrategyGame #PlayToEarn ${openseaLink}`;
        console.log(tweetText);
        return tweet.handleDupesAndTweet(tokenName, tweetText, image);}
}

// Poll OpenSea every minute & retrieve all sales for a given collection in the last minute
// Then pass those events over to the formatter before tweeting
setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(101, "seconds").unix();
    
    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }, 
        headers: {Accept: 'application/json', 'X-API-KEY': process.env.API_KEY}
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} genesis sales in the last minute...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);

setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(101, "seconds").unix();
    
    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG2,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }, 
        headers: {Accept: 'application/json', 'X-API-KEY': process.env.API_KEY}
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} female sales in the last minute...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);

setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(101, "seconds").unix();
    
    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG3,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }, 
        headers: {Accept: 'application/json', 'X-API-KEY': process.env.API_KEY}
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} comic sales in the last minute...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);
