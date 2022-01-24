/**
 * Test Script that creates a client to
 * interact with Program (host) i.e. lib.rs
 * */ 

 import * as anchor from '@project-serum/anchor';
 import { Program } from '@project-serum/anchor';
 import { SolanaTwitter } from '../target/types/solana_twitter';
 import * as assert from "assert";
 
 describe('solana-twitter', () => {
 
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  

  // async() call asynchronous (not occuring in the same time)
  // functions inside it
  it('can send a new tweet from a different author', async () => {

    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();

    /**
     * Without this line below, the "other" user has no money to 
     * pay fpor the rent-exempt fee
     * Airdrop 1 SOL (aka 1 bil lamports - satoshi for SOL)
     */
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
    // after airdrop, need to verify if the other user has received it 
    await program.provider.connection.confirmTransaction(signature);

    const tweet = anchor.web3.Keypair.generate();
      /**
      * Before sending the transaction to the blockchain.
      * 
      * rpc object exposes an API matching our program's instructions
      * 
      * This allows us to call the send_tweet function from lib.rs
      * 
      * Note that, in JavaScript, Anchor automatically transforms 
      * snake case variables into camel case variables
      * 
      * send_tweet -> sendTweet
      * system_program -> systemProgram
      */

      await program.rpc.sendTweet('veganism', 'I am another vegan hello!', {
          accounts: {
              // Accounts here...
              tweet: tweet.publicKey,
              author: otherUser.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
          },

          // Since Anchor automatically adds the wallet 
          // as a signer to each transaction, 
          // we don't need to change the signers array
          signers: [otherUser, tweet],
      });

      // After sending the transaction to the blockchain.
      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
          
      // Ensure it has the right data.
      assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
      assert.equal(tweetAccount.topic, 'veganism');
      assert.equal(tweetAccount.content, 'I am another vegan hello!');
      assert.ok(tweetAccount.timestamp);
      
      
      console.log(tweetAccount);
      console.log(tweetAccount.author.toBase58())
      console.log("\nhello!")
    
  });
});
