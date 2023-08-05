use crate::*;

#[error_code]
pub enum DexifiError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,
    #[msg("Creator address dismatch")]
    InvalidCreator,
    #[msg("Max amount reached")]
    ExceedMaxAmount,
    #[msg("Lottery is not opened")]
    LotteryNotOpen,
    #[msg("Lottery is closed")]
    LotteryClosed,
    #[msg("USDC/TTT already claimed")]
    AlreadyClaimed,
    #[msg("Insufficient Token in the reward pool")]
    InsufficientToken,
    #[msg("Date type mismatch")]
    DataTypeMismatch,
    #[msg("Stake address is not correct")]
    InvalidStakePoolAddress,
    #[msg("Winner is already set")]
    WinnerAlreadySet,
}
