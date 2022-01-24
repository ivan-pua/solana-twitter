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
  it('can send a new tweet without topic', async () => {

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

      await program.rpc.sendTweet('', 'gm', {
          accounts: {
              // Accounts here...
              tweet: tweet.publicKey,
              author: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
          },

          // Since Anchor automatically adds the wallet 
          // as a signer to each transaction, 
          // we don't need to change the signers array
          signers: [tweet],
      });

      // After sending the transaction to the blockchain.
      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
          
      // Ensure it has the right data.
      assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
      assert.equal(tweetAccount.topic, '');
      assert.equal(tweetAccount.content, 'gm');
      assert.ok(tweetAccount.timestamp);
      
      
      console.log(tweetAccount);
      console.log(tweetAccount.author.toBase58())
      console.log("\nhello!")
    
  });
});
