const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');

function formatAndSendTweet(event) {
    const tokenName = _.get(event, ['asset', 'name']);
    if (tokenName == 'null'){
        tokenName = 'A warrior'}
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

    const tweetText = `${tokenName} has joined a new guild for ${formattedTokenPrice}${formattedPriceSymbol} ($${formattedUsdPrice}). Aradena welcomes you ⚔️🍻! #NFT #StrategyGame #MedievalNFT ${openseaLink}`;

    console.log(tweetText);

    return tweet.handleDupesAndTweet(tokenName, tweetText, image);
}

// Poll OpenSea every minute & retrieve all sales for a given collection in the last minute
// Then pass those events over to the formatter before tweeting
setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(299, "seconds").unix();
    
    /*axios.get('https://api.opensea.io/api/v1/events', {
        headers: {Accept: 'application/json', 'X-API-KEY': '7a3e6b0eafd24c31afe1c18f56bdcf93'}
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }
    */   
    const options = {
    method: 'GET',
    headers: {Accept: 'application/json', 'X-API-KEY': '7a3e6b0eafd24c31afe1c18f56bdcf93'}
    };

fetch('https://api.opensea.io/api/v1/events?collection_slug=process.env.OPENSEA_COLLECTION_SLUG&event_type=succesful&only_opensea=false&offset=0&limit=20&occurred_after=lastMinute', options)
  .then(response => response.json())).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} sales in the last 5 minutes...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);
