use crate::*;

#[error_code]
pub enum DexifiError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,
    #[msg("Max count reached")]
    ExceedMaxCount,
    // #[msg("Max amount reached")]
    // ExceedMaxAmount,
    #[msg("Locker index should be 0 - 3")]
    LockerIndexTooBig,
}
