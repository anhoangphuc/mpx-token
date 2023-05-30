use aiken/transaction.{Transaction}
use aiken/list
use mpx_token/types.{VerificationKeyHash}

pub fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}
