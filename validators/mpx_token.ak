use aiken/list
use aiken/transaction.{Mint, ScriptContext}
use mpx_token/types.{VerificationKeyHash}
use mpx_token/utils.{must_be_signed_by}

validator(owners: List<VerificationKeyHash>) {
  fn mpx_token(_rdmr: Data, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Mint(_) ->
        list.any(
          owners,
          fn(owner) { must_be_signed_by(ctx.transaction, owner) },
        )
      _ ->
        False
    }
  }
}
