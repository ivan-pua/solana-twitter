use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// 1. Define the structure of the Tweet account.
// #[account] is from Anchor framework and removes boilerplate code.
#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}
// 2. Add some useful constants for sizing propeties.
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.

// 3. Add a constant on the Tweet account that provides its total size.
impl Tweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content.
}

#[error]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}

#[derive(Accounts)]
pub struct SendTweet<'info> {

    // passing public key to be used to create a "tweet" account
    // add Account constraints, defined as Rust attributes in line below
    // This is a CPI
    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,

    // need author private key /sign
    #[account(mut)]
    pub author: Signer<'info>,

    // because statelesss, gotta pass thru official System Program
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
}

#[program]
pub mod solana_twitter {
    use super::*;

    // this is the function
    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> ProgramResult {
    
        // mut to mutate the data
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;
    
        // here dont need mut, Anchor already took care of rent exempt
        let author: &Signer = &ctx.accounts.author;
    
        // get current timestamp
        let clock: Clock = Clock::get().unwrap();
    
        // catch errors
        if topic.chars().count() > 50 {
            // into converts ErrorCode type **into** whatever 
            // type required by code i.e. Err
            return Err(ErrorCode::TopicTooLong.into())
        }
    
        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }
    
        // dereference using *
        tweet.author = *author.key;
    
        tweet.timestamp = clock.unix_timestamp;
    
        // store topic and content
        tweet.topic = topic;
        tweet.content = content;
        
        Ok(())
    }
}

